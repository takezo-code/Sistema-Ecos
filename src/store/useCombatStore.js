import { create } from 'zustand'
import { storage, KEYS } from '../services/storage'
import { genId } from '../utils/id'

function normalizeEnemyIds(session = {}) {
  if (Array.isArray(session.activeEnemyIds)) {
    return [...new Set(session.activeEnemyIds.filter(Boolean))]
  }
  if (session.activeEnemyId) return [session.activeEnemyId]
  return []
}

const saved = storage.get(KEYS.combatSession) || {}

const load = () => {
  const base = {
    campaignId: null,
    combatGroupId: null,
    rollHistory: [],
    ...saved,
  }
  return {
    ...base,
    activeEnemyIds: normalizeEnemyIds(saved),
  }
}

export const useCombatStore = create((set, get) => ({
  campaignId: load().campaignId ?? null,
  combatGroupId: load().combatGroupId ?? null,
  activeEnemyIds: load().activeEnemyIds ?? [],
  rollHistory: load().rollHistory ?? [],
  lastRoll: null,

  persist() {
    const { campaignId, combatGroupId, activeEnemyIds, rollHistory } = get()
    storage.set(KEYS.combatSession, {
      campaignId,
      combatGroupId,
      activeEnemyIds,
      rollHistory,
    })
  },

  setCampaign(campaignId) {
    const current = get()
    if (current.campaignId !== campaignId) {
      set({
        campaignId,
        combatGroupId: null,
        activeEnemyIds: [],
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

  setActiveEnemyIds(npcIds) {
    const ids = [...new Set((npcIds || []).filter(Boolean))]
    set({ activeEnemyIds: ids })
    get().persist()
  },

  addCombatEnemy(npcId) {
    if (!npcId) return
    const ids = get().activeEnemyIds
    if (ids.includes(npcId)) return
    set({ activeEnemyIds: [...ids, npcId] })
    get().persist()
  },

  removeCombatEnemy(npcId) {
    if (!npcId) return
    set({ activeEnemyIds: get().activeEnemyIds.filter(id => id !== npcId) })
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
      activeEnemyIds: normalizeEnemyIds(session),
      rollHistory: Array.isArray(session.rollHistory) ? session.rollHistory : [],
    })
    get().persist()
  },
}))
