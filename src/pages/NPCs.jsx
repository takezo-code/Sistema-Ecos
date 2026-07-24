import React, { useState, useEffect } from 'react'
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
import { AttributePointsEditor } from '../components/creation/AttributePointsEditor'
import {
  defaultAttributes,
  defaultSocialAttributes,
  STARTING_ATTRIBUTE_POINTS,
  STARTING_SOCIAL_POINTS,
} from '../constants/attributes'
import { MAX_LEVEL } from '../constants/progression'
import { finalizeCreationAttributes, buildMasterProgressionPatch } from '../services/progressionService'
import { normalizeGameEntity } from '../constants/attributes'
import { entityHasEcoPowers, getAttributesForEntity } from '../constants/entityProgression'
import { isNarrativeNpc } from '../utils/npcScope'

export const BOSS_DEFAULTS = {
  podeCombater: true,
  papelCombate: 'boss',
  hasEcoPowers: true,
  resistenciaFisica: 0,
  resistenciaMental: 0,
  marcasMaximas: 15,
  xpRecompensa: 500,
}

const EMPTY_FORM = {
  name: '',
  image: '',
  appearance: '',
  personality: '',
  history: '',
  motivation: '',
  secret: '',
  organization: '',
  status: 'vivo',
  level: 1,
  attributes: defaultAttributes(),
  unspentAttributePoints: STARTING_ATTRIBUTE_POINTS,
  hasEcoPowers: false,
  ecoPoints: 0,
  socialAttributes: defaultSocialAttributes(),
  unspentSocialPoints: STARTING_SOCIAL_POINTS,
  podeCombater: true,
  papelCombate: 'capanga',
  resistenciaFisica: 0,
  resistenciaMental: 0,
  marcasMaximas: 0,
  xpRecompensa: 0,
}

const PAPEL_OPTIONS = [
  { value: 'nenhum', label: 'Nenhum (narrativo)' },
  { value: 'capanga', label: 'Capanga' },
  { value: 'elite', label: 'Elite' },
  { value: 'boss', label: 'Boss' },
]

export function buildNpcPayloadForSave(data, isNewEntity) {
  const { description: _legacy, ...npcData } = data
  let payload = {
    ...npcData,
    ...(isNewEntity ? { level: 1, xp: 0, ecoPoints: 0, skills: [] } : {}),
    ...finalizeCreationAttributes(data, { isNew: isNewEntity && (data.unspentAttributePoints ?? 0) > 0 }),
  }
  if (!entityHasEcoPowers(data)) {
    payload = {
      ...payload,
      skills: [],
      ecoPoints: 0,
      attributes: { ...payload.attributes, ruptura: 0 },
    }
  }
  let draft = normalizeGameEntity(payload)
  if ((draft.level ?? 1) > 1) {
    const { patch } = buildMasterProgressionPatch(draft, { level: draft.level })
    if (patch) draft = { ...draft, ...patch }
  }
  return draft
}

/** Preenche campos narrativos; NPCs antigos com só `description` migram para História. */
function resolveNpcNarrativeFields(initial) {
  const legacy =
    initial?.description?.trim() &&
    !initial?.appearance?.trim() &&
    !initial?.personality?.trim() &&
    !initial?.history?.trim()
  return {
    appearance: initial?.appearance ?? '',
    personality: initial?.personality ?? '',
    history: initial?.history ?? (legacy ? initial.description : ''),
    motivation: initial?.motivation ?? '',
    secret: initial?.secret ?? '',
  }
}

const narrativeSectionLabel = {
  fontSize: '0.65rem',
  color: '#444',
  fontFamily: 'monospace',
  letterSpacing: '0.1em',
  marginBottom: '0.25rem',
}

export function NPCForm({ initial, onSave, onCancel, campaignId, organizations, variant = 'npc' }) {
  const isBoss = variant === 'boss'
  const isNew = !initial?.id
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...(isBoss && isNew ? BOSS_DEFAULTS : {}),
    ...(initial || {}),
    ...resolveNpcNarrativeFields(initial),
    campaignId,
    attributes: { ...defaultAttributes(), ...(initial?.attributes || {}) },
    unspentAttributePoints: initial?.unspentAttributePoints ?? (isNew ? STARTING_ATTRIBUTE_POINTS : 0),
    hasEcoPowers: isBoss ? true : (initial?.hasEcoPowers ?? false),
    level: initial?.level ?? 1,
    ecoPoints: initial?.ecoPoints ?? 0,
    socialAttributes: { ...defaultSocialAttributes(), ...(initial?.socialAttributes || {}) },
    unspentSocialPoints: initial?.unspentSocialPoints ?? (isNew ? STARTING_SOCIAL_POINTS : 0),
    podeCombater: isBoss ? (initial?.podeCombater ?? true) : true,
    papelCombate: isBoss ? (initial?.papelCombate ?? 'boss') : (initial?.papelCombate === 'boss' ? 'capanga' : (initial?.papelCombate ?? 'capanga')),
    resistenciaFisica: isBoss ? 0 : (initial?.resistenciaFisica ?? 0),
    resistenciaMental: isBoss ? 0 : (initial?.resistenciaMental ?? 0),
    marcasMaximas: initial?.marcasMaximas ?? (isBoss && isNew ? BOSS_DEFAULTS.marcasMaximas : 0),
    xpRecompensa: initial?.xpRecompensa ?? (isBoss && isNew ? BOSS_DEFAULTS.xpRecompensa : 0),
  }))
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }))

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        if (!form.name.trim()) return
        if (isBoss && !(form.marcasMaximas > 0)) return
        onSave(isBoss
          ? {
              ...form,
              hasEcoPowers: true,
              papelCombate: form.papelCombate || 'boss',
              resistenciaFisica: 0,
              resistenciaMental: 0,
              marcasMaximas: Math.max(1, form.marcasMaximas || 1),
            }
          : form)
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
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

      <div style={{ display: 'grid', gridTemplateColumns: isNew ? '1fr' : '1fr 1fr', gap: '1rem' }}>
        {!isNew && (
          <Field label="Nível">
            <Input
              type="number"
              min={1}
              max={MAX_LEVEL}
              value={form.level ?? 1}
              onChange={e => set('level', Math.min(MAX_LEVEL, Math.max(1, parseInt(e.target.value, 10) || 1)))}
            />
          </Field>
        )}
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
      </div>

      <ImageUpload value={form.image} onChange={v => set('image', v)} label="Foto do NPC" />

      <div>
        <div style={narrativeSectionLabel}>PERFIL NARRATIVO</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Field label="História">
            <Textarea
              value={form.history}
              onChange={e => set('history', e.target.value)}
              placeholder="Passado, origem, eventos relevantes..."
              rows={3}
            />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Field label="Motivações">
              <Textarea
                value={form.motivation}
                onChange={e => set('motivation', e.target.value)}
                placeholder="Objetivos, medos, o que o move..."
                rows={2}
              />
            </Field>
            <Field label="Segredos">
              <Textarea
                value={form.secret}
                onChange={e => set('secret', e.target.value)}
                placeholder="O que ele esconde do grupo..."
                rows={2}
              />
            </Field>
          </div>
        </div>
      </div>

      {!isBoss && (
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.8rem',
        color: '#888',
        cursor: 'pointer',
        padding: '0.5rem 0',
      }}>
        <input
          type="checkbox"
          checked={!!form.hasEcoPowers}
          onChange={e => {
            const checked = e.target.checked
            setForm(p => ({
              ...p,
              hasEcoPowers: checked,
              ...(checked ? {} : {
                attributes: { ...p.attributes, ruptura: 0 },
                skills: [],
                ecoPoints: 0,
              }),
            }))
          }}
          style={{ accentColor: '#a855f7' }}
        />
        Este NPC possui poderes de Eco / Ruptura
      </label>
      )}

      {isBoss && (
        <p style={{ fontSize: '0.75rem', color: '#888', margin: 0, lineHeight: 1.45 }}>
          Bosses usam o catálogo <strong style={{ color: '#a855f7' }}>Skills Boss</strong> — você escolhe as habilidades manualmente no Gerenciamento.
        </p>
      )}

      <AttributePointsEditor
        form={form}
        onFormChange={setForm}
        showRuptureHint={isBoss || form.hasEcoPowers}
      />

      {isBoss && (
        <>
          <hr className="divide-line" />
          <div style={{ fontSize: '0.65rem', color: '#dc2626', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            COMBATE · BOSS
          </div>
        </>
      )}

      {isBoss && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <Field label="Papel no Combate">
              <Select value={form.papelCombate} onChange={e => set('papelCombate', e.target.value)}>
                {PAPEL_OPTIONS.filter(o => o.value !== 'nenhum').map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="XP de Recompensa">
              <Input
                type="number" min={0}
                value={form.xpRecompensa}
                onChange={e => set('xpRecompensa', Math.max(0, parseInt(e.target.value, 10) || 0))}
              />
            </Field>
            <Field label="Vida" required>
              <Input
                type="number"
                min={1}
                value={form.marcasMaximas || ''}
                onChange={e => set('marcasMaximas', Math.max(1, parseInt(e.target.value, 10) || 1))}
                placeholder="Ex: 15"
                title="Pontos de vida do boss (marcas até derrotar)"
              />
            </Field>
          </div>
          <p style={{ fontSize: '0.6rem', color: '#555', fontFamily: 'monospace', margin: 0, lineHeight: 1.5 }}>
            VIDA — cada ponto de dano aplica uma marca. Ao atingir o total, o boss é derrotado.
          </p>
        </>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary">Salvar</button>
      </div>
    </form>
  )
}

function NarrativeDetailBlock({ label, text, color = '#444', borderColor }) {
  if (!text?.trim()) return null
  return (
    <div style={{
      background: '#0d0d0d',
      border: `1px solid ${borderColor || '#1a1a1a'}`,
      borderRadius: '3px',
      padding: '0.75rem',
    }}>
      <div style={{ fontSize: '0.6rem', color, fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '4px' }}>{label}</div>
      <p style={{ fontSize: '0.775rem', color: '#666', lineHeight: 1.6, margin: 0 }}>{text}</p>
    </div>
  )
}

function NPCDetailModal({ npc, onClose, onEdit }) {
  if (!npc) return null
  const narrative = resolveNpcNarrativeFields(npc)
  const hasNarrative = Object.values(narrative).some(v => v?.trim())
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
      {hasNarrative && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NarrativeDetailBlock label="HISTÓRIA" text={narrative.history} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <NarrativeDetailBlock label="MOTIVAÇÕES" text={narrative.motivation} color="#06b6d4" borderColor="rgba(6,182,212,0.15)" />
            <NarrativeDetailBlock label="SEGREDOS" text={narrative.secret} color="#dc2626" borderColor="rgba(220,38,38,0.15)" />
          </div>
        </div>
      )}
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
        {(npc.personality || npc.appearance || npc.motivation) && (
          <div style={{ fontSize: '0.7rem', color: '#333', marginTop: '4px', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {npc.personality || npc.appearance || npc.motivation}
          </div>
        )}
      </div>
    </div>
  )
}

export function NPCs({
  embedded = false,
  onNavigate,
  autoOpenCreate = false,
  onCreateFlowClose,
  onCreateFlowSuccess,
}) {
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

  let filtered = filterByActiveCampaign(npcs, activeCampaignId).filter(isNarrativeNpc)
  if (filterStatus !== 'todos') filtered = filtered.filter(n => n.status === filterStatus)
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(n => {
      const narrative = resolveNpcNarrativeFields(n)
      return (
        n.name.toLowerCase().includes(q) ||
        (n.organization || '').toLowerCase().includes(q) ||
        narrative.appearance.toLowerCase().includes(q) ||
        narrative.personality.toLowerCase().includes(q) ||
        narrative.history.toLowerCase().includes(q) ||
        narrative.motivation.toLowerCase().includes(q) ||
        narrative.secret.toLowerCase().includes(q)
      )
    })
  }

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (n) => { setEditing(n); setModalOpen(true); setViewing(null) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const handleModalClose = () => {
    const wasNewCreate = autoOpenCreate && !editing
    closeModal()
    if (wasNewCreate) onCreateFlowClose?.()
  }

  useEffect(() => {
    if (autoOpenCreate && activeCampaignId) openCreate()
  }, [autoOpenCreate, activeCampaignId])

  const handleSave = (data) => {
    const isNew = !editing
    const payload = {
      ...data,
      podeCombater: true,
      papelCombate: data.papelCombate === 'boss' ? 'capanga' : (data.papelCombate || 'capanga'),
    }
    if (editing) {
      updateNPC(editing.id, buildNpcPayloadForSave(payload, false))
    } else {
      addNPC(withActiveCampaign(buildNpcPayloadForSave(payload, true), activeCampaignId))
    }
    closeModal()
    if (autoOpenCreate && isNew) onCreateFlowSuccess?.()
  }

  const creationFlowOnly = embedded && autoOpenCreate

  if (creationFlowOnly) {
    return (
      <Modal open={modalOpen} onClose={handleModalClose} title="Novo NPC" maxWidth="720px">
        <NPCForm
          variant="npc"
          initial={null}
          campaignId={activeCampaignId}
          organizations={orgsByCampaign}
          onSave={handleSave}
          onCancel={handleModalClose}
        />
      </Modal>
    )
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

      <Modal open={modalOpen} onClose={handleModalClose} title={editing ? 'Editar NPC' : 'Novo NPC'} maxWidth="720px">
        <NPCForm
          variant="npc"
          initial={editing}
          campaignId={activeCampaignId}
          organizations={orgsByCampaign}
          onSave={handleSave}
          onCancel={handleModalClose}
        />
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Ficha do NPC" maxWidth="520px">
        <NPCDetailModal npc={viewing} onClose={() => setViewing(null)} onEdit={() => openEdit(viewing)} />
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar Exclusão" maxWidth="380px">
        <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1.25rem' }}>
          Enviar o NPC <strong style={{ color: '#e5e5e5' }}>{deleteConfirm?.name}</strong> para a lixeira?
          Você pode restaurá-lo em Lixeira.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
          <button className="btn-primary" onClick={() => { deleteNPC(deleteConfirm.id); setDeleteConfirm(null) }}>Excluir</button>
        </div>
      </Modal>
    </div>
  )
}
