import { getCatalogSkill } from './skillsCatalogService'
import { ECO_SKILL_TYPES } from '../constants/skillTypes'
import { SKILL_VISUAL_STATE_META } from '../constants/skillVisualStates'
import { getCharacterClass } from '../constants/classes'
import { getEcoSafeLimitFromEntity } from '../constants/ecoOverload'
import { getCooldownRemaining } from '../mechanics/skills/cooldownEngine'
import { resolveSkillVisualState, canActivateActiveSkill } from '../mechanics/skills/skillVisualState'
import { activateActiveSkill, advanceTurnForEntity } from '../mechanics/skills/skillActivationEngine'
import { genId } from '../utils/id'
import { getCharacterWeapon } from '../mechanics/equipment/characterGear'
import { getWeaponSkill } from '../mechanics/equipment/weaponProgressionEngine'

export const WEAPON_SKILL_TEMPLATE_ID = 'weapon_skill'
export const WEAPON_SKILL_INSTANCE_ID = 'weapon_skill'

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

function buildWeaponSkillCatalog(weaponSkill) {
  return {
    templateId: WEAPON_SKILL_TEMPLATE_ID,
    name: weaponSkill.name || 'Skill da arma',
    skillType: ECO_SKILL_TYPES.ATIVA,
    cooldownTurns: Number(weaponSkill.cooldownTurns) || 2,
    overloadCost: Number(weaponSkill.overloadCost) || 1,
    description: weaponSkill.description || '',
    mechanicalEffect: weaponSkill.mechanicalEffect || '',
    narrativeConsequence: weaponSkill.narrativeConsequence || '',
    effect: weaponSkill.mechanicalEffect || '',
    sideEffect: weaponSkill.narrativeConsequence || '',
    isWeaponSkill: true,
    icon: 'AR',
  }
}

function resolveRuntimeFromCatalog(entity, skillInstance, catalog) {
  const safeLimit = getEcoSafeLimitFromEntity(entity)
  const cooldownRemaining = catalog.skillType === ECO_SKILL_TYPES.ATIVA
    ? getCooldownRemaining(entity.skillCooldowns, catalog.templateId)
    : 0

  const visualState = resolveSkillVisualState({
    skillType: catalog.skillType,
    cooldownRemaining,
    ecoOverload: entity.ecoOverload ?? 0,
    mentalState: entity.mentalState ?? 'estavel',
    safeLimit,
  })

  const activation = catalog.skillType === ECO_SKILL_TYPES.ATIVA
    ? canActivateActiveSkill({
      skillType: catalog.skillType,
      cooldowns: entity.skillCooldowns,
      templateId: catalog.templateId,
      ecoOverload: entity.ecoOverload ?? 0,
      safeLimit,
    })
    : { allowed: false, reason: 'Passiva — efeito constante.' }

  return {
    instance: skillInstance,
    catalog,
    classMeta: catalog.classId ? getCharacterClass(catalog.classId) : null,
    categoryMeta: null,
    cooldownRemaining,
    cooldownTotal: catalog.cooldownTurns ?? 0,
    visualState,
    visualMeta: SKILL_VISUAL_STATE_META[visualState],
    canActivate: activation.allowed,
    blockReason: activation.reason,
    isPassive: catalog.skillType === ECO_SKILL_TYPES.PASSIVA,
    isWeaponSkill: !!catalog.isWeaponSkill,
    overloadCost: catalog.overloadCost ?? (catalog.skillType === ECO_SKILL_TYPES.ATIVA ? 1 : 0),
  }
}

/** Une instância do personagem com definição do catálogo */
export function resolveSkillRuntime(entity, skillInstance) {
  if (skillInstance?.templateId === WEAPON_SKILL_TEMPLATE_ID || skillInstance?.isWeaponSkill) {
    const weapon = getCharacterWeapon(entity)
    const weaponSkill = getWeaponSkill(weapon)
    if (!weaponSkill) {
      return {
        instance: skillInstance,
        catalog: null,
        available: false,
        visualState: 'bloqueada',
        visualMeta: SKILL_VISUAL_STATE_META.bloqueada,
      }
    }
    return resolveRuntimeFromCatalog(entity, skillInstance, buildWeaponSkillCatalog(weaponSkill))
  }

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

  return resolveRuntimeFromCatalog(entity, skillInstance, catalog)
}

export function resolveWeaponSkillRuntime(entity) {
  const weapon = getCharacterWeapon(entity)
  const weaponSkill = getWeaponSkill(weapon)
  if (!weaponSkill) return null

  const instance = {
    id: WEAPON_SKILL_INSTANCE_ID,
    templateId: WEAPON_SKILL_TEMPLATE_ID,
    name: weaponSkill.name || 'Skill da arma',
    skillType: ECO_SKILL_TYPES.ATIVA,
    tier: 1,
    isWeaponSkill: true,
  }

  return resolveRuntimeFromCatalog(entity, instance, buildWeaponSkillCatalog(weaponSkill))
}

export function listCharacterSkillsRuntime(entity) {
  const classSkills = (entity.skills || [])
    .map(s => resolveSkillRuntime(entity, s))
    .filter(r => r.catalog)

  const weaponRuntime = resolveWeaponSkillRuntime(entity)
  if (weaponRuntime) classSkills.push(weaponRuntime)
  return classSkills
}

export function activateCharacterSkill(entity, skillId) {
  const weaponRuntime = skillId === WEAPON_SKILL_INSTANCE_ID
    ? resolveWeaponSkillRuntime(entity)
    : null

  const skill = weaponRuntime?.instance
    || (entity.skills || []).find(s => s.id === skillId)
  if (!skill) return { ok: false, error: { message: 'Habilidade não encontrada.' } }

  const catalog = weaponRuntime?.catalog || getCatalogSkill(skill.templateId)
  if (!catalog) return { ok: false, error: { message: 'Definição de habilidade ausente no catálogo.' } }

  if (catalog.skillType !== ECO_SKILL_TYPES.ATIVA) {
    return { ok: false, error: { message: 'Habilidades passivas não são ativadas manualmente.' } }
  }

  const check = canActivateActiveSkill({
    skillType: catalog.skillType,
    cooldowns: entity.skillCooldowns,
    templateId: catalog.templateId,
    ecoOverload: entity.ecoOverload ?? 0,
    safeLimit: getEcoSafeLimitFromEntity(entity),
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
  const weapon = getCharacterWeapon(entity)
  const weaponSkill = getWeaponSkill(weapon)
  if (weaponSkill) {
    catalogMap[WEAPON_SKILL_TEMPLATE_ID] = buildWeaponSkillCatalog(weaponSkill)
  }
  const { patch, passiveWarnings } = advanceTurnForEntity(entity, catalogMap)
  return { ok: true, patch, warnings: passiveWarnings }
}
