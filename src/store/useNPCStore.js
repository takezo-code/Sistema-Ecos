import { create } from 'zustand'
import { storage, KEYS } from '../services/storage'
import { genId } from '../utils/id'
import { normalizeGameEntity, STARTING_ATTRIBUTE_POINTS, defaultAttributes } from '../constants/attributes'

const load = () => (storage.get(KEYS.npcs) || []).map(normalizeGameEntity)

const persist = (npcs) => storage.set(KEYS.npcs, npcs)

export const useNPCStore = create((set, get) => ({
  npcs: load(),

  getNPCsByCampaign(campaignId) {
    return get().npcs.filter(n => n.campaignId === campaignId)
  },

  addNPC(data) {
    const npc = normalizeGameEntity({
      id: genId(),
      campaignId: data.campaignId || null,
      name: data.name || 'Novo NPC',
      image: data.image || '',
      description: data.description || '',
      motivation: data.motivation || '',
      secret: data.secret || '',
      organization: data.organization || '',
      status: data.status || 'vivo',
      level: data.level ?? 1,
      xp: data.xp ?? 0,
      xpToNextLevel: data.xpToNextLevel ?? null,
      attributes: data.attributes || defaultAttributes(),
      unspentAttributePoints: data.unspentAttributePoints ?? STARTING_ATTRIBUTE_POINTS,
      physicalState: data.physicalState || 'bem',
      mentalState: data.mentalState || 'estavel',
      inventory: data.inventory || [],
      equipped: data.equipped || [],
      backpackCapacity: data.backpackCapacity ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    const npcs = [...get().npcs, npc]
    persist(npcs)
    set({ npcs })
    return npc
  },

  updateNPC(id, data) {
    const npcs = get().npcs.map(n =>
      n.id === id ? normalizeGameEntity({ ...n, ...data, updatedAt: new Date().toISOString() }) : n
    )
    persist(npcs)
    set({ npcs })
  },

  deleteNPC(id) {
    const npcs = get().npcs.filter(n => n.id !== id)
    persist(npcs)
    set({ npcs })
  },

  addInventoryItem(npcId, item) {
    const name = typeof item === 'string' ? item : item.name
    const qty = typeof item === 'string' ? 1 : (item.qty || 1)
    const npcs = get().npcs.map(n => {
      if (n.id !== npcId) return n
      const cap = n.backpackCapacity
      if (cap != null && n.inventory.length >= cap) return n
      return normalizeGameEntity({
        ...n,
        inventory: [...n.inventory, { id: genId(), name, qty }],
        updatedAt: new Date().toISOString(),
      })
    })
    persist(npcs)
    set({ npcs })
  },

  updateInventoryItem(npcId, itemId, data) {
    const npcs = get().npcs.map(n => {
      if (n.id !== npcId) return n
      return normalizeGameEntity({
        ...n,
        inventory: n.inventory.map(i => i.id === itemId ? { ...i, ...data } : i),
        updatedAt: new Date().toISOString(),
      })
    })
    persist(npcs)
    set({ npcs })
  },

  removeInventoryItem(npcId, itemId) {
    const npcs = get().npcs.map(n => {
      if (n.id !== npcId) return n
      return normalizeGameEntity({
        ...n,
        inventory: n.inventory.filter(i => i.id !== itemId),
        updatedAt: new Date().toISOString(),
      })
    })
    persist(npcs)
    set({ npcs })
  },

  addEquippedItem(npcId, item) {
    const name = typeof item === 'string' ? item : item.name
    const npcs = get().npcs.map(n => {
      if (n.id !== npcId) return n
      return normalizeGameEntity({
        ...n,
        equipped: [...n.equipped, { id: genId(), name, slot: item.slot || '' }],
        updatedAt: new Date().toISOString(),
      })
    })
    persist(npcs)
    set({ npcs })
  },

  removeEquippedItem(npcId, itemId) {
    const npcs = get().npcs.map(n => {
      if (n.id !== npcId) return n
      return normalizeGameEntity({
        ...n,
        equipped: n.equipped.filter(i => i.id !== itemId),
        updatedAt: new Date().toISOString(),
      })
    })
    persist(npcs)
    set({ npcs })
  },
}))
