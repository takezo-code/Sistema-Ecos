import React, { useRef } from 'react'
import { Save, Upload, HardDrive, RotateCcw } from 'lucide-react'
import { exportCampaign, importCampaign, resetAllTestData } from '../services/saveService'
import { useSaveStore } from '../store/useSaveStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { THEME_ACCENT, THEME_ACCENT_SOFT, THEME_ACCENT_BORDER } from '../constants/theme'

export function SaveToolbar({ collapsed = false }) {
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
      + 'Remove personagens, NPCs, bosses, organizações, grupos, sessões, lixeira e equipamentos.\n'
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
    ? new Date(lastSave).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : null

  if (collapsed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0' }}>
        <button
          type="button"
          title="Salvar campanha"
          onClick={handleExport}
          style={btnIconStyle}
        >
          <Save size={14} />
        </button>
        <button
          type="button"
          title="Resetar tudo (teste)"
          onClick={handleReset}
          style={{ ...btnIconStyle, color: '#7f1d1d' }}
        >
          <RotateCcw size={14} />
        </button>
        <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleFile} />
      </div>
    )
  }

  return (
    <div style={{
      padding: '0.75rem',
      borderTop: '1px solid #1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.35rem',
    }}>
      <button type="button" onClick={handleExport} style={btnFullStyle}>
        <Save size={13} />
        Salvar Campanha
      </button>
      <button type="button" onClick={handleImport} style={btnGhostStyle}>
        <Upload size={13} />
        Importar
      </button>
      <button
        type="button"
        onClick={handleReset}
        title="Apaga personagens, NPCs, bosses, orgs e demais dados de teste"
        style={btnResetStyle}
      >
        <RotateCcw size={13} />
        Resetar tudo
      </button>
      {lastLabel && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.55rem',
          color: '#333',
          fontFamily: 'monospace',
          padding: '0.25rem 0',
        }}>
          <HardDrive size={10} />
          {lastLabel}
        </div>
      )}
      <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  )
}

const btnFullStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  width: '100%',
  padding: '0.5rem 0.75rem',
  background: THEME_ACCENT_SOFT,
  border: `1px solid ${THEME_ACCENT_BORDER}`,
  borderRadius: '3px',
  color: THEME_ACCENT,
  fontSize: '0.7rem',
  fontFamily: 'monospace',
  letterSpacing: '0.08em',
  fontWeight: 600,
  cursor: 'pointer',
}

const btnGhostStyle = {
  ...btnFullStyle,
  background: 'transparent',
  border: '1px solid #1a1a1a',
  color: '#666',
}

const btnResetStyle = {
  ...btnFullStyle,
  background: 'transparent',
  border: '1px solid rgba(127,29,29,0.45)',
  color: '#7f1d1d',
  fontWeight: 500,
  letterSpacing: '0.04em',
}

const btnIconStyle = {
  background: 'transparent',
  border: 'none',
  color: '#444',
  cursor: 'pointer',
  display: 'flex',
  padding: '8px',
  margin: '0 auto',
}
