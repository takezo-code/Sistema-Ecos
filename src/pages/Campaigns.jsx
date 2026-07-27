import React, { useState } from 'react'
import { BookOpen, Plus, Pencil, Trash2, CheckCircle, GitBranch } from 'lucide-react'
import { CampaignFlows } from './CampaignFlows'
import { useCampaignStore } from '../store/useCampaignStore'
import { PageHeader } from '../components/ui/PageHeader'
import { Modal } from '../components/ui/Modal'
import { Field, Input, Textarea, Select } from '../components/ui/Field'
import { StatusTag } from '../components/ui/StatusTag'
import { EmptyState } from '../components/ui/EmptyState'
import { SceneImageGalleryEditor, SceneImageGalleryView, normalizeSceneImages } from '../components/ui/SceneImageGallery'
import { formatDate } from '../utils/id'

const EMPTY_FORM = {
  name: '', description: '',
  timeline: { past: '', present: '', future: '' },
  status: 'ativa',
  images: [],
}

function CampaignForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...(initial || {}),
    timeline: { ...EMPTY_FORM.timeline, ...(initial?.timeline || {}) },
    images: normalizeSceneImages(initial?.images),
  }))

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))
  const setTimeline = (field, val) => setForm(f => ({ ...f, timeline: { ...f.timeline, [field]: val } }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({ ...form, images: normalizeSceneImages(form.images) })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Field label="Nome" required>
        <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nome da campanha" autoFocus />
      </Field>
      <Field label="Descrição">
        <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Sinopse ou premissa da campanha..." rows={3} />
      </Field>
      <Field label="Status">
        <Select value={form.status} onChange={e => set('status', e.target.value)}>
          <option value="ativa">Ativa</option>
          <option value="pausada">Pausada</option>
          <option value="concluída">Concluída</option>
        </Select>
      </Field>
      <hr className="divide-line" />
      <SceneImageGalleryEditor
        images={form.images}
        onChange={imgs => set('images', imgs)}
        label="Referências do mundo"
      />
      <hr className="divide-line" />
      <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em' }}>TIMELINE NARRATIVA</div>
      <Field label="Passado">
        <Textarea value={form.timeline.past} onChange={e => setTimeline('past', e.target.value)} placeholder="Eventos do passado que moldaram o presente..." rows={2} />
      </Field>
      <Field label="Presente">
        <Textarea value={form.timeline.present} onChange={e => setTimeline('present', e.target.value)} placeholder="Situação atual da campanha..." rows={2} />
      </Field>
      <Field label="Futuro">
        <Textarea value={form.timeline.future} onChange={e => setTimeline('future', e.target.value)} placeholder="Possíveis caminhos e destinos..." rows={2} />
      </Field>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary">Salvar</button>
      </div>
    </form>
  )
}

function CampaignCard({ campaign, isActive, onOpen, onEdit, onDelete, onActivate }) {
  return (
    <div
      onClick={onOpen}
      style={{
        background: '#111',
        border: `1px solid ${isActive ? 'rgba(220,38,38,0.3)' : '#1a1a1a'}`,
        borderLeft: `3px solid ${isActive ? '#dc2626' : '#1a1a1a'}`,
        borderRadius: '4px',
        padding: '1rem 1.25rem',
        transition: 'border-color 0.15s, background 0.15s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#141414' }}
      onMouseLeave={e => { e.currentTarget.style.background = '#111' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e5e5e5' }}>{campaign.name}</span>
            <StatusTag status={campaign.status} />
            {isActive && (
              <span className="tag tag-red" style={{ fontSize: '0.6rem' }}>● ATIVA</span>
            )}
          </div>
          {campaign.description && (
            <p style={{ fontSize: '0.775rem', color: '#555', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              {campaign.description}
            </p>
          )}
          <div onClick={e => e.stopPropagation()}>
            <SceneImageGalleryView images={campaign.images} title="Mundo" />
          </div>
          {(campaign.timeline?.past || campaign.timeline?.present || campaign.timeline?.future) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {['past', 'present', 'future'].map((key, i) => (
                campaign.timeline[key] ? (
                  <div key={key} style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '3px', padding: '0.5rem 0.625rem' }}>
                    <div style={{ fontSize: '0.6rem', color: '#333', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '3px' }}>
                      {['PASSADO', 'PRESENTE', 'FUTURO'][i]}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#666', lineHeight: 1.5 }}>
                      {campaign.timeline[key].length > 80 ? campaign.timeline[key].slice(0, 80) + '…' : campaign.timeline[key]}
                    </div>
                  </div>
                ) : null
              ))}
            </div>
          )}
          <div style={{ fontSize: '0.65rem', color: '#2a2a2a', fontFamily: 'monospace', marginTop: '0.625rem' }}>
            CRIADA {formatDate(campaign.createdAt)}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: '32px' }} onClick={e => e.stopPropagation()}>
          <button
            onClick={onOpen}
            title="Ver fluxos da campanha"
            style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '4px', transition: 'color 0.15s', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = '#06b6d4'}
            onMouseLeave={e => e.currentTarget.style.color = '#333'}
          >
            <GitBranch size={14} />
          </button>
          {!isActive && (
            <button
              onClick={onActivate}
              title="Definir como ativa"
              style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '4px', transition: 'color 0.15s', display: 'flex' }}
              onMouseEnter={e => e.currentTarget.style.color = '#16a34a'}
              onMouseLeave={e => e.currentTarget.style.color = '#333'}
            >
              <CheckCircle size={14} />
            </button>
          )}
          <button
            onClick={onEdit}
            title="Editar"
            style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '4px', transition: 'color 0.15s', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = '#999'}
            onMouseLeave={e => e.currentTarget.style.color = '#333'}
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            title="Excluir"
            style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '4px', transition: 'color 0.15s', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
            onMouseLeave={e => e.currentTarget.style.color = '#333'}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function Campaigns({ pageTitle = 'História' }) {
  const { campaigns, activeCampaignId, addCampaign, updateCampaign, deleteCampaign, setActiveCampaign } = useCampaignStore()
  const [viewingCampaign, setViewingCampaign] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (c) => { setEditing(c); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const handleSave = (data) => {
    if (editing) {
      updateCampaign(editing.id, data)
    } else {
      const nc = addCampaign(data)
      if (campaigns.length === 0) setActiveCampaign(nc.id)
    }
    closeModal()
  }

  const handleDelete = (id) => {
    deleteCampaign(id)
    setDeleteConfirm(null)
  }

  const sorted = [...campaigns].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const openFlows = (campaign) => {
    setActiveCampaign(campaign.id)
    setViewingCampaign(campaign)
  }

  if (viewingCampaign) {
    const fresh = campaigns.find(c => c.id === viewingCampaign.id) || viewingCampaign
    return (
      <CampaignFlows
        campaign={fresh}
        onBack={() => setViewingCampaign(null)}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        icon={BookOpen}
        title={pageTitle}
        subtitle={`${campaigns.length} CAMPANHAS REGISTRADAS`}
        action={
          <button className="btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
            <Plus size={13} /> Nova Campanha
          </button>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
        {sorted.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Nenhuma campanha criada"
            description="Crie sua primeira campanha para começar a organizar sua narrativa."
            action={<button className="btn-primary" onClick={openCreate}>Criar Campanha</button>}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sorted.map(c => (
              <CampaignCard
                key={c.id}
                campaign={c}
                isActive={c.id === activeCampaignId}
                onOpen={() => openFlows(c)}
                onEdit={() => openEdit(c)}
                onDelete={() => setDeleteConfirm(c)}
                onActivate={() => setActiveCampaign(c.id)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Campanha' : 'Nova Campanha'} maxWidth="640px">
        <CampaignForm
          initial={editing}
          onSave={handleSave}
          onCancel={closeModal}
        />
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Enviar para a lixeira" maxWidth="380px">
        <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1.25rem' }}>
          Enviar a campanha <strong style={{ color: '#e5e5e5' }}>{deleteConfirm?.name}</strong> para a lixeira?
          Você poderá restaurá-la depois.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
          <button className="btn-primary" onClick={() => handleDelete(deleteConfirm.id)}>Excluir</button>
        </div>
      </Modal>
    </div>
  )
}
