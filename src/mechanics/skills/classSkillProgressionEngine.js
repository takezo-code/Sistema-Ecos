import { getClassSkills, getClassSkillDef } from '../../data/classSkillsCatalog'
import { normalizeClassId } from '../../constants/classes'
import {
  ECO_SKILL_POINT_COST,
  ECO_SKILL_MAX_LEVEL,
  MAX_CLASS_SKILL_LEVEL,
  SKILL_GRADE_START_LEVEL,
  isSkillGradeLevel,
} from '../../constants/progression'
import {
  findGradeCatalyst,
  countGradeCatalysts,
  consumeGradeCatalyst,
} from '../../constants/merchantItems'
import { buildSkillInstanceFromCatalog } from '../../services/ecoSkillRuntimeService'
import { getCatalogSkill } from '../../services/skillsCatalogService'

export function listClassSkillBook(entity) {
  const classId = normalizeClassId(entity?.classId)
  if (!classId) return []
  const owned = new Map((entity.skills || []).map(s => [s.templateId, s]))
  const catalysts = countGradeCatalysts(entity.inventory)
  return getClassSkills(classId).map(def => {
    const instance = owned.get(def.templateId) || null
    const level = Math.max(0, Number(instance?.tier) || 0)
    return {
      def,
      instance,
      level,
      unlocked: level > 0,
      atMax: level >= MAX_CLASS_SKILL_LEVEL,
      isGrade: isSkillGradeLevel(level),
      nextNeedsGradeItem: level >= ECO_SKILL_MAX_LEVEL && level < MAX_CLASS_SKILL_LEVEL,
      catalysts,
    }
  })
}

export function getOwnedSkillLevel(entity, templateId) {
  const skill = (entity.skills || []).find(s => s.templateId === templateId)
  return Math.max(0, Number(skill?.tier) || 0)
}

/** Investir Eco: sobe a skill até o nível 3. */
export function canInvestSkillPoint(entity, templateId) {
  const classId = normalizeClassId(entity?.classId)
  if (!classId) {
    return { ok: false, reason: 'Defina a classe do personagem para usar o livro de skills.' }
  }

  const def = getClassSkillDef(templateId) || getCatalogSkill(templateId)
  if (!def || def.classId !== classId) {
    return { ok: false, reason: 'Esta skill não pertence à classe do personagem.' }
  }

  const level = getOwnedSkillLevel(entity, templateId)
  if (level >= ECO_SKILL_MAX_LEVEL) {
    return { ok: false, reason: 'Skill já está no nível máximo.' }
  }

  const eco = entity.ecoPoints ?? 0
  if (eco < ECO_SKILL_POINT_COST) {
    return { ok: false, reason: `Precisa de ${ECO_SKILL_POINT_COST} Eco.` }
  }

  return { ok: true, nextLevel: level + 1, cost: ECO_SKILL_POINT_COST }
}

export function investSkillPoint(entity, templateId) {
  const check = canInvestSkillPoint(entity, templateId)
  if (!check.ok) return { error: { message: check.reason } }

  const skills = [...(entity.skills || [])]
  const idx = skills.findIndex(s => s.templateId === templateId)
  const nextLevel = check.nextLevel

  if (idx === -1) {
    const instance = buildSkillInstanceFromCatalog(templateId)
    if (!instance) return { error: { message: 'Definição de skill ausente no catálogo.' } }
    skills.push({ ...instance, tier: nextLevel })
  } else {
    skills[idx] = { ...skills[idx], tier: nextLevel }
  }

  return {
    patch: {
      skills,
      ecoPoints: (entity.ecoPoints ?? 0) - check.cost,
    },
    level: nextLevel,
    unlocked: nextLevel === 1,
  }
}

/** Subir para grau (4+) consumindo Catalisador de Grau do inventário. */
export function canUpgradeSkillGrade(entity, templateId) {
  const classId = normalizeClassId(entity?.classId)
  if (!classId) {
    return { ok: false, reason: 'Defina a classe do personagem.' }
  }

  const def = getClassSkillDef(templateId) || getCatalogSkill(templateId)
  if (!def || def.classId !== classId) {
    return { ok: false, reason: 'Esta skill não pertence à classe do personagem.' }
  }

  const level = getOwnedSkillLevel(entity, templateId)
  if (level < ECO_SKILL_MAX_LEVEL) {
    return { ok: false, reason: `Primeiro leve a skill ao nível ${ECO_SKILL_MAX_LEVEL} com Eco.` }
  }
  if (level >= MAX_CLASS_SKILL_LEVEL) {
    return { ok: false, reason: 'Skill já está no nível máximo.' }
  }
  if (!findGradeCatalyst(entity.inventory)) {
    return { ok: false, reason: 'Sem Catalisador de Grau no inventário.' }
  }

  return { ok: true, nextLevel: level + 1 }
}

export function upgradeSkillGrade(entity, templateId) {
  const check = canUpgradeSkillGrade(entity, templateId)
  if (!check.ok) return { error: { message: check.reason } }

  const consumed = consumeGradeCatalyst(entity.inventory)
  if (!consumed.ok) return { error: { message: 'Falha ao consumir o Catalisador de Grau.' } }

  const skills = [...(entity.skills || [])]
  const idx = skills.findIndex(s => s.templateId === templateId)
  if (idx === -1) return { error: { message: 'Skill não encontrada.' } }

  const nextLevel = check.nextLevel
  skills[idx] = { ...skills[idx], tier: nextLevel }

  return {
    patch: {
      skills,
      inventory: consumed.inventory,
    },
    level: nextLevel,
    enteredGrade: nextLevel === SKILL_GRADE_START_LEVEL,
  }
}
