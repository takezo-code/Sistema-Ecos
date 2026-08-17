import { useState } from 'react'
import { Download, FileImage, FileText, Loader2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { downloadEntitySheet } from '../../services/characterSheetExport'
import { useSaveStore } from '../../store/useSaveStore'
import { isNpcEntity } from '../../constants/entityProgression'

const COPY = {
  character: 'Gera uma ficha de leitura com atributos, skills, arma e armadura.',
  npc: 'Gera uma ficha de leitura do NPC com atributos, equipamento e skills.',
  boss: 'Gera uma ficha de leitura do boss com atributos, equipamento e skills.',
  organization: 'Gera uma ficha da organização com descrição, ideologia, aliados e inimigos.',
}

function resolveExportKind(entity, kind) {
  if (kind) return kind
  if (entity?.papelCombate === 'boss') return 'boss'
  if (isNpcEntity(entity)) return 'npc'
  return 'character'
}

export function ExportFichaButton({ entity, kind, compact = false }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(null)
  const showToast = useSaveStore(s => s.showToast)
  const resolvedKind = resolveExportKind(entity, kind)
  const label = resolvedKind === 'organization' ? 'Exportar' : 'Exportar ficha'

  const run = async (format) => {
    if (!entity || busy) return
    setBusy(format)
    try {
      await downloadEntitySheet(entity, format, resolvedKind)
      showToast(format === 'png' ? 'Ficha exportada em PNG.' : 'Ficha exportada em PDF.', 'success')
      setOpen(false)
    } catch (error) {
      showToast(error?.message || 'Não foi possível exportar a ficha.', 'error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          title={label}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            color: '#888',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#e5e5e5'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#888'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
          }}
        >
          <Download size={14} />
        </button>
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="xs"
          onClick={() => setOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <Download size={12} style={{ color: '#e5e5e5' }} />
          {label}
        </Button>
      )}

      <Modal
        open={open}
        onClose={() => { if (!busy) setOpen(false) }}
        title={`${label} — ${entity?.name || ''}`}
        maxWidth="420px"
      >
        <p style={{ fontSize: '0.8rem', color: '#888', lineHeight: 1.55, margin: '0 0 1rem' }}>
          {COPY[resolvedKind] || COPY.character}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            type="button"
            variant="secondary"
            disabled={!!busy}
            onClick={() => run('png')}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {busy === 'png' ? <Loader2 size={14} className="animate-spin" /> : <FileImage size={14} />}
            PNG
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!!busy}
            onClick={() => run('pdf')}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {busy === 'pdf' ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            PDF
          </Button>
        </div>
      </Modal>
    </>
  )
}
