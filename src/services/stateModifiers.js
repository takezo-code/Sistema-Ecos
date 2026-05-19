import {
  PHYSICAL_AFFECTED_KEYS,
  getPhysicalStateOption,
  getMentalStateOption,
  normalizePhysicalState,
  normalizeMentalState,
} from '../constants/states'
import {
  calculateEffectiveAttributes,
  resolveMentalPenalties,
  formatEcoOverloadPenalty,
  formatMentalPenaltiesSummary,
  formatSkillPowerPenalty,
  formatMentalAttrPenalty,
} from '../mechanics/ecoOverload/overloadPenalties'

export function getPhysicalMultiplier(physicalState) {
  return getPhysicalStateOption(physicalState).multiplier
}

export function getMentalMultiplier(mentalState) {
  return getMentalStateOption(mentalState).multiplier
}

export function getEcoFailureChance(mentalState) {
  return getMentalStateOption(mentalState).ecoFailureChance ?? 0
}

export function hasTemporalInstability(mentalState) {
  return normalizeMentalState(mentalState) === 'perdido_no_tempo'
}

/** @deprecated use calculateEffectiveAttributes — mantido por compatibilidade */
export function calculatePhysicalAttributes(attributes = {}, physicalState = 'bem', ecoOverload = 0, mentalState = 'estavel') {
  const result = calculateEffectiveAttributes(attributes, { physicalState, ecoOverload, mentalState })
  return {
    base: result.base,
    effective: result.effective,
    multiplier: result.physicalMultiplier,
    penaltyPercent: getPhysicalStateOption(physicalState).penaltyPercent,
    globalAttributeMultiplier: result.globalAttributeMultiplier,
    ecoPowerMultiplier: result.ecoPowerMultiplier,
  }
}

/** Eficiência de Ecos / habilidades temporais (ruptura + estado mental + sobrecarga) */
export function calculateEcoEfficiency({
  basePower = 0,
  rupturePoints = 0,
  mentalState = 'estavel',
  tier = 1,
  ecoOverload = 0,
} = {}) {
  const { ecoPowerMultiplier } = resolveMentalPenalties(ecoOverload, mentalState)
  const ruptureMult = 1 + Math.max(0, Number(rupturePoints) || 0) / 100
  const tierMult = 1 + (Math.max(1, tier) - 1) * 0.15
  const combined = ecoPowerMultiplier * ruptureMult * tierMult

  return {
    ecoPowerMultiplier,
    ruptureMultiplier: ruptureMult,
    tierMultiplier: tierMult,
    combinedMultiplier: combined,
    effectivePower: Math.max(0, Math.round(Number(basePower) * combined)),
    ecoFailureChance: getEcoFailureChance(mentalState),
    unstable: hasTemporalInstability(mentalState),
  }
}

export function rollEcoSkillFailure(mentalState) {
  const chance = getEcoFailureChance(mentalState)
  if (chance <= 0) return { failed: false, chance: 0 }
  const roll = Math.random()
  return { failed: roll < chance, chance, roll }
}

export function getEffectiveAttributeValue(attributes, attrKey, physicalState, ecoOverload = 0) {
  const opts = typeof physicalState === 'object' && physicalState !== null
    ? physicalState
    : { physicalState, ecoOverload: arguments[3] ?? 0 }
  const { effective } = calculateEffectiveAttributes(attributes, opts)
  return effective[attrKey] ?? 0
}

export function formatPhysicalPenalty(physicalState) {
  const pct = getPhysicalStateOption(physicalState).penaltyPercent
  return pct > 0 ? `−${pct}% físico` : null
}

/** @deprecated use formatMentalPenaltiesSummary */
export function formatMentalPenalty(mentalState, ecoOverload = 0) {
  const { ecoPowerPercent } = resolveMentalPenalties(ecoOverload, mentalState)
  return formatSkillPowerPenalty(ecoPowerPercent)
}

export {
  formatEcoOverloadPenalty,
  calculateEffectiveAttributes,
  formatMentalPenaltiesSummary,
  formatSkillPowerPenalty,
  formatMentalAttrPenalty,
  resolveMentalPenalties,
}

export function migrateEntityStates(entity = {}) {
  const physicalState = normalizePhysicalState(entity.physicalState ?? entity.condition)
  const mentalState = normalizeMentalState(entity.mentalState)
  return { physicalState, mentalState }
}
