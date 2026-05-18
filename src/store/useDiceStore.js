import { create } from 'zustand'
import { storage, KEYS } from '../services/storage'

const load = () => storage.get(KEYS.diceHistory) || []

export const useDiceStore = create((set, get) => ({
  history: load(),

  roll(sides, label = null) {
    const result = Math.floor(Math.random() * sides) + 1
    const entry = {
      id: Date.now(),
      sides,
      result,
      label: label || `d${sides}`,
      timestamp: new Date().toISOString(),
    }
    const history = [entry, ...get().history].slice(0, 50)
    storage.set(KEYS.diceHistory, history)
    set({ history })
    return result
  },

  rollWithAttribute(sides, attributeValue, label) {
    const diceResult = Math.floor(Math.random() * sides) + 1
    const total = diceResult + (attributeValue || 0)
    const entry = {
      id: Date.now(),
      sides,
      result: diceResult,
      bonus: attributeValue || 0,
      total,
      label: label || `d${sides} + ${attributeValue}`,
      timestamp: new Date().toISOString(),
    }
    const history = [entry, ...get().history].slice(0, 50)
    storage.set(KEYS.diceHistory, history)
    set({ history })
    return { diceResult, total }
  },

  clearHistory() {
    storage.set(KEYS.diceHistory, [])
    set({ history: [] })
  },
}))
