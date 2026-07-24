import { ECO_SKILLS_CATALOG } from '../data/ecoSkillsCatalog'
import { NPC_SKILLS_CATALOG } from '../data/npcSkillsCatalog'
import { ECO_SKILL_TYPES } from '../constants/skillTypes'
import { SKILL_CATEGORIES } from '../constants/skillCategories'
import { normalizeSkillType } from '../constants/skillTypes'
import {
  SKILL_AUDIENCE,
  normalizeSkillAudience,
  getSkillAudience,
  skillMatchesAudience,
} from '../constants/skillAudience'
import { isNpcEntity } from '../constants/entityProgression'
import { storage, KEYS } from './storage'
import { genId } from '../utils/id'

const CHARACTER_BUILTIN = ECO_SKILLS_CATALOG.map(s => ({
  ...s,
  audience: normalizeSkillAudience(s.audience ?? SKILL_AUDIENCE.CHARACTER),
  isBuiltin: true,
}))
const NPC_BUILTIN = NPC_SKILLS_CATALOG.map(s => ({
  ...s,
  audience: SKILL_AUDIENCE.NPC,
  isBuiltin: true,
}))
const BUILTIN = [...CHARACTER_BUILTIN, ...NPC_BUILTIN]

export { SKILL_AUDIENCE, normalizeSkillAudience, getSkillAudience, skillMatchesAudience }

export function loadCustomSkills() {
  const raw = storage.get(KEYS.skillsCatalog)
  return Array.isArray(raw) ? raw : []
}

/** Remove todas as skills custom persistidas no navegador */
export function purgeCustomSkillsCatalog() {
  saveCustomSkills([])
}

export function saveCustomSkills(skills) {
  storage.set(KEYS.skillsCatalog, skills)
}

function normalizeCatalogEntry(skill) {
  return {
    ...skill,
    audience: normalizeSkillAudience(skill.audience),
  }
}

export function getMergedCatalog(audience = null) {
  const custom = loadCustomSkills()
  const builtinIds = new Set(BUILTIN.map(s => s.templateId))
  const mergedCustom = custom
    .filter(s => s?.templateId && !builtinIds.has(s.templateId))
    .map(normalizeCatalogEntry)
  const all = [...BUILTIN, ...mergedCustom]
  if (!audience) return all
  return all.filter(s => skillMatchesAudience(s, audience))
}

export function getCatalogAudienceForEntity(entity) {
  if (!isNpcEntity(entity)) return SKILL_AUDIENCE.CHARACTER
  if (entity.papelCombate === 'boss') return SKILL_AUDIENCE.BOSS
  return SKILL_AUDIENCE.NPC
}

export function catalogSkillAllowedForEntity(templateId, entity) {
  const def = getCatalogSkill(templateId)
  if (!def || !entity) return false
  return skillMatchesAudience(def, getCatalogAudienceForEntity(entity))
}

export function getCatalogSkill(templateId) {
  return getMergedCatalog().find(s => s.templateId === templateId) || null
}

export function createEmptySkillDraft(audience = SKILL_AUDIENCE.CHARACTER) {
  return {
    name: '',
    audience: normalizeSkillAudience(audience),
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
    audience: normalizeSkillAudience(draft.audience),
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
  const custom = loadCustomSkills()
  const skill = custom.find(s => s.templateId === templateId)
  if (!skill) return { ok: false, message: 'Skill não encontrada.' }
  saveCustomSkills(custom.filter(s => s.templateId !== templateId))
  // Lazy import evita ciclo trashService ↔ skillsCatalogService no boot
  import('./trashService').then(({ archiveEntity, TRASH_TYPES }) => {
    archiveEntity(TRASH_TYPES.skill, skill)
  }).catch(err => console.error('[deleteCustomSkill]', err))
  return { ok: true }
}
