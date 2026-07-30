/**
 * Efeitos de armadura equipada.
 *
 * Leve  → −1 DES · +1 limiar de marcas
 * Média → −2 DES · +2 limiar de marcas
 * Pesada→ −3 DES · +3 limiar de marcas
 *
 * O +marca soma ao buffer de Vitalidade (atraso de Ferido/Grave/etc.).
 */
import { getArmorType } from '../../constants/equipmentTypes'

/** Itens equipados reconhecidos como armadura. */
export function getEquippedArmor(entity = {}) {
  return (entity.equipped || []).filter(item => {
    if (item.category === 'arma') return false
    if (item.category === 'armadura') return true
    return !!getArmorType(item.type)
  })
}

/**
 * Efeitos da armadura ativa.
 * Se houver várias, usa a de maior proteção (maior markBonus).
 */
export function getArmorEffects(entity = {}) {
  const armors = getEquippedArmor(entity)
  if (armors.length === 0) {
    return { penaltyDestreza: 0, markBonus: 0, armor: null, typeMeta: null }
  }

  let best = null
  let bestMeta = null
  let bestScore = -1

  for (const item of armors) {
    const meta = getArmorType(item.type)
    if (!meta) continue
    const markBonus = Math.max(0, Number(item.markBonus ?? meta.markBonus) || 0)
    const penaltyDestreza = Math.max(0, Number(item.penaltyDestreza ?? meta.penaltyDestreza) || 0)
    const score = markBonus * 10 + penaltyDestreza
    if (score > bestScore) {
      bestScore = score
      best = { ...item, markBonus, penaltyDestreza }
      bestMeta = meta
    }
  }

  if (!best) {
    return { penaltyDestreza: 0, markBonus: 0, armor: null, typeMeta: null }
  }

  return {
    penaltyDestreza: best.penaltyDestreza,
    markBonus: best.markBonus,
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
