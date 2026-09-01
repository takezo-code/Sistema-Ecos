import React from 'react'
import { BookOpen } from 'lucide-react'
import { MANUAL_DOWNLOADS } from '../../services/manualDownloads'
import { WelcomeResourceLink } from './WelcomeResourceLink'

export function WelcomeManualList({
  loadingId = null,
  onDownload,
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.55rem',
    }}>
      {MANUAL_DOWNLOADS.map((manual) => {
        const loading = loadingId === manual.id
        const unavailable = manual.available === false
        return (
          <WelcomeResourceLink
            key={manual.id}
            icon={BookOpen}
            disabled={unavailable}
            onClick={loading || unavailable ? undefined : () => onDownload?.(manual.id)}
          >
            {loading ? 'Gerando PDF…' : manual.label}
            {unavailable ? (
              <span style={{
                marginLeft: '0.35rem',
                fontSize: '0.58rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: '#9ca3af',
                textTransform: 'uppercase',
              }}>
                Em breve
              </span>
            ) : null}
          </WelcomeResourceLink>
        )
      })}
    </div>
  )
}
