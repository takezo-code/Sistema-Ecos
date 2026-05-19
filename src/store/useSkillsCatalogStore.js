import { create } from 'zustand'
import {
  getMergedCatalog,
  loadCustomSkills,
  addCustomSkill,
  updateCustomSkill,
  deleteCustomSkill,
} from '../services/skillsCatalogService'

const refresh = () => getMergedCatalog()

export const useSkillsCatalogStore = create((set, get) => ({
  skills: refresh(),

  reload() {
    set({ skills: refresh() })
  },

  addSkill(draft) {
    const skill = addCustomSkill(draft)
    set({ skills: refresh() })
    return skill
  },

  updateSkill(templateId, draft) {
    const skill = updateCustomSkill(templateId, draft)
    if (skill) set({ skills: refresh() })
    return skill
  },

  removeSkill(templateId) {
    const result = deleteCustomSkill(templateId)
    if (result.ok) set({ skills: refresh() })
    return result
  },

  getSkill(templateId) {
    return get().skills.find(s => s.templateId === templateId) || null
  },
}))

// Hidrata ao importar
useSkillsCatalogStore.getState().reload()
