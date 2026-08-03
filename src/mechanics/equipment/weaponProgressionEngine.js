/**
 * Arma pessoal — sem raridade.
 * Passivas Metin (3 slots) + skill custom no 4º slot: ver gearPassiveEngine.
 */

import { getItemPassivesAligned } from './gearPassiveEngine'
import { GEAR_CATEGORIES } from './characterGear'

/** Passivas Metin da arma alinhadas aos 3 slots (null = vazio). */
export function getWeaponPassives(entity = {}, weapon = null) {
  return getItemPassivesAligned(GEAR_CATEGORIES.WEAPON, weapon)
}

export function getWeaponSkill(weapon = null) {
  if (!weapon?.weaponSkill) return null
  const skill = weapon.weaponSkill
  if (!skill.name?.trim() && !skill.mechanicalEffect?.trim()) return null
  return skill
}
