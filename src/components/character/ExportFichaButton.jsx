import { useState } from 'react'
import { Download, FileImage, FileText, Loader2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { downloadCharacterSheetPng, downloadCharacterSheetPdf } from '../../services/characterSheetExport'
import { useSaveStore } from '../../store/useSaveStore'

export function ExportFichaButton({ entity }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(null)
  const showToast = useSaveStore(s => s.showToast)

  const run = async (format) => {
    if (!entity || busy) return
    setBusy(format)
    try {
      if (format === 'png') await downloadCharacterSheetPng(entity)
      else await downloadCharacterSheetPdf(entity)
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
      <Button
        type="button"
        variant="secondary"
        size="xs"
        onClick={() => setOpen(true)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
      >
        <Download size={12} style={{ color: '#e5e5e5' }} />
        Exportar ficha
      </Button>

      <Modal
        open={open}
        onClose={() => { if (!busy) setOpen(false) }}
        title={`Exportar ficha — ${entity?.name || ''}`}
        maxWidth="420px"
      >
        <p style={{ fontSize: '0.8rem', color: '#888', lineHeight: 1.55, margin: '0 0 1rem' }}>
          Gera uma ficha de leitura com atributos, skills, arma e armadura.
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
