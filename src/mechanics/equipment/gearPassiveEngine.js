/**
 * Passivas Metin de arma e armadura.
 *
 * Armadura (4 slots, todos liberados desde a forja):
 *   1 attr (1–5) · 2 life_marks (1–5) · 3 ruptura_uses (1–5) · 4 roll_bonus (1–3)
 *
 * Arma (3 slots Metin + skill custom no 4º):
 *   1 attr (1–5) · 2 ruptura_uses (1–5) · 3 roll_bonus (1–3)
 *
 * Rolar → ver → manter ou rolar de novo (sem custo).
 */

import { ATTRIBUTES, SOCIAL_ATTRIBUTES } from '../../constants/attributes'
import {
  getCharacterArmor,
  getCharacterWeapon,
} from './characterGear'

export const PASSIVE_KINDS = Object.freeze({
  ATTR: 'attr',
  LIFE_MARKS: 'life_marks',
  RUPTURA_USES: 'ruptura_uses',
  ROLL_BONUS: 'roll_bonus',
})

/**
 * Keys literais (não GEAR_CATEGORIES no topo): characterGear ↔ equipmentTypes ↔ classes
 * ↔ attributes pode ainda estar incompleto quando este módulo inicializa.
 */
export const GEAR_PASSIVE_SLOTS = Object.freeze({
  armadura: [
    { slot: 1, kind: PASSIVE_KINDS.ATTR,         valueMin: 1, valueMax: 5, label: 'Atributo' },
    { slot: 2, kind: PASSIVE_KINDS.LIFE_MARKS,   valueMin: 1, valueMax: 5, label: 'Marcas de vida' },
    { slot: 3, kind: PASSIVE_KINDS.RUPTURA_USES, valueMin: 1, valueMax: 5, label: 'Usos de Ruptura' },
    { slot: 4, kind: PASSIVE_KINDS.ROLL_BONUS,   valueMin: 1, valueMax: 3, label: 'Bônus de rolagem' },
  ],
  arma: [
    { slot: 1, kind: PASSIVE_KINDS.ATTR,         valueMin: 1, valueMax: 5, label: 'Atributo' },
    { slot: 2, kind: PASSIVE_KINDS.RUPTURA_USES, valueMin: 1, valueMax: 5, label: 'Usos de Ruptura' },
    { slot: 3, kind: PASSIVE_KINDS.ROLL_BONUS,   valueMin: 1, valueMax: 3, label: 'Bônus de rolagem' },
  ],
})

// Lazy: ATTRIBUTES pode ser undefined no boot por ciclo attributes ↔ classes.
let attrKeysCache = null
let attrLabelCache = null

function allAttrKeys() {
  if (!attrKeysCache) {
    attrKeysCache = [
      ...ATTRIBUTES.map(a => a.key),
      ...SOCIAL_ATTRIBUTES.map(a => a.key),
    ]
  }
  return attrKeysCache
}

function attrLabel(key) {
  if (!attrLabelCache) {
    attrLabelCache = Object.fromEntries([
      ...ATTRIBUTES.map(a => [a.key, a.label]),
      ...SOCIAL_ATTRIBUTES.map(a => [a.key, a.label]),
    ])
  }
  return attrLabelCache[key]
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickAttrKey() {
  const keys = allAttrKeys()
  return keys[randInt(0, keys.length - 1)]
}

export function getPassiveSlotDef(category, slot) {
  return (GEAR_PASSIVE_SLOTS[category] || []).find(s => s.slot === slot) ?? null
}

export function getPassiveSlotsForCategory(category) {
  return GEAR_PASSIVE_SLOTS[category] || []
}

/** Rola uma passiva Metin do slot (não grava — a UI decide manter). */
export function rollPassive(category, slot) {
  const def = getPassiveSlotDef(category, slot)
  if (!def) return null
  const value = randInt(def.valueMin, def.valueMax)
  const needsAttr = def.kind === PASSIVE_KINDS.ATTR || def.kind === PASSIVE_KINDS.ROLL_BONUS
  return {
    slot: def.slot,
    kind: def.kind,
    attrKey: needsAttr ? pickAttrKey() : null,
    value,
  }
}

export function formatPassive(passive) {
  if (!passive) return 'slot vazio'
  const v = Number(passive.value) || 0
  switch (passive.kind) {
    case PASSIVE_KINDS.ATTR:
      return `+${v} ${attrLabel(passive.attrKey) || passive.attrKey || '?'}`
    case PASSIVE_KINDS.LIFE_MARKS:
      return `+${v} marcas de vida`
    case PASSIVE_KINDS.RUPTURA_USES:
      return `+${v} usos de Ruptura`
    case PASSIVE_KINDS.ROLL_BONUS:
      return `+${v} na rolagem de ${attrLabel(passive.attrKey) || passive.attrKey || '?'}`
    default:
      return `+${v}`
  }
}

function listPassivesFromItem(item) {
  return Array.isArray(item?.passives) ? item.passives.filter(Boolean) : []
}

function collectPassives(entity = {}) {
  const weapon = getCharacterWeapon(entity)
  const armor = getCharacterArmor(entity)
  return [
    ...listPassivesFromItem(weapon),
    ...listPassivesFromItem(armor),
  ]
}

/** Bônus flat de atributo (passiva kind attr). */
export function sumAttrBonus(entity = {}, attrKey) {
  if (!attrKey) return 0
  return collectPassives(entity).reduce((sum, p) => {
    if (p.kind !== PASSIVE_KINDS.ATTR || p.attrKey !== attrKey) return sum
    return sum + Math.max(0, Number(p.value) || 0)
  }, 0)
}

/** Bônus só na rolagem daquele atributo (kind roll_bonus). */
export function sumRollBonus(entity = {}, attrKey) {
  if (!attrKey) return 0
  return collectPassives(entity).reduce((sum, p) => {
    if (p.kind !== PASSIVE_KINDS.ROLL_BONUS || p.attrKey !== attrKey) return sum
    return sum + Math.max(0, Number(p.value) || 0)
  }, 0)
}

/** Total que entra na rolagem daquele atributo (attr flat + roll_bonus). */
export function sumGearRollBonus(entity = {}, attrKey) {
  return sumAttrBonus(entity, attrKey) + sumRollBonus(entity, attrKey)
}

/** +marcas de vida vindas só da passiva 2 da armadura. */
export function sumLifeMarksBonus(entity = {}) {
  const armor = getCharacterArmor(entity)
  return listPassivesFromItem(armor).reduce((sum, p) => {
    if (p.kind !== PASSIVE_KINDS.LIFE_MARKS) return sum
    return sum + Math.max(0, Number(p.value) || 0)
  }, 0)
}

/** Usos extras de Ruptura (arma P2 + armadura P3). */
export function sumRupturaUses(entity = {}) {
  return collectPassives(entity).reduce((sum, p) => {
    if (p.kind !== PASSIVE_KINDS.RUPTURA_USES) return sum
    return sum + Math.max(0, Number(p.value) || 0)
  }, 0)
}

export function getRupturaUsesMax(entity = {}) {
  return sumRupturaUses(entity)
}

export function getRupturaUsesSpent(entity = {}) {
  return Math.max(0, Number(entity.rupturaUsesSpent) || 0)
}

export function getRupturaUsesRemaining(entity = {}) {
  return Math.max(0, getRupturaUsesMax(entity) - getRupturaUsesSpent(entity))
}

/**
 * Lista passivas de um item alinhadas aos slots da categoria
 * (null = ainda não rolado).
 */
export function getItemPassivesAligned(category, item = null) {
  const slots = getPassiveSlotsForCategory(category)
  const list = listPassivesFromItem(item)
  return slots.map(def => {
    const found = list.find(p => Number(p.slot) === def.slot)
    return found || null
  })
}

/** Grava/atualiza uma passiva no array do item. */
export function upsertPassive(passives = [], rolled) {
  if (!rolled) return [...(passives || [])]
  const next = [...(passives || [])]
  const idx = next.findIndex(p => Number(p?.slot) === Number(rolled.slot))
  if (idx >= 0) next[idx] = rolled
  else next.push(rolled)
  return next.sort((a, b) => (a.slot || 0) - (b.slot || 0))
}
