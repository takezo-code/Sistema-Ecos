import { storage, KEYS } from './storage'
import { genId } from '../utils/id'
import { normalizeGameEntity } from '../constants/attributes'
import { useCharacterStore } from '../store/useCharacterStore'
import { useNPCStore } from '../store/useNPCStore'
import { useOrganizationStore } from '../store/useOrganizationStore'
import { useGroupStore } from '../store/useGroupStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { useSessionStore } from '../store/useSessionStore'
import { useNarrativeStore } from '../store/useNarrativeStore'
import { useCombatStore } from '../store/useCombatStore'
import { loadCustomSkills, saveCustomSkills } from './skillsCatalogService'

export const TRASH_TYPES = {
  character: 'character',
  npc: 'npc',
  organization: 'organization',
  campaign: 'campaign',
  session: 'session',
  group: 'group',
  skill: 'skill',
  flow: 'flow',
}

export const TRASH_TYPE_LABELS = {
  character: 'Personagem',
  npc: 'NPC',
  organization: 'Organização',
  campaign: 'Campanha',
  session: 'Sessão',
  group: 'Grupo',
  skill: 'Skill',
  flow: 'Fluxo',
}

function normalizeTrashEntry(entry) {
  if (entry?.entityType === 'narrative') {
    return { ...entry, entityType: TRASH_TYPES.flow }
  }
  return entry
}

function loadTrash() {
  const raw = storage.get(KEYS.trash) || []
  return raw.map(normalizeTrashEntry)
}

function saveTrash(items) {
  storage.set(KEYS.trash, items)
}

function refreshTrashStore() {
  import('../store/useTrashStore')
    .then(({ useTrashStore }) => useTrashStore.getState().refresh())
    .catch(() => {})
}

function getEntityId(entityType, entity) {
  if (entityType === TRASH_TYPES.skill) return entity.templateId
  return entity.id
}

function getEntityName(entityType, entity) {
  if (entityType === TRASH_TYPES.session) return entity.title || 'Sessão'
  if (entityType === TRASH_TYPES.narrative) return entity.title || 'Evento'
  return entity.name || 'Sem nome'
}

function removeFromGroups(characterId) {
  const groups = useGroupStore.getState().groups.map(g => ({
    ...g,
    memberIds: (g.memberIds || []).filter(mid => mid !== characterId),
    updatedAt: new Date().toISOString(),
  }))
  storage.set(KEYS.groups, groups)
  useGroupStore.setState({ groups })
}

function removeFromActiveLists(entityType, entity) {
  const id = getEntityId(entityType, entity)

  if (entityType === TRASH_TYPES.character) {
    const characters = useCharacterStore.getState().characters.filter(c => c.id !== id)
    storage.set(KEYS.characters, characters)
    useCharacterStore.setState({ characters })
    removeFromGroups(id)
    return
  }

  if (entityType === TRASH_TYPES.npc) {
    const npcs = useNPCStore.getState().npcs.filter(n => n.id !== id)
    storage.set(KEYS.npcs, npcs)
    useNPCStore.setState({ npcs })
    return
  }

  if (entityType === TRASH_TYPES.organization) {
    const organizations = useOrganizationStore.getState().organizations.filter(o => o.id !== id)
    storage.set(KEYS.organizations, organizations)
    useOrganizationStore.setState({ organizations })
    return
  }

  if (entityType === TRASH_TYPES.campaign) {
    const campaigns = useCampaignStore.getState().campaigns.filter(c => c.id !== id)
    storage.set(KEYS.campaigns, campaigns)
    const activeId = useCampaignStore.getState().activeCampaignId
    const newActive = activeId === id ? null : activeId
    storage.set(KEYS.activeCampaign, newActive)
    useCampaignStore.setState({ campaigns, activeCampaignId: newActive })
    return
  }

  if (entityType === TRASH_TYPES.session) {
    const sessions = useSessionStore.getState().sessions.filter(s => s.id !== id)
    storage.set(KEYS.sessions, sessions)
    useSessionStore.setState({ sessions })
    return
  }

  if (entityType === TRASH_TYPES.group) {
    const groups = useGroupStore.getState().groups.filter(g => g.id !== id)
    storage.set(KEYS.groups, groups)
    useGroupStore.setState({ groups })
    if (useCombatStore.getState().combatGroupId === id) {
      useCombatStore.getState().setCombatGroup(null)
    }
    return
  }

  if (entityType === TRASH_TYPES.skill) {
    const custom = loadCustomSkills().filter(s => s.templateId !== id)
    saveCustomSkills(custom)
    return
  }

  if (entityType === TRASH_TYPES.flow) {
    const events = useNarrativeStore.getState().events.filter(e => e.id !== id)
    storage.set(KEYS.narrative, events)
    useNarrativeStore.setState({ events })
  }
}

function entityExists(entityType, entityId) {
  if (entityType === TRASH_TYPES.character) {
    return useCharacterStore.getState().characters.some(c => c.id === entityId)
  }
  if (entityType === TRASH_TYPES.npc) {
    return useNPCStore.getState().npcs.some(n => n.id === entityId)
  }
  if (entityType === TRASH_TYPES.organization) {
    return useOrganizationStore.getState().organizations.some(o => o.id === entityId)
  }
  if (entityType === TRASH_TYPES.campaign) {
    return useCampaignStore.getState().campaigns.some(c => c.id === entityId)
  }
  if (entityType === TRASH_TYPES.session) {
    return useSessionStore.getState().sessions.some(s => s.id === entityId)
  }
  if (entityType === TRASH_TYPES.group) {
    return useGroupStore.getState().groups.some(g => g.id === entityId)
  }
  if (entityType === TRASH_TYPES.skill) {
    return loadCustomSkills().some(s => s.templateId === entityId)
  }
  if (entityType === TRASH_TYPES.flow) {
    return useNarrativeStore.getState().events.some(e => e.id === entityId)
  }
  return false
}

function restoreToActiveList(entry) {
  const data = entry.data
  const entityType = entry.entityType
  const entityId = entry.entityId

  if (entityType === TRASH_TYPES.character) {
    const characters = [...useCharacterStore.getState().characters, normalizeGameEntity(data)]
    storage.set(KEYS.characters, characters)
    useCharacterStore.setState({ characters })
    return
  }

  if (entityType === TRASH_TYPES.npc) {
    const npcs = [...useNPCStore.getState().npcs, normalizeGameEntity(data)]
    storage.set(KEYS.npcs, npcs)
    useNPCStore.setState({ npcs })
    return
  }

  if (entityType === TRASH_TYPES.organization) {
    const organizations = [...useOrganizationStore.getState().organizations, data]
    storage.set(KEYS.organizations, organizations)
    useOrganizationStore.setState({ organizations })
    return
  }

  if (entityType === TRASH_TYPES.campaign) {
    const campaigns = [...useCampaignStore.getState().campaigns, data]
    storage.set(KEYS.campaigns, campaigns)
    useCampaignStore.setState({ campaigns })
    if (!useCampaignStore.getState().activeCampaignId) {
      storage.set(KEYS.activeCampaign, entityId)
      useCampaignStore.setState({ activeCampaignId: entityId })
    }
    return
  }

  if (entityType === TRASH_TYPES.session) {
    const sessions = [...useSessionStore.getState().sessions, data]
    storage.set(KEYS.sessions, sessions)
    useSessionStore.setState({ sessions })
    return
  }

  if (entityType === TRASH_TYPES.group) {
    const groups = [...useGroupStore.getState().groups, data]
    storage.set(KEYS.groups, groups)
    useGroupStore.setState({ groups })
    return
  }

  if (entityType === TRASH_TYPES.skill) {
    const custom = loadCustomSkills()
    if (!custom.some(s => s.templateId === entityId)) {
      saveCustomSkills([...custom, data])
    }
    return
  }

  if (entityType === TRASH_TYPES.flow) {
    const events = [...useNarrativeStore.getState().events, data]
    storage.set(KEYS.narrative, events)
    useNarrativeStore.setState({ events })
  }
}

/** Move entidade para a lixeira e remove das listas ativas */
export function archiveEntity(entityType, entity) {
  if (!entity || !getEntityId(entityType, entity)) {
    return { ok: false, message: 'Entidade inválida' }
  }

  const items = loadTrash()
  const entityId = getEntityId(entityType, entity)
  const entry = {
    id: genId(),
    entityType,
    entityId,
    name: getEntityName(entityType, entity),
    campaignId: entity.campaignId ?? null,
    deletedAt: new Date().toISOString(),
    data: JSON.parse(JSON.stringify(entity)),
  }
  items.unshift(entry)
  saveTrash(items)
  removeFromActiveLists(entityType, entity)
  refreshTrashStore()

  return { ok: true, entry }
}

export function listTrash(campaignId = null) {
  const items = loadTrash()
  if (!campaignId) return items
  return items.filter(i => i.campaignId === campaignId || i.campaignId == null)
}

export function getTrashEntry(trashId) {
  return loadTrash().find(i => i.id === trashId) || null
}

/** Restaura item da lixeira para a lista original */
export function restoreFromTrash(trashId) {
  const items = loadTrash()
  const index = items.findIndex(i => i.id === trashId)
  if (index < 0) return { ok: false, message: 'Item não encontrado na lixeira' }

  const entry = items[index]
  if (entityExists(entry.entityType, entry.entityId)) {
    return { ok: false, message: 'Já existe um registro ativo com o mesmo ID. Exclua o duplicado antes de restaurar.' }
  }

  restoreToActiveList(entry)
  items.splice(index, 1)
  saveTrash(items)
  refreshTrashStore()

  if (entry.entityType === TRASH_TYPES.skill) {
    import('../store/useSkillsCatalogStore').then(({ useSkillsCatalogStore }) => {
      useSkillsCatalogStore.getState().reload()
    })
  }

  return { ok: true, entry }
}

/** Remove permanentemente da lixeira */
export function permanentDeleteFromTrash(trashId) {
  const items = loadTrash().filter(i => i.id !== trashId)
  saveTrash(items)
  refreshTrashStore()
  return { ok: true }
}

export function emptyTrash(campaignId = null) {
  if (!campaignId) {
    saveTrash([])
  } else {
    const items = loadTrash().filter(i => i.campaignId !== campaignId)
    saveTrash(items)
  }
  refreshTrashStore()
}
