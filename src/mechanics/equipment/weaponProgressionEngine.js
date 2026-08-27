/**
 * Arma pessoal — sem raridade (raridade é só da armadura).
 * Atributos de item (3 slots) + skill custom no 4º slot: ver gearPassiveEngine.
 */

import { getItemPassivesAligned } from './gearPassiveEngine'
import { GEAR_CATEGORIES } from './characterGear'

/** Atributos de item da arma alinhados aos 3 slots (null = vazio). */
export function getWeaponPassives(_entity = {}, weapon = null) {
  return getItemPassivesAligned(GEAR_CATEGORIES.WEAPON, weapon)
}

export function getWeaponSkill(weapon = null) {
  if (!weapon?.weaponSkill) return null
  const skill = weapon.weaponSkill
  if (!skill.name?.trim() && !skill.mechanicalEffect?.trim()) return null
  return skill
}
