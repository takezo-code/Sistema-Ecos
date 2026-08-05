import {
  PHYSICAL_AFFECTED_KEYS,
  PHYSICAL_PENALTY_LABELS,
  buildPenaltyLines,
  getPhysicalStateOption,
  getMentalStateOption,
  normalizePhysicalState,
  normalizeMentalState,
} from '../constants/states'
import {
  calculateEffectiveAttributes,
  calculateEffectiveSocialAttributes,
  getEffectiveSocialAttributeValue,
  resolveMentalPenalties,
  formatEcoOverloadPenalty,
  formatMentalPenaltiesSummary,
  formatSkillPowerPenalty,
  formatMentalAttrPenalty,
  getMentalAttrPenaltyLines,
} from '../mechanics/ecoOverload/overloadPenalties'
import { getArmorDestrezaPenalty } from '../mechanics/equipment/armorEffectsEngine'
import { sumAttrBonus } from '../mechanics/equipment/gearPassiveEngine'

/** Penalidade flat em FOR/DES/VIT pelo estado físico (0–3). */
export function getPhysicalAttrPenalty(physicalState) {
  return Math.max(0, Number(getPhysicalStateOption(physicalState).attrPenalty) || 0)
}

/** @deprecated multiplicador físico não é mais usado — penalidade é flat (attrPenalty). */
export function getPhysicalMultiplier(physicalState) {
  return getPhysicalStateOption(physicalState).multiplier ?? 1
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

/** Atributos efetivos de qualquer entidade (personagem, NPC, boss). */
export function getEntityEffectiveAttributes(entity = {}) {
  const result = calculateEffectiveAttributes(entity.attributes || {}, {
    physicalState: entity.physicalState ?? entity.condition ?? 'bem',
    ecoOverload: entity.ecoOverload ?? 0,
    mentalState: entity.mentalState ?? 'estavel',
    destrezaPenalty: getArmorDestrezaPenalty(entity),
    ruptura: entity.attributes?.ruptura,
  })
  const effective = { ...result.effective }
  for (const key of Object.keys(effective)) {
    effective[key] = (Number(effective[key]) || 0) + sumAttrBonus(entity, key)
  }
  return { ...result, effective }
}

export function getEntityEffectiveSocialAttributes(entity = {}) {
  const result = calculateEffectiveSocialAttributes(entity.socialAttributes || {}, {
    ecoOverload: entity.ecoOverload ?? 0,
    mentalState: entity.mentalState ?? 'estavel',
    ruptura: entity.attributes?.ruptura,
  })
  const effective = { ...result.effective }
  for (const key of Object.keys(effective)) {
    effective[key] = (Number(effective[key]) || 0) + sumAttrBonus(entity, key)
  }
  return { ...result, effective }
}

/** @deprecated use getEntityEffectiveAttributes / calculateEffectiveAttributes */
export function calculatePhysicalAttributes(attributes = {}, physicalState = 'bem', ecoOverload = 0, mentalState = 'estavel') {
  const result = calculateEffectiveAttributes(attributes, { physicalState, ecoOverload, mentalState })
  return {
    base: result.base,
    effective: result.effective,
    multiplier: result.physicalMultiplier,
    attrPenalty: result.physicalAttrPenalty ?? getPhysicalAttrPenalty(physicalState),
    penaltyPercent: 0,
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
  const { ecoPowerMultiplier } = resolveMentalPenalties(ecoOverload, mentalState, { ruptura: rupturePoints })
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

/**
 * Valor efetivo de um atributo.
 * Aceita opts `{ physicalState, ecoOverload, mentalState }` ou args posicionais legados.
 */
export function getEffectiveAttributeValue(attributes, attrKey, physicalState, ecoOverload = 0) {
  const opts = typeof physicalState === 'object' && physicalState !== null
    ? {
        physicalState: physicalState.physicalState ?? 'bem',
        ecoOverload: physicalState.ecoOverload ?? 0,
        mentalState: physicalState.mentalState ?? 'estavel',
        destrezaPenalty: physicalState.destrezaPenalty ?? 0,
      }
    : {
        physicalState,
        ecoOverload: arguments[3] ?? 0,
        mentalState: arguments[4] ?? 'estavel',
        destrezaPenalty: arguments[5] ?? 0,
      }
  const { effective } = calculateEffectiveAttributes(attributes, opts)
  return effective[attrKey] ?? 0
}

/** Uma linha por atributo: `−1 Força`, `−1 Destreza`… */
export function getPhysicalPenaltyLines(physicalState) {
  return buildPenaltyLines(getPhysicalAttrPenalty(physicalState), PHYSICAL_PENALTY_LABELS)
}

export function formatPhysicalPenalty(physicalState) {
  const lines = getPhysicalPenaltyLines(physicalState)
  return lines.length > 0 ? lines.join('\n') : null
}

export function formatMentalPenalty() {
  return null
}

export {
  PHYSICAL_AFFECTED_KEYS,
  formatEcoOverloadPenalty,
  calculateEffectiveAttributes,
  calculateEffectiveSocialAttributes,
  getEffectiveSocialAttributeValue,
  formatMentalPenaltiesSummary,
  formatSkillPowerPenalty,
  formatMentalAttrPenalty,
  getMentalAttrPenaltyLines,
  resolveMentalPenalties,
}

export function migrateEntityStates(entity = {}) {
  const physicalState = normalizePhysicalState(entity.physicalState ?? entity.condition)
  const mentalState = normalizeMentalState(entity.mentalState)
  return { physicalState, mentalState }
}
