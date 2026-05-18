import {
  PHYSICAL_AFFECTED_KEYS,
  getPhysicalStateOption,
  getMentalStateOption,
  normalizePhysicalState,
  normalizeMentalState,
} from '../constants/states'

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

/** Atributos físicos efetivos (força, destreza, vitalidade) após penalidade física */
export function calculatePhysicalAttributes(attributes = {}, physicalState = 'bem') {
  const mult = getPhysicalMultiplier(physicalState)
  const effective = { ...attributes }

  PHYSICAL_AFFECTED_KEYS.forEach(key => {
    const base = Number(attributes[key]) || 0
    effective[key] = Math.max(0, Math.round(base * mult))
  })

  return {
    base: attributes,
    effective,
    multiplier: mult,
    penaltyPercent: getPhysicalStateOption(physicalState).penaltyPercent,
  }
}

/** Eficiência de Ecos / habilidades temporais (ruptura + estado mental) */
export function calculateEcoEfficiency({
  basePower = 0,
  rupturePoints = 0,
  mentalState = 'estavel',
  tier = 1,
} = {}) {
  const mentalMult = getMentalMultiplier(mentalState)
  const ruptureMult = 1 + Math.max(0, Number(rupturePoints) || 0) / 100
  const tierMult = 1 + (Math.max(1, tier) - 1) * 0.15
  const combined = mentalMult * ruptureMult * tierMult

  return {
    mentalMultiplier: mentalMult,
    ruptureMultiplier: ruptureMult,
    tierMultiplier: tierMult,
    combinedMultiplier: combined,
    effectivePower: Math.max(0, Math.round(Number(basePower) * combined)),
    ecoFailureChance: getEcoFailureChance(mentalState),
    unstable: hasTemporalInstability(mentalState),
  }
}

/** Testa se uma habilidade de Eco falha neste turno/sessão (aleatório) */
export function rollEcoSkillFailure(mentalState) {
  const chance = getEcoFailureChance(mentalState)
  if (chance <= 0) return { failed: false, chance: 0 }
  const roll = Math.random()
  return { failed: roll < chance, chance, roll }
}

export function getEffectiveAttributeValue(attributes, attrKey, physicalState) {
  const base = Number(attributes?.[attrKey]) || 0
  if (!PHYSICAL_AFFECTED_KEYS.includes(attrKey)) return base
  return Math.max(0, Math.round(base * getPhysicalMultiplier(physicalState)))
}

export function formatPhysicalPenalty(physicalState) {
  const pct = getPhysicalStateOption(physicalState).penaltyPercent
  return pct > 0 ? `−${pct}% físico` : null
}

export function formatMentalPenalty(mentalState) {
  const pct = getMentalStateOption(mentalState).penaltyPercent
  return pct > 0 ? `−${pct}% Ecos` : null
}

export function migrateEntityStates(entity = {}) {
  const physicalState = normalizePhysicalState(entity.physicalState ?? entity.condition)
  const mentalState = normalizeMentalState(entity.mentalState)
  return { physicalState, mentalState }
}
