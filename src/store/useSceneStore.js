import { create } from 'zustand'
import { storage, KEYS } from '../services/storage'

const load = () => storage.get(KEYS.sceneSession) || {
  globalNotes: '',
  turn: 0,
  campaignId: null,
  sceneGroupId: null,
}

export const useSceneStore = create((set, get) => ({
  globalNotes: load().globalNotes ?? '',
  turn: load().turn ?? 0,
  campaignId: load().campaignId ?? null,
  sceneGroupId: load().sceneGroupId ?? null,

  persist() {
    const { globalNotes, turn, campaignId, sceneGroupId } = get()
    storage.set(KEYS.sceneSession, { globalNotes, turn, campaignId, sceneGroupId })
  },

  setCampaign(campaignId) {
    const current = get()
    if (current.campaignId !== campaignId) {
      set({ campaignId, globalNotes: '', turn: 0, sceneGroupId: null })
    } else {
      set({ campaignId })
    }
    get().persist()
  },

  setSceneGroup(groupId) {
    set({ sceneGroupId: groupId || null })
    get().persist()
  },

  setGlobalNotes(notes) {
    set({ globalNotes: notes })
    get().persist()
  },

  setTurn(turn) {
    set({ turn: Math.max(0, Number(turn) || 0) })
    get().persist()
  },

  incrementTurn() {
    set({ turn: get().turn + 1 })
    get().persist()
  },
}))
