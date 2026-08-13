import React, { useRef } from 'react'
import { Settings, Save, Upload, RotateCcw, HardDrive } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import SpotlightCard from '../components/react-bits/SpotlightCard'
import { exportCampaign, importCampaign, resetAllTestData } from '../services/saveService'
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

export function Config() {
  const fileRef = useRef(null)
  const { showToast, setSaving } = useSaveStore()
  const { settings } = useSettingsStore()

  const handleExport = () => {
    setSaving(true)
    try {
      exportCampaign()
    } catch (e) {
      showToast(e.message || 'Erro ao exportar.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleImport = () => fileRef.current?.click()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setSaving(true)
    await importCampaign(file)
    setSaving(false)
  }

  const handleReset = () => {
    const ok = window.confirm(
      'Apagar TODOS os dados de teste?\n\n'
      + 'Remove personagens, NPCs, bosses, organizações, grupos, sessões, lixeira e settings.\n'
      + 'Cria uma campanha vazia nova.\n\n'
      + 'Isso não tem volta (salve antes se precisar).',
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
        title="Configuração"
        subtitle="CAMPANHA · DADOS · SISTEMA"
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SpotlightCard spotlightColor="rgba(37, 99, 235, 0.14)" style={{ padding: '1.25rem' }}>
            <div style={{
              fontSize: '0.65rem',
              color: '#60a5fa',
              fontFamily: 'monospace',
              letterSpacing: '0.12em',
              marginBottom: '0.5rem',
            }}>
              CAMPANHA
            </div>
            <div style={{ fontSize: '0.85rem', color: '#e5e5e5', fontWeight: 600, marginBottom: '0.35rem' }}>
              Salvar campanha
            </div>
            <div style={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.5, marginBottom: '1rem' }}>
              Exporta o save atual em JSON para o seu computador.
            </div>
            <Button
              type="button"
              variant="primary"
              onClick={handleExport}
              tint="#60a5fa"
              lineColor="#93c5fd"
              baseColor="#3b82f6"
              textColor="#93c5fd"
              {...ACTION_BTN}
            >
              <Save size={15} />
              Salvar Campanha
            </Button>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(212, 212, 216, 0.1)" style={{ padding: '1.25rem' }}>
            <div style={{
              fontSize: '0.65rem',
              color: '#a1a1aa',
              fontFamily: 'monospace',
              letterSpacing: '0.12em',
              marginBottom: '0.5rem',
            }}>
              IMPORTAR
            </div>
            <div style={{ fontSize: '0.85rem', color: '#e5e5e5', fontWeight: 600, marginBottom: '0.35rem' }}>
              Importar campanha
            </div>
            <div style={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.5, marginBottom: '1rem' }}>
              Carrega um arquivo JSON de campanha salvo anteriormente.
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleImport}
              tint="#ffffff"
              lineColor="#d4d4d8"
              baseColor="#71717a"
              textColor="#a1a1aa"
              {...ACTION_BTN}
            >
              <Upload size={15} />
              Importar
            </Button>
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
              Apaga personagens, NPCs, bosses, orgs e demais dados de teste. Não tem volta.
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
              Último save: {lastLabel}
            </div>
          )}
        </div>
      </div>

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
