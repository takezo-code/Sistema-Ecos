import { create } from 'zustand'
import { storage, KEYS } from '../services/storage'
import { genId } from '../utils/id'
import {
  normalizeGameEntity,
  defaultAttributes,
  defaultSocialAttributes,
} from '../constants/attributes'
import { archiveEntity, TRASH_TYPES } from '../services/trashService'
import { resolveCampaignId } from '../services/campaignScopeService'
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
import { useEcoSkill as runEcoSkillUse, restEcoOverload, masterSetEcoOverload } from '../services/ecoOverloadService'
import { buildSkillInstanceFromCatalog, buildInlineSkillInstance, activateCharacterSkill, advanceCharacterTurn } from '../services/ecoSkillRuntimeService'
import { catalogSkillAllowedForEntity, getCatalogSkill } from '../services/skillsCatalogService'
import { enforceProgressionCaps } from '../services/progressionBudget'
import {
  applyDamageMarks as applyDamageMarksEngine,
  clearDamageMarks as clearDamageMarksEngine,
  healDamageMarks as healDamageMarksEngine,
} from '../mechanics/combat/damageMarksEngine'
import { buildGearItem, getGearItem, GEAR_CATEGORIES, normalizeEquippedGear } from '../mechanics/equipment/characterGear'
import { upsertPassive } from '../mechanics/equipment/gearPassiveEngine'

const withNormalizedGear = (entity) => ({
  ...entity,
  equipped: normalizeEquippedGear(entity.equipped),
})

const load = () => (storage.get(KEYS.npcs) || []).map(c => withNormalizedGear(normalizeGameEntity(c)))

const persist = (npcs) => storage.set(KEYS.npcs, npcs)

const patchNPC = (get, set, id, patcher) => {
  const npcs = get().npcs.map(n => {
    if (n.id !== id) return n
    const next = typeof patcher === 'function' ? patcher(n) : { ...n, ...patcher }
    const normalized = withNormalizedGear(normalizeGameEntity({ ...next, updatedAt: new Date().toISOString() }))
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
    let campaignId
    try {
      campaignId = resolveCampaignId(data.campaignId)
    } catch {
      return null
    }
    const npc = withNormalizedGear(normalizeGameEntity({
      ...data,
      id: genId(),
      campaignId,
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
      hasEcoPowers: data.hasEcoPowers ?? (data.papelCombate === 'boss'),
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
    }))
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

  learnCatalogSkill(npcId, templateId) {
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

  addInlineSkill(npcId, draft) {
    const n = get().npcs.find(npc => npc.id === npcId)
    if (!n) return { ok: false, message: 'NPC não encontrado' }
    if (!(draft?.name || '').trim()) return { ok: false, message: 'Nome da skill é obrigatório.' }
    const instance = buildInlineSkillInstance(draft)
    patchNPC(get, set, npcId, npc => ({
      ...npc,
      skills: [...(npc.skills || []), instance],
    }))
    return { ok: true, skill: instance }
  },

  updateInlineSkill(npcId, skillId, draft) {
    const n = get().npcs.find(npc => npc.id === npcId)
    if (!n) return { ok: false, message: 'NPC não encontrado' }
    if (!(draft?.name || '').trim()) return { ok: false, message: 'Nome da skill é obrigatório.' }
    const existing = (n.skills || []).find(s => s.id === skillId)
    if (!existing) return { ok: false, message: 'Skill não encontrada.' }
    const mechanicalEffect = draft.mechanicalEffect || draft.effect || ''
    const narrativeConsequence = draft.narrativeConsequence || draft.sideEffect || ''
    patchNPC(get, set, npcId, npc => ({
      ...npc,
      skills: (npc.skills || []).map(s => s.id !== skillId ? s : {
        ...s,
        name: draft.name.trim(),
        skillType: draft.skillType || s.skillType,
        cooldownTurns: Math.max(0, Number(draft.cooldownTurns) || 0),
        overloadCost: Math.max(0, Number(draft.overloadCost) || 1),
        description: draft.description || '',
        mechanicalEffect,
        narrativeConsequence,
        effect: mechanicalEffect,
        sideEffect: narrativeConsequence,
        fromCatalog: false,
      }),
    }))
    return { ok: true }
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
    const result = runEcoSkillUse(n, skillId, options)
    if (!result.ok) return result
    if (result.patch && Object.keys(result.patch).length > 0) {
      patchNPC(get, set, npcId, npc => ({ ...npc, ...result.patch }))
    }
    if (result.events?.length) set({ lastOverloadEvents: result.events })
    return result
  },

  activateSkill(npcId, skillId) {
    const n = get().npcs.find(npc => npc.id === npcId)
    if (!n) return { ok: false, message: 'Inimigo não encontrado' }
    const result = activateCharacterSkill(n, skillId)
    if (!result.ok) {
      return { ok: false, message: result.error?.message || 'Não foi possível ativar a habilidade.' }
    }
    patchNPC(get, set, npcId, npc => ({ ...npc, ...result.patch }))
    if (result.events?.length) set({ lastOverloadEvents: result.events })
    return {
      ok: true,
      warnings: result.warnings || [],
    }
  },

  advanceTurn(npcId) {
    const n = get().npcs.find(npc => npc.id === npcId)
    if (!n) return { ok: false }
    const result = advanceCharacterTurn(n)
    patchNPC(get, set, npcId, npc => ({ ...npc, ...result.patch }))
    return { ok: true, warnings: result.warnings }
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
      return withNormalizedGear(normalizeGameEntity({
        ...n,
        inventory: [...n.inventory, { id: genId(), name, qty }],
        updatedAt: new Date().toISOString(),
      }))
    })
    persist(npcs)
    set({ npcs })
  },

  updateInventoryItem(npcId, itemId, data) {
    const npcs = get().npcs.map(n => {
      if (n.id !== npcId) return n
      return withNormalizedGear(normalizeGameEntity({
        ...n,
        inventory: n.inventory.map(i => i.id === itemId ? { ...i, ...data } : i),
        updatedAt: new Date().toISOString(),
      }))
    })
    persist(npcs)
    set({ npcs })
  },

  removeInventoryItem(npcId, itemId) {
    const npcs = get().npcs.map(n => {
      if (n.id !== npcId) return n
      return withNormalizedGear(normalizeGameEntity({
        ...n,
        inventory: n.inventory.filter(i => i.id !== itemId),
        updatedAt: new Date().toISOString(),
      }))
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
      return withNormalizedGear(normalizeGameEntity({
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
      }))
    })
    persist(npcs)
    set({ npcs })
  },

  removeEquippedItem(npcId, itemId) {
    const npcs = get().npcs.map(n => {
      if (n.id !== npcId) return n
      return withNormalizedGear(normalizeGameEntity({
        ...n,
        equipped: n.equipped.filter(i => i.id !== itemId),
        updatedAt: new Date().toISOString(),
      }))
    })
    persist(npcs)
    set({ npcs })
  },

  setGearItem(npcId, category, data) {
    patchNPC(get, set, npcId, n => {
      const current = getGearItem(n, category)
      const merged = {
        ...(current || {}),
        ...data,
        passives: data.passives ?? current?.passives ?? [],
        weaponSkill: data.weaponSkill !== undefined ? data.weaponSkill : current?.weaponSkill,
      }
      const item = buildGearItem(category, merged)
      if (current) {
        return {
          ...n,
          equipped: n.equipped.map(i => i.id === current.id
            ? {
                ...i,
                ...item,
                id: i.id,
                passives: item.passives,
                weaponSkill: item.weaponSkill ?? null,
              }
            : i),
        }
      }
      return { ...n, equipped: [...(n.equipped || []), { id: genId(), ...item }] }
    })
  },

  setGearPassive(npcId, category, passive) {
    patchNPC(get, set, npcId, n => {
      const current = getGearItem(n, category)
      if (!current || !passive) return n
      const passives = upsertPassive(current.passives, passive)
      return {
        ...n,
        equipped: n.equipped.map(i => i.id === current.id ? { ...i, passives } : i),
      }
    })
  },

  setGearPassives(npcId, category, rolledList) {
    patchNPC(get, set, npcId, n => {
      const current = getGearItem(n, category)
      if (!current || !Array.isArray(rolledList)) return n
      const passives = rolledList.filter(Boolean)
      return {
        ...n,
        equipped: n.equipped.map(i => i.id === current.id ? { ...i, passives } : i),
      }
    })
  },

  setWeaponSkill(npcId, weaponSkill) {
    patchNPC(get, set, npcId, n => {
      const current = getGearItem(n, GEAR_CATEGORIES.WEAPON)
      if (!current) return n
      const skill = weaponSkill && typeof weaponSkill === 'object'
        ? {
            name: weaponSkill.name || '',
            description: weaponSkill.description || '',
            mechanicalEffect: weaponSkill.mechanicalEffect || '',
            narrativeConsequence: weaponSkill.narrativeConsequence || '',
            cooldownTurns: Number(weaponSkill.cooldownTurns) || 2,
            overloadCost: Number(weaponSkill.overloadCost) || 1,
          }
        : null
      return {
        ...n,
        equipped: n.equipped.map(i => i.id === current.id ? { ...i, weaponSkill: skill } : i),
      }
    })
  },
}))
