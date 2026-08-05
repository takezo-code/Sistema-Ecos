import React, { useState } from 'react'
import { ScrollText, Plus, Pencil, Trash2 } from 'lucide-react'
import { useSessionStore } from '../store/useSessionStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { filterByActiveCampaign, withActiveCampaign } from '../utils/campaignScope'
import { ActiveCampaignBanner } from '../components/ui/ActiveCampaignBanner'
import { PageHeader } from '../components/ui/PageHeader'
import { Modal } from '../components/ui/Modal'
import { Field, Input, Textarea } from '../components/ui/Field'
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
      <Field label="Relatório da Sessão">
        <Textarea value={form.summary} onChange={e => set('summary', e.target.value)} placeholder="O que aconteceu durante a sessão, decisões dos jogadores, consequências..." rows={8} />
      </Field>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary">Salvar</button>
      </div>
    </form>
  )
}

function SessionListCard({ session, onOpen, onEdit, onDelete }) {
  const preview = session.summary?.trim()
  const previewLine = preview
    ? (preview.length > 120 ? `${preview.slice(0, 120)}…` : preview)
    : 'Sem relatório — clique para ver detalhes'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() } }}
      style={{
        background: '#111',
        border: '1px solid #1a1a1a',
        borderRadius: '4px',
        overflow: 'hidden',
        transition: 'border-color 0.15s, background 0.15s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#2a2a2a'
        e.currentTarget.style.background = '#141414'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#1a1a1a'
        e.currentTarget.style.background = '#111'
      }}
    >
      <div style={{ padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
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
            <div style={{
              fontSize: '0.7rem',
              color: preview ? '#555' : '#333',
              marginTop: '6px',
              lineHeight: 1.5,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {previewLine}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexShrink: 0 }}>
          <button type="button" onClick={e => { e.stopPropagation(); onEdit() }} title="Editar"
            style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '4px', transition: 'color 0.15s', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = '#999'}
            onMouseLeave={e => e.currentTarget.style.color = '#333'}
          >
            <Pencil size={13} />
          </button>
          <button type="button" onClick={e => { e.stopPropagation(); onDelete() }} title="Excluir"
            style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '4px', transition: 'color 0.15s', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
            onMouseLeave={e => e.currentTarget.style.color = '#333'}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

function SessionReportCard({ session, onEdit, onDelete, onClose }) {
  const hasReport = !!session.summary?.trim()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{
          minWidth: '48px', height: '48px',
          background: 'rgba(220,38,38,0.08)',
          border: '1px solid rgba(220,38,38,0.25)',
          borderRadius: '6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '0.85rem', color: '#dc2626', fontFamily: 'monospace', fontWeight: 800 }}>
            #{String(session.sessionNumber).padStart(2, '0')}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f5f5f5', margin: '0 0 0.35rem', lineHeight: 1.3 }}>
            {session.title}
          </h2>
          <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace' }}>
            Registrada em {formatDateTime(session.createdAt)}
            {session.updatedAt && session.updatedAt !== session.createdAt && (
              <span> · Atualizada em {formatDateTime(session.updatedAt)}</span>
            )}
          </div>
        </div>
      </div>

      <div style={{
        background: '#0d0d0d',
        border: '1px solid #1a1a1a',
        borderRadius: '6px',
        padding: '1.25rem',
        minHeight: '200px',
      }}>
        <div style={{
          fontSize: '0.6rem',
          color: '#d97706',
          fontFamily: 'monospace',
          letterSpacing: '0.12em',
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}>
          <ScrollText size={12} />
          RELATÓRIO DA SESSÃO
        </div>
        {hasReport ? (
          <p style={{
            fontSize: '0.875rem',
            color: '#bbb',
            lineHeight: 1.8,
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {session.summary}
          </p>
        ) : (
          <p style={{ fontSize: '0.8rem', color: '#444', fontStyle: 'italic', margin: 0 }}>
            Nenhum relatório registrado para esta sessão. Use Editar para documentar o que aconteceu.
          </p>
        )}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        paddingTop: '1rem',
        marginTop: '0.25rem',
        borderTop: '1px solid #1a1a1a',
      }}>
        <button
          type="button"
          className="btn-ghost"
          onClick={onClose}
          style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
        >
          Fechar
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onDelete}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
              padding: '0.4rem 0.85rem',
              color: '#f87171',
              borderColor: 'rgba(220,38,38,0.35)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(220,38,38,0.55)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(220,38,38,0.35)' }}
          >
            <Trash2 size={14} />
            Excluir
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onEdit}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.4rem 1rem' }}
          >
            <Pencil size={14} />
            Editar relatório
          </button>
        </div>
      </div>
    </div>
  )
}

export function Sessions() {
  const { activeCampaignId } = useCampaignStore()
  const { sessions, addSession, updateSession, deleteSession } = useSessionStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filtered = filterByActiveCampaign(sessions, activeCampaignId)
    .sort((a, b) => b.sessionNumber - a.sessionNumber)

  const nextNumber = filtered.length > 0
    ? Math.max(...filtered.map(s => s.sessionNumber)) + 1
    : 1

  const openCreate = () => { setEditing(null); setViewing(null); setModalOpen(true) }
  const openEdit = (s) => { setEditing(s); setViewing(null); setModalOpen(true) }
  const openView = (s) => setViewing(s)
  const closeModal = () => { setModalOpen(false); setEditing(null) }
  const closeView = () => setViewing(null)

  const handleEditFromView = () => {
    if (!viewing) return
    const s = viewing
    setViewing(null)
    openEdit(s)
  }

  const handleDeleteFromView = () => {
    if (!viewing) return
    setDeleteConfirm(viewing)
    setViewing(null)
  }

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
              <SessionListCard
                key={s.id}
                session={s}
                onOpen={() => openView(s)}
                onEdit={() => openEdit(s)}
                onDelete={() => setDeleteConfirm(s)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={!!viewing}
        onClose={closeView}
        title={viewing ? `Sessão #${String(viewing.sessionNumber).padStart(2, '0')}` : ''}
        maxWidth="720px"
      >
        {viewing && (
          <SessionReportCard
            session={viewing}
            onClose={closeView}
            onEdit={handleEditFromView}
            onDelete={handleDeleteFromView}
          />
        )}
      </Modal>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Sessão' : 'Nova Sessão'} maxWidth="680px">
        <SessionForm initial={editing} nextNumber={nextNumber} onSave={handleSave} onCancel={closeModal} />
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Enviar para a lixeira" maxWidth="380px">
        <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1.25rem' }}>
          Enviar a sessão <strong style={{ color: '#e5e5e5' }}>{deleteConfirm?.title}</strong> para a lixeira?
          Você poderá restaurá-la depois.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
          <button className="btn-primary" onClick={() => { deleteSession(deleteConfirm.id); setDeleteConfirm(null) }}>Excluir</button>
        </div>
      </Modal>
    </div>
  )
}
