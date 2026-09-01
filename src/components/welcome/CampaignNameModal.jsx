import React, { useEffect, useState } from 'react'
import { Modal } from '../ui/Modal'
import { Field, Input } from '../ui/Field'
import { Button } from '../ui/Button'

export function CampaignNameModal({
  open,
  onClose,
  title = 'Nova campanha',
  defaultName = '',
  confirmLabel = 'Criar',
  onSubmit,
}) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (open) setName(defaultName)
  }, [open, defaultName])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onSubmit?.(trimmed)
  }

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="420px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Field label="Nome da campanha" required>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex.: Crônicas do Void"
            autoFocus
          />
        </Field>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <Button type="submit" disabled={!name.trim()}>
            {confirmLabel}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
