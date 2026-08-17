import { ATTRIBUTES, SOCIAL_ATTRIBUTES } from '../constants/attributes'
import { getCharacterClass } from '../constants/classes'
import { entityHasEcoPowers } from '../constants/entityProgression'
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

export function buildCharacterSheetSnapshot(entity = {}) {
  const charClass = getCharacterClass(entity)
  const progression = getProgressionSnapshot(entity)
  const life = getRemainingLife(entity)
  const ruptura = getRupturaPool(entity)
  const level = entity.level ?? 1
  const xpToNext = getXpRequiredForLevel(level)
  const hasEco = entityHasEcoPowers(entity)

  return {
    name: entity.name || 'Sem nome',
    image: entity.image || '',
    level,
    classLabel: charClass?.label || 'Sem classe',
    classColor: charClass?.color || '#a855f7',
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
      .filter(skill => !isWeaponSkillEntry(skill) && (Number(skill.tier) || 0) > 0)
      .map(mapLearnedSkill),
    weapon: mapWeapon(entity),
    armor: mapArmor(entity),
    hasEco,
  }
}

export function characterSheetFilename(entity, ext) {
  const slug = String(entity?.name || 'personagem')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'personagem'
  return `ficha-${slug}-nv${entity?.level || 1}.${ext}`
}
