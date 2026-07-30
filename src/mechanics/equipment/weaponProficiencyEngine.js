/**
 * Perícia de arma por classe.
 *
 * Cada classe tem tipos de arma com perícia. Usar outro tipo aplica −3
 * nas rolagens (falta de prática).
 *
 * A penalidade só vale se houver arma equipada com `type` definido.
 * Sem arma / sem tipo → sem penalidade.
 */
import {
  getClassWeaponTypes,
  getWeaponType,
  isWeaponProficientForClass,
  normalizeWeaponTypeId,
} from '../../constants/equipmentTypes'

export const WEAPON_PROFICIENCY_PENALTY = -3

/** Itens equipados que são armas com tipo reconhecido. */
export function getEquippedWeapons(entity = {}) {
  return (entity.equipped || []).filter(item => {
    if (item.category && item.category !== 'arma') return false
    return !!normalizeWeaponTypeId(item.type)
  }).map(item => ({
    ...item,
    type: normalizeWeaponTypeId(item.type),
  }))
}

/** `true` se a entidade tem ao menos uma arma fora da perícia da classe. */
export function hasNonProficientWeapon(entity = {}) {
  const classId = entity.classId
  if (!classId) return false
  const weapons = getEquippedWeapons(entity)
  if (weapons.length === 0) return false
  return weapons.some(w => !isWeaponProficientForClass(classId, w.type))
}

/**
 * Penalidade de perícia (−3 ou 0).
 * Sem classe ou sem arma tipada → 0.
 */
export function getWeaponProficiencyPenalty(entity = {}) {
  return hasNonProficientWeapon(entity) ? WEAPON_PROFICIENCY_PENALTY : 0
}

/** Resumo para UI (tipos permitidos, armas fora, etc.). */
export function getWeaponProficiencySummary(entity = {}) {
  const classId = entity.classId ?? null
  const allowed = getClassWeaponTypes(classId)
  const weapons = getEquippedWeapons(entity)
  const offenders = weapons.filter(w => !isWeaponProficientForClass(classId, w.type))
  const penalty = offenders.length > 0 ? WEAPON_PROFICIENCY_PENALTY : 0

  return {
    classId,
    allowedTypes: allowed,
    allowedLabels: allowed.map(id => getWeaponType(id)?.label ?? id),
    equippedWeapons: weapons,
    offenders,
    penalty,
    hasPenalty: penalty !== 0,
  }
}
