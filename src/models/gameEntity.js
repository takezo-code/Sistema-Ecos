import { migrateEntityStates } from '../services/stateModifiers'
import { normalizeActiveMentalStatuses } from '../services/mentalStatusService'
import { normalizeSkillType } from '../constants/skillTypes'
import { normalizeSkillCooldowns } from '../mechanics/skills/cooldownEngine'
import { getCatalogSkill } from '../services/skillsCatalogService'
import { SKILL_POOL } from '../data/skillPool'

/** Campos padrão do sistema de Sobrecarga de Eco e estados ativos */
export function defaultEcoOverloadFields() {
  return {
    ecoOverload: 0,
    damageMarks: 0,
    activeMentalStatuses: [],
    ruptureTotalCount: 0,
    lastRuptureTotalEvent: null,
    lastEcoUseAt: null,
    lastEcoSkillUsedId: null,
    skillCooldowns: {},
    ecoSkillHistory: [],
    currentTurn: 0,
  }
}

export function migrateEcoOverloadFields(entity = {}) {
  const defaults = defaultEcoOverloadFields()
  return {
    ecoOverload: entity.ecoOverload ?? defaults.ecoOverload,
    damageMarks: entity.damageMarks ?? defaults.damageMarks,
    activeMentalStatuses: normalizeActiveMentalStatuses(
      entity.activeMentalStatuses ?? defaults.activeMentalStatuses
    ),
    ruptureTotalCount: entity.ruptureTotalCount ?? defaults.ruptureTotalCount,
    lastRuptureTotalEvent: entity.lastRuptureTotalEvent ?? defaults.lastRuptureTotalEvent,
    lastEcoUseAt: entity.lastEcoUseAt ?? defaults.lastEcoUseAt,
    lastEcoSkillUsedId: entity.lastEcoSkillUsedId ?? defaults.lastEcoSkillUsedId,
    skillCooldowns: normalizeSkillCooldowns(entity.skillCooldowns ?? defaults.skillCooldowns),
    ecoSkillHistory: Array.isArray(entity.ecoSkillHistory) ? entity.ecoSkillHistory : defaults.ecoSkillHistory,
    currentTurn: entity.currentTurn ?? defaults.currentTurn,
  }
}

export function migrateSkills(skills = []) {
  if (!Array.isArray(skills)) return []
  return skills.map(skill => {
    const catalog = getCatalogSkill(skill.templateId)
    const legacy = SKILL_POOL.find(t => t.templateId === skill.templateId)
    const source = catalog || legacy
    return {
      ...skill,
      skillType: normalizeSkillType(skill.skillType || source?.skillType),
      fromCatalog: skill.fromCatalog === false ? false : Boolean(catalog),
    }
  })
}

export function migrateGameEntityExtras(entity = {}) {
  const { skills: _skills, ...rest } = {
    ...migrateEntityStates(entity),
    ...migrateEcoOverloadFields(entity),
    skills: migrateSkills(entity.skills),
  }
  return rest
}
