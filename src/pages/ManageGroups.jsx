import React, { useState, useMemo, useEffect } from 'react'
import {
  UsersRound, Pencil, Trash2, UserPlus, X, Sparkles, RotateCcw, Plus,
} from 'lucide-react'
import { SESSION_ULTRA_XP_TIERS } from '../constants/progression'
import { EntityThumb } from '../components/ui/EntityThumb'
import { useGroupStore } from '../store/useGroupStore'
import { useCharacterStore } from '../store/useCharacterStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { Modal } from '../components/ui/Modal'
import { Field, Input, Textarea } from '../components/ui/Field'
import { EmptyState } from '../components/ui/EmptyState'
import { CharacterFichaSheet } from '../components/character/CharacterFichaSheet'
import { useCharacterManagementPanel } from '../hooks/useCharacterManagementPanel'
import { useCharacterPanelStore } from '../store/useCharacterPanelStore'
import { ATTRIBUTES } from '../constants/attributes'
import { getPhysicalStateOption, getMentalStateOption } from '../constants/states'
import { formatOverloadDisplay } from '../constants/ecoOverload'
import { filterByActiveCampaign } from '../utils/campaignScope'
import { useSaveStore } from '../store/useSaveStore'
import { getEntityEffectiveAttributes } from '../services/stateModifiers'
import { Button } from '../components/ui/Button'
import SpotlightCard from '../components/react-bits/SpotlightCard'
import GlowingBadge from '../components/ui/GlowingBadge'
import { FloatingTooltip } from '../components/ui/FloatingTooltip'

function GroupForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { name: '', description: '' })
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }))

  return (
    <form
      onSubmit={e => { e.preventDefault(); if (!form.name.trim()) return; onSave(form) }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      <Field label="Nome do grupo" required>
        <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Party Alpha" autoFocus />
      </Field>
      <Field label="Descrição">
        <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Notas sobre o grupo..." rows={2} />
      </Field>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  )
}

function MemberRow({ character, selected, onManage, onRemove }) {
  const { effective: attrs } = getEntityEffectiveAttributes(character)
  const physical = getPhysicalStateOption(character.physicalState ?? character.condition)
  const mental = getMentalStateOption(character.mentalState)
  const marks = character.damageMarks ?? 0
  const overload = character.ecoOverload ?? 0
  const classColor = '#a855f7'

  return (
    <SpotlightCard
      onClick={onManage}
      spotlightColor={selected ? 'rgba(168, 85, 247, 0.28)' : 'rgba(168, 85, 247, 0.14)'}
      style={{
        padding: '0.85rem 0.95rem',
        cursor: 'pointer',
        borderLeft: `3px solid ${selected ? classColor : 'rgba(168,85,247,0.35)'}`,
        background: selected ? 'rgba(168,85,247,0.06)' : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <EntityThumb src={character.image} alt={character.name} size={48} borderRadius="10px" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            marginBottom: '0.4rem',
          }}>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#f5f5f5',
              letterSpacing: '-0.02em',
            }}>
              {character.name}
            </span>
            <FloatingTooltip.Provider>
              <FloatingTooltip.Trigger content="Remover do grupo">
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onRemove() }}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    color: '#666',
                    cursor: 'pointer',
                    padding: '5px',
                    display: 'flex',
                    flexShrink: 0,
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
                  <X size={13} />
                </button>
              </FloatingTooltip.Trigger>
            </FloatingTooltip.Provider>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.45rem' }}>
            <GlowingBadge
              variant={physical.value === 'bem' ? 'success' : 'warning'}
              pulse={false}
              dot
            >
              {physical.label}
            </GlowingBadge>
            {mental.value !== 'estavel' && (
              <GlowingBadge variant="warning" pulse={false} dot>
                {mental.label}
              </GlowingBadge>
            )}
            <GlowingBadge variant="default" pulse={false} dot>
              NVL {character.level || 1}
            </GlowingBadge>
            {marks > 0 && (
              <GlowingBadge variant="error" pulse={false} dot>
                {marks}M
              </GlowingBadge>
            )}
            {overload > 0 && (
              <GlowingBadge variant="cyan" pulse={false} dot>
                {formatOverloadDisplay(overload, character)}
              </GlowingBadge>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
            {ATTRIBUTES.map(attr => {
              const eff = attrs[attr.key] || 0
              const raw = character.attributes?.[attr.key] || 0
              const reduced = eff < raw
              return (
                <span
                  key={attr.key}
                  style={{
                    fontSize: '0.62rem',
                    fontFamily: 'monospace',
                    letterSpacing: '0.04em',
                    color: eff > 0 ? (reduced ? '#ea580c' : attr.color) : '#555',
                  }}
                >
                  {attr.label.slice(0, 3).toUpperCase()} {eff}
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </SpotlightCard>
  )
}

export function ManageGroups() {
  const { activeCampaignId } = useCampaignStore()
  const { groups, addGroup, updateGroup, deleteGroup, addMember, removeMember } = useGroupStore()
  const { characters, addXpToMany, recoverGroupMembers } = useCharacterStore()
  const showToast = useSaveStore(s => s.showToast)
  const selectCharacter = useCharacterPanelStore(s => s.selectCharacter)

  const [groupModal, setGroupModal] = useState(null)
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState(null)
  const [ultraXpOpen, setUltraXpOpen] = useState(false)
  const [lastUltraXp, setLastUltraXp] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filteredGroups = filterByActiveCampaign(groups, activeCampaignId)
  const activeGroup = filteredGroups[0] ?? null

  const members = useMemo(
    () => activeGroup
      ? activeGroup.memberIds.map(id => characters.find(c => c.id === id)).filter(Boolean)
      : [],
    [activeGroup, characters]
  )

  const campChars = filterByActiveCampaign(characters, activeCampaignId)
  const availableToAdd = campChars.filter(c =>
    activeGroup ? !activeGroup.memberIds.includes(c.id) : false
  )

  const { entity: selectedChar, clearPanelSession } = useCharacterManagementPanel(selectedMemberId)

  useEffect(() => {
    if (!selectedMemberId) return
    if (!members.some(m => m.id === selectedMemberId)) {
      setSelectedMemberId(null)
      clearPanelSession()
    }
  }, [members, selectedMemberId, clearPanelSession])

  const handleUltraXp = (tier) => {
    if (!activeGroup || members.length === 0) return
    addXpToMany(activeGroup.memberIds, tier.xp)
    setLastUltraXp({ label: tier.label, xp: tier.xp, at: Date.now() })
    setUltraXpOpen(false)
  }

  const handleSaveGroup = (data) => {
    const payload = { ...data, campaignId: activeCampaignId || null }
    if (groupModal?.mode === 'edit') {
      updateGroup(groupModal.group.id, payload)
    } else {
      addGroup(payload)
    }
    setGroupModal(null)
  }

  if (!activeGroup) {
    return (
      <>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <EmptyState
            icon={UsersRound}
            title="Nenhum grupo criado"
            description="Crie um grupo para organizar os personagens e gerenciar a sessão."
            action={
              <Button
                onClick={() => setGroupModal({ mode: 'create' })}
                disabled={!activeCampaignId}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={14} /> Criar Grupo
              </Button>
            }
          />
        </div>

        <Modal open={!!groupModal} onClose={() => setGroupModal(null)} title="Novo Grupo" maxWidth="480px">
          <GroupForm initial={null} onSave={handleSaveGroup} onCancel={() => setGroupModal(null)} />
        </Modal>
      </>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '1.1rem 1.5rem 0.55rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
          <div style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#f5f5f5',
            letterSpacing: '-0.02em',
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {activeGroup.name}
          </div>
          <FloatingTooltip.Provider>
            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexShrink: 0 }}>
              <FloatingTooltip.Trigger content="Editar grupo">
                <Button
                  type="button"
                  variant="secondary"
                  size="xs"
                  onClick={() => setGroupModal({ mode: 'edit', group: activeGroup })}
                  style={{ display: 'flex', padding: '6px' }}
                >
                  <Pencil size={13} />
                </Button>
              </FloatingTooltip.Trigger>
              <FloatingTooltip.Trigger content="Excluir grupo">
                <Button
                  type="button"
                  variant="secondary"
                  size="xs"
                  onClick={() => setDeleteConfirm(activeGroup)}
                  style={{ display: 'flex', padding: '6px' }}
                >
                  <Trash2 size={13} />
                </Button>
              </FloatingTooltip.Trigger>
            </div>
          </FloatingTooltip.Provider>
        </div>
        {activeGroup.description && (
          <div style={{ fontSize: '0.75rem', color: '#777', marginTop: 4, lineHeight: 1.4 }}>
            {activeGroup.description}
          </div>
        )}
      </div>

      <div style={{
        padding: '0 1.5rem 1rem',
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        flexWrap: 'wrap',
        flexShrink: 0,
      }}>
        <Button
          onClick={() => setAddMemberOpen(true)}
          disabled={availableToAdd.length === 0}
          size="xs"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          title={availableToAdd.length === 0 ? 'Nenhum personagem em espera nesta campanha' : 'Adicionar personagem ao grupo'}
        >
          <UserPlus size={13} /> Adicionar membro
        </Button>
        <div style={{ position: 'relative' }}>
          <Button
            type="button"
            variant="secondary"
            size="xs"
            disabled={members.length === 0}
            onClick={() => setUltraXpOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              borderColor: ultraXpOpen ? 'rgba(168,85,247,0.4)' : undefined,
              color: ultraXpOpen ? '#a855f7' : undefined,
            }}
          >
            <Sparkles size={13} /> Ultra XP
          </Button>
          {ultraXpOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 20,
              minWidth: '260px',
              background: 'rgba(12,12,16,0.96)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
              overflow: 'hidden',
              backdropFilter: 'blur(12px)',
            }}>
              <div style={{ padding: '0.65rem 0.85rem' }}>
                <div style={{ fontSize: '0.6rem', color: '#a855f7', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                  BÔNUS DE FIM DE SESSÃO
                </div>
                <div style={{ fontSize: '0.65rem', color: '#666', marginTop: 3 }}>
                  Aplica a todos os membros do grupo
                </div>
              </div>
              {SESSION_ULTRA_XP_TIERS.map(tier => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => handleUltraXp(tier)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '0.65rem 0.85rem',
                    background: 'transparent', border: 'none',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: tier.color }}>{tier.label}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e5e5e5', fontFamily: 'monospace' }}>+{tier.xp}</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#666', marginTop: 2 }}>{tier.hint}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        {lastUltraXp && (
          <span style={{ fontSize: '0.65rem', color: '#a855f7', fontFamily: 'monospace' }}>
            Último: {lastUltraXp.label} · +{lastUltraXp.xp}
          </span>
        )}

        <FloatingTooltip.Provider>
          <FloatingTooltip.Trigger content="Zera sobrecarga, marcas e estados">
            <Button
              type="button"
              variant="secondary"
              size="xs"
              disabled={members.length === 0}
              onClick={() => {
                const ids = members.map(m => m.id)
                const { recovered, missing } = recoverGroupMembers(ids)
                if (recovered > 0) {
                  showToast(
                    `Descanso aplicado a ${recovered} personagem${recovered > 1 ? 's' : ''} — marcas e sobrecarga zeradas.`,
                    'success',
                  )
                } else if (missing > 0) {
                  showToast('Alguns membros do grupo não foram encontrados na campanha.', 'error')
                } else {
                  showToast('Adicione membros ao grupo para descansar.', 'info')
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RotateCcw size={12} /> Descansar
            </Button>
          </FloatingTooltip.Trigger>
        </FloatingTooltip.Provider>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <div style={{
          width: 'min(360px, 42%)',
          flexShrink: 0,
          overflowY: 'auto',
          padding: '0 1.5rem 1.25rem',
        }}>
          {members.length === 0 ? (
            <EmptyState
              icon={UsersRound}
              title="Grupo sem membros"
              description="Adicione personagens jogáveis a este grupo."
              action={
                <Button onClick={() => setAddMemberOpen(true)}>
                  Adicionar membro
                </Button>
              }
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {members.map(c => (
                <MemberRow
                  key={c.id}
                  character={c}
                  selected={selectedMemberId === c.id}
                  onManage={() => {
                    setSelectedMemberId(c.id)
                    selectCharacter(c.id)
                  }}
                  onRemove={() => {
                    removeMember(activeGroup.id, c.id)
                    if (selectedMemberId === c.id) {
                      setSelectedMemberId(null)
                      clearPanelSession()
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.5rem 1.25rem', minWidth: 0 }}>
          {selectedMemberId && selectedChar ? (
            <CharacterFichaSheet characterId={selectedMemberId} adminMode={false} />
          ) : (
            <EmptyState
              icon={UsersRound}
              title="Selecione um personagem"
              description="Clique em um membro do grupo para ver a ficha. Alterações feitas em Personagens aparecem aqui na hora."
            />
          )}
        </div>
      </div>

      <Modal open={!!groupModal} onClose={() => setGroupModal(null)}
        title={groupModal?.mode === 'edit' ? 'Editar Grupo' : 'Novo Grupo'} maxWidth="480px">
        <GroupForm initial={groupModal?.group} onSave={handleSaveGroup} onCancel={() => setGroupModal(null)} />
      </Modal>

      <Modal open={addMemberOpen} onClose={() => setAddMemberOpen(false)} title="Adicionar ao grupo" maxWidth="400px">
        <p style={{ fontSize: '0.75rem', color: '#666', margin: '0 0 0.75rem', lineHeight: 1.5 }}>
          Personagens em espera (criados e ainda não designados para o grupo).
        </p>
        {availableToAdd.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: '#666' }}>Nenhum personagem em espera nesta campanha.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '320px', overflowY: 'auto' }}>
            {availableToAdd.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => { addMember(activeGroup.id, c.id); setAddMemberOpen(false) }}
                style={{
                  textAlign: 'left', padding: '0.7rem 0.85rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  color: '#ccc',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <EntityThumb src={c.image} alt={c.name} size={32} borderRadius="8px" />
                  {c.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Enviar para a lixeira" maxWidth="380px">
        <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1.25rem' }}>
          Enviar o grupo <strong style={{ color: '#e5e5e5' }}>{deleteConfirm?.name}</strong> para a lixeira?
          Você poderá restaurá-lo depois.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
          <Button type="button" variant="danger" onClick={() => {
            deleteGroup(deleteConfirm.id)
            setDeleteConfirm(null)
          }}>Excluir</Button>
        </div>
      </Modal>
    </div>
  )
}
