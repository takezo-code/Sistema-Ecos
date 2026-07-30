/**
 * Itens do mercador (consumíveis / especiais).
 */
export const MERCHANT_ITEM_IDS = Object.freeze({
  CATALISADOR_GRAU: 'catalisador_grau',
})

export const MERCHANT_CATALOG = [
  {
    id: MERCHANT_ITEM_IDS.CATALISADOR_GRAU,
    name: 'Catalisador de Grau',
    description:
      'Eleva uma skill de classe ao grau máximo (nível 5). Necessário após investir 4 Ecos na skill — não usa Eco.',
    effect: 'skill_grade_up',
    color: '#a855f7',
    priceLabel: 'Narrativo / mesa',
  },
]

export function getMerchantItem(itemId) {
  return MERCHANT_CATALOG.find(i => i.id === itemId) || null
}

export function isGradeCatalystItem(item) {
  if (!item) return false
  if (item.itemId === MERCHANT_ITEM_IDS.CATALISADOR_GRAU) return true
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

export function buildMerchantInventoryItem(itemId, qty = 1) {
  const def = getMerchantItem(itemId)
  if (!def) return null
  return {
    itemId: def.id,
    name: def.name,
    effect: def.effect,
    qty: Math.max(1, Number(qty) || 1),
  }
}
