/**
 * Engine de Marcas de Dano — sistema sem HP tradicional.
 *
 * Marcas acumulam e determinam o estado físico.
 * Thresholds **base** (a cada 4 marcas troca de estado):
 *   0–4  → Saudável / Estável  (−0)
 *   5–9  → Ferido              (−1 FOR/DES/VIT)
 *   10–14 → Grave              (−2 FOR/DES/VIT)
 *   15+  → Incapacitado        (−3 FOR/DES/VIT)
 *
 * Vitalidade: a cada 2 pts de VIT **base** → +1 limiar (marca a mais
 * que você aguenta antes de sair de Saudável → Ferido, e nos demais degraus).
 * Armadura: +1/+2/+3 limiar (leve/média/pesada).
 * A penalidade de ferimento (−VIT efetiva) NÃO reduz esse buffer.
 */

import { getArmorMarkBonus } from '../equipment/armorEffectsEngine'

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
// Tabela de progressão de estados (base, sem VIT)
// ──────────────────────────────────────────────
export const MARK_STATE_THRESHOLDS = [
  { min: 0,  max: 4,        state: 'bem',          label: 'Saudável',     color: '#16a34a', attrPenalty: 0 },
  { min: 5,  max: 9,        state: 'ferido',        label: 'Ferido −1',    color: '#eab308', attrPenalty: 1 },
  { min: 10, max: 14,       state: 'grave',         label: 'Grave −2',     color: '#ea580c', attrPenalty: 2 },
  { min: 15, max: Infinity, state: 'incapacitado',  label: 'Incap. −3',    color: '#991b1b', attrPenalty: 3 },
]

/**
 * Buffer de marcas a partir da VIT **base** da ficha (2 VIT → +1 limiar)
 * + bônus de armadura equipada (+1/+2/+3).
 *
 * Assim o personagem pode tomar mais marcas antes de piorar de estado.
 * Nunca use VIT efetiva (após −1/−2/−3 de Ferido/Incapacitado):
 * ferimento reduz VIT nas rolagens, mas não remove o colchão de marcas.
 *
 * @param {object} entityOrAttributes - entidade com `.attributes` (e `.equipped`) ou o mapa de atributos
 */
export function getVitalityMarkBuffer(entityOrAttributes = {}) {
  const isEntity = entityOrAttributes?.attributes != null
  const attrs = isEntity ? entityOrAttributes.attributes : entityOrAttributes
  const baseVit = Math.max(0, Number(attrs?.vitalidade) || 0)
  const vitBuffer = Math.floor(baseVit / 2)
  const armorBonus = isEntity ? getArmorMarkBonus(entityOrAttributes) : 0
  return vitBuffer + armorBonus
}

/**
 * Pool padrão de vida = limiar de Incapacitado (15) + buffer de VIT/armadura.
 * Ex.: VIT 6 → +3 → vida máxima 18. Começa cheio e reduz ao tomar dano.
 */
export function getDefaultMarkPoolMax(entityOrAttributes = {}) {
  const buffer = getVitalityMarkBuffer(entityOrAttributes)
  const incapTier = MARK_STATE_THRESHOLDS.find(t => t.state === 'incapacitado')
  return (incapTier?.min ?? 15) + buffer
}

/**
 * Vida máxima: `marcasMaximas` do inimigo/boss, ou pool derivado da VIT para jogadores.
 */
export function getMarkPoolMax(entity = {}) {
  const explicit = Math.max(0, Number(entity.marcasMaximas) || 0)
  if (explicit > 0) return explicit
  return getDefaultMarkPoolMax(entity)
}

/** Vida atual = máximo − marcas acumuladas. */
export function getRemainingLife(entity = {}) {
  const max = getMarkPoolMax(entity)
  const marks = Math.max(0, Number(entity.damageMarks) || 0)
  return {
    current: Math.max(0, max - marks),
    max,
    marks,
  }
}

/** Limiares de um tier com o buffer de VIT aplicado. */
export function getBufferedTierRange(tier, vitalityBuffer = 0) {
  const buffer = Math.max(0, Math.floor(Number(vitalityBuffer) || 0))
  return {
    min: tier.min === 0 ? 0 : tier.min + buffer,
    max: tier.max === Infinity ? Infinity : tier.max + buffer,
  }
}

/**
 * Retorna o estado físico determinado pelo total de marcas.
 * @param vitalityBuffer - atraso de estado por Vitalidade **base** (marcas extras suportadas)
 */
export function getPhysicalStateFromMarks(marks, vitalityBuffer = 0) {
  const n = Math.max(0, Number(marks) || 0)
  for (const tier of MARK_STATE_THRESHOLDS) {
    const { min, max } = getBufferedTierRange(tier, vitalityBuffer)
    if (n >= min && n <= max) return tier.state
  }
  return 'incapacitado'
}

/**
 * Informação de progresso dentro do tier atual (para barra de UI).
 * `vitalityBuffer` deve vir de getVitalityMarkBuffer (VIT base).
 */
export function getMarkProgress(marks, vitalityBuffer = 0) {
  const n = Math.max(0, Number(marks) || 0)
  const buffer = Math.max(0, Math.floor(Number(vitalityBuffer) || 0))
  const tier = MARK_STATE_THRESHOLDS.find(t => {
    const { min, max } = getBufferedTierRange(t, buffer)
    return n >= min && n <= max
  }) ?? MARK_STATE_THRESHOLDS[MARK_STATE_THRESHOLDS.length - 1]

  const { min: tierMin, max: tierMax } = getBufferedTierRange(tier, buffer)
  const isLast = tier.max === Infinity
  const posInTier = n - tierMin
  const tierSize = isLast ? null : (tierMax - tierMin + 1)

  return {
    total: n,
    state: tier.state,
    stateLabel: tier.label,
    stateColor: tier.color,
    buffer,
    tierMin,
    tierMax: isLast ? null : tierMax,
    posInTier,
    tierSize,
    isMaxTier: isLast,
    marksToNextTier: isLast ? null : (tierMax - n + 1),
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
  const vitBuffer = getVitalityMarkBuffer(entity)
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
  const vitBuffer = getVitalityMarkBuffer(entity)
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
  const vitBuffer = getVitalityMarkBuffer(entity)
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
  'bem→ferido': 'O personagem começa a sentir o peso dos ferimentos (−1 nos atributos físicos).',
  'ferido→grave': 'Os ferimentos se aprofundam (−2 nos atributos físicos).',
  'grave→incapacitado': 'O corpo cede (−3 nos atributos físicos). Continuar está além dos limites físicos.',
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
