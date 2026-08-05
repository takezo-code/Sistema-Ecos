import React, { useState } from 'react'
import {
  ArrowLeft, GitBranch, Plus, Pencil, Trash2, ChevronUp, ChevronDown,
  BookOpen, Split, Circle, Loader, CheckCheck, MinusCircle, RotateCcw,
} from 'lucide-react'
import { useNarrativeStore } from '../store/useNarrativeStore'
import { PageHeader } from '../components/ui/PageHeader'
import { Modal } from '../components/ui/Modal'
import { Field, Input, Textarea, Select } from '../components/ui/Field'
import { StatusTag } from '../components/ui/StatusTag'
import { EmptyState } from '../components/ui/EmptyState'
import { SceneImageGalleryEditor, SceneImageGalleryView, normalizeSceneImages } from '../components/ui/SceneImageGallery'
import { genId } from '../utils/id'

const STATUS_ICONS = {
  'não iniciado': Circle,
  'em andamento': Loader,
  'concluído': CheckCheck,
  'ignorado': MinusCircle,
}

const STATUS_COLORS = {
  'não iniciado': '#333',
  'em andamento': '#06b6d4',
  'concluído': '#16a34a',
  'ignorado': '#555',
}

const EMPTY_HISTORIA = {
  type: 'historia',
  title: '',
  description: '',
  objective: '',
  status: 'não iniciado',
  images: [],
}

const EMPTY_ESCOLHA = {
  type: 'escolha',
  title: '',
  prompt: '',
  choices: [
    { id: genId(), label: '', outcome: '' },
    { id: genId(), label: '', outcome: '' },
  ],
  status: 'não iniciado',
}

function HistoriaForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_HISTORIA,
    ...(initial || {}),
    type: 'historia',
    images: normalizeSceneImages(initial?.images),
  }))
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }))

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        if (!form.title.trim()) return
        onSave({ ...form, images: normalizeSceneImages(form.images) })
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      <Field label="Título da cena" required>
        <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: Chegada ao vilarejo" autoFocus />
      </Field>
      <Field label="Como a cena acontece">
        <Textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Descreva como as cenas vão se desenrolar, atmosfera, NPCs presentes, ganchos..."
          rows={5}
        />
      </Field>
      <Field label="Objetivo (opcional)">
        <Textarea value={form.objective} onChange={e => set('objective', e.target.value)} placeholder="O que os jogadores devem perceber ou alcançar..." rows={2} />
      </Field>
      <SceneImageGalleryEditor
        images={form.images}
        onChange={imgs => set('images', imgs)}
        label="Imagens de ambiente"
      />
      <Field label="Status">
        <Select value={form.status} onChange={e => set('status', e.target.value)}>
          <option value="não iniciado">Não Iniciado</option>
          <option value="em andamento">Em Andamento</option>
          <option value="concluído">Concluído</option>
          <option value="ignorado">Ignorado</option>
        </Select>
      </Field>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary">Salvar</button>
      </div>
    </form>
  )
}

function EscolhaForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_ESCOLHA,
    ...(initial || {}),
    type: 'escolha',
    choices: initial?.choices?.length
      ? initial.choices.map(c => ({ ...c }))
      : EMPTY_ESCOLHA.choices.map(c => ({ ...c, id: genId() })),
  }))

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }))
  const setChoice = (idx, field, val) => setForm(p => ({
    ...p,
    choices: p.choices.map((c, i) => i === idx ? { ...c, [field]: val } : c),
  }))
  const addChoice = () => setForm(p => ({
    ...p,
    choices: [...p.choices, { id: genId(), label: '', outcome: '' }],
  }))
  const removeChoice = (idx) => {
    if (form.choices.length <= 2) return
    setForm(p => ({ ...p, choices: p.choices.filter((_, i) => i !== idx) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const valid = form.choices.filter(c => c.label.trim())
    if (valid.length < 2) return
    onSave({ ...form, choices: valid })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Field label="Título" required>
        <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: A encruzilhada na floresta" autoFocus />
      </Field>
      <Field label="Situação / pergunta para os jogadores">
        <Textarea
          value={form.prompt}
          onChange={e => set('prompt', e.target.value)}
          placeholder="Ex: A trilha se divide. O grupo ouve uivos ao norte. O que vocês fazem?"
          rows={3}
        />
      </Field>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em' }}>OPÇÕES E CONSEQUÊNCIAS</span>
          <button type="button" className="btn-ghost" onClick={addChoice} style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>
            + Opção
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {form.choices.map((choice, idx) => (
            <div key={choice.id} style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '4px', padding: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.6rem', color: '#d97706', fontFamily: 'monospace' }}>OPÇÃO {idx + 1}</span>
                {form.choices.length > 2 && (
                  <button type="button" onClick={() => removeChoice(idx)}
                    style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', fontSize: '0.65rem' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                    onMouseLeave={e => e.currentTarget.style.color = '#333'}
                  >
                    Remover
                  </button>
                )}
              </div>
              <Field label="Escolha dos jogadores">
                <Input
                  value={choice.label}
                  onChange={e => setChoice(idx, 'label', e.target.value)}
                  placeholder="Ex: Entrar na floresta"
                />
              </Field>
              <Field label="O que acontece se escolherem">
                <Textarea
                  value={choice.outcome}
                  onChange={e => setChoice(idx, 'outcome', e.target.value)}
                  placeholder="Descreva o desenrolar desta escolha..."
                  rows={2}
                />
              </Field>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary">Salvar</button>
      </div>
    </form>
  )
}

function FlowConnector({ index, total, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '32px', minWidth: '32px' }}>
      <div style={{ width: '2px', flex: '0 0 16px', background: index === 0 ? 'transparent' : '#1a1a1a' }} />
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%',
        border: `2px solid ${color}`,
        background: '#0a0a0a',
        flexShrink: 0,
      }} />
      <div style={{ width: '2px', flex: 1, background: index === total - 1 ? 'transparent' : '#1a1a1a' }} />
    </div>
  )
}

function HistoriaFlowCard({ event, index, total, onEdit, onDelete, onMoveUp, onMoveDown, onStatusChange }) {
  const Icon = STATUS_ICONS[event.status] || Circle
  const color = STATUS_COLORS[event.status] || '#333'
  const isIgnored = event.status === 'ignorado'

  return (
    <div style={{ display: 'flex', gap: 0, opacity: isIgnored ? 0.5 : 1 }}>
      <FlowConnector index={index} total={total} color={color} />
      <div style={{
        flex: 1,
        background: '#111',
        border: `1px solid ${event.status === 'em andamento' ? 'rgba(6,182,212,0.2)' : '#1a1a1a'}`,
        borderRadius: '4px',
        margin: '4px 0',
        padding: '0.875rem 1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <BookOpen size={13} style={{ color: '#06b6d4' }} />
            <span style={{ fontSize: '0.6rem', color: '#06b6d4', fontFamily: 'monospace', letterSpacing: '0.08em' }}>HISTÓRIA</span>
            <Icon size={13} style={{ color }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e5e5e5' }}>{event.title}</span>
            <StatusTag status={event.status} />
          </div>
          <FlowActions index={index} total={total} onEdit={onEdit} onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown} />
        </div>
        {event.description && (
          <p style={{ fontSize: '0.775rem', color: '#666', lineHeight: 1.6, marginBottom: '0.5rem', whiteSpace: 'pre-wrap' }}>
            {event.description}
          </p>
        )}
        {event.objective && (
          <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '3px', padding: '0.5rem 0.625rem', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.6rem', color: '#06b6d4', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '3px' }}>OBJETIVO</div>
            <div style={{ fontSize: '0.7rem', color: '#555', lineHeight: 1.5 }}>{event.objective}</div>
          </div>
        )}
        <SceneImageGalleryView images={event.images} title="Ambiente" />
        <StatusButtons status={event.status} onStatusChange={onStatusChange} />
      </div>
    </div>
  )
}

function EscolhaFlowCard({ event, index, total, onEdit, onDelete, onMoveUp, onMoveDown, onSelectChoice, onClearChoice }) {
  const selected = event.choices.find(c => c.id === event.selectedChoiceId)
  const color = selected ? '#16a34a' : STATUS_COLORS[event.status] || '#d97706'

  return (
    <div style={{ display: 'flex', gap: 0 }}>
      <FlowConnector index={index} total={total} color={color} />
      <div style={{
        flex: 1,
        background: '#111',
        border: `1px solid ${selected ? 'rgba(22,163,74,0.25)' : 'rgba(217,119,6,0.15)'}`,
        borderRadius: '4px',
        margin: '4px 0',
        padding: '0.875rem 1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Split size={13} style={{ color: '#d97706' }} />
            <span style={{ fontSize: '0.6rem', color: '#d97706', fontFamily: 'monospace', letterSpacing: '0.08em' }}>ESCOLHA</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e5e5e5' }}>{event.title}</span>
            {selected && <StatusTag status="concluído" />}
          </div>
          <FlowActions index={index} total={total} onEdit={onEdit} onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown} />
        </div>

        {(event.prompt || event.description) && (
          <p style={{ fontSize: '0.775rem', color: '#888', lineHeight: 1.6, marginBottom: '0.75rem', whiteSpace: 'pre-wrap' }}>
            {event.prompt || event.description}
          </p>
        )}

        <div style={{ fontSize: '0.6rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          {selected ? 'ESCOLHA DOS JOGADORES' : 'CLIQUE NA OPÇÃO ESCOLHIDA PELOS JOGADORES'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {event.choices.map(choice => {
            const isSelected = event.selectedChoiceId === choice.id
            return (
              <button
                key={choice.id}
                type="button"
                onClick={() => onSelectChoice(isSelected ? null : choice.id)}
                style={{
                  textAlign: 'left',
                  background: isSelected ? 'rgba(22,163,74,0.08)' : '#0d0d0d',
                  border: `1px solid ${isSelected ? 'rgba(22,163,74,0.35)' : '#1a1a1a'}`,
                  borderRadius: '4px',
                  padding: '0.625rem 0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#2a2a2a'
                    e.currentTarget.style.background = '#111'
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#1a1a1a'
                    e.currentTarget.style.background = '#0d0d0d'
                  }
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isSelected ? '#16a34a' : '#ccc', marginBottom: choice.outcome ? '4px' : 0 }}>
                  {isSelected && '✓ '}{choice.label}
                </div>
                {isSelected && choice.outcome && (
                  <div style={{ fontSize: '0.7rem', color: '#888', lineHeight: 1.5, marginTop: '4px' }}>
                    {choice.outcome}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {selected && (
          <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.6rem', color: '#16a34a', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '4px' }}>NARRATIVA DESTA ESCOLHA</div>
            <p style={{ fontSize: '0.8rem', color: '#aaa', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selected.outcome || 'Sem consequência definida.'}</p>
            <button
              type="button"
              onClick={onClearChoice}
              style={{
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'transparent',
                border: 'none',
                color: '#444',
                cursor: 'pointer',
                fontSize: '0.65rem',
                fontFamily: 'monospace',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#888'}
              onMouseLeave={e => e.currentTarget.style.color = '#444'}
            >
              <RotateCcw size={11} /> Redefinir escolha
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function FlowActions({ index, total, onEdit, onDelete, onMoveUp, onMoveDown }) {
  return (
    <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
      <button onClick={onMoveUp} disabled={index === 0} title="Mover acima"
        style={{ background: 'transparent', border: 'none', color: index === 0 ? '#1a1a1a' : '#333', cursor: index === 0 ? 'default' : 'pointer', padding: '3px', display: 'flex' }}>
        <ChevronUp size={13} />
      </button>
      <button onClick={onMoveDown} disabled={index === total - 1} title="Mover abaixo"
        style={{ background: 'transparent', border: 'none', color: index === total - 1 ? '#1a1a1a' : '#333', cursor: index === total - 1 ? 'default' : 'pointer', padding: '3px', display: 'flex' }}>
        <ChevronDown size={13} />
      </button>
      <button onClick={onEdit} title="Editar" style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '3px', display: 'flex' }}>
        <Pencil size={13} />
      </button>
      <button onClick={onDelete} title="Excluir" style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '3px', display: 'flex' }}>
        <Trash2 size={13} />
      </button>
    </div>
  )
}

function StatusButtons({ status, onStatusChange }) {
  return (
    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.625rem', flexWrap: 'wrap' }}>
      {['não iniciado', 'em andamento', 'concluído', 'ignorado'].map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onStatusChange(s)}
          style={{
            background: status === s ? 'rgba(255,255,255,0.05)' : 'transparent',
            border: `1px solid ${status === s ? '#2a2a2a' : '#1a1a1a'}`,
            borderRadius: '2px',
            color: status === s ? STATUS_COLORS[s] : '#2a2a2a',
            fontSize: '0.6rem',
            cursor: 'pointer',
            padding: '2px 6px',
            fontFamily: 'monospace',
          }}
        >
          {s.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

function AddFlowModal({ open, onClose, onAdd }) {
  const [pickType, setPickType] = useState(null)

  const close = () => { setPickType(null); onClose() }

  if (!open) return null

  if (!pickType) {
    return (
      <Modal open={open} onClose={close} title="Adicionar Fluxo" maxWidth="480px">
        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>
          Escolha o tipo de fluxo que deseja adicionar à campanha.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setPickType('historia')}
            style={{
              background: '#0d0d0d',
              border: '1px solid #1a1a1a',
              borderRadius: '4px',
              padding: '1.25rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(6,182,212,0.4)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a1a'}
          >
            <BookOpen size={20} style={{ color: '#06b6d4', marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e5e5', marginBottom: '4px' }}>Fluxo de História</div>
            <p style={{ fontSize: '0.7rem', color: '#555', lineHeight: 1.5 }}>
              Descreva como as cenas vão acontecer para você narrar a sessão.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setPickType('escolha')}
            style={{
              background: '#0d0d0d',
              border: '1px solid #1a1a1a',
              borderRadius: '4px',
              padding: '1.25rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(217,119,6,0.4)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a1a'}
          >
            <Split size={20} style={{ color: '#d97706', marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e5e5', marginBottom: '4px' }}>Fluxo de Escolhas</div>
            <p style={{ fontSize: '0.7rem', color: '#555', lineHeight: 1.5 }}>
              Defina opções e consequências. Durante a sessão, clique na escolha dos jogadores.
            </p>
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={pickType === 'historia' ? 'Novo Fluxo de História' : 'Novo Fluxo de Escolhas'}
      maxWidth="640px"
    >
      {pickType === 'historia' ? (
        <HistoriaForm onSave={data => { onAdd(data); close() }} onCancel={close} />
      ) : (
        <EscolhaForm onSave={data => { onAdd(data); close() }} onCancel={close} />
      )}
    </Modal>
  )
}

export function CampaignFlows({ campaign, onBack }) {
  const { events, addEvent, updateEvent, deleteEvent, reorderEvents, selectChoice, clearChoice } = useNarrativeStore()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModal, setEditModal] = useState(null)

  const flows = events
    .filter(e => e.campaignId === campaign.id)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const handleAdd = (data) => addEvent({ ...data, campaignId: campaign.id })

  const handleSaveEdit = (data) => {
    updateEvent(editModal.id, data)
    setEditModal(null)
  }

  const moveUp = (idx) => {
    if (idx === 0) return
    const ids = flows.map(e => e.id)
    ;[ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]]
    reorderEvents(campaign.id, ids)
  }

  const moveDown = (idx) => {
    if (idx === flows.length - 1) return
    const ids = flows.map(e => e.id)
    ;[ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]]
    reorderEvents(campaign.id, ids)
  }

  const handleSelectChoice = (eventId, choiceId) => {
    if (choiceId === null) clearChoice(eventId)
    else selectChoice(eventId, choiceId)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        icon={GitBranch}
        title={campaign.name}
        action={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className="btn-ghost"
              onClick={onBack}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
            >
              <ArrowLeft size={13} /> Voltar
            </button>
            <button
              className="btn-primary"
              onClick={() => setAddModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}
            >
              <Plus size={13} /> Adicionar Fluxo
            </button>
          </div>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
        {flows.length === 0 ? (
          <EmptyState
            icon={GitBranch}
            title="Nenhum fluxo definido"
            description="Monte o roteiro da campanha com cenas de história e pontos de escolha para narrar suas sessões."
            action={
              <button className="btn-primary" onClick={() => setAddModalOpen(true)}>
                Adicionar Fluxo
              </button>
            }
          />
        ) : (
          <div style={{ maxWidth: '800px' }}>
            {flows.map((flow, idx) =>
              flow.type === 'escolha' ? (
                <EscolhaFlowCard
                  key={flow.id}
                  event={flow}
                  index={idx}
                  total={flows.length}
                  onEdit={() => setEditModal(flow)}
                  onDelete={() => deleteEvent(flow.id)}
                  onMoveUp={() => moveUp(idx)}
                  onMoveDown={() => moveDown(idx)}
                  onSelectChoice={(choiceId) => handleSelectChoice(flow.id, choiceId)}
                  onClearChoice={() => clearChoice(flow.id)}
                />
              ) : (
                <HistoriaFlowCard
                  key={flow.id}
                  event={flow}
                  index={idx}
                  total={flows.length}
                  onEdit={() => setEditModal(flow)}
                  onDelete={() => deleteEvent(flow.id)}
                  onMoveUp={() => moveUp(idx)}
                  onMoveDown={() => moveDown(idx)}
                  onStatusChange={(s) => updateEvent(flow.id, { status: s })}
                />
              )
            )}
          </div>
        )}
      </div>

      <AddFlowModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onAdd={handleAdd} />

      <Modal
        open={!!editModal}
        onClose={() => setEditModal(null)}
        title={editModal?.type === 'escolha' ? 'Editar Fluxo de Escolhas' : 'Editar Fluxo de História'}
        maxWidth="640px"
      >
        {editModal?.type === 'escolha' ? (
          <EscolhaForm initial={editModal} onSave={handleSaveEdit} onCancel={() => setEditModal(null)} />
        ) : editModal ? (
          <HistoriaForm initial={editModal} onSave={handleSaveEdit} onCancel={() => setEditModal(null)} />
        ) : null}
      </Modal>
    </div>
  )
}
