import { useCampaignStore } from '../store/useCampaignStore'
import { useCharacterStore } from '../store/useCharacterStore'
import { useGroupStore } from '../store/useGroupStore'
import { useNPCStore } from '../store/useNPCStore'
import { useOrganizationStore } from '../store/useOrganizationStore'
import { useNarrativeStore } from '../store/useNarrativeStore'
import { useDiceStore } from '../store/useDiceStore'
import { storage, KEYS } from './storage'
import { archiveEntity, TRASH_TYPES } from './trashService'

/** Campanha ativa obrigatória para criar entidades. */
export function resolveCampaignId(provided) {
  if (provided) return provided
  const active = useCampaignStore.getState().activeCampaignId
  if (!active) {
    throw new Error('Selecione uma campanha ativa antes de criar.')
  }
  return active
}

/** Atribui campaignId a entidades legadas sem vínculo. */
export function migrateOrphanEntitiesToActiveCampaign() {
  const campaigns = useCampaignStore.getState().campaigns || []
  if (!campaigns.length) return { patched: 0 }

  const activeId = useCampaignStore.getState().activeCampaignId || campaigns[0].id
  let patched = 0

  const stamp = (items, key) => {
    if (!Array.isArray(items) || !items.length) return items
    let changed = false
    const next = items.map(item => {
      if (!item || item.campaignId) return item
      changed = true
      patched += 1
      return { ...item, campaignId: activeId }
    })
    if (changed) storage.set(key, next)
    return changed ? next : items
  }

  const characters = stamp(useCharacterStore.getState().characters, KEYS.characters)
  if (characters !== useCharacterStore.getState().characters) {
    useCharacterStore.setState({ characters })
  }

  const groups = stamp(useGroupStore.getState().groups, KEYS.groups)
  if (groups !== useGroupStore.getState().groups) {
    useGroupStore.setState({ groups })
  }

  const npcs = stamp(useNPCStore.getState().npcs, KEYS.npcs)
  if (npcs !== useNPCStore.getState().npcs) {
    useNPCStore.setState({ npcs })
  }

  const organizations = stamp(
    useOrganizationStore.getState().organizations,
    KEYS.organizations,
  )
  if (organizations !== useOrganizationStore.getState().organizations) {
    useOrganizationStore.setState({ organizations })
  }

  const events = stamp(useNarrativeStore.getState().events, KEYS.narrative)
  if (events !== useNarrativeStore.getState().events) {
    useNarrativeStore.setState({ events })
  }

  const diceHistory = (useDiceStore.getState().history || []).map(roll => {
    if (!roll || roll.campaignId) return roll
    patched += 1
    return { ...roll, campaignId: activeId }
  })
  if (diceHistory !== useDiceStore.getState().history) {
    storage.set(KEYS.diceHistory, diceHistory)
    useDiceStore.setState({ history: diceHistory })
  }

  return { patched, campaignId: activeId }
}

/** Arquiva campanha e todas as entidades vinculadas. */
export function archiveCampaignWithEntities(campaignId) {
  const campaign = useCampaignStore.getState().campaigns.find(c => c.id === campaignId)
  if (!campaign) return { ok: false, message: 'Campanha não encontrada.' }

  const belongs = item => item?.campaignId === campaignId

  useCharacterStore.getState().characters
    .filter(belongs)
    .slice()
    .forEach(c => archiveEntity(TRASH_TYPES.character, c))

  useNPCStore.getState().npcs
    .filter(belongs)
    .slice()
    .forEach(n => archiveEntity(TRASH_TYPES.npc, n))

  useGroupStore.getState().groups
    .filter(belongs)
    .slice()
    .forEach(g => archiveEntity(TRASH_TYPES.group, g))

  useOrganizationStore.getState().organizations
    .filter(belongs)
    .slice()
    .forEach(o => archiveEntity(TRASH_TYPES.organization, o))

  useNarrativeStore.getState().events
    .filter(belongs)
    .slice()
    .forEach(e => archiveEntity(TRASH_TYPES.flow, e))

  archiveEntity(TRASH_TYPES.campaign, campaign)

  return { ok: true }
}
