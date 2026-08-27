import { create } from 'zustand'
import {
  archiveEntity,
  listTrash,
  restoreFromTrash,
  permanentDeleteFromTrash,
  emptyTrash,
} from '../services/trashService'

export const useTrashStore = create((set) => ({
  items: listTrash(),

  refresh() {
    set({ items: listTrash() })
  },

  archive(type, entity) {
    const result = archiveEntity(type, entity)
    if (result.ok) set({ items: listTrash() })
    return result
  },

  restore(trashId) {
    const result = restoreFromTrash(trashId)
    if (result.ok) set({ items: listTrash() })
    return result
  },

  permanentDelete(trashId) {
    permanentDeleteFromTrash(trashId)
    set({ items: listTrash() })
  },

  emptyCampaign(campaignId) {
    emptyTrash(campaignId)
    set({ items: listTrash() })
  },
}))
