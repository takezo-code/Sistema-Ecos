import { create } from 'zustand'
import { storage, KEYS } from '../services/storage'
import { genId } from '../utils/id'

const load = () => {
  const saved = storage.get(KEYS.combatSession) || {}
  return {
    campaignId: null,
    combatGroupId: null,
    activeEnemyId: null,
    rollHistory: [],
    ...saved,
  }
}

export const useCombatStore = create((set, get) => ({
  campaignId: load().campaignId ?? null,
  combatGroupId: load().combatGroupId ?? null,
  activeEnemyId: load().activeEnemyId ?? null,
  rollHistory: load().rollHistory ?? [],
  lastRoll: null,

  persist() {
    const { campaignId, combatGroupId, activeEnemyId, rollHistory } = get()
    storage.set(KEYS.combatSession, {
      campaignId,
      combatGroupId,
      activeEnemyId,
      rollHistory,
    })
  },

  setCampaign(campaignId) {
    const current = get()
    if (current.campaignId !== campaignId) {
      set({
        campaignId,
        combatGroupId: null,
        activeEnemyId: null,
        rollHistory: [],
      })
    } else {
      set({ campaignId })
    }
    get().persist()
  },

  setCombatGroup(groupId) {
    set({ combatGroupId: groupId || null })
    get().persist()
  },

  setActiveEnemy(npcId) {
    set({ activeEnemyId: npcId || null })
    get().persist()
  },

  setLastRoll(roll) {
    set({ lastRoll: roll })
  },

  addRoll(roll) {
    const entry = {
      ...roll,
      id: genId(),
      createdAt: new Date().toISOString(),
    }
    set({ rollHistory: [entry, ...get().rollHistory].slice(0, 150) })
    get().persist()
    return entry
  },

  deleteRoll(rollId) {
    set({ rollHistory: get().rollHistory.filter(roll => roll.id !== rollId) })
    get().persist()
  },

  clearRollHistory(campaignId = null) {
    set({
      rollHistory: campaignId
        ? get().rollHistory.filter(roll => roll.campaignId !== campaignId)
        : [],
    })
    get().persist()
  },

  replaceSession(session = {}) {
    set({
      campaignId: session.campaignId ?? null,
      combatGroupId: session.combatGroupId ?? null,
      activeEnemyId: session.activeEnemyId ?? null,
      rollHistory: Array.isArray(session.rollHistory) ? session.rollHistory : [],
    })
    get().persist()
  },
}))
