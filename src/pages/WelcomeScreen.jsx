import React, { useState } from 'react'
import { Hexagon } from 'lucide-react'
import { downloadManualById } from '../services/manualDownloads'
import { useSaveStore } from '../store/useSaveStore'
import { markWelcomeIntroSeen } from '../services/welcomeService'
import { THEME_ACCENT, THEME_ACCENT_SOFT, THEME_ACCENT_BORDER } from '../constants/theme'
import GlassSurface from '../components/react-bits/GlassSurface'
import { WelcomeIntro } from '../components/welcome/WelcomeIntro'
import { WelcomeHome } from '../components/welcome/WelcomeHome'
import { CampaignLoadPanel } from '../components/welcome/CampaignLoadPanel'
import { WelcomeContentsPanel } from '../components/welcome/WelcomeContentsPanel'
import { WelcomeCommunityPanel } from '../components/welcome/WelcomeCommunityPanel'

const PHASE_MAX_WIDTH = {
  intro: 500,
  home: 480,
  load: 540,
  contents: 480,
  community: 480,
}

const PHASE_SHELL_STYLE = {
  load: {
    width: '100%',
    height: 'min(88vh, 820px)',
    maxHeight: 'min(92vh, 860px)',
    minHeight: 'min(72vh, 640px)',
    display: 'flex',
    flexDirection: 'column',
  },
}

function ModePill({ children, active = true }) {
  return (
    <span style={{
      flex: 1,
      textAlign: 'center',
      padding: '0.55rem 0.75rem',
      borderRadius: 10,
      fontSize: '0.78rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
      color: active ? '#f5f5f5' : '#666',
      background: active ? 'rgba(124, 58, 237, 0.35)' : 'transparent',
      border: active ? '1px solid rgba(167, 139, 250, 0.35)' : '1px solid transparent',
    }}>
      {children}
    </span>
  )
}

/** intro (3 passos) → home → load | contents | community */
export function WelcomeScreen({ onEnter, initialPhase = 'intro' }) {
  const [phase, setPhase] = useState(initialPhase)
  const [pdfLoadingId, setPdfLoadingId] = useState(null)
  const { showToast } = useSaveStore()

  const handleDownloadPdf = async (manualId) => {
    setPdfLoadingId(manualId)
    try {
      const item = await downloadManualById(manualId)
      showToast(`${item.label.replace('PDF — ', '')} baixado.`, 'success')
    } catch (e) {
      showToast(e.message || 'Erro ao gerar PDF.', 'error')
    } finally {
      setPdfLoadingId(null)
    }
  }

  const finishIntro = () => {
    markWelcomeIntroSeen()
    setPhase('home')
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem',
      overflow: 'auto',
    }}>
      <GlassSurface
        borderRadius={18}
        padding="1.5rem 1.35rem 1.35rem"
        className={phase === 'load' ? 'welcome-shell-tall' : ''}
        style={{
          width: '100%',
          maxWidth: PHASE_MAX_WIDTH[phase] || 500,
          background: 'rgba(10, 10, 14, 0.92)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
          ...(PHASE_SHELL_STYLE[phase] || {}),
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: phase === 'load' ? '1 1 auto' : undefined,
          minHeight: phase === 'load' ? 0 : undefined,
          overflow: phase === 'load' ? 'hidden' : undefined,
        }}>
        <header style={{
          textAlign: 'center',
          marginBottom: phase === 'intro' ? '0.85rem' : '1rem',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: 12,
            border: `1px solid ${THEME_ACCENT_BORDER}`,
            background: THEME_ACCENT_SOFT,
            marginBottom: '0.85rem',
          }}>
            <Hexagon size={22} style={{ color: THEME_ACCENT }} strokeWidth={1.6} />
          </div>
          <h1 style={{
            fontSize: 'clamp(1.6rem, 4vw, 2rem)',
            fontWeight: 800,
            letterSpacing: '0.18em',
            color: '#f5f5f5',
            fontFamily: 'monospace',
            marginBottom: 0,
          }}>
            ECOS
          </h1>
        </header>

        {phase === 'intro' ? (
          <div style={{
            display: 'flex',
            gap: '0.45rem',
            marginBottom: '1rem',
            padding: '0.2rem',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <ModePill>Conhecer</ModePill>
          </div>
        ) : null}

        {phase === 'intro' ? (
          <WelcomeIntro
            onComplete={finishIntro}
            pdfLoadingId={pdfLoadingId}
            onDownloadPdf={handleDownloadPdf}
          />
        ) : null}

        {phase === 'home' ? (
          <WelcomeHome
            onNewCampaign={() => onEnter?.()}
            onOpenLoad={() => setPhase('load')}
            onOpenContents={() => setPhase('contents')}
            onOpenCommunity={() => setPhase('community')}
          />
        ) : null}

        {phase === 'load' ? (
          <CampaignLoadPanel
            onBack={() => setPhase('home')}
            onPlay={() => onEnter?.()}
          />
        ) : null}

        {phase === 'contents' ? (
          <WelcomeContentsPanel
            onBack={() => setPhase('home')}
            onDownloadPdf={handleDownloadPdf}
            pdfLoadingId={pdfLoadingId}
          />
        ) : null}

        {phase === 'community' ? (
          <WelcomeCommunityPanel onBack={() => setPhase('home')} />
        ) : null}
        </div>
      </GlassSurface>
    </div>
  )
}
