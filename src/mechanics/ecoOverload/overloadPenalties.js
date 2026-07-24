import {
  ECO_OVERLOAD_DISPLAY_CAP,
  RUPTURE_BREAK_PENALTIES,
  MENTAL_ATTR_KEYS,
  getStableEcoPenaltyPercent,
} from '../../constants/ecoOverload'
import { ATTRIBUTES } from '../../constants/attributes'
import { PHYSICAL_AFFECTED_KEYS, getMentalStateOption, getPhysicalStateOption } from '../../constants/states'

/**
 * Penalidade percentual no poder de Eco (0–100).
 * 1–5: −1% por nível | 6+: tabela de ruptura
 */
export function getEcoPowerPenaltyPercent(ecoOverload = 0) {
  const n = Math.max(0, Number(ecoOverload) || 0)
  if (n <= 0) return 0
  if (n <= ECO_OVERLOAD_DISPLAY_CAP) return getStableEcoPenaltyPercent(n)
  const row = RUPTURE_BREAK_PENALTIES[Math.min(n, 10)]
  return row?.ecoPercent ?? 100
}

/**
 * Penalidade percentual em Inteligência e Ruptura (só a partir de 6/5).
 * Atributos físicos (Força/Destreza/Vitalidade) NÃO são afetados pela sobrecarga mental.
 *
 * Escala: 6→−5%, 7→−10%, 8→−20%, 9→−40%, 10→−100%
 */
export function getMentalAttributePenaltyPercent(ecoOverload = 0) {
  const n = Math.max(0, Number(ecoOverload) || 0)
  if (n < 6) return 0
  const row = RUPTURE_BREAK_PENALTIES[Math.min(n, 10)]
  return row?.mentalAttrPercent ?? 100
}

/** @deprecated renamed to getMentalAttributePenaltyPercent */
export const getGlobalAttributePenaltyPercent = getMentalAttributePenaltyPercent

export function getEcoPowerMultiplier(ecoOverload = 0) {
  const penalty = getEcoPowerPenaltyPercent(ecoOverload)
  return Math.max(0, 1 - penalty / 100)
}

export function getMentalAttributeMultiplier(ecoOverload = 0) {
  const penalty = getMentalAttributePenaltyPercent(ecoOverload)
  return Math.max(0, 1 - penalty / 100)
}

/** @deprecated renamed to getMentalAttributeMultiplier */
export const getGlobalAttributeMultiplier = getMentalAttributeMultiplier

/**
 * Penalidades efetivas: usa o maior valor entre sobrecarga de Eco e estado mental selecionado.
 * Garante que ajuste manual do estado mental ou da sobrecarga reflita nas contas.
 */
export function resolveMentalPenalties(ecoOverload = 0, mentalState = 'estavel') {
  const ecoFromOverload    = getEcoPowerPenaltyPercent(ecoOverload)
  const mentalFromOverload = getMentalAttributePenaltyPercent(ecoOverload)
  const stateOpt           = getMentalStateOption(mentalState)

  const ecoFromState    = stateOpt.ecoPowerPenaltyPercent ?? stateOpt.penaltyPercent ?? 0
  const mentalFromState = stateOpt.mentalAttrPenaltyPercent ?? 0

  const ecoPowerPercent      = Math.max(ecoFromOverload, ecoFromState)
  const mentalAttrPercent    = Math.max(mentalFromOverload, mentalFromState)

  return {
    ecoPowerPercent,
    mentalAttrPercent,
    ecoPowerMultiplier: Math.max(0, 1 - ecoPowerPercent / 100),
    mentalAttrMultiplier: Math.max(0, 1 - mentalAttrPercent / 100),
  }
}

/** Aplica penalidade de poder de habilidade (ex: 100 com −5% → 95) */
export function applySkillPowerPenalty(basePower, ecoPowerPercent) {
  const base = Math.max(0, Number(basePower) || 0)
  const mult = Math.max(0, 1 - (Number(ecoPowerPercent) || 0) / 100)
  return Math.max(0, Math.round(base * mult))
}

/**
 * Atributos efetivos com separação clara:
 *  - Físicos (Força/Destreza/Vitalidade) → −N flat pelo estado físico (marcas)
 *  - Mentais (Inteligência/Ruptura)       → penalizados pela sobrecarga de Eco (6/5+)
 */
export function calculateEffectiveAttributes(attributes = {}, {
  physicalState = 'bem',
  ecoOverload = 0,
  mentalState = 'estavel',
} = {}) {
  const physicalOpt = getPhysicalStateOption(physicalState)
  const physicalFlat = Math.max(0, Number(physicalOpt.attrPenalty) || 0)
  const penalties    = resolveMentalPenalties(ecoOverload, mentalState)
  const mentalMult   = penalties.mentalAttrMultiplier
  const effective    = {}
  const keys         = ATTRIBUTES.map(a => a.key)

  keys.forEach(key => {
    const base = Number(attributes[key]) || 0
    let value  = base

    if (PHYSICAL_AFFECTED_KEYS.includes(key)) {
      value = base - physicalFlat
    } else if (MENTAL_ATTR_KEYS.includes(key)) {
      value = Math.round(value * mentalMult)
    }

    effective[key] = Math.max(0, value)
  })

  return {
    base: attributes,
    effective,
    physicalMultiplier: physicalOpt.multiplier ?? 1,
    physicalAttrPenalty: physicalFlat,
    mentalAttributeMultiplier: mentalMult,
    globalAttributeMultiplier: mentalMult,
    ecoPowerMultiplier: penalties.ecoPowerMultiplier,
    ecoPenaltyPercent: penalties.ecoPowerPercent,
    mentalAttrPenaltyPercent: penalties.mentalAttrPercent,
    attributePenaltyPercent: penalties.mentalAttrPercent,
  }
}

export function getEffectiveAttributeValue(attributes, attrKey, {
  physicalState = 'bem',
  ecoOverload = 0,
  mentalState = 'estavel',
} = {}) {
  const { effective } = calculateEffectiveAttributes(attributes, { physicalState, ecoOverload, mentalState })
  return effective[attrKey] ?? 0
}

export function formatSkillPowerPenalty(ecoPowerPercent) {
  const pct = Number(ecoPowerPercent) || 0
  return pct > 0 ? `−${pct}% poder de habilidade` : null
}

export function formatMentalAttrPenalty(mentalAttrPercent) {
  const pct = Number(mentalAttrPercent) || 0
  return pct > 0 ? `−${pct}% INT · Ruptura` : null
}

export function formatMentalPenaltiesSummary({
  ecoOverload = 0,
  mentalState = 'estavel',
} = {}) {
  const { ecoPowerPercent, mentalAttrPercent } = resolveMentalPenalties(ecoOverload, mentalState)
  const skillPowerLine = formatSkillPowerPenalty(ecoPowerPercent)
  const mentalAttrLine = formatMentalAttrPenalty(mentalAttrPercent)
  const lines = [skillPowerLine, mentalAttrLine].filter(Boolean)

  return {
    ecoPowerPercent,
    mentalAttrPercent,
    skillPowerLine,
    mentalAttrLine,
    lines,
    compactLine: lines.join(' · ') || null,
    hasPenalties: lines.length > 0,
  }
}

export function formatEcoOverloadPenalty(ecoOverload, mentalState = 'estavel') {
  const { ecoPowerPercent, mentalAttrPercent } = resolveMentalPenalties(ecoOverload, mentalState)
  const parts = []
  if (ecoPowerPercent > 0) parts.push(`−${ecoPowerPercent}% poder habilidade`)
  if (mentalAttrPercent > 0) parts.push(`−${mentalAttrPercent}% INT · Ruptura`)
  return parts.length ? parts.join(' · ') : null
}
