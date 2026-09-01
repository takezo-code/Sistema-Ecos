import { create } from 'zustand'
import { storage, KEYS } from '../services/storage'
import { genId } from '../utils/id'
import {
  normalizeGameEntity,
  defaultAttributes,
  defaultSocialAttributes,
} from '../constants/attributes'
import {
  applyXpGain,
  applyPendingAttributePoint,
  applyPendingSocialPoint,
  applyInitialAttributeChange,
  applyAttributePointSpend,
  validateStartingAttributesDistributed,
  validateStartingSocialDistributed,
  validateStartingEcoSkillSelected,
  validateStartingCharacterName,
  validateStartingClassSelected,
  applyMasterAttributeChange,
  buildMasterProgressionPatch,
  syncProgressionToLevel,
  clampMasterAuxiliary as buildClampMasterAuxiliaryPatch,
  scaleAttributesToBudget,
} from '../services/progressionService'
import { investSkillPoint as investSkillPointEngine, upgradeSkillGrade as upgradeSkillGradeEngine } from '../mechanics/skills/classSkillProgressionEngine'

import { useEcoSkill as runEcoSkillUse, restEcoOverload, masterSetEcoOverload } from '../services/ecoOverloadService'
import {
  activateCharacterSkill,
  advanceCharacterTurn,
  buildSkillInstanceFromCatalog,
} from '../services/ecoSkillRuntimeService'
import { catalogSkillAllowedForEntity, getCatalogSkill } from '../services/skillsCatalogService'
import { enforceProgressionCaps } from '../services/progressionBudget'
import { archiveEntity, TRASH_TYPES } from '../services/trashService'
import { resolveCampaignId } from '../services/campaignScopeService'
import {
  applyDamageMarks as applyDamageMarksEngine,
  clearDamageMarks as clearDamageMarksEngine,
  healDamageMarks as healDamageMarksEngine,
} from '../mechanics/combat/damageMarksEngine'
import { buildGearItem, getGearItem, GEAR_CATEGORIES, normalizeEquippedGear } from '../mechanics/equipment/characterGear'
import { upsertPassive } from '../mechanics/equipment/gearPassiveEngine'
import { canRestEcoInVoid } from '../mechanics/classes/classPassiveEngine'
import { applyBuffsToEntity } from '../mechanics/skills/skillBuffEngine'

const withNormalizedGear = (entity) => ({
  ...entity,
  equipped: normalizeEquippedGear(entity.equipped),
})

const load = () => (storage.get(KEYS.characters) || []).map(c => withNormalizedGear(normalizeGameEntity(c)))

const persist = (characters) => storage.set(KEYS.characters, characters)

function buildRecoverPatch(character, { resetEco = null } = {}) {
  const shouldResetEco = resetEco == null ? canRestEcoInVoid(character) : !!resetEco
  const ecoPatch = shouldResetEco ? restEcoOverload(character).patch : {}
  const merged = { ...character, ...ecoPatch }
  const marksPatch = clearDamageMarksEngine(merged).patch
  return { ...ecoPatch, ...marksPatch }
}

const patchCharacter = (get, set, id, patcher) => {
  const characters = get().characters.map(c => {
    if (c.id !== id) return c
    const next = typeof patcher === 'function' ? patcher(c) : { ...c, ...patcher }
    const normalized = withNormalizedGear(normalizeGameEntity({ ...next, updatedAt: new Date().toISOString() }))
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
    const nameCheck = validateStartingCharacterName(data)
    if (!nameCheck.ok) return null
    const classCheck = validateStartingClassSelected(data)
    if (!classCheck.ok) return null
    const preCheck = validateStartingAttributesDistributed(data)
    if (!preCheck.ok) return null
    const socialCheck = validateStartingSocialDistributed(data)
    if (!socialCheck.ok) return null
    const ecoCheck = validateStartingEcoSkillSelected(data)
    if (!ecoCheck.ok) return null
    let campaignId
    try {
      campaignId = resolveCampaignId(data.campaignId)
    } catch {
      return null
    }
    // starterWeapon/starterArmor são validados no formulário antes do save;
    // aqui só garantimos que o equipamento inicial foi montado.
    const equipped = Array.isArray(data.equipped) ? data.equipped : []
    if (equipped.length < 2) return null
    const persistable = { ...data }
    delete persistable.starterWeapon
    delete persistable.starterArmor
    const character = withNormalizedGear(normalizeGameEntity({
      ...persistable,
      id: genId(),
      campaignId,
      name: String(data.name || '').trim(),
      image: data.image || '',
      appearance: data.appearance || '',
      personality: data.personality || '',
      history: data.history || data.description || '',
      motivation: data.motivation || data.narrativeStatus || '',
      level: data.level ?? 1,
      xp: data.xp ?? 0,
      ecoPoints: data.ecoPoints ?? 0,
      pendingAttributePoints: data.pendingAttributePoints ?? 0,
      pendingSocialPoints: data.pendingSocialPoints ?? 0,
      skills: data.skills ?? [],
      attributes: { ...defaultAttributes(), ...(data.attributes || {}) },
      unspentAttributePoints: data.unspentAttributePoints ?? 0,
      creationAttributeFloors: data.creationAttributeFloors,
      socialAttributes: { ...defaultSocialAttributes(), ...(data.socialAttributes || {}) },
      unspentSocialPoints: data.unspentSocialPoints ?? 0,
      creationSocialFloors: data.creationSocialFloors,
      physicalState: data.physicalState || 'bem',
      mentalState: data.mentalState || 'estavel',
      inventory: data.inventory || [],
      equipped,
      backpackCapacity: data.backpackCapacity ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
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

  /** Descanso: limpa marcas. Eco só zera se for Sutura (Void). */
  recoverCharacter(characterId) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return false
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...buildRecoverPatch(ch) }))
    set({ lastOverloadEvents: [] })
    return true
  },

  /** Descanso do grupo: limpa marcas; Eco só da Sutura. */
  recoverGroupMembers(memberIds = []) {
    const idSet = new Set((memberIds || []).filter(Boolean))
    if (idSet.size === 0) return { recovered: 0, missing: 0, ecoReset: 0 }

    let recovered = 0
    let ecoReset = 0
    const characters = get().characters.map(c => {
      if (!idSet.has(c.id)) return c
      recovered++
      if (canRestEcoInVoid(c)) ecoReset++
      let next = withNormalizedGear(normalizeGameEntity({
        ...c,
        ...buildRecoverPatch(c),
        updatedAt: new Date().toISOString(),
      }))
      const { patch: caps } = enforceProgressionCaps(next)
      if (caps) next = { ...next, ...caps }
      return next
    })

    persist(characters)
    set({ characters, lastOverloadEvents: [] })
    return { recovered, missing: idSet.size - recovered, ecoReset }
  },

  /** Fim de sessão: zera Eco de todos os personagens listados (qualquer classe). */
  endSessionRestEco(memberIds = []) {
    const idSet = new Set((memberIds || []).filter(Boolean))
    if (idSet.size === 0) return { reset: 0 }

    let reset = 0
    const characters = get().characters.map(c => {
      if (!idSet.has(c.id)) return c
      reset++
      const { patch } = restEcoOverload(c)
      let next = withNormalizedGear(normalizeGameEntity({
        ...c,
        ...patch,
        updatedAt: new Date().toISOString(),
      }))
      const { patch: caps } = enforceProgressionCaps(next)
      if (caps) next = { ...next, ...caps }
      return next
    })

    persist(characters)
    set({ characters, lastOverloadEvents: [] })
    return { reset }
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

  spendPendingSocialAttribute(characterId, attrKey) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return false
    const patch = applyPendingSocialPoint(c, attrKey)
    if (!patch) return false
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...patch }))
    return true
  },

  changeSocialAttribute(characterId, attrKey, newValue) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return false
    const max = 8
    const value = Math.max(0, Math.min(max, Number(newValue) || 0))
    patchCharacter(get, set, characterId, ch => ({
      ...ch,
      socialAttributes: { ...ch.socialAttributes, [attrKey]: value },
    }))
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

  investSkillPoint(characterId, templateId) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return { ok: false, message: 'Personagem não encontrado' }
    const result = investSkillPointEngine(c, templateId)
    if (result.error) {
      set({ lastSkillError: result.error })
      return { ok: false, message: result.error.message }
    }
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...result.patch }))
    set({ lastSkillError: null })
    return { ok: true, level: result.level, unlocked: result.unlocked }
  },

  upgradeSkillGrade(characterId, templateId) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return { ok: false, message: 'Personagem não encontrado' }
    const result = upgradeSkillGradeEngine(c, templateId)
    if (result.error) {
      set({ lastSkillError: result.error })
      return { ok: false, message: result.error.message }
    }
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...result.patch }))
    set({ lastSkillError: null })
    return { ok: true, level: result.level, enteredGrade: result.enteredGrade }
  },

  useEcoSkill(characterId, skillId, options = {}) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return { ok: false }
    const result = runEcoSkillUse(c, skillId, options)
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
    if (!c) return { ok: false, message: 'Personagem não encontrado.' }
    if (!canRestEcoInVoid(c)) {
      return {
        ok: false,
        message: 'Só a Sutura consegue limpar Eco no Void. As demais classes resetam Eco ao encerrar a sessão.',
      }
    }
    const { patch } = restEcoOverload(c)
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...patch }))
    set({ lastOverloadEvents: [] })
    return { ok: true }
  },

  setEcoOverloadLevel(characterId, level) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return false
    const { patch } = masterSetEcoOverload(c, level)
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...patch }))
    return true
  },

  activateSkill(characterId, skillId, { allyIds } = {}) {
    const c = get().characters.find(ch => ch.id === characterId)
    if (!c) return { ok: false, message: 'Personagem não encontrado' }
    const result = activateCharacterSkill(c, skillId)
    if (!result.ok) {
      set({ lastSkillError: result.error })
      return { ok: false, message: result.error?.message }
    }
    patchCharacter(get, set, characterId, ch => ({ ...ch, ...result.patch }))
    if (result.partyBuffs?.length) {
      const targets = (allyIds?.length ? allyIds : [characterId]).filter(Boolean)
      for (const id of targets) {
        const buffs = result.partyBuffs.map(b => ({ ...b, id: genId() }))
        patchCharacter(get, set, id, ch => {
          const applied = applyBuffsToEntity(ch, buffs)
          return applied.applied ? { ...ch, ...applied.patch } : ch
        })
      }
    }
    if (result.partyHeal?.amount) {
      const targets = (allyIds?.length ? allyIds : [characterId]).filter(Boolean)
      for (const id of targets) {
        patchCharacter(get, set, id, ch => {
          const healed = healDamageMarksEngine(ch, result.partyHeal.amount)
          return { ...ch, ...healed.patch }
        })
      }
    }
    if (result.partyOverloadReduce?.amount) {
      const targets = (allyIds?.length ? allyIds : [characterId]).filter(Boolean)
      for (const id of targets) {
        patchCharacter(get, set, id, ch => {
          const cur = ch.ecoOverload ?? 0
          const next = Math.max(0, cur - result.partyOverloadReduce.amount)
          return { ...ch, ecoOverload: next }
        })
      }
    }
    if (result.events?.length) set({ lastOverloadEvents: result.events })
    set({ lastSkillError: null })
    const partyNote = result.partyBuffs?.length
      ? (allyIds?.length > 1
        ? `Aura aplicada em ${allyIds.length} personagens.`
        : 'Aura aplicada em você.')
      : result.partyHeal?.amount
        ? (allyIds?.length > 1
          ? `Refluxo curou ${allyIds.length} personagens (−${result.partyHeal.amount} marca(s) cada).`
          : `Cura: −${result.partyHeal.amount} marca(s).`)
        : result.partyOverloadReduce?.amount
          ? (allyIds?.length > 1
            ? `Purga reduziu sobrecarga de ${allyIds.length} personagens (−${result.partyOverloadReduce.amount} cada).`
            : `Purga: −${result.partyOverloadReduce.amount} sobrecarga.`)
          : null
    return {
      ok: true,
      warnings: [ ...(result.warnings || []), partyNote ].filter(Boolean),
      historyEntry: result.historyEntry,
    }
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
    if (!catalogSkillAllowedForEntity(templateId, c)) {
      return { ok: false, message: 'Esta habilidade é exclusiva de NPCs.' }
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
    const character = get().characters.find(c => c.id === id)
    if (!character) return
    archiveEntity(TRASH_TYPES.character, character)
  },

  addInventoryItem(characterId, item) {
    const payload = typeof item === 'string'
      ? { name: item, qty: 1 }
      : { ...item, name: item.name, qty: item.qty || 1 }
    patchCharacter(get, set, characterId, c => {
      const cap = c.backpackCapacity
      if (cap != null && c.inventory.length >= cap) return c

      // Empilha catalisador / mesmo itemId
      if (payload.itemId) {
        const idx = (c.inventory || []).findIndex(i => i.itemId === payload.itemId)
        if (idx >= 0) {
          const inventory = [...c.inventory]
          const cur = inventory[idx]
          inventory[idx] = { ...cur, qty: (Number(cur.qty) || 1) + (Number(payload.qty) || 1) }
          return { ...c, inventory }
        }
      }

      return {
        ...c,
        inventory: [...(c.inventory || []), { id: genId(), ...payload }],
      }
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
    const payload = typeof item === 'string'
      ? { name: item }
      : item
    patchCharacter(get, set, characterId, c => ({
      ...c,
      equipped: [...c.equipped, {
        id: genId(),
        name: payload.name || 'Item',
        slot: payload.slot || '',
        category: payload.category || 'arma',
        type: payload.type || null,
        image: payload.image || '',
        description: payload.description || '',
        passives: Array.isArray(payload.passives) ? payload.passives : [],
        equipmentId: payload.equipmentId || null,
      }],
    }))
  },

  updateEquippedItem(characterId, itemId, data) {
    patchCharacter(get, set, characterId, c => ({
      ...c,
      equipped: c.equipped.map(i => i.id === itemId ? { ...i, ...data, id: i.id } : i),
    }))
  },

  removeEquippedItem(characterId, itemId) {
    patchCharacter(get, set, characterId, c => ({
      ...c,
      equipped: c.equipped.filter(i => i.id !== itemId),
    }))
  },

  /**
   * Forja / reforja a peça do slot. Cada personagem tem uma arma e uma
   * armadura, então a peça anterior da mesma categoria é substituída.
   * Preserva passivas e skill da arma se não vierem no payload.
   */
  setGearItem(characterId, category, data) {
    patchCharacter(get, set, characterId, c => {
      const current = getGearItem(c, category)
      const merged = {
        ...(current || {}),
        ...data,
        passives: data.passives ?? current?.passives ?? [],
        weaponSkill: data.weaponSkill !== undefined ? data.weaponSkill : current?.weaponSkill,
      }
      const item = buildGearItem(category, merged)
      if (current) {
        return {
          ...c,
          equipped: c.equipped.map(i => i.id === current.id
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
      return { ...c, equipped: [...(c.equipped || []), { id: genId(), ...item }] }
    })
  },

  setGearPassive(characterId, category, passive) {
    patchCharacter(get, set, characterId, c => {
      const current = getGearItem(c, category)
      if (!current || !passive) return c
      const passives = upsertPassive(current.passives, passive)
      return {
        ...c,
        equipped: c.equipped.map(i => i.id === current.id ? { ...i, passives } : i),
      }
    })
  },

  setGearPassives(characterId, category, rolledList) {
    patchCharacter(get, set, characterId, c => {
      const current = getGearItem(c, category)
      if (!current || !Array.isArray(rolledList) || rolledList.length === 0) return c
      let passives = [...(current.passives || [])]
      for (const rolled of rolledList) {
        if (rolled) passives = upsertPassive(passives, rolled)
      }
      return {
        ...c,
        equipped: c.equipped.map(i => i.id === current.id ? { ...i, passives } : i),
      }
    })
  },

  setWeaponSkill(characterId, weaponSkill) {
    patchCharacter(get, set, characterId, c => {
      const current = getGearItem(c, GEAR_CATEGORIES.WEAPON)
      if (!current) return c
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
        ...c,
        equipped: c.equipped.map(i => i.id === current.id ? { ...i, weaponSkill: skill } : i),
      }
    })
  },
}))
