import React, { useState } from 'react'
import {
  Download,
  FolderGit2,
  Hexagon,
  Sparkles,
  Swords,
} from 'lucide-react'
import { downloadPlayerManualPdf } from '../services/playerManualPdf'
import { useSaveStore } from '../store/useSaveStore'
import { THEME_ACCENT, THEME_ACCENT_SOFT, THEME_ACCENT_BORDER } from '../constants/theme'
import { GITHUB_REPO_URL } from '../constants/welcomeIntro'
import Stepper, { Step } from '../components/react-bits/Stepper'
import GlassSurface from '../components/react-bits/GlassSurface'
import { CampaignLoadPanel } from '../components/welcome/CampaignLoadPanel'

function ResourceLink({ href, icon: Icon, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.5rem 0.75rem',
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.04)',
        color: '#c4b5fd',
        fontSize: '0.72rem',
        textDecoration: 'none',
        fontWeight: 600,
      }}
    >
      <Icon size={13} />
      {children}
    </a>
  )
}

function StepCopy({ eyebrow, title, children }) {
  return (
    <div style={{ padding: '0.35rem 0 0.75rem', textAlign: 'left' }}>
      <div style={{
        fontSize: '0.58rem',
        fontFamily: 'monospace',
        letterSpacing: '0.12em',
        color: THEME_ACCENT,
        marginBottom: '0.45rem',
        fontWeight: 700,
      }}>
        {eyebrow}
      </div>
      <h2 style={{
        fontSize: '1.15rem',
        fontWeight: 700,
        color: '#f0f0f0',
        marginBottom: '0.55rem',
        letterSpacing: '-0.02em',
        lineHeight: 1.25,
      }}>
        {title}
      </h2>
      <div style={{
        fontSize: '0.82rem',
        color: '#9a9a9a',
        lineHeight: 1.55,
      }}>
        {children}
      </div>
    </div>
  )
}

function WelcomeTabs({ tab, onChange }) {
  const tabs = [
    { id: 'intro', label: 'Conhecer' },
    { id: 'load', label: 'Carregar campanhas' },
  ]
  return (
    <div style={{
      display: 'flex',
      gap: 4,
      marginBottom: '1rem',
      padding: 4,
      borderRadius: 10,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      {tabs.map(item => {
        const active = tab === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            style={{
              flex: 1,
              border: 'none',
              borderRadius: 8,
              padding: '0.5rem 0.65rem',
              fontSize: '0.72rem',
              fontWeight: active ? 700 : 600,
              fontFamily: 'monospace',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              color: active ? '#f0f0f0' : '#777',
              background: active ? 'rgba(168,85,247,0.22)' : 'transparent',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

export function WelcomeScreen({ onEnter, canContinue = false, initialTab = null }) {
  const [manualLoading, setManualLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [tab, setTab] = useState(initialTab || (canContinue ? 'load' : 'intro'))
  const { showToast } = useSaveStore()

  const handleManualDownload = async () => {
    setManualLoading(true)
    try {
      await downloadPlayerManualPdf()
      showToast('Manual do jogador baixado em PDF.', 'success')
    } catch (e) {
      showToast(e.message || 'Erro ao gerar o PDF do manual.', 'error')
    } finally {
      setManualLoading(false)
    }
  }

  const isLastStep = step === 3

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
        style={{
          width: '100%',
          maxWidth: tab === 'load' ? 520 : 480,
          background: 'rgba(10, 10, 14, 0.92)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
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
            marginBottom: '0.35rem',
          }}>
            ECOS
          </h1>
          <p style={{
            fontSize: '0.78rem',
            color: '#888',
            lineHeight: 1.45,
            maxWidth: 340,
            margin: '0 auto',
          }}>
            Bem-vindo ao sistema. Organize campanha, fichas, combate e Eco numa mesa só.
          </p>
        </div>

        <WelcomeTabs tab={tab} onChange={setTab} />

        {tab === 'load' ? (
          <CampaignLoadPanel onPlay={() => onEnter?.()} />
        ) : (
          <>
            <Stepper
              step={step}
              onStepChange={setStep}
              hideDefaultNav={isLastStep}
              nextButtonText="Continuar"
              backButtonText="Voltar"
              stepCircleContainerClassName="welcome-stepper-flat"
              style={{ width: '100%' }}
            >
              <Step>
                <StepCopy eyebrow="01 · BOAS-VINDAS" title="Vocês carregam o Eco">
                  <p style={{ margin: 0 }}>
                    Ecos é um RPG temporal. O Eco dobra percepção, tempo e corpo —
                    não é magia limpa. Cada uso deixa resíduo na narrativa e na ficha.
                  </p>
                </StepCopy>
              </Step>

              <Step>
                <StepCopy eyebrow="02 · COMBATE" title="Sem HP clássico">
                  <p style={{ margin: '0 0 0.65rem' }}>
                    Dano vira marcas (Leve e Grave). Conforme sobem, o corpo piora:
                    Saudável → Ferido → Grave → Incapacitado.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a3a3a3', fontSize: '0.75rem' }}>
                    <Swords size={14} style={{ color: THEME_ACCENT }} />
                    Vitalidade só atrasa a queda — não é barra de vida infinita.
                  </div>
                </StepCopy>
              </Step>

              <Step>
                <StepCopy eyebrow="03 · ECO" title="Ruptura e sobrecarga">
                  <p style={{ margin: '0 0 0.65rem' }}>
                    Skills gastam usos de Ruptura. No limite ainda é Estável.
                    Passar disso abala a mente — e continua degradando se insistir.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a3a3a3', fontSize: '0.75rem' }}>
                    <Sparkles size={14} style={{ color: '#a855f7' }} />
                    O app calcula; a mesa decide o drama.
                  </div>
                </StepCopy>
              </Step>
            </Stepper>

            {isLastStep && (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={handleManualDownload}
                    disabled={manualLoading}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.04)',
                      color: '#c4b5fd',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: manualLoading ? 'wait' : 'pointer',
                      opacity: manualLoading ? 0.7 : 1,
                    }}
                  >
                    <Download size={13} />
                    {manualLoading ? 'Gerando PDF…' : 'Manual do jogador (PDF)'}
                  </button>
                  <ResourceLink href={GITHUB_REPO_URL} icon={FolderGit2}>
                    GitHub
                  </ResourceLink>
                </div>
                <button
                  type="button"
                  onClick={() => setTab('load')}
                  style={{
                    width: '100%',
                    border: '1px solid rgba(168,85,247,0.35)',
                    borderRadius: 10,
                    padding: '0.75rem 1rem',
                    background: 'rgba(168,85,247,0.12)',
                    color: '#e9d5ff',
                    fontSize: '0.82rem',
                    fontWeight: 650,
                    cursor: 'pointer',
                  }}
                >
                  Ir para Carregar campanhas →
                </button>
              </div>
            )}
          </>
        )}
      </GlassSurface>
    </div>
  )
}
