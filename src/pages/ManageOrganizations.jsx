import React, { useState } from 'react'
import { Building2, Pencil, Trash2, Shield } from 'lucide-react'
import { useOrganizationStore } from '../store/useOrganizationStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { filterByActiveCampaign } from '../utils/campaignScope'
import { useTrashStore } from '../store/useTrashStore'
import { ActiveCampaignBanner } from '../components/ui/ActiveCampaignBanner'
import { Modal } from '../components/ui/Modal'
import { Field, Input, Textarea } from '../components/ui/Field'
import { ImageUpload } from '../components/ui/ImageUpload'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'

const EMPTY_FORM = {
  name: '', image: '', symbol: '', description: '', ideology: '', allies: '', enemies: ''
}

function OrgForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...(initial || {}) })
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }))

  return (
    <form onSubmit={e => { e.preventDefault(); if (!form.name.trim()) return; onSave(form) }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'end' }}>
        <Field label="Nome" required>
          <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nome da organização" autoFocus />
        </Field>
        <Field label="Símbolo / Emoji">
          <Input value={form.symbol} onChange={e => set('symbol', e.target.value)} placeholder="⚔️" style={{ width: '80px', textAlign: 'center', fontSize: '1.25rem' }} />
        </Field>
      </div>
      <ImageUpload
        value={form.image}
        onChange={v => set('image', v)}
        label="Logo / imagem da organização"
      />
      <Field label="Descrição">
        <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="História, estrutura e propósito da organização..." rows={3} />
      </Field>
      <Field label="Ideologia">
        <Textarea value={form.ideology} onChange={e => set('ideology', e.target.value)} placeholder="Crenças, valores e objetivos maiores..." rows={2} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field label="Aliados">
          <Textarea value={form.allies} onChange={e => set('allies', e.target.value)} placeholder="Organizações e figuras aliadas..." rows={2} />
        </Field>
        <Field label="Inimigos">
          <Textarea value={form.enemies} onChange={e => set('enemies', e.target.value)} placeholder="Organizações e figuras inimigas..." rows={2} />
        </Field>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  )
}

function OrgCard({ org, onEdit, onDelete }) {
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
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid #1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#0d0d0d',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {org.image ? (
            <img
              src={org.image}
              alt={org.name}
              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '3px', border: '1px solid #2a2a2a' }}
              onError={e => { e.target.style.display = 'none' }}
            />
          ) : org.symbol ? (
            <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{org.symbol}</span>
          ) : (
            <Shield size={20} style={{ color: '#dc2626' }} />
          )}
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e5e5e5', letterSpacing: '-0.01em' }}>{org.name}</div>
            <div style={{ fontSize: '0.6rem', color: '#333', fontFamily: 'monospace', letterSpacing: '0.1em' }}>ORGANIZAÇÃO</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button onClick={onEdit} title="Editar"
            style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '4px', transition: 'color 0.15s', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = '#999'}
            onMouseLeave={e => e.currentTarget.style.color = '#333'}
          >
            <Pencil size={13} />
          </button>
          <button onClick={onDelete} title="Excluir"
            style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '4px', transition: 'color 0.15s', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
            onMouseLeave={e => e.currentTarget.style.color = '#333'}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div style={{ padding: '1rem 1.25rem' }}>
        {org.description && (
          <p style={{ fontSize: '0.775rem', color: '#666', lineHeight: 1.6, marginBottom: '0.75rem' }}>
            {org.description}
          </p>
        )}
        {org.ideology && (
          <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '3px', padding: '0.625rem 0.75rem', marginBottom: '0.625rem' }}>
            <div style={{ fontSize: '0.6rem', color: '#06b6d4', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '3px' }}>IDEOLOGIA</div>
            <div style={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.5 }}>{org.ideology}</div>
          </div>
        )}
        {(org.allies || org.enemies) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {org.allies && (
              <div style={{ background: '#0d0d0d', border: '1px solid rgba(22,163,74,0.15)', borderRadius: '3px', padding: '0.5rem 0.625rem' }}>
                <div style={{ fontSize: '0.6rem', color: '#16a34a', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '3px' }}>ALIADOS</div>
                <div style={{ fontSize: '0.7rem', color: '#555', lineHeight: 1.5 }}>{org.allies}</div>
              </div>
            )}
            {org.enemies && (
              <div style={{ background: '#0d0d0d', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '3px', padding: '0.5rem 0.625rem' }}>
                <div style={{ fontSize: '0.6rem', color: '#dc2626', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '3px' }}>INIMIGOS</div>
                <div style={{ fontSize: '0.7rem', color: '#555', lineHeight: 1.5 }}>{org.enemies}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function ManageOrganizations() {
  const { activeCampaignId } = useCampaignStore()
  const { organizations, updateOrganization, deleteOrganization } = useOrganizationStore()
  const refreshTrash = useTrashStore(s => s.refresh)
  const [editing, setEditing] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filtered = filterByActiveCampaign(organizations, activeCampaignId)

  const handleSave = (data) => {
    if (editing) updateOrganization(editing.id, data)
    setEditing(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ActiveCampaignBanner />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Nenhuma organização para gerenciar"
            description="Crie organizações em Criação na sidebar para gerenciá-las aqui."
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.75rem' }}>
            {filtered.map(o => (
              <OrgCard key={o.id} org={o} onEdit={() => setEditing(o)} onDelete={() => setDeleteConfirm(o)} />
            ))}
          </div>
        )}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Organização" maxWidth="600px">
        {editing && <OrgForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />}
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar Exclusão" maxWidth="380px">
        <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1.25rem' }}>
          Enviar a organização <strong style={{ color: '#e5e5e5' }}>{deleteConfirm?.name}</strong> para a lixeira?
          Você pode restaurá-la em Lixeira.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
          <Button variant="danger" onClick={() => { deleteOrganization(deleteConfirm.id); refreshTrash(); setDeleteConfirm(null) }}>Excluir</Button>
        </div>
      </Modal>
    </div>
  )
}
