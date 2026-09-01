import React from 'react'
import { BookOpen } from 'lucide-react'
import { useCampaignStore } from '../../store/useCampaignStore'
import { THEME_ACCENT, THEME_ACCENT_SOFT, THEME_ACCENT_BORDER } from '../../constants/theme'

export function ActiveCampaignBanner({ onNavigate }) {
  const activeCampaign = useCampaignStore(s =>
    s.campaigns.find(c => c.id === s.activeCampaignId) || null
  )

  if (activeCampaign) {
    return (
      <div style={{
        padding: '0.5rem 1.5rem',
        borderBottom: '1px solid #1a1a1a',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.65rem',
        fontFamily: 'monospace',
        color: '#444',
      }}>
        <BookOpen size={12} style={{ color: THEME_ACCENT }} />
        <span style={{ color: '#666' }}>CAMPANHA ATIVA:</span>
        <span style={{ color: '#e5e5e5' }}>{activeCampaign.name}</span>
      </div>
    )
  }

  return (
    <div style={{
      padding: '0.625rem 1.5rem',
      borderBottom: `1px solid ${THEME_ACCENT_BORDER}`,
      background: THEME_ACCENT_SOFT,
      fontSize: '0.75rem',
      color: '#999',
    }}>
      Nenhuma campanha ativa.{' '}
      {onNavigate && (
        <button
          type="button"
          onClick={() => onNavigate('config')}
          style={{ background: 'none', border: 'none', color: THEME_ACCENT, cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit' }}
        >
          Vá à tela inicial em Config
        </button>
      )}
    </div>
  )
}
