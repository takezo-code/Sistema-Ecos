import { ECO_SKILLS_CATALOG } from '../data/ecoSkillsCatalog'
import { ECO_SKILL_TYPES } from '../constants/skillTypes'
import { SKILL_CATEGORIES } from '../constants/skillCategories'
import { normalizeSkillType } from '../constants/skillTypes'
import { storage, KEYS } from './storage'
import { genId } from '../utils/id'

const BUILTIN = ECO_SKILLS_CATALOG.map(s => ({ ...s, isBuiltin: true }))

export function loadCustomSkills() {
  const raw = storage.get(KEYS.skillsCatalog)
  return Array.isArray(raw) ? raw : []
}

export function saveCustomSkills(skills) {
  storage.set(KEYS.skillsCatalog, skills)
}

export function getMergedCatalog() {
  const custom = loadCustomSkills()
  const builtinIds = new Set(BUILTIN.map(s => s.templateId))
  const mergedCustom = custom.filter(s => s?.templateId && !builtinIds.has(s.templateId))
  return [...BUILTIN, ...mergedCustom]
}

export function getCatalogSkill(templateId) {
  return getMergedCatalog().find(s => s.templateId === templateId) || null
}

export function createEmptySkillDraft() {
  return {
    name: '',
    skillType: ECO_SKILL_TYPES.ATIVA,
    category: SKILL_CATEGORIES.PERCEPCAO,
    cooldownTurns: 3,
    overloadCost: 1,
    passiveOverloadRisk: false,
    description: '',
    narrativeConsequence: '',
    mechanicalEffect: '',
  }
}

export function buildSkillFromDraft(draft, existingId = null) {
  const skillType = normalizeSkillType(draft.skillType)
  const isPassiva = skillType === ECO_SKILL_TYPES.PASSIVA
  return {
    templateId: existingId || `custom_${genId()}`,
    name: String(draft.name || '').trim() || 'Sem nome',
    skillType,
    category: Object.values(SKILL_CATEGORIES).includes(draft.category)
      ? draft.category
      : SKILL_CATEGORIES.PERCEPCAO,
    cooldownTurns: isPassiva ? 0 : Math.max(0, Number(draft.cooldownTurns) || 0),
    overloadCost: isPassiva ? 0 : Math.max(0, Number(draft.overloadCost) ?? 1),
    passiveOverloadRisk: Boolean(draft.passiveOverloadRisk),
    description: String(draft.description || '').trim(),
    narrativeConsequence: String(draft.narrativeConsequence || '').trim(),
    mechanicalEffect: String(draft.mechanicalEffect || '').trim(),
    isBuiltin: false,
    createdAt: draft.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function addCustomSkill(draft) {
  const skill = buildSkillFromDraft(draft)
  const custom = loadCustomSkills()
  saveCustomSkills([...custom, skill])
  return skill
}

export function updateCustomSkill(templateId, draft) {
  const custom = loadCustomSkills()
  const idx = custom.findIndex(s => s.templateId === templateId)
  if (idx < 0) return null
  const skill = buildSkillFromDraft(
    { ...custom[idx], ...draft, createdAt: custom[idx].createdAt },
    templateId
  )
  const next = [...custom]
  next[idx] = skill
  saveCustomSkills(next)
  return skill
}

export function deleteCustomSkill(templateId) {
  const builtin = BUILTIN.some(s => s.templateId === templateId)
  if (builtin) return { ok: false, message: 'Habilidades do sistema não podem ser excluídas.' }
  const custom = loadCustomSkills().filter(s => s.templateId !== templateId)
  saveCustomSkills(custom)
  return { ok: true }
}
