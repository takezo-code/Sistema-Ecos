import { create } from 'zustand'
import { storage, KEYS } from '../services/storage'
import { genId } from '../utils/id'
import {
  getPassiveSlotsForRarity,
  normalizeWeaponTypeId,
  getArmorType,
} from '../constants/equipmentTypes'

const load = () => storage.get(KEYS.equipment) || []

const persist = (items) => storage.set(KEYS.equipment, items)

function normalizeEquipmentItem(data = {}) {
  const category = data.category === 'armadura' ? 'armadura' : 'arma'
  const rarity = data.rarity || 'comum'
  const type = category === 'arma'
    ? (normalizeWeaponTypeId(data.type) || data.type)
    : data.type

  const base = {
    id: data.id || genId(),
    campaignId: data.campaignId || null,
    category,
    type,
    name: data.name || 'Novo Equipamento',
    image: data.image || '',
    description: data.description || '',
    rarity,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  }

  if (category === 'arma') {
    const slots = getPassiveSlotsForRarity(rarity)
    const passives = Array.isArray(data.passives) ? data.passives.slice(0, slots) : []
    return {
      ...base,
      // Armas: só passivas (slots pela raridade). Sem skills / ATK / RESIST.
      passives,
      passiveSlots: slots,
    }
  }

  return {
    ...base,
    penaltyDestreza: data.penaltyDestreza ?? getArmorType(type)?.penaltyDestreza ?? 0,
    markBonus: data.markBonus ?? getArmorType(type)?.markBonus ?? 0,
  }
}

export const useEquipmentStore = create((set, get) => ({
  items: load().map(normalizeEquipmentItem),

  /** Adiciona novo equipamento */
  addItem(data) {
    const item = normalizeEquipmentItem({
      ...data,
      id: genId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    const items = [...get().items, item]
    persist(items)
    set({ items })
    return item
  },

  /** Atualiza um equipamento */
  updateItem(id, data) {
    const items = get().items.map(item => {
      if (item.id !== id) return item
      return normalizeEquipmentItem({
        ...item,
        ...data,
        id: item.id,
        createdAt: item.createdAt,
        updatedAt: new Date().toISOString(),
      })
    })
    persist(items)
    set({ items })
    return items.find(i => i.id === id)
  },

  /** Remove um equipamento */
  removeItem(id) {
    const items = get().items.filter(i => i.id !== id)
    persist(items)
    set({ items })
  },

  /** Equipamentos filtrados por campanha */
  getByCampaign(campaignId) {
    return get().items.filter(i => !i.campaignId || i.campaignId === campaignId)
  },
}))
