/**
 * Equipamento pessoal do personagem.
 *
 * Não existe catálogo nem loot de arma/armadura: cada personagem forja a sua
 * na criação e evolui a mesma peça pela campanha inteira. Por isso `equipped[]`
 * guarda no máximo duas peças — uma arma e uma armadura.
 */

import {
  ARMOR_TYPES,
  WEAPON_TYPES,
  getArmorType,
  getClassWeaponTypes,
  getWeaponType,
  normalizeWeaponTypeId,
} from '../../constants/equipmentTypes'
import { genId } from '../../utils/id'

export const GEAR_CATEGORIES = Object.freeze({
  WEAPON: 'arma',
  ARMOR: 'armadura',
})

/** Slots do paper-doll: só arma e armadura. */
export const GEAR_SLOTS = [
  { id: 'arma',     label: 'Arma',     category: GEAR_CATEGORIES.WEAPON },
  { id: 'armadura', label: 'Armadura', category: GEAR_CATEGORIES.ARMOR },
]

function isArmorEntry(item) {
  if (!item) return false
  if (item.category === GEAR_CATEGORIES.ARMOR) return true
  if (item.category === GEAR_CATEGORIES.WEAPON) return false
  return !!getArmorType(item.type) && !getWeaponType(item.type)
}

/**
 * Garante category/name/passives em cada peça.
 * Não remove itens extras — a resolução de slot prefere category explícita.
 * Evita importar getArmorType aqui (ciclo attributes ↔ classes ↔ equipmentTypes).
 */
export function normalizeEquippedGear(equipped = []) {
  if (!Array.isArray(equipped)) return []
  const ARMOR_TYPES_IDS = new Set(['leve', 'media', 'pesada'])
  return equipped
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      let category = item.category
      if (category !== GEAR_CATEGORIES.WEAPON && category !== GEAR_CATEGORIES.ARMOR) {
        if (
          item.slot === 'armadura'
          || ARMOR_TYPES_IDS.has(item.type)
        ) {
          category = GEAR_CATEGORIES.ARMOR
        } else {
          category = GEAR_CATEGORIES.WEAPON
        }
      }
      const name = (item.name || '').trim()
        || (category === GEAR_CATEGORIES.ARMOR ? 'Armadura' : 'Arma')
      return {
        ...item,
        id: item.id || genId(),
        category,
        name,
        passives: Array.isArray(item.passives) ? item.passives : [],
      }
    })
    .filter(Boolean)
}

export function getCharacterWeapon(entity = {}) {
  const list = entity.equipped || []
  return list.find(i => i?.category === GEAR_CATEGORIES.WEAPON)
    ?? list.find(i => i && !isArmorEntry(i))
    ?? null
}

export function getCharacterArmor(entity = {}) {
  const list = entity.equipped || []
  return list.find(i => i?.category === GEAR_CATEGORIES.ARMOR)
    ?? list.find(isArmorEntry)
    ?? null
}

export function getGearItem(entity, category) {
  return category === GEAR_CATEGORIES.ARMOR
    ? getCharacterArmor(entity)
    : getCharacterWeapon(entity)
}

export function hasFullGear(entity = {}) {
  return !!getCharacterWeapon(entity) && !!getCharacterArmor(entity)
}

/** Tipos de arma (legado / flavor). Forja livre não depende disso. */
export function getForgeableWeaponTypes(classId) {
  const allowed = getClassWeaponTypes(classId)
  if (!allowed.length) return WEAPON_TYPES
  return WEAPON_TYPES.filter(t => allowed.includes(t.id))
}

export function getForgeableArmorTypes() {
  return ARMOR_TYPES
}

/** Rótulo livre da arma: `kind` custom ou tipo legado. */
export function getWeaponKindLabel(weapon) {
  if (!weapon) return null
  const kind = (weapon.kind || '').trim()
  if (kind) return kind
  return getWeaponType(weapon.type)?.label ?? null
}

/** Monta a peça a ser guardada em `equipped[]`. */
export function buildGearItem(category, data = {}) {
  const isArmor = category === GEAR_CATEGORIES.ARMOR
  const type = isArmor
    ? (getArmorType(data.type)?.id ?? ARMOR_TYPES[0].id)
    : (normalizeWeaponTypeId(data.type) ?? null)
  const typeLabel = isArmor ? getArmorType(type)?.label : getWeaponType(type)?.label
  const kind = isArmor ? '' : ((data.kind || '').trim() || typeLabel || '')

  const base = {
    name: (data.name || '').trim() || kind || typeLabel || (isArmor ? 'Armadura' : 'Arma'),
    category: isArmor ? GEAR_CATEGORIES.ARMOR : GEAR_CATEGORIES.WEAPON,
    type,
    image: data.image || '',
    description: data.description || '',
    passives: Array.isArray(data.passives) ? data.passives : [],
  }

  if (isArmor) return base
  return {
    ...base,
    kind,
    weaponSkill: data.weaponSkill && typeof data.weaponSkill === 'object'
      ? {
          name: data.weaponSkill.name || '',
          description: data.weaponSkill.description || '',
          mechanicalEffect: data.weaponSkill.mechanicalEffect || '',
          narrativeConsequence: data.weaponSkill.narrativeConsequence || '',
          cooldownTurns: Number(data.weaponSkill.cooldownTurns) || 2,
          overloadCost: Number(data.weaponSkill.overloadCost) || 1,
        }
      : null,
  }
}

/** Equipamento inicial montado na criação do personagem. */
export function buildInitialGear({ weapon, armor } = {}) {
  const gear = []
  if (weapon?.name?.trim() || (weapon?.kind || '').trim() || normalizeWeaponTypeId(weapon?.type)) {
    gear.push({ id: genId(), ...buildGearItem(GEAR_CATEGORIES.WEAPON, weapon) })
  }
  if (armor?.name?.trim() || getArmorType(armor?.type)) {
    gear.push({ id: genId(), ...buildGearItem(GEAR_CATEGORIES.ARMOR, armor) })
  }
  return gear
}
