import React from 'react'
import { BookOpen } from 'lucide-react'
import { MANUAL_DOWNLOADS } from '../../services/manualDownloads'
import { WelcomeResourceLink } from './WelcomeResourceLink'

export function WelcomeManualList({
  loadingId = null,
  onDownload,
  compact = false,
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: compact ? '0.45rem' : '0.55rem',
    }}>
      {MANUAL_DOWNLOADS.map((manual) => {
        const loading = loadingId === manual.id
        const unavailable = manual.available === false
        return (
          <div key={manual.id}>
            <WelcomeResourceLink
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
            {!compact ? (
              <p style={{
                margin: '0.35rem 0 0 1.65rem',
                fontSize: '0.72rem',
                color: '#6b6b6b',
                lineHeight: 1.45,
              }}>
                {manual.hint}
              </p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
