import { create } from 'zustand'
import { storage, KEYS } from '../services/storage'
import { genId } from '../utils/id'

const load = () => storage.get(KEYS.sessions) || []

export const useSessionStore = create((set, get) => ({
  sessions: load(),

  getSessionsByCampaign(campaignId) {
    return get().sessions
      .filter(s => s.campaignId === campaignId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  addSession(data) {
    const session = {
      id: genId(),
      campaignId: data.campaignId || null,
      title: data.title || 'Nova Sessão',
      summary: data.summary || '',
      sessionNumber: data.sessionNumber || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const sessions = [...get().sessions, session]
    storage.set(KEYS.sessions, sessions)
    set({ sessions })
    return session
  },

  updateSession(id, data) {
    const sessions = get().sessions.map(s =>
      s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s
    )
    storage.set(KEYS.sessions, sessions)
    set({ sessions })
  },

  deleteSession(id) {
    const sessions = get().sessions.filter(s => s.id !== id)
    storage.set(KEYS.sessions, sessions)
    set({ sessions })
  },
}))
