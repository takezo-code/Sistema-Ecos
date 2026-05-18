import { create } from 'zustand'
import { storage, KEYS } from '../services/storage'
import { genId } from '../utils/id'

const load = () => storage.get(KEYS.campaigns) || []
const loadActive = () => storage.get(KEYS.activeCampaign) || null

export const useCampaignStore = create((set, get) => ({
  campaigns: load(),
  activeCampaignId: loadActive(),

  get activeCampaign() {
    return get().campaigns.find(c => c.id === get().activeCampaignId) || null
  },

  addCampaign(data) {
    const campaign = {
      id: genId(),
      name: data.name || 'Nova Campanha',
      description: data.description || '',
      timeline: {
        past: data.timeline?.past || '',
        present: data.timeline?.present || '',
        future: data.timeline?.future || '',
      },
      status: data.status || 'ativa',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const campaigns = [...get().campaigns, campaign]
    storage.set(KEYS.campaigns, campaigns)
    set({ campaigns })
    return campaign
  },

  updateCampaign(id, data) {
    const campaigns = get().campaigns.map(c =>
      c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
    )
    storage.set(KEYS.campaigns, campaigns)
    set({ campaigns })
  },

  deleteCampaign(id) {
    const campaigns = get().campaigns.filter(c => c.id !== id)
    storage.set(KEYS.campaigns, campaigns)
    const newActive = get().activeCampaignId === id ? null : get().activeCampaignId
    storage.set(KEYS.activeCampaign, newActive)
    set({ campaigns, activeCampaignId: newActive })
  },

  setActiveCampaign(id) {
    storage.set(KEYS.activeCampaign, id)
    set({ activeCampaignId: id })
  },
}))
