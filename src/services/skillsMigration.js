import { storage, KEYS } from './storage'
import { ONESHOT_SKILLS_PACK } from '../data/oneshotSkillsPack'
import { ECO_SKILL_TYPES } from '../constants/skillTypes'
import { SKILL_CATEGORIES } from '../constants/skillCategories'
import { normalizeSkillAudience } from '../constants/skillAudience'
import { normalizeSkillType } from '../constants/skillTypes'

const WIPE_FLAG = 'system_all_skills_removed_v2'
const ONESHOT_SEED_FLAG = 'oneshot_skills_pack_v1'

function loadCustomSkillsSafe() {
  const raw = storage.get(KEYS.skillsCatalog)
  return Array.isArray(raw) ? raw.filter(Boolean) : []
}

function saveCustomSkillsSafe(skills) {
  storage.set(KEYS.skillsCatalog, skills)
}

function stripEntitySkillsInStorage() {
  for (const key of [KEYS.characters, KEYS.npcs]) {
    const list = storage.get(key)
    if (!Array.isArray(list)) continue
    storage.set(key, list.map(entity => (entity ? { ...entity, skills: [] } : entity)))
  }
}

/** Evita import circular com skillsCatalogService/trashService no boot. */
function buildSeedSkill(draft) {
  const skillType = normalizeSkillType(draft.skillType)
  const isPassiva = skillType === ECO_SKILL_TYPES.PASSIVA
  const now = new Date().toISOString()
  return {
    templateId: draft.templateId,
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
    createdAt: draft.createdAt || now,
    updatedAt: now,
  }
}

/** Limpa catálogo custom e skills nas fichas salvas (executa uma vez por navegador) */
export function runSkillsSystemWipeIfNeeded() {
  if (storage.get(WIPE_FLAG)) return false
  saveCustomSkillsSafe([])
  stripEntitySkillsInStorage()
  storage.set(WIPE_FLAG, true)
  return true
}

/** Injeta o pacote one-shot no catálogo custom (CRUD completo; ids estáveis) */
export function seedOneshotSkillsPackIfNeeded() {
  if (storage.get(ONESHOT_SEED_FLAG)) return false

  const existing = loadCustomSkillsSafe()
  const existingIds = new Set(existing.map(s => s.templateId).filter(Boolean))
  const seeded = ONESHOT_SKILLS_PACK
    .filter(s => s?.templateId && !existingIds.has(s.templateId))
    .map(buildSeedSkill)

  if (seeded.length > 0) {
    saveCustomSkillsSafe([...existing, ...seeded])
  }

  storage.set(ONESHOT_SEED_FLAG, true)
  return seeded.length > 0
}

try {
  runSkillsSystemWipeIfNeeded()
  seedOneshotSkillsPackIfNeeded()
} catch (e) {
  console.error('[skillsMigration] falha na migração — app continua:', e)
  try { storage.set(ONESHOT_SEED_FLAG, true) } catch { /* ignore */ }
}
