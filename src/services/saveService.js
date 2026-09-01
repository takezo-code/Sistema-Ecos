import { storage, KEYS } from './storage'
import { SAVE_VERSION, downloadJson, readJsonFile, generateSaveName } from '../utils/fileHelpers'
import { useCampaignStore } from '../store/useCampaignStore'
import { useCharacterStore } from '../store/useCharacterStore'
import { useGroupStore } from '../store/useGroupStore'
import { useNPCStore } from '../store/useNPCStore'
import { useOrganizationStore } from '../store/useOrganizationStore'
import { useNarrativeStore } from '../store/useNarrativeStore'
import { useDiceStore } from '../store/useDiceStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { useSaveStore } from '../store/useSaveStore'
import { useTrashStore } from '../store/useTrashStore'
import { useSkillsCatalogStore } from '../store/useSkillsCatalogStore'
import { useCombatStore } from '../store/useCombatStore'
import { useCharacterPanelStore } from '../store/useCharacterPanelStore'
import { genId } from '../utils/id'
import { normalizeGameEntity } from '../constants/attributes'
import { loadCustomSkills, saveCustomSkills } from './skillsCatalogService'
import { migrateOrphanEntitiesToActiveCampaign } from './campaignScopeService'

function normalizeEvent(e) {
  return {
    ...e,
    type: e.type || 'historia',
    choices: Array.isArray(e.choices) ? e.choices : [],
    selectedChoiceId: e.selectedChoiceId ?? null,
    images: Array.isArray(e.images)
      ? e.images.filter(img => img?.src).map(img => ({
          id: img.id || genId(),
          src: img.src,
          caption: img.caption || '',
        }))
      : [],
  }
}

const SUPPORTED_VERSIONS = ['1.0.0']

let autoSaveTimer = null
let autoSaveRegistered = false

function deepClone(value) {
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return value
  }
}

function collectUiState() {
  try {
    return storage.get(KEYS.uiState) || {}
  } catch {
    return {}
  }
}

/** Filtra entidades de uma campanha específica (exportação portátil). */
function filterEntitiesForCampaign(items, campaignId) {
  return (items || []).filter(item => item?.campaignId === campaignId)
}

function collectTemplateIds(characters, npcs) {
  const ids = new Set()
  const scan = (entity) => {
    if (!entity) return
    for (const skill of entity.skills || []) {
      if (skill?.templateId) ids.add(skill.templateId)
    }
    for (const item of entity.equipped || []) {
      if (item?.weaponSkill?.templateId) ids.add(item.weaponSkill.templateId)
    }
  }
  characters.forEach(scan)
  npcs.forEach(scan)
  return ids
}

function exportSkillsCatalogForEntities(characters, npcs) {
  const needed = collectTemplateIds(characters, npcs)
  return loadCustomSkills().filter(skill => needed.has(skill.templateId))
}

function filterTrashForCampaign(campaignId) {
  return (storage.get(KEYS.trash) || []).filter(
    entry => entry?.campaignId === campaignId || entry?.data?.campaignId === campaignId,
  )
}

function collectCombatSessionForCampaign(campaignId) {
  const session = storage.get(KEYS.combatSession) || {}
  if (session.campaignId !== campaignId) return null
  return deepClone(session)
}

/** Pacote completo de uma campanha — pronto para outro computador. */
export function generateCampaignPackage(campaignId) {
  const allCampaigns = useCampaignStore.getState().campaigns || []
  const campaign = allCampaigns.find(c => c.id === campaignId)
  if (!campaign) {
    throw new Error('Campanha não encontrada.')
  }

  const characters = filterEntitiesForCampaign(
    useCharacterStore.getState().characters,
    campaignId,
  )
  const groups = filterEntitiesForCampaign(
    useGroupStore.getState().groups,
    campaignId,
  )
  const npcs = filterEntitiesForCampaign(
    useNPCStore.getState().npcs,
    campaignId,
  )
  const organizations = filterEntitiesForCampaign(
    useOrganizationStore.getState().organizations,
    campaignId,
  )
  const events = filterEntitiesForCampaign(
    useNarrativeStore.getState().events,
    campaignId,
  )
  const diceHistory = filterEntitiesForCampaign(
    useDiceStore.getState().history,
    campaignId,
  )
  const skillsCatalog = exportSkillsCatalogForEntities(characters, npcs)
  const trash = deepClone(filterTrashForCampaign(campaignId))
  const combatSession = collectCombatSessionForCampaign(campaignId)
  const uiState = deepClone(collectUiState())

  return {
    version: SAVE_VERSION,
    kind: 'campaign_package',
    exportedAt: new Date().toISOString(),
    createdAt: campaign.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activeCampaignId: campaignId,
    campaigns: [deepClone(campaign)],
    characters: deepClone(characters),
    groups: deepClone(groups),
    npcs: deepClone(npcs),
    organizations: deepClone(organizations),
    events: deepClone(events),
    diceHistory: deepClone(diceHistory),
    skillsCatalog,
    trash,
    combatSession,
    settings: deepClone(useSettingsStore.getState().settings || { autosaveEnabled: true }),
    uiState,
    metadata: {
      totalCharacters: characters.length,
      totalNPCs: npcs.length,
      totalOrganizations: organizations.length,
      totalGroups: groups.length,
      totalEvents: events.length,
      totalCampaigns: 1,
      campaignName: campaign.name,
    },
  }
}

/** Coleta snapshot da campanha ativa (autosave legado) */
export function generateSaveData(extra = {}) {
  const activeCampaignId = useCampaignStore.getState().activeCampaignId
  if (!activeCampaignId) {
    return {
      version: SAVE_VERSION,
      exportedAt: new Date().toISOString(),
      activeCampaignId: null,
      campaigns: [],
      characters: [],
      groups: [],
      npcs: [],
      organizations: [],
      events: [],
      diceHistory: [],
      skillsCatalog: [],
      trash: [],
      combatSession: null,
      settings: useSettingsStore.getState().settings || {},
      uiState: deepClone({ ...collectUiState(), ...extra.uiState }),
      metadata: { totalCampaigns: 0 },
    }
  }
  const base = generateCampaignPackage(activeCampaignId)
  return {
    ...base,
    settings: deepClone(useSettingsStore.getState().settings || {}),
    uiState: deepClone({ ...collectUiState(), ...extra.uiState }),
    metadata: { ...base.metadata, ...(extra.metadata || {}) },
  }
}

function collectExistingEntityIds() {
  return {
    characters: new Set((useCharacterStore.getState().characters || []).map(c => c.id).filter(Boolean)),
    groups: new Set((useGroupStore.getState().groups || []).map(g => g.id).filter(Boolean)),
    npcs: new Set((useNPCStore.getState().npcs || []).map(n => n.id).filter(Boolean)),
    organizations: new Set((useOrganizationStore.getState().organizations || []).map(o => o.id).filter(Boolean)),
    events: new Set((useNarrativeStore.getState().events || []).map(e => e.id).filter(Boolean)),
    dice: new Set((useDiceStore.getState().history || []).map(r => r.id).filter(Boolean)),
    trash: new Set((storage.get(KEYS.trash) || []).map(t => t.id).filter(Boolean)),
  }
}

function remapId(id, usedIds, idMap) {
  if (!id) return id
  if (idMap[id]) return idMap[id]
  if (!usedIds.has(id)) {
    idMap[id] = id
    usedIds.add(id)
    return id
  }
  const next = genId()
  idMap[id] = next
  usedIds.add(next)
  return next
}

function entitiesBelongingToCampaign(incoming, sourceCampaignId) {
  const belongs = item => item?.campaignId === sourceCampaignId
  return {
    characters: (incoming.characters || []).filter(belongs),
    groups: (incoming.groups || []).filter(belongs),
    npcs: (incoming.npcs || []).filter(belongs),
    organizations: (incoming.organizations || []).filter(belongs),
    events: (incoming.events || []).filter(belongs),
    diceHistory: (incoming.diceHistory || []).filter(belongs),
    skillsCatalog: incoming.skillsCatalog || [],
    trash: (incoming.trash || []).filter(
      entry => entry?.campaignId === sourceCampaignId || entry?.data?.campaignId === sourceCampaignId,
    ),
    combatSession: incoming.combatSession?.campaignId === sourceCampaignId
      ? incoming.combatSession
      : null,
  }
}

function remapCampaignPackage(incoming, sourceCampaign, existingCampaignIds, usedIds) {
  const idMap = {}
  const sourceCampaignId = sourceCampaign.id
  let targetCampaignId = sourceCampaignId
  if (existingCampaignIds.has(sourceCampaignId)) {
    targetCampaignId = genId()
  }
  existingCampaignIds.add(targetCampaignId)

  const bundle = entitiesBelongingToCampaign(incoming, sourceCampaignId)
  const remapList = (list, key) => list.map(item => {
    const id = remapId(item.id, usedIds[key], idMap)
    return { ...item, id, campaignId: targetCampaignId }
  })

  let characters = remapList(bundle.characters, 'characters')
  let groups = remapList(bundle.groups, 'groups').map(group => ({
    ...group,
    memberIds: (group.memberIds || []).map(mid => idMap[mid] || mid),
  }))
  const npcs = remapList(bundle.npcs, 'npcs')
  const organizations = remapList(bundle.organizations, 'organizations')
  const events = remapList(bundle.events, 'events').map(normalizeEvent)
  const diceHistory = remapList(bundle.diceHistory, 'dice')

  characters = characters.map(c => normalizeGameEntity(c))
  const normalizedNpcs = npcs.map(n => normalizeGameEntity(n))

  const campaign = {
    ...sourceCampaign,
    id: targetCampaignId,
    updatedAt: new Date().toISOString(),
  }

  const trash = (bundle.trash || []).map(entry => ({
    ...entry,
    id: remapId(entry.id, usedIds.trash, idMap),
    campaignId: targetCampaignId,
    data: entry.data
      ? { ...entry.data, campaignId: targetCampaignId }
      : entry.data,
  }))

  let combatSession = bundle.combatSession
  if (combatSession) {
    combatSession = {
      ...combatSession,
      campaignId: targetCampaignId,
      combatGroupId: combatSession.combatGroupId
        ? (idMap[combatSession.combatGroupId] || combatSession.combatGroupId)
        : null,
      activeEnemyIds: Array.isArray(combatSession.activeEnemyIds)
        ? combatSession.activeEnemyIds.map(id => idMap[id] || id).filter(Boolean)
        : combatSession.activeEnemyId
          ? [idMap[combatSession.activeEnemyId] || combatSession.activeEnemyId]
          : [],
      rollHistory: (combatSession.rollHistory || []).map(roll => ({
        ...roll,
        id: remapId(roll.id, usedIds.dice, idMap),
        campaignId: targetCampaignId,
        actorId: roll.actorId ? (idMap[roll.actorId] || roll.actorId) : roll.actorId,
      })),
    }
  }

  return {
    campaign,
    campaignId: targetCampaignId,
    characters,
    groups,
    npcs: normalizedNpcs,
    organizations,
    events,
    diceHistory,
    skillsCatalog: bundle.skillsCatalog || [],
    trash,
    combatSession,
  }
}

/** Adiciona campanha(s) do arquivo sem sobrescrever saves locais. */
function mergeImportedSkillsCatalog(incomingSkills) {
  if (!incomingSkills?.length) return
  const current = loadCustomSkills()
  const byId = new Map(current.map(skill => [skill.templateId, skill]))
  incomingSkills.forEach(skill => {
    if (skill?.templateId) byId.set(skill.templateId, skill)
  })
  saveCustomSkills([...byId.values()])
  useSkillsCatalogStore.getState().reload()
}

function mergeImportedTrash(incomingTrash) {
  if (!incomingTrash?.length) return
  const current = storage.get(KEYS.trash) || []
  const known = new Set(current.map(entry => entry.id))
  const merged = [
    ...incomingTrash.filter(entry => entry?.id && !known.has(entry.id)),
    ...current,
  ]
  storage.set(KEYS.trash, merged)
  useTrashStore.setState({ items: merged })
}

/** Adiciona campanha(s) do arquivo sem sobrescrever saves locais. */
function appendCampaignPackages(incoming) {
  const campaignsToImport = incoming.campaigns || []
  if (!campaignsToImport.length) {
    throw new Error('O arquivo não contém nenhuma campanha.')
  }

  const existingCampaignIds = new Set(
    (useCampaignStore.getState().campaigns || []).map(c => c.id).filter(Boolean),
  )
  const usedIds = collectExistingEntityIds()
  const appended = []

  for (const sourceCampaign of campaignsToImport) {
    const remapped = remapCampaignPackage(incoming, sourceCampaign, existingCampaignIds, usedIds)
    appended.push(remapped)
  }

  useCampaignStore.setState({
    campaigns: [
      ...(useCampaignStore.getState().campaigns || []),
      ...appended.map(a => a.campaign),
    ],
  })
  useCharacterStore.setState({
    characters: [
      ...(useCharacterStore.getState().characters || []),
      ...appended.flatMap(a => a.characters),
    ],
  })
  useGroupStore.setState({
    groups: [
      ...(useGroupStore.getState().groups || []),
      ...appended.flatMap(a => a.groups),
    ],
  })
  useNPCStore.setState({
    npcs: [
      ...(useNPCStore.getState().npcs || []),
      ...appended.flatMap(a => a.npcs),
    ],
  })
  useOrganizationStore.setState({
    organizations: [
      ...(useOrganizationStore.getState().organizations || []),
      ...appended.flatMap(a => a.organizations),
    ],
  })
  useNarrativeStore.setState({
    events: [
      ...(useNarrativeStore.getState().events || []),
      ...appended.flatMap(a => a.events),
    ],
  })
  useDiceStore.setState({
    history: [
      ...(useDiceStore.getState().history || []),
      ...appended.flatMap(a => a.diceHistory),
    ],
  })

  mergeImportedSkillsCatalog(appended.flatMap(a => a.skillsCatalog || []))
  mergeImportedTrash(appended.flatMap(a => a.trash || []))

  const lastCombat = appended[appended.length - 1]?.combatSession
  if (lastCombat) {
    useCombatStore.getState().replaceSession(lastCombat)
  }

  const last = appended[appended.length - 1]
  return {
    addedCount: appended.length,
    campaignId: last?.campaignId ?? null,
    campaignName: last?.campaign?.name ?? null,
  }
}

export function persistWorkspaceFromStores() {
  storage.set(KEYS.campaigns, useCampaignStore.getState().campaigns || [])
  storage.set(KEYS.activeCampaign, useCampaignStore.getState().activeCampaignId ?? null)
  storage.set(KEYS.characters, useCharacterStore.getState().characters || [])
  storage.set(KEYS.groups, useGroupStore.getState().groups || [])
  storage.set(KEYS.npcs, useNPCStore.getState().npcs || [])
  storage.set(KEYS.organizations, useOrganizationStore.getState().organizations || [])
  storage.set(KEYS.narrative, useNarrativeStore.getState().events || [])
  storage.set(KEYS.diceHistory, useDiceStore.getState().history || [])
  storage.set(KEYS.appBootstrapped, true)
}

export function activateCampaign(campaignId) {
  const exists = (useCampaignStore.getState().campaigns || []).some(c => c.id === campaignId)
  if (!exists) throw new Error('Campanha não encontrada.')
  useCampaignStore.getState().setActiveCampaign(campaignId)
  migrateOrphanEntitiesToActiveCampaign()
  persistWorkspaceFromStores()
}

export function addCampaign(campaignName) {
  const name = String(campaignName || '').trim() || suggestCampaignName()
  const now = new Date().toISOString()
  const campaign = {
    id: genId(),
    name,
    description: '',
    timeline: { past: '', present: '', future: '' },
    status: 'ativa',
    createdAt: now,
    updatedAt: now,
  }
  const campaigns = [...(useCampaignStore.getState().campaigns || []), campaign]
  useCampaignStore.setState({ campaigns, activeCampaignId: campaign.id })
  persistWorkspaceFromStores()
  return campaign
}

export function suggestCampaignName(base = 'Campanha') {
  const campaigns = useCampaignStore.getState().campaigns || []
  const existing = new Set(campaigns.map(c => String(c.name || '').trim().toLowerCase()))
  const root = String(base || 'Campanha').trim() || 'Campanha'
  if (!existing.has(root.toLowerCase())) return root
  let n = 2
  while (existing.has(`${root} ${n}`.toLowerCase())) n += 1
  return `${root} ${n}`
}

export function renameCampaign(campaignId, campaignName) {
  const name = String(campaignName || '').trim()
  if (!name) throw new Error('Informe um nome para a campanha.')
  const exists = (useCampaignStore.getState().campaigns || []).some(c => c.id === campaignId)
  if (!exists) throw new Error('Campanha não encontrada.')
  useCampaignStore.getState().updateCampaign(campaignId, { name })
  persistWorkspaceFromStores()
}

export function removeCampaign(campaignId) {
  const result = useCampaignStore.getState().deleteCampaign(campaignId)
  if (!result?.ok) throw new Error(result?.message || 'Não foi possível excluir a campanha.')
  persistWorkspaceFromStores()
  const { campaigns, activeCampaignId } = useCampaignStore.getState()
  if (campaigns.length && !activeCampaignId) {
    activateCampaign(campaigns[campaigns.length - 1].id)
  }
  return result
}

export function getCampaignSlotSummary(campaignId, stores = {}) {
  const belongs = item => item?.campaignId === campaignId
  const characters = (stores.characters ?? useCharacterStore.getState().characters ?? []).filter(belongs)
  const npcs = (stores.npcs ?? useNPCStore.getState().npcs ?? []).filter(belongs)
  const groups = (stores.groups ?? useGroupStore.getState().groups ?? []).filter(belongs)
  return {
    characters: characters.length,
    npcs: npcs.length,
    groups: groups.length,
  }
}

function campaignFilename(campaignName) {
  const slug = String(campaignName || 'campanha')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 40) || 'campanha'
  return generateSaveName(`ecos-${slug}`)
}

function writeStorageFromSave(data) {
  storage.set(KEYS.campaigns, data.campaigns || [])
  storage.set(KEYS.activeCampaign, data.activeCampaignId ?? null)
  storage.set(KEYS.characters, data.characters || [])
  storage.set(KEYS.groups, data.groups || [])
  storage.set(KEYS.npcs, data.npcs || [])
  storage.set(KEYS.organizations, data.organizations || [])
  storage.set(KEYS.narrative, data.events || [])
  storage.set(KEYS.diceHistory, data.diceHistory || [])
  if (Array.isArray(data.skillsCatalog)) {
    saveCustomSkills(data.skillsCatalog)
  }
  if (Array.isArray(data.trash)) {
    storage.set(KEYS.trash, data.trash)
  }
  if (data.combatSession) {
    storage.set(KEYS.combatSession, data.combatSession)
  }
  storage.set(KEYS.settings, data.settings || {})
  storage.set(KEYS.uiState, data.uiState || {})
  storage.set(KEYS.autosave, data)
  storage.set(KEYS.appBootstrapped, true)
}

/** Hidrata todos os Zustand stores a partir dos dados do save (substitui workspace inteiro). */
export function restoreSaveData(data, { silent = false } = {}) {
  const validation = validateSaveFile(data)
  if (!validation.valid) {
    const err = new Error(validation.errors[0] || 'Save inválido')
    err.validation = validation
    throw err
  }

  const payload = validation.normalized
  payload.characters = (payload.characters || []).map(c => normalizeGameEntity(c))
  payload.npcs = (payload.npcs || []).map(n => normalizeGameEntity(n))
  payload.events = (payload.events || []).map(normalizeEvent)

  writeStorageFromSave(payload)

  useCampaignStore.setState({
    campaigns: payload.campaigns,
    activeCampaignId: payload.activeCampaignId,
  })
  useCharacterStore.setState({
    characters: payload.characters,
    lastLevelUps: [],
    lastMasterError: null,
  })
  useGroupStore.setState({ groups: payload.groups })
  useNPCStore.setState({ npcs: payload.npcs })
  useOrganizationStore.setState({ organizations: payload.organizations })
  useNarrativeStore.setState({ events: payload.events })
  useDiceStore.setState({ history: payload.diceHistory })
  useSkillsCatalogStore.getState().reload()
  useTrashStore.setState({ items: payload.trash || storage.get(KEYS.trash) || [] })
  if (payload.combatSession) {
    useCombatStore.getState().replaceSession(payload.combatSession)
  }
  useSettingsStore.setState({
    settings: { ...useSettingsStore.getState().settings, ...payload.settings },
  })

  if (!silent) {
    useSaveStore.getState().showToast('Campanha restaurada com sucesso.', 'success')
  }

  return payload
}

export function validateSaveFile(data) {
  const errors = []
  const warnings = []

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Arquivo de save vazio ou inválido.'], warnings: [] }
  }

  if (!data.version) {
    errors.push('Versão do save não encontrada.')
  } else if (!SUPPORTED_VERSIONS.includes(data.version)) {
    warnings.push(`Versão ${data.version} pode não ser totalmente compatível. Suportado: ${SUPPORTED_VERSIONS.join(', ')}`)
  }

  const arrayKeys = ['campaigns', 'characters', 'groups', 'npcs', 'organizations', 'events']
  arrayKeys.forEach(key => {
    if (data[key] != null && !Array.isArray(data[key])) {
      errors.push(`Campo "${key}" deve ser uma lista.`)
    }
  })

  if (data.diceHistory != null && !Array.isArray(data.diceHistory)) {
    errors.push('Campo "diceHistory" deve ser uma lista.')
  }

  const normalized = {
    version: data.version || SAVE_VERSION,
    exportedAt: data.exportedAt || new Date().toISOString(),
    createdAt: data.createdAt || data.exportedAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    activeCampaignId: data.activeCampaignId ?? null,
    campaigns: Array.isArray(data.campaigns) ? data.campaigns : [],
    characters: Array.isArray(data.characters) ? data.characters : [],
    groups: Array.isArray(data.groups) ? data.groups : [],
    npcs: Array.isArray(data.npcs) ? data.npcs : [],
    organizations: Array.isArray(data.organizations) ? data.organizations : [],
    events: Array.isArray(data.events) ? data.events : [],
    diceHistory: Array.isArray(data.diceHistory) ? data.diceHistory : [],
    skillsCatalog: Array.isArray(data.skillsCatalog) ? data.skillsCatalog : [],
    trash: Array.isArray(data.trash) ? data.trash : [],
    combatSession: data.combatSession && typeof data.combatSession === 'object'
      ? data.combatSession
      : null,
    settings: typeof data.settings === 'object' && data.settings ? data.settings : {},
    uiState: typeof data.uiState === 'object' && data.uiState ? data.uiState : {},
    metadata: data.metadata || {},
  }

  if (normalized.activeCampaignId) {
    const exists = normalized.campaigns.some(c => c.id === normalized.activeCampaignId)
    if (!exists) {
      warnings.push('Campanha ativa não encontrada na lista; será desativada.')
      normalized.activeCampaignId = normalized.campaigns[0]?.id ?? null
    }
  }

  const campaignIds = new Set(normalized.campaigns.map(c => c.id))
  const charIds = new Set(normalized.characters.map(c => c.id))

  normalized.groups.forEach(g => {
    (g.memberIds || []).forEach(mid => {
      if (!charIds.has(mid)) warnings.push(`Grupo "${g.name}": membro ${mid} não encontrado.`)
    })
    if (g.campaignId && !campaignIds.has(g.campaignId)) {
      warnings.push(`Grupo "${g.name}": campanha vinculada ausente.`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalized,
  }
}

export function downloadSaveFile(data, filename) {
  const name = filename || generateSaveName()
  downloadJson(data, name)
  return name
}

export function readSaveFile(file) {
  return readJsonFile(file)
}

export function exportCampaignById(campaignId, filename) {
  const data = generateCampaignPackage(campaignId)
  const campaignName = data.campaigns?.[0]?.name || 'campanha'
  const name = filename || campaignFilename(campaignName)
  downloadSaveFile(data, name)
  useSettingsStore.getState().updateSettings({ lastManualSaveAt: new Date().toISOString() })
  useSaveStore.getState().showToast(`Campanha exportada: ${name}`, 'success')
  return { data, filename: name }
}

export function exportCampaign(filename) {
  const activeCampaignId = useCampaignStore.getState().activeCampaignId
  if (!activeCampaignId) {
    useSaveStore.getState().showToast('Selecione uma campanha antes de exportar.', 'error')
    return null
  }
  return exportCampaignById(activeCampaignId, filename)
}

export async function importCampaign(file) {
  try {
    const raw = await readSaveFile(file)
    const validation = validateSaveFile(raw)
    if (!validation.valid) {
      throw new Error(validation.errors[0] || 'Save inválido')
    }
    const result = appendCampaignPackages(validation.normalized)
    migrateOrphanEntitiesToActiveCampaign()
    persistWorkspaceFromStores()
    const label = result.campaignName || 'Campanha'
    useSaveStore.getState().showToast(
      `"${label}" adicionada a este computador (${result.addedCount} slot(s)).`,
      'success',
    )
    return { ok: true, ...result }
  } catch (e) {
    const msg = e.message || 'Falha ao importar campanha.'
    useSaveStore.getState().showToast(msg, 'error')
    console.error('[importCampaign]', e)
    return { ok: false, error: msg }
  }
}

export function manualSave() {
  return exportCampaign()
}

export function autoSave() {
  const settings = useSettingsStore.getState().settings
  if (settings?.autosaveEnabled === false) return

  clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(() => {
    try {
      const data = generateSaveData()
      storage.set(KEYS.autosave, data)
      storage.set(KEYS.autosaveAt, new Date().toISOString())
      useSettingsStore.getState().updateSettings({ lastAutoSaveAt: new Date().toISOString() })
    } catch (e) {
      console.error('[autoSave]', e)
    }
  }, 450)
}

export function registerAutoSaveOnStorage() {
  if (autoSaveRegistered) return
  storage.onSet((key) => {
    if (key === KEYS.autosave || key === KEYS.autosaveAt) return
    autoSave()
  })
  autoSaveRegistered = true
}

export function restoreFromAutoSave() {
  const data = storage.get(KEYS.autosave)
  if (!data) return null
  try {
    return restoreSaveData(data, { silent: true })
  } catch (e) {
    console.warn('[restoreFromAutoSave] fallback falhou:', e)
    return null
  }
}

export function hasExistingWorkspace() {
  const campaigns = storage.get(KEYS.campaigns)
  return Array.isArray(campaigns) && campaigns.length > 0
}

export function isAppBootstrapped() {
  return storage.get(KEYS.appBootstrapped) === true || hasExistingWorkspace()
}

export function createEmptySave(campaignName = 'Nova Campanha') {
  const now = new Date().toISOString()
  const campaign = {
    id: genId(),
    name: campaignName,
    description: '',
    timeline: { past: '', present: '', future: '' },
    status: 'ativa',
    createdAt: now,
    updatedAt: now,
  }

  return {
    version: SAVE_VERSION,
    exportedAt: now,
    createdAt: now,
    updatedAt: now,
    activeCampaignId: campaign.id,
    campaigns: [campaign],
    characters: [],
    groups: [],
    npcs: [],
    organizations: [],
    events: [],
    diceHistory: [],
    skillsCatalog: [],
    trash: [],
    combatSession: null,
    settings: { autosaveEnabled: true },
    uiState: {},
    metadata: {
      totalCharacters: 0,
      totalNPCs: 0,
      totalOrganizations: 0,
      totalGroups: 0,
      totalEvents: 0,
      totalCampaigns: 1,
    },
  }
}

export function initializeNewCampaign(campaignName = 'Nova Campanha') {
  if (!hasExistingWorkspace()) {
    const empty = createEmptySave(campaignName)
    restoreSaveData(empty, { silent: true })
    autoSave()
    return empty
  }
  const campaign = addCampaign(campaignName)
  autoSave()
  return { campaigns: [campaign], activeCampaignId: campaign.id }
}

/**
 * Apaga personagens, NPCs, bosses, orgs, grupos, sessões, lixeira, etc.
 * Mantém uma campanha vazia pronta para testes.
 */
export function resetAllTestData(campaignName = 'Nova Campanha') {
  storage.clear()
  const empty = createEmptySave(campaignName)
  restoreSaveData(empty, { silent: true })

  useTrashStore.setState({ items: [] })
  useSkillsCatalogStore.getState().reload()
  useCombatStore.setState({
    campaignId: empty.activeCampaignId,
    combatGroupId: null,
    activeEnemyIds: [],
    lastRoll: null,
    rollHistory: [],
  })
  useCharacterPanelStore.setState({ selectedCharacterId: null })

  useSaveStore.getState().showToast('Dados de teste apagados. Campanha limpa.', 'success')
  return empty
}

export function persistUiState(uiState) {
  storage.set(KEYS.uiState, uiState)
  autoSave()
}
