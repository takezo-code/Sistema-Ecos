import { create } from 'zustand'
import { storage, KEYS } from '../services/storage'
import { genId } from '../utils/id'
import { archiveEntity, TRASH_TYPES } from '../services/trashService'
import { resolveCampaignId } from '../services/campaignScopeService'

const load = () => storage.get(KEYS.groups) || []

export const useGroupStore = create((set, get) => ({
  groups: load(),

  getGroupsByCampaign(campaignId) {
    return get().groups.filter(g => g.campaignId === campaignId)
  },

  getGroupForCampaign(campaignId) {
    return get().groups.find(g => g.campaignId === campaignId) || null
  },

  addGroup(data) {
    let campaignId
    try {
      campaignId = resolveCampaignId(data.campaignId)
    } catch {
      return null
    }
    if (get().groups.some(g => g.campaignId === campaignId)) {
      return null
    }
    const group = {
      id: genId(),
      campaignId,
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
    const group = get().groups.find(g => g.id === id)
    if (!group) return
    archiveEntity(TRASH_TYPES.group, group)
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
