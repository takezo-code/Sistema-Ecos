import { create } from 'zustand'
import { storage, KEYS } from '../services/storage'
import { genId } from '../utils/id'

const load = () => storage.get(KEYS.equipment) || []

const persist = (items) => storage.set(KEYS.equipment, items)

export const useEquipmentStore = create((set, get) => ({
  items: load(),

  /** Adiciona novo equipamento */
  addItem(data) {
    const item = {
      id: genId(),
      campaignId: data.campaignId || null,
      category: data.category,       // 'arma' | 'armadura'
      type: data.type,               // weapon/armor type id
      name: data.name || 'Novo Equipamento',
      description: data.description || '',
      rarity: data.rarity || 'comum',
      bonusAtaque: data.bonusAtaque ?? 0,
      bonusResistencia: data.bonusResistencia ?? 0,
      bonusAtributo: data.bonusAtributo || null,   // { key: 'forca', value: 1 }
      penaltyDestreza: data.penaltyDestreza ?? 0,
      skillsGranted: data.skillsGranted || [],     // array de templateIds
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const items = [...get().items, item]
    persist(items)
    set({ items })
    return item
  },

  /** Atualiza um equipamento */
  updateItem(id, data) {
    const items = get().items.map(item =>
      item.id !== id
        ? item
        : { ...item, ...data, updatedAt: new Date().toISOString() }
    )
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
