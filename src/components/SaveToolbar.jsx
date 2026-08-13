import React, { useState, useRef } from 'react'
import { Save, Upload, HardDrive, RotateCcw, Settings, ChevronUp } from 'lucide-react'
import { exportCampaign, importCampaign, resetAllTestData } from '../services/saveService'
import { useSaveStore } from '../store/useSaveStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { Button } from './ui/Button'

const SIDEBAR_BTN = {
  size: 'md',
  block: true,
  autoAnimate: true,
  tintOpacity: 0,
  blur: 0,
  radius: 14,
  intensity: 1.25,
  style: {
    fontFamily: 'ui-monospace, monospace',
    letterSpacing: '0.06em',
    fontWeight: 600,
    fontSize: '0.78rem',
    padding: '0.85rem 1rem',
    boxShadow: 'none',
  },
}

/** Área de Config da sidebar — engrenagem abre Salvar / Importar / Resetar. */
export function SaveToolbar({ collapsed = false }) {
  const [open, setOpen] = useState(false)
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
    ? new Date(lastSave).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : null

  if (collapsed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 0' }}>
        <button
          type="button"
          title="Config"
          onClick={() => setOpen(v => !v)}
          style={{
            background: 'transparent',
            border: 'none',
            color: open ? '#a855f7' : '#666',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
          }}
        >
          <Settings size={16} />
        </button>
        {open && (
          <>
            <Button type="button" variant="primary" size="sm" autoAnimate tintOpacity={0} blur={0} radius={12} onClick={handleExport} title="Salvar" style={{ padding: '0.65rem', boxShadow: 'none' }}>
              <Save size={15} />
            </Button>
            <Button type="button" variant="secondary" size="sm" autoAnimate tintOpacity={0} blur={0} radius={12} onClick={handleImport} title="Importar" style={{ padding: '0.65rem', boxShadow: 'none' }}>
              <Upload size={15} />
            </Button>
            <Button type="button" variant="danger" size="sm" autoAnimate tintOpacity={0} blur={0} radius={12} onClick={handleReset} title="Resetar" style={{ padding: '0.65rem', boxShadow: 'none' }}>
              <RotateCcw size={15} />
            </Button>
          </>
        )}
        <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleFile} />
      </div>
    )
  }

  return (
    <div style={{ background: 'transparent' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
          padding: '0.85rem 1rem',
          background: 'transparent',
          border: 'none',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          color: open ? '#c4b5fd' : '#888',
          cursor: 'pointer',
          fontFamily: 'ui-monospace, monospace',
          fontSize: '0.72rem',
          letterSpacing: '0.1em',
          fontWeight: 600,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.color = '#c4c4c4' }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.color = '#888' }}
      >
        <Settings size={15} style={{ color: open ? '#a855f7' : 'currentColor', flexShrink: 0 }} />
        <span style={{ flex: 1, textAlign: 'left' }}>CONFIG</span>
        <ChevronUp
          size={14}
          style={{
            transform: open ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.2s',
            opacity: 0.6,
          }}
        />
      </button>

      {open && (
        <div style={{
          padding: '0.35rem 0.9rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.55rem',
        }}>
          <Button
            type="button"
            variant="primary"
            onClick={handleExport}
            tint="#60a5fa"
            lineColor="#93c5fd"
            baseColor="#3b82f6"
            textColor="#93c5fd"
            {...SIDEBAR_BTN}
          >
            <Save size={15} />
            Salvar Campanha
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={handleImport}
            tint="#ffffff"
            lineColor="#d4d4d8"
            baseColor="#71717a"
            textColor="#a1a1aa"
            {...SIDEBAR_BTN}
          >
            <Upload size={15} />
            Importar
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={handleReset}
            title="Apaga personagens, NPCs, bosses, orgs e demais dados de teste"
            tint="#f87171"
            lineColor="#fecaca"
            baseColor="#ef4444"
            textColor="#f87171"
            {...SIDEBAR_BTN}
          >
            <RotateCcw size={15} />
            Resetar tudo
          </Button>

          {lastLabel && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.55rem',
              color: '#444',
              fontFamily: 'monospace',
              padding: '0.25rem 0 0',
            }}>
              <HardDrive size={10} />
              {lastLabel}
            </div>
          )}
        </div>
      )}

      <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  )
}
