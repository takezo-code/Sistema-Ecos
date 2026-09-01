import React, { useEffect, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { useCampaignStore } from '../store/useCampaignStore'
import { CampaignFlows } from './CampaignFlows'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'

export function Campanha({ initialView = 'historia', onViewChange, onBackToWelcome }) {
  const [activeView, setActiveView] = useState(initialView)
  const activeCampaign = useCampaignStore(s =>
    s.campaigns.find(c => c.id === s.activeCampaignId) || null,
  )

  useEffect(() => {
    if (initialView) setActiveView(initialView)
  }, [initialView])

  useEffect(() => {
    onViewChange?.(activeView)
  }, [activeView, onViewChange])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {activeView === 'historia' ? (
        activeCampaign ? (
          <CampaignFlows key={activeCampaign.id} campaign={activeCampaign} />
        ) : (
          <EmptyState
            icon={BookOpen}
            title="Nenhuma campanha ativa"
            description="Volte à tela inicial para criar ou carregar uma campanha."
            action={onBackToWelcome ? (
              <Button onClick={onBackToWelcome} size="xs">
                Ir para tela inicial
              </Button>
            ) : null}
          />
        )
      ) : null}
    </div>
  )
}
