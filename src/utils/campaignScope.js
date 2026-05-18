/** Filtra entidades pela campanha ativa (inclui legado sem campaignId) */
export function filterByActiveCampaign(items, activeCampaignId) {
  if (!activeCampaignId) return []
  return (items || []).filter(
    item => !item.campaignId || item.campaignId === activeCampaignId
  )
}

/** Aplica campanha ativa em entidades novas */
export function withActiveCampaign(data, activeCampaignId) {
  if (!activeCampaignId) return data
  return { ...data, campaignId: activeCampaignId }
}
