/** Filtra entidades pela campanha ativa (vínculo estrito por campaignId). */
export function filterByActiveCampaign(items, activeCampaignId) {
  if (!activeCampaignId) return []
  return (items || []).filter(item => item?.campaignId === activeCampaignId)
}

/** Aplica campanha ativa em entidades novas. */
export function withActiveCampaign(data, activeCampaignId) {
  if (!activeCampaignId) return data
  return { ...data, campaignId: activeCampaignId }
}
