import { getCatalogSkill } from './skillsCatalogService'
import { ECO_SKILL_TYPES } from '../constants/skillTypes'
import { SKILL_VISUAL_STATE_META } from '../constants/skillVisualStates'
import { SKILL_CATEGORY_META } from '../constants/skillCategories'
import { getCooldownRemaining } from '../mechanics/skills/cooldownEngine'
import { resolveSkillVisualState, canActivateActiveSkill } from '../mechanics/skills/skillVisualState'
import { activateActiveSkill, advanceTurnForEntity } from '../mechanics/skills/skillActivationEngine'
import { genId } from '../utils/id'

export function buildSkillInstanceFromCatalog(templateId) {
  const def = getCatalogSkill(templateId)
  if (!def) return null
  return {
    id: genId(),
    templateId: def.templateId,
    name: def.name,
    skillType: def.skillType,
    tier: 1,
    basePower: 0,
    fromCatalog: true,
  }
}

/** Une instância do personagem com definição do catálogo */
export function resolveSkillRuntime(entity, skillInstance) {
  const catalog = getCatalogSkill(skillInstance.templateId)
  if (!catalog) {
    return {
      instance: skillInstance,
      catalog: null,
      available: false,
      visualState: 'bloqueada',
      visualMeta: SKILL_VISUAL_STATE_META.bloqueada,
    }
  }

  const cooldownRemaining = catalog.skillType === ECO_SKILL_TYPES.ATIVA
    ? getCooldownRemaining(entity.skillCooldowns, catalog.templateId)
    : 0

  const visualState = resolveSkillVisualState({
    skillType: catalog.skillType,
    cooldownRemaining,
    ecoOverload: entity.ecoOverload ?? 0,
    mentalState: entity.mentalState ?? 'estavel',
  })

  const activation = catalog.skillType === ECO_SKILL_TYPES.ATIVA
    ? canActivateActiveSkill({
      skillType: catalog.skillType,
      cooldowns: entity.skillCooldowns,
      templateId: catalog.templateId,
      ecoOverload: entity.ecoOverload ?? 0,
    })
    : { allowed: false, reason: 'Passiva — efeito constante.' }

  return {
    instance: skillInstance,
    catalog,
    categoryMeta: SKILL_CATEGORY_META[catalog.category],
    cooldownRemaining,
    cooldownTotal: catalog.cooldownTurns ?? 0,
    visualState,
    visualMeta: SKILL_VISUAL_STATE_META[visualState],
    canActivate: activation.allowed,
    blockReason: activation.reason,
    isPassive: catalog.skillType === ECO_SKILL_TYPES.PASSIVA,
    overloadCost: catalog.overloadCost ?? (catalog.skillType === ECO_SKILL_TYPES.ATIVA ? 1 : 0),
  }
}

export function listCharacterSkillsRuntime(entity) {
  return (entity.skills || [])
    .map(s => resolveSkillRuntime(entity, s))
    .filter(r => r.catalog)
}

export function activateCharacterSkill(entity, skillId) {
  const skill = (entity.skills || []).find(s => s.id === skillId)
  if (!skill) return { ok: false, error: { message: 'Habilidade não encontrada.' } }

  const catalog = getCatalogSkill(skill.templateId)
  if (!catalog) return { ok: false, error: { message: 'Definição de habilidade ausente no catálogo.' } }

  if (catalog.skillType !== ECO_SKILL_TYPES.ATIVA) {
    return { ok: false, error: { message: 'Habilidades passivas não são ativadas manualmente.' } }
  }

  const check = canActivateActiveSkill({
    skillType: catalog.skillType,
    cooldowns: entity.skillCooldowns,
    templateId: catalog.templateId,
    ecoOverload: entity.ecoOverload ?? 0,
  })
  if (!check.allowed) {
    return { ok: false, error: { message: check.reason } }
  }

  const result = activateActiveSkill(entity, skill, catalog)
  return {
    ok: true,
    patch: result.patch,
    events: result.events,
    warnings: result.warnings,
    historyEntry: result.historyEntry,
  }
}

export function advanceCharacterTurn(entity) {
  const catalogMap = Object.fromEntries(
    (entity.skills || [])
      .map(s => getCatalogSkill(s.templateId))
      .filter(Boolean)
      .map(c => [c.templateId, c])
  )
  const { patch, passiveWarnings } = advanceTurnForEntity(entity, catalogMap)
  return { ok: true, patch, warnings: passiveWarnings }
}
