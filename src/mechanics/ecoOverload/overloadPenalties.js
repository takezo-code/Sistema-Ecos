import {
  ECO_OVERLOAD_BASE_LIMIT,
  RUPTURE_BREAK_PENALTIES,
  MENTAL_ATTR_KEYS,
  OVERLOAD_SOCIAL_ATTR_KEYS,
  getOverloadOverage,
  resolveEcoSafeLimit,
  asSafeLimit,
} from '../../constants/ecoOverload'
import { ATTRIBUTES, SOCIAL_ATTRIBUTES } from '../../constants/attributes'
import {
  PHYSICAL_AFFECTED_KEYS,
  MENTAL_PENALTY_LABELS,
  buildPenaltyLines,
  getMentalStateOption,
  getPhysicalStateOption,
  getMentalStateFromEcoOverload,
} from '../../constants/states'

function clampOverageKey(overage) {
  const n = Math.max(0, Number(overage) || 0)
  if (n <= 0) return 0
  return Math.min(5, n)
}

function resolveLimit(safeLimitOrOpts) {
  if (typeof safeLimitOrOpts === 'number') return asSafeLimit(safeLimitOrOpts)
  return resolveEcoSafeLimit(safeLimitOrOpts)
}

/**
 * Penalidade de poder Eco — removida (sempre 0).
 * Mantida só por compatibilidade de imports.
 */
export function getEcoPowerPenaltyPercent() {
  return 0
}

/**
 * −flat em INT · PER · SAB · CAR conforme sobrecarga (relativo ao limite).
 * No limite (inclusive): 0. Primeiro acima: −1 (Abalado). Depois −2 / −3 / −4.
 */
export function getMentalAttributeFlatPenalty(ecoOverload = 0, safeLimitOrOpts = ECO_OVERLOAD_BASE_LIMIT) {
  const lim = resolveLimit(safeLimitOrOpts)
  const n = Math.max(0, Number(ecoOverload) || 0)
  if (n <= lim) return 0
  const overage = getOverloadOverage(n, lim)
  const key = clampOverageKey(overage)
  return RUPTURE_BREAK_PENALTIES[key]?.mentalAttrFlat ?? 4
}

/** @deprecated use getMentalAttributeFlatPenalty — retorna flat, não % */
export function getMentalAttributePenaltyPercent(ecoOverload = 0, safeLimitOrOpts = ECO_OVERLOAD_BASE_LIMIT) {
  return getMentalAttributeFlatPenalty(ecoOverload, safeLimitOrOpts)
}

/** @deprecated */
export const getGlobalAttributePenaltyPercent = getMentalAttributeFlatPenalty

export function getEcoPowerMultiplier() {
  return 1
}

/**
 * Penalidades efetivas: maior entre sobrecarga e estado mental selecionado.
 * Atributos mentais/sociais usam −flat (não %). Sem −% em poder de skill.
 */
export function resolveMentalPenalties(ecoOverload = 0, mentalState = 'estavel', safeLimitOrOpts = ECO_OVERLOAD_BASE_LIMIT) {
  const lim = resolveLimit(safeLimitOrOpts)
  const flatFromOverload = getMentalAttributeFlatPenalty(ecoOverload, lim)

  const stateOpt = getMentalStateOption(mentalState)
  const requiredState = getMentalStateFromEcoOverload(ecoOverload, lim)
  const requiredOpt = requiredState ? getMentalStateOption(requiredState) : null

  const flatFromState = Math.max(
    Number(stateOpt.mentalAttrPenalty) || 0,
    Number(requiredOpt?.mentalAttrPenalty) || 0,
  )

  const mentalAttrFlat = Math.max(flatFromOverload, flatFromState)

  return {
    ecoPowerPercent: 0,
    mentalAttrFlat,
    mentalAttrPercent: mentalAttrFlat,
    ecoPowerMultiplier: 1,
    mentalAttrMultiplier: 1,
    safeLimit: lim,
  }
}

export function applySkillPowerPenalty(basePower) {
  return Math.max(0, Number(basePower) || 0)
}

/**
 * Atributos físicos efetivos:
 *  - FOR/DES/VIT → −flat estado físico + armadura na DES
 *  - INT → −flat sobrecarga/estado mental
 *  - RUP → sem penalidade de sobrecarga
 */
export function calculateEffectiveAttributes(attributes = {}, {
  physicalState = 'bem',
  ecoOverload = 0,
  mentalState = 'estavel',
  destrezaPenalty = 0,
  safeLimit,
  ruptura,
} = {}) {
  const lim = safeLimit != null
    ? asSafeLimit(safeLimit)
    : resolveEcoSafeLimit(ruptura != null ? { ruptura } : { ruptura: attributes?.ruptura })

  const physicalOpt = getPhysicalStateOption(physicalState)
  const physicalFlat = Math.max(0, Number(physicalOpt.attrPenalty) || 0)
  const armorDex = Math.max(0, Number(destrezaPenalty) || 0)
  const penalties = resolveMentalPenalties(ecoOverload, mentalState, lim)
  const mentalFlat = penalties.mentalAttrFlat
  const effective = {}
  const keys = ATTRIBUTES.map(a => a.key)

  keys.forEach(key => {
    const base = Number(attributes[key]) || 0
    let value = base

    if (PHYSICAL_AFFECTED_KEYS.includes(key)) {
      value = base - physicalFlat
    } else if (MENTAL_ATTR_KEYS.includes(key)) {
      value = base - mentalFlat
    }

    if (key === 'destreza') {
      value -= armorDex
    }

    effective[key] = Math.max(0, value)
  })

  return {
    base: attributes,
    effective,
    physicalMultiplier: physicalOpt.multiplier ?? 1,
    physicalAttrPenalty: physicalFlat,
    destrezaPenalty: armorDex,
    mentalAttrFlat: mentalFlat,
    mentalAttributeMultiplier: 1,
    globalAttributeMultiplier: 1,
    ecoPowerMultiplier: penalties.ecoPowerMultiplier,
    ecoPenaltyPercent: penalties.ecoPowerPercent,
    mentalAttrPenaltyPercent: mentalFlat,
    attributePenaltyPercent: mentalFlat,
    safeLimit: lim,
  }
}

/** PER · SAB · CAR efetivos (VON não sofre sobrecarga). */
export function calculateEffectiveSocialAttributes(socialAttributes = {}, {
  ecoOverload = 0,
  mentalState = 'estavel',
  safeLimit,
  ruptura,
} = {}) {
  const lim = safeLimit != null
    ? asSafeLimit(safeLimit)
    : resolveEcoSafeLimit({ ruptura: ruptura ?? 0 })

  const penalties = resolveMentalPenalties(ecoOverload, mentalState, lim)
  const mentalFlat = penalties.mentalAttrFlat
  const effective = {}

  SOCIAL_ATTRIBUTES.forEach(({ key }) => {
    const base = Number(socialAttributes[key]) || 0
    if (OVERLOAD_SOCIAL_ATTR_KEYS.includes(key)) {
      effective[key] = Math.max(0, base - mentalFlat)
    } else {
      effective[key] = Math.max(0, base)
    }
  })

  return {
    base: socialAttributes,
    effective,
    mentalAttrFlat: mentalFlat,
    mentalAttributeMultiplier: 1,
    mentalAttrPenaltyPercent: mentalFlat,
    safeLimit: lim,
  }
}

export function getEffectiveAttributeValue(attributes, attrKey, {
  physicalState = 'bem',
  ecoOverload = 0,
  mentalState = 'estavel',
  destrezaPenalty = 0,
  safeLimit,
  ruptura,
} = {}) {
  const { effective } = calculateEffectiveAttributes(attributes, {
    physicalState, ecoOverload, mentalState, destrezaPenalty, safeLimit, ruptura,
  })
  return effective[attrKey] ?? 0
}

export function getEffectiveSocialAttributeValue(socialAttributes, attrKey, opts = {}) {
  const { effective } = calculateEffectiveSocialAttributes(socialAttributes, opts)
  return effective[attrKey] ?? 0
}

export function formatSkillPowerPenalty() {
  return null
}

/** Uma linha por atributo: `−2 Inteligência`, `−2 Percepção`… */
export function getMentalAttrPenaltyLines(mentalAttrFlat) {
  return buildPenaltyLines(mentalAttrFlat, MENTAL_PENALTY_LABELS)
}

export function formatMentalAttrPenalty(mentalAttrFlat) {
  const lines = getMentalAttrPenaltyLines(mentalAttrFlat)
  return lines.length > 0 ? lines.join('\n') : null
}

export function formatMentalPenaltiesSummary({
  ecoOverload = 0,
  mentalState = 'estavel',
  safeLimit,
  ruptura,
} = {}) {
  const lim = safeLimit != null ? { safeLimit } : { ruptura }
  const { mentalAttrFlat } = resolveMentalPenalties(ecoOverload, mentalState, lim)
  const lines = getMentalAttrPenaltyLines(mentalAttrFlat)
  const mentalAttrLine = lines.length > 0 ? lines.join('\n') : null

  return {
    ecoPowerPercent: 0,
    mentalAttrFlat,
    mentalAttrPercent: mentalAttrFlat,
    skillPowerLine: null,
    mentalAttrLine,
    lines,
    compactLine: mentalAttrLine,
    hasPenalties: lines.length > 0,
  }
}

export function formatEcoOverloadPenalty(ecoOverload, mentalState = 'estavel', safeLimitOrOpts = ECO_OVERLOAD_BASE_LIMIT) {
  const { mentalAttrFlat } = resolveMentalPenalties(ecoOverload, mentalState, safeLimitOrOpts)
  return formatMentalAttrPenalty(mentalAttrFlat)
}
