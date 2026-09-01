import { getCatalogSkill } from './skillsCatalogService'
import { ECO_SKILL_TYPES } from '../constants/skillTypes'
import { SKILL_VISUAL_STATE_META } from '../constants/skillVisualStates'
import { getCharacterClass } from '../constants/classes'
import { getEcoSafeLimitFromEntity } from '../constants/ecoOverload'
import { getCooldownRemaining } from '../mechanics/skills/cooldownEngine'
import { resolveSkillVisualState, canActivateActiveSkill } from '../mechanics/skills/skillVisualState'
import { activateActiveSkill, advanceTurnForEntity } from '../mechanics/skills/skillActivationEngine'
import { buildClassPassiveTurnPatch } from '../mechanics/classes/classPassiveEngine'
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

/** Skill criada direto na ficha/criação (sem catálogo/grimório). */
export function buildInlineSkillInstance(data = {}) {
  const id = genId()
  const mechanicalEffect = data.mechanicalEffect || data.effect || ''
  const narrativeConsequence = data.narrativeConsequence || data.sideEffect || ''
  return {
    id,
    templateId: id,
    name: (data.name || '').trim() || 'Skill',
    skillType: data.skillType || ECO_SKILL_TYPES.ATIVA,
    tier: 1,
    basePower: Number(data.basePower) || 0,
    fromCatalog: false,
    cooldownTurns: Math.max(0, Number(data.cooldownTurns) || 0),
    overloadCost: Math.max(0, Number(data.overloadCost) || 1),
    description: data.description || '',
    mechanicalEffect,
    narrativeConsequence,
    effect: mechanicalEffect,
    sideEffect: narrativeConsequence,
  }
}

/** Skills gravadas na ficha (inline ou catálogo). */
export function getEntityOwnedSkills(entity) {
  if (!entity) return []
  return Array.isArray(entity.skills) ? entity.skills.filter(Boolean) : []
}

/** Catálogo efetivo: entrada global ou definição embutida na instância. */
export function resolveSkillCatalog(skillInstance) {
  if (!skillInstance) return null
  if (skillInstance.templateId === WEAPON_SKILL_TEMPLATE_ID || skillInstance.isWeaponSkill) {
    return null
  }
  const fromCat = getCatalogSkill(skillInstance.templateId)
  if (fromCat) return fromCat

  const name = String(skillInstance.name || '').trim()
  const mechanicalEffect = skillInstance.mechanicalEffect || skillInstance.effect || ''
  const narrativeConsequence = skillInstance.narrativeConsequence || skillInstance.sideEffect || ''
  const description = String(skillInstance.description || '').trim()
  const hasInlineData = skillInstance.fromCatalog === false
    || name
    || mechanicalEffect
    || narrativeConsequence
    || description
    || skillInstance.id
    || skillInstance.templateId

  if (!hasInlineData) return null

  return {
    templateId: skillInstance.templateId || skillInstance.id,
    name: name || 'Skill',
    skillType: skillInstance.skillType || ECO_SKILL_TYPES.ATIVA,
    cooldownTurns: Number(skillInstance.cooldownTurns) || 0,
    overloadCost: Number(skillInstance.overloadCost) || 1,
    description,
    mechanicalEffect,
    narrativeConsequence,
    effect: mechanicalEffect,
    sideEffect: narrativeConsequence,
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

  const catalog = resolveSkillCatalog(skillInstance)
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
  const classSkills = getEntityOwnedSkills(entity)
    .map(s => resolveSkillRuntime(entity, s))
    .filter(r => r.catalog)

  const weaponRuntime = resolveWeaponSkillRuntime(entity)
  if (weaponRuntime) classSkills.push(weaponRuntime)
  return classSkills
}

function shouldShowSkillInCombat(skill) {
  if (!skill || typeof skill !== 'object') return false
  if (skill.templateId === WEAPON_SKILL_TEMPLATE_ID || skill.isWeaponSkill) return false
  return Boolean(skill.id || skill.templateId || skill.name || skill.mechanicalEffect || skill.effect || skill.description)
}

/** Skills visíveis no combate — inclui inline de NPC/boss e skills aprendidas. */
export function listCombatSkillsRuntime(entity) {
  const classSkills = getEntityOwnedSkills(entity)
    .filter(shouldShowSkillInCombat)
    .map(s => resolveSkillRuntime(entity, s))
    .filter(r => r.catalog)

  const weaponRuntime = resolveWeaponSkillRuntime(entity)
  if (weaponRuntime?.catalog) classSkills.push(weaponRuntime)
  return classSkills
}

export function activateCharacterSkill(entity, skillId) {
  const weaponRuntime = skillId === WEAPON_SKILL_INSTANCE_ID
    ? resolveWeaponSkillRuntime(entity)
    : null

  const skill = weaponRuntime?.instance
    || (entity.skills || []).find(s => s.id === skillId)
  if (!skill) return { ok: false, error: { message: 'Habilidade não encontrada.' } }

  const catalog = weaponRuntime?.catalog || resolveSkillCatalog(skill)
  if (!catalog) return { ok: false, error: { message: 'Definição de habilidade ausente.' } }

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
    partyBuffs: result.partyBuffs || [],
    partyHeal: result.partyHeal || null,
  }
}

export function advanceCharacterTurn(entity) {
  const catalogMap = Object.fromEntries(
    (entity.skills || [])
      .map(s => resolveSkillCatalog(s))
      .filter(Boolean)
      .map(c => [c.templateId, c])
  )
  const weapon = getCharacterWeapon(entity)
  const weaponSkill = getWeaponSkill(weapon)
  if (weaponSkill) {
    catalogMap[WEAPON_SKILL_TEMPLATE_ID] = buildWeaponSkillCatalog(weaponSkill)
  }
  const { patch, passiveWarnings } = advanceTurnForEntity(entity, catalogMap)
  let fullPatch = { ...patch }
  const warnings = [...(passiveWarnings || [])]

  const passiveTurn = buildClassPassiveTurnPatch({ ...entity, ...fullPatch })
  if (passiveTurn.patch) {
    fullPatch = { ...fullPatch, ...passiveTurn.patch }
  }
  if (passiveTurn.warning) {
    warnings.push(passiveTurn.warning)
  }

  return { ok: true, patch: fullPatch, warnings }
}
