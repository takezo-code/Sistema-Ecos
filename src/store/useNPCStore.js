import { create } from 'zustand'
import { storage, KEYS } from '../services/storage'
import { genId } from '../utils/id'
import {
  normalizeGameEntity,
  STARTING_ATTRIBUTE_POINTS,
  STARTING_SOCIAL_POINTS,
  defaultAttributes,
  defaultSocialAttributes,
} from '../constants/attributes'
import { archiveEntity, TRASH_TYPES } from '../services/trashService'
import {
  applyXpGain,
  applyPendingAttributePoint,
  applyPendingSocialPoint,
  applyInitialAttributeChange,
  applyAttributePointSpend,
  applyMasterAttributeChange,
  buildMasterProgressionPatch,
  syncProgressionToLevel,
  clampMasterAuxiliary as buildClampMasterAuxiliaryPatch,
  scaleAttributesToBudget,
} from '../services/progressionService'
import { unlockRandomSkill } from '../services/skillService'
import { useEcoSkill, restEcoOverload, masterSetEcoOverload } from '../services/ecoOverloadService'
import { buildSkillInstanceFromCatalog } from '../services/ecoSkillRuntimeService'
import { catalogSkillAllowedForEntity, getCatalogSkill } from '../services/skillsCatalogService'
import { enforceProgressionCaps } from '../services/progressionBudget'
import {
  applyDamageMarks as applyDamageMarksEngine,
  applyMarksAmount as applyMarksAmountEngine,
  clearDamageMarks as clearDamageMarksEngine,
  healDamageMarks as healDamageMarksEngine,
  DAMAGE_MARK_VALUES,
} from '../mechanics/combat/damageMarksEngine'

const load = () => (storage.get(KEYS.npcs) || []).map(normalizeGameEntity)

const persist = (npcs) => storage.set(KEYS.npcs, npcs)

const patchNPC = (get, set, id, patcher) => {
  const npcs = get().npcs.map(n => {
    if (n.id !== id) return n
    const next = typeof patcher === 'function' ? patcher(n) : { ...n, ...patcher }
    const normalized = normalizeGameEntity({ ...next, updatedAt: new Date().toISOString() })
    const { patch: caps } = enforceProgressionCaps(normalized)
    return caps ? { ...normalized, ...caps } : normalized
  })
  persist(npcs)
  set({ npcs })
  return npcs.find(n => n.id === id)
}

export const useNPCStore = create((set, get) => ({
  npcs: load(),
  lastLevelUps: [],
  lastOverloadEvents: [],
  lastMasterError: null,

  clearLevelUps: () => set({ lastLevelUps: [] }),
  clearOverloadEvents: () => set({ lastOverloadEvents: [] }),
  clearMasterError: () => set({ lastMasterError: null }),

  /**
   * Aplica dano a um NPC/boss respeitando resistência física ou mental.
   * Retorna { patch, stateChanged, narratives, damageReduced, effectiveDamage }
   */
  applyDamageWithResistance(npcId, markType, { mental = false } = {}) {
    const n = get().npcs.find(npc => npc.id === npcId)
    if (!n) return null
    const resistance = mental ? (n.resistenciaMental ?? 0) : (n.resistenciaFisica ?? 0)
    const rawDamage = DAMAGE_MARK_VALUES[markType] ?? 1
    const effectiveDamage = Math.max(0, rawDamage - resistance)
    const damageReduced = rawDamage - effectiveDamage

    if (effectiveDamage <= 0) {
      return { stateChanged: false, narratives: [`Dano absorvido pela resistência (${resistance})`], effectiveDamage: 0, damageReduced }
    }

    const result = applyMarksAmountEngine(n, effectiveDamage)
    if (!result.patch || Object.keys(result.patch).length === 0) {
      return { stateChanged: false, narratives: [], effectiveDamage: 0, damageReduced }
    }
    patchNPC(get, set, npcId, npc => ({ ...npc, ...result.patch }))
    return { ...result, effectiveDamage, damageReduced }
  },

  applyDamageMarks(npcId, markType) {
    const n = get().npcs.find(npc => npc.id === npcId)
    if (!n) return null
    const result = applyDamageMarksEngine(n, markType)
    patchNPC(get, set, npcId, npc => ({ ...npc, ...result.patch }))
    return result
  },

  healDamageMarks(npcId, amount = 1) {
    const n = get().npcs.find(npc => npc.id === npcId)
    if (!n) return null
    const result = healDamageMarksEngine(n, amount)
    patchNPC(get, set, npcId, npc => ({ ...npc, ...result.patch }))
    return result
  },

  clearDamageMarks(npcId) {
    const n = get().npcs.find(npc => npc.id === npcId)
    if (!n) return
    const result = clearDamageMarksEngine(n)
    patchNPC(get, set, npcId, npc => ({ ...npc, ...result.patch }))
  },

  getNPCsByCampaign(campaignId) {
    return get().npcs.filter(n => n.campaignId === campaignId)
  },

  addNPC(data) {
    const npc = normalizeGameEntity({
      ...data,
      id: genId(),
      campaignId: data.campaignId || null,
      name: data.name || 'Novo NPC',
      image: data.image || '',
      appearance: data.appearance || '',
      personality: data.personality || '',
      history: data.history || data.description || '',
      motivation: data.motivation || '',
      secret: data.secret || '',
      organization: data.organization || '',
      status: data.status || 'vivo',
      level: data.level ?? 1,
      xp: data.xp ?? 0,
      ecoPoints: data.ecoPoints ?? 0,
      pendingAttributePoints: data.pendingAttributePoints ?? 0,
      pendingSocialPoints: data.pendingSocialPoints ?? 0,
      skills: data.skills ?? [],
      hasEcoPowers: data.hasEcoPowers ?? false,
      attributes: { ...defaultAttributes(), ...(data.attributes || {}) },
      unspentAttributePoints: data.unspentAttributePoints ?? 0,
      creationAttributeFloors: data.creationAttributeFloors,
      socialAttributes: { ...defaultSocialAttributes(), ...(data.socialAttributes || {}) },
      unspentSocialPoints: data.unspentSocialPoints ?? 0,
      creationSocialFloors: data.creationSocialFloors,
      physicalState: data.physicalState || 'bem',
      mentalState: data.mentalState || 'estavel',
      inventory: data.inventory || [],
      equipped: data.equipped || [],
      backpackCapacity: data.backpackCapacity ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    const npcs = [...get().npcs, npc]
    persist(npcs)
    set({ npcs })
    return npc
  },

  updateNPC(id, data) {
    patchNPC(get, set, id, n => ({ ...n, ...data }))
  },

  deleteNPC(id) {
    const npc = get().npcs.find(n => n.id === id)
    if (!npc) return
    archiveEntity(TRASH_TYPES.npc, npc)
  },

  addXp(npcId, amount) {
    const n = get().npcs.find(npc => npc.id === npcId)
    if (!n) return { levelUps: [] }
    const { patch, levelUps } = applyXpGain(n, amount)
    patchNPC(get, set, npcId, npc => ({ ...npc, ...patch }))
    set({ lastLevelUps: levelUps })
    return { levelUps }
  },

  spendPendingAttribute(npcId, attrKey) {
    const n = get().npcs.find(npc => npc.id === npcId)
    if (!n) return false
    const patch = applyPendingAttributePoint(n, attrKey)
    if (!patch) return false
    patchNPC(get, set, npcId, npc => ({ ...npc, ...patch }))
    return true
  },

  spendPendingSocialAttribute(npcId, attrKey) {
    const n = get().npcs.find(npc => npc.id === npcId)
    if (!n) return false
    const patch = applyPendingSocialPoint(n, attrKey)
    if (!patch) return false
    patchNPC(get, set, npcId, npc => ({ ...npc, ...patch }))
    return true
  },

  changeSocialAttribute(npcId, attrKey, newValue) {
    const n = get().npcs.find(npc => npc.id === npcId)
    if (!n) return false
    const value = Math.max(0, Math.min(8, Number(newValue) || 0))
    patchNPC(get, set, npcId, npc => ({
      ...npc,
      socialAttributes: { ...npc.socialAttributes, [attrKey]: value },
    }))
    return true
  },

  changeAttribute(npcId, attrKey, newValue, { isCreation = false, admin = false } = {}) {
    const n = get().npcs.find(npc => npc.id === npcId)
    if (!n) return false
    const patch = admin
      ? applyMasterAttributeChange(n, attrKey, newValue)
      : isCreation
        ? applyInitialAttributeChange(n, attrKey, newValue)
        : applyAttributePointSpend(n, attrKey, newValue)
    if (!patch) return false
    patchNPC(get, set, npcId, npc => ({ ...npc, ...patch }))
    return true
  },

  setMasterAttribute(npcId, attrKey, newValue) {
    const n = get().npcs.find(npc => npc.id === npcId)
    if (!n) return { ok: false, message: 'NPC não encontrado' }
    const { patch, error } = applyMasterAttributeChange(n, attrKey, newValue)
    if (!patch) {
      set({ lastMasterError: error })
      return { ok: false, message: error?.message || 'Alteração inválida' }
    }
    patchNPC(get, set, npcId, npc => ({ ...npc, ...patch }))
    set({ lastMasterError: null })
    return { ok: true }
  },

  setMasterProgression(npcId, data) {
    const n = get().npcs.find(npc => npc.id === npcId)
    if (!n) return { ok: false, message: 'NPC não encontrado' }
    const { patch, error } = buildMasterProgressionPatch(n, data)
    if (!patch) {
      set({ lastMasterError: error })
      return { ok: false, message: error?.message || 'Progressão inválida' }
    }
    patchNPC(get, set, npcId, npc => ({ ...npc, ...patch }))
    set({ lastMasterError: null })
    return { ok: true }
  },

  syncMasterProgression(npcId) {
    const n = get().npcs.find(npc => npc.id === npcId)
    if (!n) return { ok: false, message: 'NPC não encontrado' }
    const { patch, error } = syncProgressionToLevel(n)
    if (!patch) {
      set({ lastMasterError: error })
      return { ok: false, message: error?.message || 'Sincronização impossível' }
    }
    patchNPC(get, set, npcId, npc => ({ ...npc, ...patch }))
    set({ lastMasterError: null })
    return { ok: true }
  },

  clampMasterAuxiliary(npcId) {
    const n = get().npcs.find(npc => npc.id === npcId)
    if (!n) return { ok: false, message: 'NPC não encontrado' }
    const { patch } = buildClampMasterAuxiliaryPatch(n)
    patchNPC(get, set, npcId, npc => ({ ...npc, ...patch }))
    set({ lastMasterError: null })
    return { ok: true }
  },

  scaleMasterAttributesToBudget(npcId) {
    const n = get().npcs.find(npc => npc.id === npcId)
    if (!n) return { ok: false, message: 'NPC não encontrado' }
    const { patch, error } = scaleAttributesToBudget(n)
    if (!patch) {
      set({ lastMasterError: error })
      return { ok: false, message: error?.message || 'Não foi possível ajustar' }
    }
    patchNPC(get, set, npcId, npc => ({ ...npc, ...patch }))
    set({ lastMasterError: null })
    return { ok: true }
  },

  unlockSkill(npcId) {
    const n = get().npcs.find(npc => npc.id === npcId)
    if (!n) return null
    const patch = unlockRandomSkill(n)
    if (!patch) return null
    patchNPC(get, set, npcId, npc => ({ ...npc, ...patch }))
    return patch.skills[patch.skills.length - 1]
  },

  learnCatalogSkill(npcId, templateId, { free = false } = {}) {
    const n = get().npcs.find(npc => npc.id === npcId)
    if (!n) return { ok: false, message: 'NPC não encontrado' }
    if (!getCatalogSkill(templateId)) {
      return { ok: false, message: 'Habilidade não existe no grimório.' }
    }
    if (!catalogSkillAllowedForEntity(templateId, n)) {
      return { ok: false, message: 'Esta habilidade não pertence ao catálogo deste inimigo.' }
    }
    if ((n.skills || []).some(s => s.templateId === templateId)) {
      return { ok: false, message: 'NPC já possui esta habilidade.' }
    }
    const instance = buildSkillInstanceFromCatalog(templateId)
    if (!instance) return { ok: false, message: 'Erro ao criar habilidade.' }
    patchNPC(get, set, npcId, npc => ({
      ...npc,
      skills: [...(npc.skills || []), instance],
    }))
    return { ok: true, skill: instance }
  },

  removeSkill(npcId, skillId) {
    patchNPC(get, set, npcId, npc => ({
      ...npc,
      skills: (npc.skills || []).filter(s => s.id !== skillId),
    }))
    return true
  },

  useEcoSkill(npcId, skillId, options = {}) {
    const n = get().npcs.find(npc => npc.id === npcId)
    if (!n) return { ok: false }
    const result = useEcoSkill(n, skillId, options)
    if (!result.ok) return result
    if (result.patch && Object.keys(result.patch).length > 0) {
      patchNPC(get, set, npcId, npc => ({ ...npc, ...result.patch }))
    }
    if (result.events?.length) set({ lastOverloadEvents: result.events })
    return result
  },

  restEcoOverload(npcId) {
    const n = get().npcs.find(npc => npc.id === npcId)
    if (!n) return false
    const { patch } = restEcoOverload(n)
    patchNPC(get, set, npcId, npc => ({ ...npc, ...patch }))
    set({ lastOverloadEvents: [] })
    return true
  },

  setEcoOverloadLevel(npcId, level) {
    const n = get().npcs.find(npc => npc.id === npcId)
    if (!n) return false
    const { patch } = masterSetEcoOverload(n, level)
    patchNPC(get, set, npcId, npc => ({ ...npc, ...patch }))
    return true
  },

  addInventoryItem(npcId, item) {
    const name = typeof item === 'string' ? item : item.name
    const qty = typeof item === 'string' ? 1 : (item.qty || 1)
    const npcs = get().npcs.map(n => {
      if (n.id !== npcId) return n
      const cap = n.backpackCapacity
      if (cap != null && n.inventory.length >= cap) return n
      return normalizeGameEntity({
        ...n,
        inventory: [...n.inventory, { id: genId(), name, qty }],
        updatedAt: new Date().toISOString(),
      })
    })
    persist(npcs)
    set({ npcs })
  },

  updateInventoryItem(npcId, itemId, data) {
    const npcs = get().npcs.map(n => {
      if (n.id !== npcId) return n
      return normalizeGameEntity({
        ...n,
        inventory: n.inventory.map(i => i.id === itemId ? { ...i, ...data } : i),
        updatedAt: new Date().toISOString(),
      })
    })
    persist(npcs)
    set({ npcs })
  },

  removeInventoryItem(npcId, itemId) {
    const npcs = get().npcs.map(n => {
      if (n.id !== npcId) return n
      return normalizeGameEntity({
        ...n,
        inventory: n.inventory.filter(i => i.id !== itemId),
        updatedAt: new Date().toISOString(),
      })
    })
    persist(npcs)
    set({ npcs })
  },

  addEquippedItem(npcId, item) {
    const payload = typeof item === 'string'
      ? { name: item }
      : item
    const npcs = get().npcs.map(n => {
      if (n.id !== npcId) return n
      return normalizeGameEntity({
        ...n,
        equipped: [...n.equipped, {
          id: genId(),
          name: payload.name || 'Item',
          slot: payload.slot || '',
          category: payload.category || 'arma',
          type: payload.type || null,
          equipmentId: payload.equipmentId || null,
        }],
        updatedAt: new Date().toISOString(),
      })
    })
    persist(npcs)
    set({ npcs })
  },

  removeEquippedItem(npcId, itemId) {
    const npcs = get().npcs.map(n => {
      if (n.id !== npcId) return n
      return normalizeGameEntity({
        ...n,
        equipped: n.equipped.filter(i => i.id !== itemId),
        updatedAt: new Date().toISOString(),
      })
    })
    persist(npcs)
    set({ npcs })
  },
}))
