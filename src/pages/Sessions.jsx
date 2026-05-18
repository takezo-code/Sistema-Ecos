import React, { useState } from 'react'
import { ScrollText, Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useSessionStore } from '../store/useSessionStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { filterByActiveCampaign, withActiveCampaign } from '../utils/campaignScope'
import { ActiveCampaignBanner } from '../components/ui/ActiveCampaignBanner'
import { PageHeader } from '../components/ui/PageHeader'
import { Modal } from '../components/ui/Modal'
import { Field, Input, Textarea, Select } from '../components/ui/Field'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDateTime } from '../utils/id'

const EMPTY_FORM = {
  title: '',
  summary: '',
  sessionNumber: 1,
}

function SessionForm({ initial, nextNumber, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial
      ? { title: initial.title || '', summary: initial.summary || '', sessionNumber: initial.sessionNumber || 1 }
      : { ...EMPTY_FORM, sessionNumber: nextNumber }
  )
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }))

  return (
    <form onSubmit={e => { e.preventDefault(); if (!form.title.trim()) return; onSave(form) }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'end' }}>
        <Field label="Título da Sessão" required>
          <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: A Chegada em Arkham" autoFocus />
        </Field>
        <Field label="Nº Sessão">
          <Input type="number" value={form.sessionNumber} onChange={e => set('sessionNumber', parseInt(e.target.value) || 1)} style={{ width: '80px', textAlign: 'center' }} min="1" />
        </Field>
      </div>
      <Field label="Resumo">
        <Textarea value={form.summary} onChange={e => set('summary', e.target.value)} placeholder="O que aconteceu durante a sessão..." rows={4} />
      </Field>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary">Salvar</button>
      </div>
    </form>
  )
}

function SessionCard({ session, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      style={{
        background: '#111',
        border: '1px solid #1a1a1a',
        borderRadius: '4px',
        overflow: 'hidden',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a1a'}
    >
      <div
        style={{
          padding: '0.875rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: session.summary ? 'pointer' : 'default',
          gap: '1rem',
        }}
        onClick={() => session.summary && setExpanded(e => !e)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
          <div style={{
            minWidth: '36px', height: '36px',
            background: '#0d0d0d',
            border: '1px solid #1a1a1a',
            borderRadius: '3px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '0.7rem', color: '#dc2626', fontFamily: 'monospace', fontWeight: 700 }}>
              #{String(session.sessionNumber).padStart(2, '0')}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e5e5e5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session.title}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#333', fontFamily: 'monospace', marginTop: '2px' }}>
              {formatDateTime(session.createdAt)}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexShrink: 0 }}>
          <button onClick={e => { e.stopPropagation(); onEdit() }} title="Editar"
            style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '4px', transition: 'color 0.15s', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = '#999'}
            onMouseLeave={e => e.currentTarget.style.color = '#333'}
          >
            <Pencil size={13} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete() }} title="Excluir"
            style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '4px', transition: 'color 0.15s', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
            onMouseLeave={e => e.currentTarget.style.color = '#333'}
          >
            <Trash2 size={13} />
          </button>
          {session.summary && (expanded ? <ChevronUp size={13} style={{ color: '#333' }} /> : <ChevronDown size={13} style={{ color: '#333' }} />)}
        </div>
      </div>

      {expanded && session.summary && (
        <div style={{ borderTop: '1px solid #1a1a1a', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.6rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '4px' }}>RESUMO</div>
          <p style={{ fontSize: '0.8rem', color: '#888', lineHeight: 1.7 }}>{session.summary}</p>
        </div>
      )}
    </div>
  )
}

export function Sessions() {
  const { activeCampaignId } = useCampaignStore()
  const { sessions, addSession, updateSession, deleteSession } = useSessionStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filtered = filterByActiveCampaign(sessions, activeCampaignId)
    .sort((a, b) => b.sessionNumber - a.sessionNumber)

  const nextNumber = filtered.length > 0
    ? Math.max(...filtered.map(s => s.sessionNumber)) + 1
    : 1

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (s) => { setEditing(s); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const handleSave = (data) => {
    const payload = {
      title: data.title?.trim() || 'Nova Sessão',
      summary: data.summary || '',
      sessionNumber: data.sessionNumber || 1,
    }
    if (editing) {
      updateSession(editing.id, payload)
    } else {
      addSession(withActiveCampaign(payload, activeCampaignId))
    }
    closeModal()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        icon={ScrollText}
        title="Sessões"
        subtitle={`${filtered.length} SESSÕES NA CAMPANHA`}
        action={
          <button className="btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
            <Plus size={13} /> Nova Sessão
          </button>
        }
      />

      <ActiveCampaignBanner />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="Nenhuma sessão registrada"
            description="Documente o histórico das suas sessões de RPG."
            action={<button className="btn-primary" onClick={openCreate}>Registrar Sessão</button>}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '800px' }}>
            {filtered.map(s => (
              <SessionCard
                key={s.id}
                session={s}
                onEdit={() => openEdit(s)}
                onDelete={() => setDeleteConfirm(s)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Sessão' : 'Nova Sessão'} maxWidth="680px">
        <SessionForm initial={editing} nextNumber={nextNumber} onSave={handleSave} onCancel={closeModal} />
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar Exclusão" maxWidth="380px">
        <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1.25rem' }}>
          Excluir a sessão <strong style={{ color: '#e5e5e5' }}>{deleteConfirm?.title}</strong>?
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
          <button className="btn-primary" onClick={() => { deleteSession(deleteConfirm.id); setDeleteConfirm(null) }}>Excluir</button>
        </div>
      </Modal>
    </div>
  )
}
