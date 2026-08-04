/**
 * Tipos de arma sugeridos por classe (preferência de forja / flavor).
 * Não há mais penalidade por usar arma fora da lista.
 */
import {
  getClassWeaponTypes,
  getWeaponType,
  isWeaponProficientForClass,
  normalizeWeaponTypeId,
} from '../../constants/equipmentTypes'

/** @deprecated Sem penalidade — mantido por compat. */
export const WEAPON_PROFICIENCY_PENALTY = 0

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

/** @deprecated Sempre false — não há mais punição por perícia. */
export function hasNonProficientWeapon() {
  return false
}

/** Sempre 0 — perícia de arma não aplica penalidade. */
export function getWeaponProficiencyPenalty() {
  return 0
}

/** Resumo para UI (tipos sugeridos da classe). */
export function getWeaponProficiencySummary(entity = {}) {
  const classId = entity.classId ?? null
  const allowed = getClassWeaponTypes(classId)
  const weapons = getEquippedWeapons(entity)

  return {
    classId,
    allowedTypes: allowed,
    allowedLabels: allowed.map(id => getWeaponType(id)?.label ?? id),
    equippedWeapons: weapons,
    offenders: [],
    penalty: 0,
    hasPenalty: false,
  }
}

export { isWeaponProficientForClass }
