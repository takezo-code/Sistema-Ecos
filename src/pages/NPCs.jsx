import React, { useState } from 'react'
import { Skull, Plus, Pencil, Trash2, Search, Eye } from 'lucide-react'
import { useNPCStore } from '../store/useNPCStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { useOrganizationStore } from '../store/useOrganizationStore'
import { filterByActiveCampaign, withActiveCampaign } from '../utils/campaignScope'
import { ActiveCampaignBanner } from '../components/ui/ActiveCampaignBanner'
import { PageHeader } from '../components/ui/PageHeader'
import { Modal } from '../components/ui/Modal'
import { Field, Input, Textarea, Select } from '../components/ui/Field'
import { ImageUpload } from '../components/ui/ImageUpload'
import { StatusTag } from '../components/ui/StatusTag'
import { EmptyState } from '../components/ui/EmptyState'

const EMPTY_FORM = {
  name: '', image: '', description: '', motivation: '', secret: '', organization: '', status: 'vivo'
}

function NPCForm({ initial, onSave, onCancel, campaignId, organizations }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...(initial || {}), campaignId })
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }))

  return (
    <form onSubmit={e => { e.preventDefault(); if (!form.name.trim()) return; onSave(form) }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field label="Nome" required>
          <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nome do NPC" autoFocus />
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="vivo">Vivo</option>
            <option value="morto">Morto</option>
            <option value="desaparecido">Desaparecido</option>
          </Select>
        </Field>
      </div>
      <ImageUpload
        value={form.image}
        onChange={v => set('image', v)}
        label="Foto do NPC"
      />
      <Field label="Organização">
        {organizations.length > 0 ? (
          <Select value={form.organization} onChange={e => set('organization', e.target.value)}>
            <option value="">Nenhuma</option>
            {organizations.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
          </Select>
        ) : (
          <Input value={form.organization} onChange={e => set('organization', e.target.value)} placeholder="Nome da organização..." />
        )}
      </Field>
      <Field label="Descrição">
        <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Aparência, personalidade, história..." rows={3} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field label="Motivação">
          <Textarea value={form.motivation} onChange={e => set('motivation', e.target.value)} placeholder="O que move este NPC..." rows={2} />
        </Field>
        <Field label="Segredo">
          <Textarea value={form.secret} onChange={e => set('secret', e.target.value)} placeholder="O que ele esconde..." rows={2} />
        </Field>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary">Salvar</button>
      </div>
    </form>
  )
}

function NPCDetailModal({ npc, onClose, onEdit }) {
  if (!npc) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        {npc.image && (
          <img src={npc.image} alt={npc.name}
            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #2a2a2a', flexShrink: 0 }}
            onError={e => { e.target.style.display = 'none' }}
          />
        )}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e5e5e5' }}>{npc.name}</span>
            <StatusTag status={npc.status} />
          </div>
          {npc.organization && <div style={{ fontSize: '0.75rem', color: '#555' }}>{npc.organization}</div>}
        </div>
      </div>
      {npc.description && (
        <div>
          <div style={{ fontSize: '0.6rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '4px' }}>DESCRIÇÃO</div>
          <p style={{ fontSize: '0.8rem', color: '#888', lineHeight: 1.7 }}>{npc.description}</p>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {npc.motivation && (
          <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '3px', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.6rem', color: '#06b6d4', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '4px' }}>MOTIVAÇÃO</div>
            <p style={{ fontSize: '0.775rem', color: '#666', lineHeight: 1.6 }}>{npc.motivation}</p>
          </div>
        )}
        {npc.secret && (
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '3px', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.6rem', color: '#dc2626', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '4px' }}>SEGREDO</div>
            <p style={{ fontSize: '0.775rem', color: '#666', lineHeight: 1.6 }}>{npc.secret}</p>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button className="btn-ghost" onClick={onClose}>Fechar</button>
        <button className="btn-secondary" onClick={onEdit}>
          <Pencil size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Editar
        </button>
      </div>
    </div>
  )
}

function NPCCard({ npc, onEdit, onDelete, onView }) {
  const statusColor = npc.status === 'vivo' ? '#16a34a' : npc.status === 'morto' ? '#dc2626' : '#d97706'
  return (
    <div
      style={{
        background: '#111',
        border: '1px solid #1a1a1a',
        borderRadius: '4px',
        overflow: 'hidden',
        transition: 'border-color 0.15s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a1a'}
      onClick={onView}
    >
      <div style={{ position: 'relative' }}>
        {npc.image ? (
          <img
            src={npc.image}
            alt={npc.name}
            style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }}
            onError={e => { e.target.style.display = 'none' }}
          />
        ) : (
          <div style={{ width: '100%', height: '80px', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Skull size={24} style={{ color: '#1a1a1a' }} />
          </div>
        )}
        <div style={{ position: 'absolute', top: '6px', right: '6px', display: 'flex', gap: '4px' }}
          onClick={e => e.stopPropagation()}>
          <button onClick={onView} title="Ver detalhes"
            style={{ background: 'rgba(0,0,0,0.6)', border: 'none', color: '#999', cursor: 'pointer', padding: '4px', borderRadius: '3px', display: 'flex' }}>
            <Eye size={12} />
          </button>
          <button onClick={onEdit} title="Editar"
            style={{ background: 'rgba(0,0,0,0.6)', border: 'none', color: '#999', cursor: 'pointer', padding: '4px', borderRadius: '3px', display: 'flex' }}>
            <Pencil size={12} />
          </button>
          <button onClick={onDelete} title="Excluir"
            style={{ background: 'rgba(0,0,0,0.6)', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '4px', borderRadius: '3px', display: 'flex' }}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      <div style={{ padding: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor, boxShadow: `0 0 6px ${statusColor}`, flexShrink: 0 }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e5e5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {npc.name}
          </span>
        </div>
        {npc.organization && (
          <div style={{ fontSize: '0.7rem', color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {npc.organization}
          </div>
        )}
        {npc.motivation && (
          <div style={{ fontSize: '0.7rem', color: '#333', marginTop: '4px', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {npc.motivation}
          </div>
        )}
      </div>
    </div>
  )
}

export function NPCs({ embedded = false, onNavigate }) {
  const { activeCampaignId } = useCampaignStore()
  const { npcs, addNPC, updateNPC, deleteNPC } = useNPCStore()
  const { organizations } = useOrganizationStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')

  const orgsByCampaign = filterByActiveCampaign(organizations, activeCampaignId)

  let filtered = filterByActiveCampaign(npcs, activeCampaignId)
  if (filterStatus !== 'todos') filtered = filtered.filter(n => n.status === filterStatus)
  if (search) filtered = filtered.filter(n =>
    n.name.toLowerCase().includes(search.toLowerCase()) ||
    (n.organization || '').toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (n) => { setEditing(n); setModalOpen(true); setViewing(null) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const handleSave = (data) => {
    if (editing) {
      updateNPC(editing.id, data)
    } else {
      addNPC(withActiveCampaign(data, activeCampaignId))
    }
    closeModal()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {!embedded && (
        <PageHeader
          icon={Skull}
          title="NPCs"
          subtitle={`${filtered.length} NPCs NA CAMPANHA`}
          action={
            <button className="btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
              <Plus size={13} /> Novo NPC
            </button>
          }
        />
      )}

      <ActiveCampaignBanner onNavigate={onNavigate} />
      <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #1a1a1a', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '280px' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#333' }} />
          <input
            className="input-base"
            style={{ paddingLeft: '2rem', fontSize: '0.8rem' }}
            placeholder="Buscar NPC..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 'auto', minWidth: '120px' }}>
          <option value="todos">Todos</option>
          <option value="vivo">Vivos</option>
          <option value="morto">Mortos</option>
          <option value="desaparecido">Desaparecidos</option>
        </Select>
        {embedded && (
          <button className="btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', marginLeft: 'auto' }}>
            <Plus size={13} /> Novo NPC
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Skull}
            title="Nenhum NPC encontrado"
            description={npcs.length === 0 ? "Crie o primeiro NPC da sua campanha." : "Tente ajustar os filtros de busca."}
            action={npcs.length === 0 && <button className="btn-primary" onClick={openCreate}>Criar NPC</button>}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {filtered.map(n => (
              <NPCCard
                key={n.id}
                npc={n}
                onEdit={() => openEdit(n)}
                onDelete={() => setDeleteConfirm(n)}
                onView={() => setViewing(n)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar NPC' : 'Novo NPC'} maxWidth="620px">
        <NPCForm
          initial={editing}
          campaignId={activeCampaignId}
          organizations={orgsByCampaign}
          onSave={handleSave}
          onCancel={closeModal}
        />
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Ficha do NPC" maxWidth="520px">
        <NPCDetailModal npc={viewing} onClose={() => setViewing(null)} onEdit={() => openEdit(viewing)} />
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar Exclusão" maxWidth="380px">
        <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1.25rem' }}>
          Excluir o NPC <strong style={{ color: '#e5e5e5' }}>{deleteConfirm?.name}</strong>? Esta ação não pode ser desfeita.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
          <button className="btn-primary" onClick={() => { deleteNPC(deleteConfirm.id); setDeleteConfirm(null) }}>Excluir</button>
        </div>
      </Modal>
    </div>
  )
}
