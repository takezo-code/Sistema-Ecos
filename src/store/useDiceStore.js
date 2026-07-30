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

  rollWithAttribute(sides, attributeValue, label, classBonus = 0) {
    const diceResult = Math.floor(Math.random() * sides) + 1
    const attrBonus = attributeValue || 0
    const clsBonus = classBonus || 0
    const total = diceResult + attrBonus + clsBonus
    const entry = {
      id: Date.now(),
      sides,
      result: diceResult,
      bonus: attrBonus + clsBonus,
      attrBonus,
      classBonus: clsBonus,
      total,
      label: label || `d${sides} + ${attrBonus}`,
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
