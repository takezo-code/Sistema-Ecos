import { genId } from '../utils/id'
import { SKILL_POOL } from '../data/skillPool'
import { ECO_UNLOCK_SKILL_COST, getSkillTierUpgradeCost, MAX_SKILL_TIER } from '../constants/progression'
import { getEffectiveSkillPower } from './ruptureBonus'
import { getMentalMultiplier, getEcoFailureChance } from './stateModifiers'

export function createSkillFromTemplate(template, tier = 1) {
  return {
    id: genId(),
    templateId: template.templateId,
    name: template.name,
    description: template.description,
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

export function getSkillDisplay(skill, rupturePoints = 0, mentalState = 'estavel') {
  const mentalMult = getMentalMultiplier(mentalState)
  return {
    ...skill,
    effectivePower: getEffectiveSkillPower(skill.basePower, rupturePoints, skill.tier, mentalMult),
    ruptureBonus: rupturePoints,
    mentalMultiplier: mentalMult,
    ecoFailureChance: getEcoFailureChance(mentalState),
  }
}

export function getTierUpgradeCostLabel(currentTier) {
  if (currentTier >= MAX_SKILL_TIER) return null
  return `${getSkillTierUpgradeCost(currentTier + 1)} Eco → Tier ${currentTier + 1}`
}
