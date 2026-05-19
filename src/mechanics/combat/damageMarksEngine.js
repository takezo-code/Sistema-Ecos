/**
 * Engine de Marcas de Dano — sistema sem HP tradicional.
 *
 * Marcas acumulam e determinam o estado físico do personagem.
 * Estado físico penaliza Força, Destreza e Vitalidade percentualmente.
 *
 * Thresholds:
 *   0–2  → Estável   (sem penalidade)
 *   3–5  → Ferido    (−5%)
 *   6–8  → Grave     (−10%)
 *   9+   → Incapacitado (−20%)
 */

// ──────────────────────────────────────────────
// Tipos de marca e seus valores
// ──────────────────────────────────────────────
export const DAMAGE_MARK_TYPES = Object.freeze({
  LEVE:  'leve',
  MEDIO: 'medio',
  GRAVE: 'grave',
})

export const DAMAGE_MARK_VALUES = Object.freeze({
  leve:  1,
  medio: 2,
  grave: 3,
})

export const DAMAGE_MARK_META = Object.freeze({
  leve:  { label: 'Leve',  value: 1, color: '#eab308', description: 'Arranhão, contusão leve.' },
  medio: { label: 'Médio', value: 2, color: '#ea580c', description: 'Corte, fratura menor.' },
  grave: { label: 'Grave', value: 3, color: '#dc2626', description: 'Fratura, hemorragia, trauma severo.' },
})

// ──────────────────────────────────────────────
// Tabela de progressão de estados
// ──────────────────────────────────────────────
export const MARK_STATE_THRESHOLDS = [
  { min: 0, max: 2,        state: 'bem',          label: 'Estável',      color: '#16a34a' },
  { min: 3, max: 5,        state: 'ferido',        label: 'Ferido',       color: '#eab308' },
  { min: 6, max: 8,        state: 'grave',         label: 'Grave',        color: '#ea580c' },
  { min: 9, max: Infinity, state: 'incapacitado',  label: 'Incapacitado', color: '#991b1b' },
]

/**
 * Retorna o estado físico determinado pelo total de marcas.
 */
export function getPhysicalStateFromMarks(marks) {
  const n = Math.max(0, Number(marks) || 0)
  for (const tier of MARK_STATE_THRESHOLDS) {
    if (n >= tier.min && n <= tier.max) return tier.state
  }
  return 'incapacitado'
}

/**
 * Informação de progresso dentro do tier atual (para barra de UI).
 */
export function getMarkProgress(marks) {
  const n = Math.max(0, Number(marks) || 0)
  const tier = MARK_STATE_THRESHOLDS.find(t => n >= t.min && n <= t.max)
    ?? MARK_STATE_THRESHOLDS[MARK_STATE_THRESHOLDS.length - 1]

  const isLast = tier.max === Infinity
  const posInTier  = n - tier.min
  const tierSize   = isLast ? null : (tier.max - tier.min + 1)

  return {
    total: n,
    state: tier.state,
    stateLabel: tier.label,
    stateColor: tier.color,
    posInTier,
    tierSize,
    isMaxTier: isLast,
    marksToNextTier: isLast ? null : (tier.max - n + 1),
    nextState: isLast ? null : (MARK_STATE_THRESHOLDS[MARK_STATE_THRESHOLDS.indexOf(tier) + 1]?.state ?? null),
  }
}

// ──────────────────────────────────────────────
// Aplicar marcas de dano
// ──────────────────────────────────────────────
/**
 * Aplica marcas de dano a uma entidade.
 *
 * @param entity    - Personagem atual (precisa de `damageMarks` e `physicalState`)
 * @param markType  - 'leve' | 'medio' | 'grave'
 * @param options   - { forceState, extraMarks } para críticos
 * @returns { patch, markAdded, marksTotal, prevState, newState, stateChanged, narrative }
 */
export function applyDamageMarks(entity, markType, { forceState = null, extraMarks = 0 } = {}) {
  const meta = DAMAGE_MARK_META[markType] ?? DAMAGE_MARK_META.leve
  const markValue = meta.value + (Number(extraMarks) || 0)
  const currentMarks = Math.max(0, Number(entity.damageMarks) || 0)
  const newMarks = currentMarks + markValue
  const derivedState = getPhysicalStateFromMarks(newMarks)
  const newState = forceState ?? derivedState
  const prevState = entity.physicalState ?? 'bem'

  const narratives = buildNarrativeConsequences(prevState, newState, markType)

  return {
    patch: {
      damageMarks: newMarks,
      physicalState: newState,
    },
    markType,
    markAdded: markValue,
    marksTotal: newMarks,
    prevState,
    newState,
    stateChanged: prevState !== newState,
    narratives,
  }
}

/**
 * Adiciona marcas sem alterar o estado (p/ críticos que avançam estado diretamente).
 */
export function applyForcedStateAdvance(entity, markType, targetState) {
  return applyDamageMarks(entity, markType, { forceState: targetState })
}

/**
 * Limpa todas as marcas e retorna ao estado Estável.
 */
export function clearDamageMarks(entity) {
  return {
    patch: {
      damageMarks: 0,
      physicalState: 'bem',
    },
    prevState: entity.physicalState ?? 'bem',
    newState: 'bem',
    cleared: true,
  }
}

/**
 * Remove N marcas (cura parcial). Estado é recalculado.
 */
export function healDamageMarks(entity, amount) {
  const current = Math.max(0, Number(entity.damageMarks) || 0)
  const newMarks = Math.max(0, current - Math.max(1, Number(amount) || 1))
  const newState = getPhysicalStateFromMarks(newMarks)
  return {
    patch: {
      damageMarks: newMarks,
      physicalState: newState,
    },
    marksRemoved: current - newMarks,
    marksTotal: newMarks,
    prevState: entity.physicalState ?? 'bem',
    newState,
  }
}

// ──────────────────────────────────────────────
// Narrativa
// ──────────────────────────────────────────────
const STATE_TRANSITION_NARRATIVE = {
  'bem→ferido': 'O personagem começa a sentir o peso dos ferimentos.',
  'ferido→grave': 'Os ferimentos se aprofundam. Cada movimento custa mais.',
  'grave→incapacitado': 'O corpo cede. Continuar está além dos limites físicos.',
}

const MARK_NARRATIVE = {
  leve:  ['Arranhão', 'Contusão leve', 'Impacto absorvido'],
  medio: ['Corte considerável', 'Pancada forte', 'Osso estremecido'],
  grave: ['Fratura', 'Hemorragia', 'Trauma severo'],
}

function buildNarrativeConsequences(prevState, newState, markType) {
  const results = []
  const markTexts = MARK_NARRATIVE[markType] ?? MARK_NARRATIVE.leve
  results.push(markTexts[Math.floor(Math.random() * markTexts.length)])
  const transitionKey = `${prevState}→${newState}`
  if (STATE_TRANSITION_NARRATIVE[transitionKey]) {
    results.push(STATE_TRANSITION_NARRATIVE[transitionKey])
  }
  return results
}
