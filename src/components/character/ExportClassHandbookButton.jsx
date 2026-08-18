import { useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { getClassHandbook } from '../../data/classHandbooks'
import { downloadClassHandbookPdf } from '../../services/characterSheetExport'
import { useSaveStore } from '../../store/useSaveStore'

export function ExportClassHandbookButton({ classId, compact = false }) {
  const [busy, setBusy] = useState(false)
  const showToast = useSaveStore(s => s.showToast)
  const book = getClassHandbook(classId)
  if (!book) return null

  const run = async () => {
    if (busy) return
    setBusy(true)
    try {
      await downloadClassHandbookPdf(classId)
      showToast(`Guia de ${book.label} exportado em PDF.`, 'success')
    } catch (error) {
      showToast(error?.message || 'Não foi possível gerar o PDF da classe.', 'error')
    } finally {
      setBusy(false)
    }
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={run}
        disabled={busy}
        title={`Baixar guia de ${book.label}`}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          color: '#888',
          cursor: busy ? 'wait' : 'pointer',
          padding: '6px',
          display: 'flex',
          transition: 'color 0.15s, border-color 0.15s',
        }}
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
      </button>
    )
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="xs"
      disabled={busy}
      onClick={run}
      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
    >
      {busy ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
      PDF da classe
    </Button>
  )
}
