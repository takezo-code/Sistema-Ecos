import { create } from 'zustand'

export const useSaveStore = create((set) => ({
  toast: null,
  isSaving: false,

  showToast(message, type = 'success') {
    set({ toast: { message, type, id: Date.now() } })
    setTimeout(() => set({ toast: null }), 4000)
  },

  setSaving(v) {
    set({ isSaving: v })
  },
}))
