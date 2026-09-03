import { create } from 'zustand'
import { storage, KEYS } from '../services/storage'

const DEFAULT = {
  autosaveEnabled: true,
  lastManualSaveAt: null,
  lastAutoSaveAt: null,
  clickEffectsEnabled: true,
  backgroundEffectsEnabled: true,
}

const load = () => ({ ...DEFAULT, ...(storage.get(KEYS.settings) || {}) })

export const useSettingsStore = create((set, get) => ({
  settings: load(),

  updateSettings(patch) {
    const settings = { ...get().settings, ...patch }
    storage.set(KEYS.settings, settings)
    set({ settings })
  },
}))
