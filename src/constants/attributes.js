import { getXpRequiredForLevel } from './progression'
import { migrateGameEntityExtras } from '../models/gameEntity'
import { entityHasEcoPowers, isNpcEntity, sanitizeEntityForEcoFlag } from './entityProgression'
import { normalizeClassId } from './classes'

export const ATTRIBUTES = [
  { key: 'forca', label: 'Força', color: '#dc2626', max: 10 },
  { key: 'destreza', label: 'Destreza', color: '#06b6d4', max: 10 },
  { key: 'inteligencia', label: 'Inteligência', color: '#a855f7', max: 10 },
  { key: 'vitalidade', label: 'Vitalidade', color: '#16a34a', max: 10 },
  { key: 'ruptura', label: 'Ruptura', color: '#d97706', max: 10 },
]

export const SOCIAL_ATTRIBUTES = [
  { key: 'carisma', label: 'Carisma', color: '#e879f9', max: 9 },
  { key: 'percepcao', label: 'Percepção', color: '#fbbf24', max: 9 },
  { key: 'vontade', label: 'Vontade', color: '#60a5fa', max: 9 },
  { key: 'sabedoria', label: 'Sabedoria', color: '#34d399', max: 9 },
]

export const STARTING_ATTRIBUTE_POINTS = 10
export const INITIAL_ATTRIBUTE_MAX = 4

export const STARTING_SOCIAL_POINTS = 6
export const INITIAL_SOCIAL_MAX = 4

const LEGACY_ATTR_MAP = {
  forca: 'forca',
  reflexo: 'destreza',
  intelecto: 'inteligencia',
  presenca: 'vitalidade',
  vontade: 'ruptura',
}

export const defaultAttributes = () =>
  Object.fromEntries(ATTRIBUTES.map(a => [a.key, 0]))

export const defaultSocialAttributes = () =>
  Object.fromEntries(SOCIAL_ATTRIBUTES.map(a => [a.key, 0]))

export function getAttributeMax(key) {
  return ATTRIBUTES.find(a => a.key === key)?.max ?? 10
}

export function getSocialAttributeMax(key) {
  return SOCIAL_ATTRIBUTES.find(a => a.key === key)?.max ?? 9
}

export function getInitialAttributeMax() {
  return INITIAL_ATTRIBUTE_MAX
}

export function getInitialSocialMax() {
  return INITIAL_SOCIAL_MAX
}

export function migrateAttributes(attrs = {}) {
  const next = defaultAttributes()
  Object.entries(attrs).forEach(([key, val]) => {
    const mapped = LEGACY_ATTR_MAP[key] || (ATTRIBUTES.some(a => a.key === key) ? key : null)
    if (mapped) next[mapped] = Math.min(getAttributeMax(mapped), (next[mapped] || 0) + (Number(val) || 0))
  })
  return next
}

export function migrateSocialAttributes(attrs = {}) {
  const next = defaultSocialAttributes()
  Object.entries(attrs).forEach(([key, val]) => {
    if (SOCIAL_ATTRIBUTES.some(a => a.key === key)) {
      next[key] = Math.min(getSocialAttributeMax(key), Math.max(0, Number(val) || 0))
    }
  })
  return next
}

export function getTotalAttributePoints(attributes = {}, entity = null) {
  const keys = entity && !entityHasEcoPowers(entity)
    ? ATTRIBUTES.filter(a => a.key !== 'ruptura')
    : ATTRIBUTES
  return keys.reduce((sum, a) => sum + (Number(attributes[a.key]) || 0), 0)
}

export function getTotalSocialPoints(socialAttributes = {}) {
  return SOCIAL_ATTRIBUTES.reduce((sum, a) => sum + (Number(socialAttributes[a.key]) || 0), 0)
}

/** Pisos fixos dos 10 pts de criação — atributo não pode ficar abaixo disso após a criação */
export function inferCreationAttributeFloors(entity = {}, attributes = {}) {
  const attrs = migrateAttributes(attributes)
  if (entity.creationAttributeFloors && typeof entity.creationAttributeFloors === 'object') {
    return migrateAttributes(entity.creationAttributeFloors)
  }

  const spent = getTotalAttributePoints(attrs)
  const unspent = entity.unspentAttributePoints ?? 0
  if (unspent > 0) return defaultAttributes()

  if (spent <= STARTING_ATTRIBUTE_POINTS) {
    return { ...defaultAttributes(), ...attrs }
  }

  const floors = ATTRIBUTES.reduce(
    (acc, a) => ({ ...acc, [a.key]: Number(attrs[a.key]) || 0 }),
    defaultAttributes()
  )
  let sum = getTotalAttributePoints(floors)
  while (sum > STARTING_ATTRIBUTE_POINTS) {
    const key = ATTRIBUTES.reduce(
      (best, a) => ((floors[a.key] || 0) > (floors[best] || 0) ? a.key : best),
      ATTRIBUTES[0].key
    )
    if ((floors[key] || 0) <= 0) break
    floors[key]--
    sum--
  }
  return floors
}

export function getCreationAttributeFloor(entity, attrKey, attributes = entity?.attributes) {
  const floors = inferCreationAttributeFloors(entity, attributes)
  return Number(floors[attrKey]) || 0
}

export function inferCreationSocialFloors(entity = {}, socialAttributes = {}) {
  const attrs = migrateSocialAttributes(socialAttributes)
  if (entity.creationSocialFloors && typeof entity.creationSocialFloors === 'object') {
    return migrateSocialAttributes(entity.creationSocialFloors)
  }
  const unspent = entity.unspentSocialPoints ?? null
  if (unspent === null || unspent > 0) return defaultSocialAttributes()
  const total = getTotalSocialPoints(attrs)
  if (total <= STARTING_SOCIAL_POINTS) return { ...defaultSocialAttributes(), ...attrs }
  return defaultSocialAttributes()
}

export function getCreationSocialFloor(entity, attrKey) {
  const floors = inferCreationSocialFloors(entity, entity?.socialAttributes)
  return Number(floors[attrKey]) || 0
}

export function isInCreationPhase(entity) {
  return (entity.unspentAttributePoints ?? 0) > 0
}

export function isInSocialCreationPhase(entity) {
  return (entity.unspentSocialPoints ?? 0) > 0
}

export function getAttributeLabels() {
  return Object.fromEntries(ATTRIBUTES.map(a => [a.key, a.label]))
}

export function getAllAttributeLabels() {
  return Object.fromEntries(
    [...ATTRIBUTES, ...SOCIAL_ATTRIBUTES].map(a => [a.key, a.label])
  )
}

/** @deprecated use PHYSICAL_STATES from constants/states */
export const CONDITION_OPTIONS = [
  { value: 'bem', label: 'Bem', color: '#16a34a' },
  { value: 'ferido', label: 'Ferido', color: '#d97706' },
  { value: 'grave', label: 'Grave', color: '#dc2626' },
  { value: 'incapacitado', label: 'Incapacitado', color: '#991b1b' },
]

export function normalizeGameEntity(entity) {
  const attributes = migrateAttributes(entity.attributes)
  const spent = getTotalAttributePoints(attributes, entity)
  const level = entity.level ?? 1

  const hasSavedFloors = entity.creationAttributeFloors
    && typeof entity.creationAttributeFloors === 'object'
    && getTotalAttributePoints(migrateAttributes(entity.creationAttributeFloors)) > 0

  let unspent = entity.unspentAttributePoints
  if (hasSavedFloors) {
    unspent = 0
  } else if (unspent == null) {
    unspent = Math.max(0, STARTING_ATTRIBUTE_POINTS - spent)
  }

  const extras = migrateGameEntityExtras(entity)

  const creationAttributeFloors = inferCreationAttributeFloors(
    { ...entity, unspentAttributePoints: unspent },
    attributes
  )

  // Social attributes
  const socialAttributes = migrateSocialAttributes(entity.socialAttributes)
  const hasSavedSocialFloors = entity.creationSocialFloors
    && typeof entity.creationSocialFloors === 'object'

  let unspentSocial = entity.unspentSocialPoints
  if (hasSavedSocialFloors) {
    unspentSocial = 0
  } else if (hasSavedFloors) {
    // Legacy entity created before social system: no creation pending
    unspentSocial = 0
  } else if (unspentSocial == null) {
    unspentSocial = Math.max(0, STARTING_SOCIAL_POINTS - getTotalSocialPoints(socialAttributes))
  }

  const creationSocialFloors = inferCreationSocialFloors(
    { ...entity, unspentSocialPoints: unspentSocial },
    socialAttributes
  )

  const hasEco = entityHasEcoPowers(entity)
  const base = {
    ...entity,
    classId: normalizeClassId(entity.classId),
    level,
    xp: entity.xp ?? 0,
    xpToNextLevel: getXpRequiredForLevel(level),
    ecoPoints: hasEco ? (entity.ecoPoints ?? 0) : 0,
    pendingAttributePoints: entity.pendingAttributePoints ?? 0,
    skills: hasEco ? (extras.skills ?? []) : [],
    attributes: hasEco ? attributes : { ...attributes, ruptura: 0 },
    unspentAttributePoints: unspent,
    creationAttributeFloors,
    socialAttributes,
    unspentSocialPoints: unspentSocial,
    pendingSocialPoints: entity.pendingSocialPoints ?? 0,
    creationSocialFloors,
    hasEcoPowers: entity.hasEcoPowers ?? (isNpcEntity(entity) ? false : true),
    ...extras,
    inventory: Array.isArray(entity.inventory) ? entity.inventory : [],
    equipped: Array.isArray(entity.equipped) ? entity.equipped : [],
    backpackCapacity: entity.backpackCapacity ?? null,
    combatNotes: entity.combatNotes ?? '',
    damageMarks: entity.damageMarks ?? 0,
    // Campos de combate (inimigos / bosses)
    podeCombater: entity.podeCombater ?? false,
    papelCombate: entity.papelCombate ?? 'nenhum',
    resistenciaFisica: entity.resistenciaFisica ?? 0,
    resistenciaMental: entity.resistenciaMental ?? 0,
    marcasMaximas: entity.marcasMaximas ?? 0,
    bonusAtaque: entity.bonusAtaque ?? 0,
    xpRecompensa: entity.xpRecompensa ?? 0,
    fraquezas: entity.fraquezas ?? '',
  }
  return sanitizeEntityForEcoFlag(base)
}

/** @deprecated use progressionService.applyInitialAttributeChange ou applyAttributePointSpend */
export function applyAttributeChange(entity, key, newValue) {
  const inCreation = (entity.unspentAttributePoints ?? 0) > 0 && getTotalAttributePoints(entity.attributes) < STARTING_ATTRIBUTE_POINTS
  if (inCreation) {
    const value = Math.max(0, Math.min(INITIAL_ATTRIBUTE_MAX, Number(newValue) || 0))
    const current = entity.attributes?.[key] ?? 0
    const delta = value - current
    const pool = entity.unspentAttributePoints ?? 0
    if (delta > 0 && pool < delta) return null
    return {
      attributes: { ...entity.attributes, [key]: value },
      unspentAttributePoints: pool - delta,
    }
  }
  return null
}
