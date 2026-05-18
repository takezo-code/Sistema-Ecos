import React, { useRef } from 'react'
import { Save, Upload, HardDrive } from 'lucide-react'
import { exportCampaign, importCampaign } from '../services/saveService'
import { useSaveStore } from '../store/useSaveStore'
import { useSettingsStore } from '../store/useSettingsStore'

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

  const lastSave = settings?.lastManualSaveAt || settings?.lastAutoSaveAt
  const lastLabel = lastSave
    ? new Date(lastSave).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : null

  if (collapsed) {
    return (
      <>
        <button
          type="button"
          title="Salvar campanha"
          onClick={handleExport}
          style={btnIconStyle}
        >
          <Save size={14} />
        </button>
        <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleFile} />
      </>
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
  background: 'rgba(220,38,38,0.08)',
  border: '1px solid rgba(220,38,38,0.25)',
  borderRadius: '3px',
  color: '#dc2626',
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

const btnIconStyle = {
  background: 'transparent',
  border: 'none',
  color: '#444',
  cursor: 'pointer',
  display: 'flex',
  padding: '8px',
  margin: '0 auto',
}
