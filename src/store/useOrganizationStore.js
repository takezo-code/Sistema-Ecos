import { create } from 'zustand'
import { storage, KEYS } from '../services/storage'
import { genId } from '../utils/id'

const load = () => storage.get(KEYS.organizations) || []

export const useOrganizationStore = create((set, get) => ({
  organizations: load(),

  addOrganization(data) {
    const org = {
      id: genId(),
      campaignId: data.campaignId || null,
      name: data.name || 'Nova Organização',
      image: data.image || '',
      symbol: data.symbol || '',
      description: data.description || '',
      ideology: data.ideology || '',
      allies: data.allies || '',
      enemies: data.enemies || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const organizations = [...get().organizations, org]
    storage.set(KEYS.organizations, organizations)
    set({ organizations })
    return org
  },

  updateOrganization(id, data) {
    const organizations = get().organizations.map(o =>
      o.id === id ? { ...o, ...data, updatedAt: new Date().toISOString() } : o
    )
    storage.set(KEYS.organizations, organizations)
    set({ organizations })
  },

  deleteOrganization(id) {
    const organizations = get().organizations.filter(o => o.id !== id)
    storage.set(KEYS.organizations, organizations)
    set({ organizations })
  },

  getOrgsByCampaign(campaignId) {
    return get().organizations.filter(o => o.campaignId === campaignId)
  },
}))
