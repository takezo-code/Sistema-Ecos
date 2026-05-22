import { SKILL_AUDIENCE } from '../constants/skillAudience'
import { getMergedCatalog } from './skillsCatalogService'
import { buildSkillInstanceFromCatalog } from './ecoSkillRuntimeService'
import { ECO_UNLOCK_SKILL_COST } from '../constants/progression'
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

function getCharacterSkillPool() {
  return getMergedCatalog(SKILL_AUDIENCE.CHARACTER)
}

export function rollRandomSkill(existingSkills = []) {
  const owned = new Set(existingSkills.map(s => s.templateId))
  const base = getCharacterSkillPool()
  const available = base.filter(t => !owned.has(t.templateId))
  const pool = available.length > 0 ? available : base
  const template = pool[Math.floor(Math.random() * pool.length)]
  if (!template) return null
  return buildSkillInstanceFromCatalog(template.templateId)
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
