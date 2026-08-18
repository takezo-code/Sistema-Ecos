import { ATTRIBUTES, SOCIAL_ATTRIBUTES } from '../constants/attributes'
import { getCharacterClass } from '../constants/classes'
import { entityHasEcoPowers, isNpcEntity } from '../constants/entityProgression'
import { getXpRequiredForLevel, isSkillGradeLevel } from '../constants/progression'
import { getRupturaPool, formatRupturaPoolSources } from '../constants/ecoOverload'
import { getSkillTypeMeta } from '../constants/skillTypes'
import { getClassAttributeBonus, formatClassBonus } from '../mechanics/classes/classBonusEngine'
import { getRemainingLife } from '../mechanics/combat/damageMarksEngine'
import {
  GEAR_CATEGORIES,
  getCharacterWeapon,
  getCharacterArmor,
  getWeaponKindLabel,
} from '../mechanics/equipment/characterGear'
import { getItemPassivesAligned, formatPassive } from '../mechanics/equipment/gearPassiveEngine'
import { getWeaponSkill } from '../mechanics/equipment/weaponProgressionEngine'
import { getProgressionSnapshot } from './progressionBudget'
import { getClassSkillDef } from '../data/classSkillsCatalog'
import { getCatalogSkill } from './skillsCatalogService'
import { WEAPON_SKILL_TEMPLATE_ID } from './ecoSkillRuntimeService'

const PAPEL_META = {
  capanga: { label: 'Capanga', color: '#9ca3af' },
  elite: { label: 'Elite', color: '#d97706' },
  boss: { label: 'Boss', color: '#dc2626' },
  nenhum: { label: 'NPC', color: '#06b6d4' },
}

export function resolveSheetKind(entity, kind) {
  if (kind) return kind
  if (!entity) return 'character'
  if (entity.papelCombate === 'boss') return 'boss'
  if (isNpcEntity(entity)) return 'npc'
  if ('ideology' in (entity || {}) || 'allies' in (entity || {})) return 'organization'
  return 'character'
}

function fileSafeName(value, fallback) {
  const cleaned = String(value || fallback)
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned || fallback
}

export function sheetFilename(entity, ext, kind) {
  const resolvedKind = resolveSheetKind(entity, kind)
  const name = fileSafeName(entity?.name, 'Sem nome')
  const prefix = {
    organization: 'Ficha da Organização',
    npc: 'Ficha do NPC',
    boss: 'Ficha do Boss',
    character: 'Ficha do personagem',
  }[resolvedKind] || 'Ficha do personagem'
  return `${prefix} ${name}.${ext}`
}

function attrRow(entity, attr) {
  const source = SOCIAL_ATTRIBUTES.some(a => a.key === attr.key)
    ? entity.socialAttributes
    : entity.attributes
  const classBonus = getClassAttributeBonus(entity, attr.key)
  return {
    key: attr.key,
    label: attr.label,
    color: attr.color,
    value: Math.max(0, Number(source?.[attr.key]) || 0),
    classBonus,
    classBonusLabel: formatClassBonus(classBonus),
  }
}

function skillLevelLabel(level) {
  const n = Math.max(0, Number(level) || 0)
  if (n <= 0) return '—'
  if (isSkillGradeLevel(n)) return `G${n}`
  return `nv.${n}`
}

function isWeaponSkillEntry(skill) {
  return skill?.templateId === WEAPON_SKILL_TEMPLATE_ID || skill?.isWeaponSkill
}

function resolveSkillDef(skill) {
  return getClassSkillDef(skill?.templateId)
    || getCatalogSkill(skill?.templateId)
    || null
}

function mapLearnedSkill(skill) {
  const def = resolveSkillDef(skill)
  const typeMeta = getSkillTypeMeta(skill.skillType || def?.skillType)
  return {
    id: skill.id || skill.templateId,
    name: skill.name || def?.name || 'Skill',
    level: Math.max(0, Number(skill.tier) || 0),
    levelLabel: skillLevelLabel(skill.tier),
    typeLabel: typeMeta?.label || 'Ativa',
    typeColor: typeMeta?.color || '#06b6d4',
    description: skill.description || def?.description || '',
    mechanicalEffect: skill.mechanicalEffect || skill.effect || def?.mechanicalEffect || '',
    narrativeConsequence: skill.narrativeConsequence || skill.sideEffect || def?.narrativeConsequence || '',
    iconSrc: def?.iconSrc || '',
  }
}

function mapPassives(category, item) {
  return getItemPassivesAligned(category, item)
    .map(passive => (passive ? formatPassive(passive) : null))
    .filter(Boolean)
}

function mapWeapon(entity) {
  const weapon = getCharacterWeapon(entity)
  if (!weapon) return null
  const skill = getWeaponSkill(weapon)
  return {
    name: weapon.name || 'Arma',
    kind: getWeaponKindLabel(weapon),
    image: weapon.image || '',
    passives: mapPassives(GEAR_CATEGORIES.WEAPON, weapon),
    skill: skill
      ? {
          name: skill.name || 'Skill da arma',
          description: skill.description || '',
          mechanicalEffect: skill.mechanicalEffect || skill.effect || '',
          narrativeConsequence: skill.narrativeConsequence || skill.sideEffect || '',
          cooldownTurns: Math.max(0, Number(skill.cooldownTurns) || 0),
          overloadCost: Math.max(0, Number(skill.overloadCost) || 0),
        }
      : null,
  }
}

function mapArmor(entity) {
  const armor = getCharacterArmor(entity)
  if (!armor) return null
  return {
    name: armor.name || 'Armadura',
    image: armor.image || '',
    passives: mapPassives(GEAR_CATEGORIES.ARMOR, armor),
  }
}

export function buildCharacterSheetSnapshot(entity = {}, kind) {
  const resolvedKind = resolveSheetKind(entity, kind)
  const charClass = getCharacterClass(entity)
  const progression = getProgressionSnapshot(entity)
  const life = getRemainingLife(entity)
  const ruptura = getRupturaPool(entity)
  const level = entity.level ?? 1
  const xpToNext = getXpRequiredForLevel(level)
  const hasEco = entityHasEcoPowers(entity)
  const papel = PAPEL_META[entity.papelCombate] || PAPEL_META.nenhum

  let identity
  if (resolvedKind === 'boss') identity = { label: 'Boss', color: '#dc2626' }
  else if (resolvedKind === 'npc') identity = papel
  else identity = { label: charClass?.label || 'Sem classe', color: charClass?.color || '#a855f7' }

  return {
    kind: resolvedKind,
    name: entity.name || 'Sem nome',
    image: entity.image || '',
    level,
    identity,
    organization: String(entity.organization || '').trim(),
    xp: Math.max(0, Number(entity.xp) || 0),
    xpToNext,
    ecoAvailable: hasEco ? Math.max(0, Number(progression.ecoFree) || 0) : null,
    lifeMax: life.max,
    rupturaMax: hasEco ? ruptura.max : null,
    rupturaSources: hasEco ? formatRupturaPoolSources(ruptura) : '',
    physical: ATTRIBUTES
      .filter(attr => attr.key !== 'ruptura' || hasEco)
      .map(attr => attrRow(entity, attr)),
    social: SOCIAL_ATTRIBUTES.map(attr => attrRow(entity, attr)),
    skills: (entity.skills || [])
      .filter(skill => !isWeaponSkillEntry(skill))
      .filter(skill => (Number(skill.tier) || 0) > 0 || skill.fromCatalog === false)
      .map(mapLearnedSkill),
    weapon: mapWeapon(entity),
    armor: mapArmor(entity),
    hasEco,
  }
}

export function buildOrganizationSheetSnapshot(org = {}) {
  return {
    kind: 'organization',
    name: org.name || 'Sem nome',
    image: org.image || '',
    symbol: org.symbol || '',
    description: String(org.description || '').trim(),
    ideology: String(org.ideology || '').trim(),
    allies: String(org.allies || '').trim(),
    enemies: String(org.enemies || '').trim(),
  }
}

/** @deprecated use sheetFilename */
export function characterSheetFilename(entity, ext) {
  return sheetFilename(entity, ext, 'character')
}
