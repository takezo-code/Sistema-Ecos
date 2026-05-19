import { create } from 'zustand'
import { storage, KEYS } from '../services/storage'

const load = () => storage.get(KEYS.combatSession) || {
  globalNotes: '',
  turn: 0,
  campaignId: null,
  combatGroupId: null,
}

export const useCombatStore = create((set, get) => ({
  globalNotes: load().globalNotes ?? '',
  turn: load().turn ?? 0,
  campaignId: load().campaignId ?? null,
  combatGroupId: load().combatGroupId ?? null,
  lastRoll: null,

  persist() {
    const { globalNotes, turn, campaignId, combatGroupId } = get()
    storage.set(KEYS.combatSession, { globalNotes, turn, campaignId, combatGroupId })
  },

  setCampaign(campaignId) {
    const current = get()
    if (current.campaignId !== campaignId) {
      set({ campaignId, globalNotes: '', turn: 0, combatGroupId: null })
    } else {
      set({ campaignId })
    }
    get().persist()
  },

  setCombatGroup(groupId) {
    set({ combatGroupId: groupId || null })
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

  setLastRoll(roll) {
    set({ lastRoll: roll })
  },
}))
