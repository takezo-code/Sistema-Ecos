/**
 * Efeitos de armadura equipada.
 *
 * Tipo:
 *   Leve  → −1 DES · +1 limiar de marcas
 *   Média → −2 DES · +2 limiar de marcas
 *   Pesada→ −3 DES · +3 limiar de marcas
 *
 * Raridade (nível do personagem): +0/+1/+2/+3 marcas de vida.
 * Atributo de item life_marks: +1–5 marcas de vida.
 */
import { getArmorType } from '../../constants/equipmentTypes'
import { getCharacterArmor } from './characterGear'
import { getArmorRarityLifeMarks } from './armorProgressionEngine'
import { sumLifeMarksBonus } from './gearPassiveEngine'

/** Armadura ativa — mesma resolução da ficha / card de combate. */
export function getEquippedArmor(entity = {}) {
  const armor = getCharacterArmor(entity)
  return armor ? [armor] : []
}

/**
 * Efeitos da armadura ativa.
 * Se houver várias, usa a de maior proteção (maior markBonus de tipo).
 */
export function getArmorEffects(entity = {}) {
  const armors = getEquippedArmor(entity)
  if (armors.length === 0) {
    return {
      penaltyDestreza: 0,
      markBonus: 0,
      typeMarkBonus: 0,
      rarityMarkBonus: 0,
      passiveMarkBonus: 0,
      armor: null,
      typeMeta: null,
    }
  }

  let best = null
  let bestMeta = null
  let bestScore = -1

  for (const item of armors) {
    const meta = getArmorType(item.type)
    if (!meta) continue
    const typeMarkBonus = Math.max(0, Number(item.markBonus ?? meta.markBonus) || 0)
    const penaltyDestreza = Math.max(0, Number(item.penaltyDestreza ?? meta.penaltyDestreza) || 0)
    const score = typeMarkBonus * 10 + penaltyDestreza
    if (score > bestScore) {
      bestScore = score
      best = { ...item, typeMarkBonus, penaltyDestreza }
      bestMeta = meta
    }
  }

  if (!best) {
    return {
      penaltyDestreza: 0,
      markBonus: 0,
      typeMarkBonus: 0,
      rarityMarkBonus: 0,
      passiveMarkBonus: 0,
      armor: null,
      typeMeta: null,
    }
  }

  const rarityMarkBonus = getArmorRarityLifeMarks(entity)
  const passiveMarkBonus = sumLifeMarksBonus(entity)
  const markBonus = best.typeMarkBonus + rarityMarkBonus + passiveMarkBonus

  return {
    penaltyDestreza: best.penaltyDestreza,
    markBonus,
    typeMarkBonus: best.typeMarkBonus,
    rarityMarkBonus,
    passiveMarkBonus,
    armor: best,
    typeMeta: bestMeta,
  }
}

export function getArmorDestrezaPenalty(entity = {}) {
  return getArmorEffects(entity).penaltyDestreza
}

export function getArmorMarkBonus(entity = {}) {
  return getArmorEffects(entity).markBonus
}
