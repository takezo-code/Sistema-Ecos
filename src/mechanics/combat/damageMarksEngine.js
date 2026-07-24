/**
 * Engine de Marcas de Dano — sistema sem HP tradicional.
 *
 * Marcas acumulam e determinam o estado físico do personagem.
 * A cada 3 marcas avança um estado (−1 FOR · DES · VIT por estado).
 *
 * Thresholds:
 *   0–2  → Estável       (−0)
 *   3–5  → Ferido        (−1 FOR/DES/VIT)
 *   6–8  → Grave         (−2 FOR/DES/VIT)
 *   9+   → Incapacitado  (−3 FOR/DES/VIT)
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
  { min: 0, max: 2,        state: 'bem',          label: 'Estável',      color: '#16a34a', attrPenalty: 0 },
  { min: 3, max: 5,        state: 'ferido',        label: 'Ferido −1',    color: '#eab308', attrPenalty: 1 },
  { min: 6, max: 8,        state: 'grave',         label: 'Grave −2',     color: '#ea580c', attrPenalty: 2 },
  { min: 9, max: Infinity, state: 'incapacitado',  label: 'Incap. −3',    color: '#991b1b', attrPenalty: 3 },
]

/**
 * Retorna o estado físico determinado pelo total de marcas.
 * @param vitalityBuffer - atraso de estado por Vitalidade (marcas extras suportadas)
 */
export function getPhysicalStateFromMarks(marks, vitalityBuffer = 0) {
  const n = Math.max(0, Number(marks) || 0)
  const buffer = Math.max(0, Math.floor(Number(vitalityBuffer) || 0))
  for (const tier of MARK_STATE_THRESHOLDS) {
    const min = tier.min === 0 ? 0 : tier.min + buffer
    const max = tier.max === Infinity ? Infinity : tier.max + buffer
    if (n >= min && n <= max) return tier.state
  }
  return 'incapacitado'
}

/**
 * Informação de progresso dentro do tier atual (para barra de UI).
 */
export function getMarkProgress(marks, vitalityBuffer = 0) {
  const n = Math.max(0, Number(marks) || 0)
  const buffer = Math.max(0, Math.floor(Number(vitalityBuffer) || 0))
  const tier = MARK_STATE_THRESHOLDS.find(t => {
    const min = t.min === 0 ? 0 : t.min + buffer
    const max = t.max === Infinity ? Infinity : t.max + buffer
    return n >= min && n <= max
  }) ?? MARK_STATE_THRESHOLDS[MARK_STATE_THRESHOLDS.length - 1]

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
  const vitBuffer = Math.floor((Number(entity?.attributes?.vitalidade) || 0) / 2)
  const derivedState = getPhysicalStateFromMarks(newMarks, vitBuffer)
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
 * Adiciona N marcas diretamente (ex.: dano efetivo após resistência).
 */
export function applyMarksAmount(entity, amount) {
  const markValue = Math.max(0, Math.floor(Number(amount) || 0))
  const currentMarks = Math.max(0, Number(entity.damageMarks) || 0)
  if (markValue <= 0) {
    return {
      patch: {},
      markAdded: 0,
      marksTotal: currentMarks,
      prevState: entity.physicalState ?? 'bem',
      newState: entity.physicalState ?? 'bem',
      stateChanged: false,
      narratives: [],
    }
  }
  const newMarks = currentMarks + markValue
  const vitBuffer = Math.floor((Number(entity?.attributes?.vitalidade) || 0) / 2)
  const derivedState = getPhysicalStateFromMarks(newMarks, vitBuffer)
  const prevState = entity.physicalState ?? 'bem'
  const newState = derivedState
  const narratives = buildNarrativeConsequences(prevState, newState, 'leve')

  return {
    patch: {
      damageMarks: newMarks,
      physicalState: newState,
    },
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
  const vitBuffer = Math.floor((Number(entity?.attributes?.vitalidade) || 0) / 2)
  const newState = getPhysicalStateFromMarks(newMarks, vitBuffer)
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
  'bem→ferido': 'O personagem começa a sentir o peso dos ferimentos (−1 FOR · DES · VIT).',
  'ferido→grave': 'Os ferimentos se aprofundam (−2 FOR · DES · VIT).',
  'grave→incapacitado': 'O corpo cede (−3 FOR · DES · VIT). Continuar está além dos limites físicos.',
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
