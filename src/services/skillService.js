import { genId } from '../utils/id'
import { SKILL_POOL } from '../data/skillPool'
import { ECO_UNLOCK_SKILL_COST, getSkillTierUpgradeCost, MAX_SKILL_TIER } from '../constants/progression'
import { normalizeSkillType, getSkillTypeMeta } from '../constants/skillTypes'
import { getEffectiveSkillPower } from './ruptureBonus'
import { getMentalMultiplier, getEcoFailureChance } from './stateModifiers'
import { getEcoPowerPenaltyPercent } from '../mechanics/ecoOverload/overloadPenalties'

export function createSkillFromTemplate(template, tier = 1) {
  const skillType = normalizeSkillType(template.skillType)
  return {
    id: genId(),
    templateId: template.templateId,
    name: template.name,
    description: template.description,
    skillType,
    tier,
    effect: template.effect,
    sideEffect: template.sideEffect,
    basePower: template.basePower,
  }
}

export function rollRandomSkill(existingSkills = []) {
  const owned = new Set(existingSkills.map(s => s.templateId))
  const available = SKILL_POOL.filter(t => !owned.has(t.templateId))
  const pool = available.length > 0 ? available : SKILL_POOL
  const template = pool[Math.floor(Math.random() * pool.length)]
  return createSkillFromTemplate(template, 1)
}

export function canUnlockRandomSkill(character) {
  const eco = character.ecoPoints ?? 0
  return eco >= ECO_UNLOCK_SKILL_COST
}

export function unlockRandomSkill(character) {
  if (!canUnlockRandomSkill(character)) return null
  const skill = rollRandomSkill(character.skills || [])
  return {
    skills: [...(character.skills || []), skill],
    ecoPoints: (character.ecoPoints ?? 0) - ECO_UNLOCK_SKILL_COST,
  }
}

export function canUpgradeSkillTier(character, skillId) {
  const skill = (character.skills || []).find(s => s.id === skillId)
  if (!skill || skill.tier >= MAX_SKILL_TIER) return false
  const cost = getSkillTierUpgradeCost(skill.tier + 1)
  return (character.ecoPoints ?? 0) >= cost
}

export function canAffordAnySkillUpgrade(character) {
  return (character.skills || []).some(s => canUpgradeSkillTier(character, s.id))
}

/** Habilidades que podem subir de tier com os Ecos atuais */
export function listUpgradeableSkills(character) {
  return (character.skills || []).filter(s => canUpgradeSkillTier(character, s.id))
}

export function upgradeSkillTier(character, skillId) {
  const skill = (character.skills || []).find(s => s.id === skillId)
  if (!skill || skill.tier >= MAX_SKILL_TIER) return null
  const cost = getSkillTierUpgradeCost(skill.tier + 1)
  if ((character.ecoPoints ?? 0) < cost) return null

  return {
    ecoPoints: (character.ecoPoints ?? 0) - cost,
    skills: (character.skills || []).map(s =>
      s.id === skillId ? { ...s, tier: s.tier + 1 } : s
    ),
  }
}

export function getSkillDisplay(skill, rupturePoints = 0, mentalState = 'estavel', ecoOverload = 0) {
  const mentalMult = getMentalMultiplier(mentalState)
  const skillType = normalizeSkillType(skill?.skillType)
  return {
    ...skill,
    skillType,
    typeMeta: getSkillTypeMeta(skillType),
    effectivePower: getEffectiveSkillPower(
      skill.basePower,
      rupturePoints,
      skill.tier,
      mentalMult,
      ecoOverload
    ),
    ruptureBonus: rupturePoints,
    mentalMultiplier: mentalMult,
    overloadPenaltyPercent: getEcoPowerPenaltyPercent(ecoOverload),
    ecoFailureChance: getEcoFailureChance(mentalState),
  }
}

export function getTierUpgradeCostLabel(currentTier) {
  if (currentTier >= MAX_SKILL_TIER) return null
  return `${getSkillTierUpgradeCost(currentTier + 1)} Eco → Tier ${currentTier + 1}`
}
