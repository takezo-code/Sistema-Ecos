import React, { useState } from 'react'
import { BookOpen, Pencil, Trash2 } from 'lucide-react'
import { CampaignFlows } from './CampaignFlows'
import { useCampaignStore } from '../store/useCampaignStore'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Field, Input, Textarea } from '../components/ui/Field'
import { EmptyState } from '../components/ui/EmptyState'
import { SceneImageGalleryView, normalizeSceneImages } from '../components/ui/SceneImageGallery'
import { formatDate } from '../utils/id'
import SpotlightCard from '../components/react-bits/SpotlightCard'
import { FloatingTooltip } from '../components/ui/FloatingTooltip'

const EMPTY_FORM = {
  name: '',
  description: '',
  timeline: { past: '', present: '', future: '' },
  status: 'ativa',
  images: [],
}

function CampaignForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({
    name: initial?.name || '',
    description: initial?.description || '',
  }))

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({
      ...EMPTY_FORM,
      ...(initial || {}),
      name: form.name,
      description: form.description,
      timeline: initial?.timeline || EMPTY_FORM.timeline,
      status: initial?.status || EMPTY_FORM.status,
      images: normalizeSceneImages(initial?.images),
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Field label="Nome" required>
        <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nome da campanha" autoFocus />
      </Field>
      <Field label="Descrição">
        <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Sinopse ou premissa da campanha..." rows={3} />
      </Field>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  )
}

function CampaignCard({ campaign, isActive, onOpen, onEdit, onDelete }) {
  return (
    <SpotlightCard
      onClick={onOpen}
      spotlightColor={isActive ? 'rgba(220, 38, 38, 0.18)' : 'rgba(37, 99, 235, 0.16)'}
      style={{
        padding: '1.15rem 1.35rem',
        cursor: 'pointer',
        borderLeft: `3px solid ${isActive ? '#dc2626' : 'rgba(255,255,255,0.08)'}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap', marginBottom: '0.45rem' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f5f5f5' }}>{campaign.name}</span>
          </div>
          {campaign.description && (
            <p style={{ fontSize: '0.8rem', color: '#777', lineHeight: 1.6, marginBottom: '0.75rem' }}>
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
                  <div key={key} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '0.55rem 0.65rem',
                  }}>
                    <div style={{ fontSize: '0.6rem', color: '#555', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '3px' }}>
                      {['PASSADO', 'PRESENTE', 'FUTURO'][i]}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#888', lineHeight: 1.5 }}>
                      {campaign.timeline[key].length > 80 ? campaign.timeline[key].slice(0, 80) + '…' : campaign.timeline[key]}
                    </div>
                  </div>
                ) : null
              ))}
            </div>
          )}
          <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', marginTop: '0.7rem' }}>
            CRIADA {formatDate(campaign.createdAt)}
          </div>
        </div>
        <FloatingTooltip.Provider>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: '32px' }} onClick={e => e.stopPropagation()}>
            <FloatingTooltip.Trigger content="Editar">
              <button
                type="button"
                onClick={onEdit}
                style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', padding: '4px', display: 'flex' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#999' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#555' }}
              >
                <Pencil size={14} />
              </button>
            </FloatingTooltip.Trigger>
            <FloatingTooltip.Trigger content="Excluir">
              <button
                type="button"
                onClick={onDelete}
                style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', padding: '4px', display: 'flex' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#dc2626' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#555' }}
              >
                <Trash2 size={14} />
              </button>
            </FloatingTooltip.Trigger>
          </div>
        </FloatingTooltip.Provider>
      </div>
    </SpotlightCard>
  )
}

export function Campaigns() {
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
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.5rem 5.5rem' }}>
        {sorted.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Nenhuma campanha criada"
            description="Crie sua primeira campanha para começar a organizar sua narrativa."
            action={<Button onClick={openCreate} size="xs">Criar Campanha</Button>}
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
              />
            ))}
          </div>
        )}
      </div>

      <Button
        onClick={openCreate}
        size="sm"
        style={{
          position: 'absolute',
          right: '1.5rem',
          bottom: '2.25rem',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
        }}
      >
        Adicionar Campanha
      </Button>

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
          <Button variant="danger" onClick={() => handleDelete(deleteConfirm.id)}>Excluir</Button>
        </div>
      </Modal>
    </div>
  )
}
