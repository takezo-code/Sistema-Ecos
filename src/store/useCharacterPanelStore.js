import { create } from 'zustand'
import { storage, KEYS } from '../services/storage'

const UI_KEY = 'character_panel'

const load = () => storage.get(UI_KEY) || {}

export const CHARACTER_PANEL_TABS = Object.freeze({
  PROFILE: 'profile',
  INVENTORY: 'inventory',
  STATUS: 'status',
  SKILLS: 'skills',
  ECOS: 'ecos',
  HISTORY: 'history',
  SETTINGS: 'settings',
})

export const useCharacterPanelStore = create((set, get) => ({
  selectedCharacterId: load().selectedCharacterId ?? null,
  activeTab: load().activeTab ?? CHARACTER_PANEL_TABS.SKILLS,

  persist() {
    storage.set(UI_KEY, {
      selectedCharacterId: get().selectedCharacterId,
      activeTab: get().activeTab,
    })
  },

  selectCharacter(id) {
    set({ selectedCharacterId: id })
    get().persist()
  },

  setActiveTab(tab) {
    set({ activeTab: tab })
    get().persist()
  },

  clearSelection() {
    set({ selectedCharacterId: null })
    get().persist()
  },
}))
