/**
 * Itens especiais de inventário (consumíveis de progressão).
 * O catalisador de grau sobe skills de classe ao nível 5.
 */
export const SPECIAL_ITEM_IDS = Object.freeze({
  CATALISADOR_GRAU: 'catalisador_grau',
})

/** @deprecated use SPECIAL_ITEM_IDS */
export const MERCHANT_ITEM_IDS = SPECIAL_ITEM_IDS

export function isGradeCatalystItem(item) {
  if (!item) return false
  if (item.itemId === SPECIAL_ITEM_IDS.CATALISADOR_GRAU) return true
  if (item.effect === 'skill_grade_up') return true
  const name = String(item.name || '').toLowerCase()
  return name.includes('catalisador') && name.includes('grau')
}

/** Inventário: encontra um catalisador (qualquer stack). */
export function findGradeCatalyst(inventory = []) {
  return (inventory || []).find(i => isGradeCatalystItem(i) && (i.qty == null || i.qty > 0)) || null
}

export function countGradeCatalysts(inventory = []) {
  return (inventory || []).reduce((sum, i) => {
    if (!isGradeCatalystItem(i)) return sum
    return sum + Math.max(1, Number(i.qty) || 1)
  }, 0)
}

/** Consome 1 catalisador; devolve novo array de inventário. */
export function consumeGradeCatalyst(inventory = []) {
  const list = [...(inventory || [])]
  const idx = list.findIndex(i => isGradeCatalystItem(i) && (i.qty == null || i.qty > 0))
  if (idx === -1) return { ok: false, inventory: list }

  const item = list[idx]
  const qty = Math.max(1, Number(item.qty) || 1)
  if (qty <= 1) {
    list.splice(idx, 1)
  } else {
    list[idx] = { ...item, qty: qty - 1 }
  }
  return { ok: true, inventory: list }
}
