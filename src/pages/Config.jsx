import React from 'react'
import { RotateCcw, HardDrive, Home, Dices, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import SpotlightCard from '../components/react-bits/SpotlightCard'
import { resetAllTestData } from '../services/saveService'
import { useSaveStore } from '../store/useSaveStore'
import { useSettingsStore } from '../store/useSettingsStore'

const ACTION_BTN = {
  size: 'md',
  autoAnimate: true,
  tintOpacity: 0,
  blur: 0,
  radius: 14,
  intensity: 1.25,
  style: {
    fontFamily: 'ui-monospace, monospace',
    letterSpacing: '0.06em',
    fontWeight: 600,
    fontSize: '0.8rem',
    padding: '0.9rem 1.25rem',
    boxShadow: 'none',
    minWidth: '200px',
  },
}

export function Config({ onBackToWelcome, onNavigate }) {
  const { showToast } = useSaveStore()
  const { settings } = useSettingsStore()

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
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SpotlightCard spotlightColor="rgba(168, 85, 247, 0.14)" style={{ padding: '1.25rem' }}>
            <div style={{
              fontSize: '0.65rem',
              color: '#c084fc',
              fontFamily: 'monospace',
              letterSpacing: '0.12em',
              marginBottom: '0.5rem',
            }}>
              CAMPANHAS
            </div>
            <div style={{ fontSize: '0.85rem', color: '#e5e5e5', fontWeight: 600, marginBottom: '0.35rem' }}>
              Importar, exportar e carregar
            </div>
            <div style={{ fontSize: '0.75rem', color: '#888', lineHeight: 1.5, marginBottom: '1rem' }}>
              Salvar ou trazer campanhas de outro computador só na tela inicial, aba
              {' '}
              <strong style={{ color: '#bbb', fontWeight: 600 }}>Carregar campanhas</strong>.
            </div>
            <Button
              type="button"
              variant="primary"
              block
              onClick={() => onBackToWelcome?.()}
              style={{
                ...ACTION_BTN.style,
                minWidth: undefined,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <Home size={15} />
              Ir para Carregar campanhas
            </Button>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(56, 189, 248, 0.12)" style={{ padding: '1.25rem' }}>
            <div style={{
              fontSize: '0.65rem',
              color: '#38bdf8',
              fontFamily: 'monospace',
              letterSpacing: '0.12em',
              marginBottom: '0.5rem',
            }}>
              FERRAMENTAS
            </div>
            <div style={{ fontSize: '0.85rem', color: '#e5e5e5', fontWeight: 600, marginBottom: '0.35rem' }}>
              Dados e lixeira
            </div>
            <div style={{ fontSize: '0.75rem', color: '#888', lineHeight: 1.5, marginBottom: '1rem' }}>
              Rolagem avulsa e recuperação de entidades arquivadas ficam aqui.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <Button
                type="button"
                variant="secondary"
                block
                onClick={() => onNavigate?.('dice')}
                style={{
                  ...ACTION_BTN.style,
                  minWidth: undefined,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <Dices size={15} />
                Abrir Dados
              </Button>
              <Button
                type="button"
                variant="secondary"
                block
                onClick={() => onNavigate?.('trash')}
                style={{
                  ...ACTION_BTN.style,
                  minWidth: undefined,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <Trash2 size={15} />
                Abrir Lixeira
              </Button>
            </div>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(239, 68, 68, 0.12)" style={{ padding: '1.25rem' }}>
            <div style={{
              fontSize: '0.65rem',
              color: '#f87171',
              fontFamily: 'monospace',
              letterSpacing: '0.12em',
              marginBottom: '0.5rem',
            }}>
              ZONA DE PERIGO
            </div>
            <div style={{ fontSize: '0.85rem', color: '#e5e5e5', fontWeight: 600, marginBottom: '0.35rem' }}>
              Resetar tudo
            </div>
            <div style={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.5, marginBottom: '1rem' }}>
              Apaga todas as campanhas e dados locais. Não tem volta.
            </div>
            <Button
              type="button"
              variant="danger"
              onClick={handleReset}
              tint="#f87171"
              lineColor="#fecaca"
              baseColor="#ef4444"
              textColor="#f87171"
              {...ACTION_BTN}
            >
              <RotateCcw size={15} />
              Resetar tudo
            </Button>
          </SpotlightCard>

          {lastLabel && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.65rem',
              color: '#444',
              fontFamily: 'monospace',
              padding: '0.25rem 0.15rem',
            }}>
              <HardDrive size={12} />
              Última exportação: {lastLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
