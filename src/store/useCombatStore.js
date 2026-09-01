import { create } from 'zustand'
import { storage, KEYS } from '../services/storage'
import { genId } from '../utils/id'

const load = () => {
  const saved = storage.get(KEYS.combatSession) || {}
  return {
    globalNotes: '',
    turn: 0,
    campaignId: null,
    combatGroupId: null,
    activeEnemyId: null,
    rollHistory: [],
    roundActedPlayerIds: [],
    ...saved,
  }
}

export const useCombatStore = create((set, get) => ({
  globalNotes: load().globalNotes ?? '',
  turn: load().turn ?? 0,
  campaignId: load().campaignId ?? null,
  combatGroupId: load().combatGroupId ?? null,
  activeEnemyId: load().activeEnemyId ?? null,
  rollHistory: load().rollHistory ?? [],
  roundActedPlayerIds: load().roundActedPlayerIds ?? [],
  lastRoll: null,

  persist() {
    const {
      globalNotes, turn, campaignId, combatGroupId, activeEnemyId,
      rollHistory, roundActedPlayerIds,
    } = get()
    storage.set(KEYS.combatSession, {
      globalNotes,
      turn,
      campaignId,
      combatGroupId,
      activeEnemyId,
      rollHistory,
      roundActedPlayerIds,
    })
  },

  setCampaign(campaignId) {
    const current = get()
    if (current.campaignId !== campaignId) {
      set({
        campaignId,
        globalNotes: '',
        turn: 0,
        combatGroupId: null,
        roundActedPlayerIds: [],
      })
    } else {
      set({ campaignId })
    }
    get().persist()
  },

  setCombatGroup(groupId) {
    set({ combatGroupId: groupId || null, roundActedPlayerIds: [] })
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

  /** Marca jogador que rolou nesta rodada; retorna a lista atualizada de ids. */
  markPlayerActedInRound(playerId) {
    if (!playerId) return get().roundActedPlayerIds
    const current = get().roundActedPlayerIds
    if (current.includes(playerId)) return current
    const next = [...current, playerId]
    set({ roundActedPlayerIds: next })
    get().persist()
    return next
  },

  resetRoundActs() {
    set({ roundActedPlayerIds: [] })
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
}))
