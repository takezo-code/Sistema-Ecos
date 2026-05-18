import React, { useState } from 'react'
import { Sword, Plus, Pencil, Trash2, Package, User, ChevronUp, ChevronDown } from 'lucide-react'
import { useCharacterStore } from '../store/useCharacterStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { filterByActiveCampaign, withActiveCampaign } from '../utils/campaignScope'
import { ActiveCampaignBanner } from '../components/ui/ActiveCampaignBanner'
import { PageHeader } from '../components/ui/PageHeader'
import { Modal } from '../components/ui/Modal'
import { Field, Input, Textarea, Select } from '../components/ui/Field'
import { ImageUpload } from '../components/ui/ImageUpload'
import { EntityThumb } from '../components/ui/EntityThumb'
import { EmptyState } from '../components/ui/EmptyState'
import {
  ATTRIBUTES,
  defaultAttributes,
  STARTING_ATTRIBUTE_POINTS,
  INITIAL_ATTRIBUTE_MAX,
} from '../constants/attributes'
import { applyInitialAttributeChange } from '../services/progressionService'

const EMPTY_FORM = {
  name: '', image: '', description: '', narrativeStatus: '',
  attributes: defaultAttributes(),
  unspentAttributePoints: STARTING_ATTRIBUTE_POINTS,
}

function AttributeInput({ attr, value, onChange, canIncrease }) {
  return (
    <div style={{
      background: '#0d0d0d',
      border: '1px solid #1a1a1a',
      borderRadius: '3px',
      padding: '0.625rem 0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div>
        <div style={{ fontSize: '0.6rem', color: attr.color, fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '2px' }}>
          {attr.label.toUpperCase()}
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e5e5e5', lineHeight: 1 }}>{value}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <button type="button"
          disabled={!canIncrease}
          onClick={() => onChange(value + 1)}
          style={{ background: '#1a1a1a', border: 'none', color: canIncrease ? '#666' : '#222', cursor: canIncrease ? 'pointer' : 'not-allowed', padding: '3px 6px', borderRadius: '2px', display: 'flex', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#e5e5e5'}
          onMouseLeave={e => e.currentTarget.style.color = '#666'}
        >
          <ChevronUp size={12} />
        </button>
        <button type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          style={{ background: '#1a1a1a', border: 'none', color: '#666', cursor: 'pointer', padding: '3px 6px', borderRadius: '2px', display: 'flex', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#e5e5e5'}
          onMouseLeave={e => e.currentTarget.style.color = '#666'}
        >
          <ChevronDown size={12} />
        </button>
      </div>
    </div>
  )
}

export function CharacterForm({ initial, onSave, onCancel, profileOnly = false }) {
  const [form, setForm] = useState(initial ? {
    ...initial,
    attributes: { ...defaultAttributes(), ...(initial.attributes || {}) },
    unspentAttributePoints: initial.unspentAttributePoints ?? STARTING_ATTRIBUTE_POINTS,
  } : EMPTY_FORM)

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }))
  const setAttr = (key, val) => {
    const patch = applyInitialAttributeChange(form, key, val)
    if (patch) setForm(p => ({ ...p, ...patch }))
  }

  const pool = form.unspentAttributePoints ?? 0

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (profileOnly) {
      onSave({
        name: form.name,
        image: form.image,
        description: form.description,
        narrativeStatus: form.narrativeStatus,
      })
      return
    }
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
        <Field label="Nome" required>
          <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nome do personagem" autoFocus />
        </Field>
        <ImageUpload
          value={form.image}
          onChange={v => set('image', v)}
          label="Foto do personagem"
        />
        <Field label="Descrição / Histórico">
          <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Quem é este personagem..." rows={3} />
        </Field>
        <Field label="Status Narrativo">
          <Input value={form.narrativeStatus} onChange={e => set('narrativeStatus', e.target.value)} placeholder="Ex: Buscando redenção, Foragido, Aliado..." />
        </Field>
      </div>

      {!profileOnly && (
        <>
          <hr className="divide-line" />
          <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            PONTOS DE STATUS · <span style={{ color: '#16a34a' }}>{pool}</span> disponíveis · máx {INITIAL_ATTRIBUTE_MAX}/atributo
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
            {ATTRIBUTES.map(attr => {
              const v = form.attributes[attr.key] || 0
              return (
                <AttributeInput
                  key={attr.key}
                  attr={attr}
                  value={v}
                  canIncrease={pool > 0 && v < INITIAL_ATTRIBUTE_MAX}
                  onChange={val => setAttr(attr.key, val)}
                />
              )
            })}
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary">Salvar</button>
      </div>
    </form>
  )
}

function InventoryPanel({ character, onAddItem, onRemoveItem, onClose }) {
  const [newItem, setNewItem] = useState('')
  const handleAdd = () => {
    if (!newItem.trim()) return
    onAddItem(newItem.trim())
    setNewItem('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <User size={14} style={{ color: '#dc2626' }} />
        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e5e5e5' }}>{character.name}</span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Input
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          placeholder="Nome do item..."
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
        />
        <button className="btn-primary" onClick={handleAdd} style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
          Adicionar
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '300px', overflowY: 'auto' }}>
        {character.inventory.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#333', fontSize: '0.775rem', padding: '1.5rem' }}>
            Inventário vazio
          </div>
        ) : (
          character.inventory.map(item => (
            <div key={item.id}
              style={{
                background: '#0d0d0d',
                border: '1px solid #1a1a1a',
                borderRadius: '3px',
                padding: '0.5rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={12} style={{ color: '#444' }} />
                <span style={{ fontSize: '0.8rem', color: '#ccc' }}>{item.name}</span>
              </div>
              <button onClick={() => onRemoveItem(item.id)}
                style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '2px', display: 'flex', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                onMouseLeave={e => e.currentTarget.style.color = '#333'}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-ghost" onClick={onClose}>Fechar</button>
      </div>
    </div>
  )
}

function CharCard({ character, onEdit, onDelete, onInventory }) {
  const attrs = character.attributes || {}

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
      <div style={{ display: 'flex', gap: '0', padding: '1rem 1.25rem', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.875rem', flex: 1, minWidth: 0 }}>
          <EntityThumb src={character.image} alt={character.name} size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e5e5e5', marginBottom: '2px' }}>{character.name}</div>
            <div style={{ fontSize: '0.65rem', color: '#a855f7', fontFamily: 'monospace', marginBottom: '4px' }}>
              NVL {character.level || 1} · {character.ecoPoints ?? 0} Ecos
            </div>
            {character.narrativeStatus && (
              <div style={{ fontSize: '0.7rem', color: '#06b6d4', marginBottom: '4px' }}>{character.narrativeStatus}</div>
            )}
            {character.description && (
              <div style={{ fontSize: '0.7rem', color: '#444', lineHeight: 1.5,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {character.description}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0, marginLeft: '0.75rem' }}>
          <button onClick={onInventory} title="Inventário"
            style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '4px', transition: 'color 0.15s', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = '#06b6d4'}
            onMouseLeave={e => e.currentTarget.style.color = '#333'}
          >
            <Package size={13} />
          </button>
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

      {/* Attributes bar */}
      <div style={{ padding: '0 1.25rem 0.875rem', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem' }}>
        {ATTRIBUTES.map(attr => (
          <div key={attr.key} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: attrs[attr.key] > 0 ? attr.color : '#222', lineHeight: 1 }}>
              {attrs[attr.key] || 0}
            </div>
            <div style={{ fontSize: '0.55rem', color: '#333', fontFamily: 'monospace', letterSpacing: '0.05em', marginTop: '2px' }}>
              {attr.label.slice(0, 3).toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {character.inventory.length > 0 && (
        <div style={{ padding: '0.5rem 1.25rem', borderTop: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={11} style={{ color: '#333' }} />
          <span style={{ fontSize: '0.65rem', color: '#333', fontFamily: 'monospace' }}>
            {character.inventory.length} {character.inventory.length === 1 ? 'ITEM' : 'ITENS'}
          </span>
        </div>
      )}
    </div>
  )
}

export function Characters({ embedded = false, onNavigate }) {
  const { activeCampaignId } = useCampaignStore()
  const { characters, addCharacter, updateCharacter, deleteCharacter, addInventoryItem, removeInventoryItem } = useCharacterStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [inventoryChar, setInventoryChar] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filtered = filterByActiveCampaign(characters, activeCampaignId)

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (c) => { setEditing(c); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const handleSave = (data) => {
    if (editing) {
      updateCharacter(editing.id, data)
    } else {
      addCharacter(withActiveCampaign(data, activeCampaignId))
    }
    closeModal()
  }

  const currentInventoryChar = inventoryChar ? characters.find(c => c.id === inventoryChar.id) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {!embedded && (
        <PageHeader
        icon={Sword}
        title="Personagens"
        subtitle={`${filtered.length} PERSONAGENS NA CAMPANHA`}
        action={
          <button className="btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
            <Plus size={13} /> Novo Personagem
          </button>
        }
      />
      )}

      <ActiveCampaignBanner onNavigate={onNavigate} />
      {embedded && (
        <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={openCreate} disabled={!activeCampaignId} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
            <Plus size={13} /> Novo Personagem
          </button>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Sword}
            title="Nenhum personagem criado"
            description="Adicione os personagens jogáveis da sua campanha."
            action={<button className="btn-primary" onClick={openCreate}>Criar Personagem</button>}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '0.75rem' }}>
            {filtered.map(c => (
              <CharCard
                key={c.id}
                character={c}
                onEdit={() => openEdit(c)}
                onDelete={() => setDeleteConfirm(c)}
                onInventory={() => setInventoryChar(c)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Personagem' : 'Novo Personagem'} maxWidth="640px">
        <CharacterForm initial={editing} onSave={handleSave} onCancel={closeModal} />
      </Modal>

      <Modal open={!!inventoryChar} onClose={() => setInventoryChar(null)} title="Inventário" maxWidth="480px">
        {currentInventoryChar && (
          <InventoryPanel
            character={currentInventoryChar}
            onAddItem={(item) => addInventoryItem(currentInventoryChar.id, item)}
            onRemoveItem={(itemId) => removeInventoryItem(currentInventoryChar.id, itemId)}
            onClose={() => setInventoryChar(null)}
          />
        )}
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar Exclusão" maxWidth="380px">
        <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1.25rem' }}>
          Excluir o personagem <strong style={{ color: '#e5e5e5' }}>{deleteConfirm?.name}</strong>?
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
          <button className="btn-primary" onClick={() => { deleteCharacter(deleteConfirm.id); setDeleteConfirm(null) }}>Excluir</button>
        </div>
      </Modal>
    </div>
  )
}
