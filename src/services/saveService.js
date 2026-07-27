import { storage, KEYS } from './storage'
import { SAVE_VERSION, downloadJson, readJsonFile, generateSaveName } from '../utils/fileHelpers'
import { useCampaignStore } from '../store/useCampaignStore'
import { useCharacterStore } from '../store/useCharacterStore'
import { useGroupStore } from '../store/useGroupStore'
import { useNPCStore } from '../store/useNPCStore'
import { useOrganizationStore } from '../store/useOrganizationStore'
import { useSessionStore } from '../store/useSessionStore'
import { useNarrativeStore } from '../store/useNarrativeStore'
import { useDiceStore } from '../store/useDiceStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { useSaveStore } from '../store/useSaveStore'
import { genId } from '../utils/id'
import { normalizeGameEntity } from '../constants/attributes'
import { filterByActiveCampaign } from '../utils/campaignScope'

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

/** Coleta snapshot da campanha ativa (sessão atual) */
export function generateSaveData(extra = {}) {
  const allCampaigns = useCampaignStore.getState().campaigns || []
  const activeCampaignId = useCampaignStore.getState().activeCampaignId
  const activeCampaign = allCampaigns.find(c => c.id === activeCampaignId) || null

  const characters = filterByActiveCampaign(
    useCharacterStore.getState().characters || [],
    activeCampaignId
  )
  const groups = filterByActiveCampaign(useGroupStore.getState().groups || [], activeCampaignId)
  const npcs = filterByActiveCampaign(useNPCStore.getState().npcs || [], activeCampaignId)
  const organizations = filterByActiveCampaign(
    useOrganizationStore.getState().organizations || [],
    activeCampaignId
  )
  const sessions = filterByActiveCampaign(useSessionStore.getState().sessions || [], activeCampaignId)
  const events = filterByActiveCampaign(useNarrativeStore.getState().events || [], activeCampaignId)
  const diceHistory = useDiceStore.getState().history || []
  const settings = useSettingsStore.getState().settings || {}

  const createdAt = activeCampaign?.createdAt || new Date().toISOString()

  return {
    version: SAVE_VERSION,
    exportedAt: new Date().toISOString(),
    createdAt,
    updatedAt: new Date().toISOString(),
    activeCampaignId: activeCampaignId ?? null,
    campaigns: activeCampaign ? [deepClone(activeCampaign)] : [],
    characters: deepClone(characters),
    groups: deepClone(groups),
    npcs: deepClone(npcs),
    organizations: deepClone(organizations),
    sessions: deepClone(sessions),
    events: deepClone(events),
    diceHistory: deepClone(diceHistory),
    settings: deepClone(settings),
    uiState: deepClone({ ...collectUiState(), ...extra.uiState }),
    metadata: {
      totalCharacters: characters.length,
      totalNPCs: npcs.length,
      totalOrganizations: organizations.length,
      totalGroups: groups.length,
      totalSessions: sessions.length,
      totalEvents: events.length,
      totalCampaigns: activeCampaign ? 1 : 0,
      campaignName: activeCampaign?.name || null,
      ...extra.metadata,
    },
  }
}

function writeStorageFromSave(data) {
  storage.set(KEYS.campaigns, data.campaigns || [])
  storage.set(KEYS.activeCampaign, data.activeCampaignId ?? null)
  storage.set(KEYS.characters, data.characters || [])
  storage.set(KEYS.groups, data.groups || [])
  storage.set(KEYS.npcs, data.npcs || [])
  storage.set(KEYS.organizations, data.organizations || [])
  storage.set(KEYS.sessions, data.sessions || [])
  storage.set(KEYS.narrative, data.events || [])
  storage.set(KEYS.diceHistory, data.diceHistory || [])
  storage.set(KEYS.settings, data.settings || {})
  storage.set(KEYS.uiState, data.uiState || {})
  storage.set(KEYS.autosave, data)
  storage.set(KEYS.appBootstrapped, true)
}

/** Hidrata todos os Zustand stores a partir dos dados do save */
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
  useSessionStore.setState({ sessions: payload.sessions })
  useNarrativeStore.setState({ events: payload.events })
  useDiceStore.setState({ history: payload.diceHistory })
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

  const arrayKeys = ['campaigns', 'characters', 'groups', 'npcs', 'organizations', 'sessions', 'events']
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
    sessions: Array.isArray(data.sessions) ? data.sessions : [],
    events: Array.isArray(data.events) ? data.events : [],
    diceHistory: Array.isArray(data.diceHistory) ? data.diceHistory : [],
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

export function exportCampaign(filename) {
  const activeCampaignId = useCampaignStore.getState().activeCampaignId
  if (!activeCampaignId) {
    useSaveStore.getState().showToast('Selecione uma campanha ativa em Campanhas antes de salvar.', 'error')
    return null
  }
  const data = generateSaveData()
  storage.set(KEYS.autosave, data)
  storage.set(KEYS.autosaveAt, new Date().toISOString())
  const name = downloadSaveFile(data, filename)
  useSettingsStore.getState().updateSettings({ lastManualSaveAt: new Date().toISOString() })
  useSaveStore.getState().showToast(`Save exportado: ${name}`, 'success')
  return { data, filename: name }
}

export async function importCampaign(file) {
  try {
    const raw = await readSaveFile(file)
    const restored = restoreSaveData(raw)
    autoSave()
    return { ok: true, data: restored }
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
    sessions: [],
    events: [],
    diceHistory: [],
    settings: { autosaveEnabled: true },
    uiState: {},
    metadata: {
      totalCharacters: 0,
      totalNPCs: 0,
      totalOrganizations: 0,
      totalGroups: 0,
      totalSessions: 0,
      totalEvents: 0,
      totalCampaigns: 1,
    },
  }
}

export function initializeNewCampaign(campaignName = 'Nova Campanha') {
  storage.clear()
  const empty = createEmptySave(campaignName)
  restoreSaveData(empty, { silent: true })
  autoSave()
  return empty
}

export function persistUiState(uiState) {
  storage.set(KEYS.uiState, uiState)
  autoSave()
}
