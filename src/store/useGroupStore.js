import { create } from 'zustand'
import { storage, KEYS } from '../services/storage'
import { genId } from '../utils/id'

const load = () => storage.get(KEYS.groups) || []

export const useGroupStore = create((set, get) => ({
  groups: load(),

  getGroupsByCampaign(campaignId) {
    return get().groups.filter(g => g.campaignId === campaignId)
  },

  addGroup(data) {
    const group = {
      id: genId(),
      campaignId: data.campaignId || null,
      name: data.name || 'Novo Grupo',
      description: data.description || '',
      memberIds: data.memberIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const groups = [...get().groups, group]
    storage.set(KEYS.groups, groups)
    set({ groups })
    return group
  },

  updateGroup(id, data) {
    const groups = get().groups.map(g =>
      g.id === id ? { ...g, ...data, updatedAt: new Date().toISOString() } : g
    )
    storage.set(KEYS.groups, groups)
    set({ groups })
  },

  deleteGroup(id) {
    const groups = get().groups.filter(g => g.id !== id)
    storage.set(KEYS.groups, groups)
    set({ groups })
  },

  addMember(groupId, characterId) {
    const groups = get().groups.map(g => {
      if (g.id !== groupId || g.memberIds.includes(characterId)) return g
      return {
        ...g,
        memberIds: [...g.memberIds, characterId],
        updatedAt: new Date().toISOString(),
      }
    })
    storage.set(KEYS.groups, groups)
    set({ groups })
  },

  removeMember(groupId, characterId) {
    const groups = get().groups.map(g => {
      if (g.id !== groupId) return g
      return {
        ...g,
        memberIds: g.memberIds.filter(id => id !== characterId),
        updatedAt: new Date().toISOString(),
      }
    })
    storage.set(KEYS.groups, groups)
    set({ groups })
  },
}))
