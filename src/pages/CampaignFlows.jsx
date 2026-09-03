import React, { useState } from 'react'
import {
  ArrowLeft, GitBranch, Pencil, Trash2,
  BookOpen, Split, Circle, Loader, CheckCheck, RotateCcw,
} from 'lucide-react'
import { useNarrativeStore } from '../store/useNarrativeStore'
import { Modal } from '../components/ui/Modal'
import { Field, Input, Textarea } from '../components/ui/Field'
import { StatusTag } from '../components/ui/StatusTag'
import { EmptyState } from '../components/ui/EmptyState'
import { SceneImageGalleryEditor, SceneImageGalleryView, normalizeSceneImages } from '../components/ui/SceneImageGallery'
import { genId } from '../utils/id'
import { Button } from '../components/ui/Button'
import SpotlightCard from '../components/react-bits/SpotlightCard'
import GlassSurface from '../components/react-bits/GlassSurface'
import { FloatingTooltip } from '../components/ui/FloatingTooltip'
import { StatusPicker } from '../components/ui/StatusPicker'

const STATUS_ICONS = {
  'não iniciado': Circle,
  'em andamento': Loader,
  'concluído': CheckCheck,
}

const STATUS_COLORS = {
  'não iniciado': '#333',
  'em andamento': '#06b6d4',
  'concluído': '#16a34a',
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
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
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
        <StatusPicker value={form.status} onChange={v => set('status', v)} />
      </Field>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <Button type="submit">Salvar</Button>
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
          <button type="button" className="btn-ghost" onClick={addChoice} style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>
            + Opção
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {form.choices.map((choice, idx) => (
            <div
              key={choice.id}
              style={{
                background: '#0d0d0d',
                border: '1px solid #1a1a1a',
                borderRadius: '8px',
                padding: '0.9rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.6rem', color: '#d97706', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                  OPÇÃO {idx + 1}
                </span>
                {form.choices.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeChoice(idx)}
                    style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', fontSize: '0.65rem' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#dc2626' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#333' }}
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

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <Button type="submit">Salvar</Button>
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

function HistoriaFlowCard({ event, index, total, onEdit, onDelete, onStatusChange }) {
  const Icon = STATUS_ICONS[event.status] || Circle
  const color = STATUS_COLORS[event.status] || '#555'

  return (
    <div style={{ display: 'flex', gap: 0 }}>
      <FlowConnector index={index} total={total} color={color} />
      <SpotlightCard
        onClick={onEdit}
        spotlightColor={event.status === 'em andamento' ? 'rgba(6,182,212,0.18)' : 'rgba(37,99,235,0.14)'}
        style={{
          flex: 1,
          margin: '6px 0',
          padding: '1rem 1.15rem',
          cursor: 'pointer',
          borderColor: event.status === 'em andamento' ? 'rgba(6,182,212,0.28)' : undefined,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.55rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <BookOpen size={13} style={{ color: '#06b6d4' }} />
            <span style={{ fontSize: '0.6rem', color: '#06b6d4', fontFamily: 'monospace', letterSpacing: '0.08em' }}>HISTÓRIA</span>
            <Icon size={13} style={{ color }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0f0f0' }}>{event.title}</span>
            <StatusTag status={event.status} />
          </div>
          <div onClick={e => e.stopPropagation()}>
            <FlowActions onEdit={onEdit} onDelete={onDelete} />
          </div>
        </div>
        {event.description && (
          <p style={{ fontSize: '0.8rem', color: '#888', lineHeight: 1.6, marginBottom: '0.55rem', whiteSpace: 'pre-wrap' }}>
            {event.description}
          </p>
        )}
        {event.objective && (
          <GlassSurface borderRadius={10} padding="0.55rem 0.7rem" style={{ marginBottom: '0.55rem' }}>
            <div style={{ fontSize: '0.6rem', color: '#06b6d4', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '3px' }}>OBJETIVO</div>
            <div style={{ fontSize: '0.75rem', color: '#aaa', lineHeight: 1.5 }}>{event.objective}</div>
          </GlassSurface>
        )}
        <div onClick={e => e.stopPropagation()}>
          <SceneImageGalleryView images={event.images} title="Ambiente" />
        </div>
        <div onClick={e => e.stopPropagation()}>
          <StatusButtons status={event.status} onStatusChange={onStatusChange} />
        </div>
      </SpotlightCard>
    </div>
  )
}

function EscolhaFlowCard({ event, index, total, onEdit, onDelete, onSelectChoice, onClearChoice }) {
  const selected = event.choices.find(c => c.id === event.selectedChoiceId)
  const color = selected ? '#16a34a' : STATUS_COLORS[event.status] || '#d97706'

  return (
    <div style={{ display: 'flex', gap: 0 }}>
      <FlowConnector index={index} total={total} color={color} />
      <SpotlightCard
        onClick={onEdit}
        spotlightColor={selected ? 'rgba(22,163,74,0.16)' : 'rgba(217,119,6,0.14)'}
        style={{
          flex: 1,
          margin: '6px 0',
          padding: '1rem 1.15rem',
          cursor: 'pointer',
          borderColor: selected ? 'rgba(22,163,74,0.3)' : 'rgba(217,119,6,0.22)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.55rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Split size={13} style={{ color: '#d97706' }} />
            <span style={{ fontSize: '0.6rem', color: '#d97706', fontFamily: 'monospace', letterSpacing: '0.08em' }}>ESCOLHA</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0f0f0' }}>{event.title}</span>
            {selected && <StatusTag status="concluído" />}
          </div>
          <div onClick={e => e.stopPropagation()}>
            <FlowActions onEdit={onEdit} onDelete={onDelete} />
          </div>
        </div>

        {(event.prompt || event.description) && (
          <p style={{ fontSize: '0.8rem', color: '#888', lineHeight: 1.6, marginBottom: '0.75rem', whiteSpace: 'pre-wrap' }}>
            {event.prompt || event.description}
          </p>
        )}

        <div style={{ fontSize: '0.6rem', color: '#666', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          {selected ? 'ESCOLHA DOS JOGADORES' : 'CLIQUE NA OPÇÃO ESCOLHIDA PELOS JOGADORES'}
        </div>

        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          onClick={e => e.stopPropagation()}
        >
          {event.choices.map(choice => {
            const isSelected = event.selectedChoiceId === choice.id
            return (
              <SpotlightCard
                key={choice.id}
                onClick={() => onSelectChoice(isSelected ? null : choice.id)}
                spotlightColor={isSelected ? 'rgba(22,163,74,0.2)' : 'rgba(255,255,255,0.06)'}
                style={{
                  padding: '0.7rem 0.85rem',
                  cursor: 'pointer',
                  borderColor: isSelected ? 'rgba(22,163,74,0.4)' : undefined,
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isSelected ? '#4ade80' : '#ddd', marginBottom: choice.outcome && isSelected ? '4px' : 0 }}>
                  {isSelected && '✓ '}{choice.label}
                </div>
                {isSelected && choice.outcome && (
                  <div style={{ fontSize: '0.7rem', color: '#888', lineHeight: 1.5, marginTop: '4px' }}>
                    {choice.outcome}
                  </div>
                )}
              </SpotlightCard>
            )
          })}
        </div>

        {selected && (
          <div onClick={e => e.stopPropagation()}>
            <GlassSurface borderRadius={10} padding="0.75rem" style={{ marginTop: '0.75rem' }}>
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
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '0.65rem',
                  fontFamily: 'monospace',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#aaa' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#666' }}
              >
                <RotateCcw size={11} /> Redefinir escolha
              </button>
            </GlassSurface>
          </div>
        )}
      </SpotlightCard>
    </div>
  )
}

function FlowActions({ onEdit, onDelete }) {
  const baseBtn = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.15s, border-color 0.15s, background 0.15s',
  }

  return (
    <FloatingTooltip.Provider>
      <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
        <FloatingTooltip.Trigger content="Editar">
          <button
            type="button"
            onClick={onEdit}
            style={{ ...baseBtn, color: '#888' }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#e5e5e5'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#888'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            }}
          >
            <Pencil size={14} strokeWidth={2.1} />
          </button>
        </FloatingTooltip.Trigger>
        <FloatingTooltip.Trigger content="Excluir">
          <button
            type="button"
            onClick={onDelete}
            style={{ ...baseBtn, color: '#777' }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#f87171'
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'
              e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#777'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            }}
          >
            <Trash2 size={14} strokeWidth={2.1} />
          </button>
        </FloatingTooltip.Trigger>
      </div>
    </FloatingTooltip.Provider>
  )
}

function StatusButtons({ status, onStatusChange }) {
  const variantFor = (s) => {
    if (s === 'em andamento') return 'secondary'
    if (s === 'concluído') return 'primary'
    return 'secondary'
  }

  return (
    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
      {['não iniciado', 'em andamento', 'concluído'].map(s => {
        const selected = status === s
        return (
          <Button
            key={s}
            type="button"
            size="xs"
            variant={variantFor(s)}
            onClick={() => onStatusChange(s)}
            style={{
              fontSize: '0.58rem',
              fontFamily: 'monospace',
              letterSpacing: '0.06em',
              padding: '0.35rem 0.55rem',
              boxShadow: 'none',
              opacity: selected ? 1 : 0.55,
              color: selected ? STATUS_COLORS[s] === '#333' ? '#aaa' : STATUS_COLORS[s] : '#777',
            }}
          >
            {s.toUpperCase()}
          </Button>
        )
      })}
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
          <SpotlightCard
            onClick={() => setPickType('historia')}
            spotlightColor="rgba(6,182,212,0.18)"
            style={{ padding: '1.25rem', cursor: 'pointer' }}
          >
            <BookOpen size={20} style={{ color: '#06b6d4', marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e5e5', marginBottom: '4px' }}>Fluxo de História</div>
            <p style={{ fontSize: '0.7rem', color: '#777', lineHeight: 1.5, margin: 0 }}>
              Descreva como as cenas vão acontecer para você narrar a sessão.
            </p>
          </SpotlightCard>
          <SpotlightCard
            onClick={() => setPickType('escolha')}
            spotlightColor="rgba(217,119,6,0.16)"
            style={{ padding: '1.25rem', cursor: 'pointer' }}
          >
            <Split size={20} style={{ color: '#d97706', marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e5e5', marginBottom: '4px' }}>Fluxo de Escolhas</div>
            <p style={{ fontSize: '0.7rem', color: '#777', lineHeight: 1.5, margin: 0 }}>
              Defina opções e consequências. Durante a sessão, clique na escolha dos jogadores.
            </p>
          </SpotlightCard>
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
  const [draggingId, setDraggingId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  const flows = events
    .filter(e => e.campaignId === campaign.id)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const handleAdd = (data) => addEvent({ ...data, campaignId: campaign.id })

  const handleSaveEdit = (data) => {
    updateEvent(editModal.id, data)
    setEditModal(null)
  }

  const dropFlow = (targetId) => {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null)
      setDragOverId(null)
      return
    }

    const ids = flows.map(e => e.id)
    const sourceIndex = ids.indexOf(draggingId)
    const targetIndex = ids.indexOf(targetId)
    if (sourceIndex < 0 || targetIndex < 0) return

    ids.splice(sourceIndex, 1)
    const adjustedTarget = ids.indexOf(targetId)
    const insertAt = sourceIndex < targetIndex ? adjustedTarget + 1 : adjustedTarget
    ids.splice(insertAt, 0, draggingId)
    reorderEvents(campaign.id, ids)
    setDraggingId(null)
    setDragOverId(null)
  }

  const handleSelectChoice = (eventId, choiceId) => {
    if (choiceId === null) clearChoice(eventId)
    else selectChoice(eventId, choiceId)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '0.85rem 1.5rem',
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: '0.58rem',
            fontFamily: 'monospace',
            letterSpacing: '0.12em',
            color: '#555',
            marginBottom: '0.2rem',
          }}>
            CAMPANHA
          </div>
          <h2 style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: 700,
            color: '#f0f0f0',
            letterSpacing: '-0.02em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {campaign.name}
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {onBack ? (
            <button
              type="button"
              className="btn-ghost"
              onClick={onBack}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
            >
              <ArrowLeft size={13} />
              Voltar
            </button>
          ) : null}
          <Button
            onClick={() => setAddModalOpen(true)}
            size="xs"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            Adicionar Fluxo
          </Button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 1.5rem 1.25rem' }}>
        {flows.length === 0 ? (
          <EmptyState
            icon={GitBranch}
            title="Nenhum fluxo definido"
            description="Monte o roteiro da campanha com cenas de história e pontos de escolha para narrar suas sessões."
            action={
              <Button onClick={() => setAddModalOpen(true)}>
                Adicionar Fluxo
              </Button>
            }
          />
        ) : (
          <div style={{ maxWidth: '800px' }}>
            {flows.map((flow, idx) => (
              <div
                key={flow.id}
                draggable
                onDragStart={e => {
                  setDraggingId(flow.id)
                  e.dataTransfer.effectAllowed = 'move'
                  e.dataTransfer.setData('text/plain', flow.id)
                }}
                onDragOver={e => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'move'
                  setDragOverId(flow.id)
                }}
                onDragLeave={e => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setDragOverId(null)
                }}
                onDrop={e => {
                  e.preventDefault()
                  dropFlow(flow.id)
                }}
                onDragEnd={() => {
                  setDraggingId(null)
                  setDragOverId(null)
                }}
                style={{
                  cursor: draggingId === flow.id ? 'grabbing' : 'grab',
                  opacity: draggingId === flow.id ? 0.45 : 1,
                  borderRadius: 14,
                  boxShadow: dragOverId === flow.id && draggingId !== flow.id
                    ? '0 0 0 2px rgba(6,182,212,0.6), 0 0 22px rgba(6,182,212,0.18)'
                    : 'none',
                  transform: dragOverId === flow.id && draggingId !== flow.id ? 'translateY(2px)' : 'none',
                  transition: 'opacity 0.15s, box-shadow 0.15s, transform 0.15s',
                }}
              >
                {flow.type === 'escolha' ? (
                  <EscolhaFlowCard
                    event={flow}
                    index={idx}
                    total={flows.length}
                    onEdit={() => setEditModal(flow)}
                    onDelete={() => deleteEvent(flow.id)}
                    onSelectChoice={(choiceId) => handleSelectChoice(flow.id, choiceId)}
                    onClearChoice={() => clearChoice(flow.id)}
                  />
                ) : (
                  <HistoriaFlowCard
                    event={flow}
                    index={idx}
                    total={flows.length}
                    onEdit={() => setEditModal(flow)}
                    onDelete={() => deleteEvent(flow.id)}
                    onStatusChange={(s) => updateEvent(flow.id, { status: s })}
                  />
                )}
              </div>
            ))}
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
