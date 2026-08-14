import React, { useState } from 'react'
import { Building2, Pencil, Trash2, Shield } from 'lucide-react'
import { useOrganizationStore } from '../store/useOrganizationStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { filterByActiveCampaign } from '../utils/campaignScope'
import { useTrashStore } from '../store/useTrashStore'
import { Modal } from '../components/ui/Modal'
import { Field, Input, Textarea } from '../components/ui/Field'
import { ImageUpload } from '../components/ui/ImageUpload'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import SpotlightCard from '../components/react-bits/SpotlightCard'
import { FloatingTooltip } from '../components/ui/FloatingTooltip'
import GlassSurface from '../components/react-bits/GlassSurface'

const ACCENT = '#d97706'

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

function OrgThumb({ org }) {
  if (org.image) {
    return (
      <img
        src={org.image}
        alt={org.name}
        style={{
          width: 64,
          height: 64,
          objectFit: 'cover',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
        onError={e => { e.target.style.display = 'none' }}
      />
    )
  }
  return (
    <div style={{
      width: 64,
      height: 64,
      borderRadius: 12,
      background: 'rgba(217,119,6,0.12)',
      border: '1px solid rgba(217,119,6,0.28)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      fontSize: org.symbol ? '1.6rem' : undefined,
    }}>
      {org.symbol || <Shield size={22} style={{ color: ACCENT }} />}
    </div>
  )
}

function OrgCard({ org, onEdit, onDelete }) {
  const hasRelations = Boolean(org.allies || org.enemies)

  return (
    <SpotlightCard
      onClick={onEdit}
      spotlightColor="rgba(217, 119, 6, 0.2)"
      style={{
        padding: 0,
        cursor: 'pointer',
        borderLeft: `3px solid ${ACCENT}`,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '1.1rem 1.2rem 0.85rem',
      }}>
        <div style={{ display: 'flex', gap: '0.9rem', flex: 1, minWidth: 0 }}>
          <OrgThumb org={org} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#f5f5f5',
              letterSpacing: '-0.02em',
            }}>
              {org.name}
            </div>
          </div>
        </div>

        <FloatingTooltip.Provider>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flexShrink: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <FloatingTooltip.Trigger content="Editar">
              <button
                type="button"
                onClick={onEdit}
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
                <Pencil size={14} />
              </button>
            </FloatingTooltip.Trigger>
            <FloatingTooltip.Trigger content="Excluir">
              <button
                type="button"
                onClick={onDelete}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  color: '#666',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  transition: 'color 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#f87171'
                  e.currentTarget.style.borderColor = 'rgba(220,38,38,0.35)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#666'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                }}
              >
                <Trash2 size={14} />
              </button>
            </FloatingTooltip.Trigger>
          </div>
        </FloatingTooltip.Provider>
      </div>

      {(org.description || org.ideology || hasRelations) && (
        <div style={{ padding: '0 1.1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {org.description && (
            <p style={{
              fontSize: '0.8rem',
              color: '#888',
              lineHeight: 1.55,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {org.description}
            </p>
          )}

          {org.ideology && (
            <GlassSurface borderRadius={10} padding="0.65rem 0.75rem">
              <div style={{
                fontSize: '0.58rem',
                color: '#67e8f9',
                fontFamily: 'monospace',
                letterSpacing: '0.1em',
                marginBottom: 4,
              }}>
                IDEOLOGIA
              </div>
              <div style={{ fontSize: '0.75rem', color: '#999', lineHeight: 1.5 }}>
                {org.ideology}
              </div>
            </GlassSurface>
          )}

          {hasRelations && (
            <div style={{ display: 'grid', gridTemplateColumns: org.allies && org.enemies ? '1fr 1fr' : '1fr', gap: '0.45rem' }}>
              {org.allies && (
                <GlassSurface borderRadius={10} padding="0.65rem 0.75rem">
                  <div style={{
                    fontSize: '0.58rem',
                    color: '#4ade80',
                    fontFamily: 'monospace',
                    letterSpacing: '0.1em',
                    marginBottom: 4,
                  }}>
                    ALIADOS
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#999', lineHeight: 1.5 }}>
                    {org.allies}
                  </div>
                </GlassSurface>
              )}
              {org.enemies && (
                <GlassSurface borderRadius={10} padding="0.65rem 0.75rem">
                  <div style={{
                    fontSize: '0.58rem',
                    color: '#f87171',
                    fontFamily: 'monospace',
                    letterSpacing: '0.1em',
                    marginBottom: 4,
                  }}>
                    INIMIGOS
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#999', lineHeight: 1.5 }}>
                    {org.enemies}
                  </div>
                </GlassSurface>
              )}
            </div>
          )}
        </div>
      )}
    </SpotlightCard>
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
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Nenhuma organização para gerenciar"
            description="Crie organizações em Criação na sidebar para gerenciá-las aqui."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '720px' }}>
            {filtered.map(o => (
              <OrgCard
                key={o.id}
                org={o}
                onEdit={() => setEditing(o)}
                onDelete={() => setDeleteConfirm(o)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Organização" maxWidth="600px">
        {editing && <OrgForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />}
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Excluir organização" maxWidth="380px">
        <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1.25rem' }}>
          Enviar a organização <strong style={{ color: '#e5e5e5' }}>{deleteConfirm?.name}</strong> para a lixeira?
          Você pode restaurá-la em Lixeira.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
          <Button type="button" variant="danger" onClick={() => { deleteOrganization(deleteConfirm.id); refreshTrash(); setDeleteConfirm(null) }}>Excluir</Button>
        </div>
      </Modal>
    </div>
  )
}
