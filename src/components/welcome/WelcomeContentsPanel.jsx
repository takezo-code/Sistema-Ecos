import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { THEME_ACCENT } from '../../constants/theme'
import { WelcomeManualList } from './WelcomeManualList'

export function WelcomeContentsPanel({
  onBack,
  onDownloadPdf,
  pdfLoadingId = null,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            style={{
              marginTop: 2,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 8,
              padding: '0.4rem',
              color: '#aaa',
              cursor: 'pointer',
              display: 'flex',
              flexShrink: 0,
            }}
            title="Voltar"
          >
            <ArrowLeft size={14} />
          </button>
        ) : null}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '0.58rem',
            fontFamily: 'monospace',
            letterSpacing: '0.12em',
            color: THEME_ACCENT,
            marginBottom: '0.35rem',
            fontWeight: 700,
          }}>
            CONTEÚDOS
          </div>
          <h2 style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#f0f0f0',
            marginBottom: 0,
          }}>
            Manuais em PDF
          </h2>
        </div>
      </div>

      <WelcomeManualList
        loadingId={pdfLoadingId}
        onDownload={onDownloadPdf}
      />
    </div>
  )
}
