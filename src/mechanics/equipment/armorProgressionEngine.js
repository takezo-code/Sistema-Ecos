/**
 * Progressão da armadura pessoal.
 *
 * Raridade espelha o nível do personagem. Cada degrau acima de comum
 * concede +1 marca de vida (cumulativo):
 *   comum 0 · incomum +1 · raro +2 · lendário +3
 *
 * Passivas Metin da armadura são sempre 4 slots — ver gearPassiveEngine.
 */

import { getRarityMeta } from '../../constants/equipmentTypes'
import { MAX_LEVEL } from '../../constants/progression'

export const ARMOR_RARITY_TIERS = [
  { min: 1,  max: 5,  rarity: 'comum',    lifeMarks: 0 },
  { min: 6,  max: 10, rarity: 'incomum',  lifeMarks: 1 },
  { min: 11, max: 15, rarity: 'raro',     lifeMarks: 2 },
  { min: 16, max: 20, rarity: 'lendario', lifeMarks: 3 },
]

export function getArmorLevel(entity = {}) {
  const level = Math.floor(Number(entity?.level) || 1)
  return Math.min(Math.max(level, 1), MAX_LEVEL)
}

export function getArmorTierForLevel(level) {
  const n = Math.min(Math.max(Math.floor(Number(level) || 1), 1), MAX_LEVEL)
  return ARMOR_RARITY_TIERS.find(t => n >= t.min && n <= t.max)
    ?? ARMOR_RARITY_TIERS[ARMOR_RARITY_TIERS.length - 1]
}

export function getArmorTier(entity = {}) {
  const level = getArmorLevel(entity)
  const tier = getArmorTierForLevel(level)
  const meta = getRarityMeta(tier.rarity)
  return {
    ...tier,
    level,
    label: meta.label,
    color: meta.color,
  }
}

export function getArmorRarityLifeMarks(entity = {}) {
  return getArmorTier(entity).lifeMarks
}

export function getLevelsToNextArmorTier(entity = {}) {
  const level = getArmorLevel(entity)
  const index = ARMOR_RARITY_TIERS.findIndex(t => level >= t.min && level <= t.max)
  const next = ARMOR_RARITY_TIERS[index + 1]
  if (!next) return null
  return {
    levels: next.min - level,
    rarity: next.rarity,
    label: getRarityMeta(next.rarity).label,
    color: getRarityMeta(next.rarity).color,
    atLevel: next.min,
    lifeMarks: next.lifeMarks,
  }
}
