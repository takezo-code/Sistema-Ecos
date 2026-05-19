import { create } from 'zustand'
import { storage, KEYS } from '../services/storage'
import { genId } from '../utils/id'
import { normalizeGameEntity, STARTING_ATTRIBUTE_POINTS, defaultAttributes } from '../constants/attributes'
import {
  applyXpGain,
  applyPendingAttributePoint,
  applyInitialAttributeChange,
  applyAttributePointSpend,
  applyMasterAttributeChange,
  buildMasterProgressionPatch,
  syncProgressionToLevel,
  clampMasterAuxiliary as buildClampMasterAuxiliaryPatch,
  scaleAttributesToBudget,
} from '../services/progressionService'
import { unlockRandomSkill, upgradeSkillTier } from '../services/skillService'
import { useEcoSkill, restEcoOverload, masterSetEcoOverload } from '../services/ecoOverloadService'
import {
  activateCharacterSkill,
  advanceCharacterTurn,
  buildSkillInstanceFromCatalog,
} from '../services/ecoSkillRuntimeService'
import { getCatalogSkill } from '../services/skillsCatalogService'
import { enforceProgressionCaps } from '../services/progressionBudget'
import {
  applyDamageMarks as applyDamageMarksEngine,
  clearDamageMarks as clearDamageMarksEngine,
  healDamageMarks as healDamageMarksEngine,
} from '../mechanics/combat/damageMarksEngine'

const load = () => (storage.get(KEYS.characters) || []).map(normalizeGameEntity)

const persist = (characters) => storage.set(KEYS.characters, characters)

const patchCharacter = (get, set, id, patcher) => {
  const characters = get().characters.map(c => {
    if (c.id !== id) return c
    const next = typeof patcher === 'function' ? patcher(c) : { ...c, ...patcher }
    const normalized = normalizeGameEntity({ ...next, updatedAt: new Date().toISOString() })
    const { patch: caps } = enforceProgressionCaps(normalized)
    return caps ? { ...normalized, ...caps } : normalized
  })
  persist(characters)
  set({ characters })
  return characters.find(c => c.id === id)
}

export const useCharacterStore = create((set, get) => ({
  characters: load(),
  lastLevelUps: [],
  lastOverloadEvents: [],
  lastSkillError: null,
  lastMasterError: null,

  clearLevelUps: () => set({ lastLevelUps: [] }),

  clearOverloadEvents: () => set({ lastOverloadEvents: [] }),

  clearSkillError: () => set({ lastSkillError: null }),

  clearMasterError: () => set({ lastMasterError: null }),

  getCharactersByCampaign(campaignId) {
    return get().characters.filter(c => c.campaignId === campaignId)
  },

  addCharacter(data) {
    const character = normalizeGameEntity({
      id: genId(),
      campaignId: data.campaignId || null,
      name: data.name || 'Novo Personagem',
      image: data.image || '',
      description: data.description || '',
      narrativeStatus: data.narrativeStatus || '',
      level: 1,
      xp: 0,
      ecoPoints: 0,
      pendingAttributePoints: 0,
      skills: [],
      attributes: defaultAttributes(),
      unspentAttributePoints: STARTING_ATTRIBUTE_POINTS,
      physicalState: data.physicalState || 'bem',
      mentalState: data.mentalState || 'estavel',
      inventory: data.inventory || [],
      equipped: data.equipped || [],
      backpackCapacity: data.backpackCapacity ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    const characters = [...get().characters, character]
    persist(characters)
    set({ characters })
    return character
  },

  updateCharacter(id, data) {
    patchCharacter(get, set, id, c => ({ ...c, ...data }))
  },

  setPhysicalState(characterId, physicalState) {
    patchCharacter(get, set, characterId, { physicalState })
  },

  setMentalState(characterId, mentalState) {
    patchCharacter(get, set, characterId, { mentalState })
  },

  /** Aplica marcas de dano e recalcula estado físico automaticamente */
  applyDamageMarks(characterId, markType, options = {}) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return null
    const result = applyDamageMarksEngine(c, markType, options)
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...result.patch }))
    return result
  },

  /** Cura parcial: remove N marcas e recalcula estado */
  healDamageMarks(characterId, amount = 1) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return null
    const result = healDamageMarksEngine(c, amount)
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...result.patch }))
    return result
  },

  /** Limpa todas as marcas e volta ao estado Estável */
  clearDamageMarks(characterId) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return
    const result = clearDamageMarksEngine(c)
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...result.patch }))
  },

  /** Descanso completo: zera sobrecarga Eco + limpa marcas de dano */
  recoverCharacter(characterId) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return false
    const ecoPatch = restEcoOverload(c).patch
    const marksPatch = clearDamageMarksEngine(c).patch
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...ecoPatch, ...marksPatch }))
    set({ lastOverloadEvents: [] })
    return true
  },

  recoverGroupMembers(memberIds = []) {
    memberIds.forEach(id => get().recoverCharacter(id))
  },

  addXp(characterId, amount) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return { levelUps: [] }
    const { patch, levelUps } = applyXpGain(c, amount)
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...patch }))
    set({ lastLevelUps: levelUps })
    return { levelUps }
  },

  addXpToMany(ids, amount) {
    const allLevelUps = []
    ids.forEach(id => {
      const result = get().addXp(id, amount)
      if (result?.levelUps?.length) allLevelUps.push(...result.levelUps.map(l => ({ ...l, characterId: id })))
    })
    set({ lastLevelUps: allLevelUps })
  },

  spendPendingAttribute(characterId, attrKey) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return false
    const patch = applyPendingAttributePoint(c, attrKey)
    if (!patch) return false
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...patch }))
    return true
  },

  changeAttribute(characterId, attrKey, newValue, { isCreation = false, admin = false } = {}) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return false
    const patch = admin
      ? applyMasterAttributeChange(c, attrKey, newValue)
      : isCreation
        ? applyInitialAttributeChange(c, attrKey, newValue)
        : applyAttributePointSpend(c, attrKey, newValue)
    if (!patch) return false
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...patch }))
    return true
  },

  setMasterAttribute(characterId, attrKey, newValue) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return { ok: false, message: 'Personagem não encontrado' }
    const { patch, error } = applyMasterAttributeChange(c, attrKey, newValue)
    if (!patch) {
      set({ lastMasterError: error })
      return { ok: false, message: error?.message || 'Alteração inválida' }
    }
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...patch }))
    set({ lastMasterError: null })
    return { ok: true }
  },

  setMasterProgression(characterId, data) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return { ok: false, message: 'Personagem não encontrado' }
    const { patch, error } = buildMasterProgressionPatch(c, data)
    if (!patch) {
      set({ lastMasterError: error })
      return { ok: false, message: error?.message || 'Progressão inválida' }
    }
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...patch }))
    set({ lastMasterError: null })
    return { ok: true }
  },

  syncMasterProgression(characterId) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return { ok: false, message: 'Personagem não encontrado' }
    const { patch, error } = syncProgressionToLevel(c)
    if (!patch) {
      set({ lastMasterError: error })
      return { ok: false, message: error?.message || 'Sincronização impossível' }
    }
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...patch }))
    set({ lastMasterError: null })
    return { ok: true }
  },

  clampMasterAuxiliary(characterId) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return { ok: false, message: 'Personagem não encontrado' }
    const { patch } = buildClampMasterAuxiliaryPatch(c)
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...patch }))
    set({ lastMasterError: null })
    return { ok: true }
  },

  scaleMasterAttributesToBudget(characterId) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return { ok: false, message: 'Personagem não encontrado' }
    const { patch, error } = scaleAttributesToBudget(c)
    if (!patch) {
      set({ lastMasterError: error })
      return { ok: false, message: error?.message || 'Não foi possível ajustar' }
    }
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...patch }))
    set({ lastMasterError: null })
    return { ok: true }
  },

  unlockSkill(characterId) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return null
    const patch = unlockRandomSkill(c)
    if (!patch) return null
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...patch }))
    return patch.skills[patch.skills.length - 1]
  },

  upgradeSkill(characterId, skillId) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return false
    const patch = upgradeSkillTier(c, skillId)
    if (!patch) return false
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...patch }))
    return true
  },

  useEcoSkill(characterId, skillId, options = {}) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return { ok: false }
    const result = useEcoSkill(c, skillId, options)
    if (!result.ok) return result
    if (result.patch && Object.keys(result.patch).length > 0) {
      patchCharacter(get, set, characterId, ch => ({ ...ch, ...result.patch }))
    }
    if (result.events?.length) {
      set({ lastOverloadEvents: result.events })
    }
    return result
  },

  restEcoOverload(characterId) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return false
    const { patch } = restEcoOverload(c)
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...patch }))
    set({ lastOverloadEvents: [] })
    return true
  },

  setEcoOverloadLevel(characterId, level) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return false
    const { patch } = masterSetEcoOverload(c, level)
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...patch }))
    return true
  },

  activateSkill(characterId, skillId) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return { ok: false, message: 'Personagem não encontrado' }
    const result = activateCharacterSkill(c, skillId)
    if (!result.ok) {
      set({ lastSkillError: result.error })
      return { ok: false, message: result.error?.message }
    }
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...result.patch }))
    if (result.events?.length) set({ lastOverloadEvents: result.events })
    set({ lastSkillError: null })
    return { ok: true, warnings: result.warnings, historyEntry: result.historyEntry }
  },

  advanceTurn(characterId) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return { ok: false }
    const result = advanceCharacterTurn(c)
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...result.patch }))
    return { ok: true, warnings: result.warnings }
  },

  learnCatalogSkill(characterId, templateId) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return { ok: false, message: 'Personagem não encontrado' }
    if (!getCatalogSkill(templateId)) {
      return { ok: false, message: 'Habilidade não existe no catálogo.' }
    }
    if ((c.skills || []).some(s => s.templateId === templateId)) {
      return { ok: false, message: 'Personagem já possui esta habilidade.' }
    }
    const instance = buildSkillInstanceFromCatalog(templateId)
    if (!instance) return { ok: false, message: 'Erro ao criar habilidade.' }
    patchCharacter(get, set, characterId, ch => ({
      ...ch,
      skills: [...(ch.skills || []), instance],
    }))
    return { ok: true, skill: instance }
  },

  removeSkill(characterId, skillId) {
    patchCharacter(get, set, characterId, c => ({
      ...c,
      skills: (c.skills || []).filter(s => s.id !== skillId),
    }))
    return true
  },

  deleteCharacter(id) {
    const characters = get().characters.filter(c => c.id !== id)
    persist(characters)
    set({ characters })
  },

  addInventoryItem(characterId, item) {
    const name = typeof item === 'string' ? item : item.name
    const qty = typeof item === 'string' ? 1 : (item.qty || 1)
    patchCharacter(get, set, characterId, c => {
      const cap = c.backpackCapacity
      if (cap != null && c.inventory.length >= cap) return c
      return { ...c, inventory: [...c.inventory, { id: genId(), name, qty }] }
    })
  },

  updateInventoryItem(characterId, itemId, data) {
    patchCharacter(get, set, characterId, c => ({
      ...c,
      inventory: c.inventory.map(i => i.id === itemId ? { ...i, ...data } : i),
    }))
  },

  removeInventoryItem(characterId, itemId) {
    patchCharacter(get, set, characterId, c => ({
      ...c,
      inventory: c.inventory.filter(i => i.id !== itemId),
    }))
  },

  addEquippedItem(characterId, item) {
    const name = typeof item === 'string' ? item : item.name
    patchCharacter(get, set, characterId, c => ({
      ...c,
      equipped: [...c.equipped, { id: genId(), name, slot: item.slot || '' }],
    }))
  },

  removeEquippedItem(characterId, itemId) {
    patchCharacter(get, set, characterId, c => ({
      ...c,
      equipped: c.equipped.filter(i => i.id !== itemId),
    }))
  },
}))
