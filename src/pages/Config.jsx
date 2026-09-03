import React from 'react'
import {
  RotateCcw,
  HardDrive,
  Home,
  Trash2,
  Settings,
  MousePointerClick,
  Aperture,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/ui/PageHeader'
import { useSaveStore } from '../store/useSaveStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { resetAllTestData } from '../services/saveService'

const PANEL = {
  background: 'rgba(8, 10, 16, 0.82)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 16,
  padding: '1.1rem 1.15rem',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
}

function ToggleRow({ icon: Icon, label, hint, checked, onChange, accent }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        all: 'unset',
        boxSizing: 'border-box',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        width: '100%',
        padding: '0.7rem 0.15rem',
      }}
    >
      <span style={{
        width: 36,
        height: 36,
        borderRadius: 11,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `${accent}18`,
        border: `1px solid ${accent}30`,
        color: accent,
      }}>
        <Icon size={15} strokeWidth={2.2} />
      </span>
      <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <span style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#f2f2f2' }}>
          {label}
        </span>
        {hint ? (
          <span style={{ display: 'block', fontSize: '0.7rem', color: '#8a8a8a', marginTop: 2, lineHeight: 1.4 }}>
            {hint}
          </span>
        ) : null}
      </span>
      <span
        aria-hidden
        style={{
          width: 44,
          height: 26,
          borderRadius: 999,
          flexShrink: 0,
          padding: 3,
          background: checked ? accent : 'rgba(255,255,255,0.14)',
          transition: 'background 0.15s ease',
        }}
      >
        <span style={{
          display: 'block',
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
          transform: checked ? 'translateX(18px)' : 'translateX(0)',
          transition: 'transform 0.15s ease',
        }} />
      </span>
    </button>
  )
}

export function Config({ onBackToWelcome, onNavigate }) {
  const { showToast } = useSaveStore()
  const { settings, updateSettings } = useSettingsStore()

  const clickEnabled = settings.clickEffectsEnabled !== false
  const backgroundEnabled = settings.backgroundEffectsEnabled !== false

  const handleReset = () => {
    const ok = window.confirm(
      'Apagar TODOS os dados de teste?\n\n'
      + 'Remove todas as campanhas, personagens, NPCs, bosses, organizações, grupos, sessões e lixeira.\n\n'
      + 'Isso não tem volta (exporte antes se precisar).',
    )
    if (!ok) return
    const ok2 = window.confirm('Confirma mesmo? Tudo será zerado.')
    if (!ok2) return
    try {
      resetAllTestData('Nova Campanha')
    } catch (e) {
      showToast(e.message || 'Erro ao resetar.', 'error')
    }
  }

  const lastSave = settings?.lastManualSaveAt || settings?.lastAutoSaveAt
  const lastLabel = lastSave
    ? new Date(lastSave).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        icon={Settings}
        title="Configurações"
        subtitle="PREFERÊNCIAS DO SISTEMA"
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.5rem 1.75rem' }}>
        <div style={{
          maxWidth: 480,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          <section style={PANEL}>
            <Button
              type="button"
              variant="primary"
              block
              onClick={() => onBackToWelcome?.()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.55rem',
                padding: '0.95rem 1rem',
                borderRadius: 12,
                fontSize: '0.88rem',
                fontWeight: 650,
              }}
            >
              <Home size={16} />
              Ir para a página inicial
            </Button>
          </section>

          <section style={PANEL}>
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#d4d4d4',
              marginBottom: '0.15rem',
            }}>
              Efeitos visuais
            </div>
            <p style={{
              margin: '0 0 0.35rem',
              fontSize: '0.7rem',
              color: '#777',
              lineHeight: 1.45,
            }}>
              Desligue se quiser uma interface mais leve.
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.15rem',
            }}>
              <ToggleRow
                icon={MousePointerClick}
                label="Efeito de clique"
                hint="Faíscas ao clicar"
                checked={clickEnabled}
                accent="#a78bfa"
                onChange={(value) => updateSettings({ clickEffectsEnabled: value })}
              />
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0.1rem 0' }} />
              <ToggleRow
                icon={Aperture}
                label="Background animado"
                hint="Fundo Evil Eye"
                checked={backgroundEnabled}
                accent="#38bdf8"
                onChange={(value) => updateSettings({ backgroundEffectsEnabled: value })}
              />
            </div>
          </section>

          <section style={PANEL}>
            <Button
              type="button"
              variant="secondary"
              block
              onClick={() => onNavigate?.('trash')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.55rem',
                padding: '0.85rem 1rem',
                borderRadius: 12,
                fontSize: '0.86rem',
                fontWeight: 600,
              }}
            >
              <Trash2 size={15} />
              Abrir lixeira
            </Button>
          </section>

          <section style={{
            ...PANEL,
            border: '1px solid rgba(248, 113, 113, 0.22)',
            background: 'rgba(28, 10, 12, 0.78)',
          }}>
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#fecaca',
              marginBottom: '0.25rem',
            }}>
              Zona de perigo
            </div>
            <p style={{
              margin: '0 0 0.85rem',
              fontSize: '0.7rem',
              color: '#9a6b6b',
              lineHeight: 1.45,
            }}>
              Apaga todas as campanhas e dados locais. Não tem volta.
            </p>
            <Button
              type="button"
              variant="danger"
              block
              onClick={handleReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.55rem',
                padding: '0.85rem 1rem',
                borderRadius: 12,
                fontSize: '0.86rem',
                fontWeight: 650,
              }}
            >
              <RotateCcw size={15} />
              Resetar tudo
            </Button>
          </section>

          {lastLabel ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontSize: '0.65rem',
              color: '#666',
              padding: '0.25rem 0',
            }}>
              <HardDrive size={11} />
              Último save: {lastLabel}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
