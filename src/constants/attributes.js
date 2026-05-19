import { getXpRequiredForLevel } from './progression'
import { migrateGameEntityExtras } from '../models/gameEntity'

export const ATTRIBUTES = [
  { key: 'forca', label: 'Força', color: '#dc2626', max: 10 },
  { key: 'destreza', label: 'Destreza', color: '#06b6d4', max: 10 },
  { key: 'inteligencia', label: 'Inteligência', color: '#a855f7', max: 10 },
  { key: 'vitalidade', label: 'Vitalidade', color: '#16a34a', max: 10 },
  { key: 'ruptura', label: 'Ruptura', color: '#d97706', max: 5 },
]

export const STARTING_ATTRIBUTE_POINTS = 10
export const INITIAL_ATTRIBUTE_MAX = 4

const LEGACY_ATTR_MAP = {
  forca: 'forca',
  reflexo: 'destreza',
  intelecto: 'inteligencia',
  presenca: 'vitalidade',
  vontade: 'ruptura',
}

export const defaultAttributes = () =>
  Object.fromEntries(ATTRIBUTES.map(a => [a.key, 0]))

export function getAttributeMax(key) {
  return ATTRIBUTES.find(a => a.key === key)?.max ?? 10
}

export function getInitialAttributeMax() {
  return INITIAL_ATTRIBUTE_MAX
}

export function migrateAttributes(attrs = {}) {
  const next = defaultAttributes()
  Object.entries(attrs).forEach(([key, val]) => {
    const mapped = LEGACY_ATTR_MAP[key] || (ATTRIBUTES.some(a => a.key === key) ? key : null)
    if (mapped) next[mapped] = Math.min(getAttributeMax(mapped), (next[mapped] || 0) + (Number(val) || 0))
  })
  return next
}

export function getTotalAttributePoints(attributes = {}) {
  return ATTRIBUTES.reduce((sum, a) => sum + (Number(attributes[a.key]) || 0), 0)
}

export function getAttributeLabels() {
  return Object.fromEntries(ATTRIBUTES.map(a => [a.key, a.label]))
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
  const spent = getTotalAttributePoints(attributes)
  const level = entity.level ?? 1

  let unspent = entity.unspentAttributePoints
  if (unspent == null) {
    unspent = Math.max(0, STARTING_ATTRIBUTE_POINTS - spent)
  }

  const extras = migrateGameEntityExtras(entity)

  return {
    ...entity,
    level,
    xp: entity.xp ?? 0,
    xpToNextLevel: getXpRequiredForLevel(level),
    ecoPoints: entity.ecoPoints ?? 0,
    pendingAttributePoints: entity.pendingAttributePoints ?? 0,
    skills: extras.skills ?? [],
    attributes,
    unspentAttributePoints: unspent,
    ...extras,
    inventory: Array.isArray(entity.inventory) ? entity.inventory : [],
    equipped: Array.isArray(entity.equipped) ? entity.equipped : [],
    backpackCapacity: entity.backpackCapacity ?? null,
    combatNotes: entity.combatNotes ?? '',
    damageMarks: entity.damageMarks ?? 0,
  }
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
