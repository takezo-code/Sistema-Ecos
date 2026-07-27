import { create } from 'zustand'
import { storage, KEYS } from '../services/storage'
import { genId } from '../utils/id'
import { archiveEntity, TRASH_TYPES } from '../services/trashService'

const load = () => storage.get(KEYS.campaigns) || []
const loadActive = () => storage.get(KEYS.activeCampaign) || null

export const useCampaignStore = create((set, get) => ({
  campaigns: load(),
  activeCampaignId: loadActive(),

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
      images: Array.isArray(data.images)
        ? data.images.filter(img => img?.src).map(img => ({
            id: img.id || genId(),
            src: img.src,
            caption: img.caption || '',
          }))
        : [],
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
    const campaign = get().campaigns.find(c => c.id === id)
    if (!campaign) return
    archiveEntity(TRASH_TYPES.campaign, campaign)
  },

  setActiveCampaign(id) {
    storage.set(KEYS.activeCampaign, id)
    set({ activeCampaignId: id })
  },
}))
