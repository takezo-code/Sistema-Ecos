import React, { useRef, useState } from 'react'
import {
  BookOpen,
  FolderGit2,
  Hexagon,
  Plus,
  Sparkles,
  Swords,
  Upload,
} from 'lucide-react'
import { initializeNewCampaign, importCampaign } from '../services/saveService'
import { useSaveStore } from '../store/useSaveStore'
import { THEME_ACCENT, THEME_ACCENT_SOFT, THEME_ACCENT_BORDER } from '../constants/theme'
import {
  GITHUB_REPO_URL,
  MANUAL_JOGADOR_URL,
  MANUAL_MESTRE_URL,
} from '../constants/welcomeIntro'
import Stepper, { Step } from '../components/react-bits/Stepper'
import GlassSurface from '../components/react-bits/GlassSurface'
import { Button } from '../components/ui/Button'

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

export function WelcomeScreen({ onEnter, canContinue = false }) {
  const fileRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const { showToast } = useSaveStore()

  const handleNew = () => {
    setLoading(true)
    try {
      initializeNewCampaign('Nova Campanha')
      showToast('Nova campanha criada.', 'success')
      onEnter?.()
    } catch (e) {
      showToast(e.message || 'Erro ao criar campanha.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleImportClick = () => fileRef.current?.click()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setLoading(true)
    const result = await importCampaign(file)
    setLoading(false)
    if (result.ok) onEnter?.()
  }

  const isLastStep = step === 4

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
          maxWidth: 480,
          background: 'rgba(10, 10, 14, 0.92)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.15rem' }}>
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

          <Step>
            <StepCopy eyebrow="04 · COMEÇAR" title="Pronto para a mesa">
              <p style={{ margin: '0 0 0.85rem' }}>
                Crie uma campanha nova, importe um save ou continue de onde parou.
                Manuais e código ficam à mão se precisar.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1rem' }}>
                <ResourceLink href={MANUAL_MESTRE_URL} icon={BookOpen}>
                  Manual do mestre
                </ResourceLink>
                <ResourceLink href={MANUAL_JOGADOR_URL} icon={BookOpen}>
                  Manual do jogador
                </ResourceLink>
                <ResourceLink href={GITHUB_REPO_URL} icon={FolderGit2}>
                  GitHub
                </ResourceLink>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                <Button
                  type="button"
                  size="md"
                  block
                  disabled={loading}
                  onClick={handleNew}
                  style={{ fontWeight: 650 }}
                >
                  <Plus size={15} />
                  Nova campanha
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  block
                  disabled={loading}
                  onClick={handleImportClick}
                  style={{ fontWeight: 650 }}
                >
                  <Upload size={15} />
                  Importar campanha
                </Button>
                {canContinue && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    block
                    disabled={loading}
                    onClick={() => onEnter?.()}
                    style={{ fontWeight: 600, color: '#999' }}
                  >
                    Continuar campanha
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={loading}
                  style={{
                    marginTop: '0.15rem',
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    padding: '0.35rem',
                  }}
                >
                  Voltar
                </button>
              </div>
            </StepCopy>
          </Step>
        </Stepper>
      </GlassSurface>

      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  )
}
