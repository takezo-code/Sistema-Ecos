import { filterByActiveCampaign } from './campaignScope'

/**
 * Monta a lista de personagens exibidos no combate.
 * - Com grupo selecionado: todos os memberIds (mesmo fora do filtro de campanha).
 * - Sem grupo: todos os personagens da campanha ativa (+ legado sem campaignId).
 */
export function resolveCombatRoster(characters, groups, activeCampaignId, combatGroupId) {
  const all = characters || []

  if (combatGroupId) {
    const group = (groups || []).find(g => g.id === combatGroupId)
    if (group?.memberIds?.length) {
      const members = group.memberIds
        .map(id => all.find(c => c.id === id))
        .filter(Boolean)
      if (members.length > 0) return members
    }
  }

  const campChars = filterByActiveCampaign(all, activeCampaignId)
  const campaignGroups = (groups || []).filter(
    g => !g.campaignId || g.campaignId === activeCampaignId
  )
  const memberIds = new Set()
  campaignGroups.forEach(g => (g.memberIds || []).forEach(id => memberIds.add(id)))

  const fromGroups = [...memberIds]
    .map(id => all.find(c => c.id === id))
    .filter(Boolean)

  const byId = new Map()
  ;[...campChars, ...fromGroups].forEach(c => byId.set(c.id, c))
  return [...byId.values()]
}
