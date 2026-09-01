import React, { useState, useMemo, useEffect } from 'react'
import {
  UsersRound, Pencil, Trash2, UserPlus, X, Sparkles, RotateCcw, Plus,
} from 'lucide-react'
import { SESSION_ULTRA_XP_TIERS } from '../constants/progression'
import { EntityThumb } from '../components/ui/EntityThumb'
import { ClassIcon } from '../components/ui/ClassIcon'
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
import { getRupturaPool } from '../constants/ecoOverload'
import { getCharacterClass } from '../constants/classes'
import { getRemainingLife } from '../mechanics/combat/damageMarksEngine'
import { filterByActiveCampaign } from '../utils/campaignScope'
import { useSaveStore } from '../store/useSaveStore'
import { useCombatStore } from '../store/useCombatStore'
import { getEntityEffectiveAttributes } from '../services/stateModifiers'
import { Button } from '../components/ui/Button'
import SpotlightCard from '../components/react-bits/SpotlightCard'
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

function StateChip({ label, color }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: '0.6rem',
      fontWeight: 600,
      letterSpacing: '0.01em',
      color,
      background: `${color}14`,
      border: `1px solid ${color}38`,
      borderRadius: 999,
      padding: '0.16rem 0.5rem',
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 5,
        height: 5,
        borderRadius: 999,
        background: color,
        boxShadow: `0 0 6px ${color}`,
      }} />
      {label}
    </span>
  )
}

function MiniBar({ label, current, max, color }) {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
      <span style={{
        fontSize: '0.5rem',
        fontFamily: 'monospace',
        letterSpacing: '0.1em',
        color: '#6b6b6b',
        width: 26,
        flexShrink: 0,
      }}>
        {label}
      </span>
      <div style={{
        flex: 1,
        height: 4,
        borderRadius: 999,
        background: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: 999,
          background: color,
          boxShadow: `0 0 8px ${color}88`,
          transition: 'width 0.25s',
        }} />
      </div>
      <span style={{
        fontSize: '0.55rem',
        fontFamily: 'monospace',
        fontWeight: 700,
        color,
        flexShrink: 0,
      }}>
        {current}/{max}
      </span>
    </div>
  )
}

function MemberRow({ character, selected, onManage, onRemove }) {
  const { effective: attrs } = getEntityEffectiveAttributes(character)
  const physical = getPhysicalStateOption(character.physicalState ?? character.condition)
  const mental = getMentalStateOption(character.mentalState)
  const charClass = getCharacterClass(character)
  const classColor = charClass?.color || '#a855f7'
  const life = getRemainingLife(character)
  const ruptura = getRupturaPool(character)

  return (
    <SpotlightCard
      onClick={onManage}
      spotlightColor={selected ? `${classColor}44` : `${classColor}22`}
      style={{
        padding: 0,
        cursor: 'pointer',
        overflow: 'hidden',
        borderColor: selected ? `${classColor}66` : undefined,
        background: selected ? `${classColor}0f` : undefined,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        padding: '0.7rem 0.8rem 0.6rem',
      }}>
        <div style={{
          padding: 1.5,
          borderRadius: 12,
          flexShrink: 0,
          background: `linear-gradient(145deg, ${classColor}88, transparent)`,
        }}>
          <EntityThumb src={character.image} alt={character.name} size={40} borderRadius="10px" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#f5f5f5',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {character.name}
          </div>
          <div style={{
            fontSize: '0.55rem',
            fontFamily: 'monospace',
            color: '#6b6b6b',
            marginTop: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}>
            <span>Nv.{character.level || 1}</span>
            {charClass && (
              <>
                <ClassIcon classIdOrEntity={character} size={16} />
                <span style={{ color: classColor }}>{charClass.label}</span>
              </>
            )}
          </div>
        </div>

        <FloatingTooltip.Provider>
          <FloatingTooltip.Trigger content="Remover do grupo">
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onRemove() }}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                color: '#5a5a5a',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                flexShrink: 0,
                transition: 'color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#f87171'
                e.currentTarget.style.borderColor = 'rgba(220,38,38,0.35)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#5a5a5a'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
              }}
            >
              <X size={12} />
            </button>
          </FloatingTooltip.Trigger>
        </FloatingTooltip.Provider>
      </div>

      <div style={{ padding: '0 0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <MiniBar label="VIDA" current={life.current} max={life.max} color={physical.color} />
        <MiniBar label="ECO" current={ruptura.spent} max={ruptura.max} color="#22d3ee" />
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.3rem',
        padding: '0.55rem 0.8rem 0',
      }}>
        <StateChip label={physical.label} color={physical.color} />
        {mental.value !== 'estavel' && (
          <StateChip label={mental.label} color={mental.color} />
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${ATTRIBUTES.length}, minmax(0, 1fr))`,
        gap: 3,
        padding: '0.6rem 0.8rem 0.7rem',
      }}>
        {ATTRIBUTES.map(attr => {
          const eff = attrs[attr.key] || 0
          const raw = character.attributes?.[attr.key] || 0
          const reduced = eff < raw
          const valueColor = eff > 0 ? (reduced ? '#ea580c' : '#ececec') : '#4a4a4a'
          return (
            <div
              key={attr.key}
              style={{
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 7,
                padding: '0.3rem 0.15rem',
                textAlign: 'center',
              }}
            >
              <div style={{
                fontSize: '0.42rem',
                fontFamily: 'monospace',
                letterSpacing: '0.06em',
                color: eff > 0 ? attr.color : '#4a4a4a',
              }}>
                {attr.label.slice(0, 3).toUpperCase()}
              </div>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: valueColor,
                lineHeight: 1.2,
              }}>
                {eff}
              </div>
            </div>
          )
        })}
      </div>
    </SpotlightCard>
  )
}

function PendingCharacterCard({ character, onAdd }) {
  const charClass = getCharacterClass(character)
  const classColor = charClass?.color || '#a855f7'

  return (
    <SpotlightCard
      onClick={onAdd}
      spotlightColor={`${classColor}33`}
      style={{
        padding: '0.7rem 0.8rem',
        cursor: 'pointer',
        borderColor: `${classColor}28`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
        <div style={{
          padding: 1.5,
          borderRadius: 11,
          flexShrink: 0,
          background: `linear-gradient(145deg, ${classColor}88, transparent)`,
        }}>
          <EntityThumb src={character.image} alt={character.name} size={38} borderRadius="9px" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#f2f2f2',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {character.name}
          </div>
          <div style={{
            marginTop: 3,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            flexWrap: 'wrap',
          }}>
            <span style={{
              fontSize: '0.55rem',
              fontFamily: 'monospace',
              color: '#777',
              letterSpacing: '0.04em',
            }}>
              Nv.{character.level || 1}
            </span>
            {charClass && (
              <span style={{
                fontSize: '0.55rem',
                fontFamily: 'monospace',
                color: classColor,
                background: `${classColor}14`,
                border: `1px solid ${classColor}33`,
                borderRadius: 999,
                padding: '0.1rem 0.4rem',
              }}>
                {charClass.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </SpotlightCard>
  )
}

export function ManageGroups() {
  const { activeCampaignId } = useCampaignStore()
  const { groups, addGroup, updateGroup, deleteGroup, addMember, removeMember } = useGroupStore()
  const { characters, addXpToMany, recoverGroupMembers, endSessionRestEco } = useCharacterStore()
  const showToast = useSaveStore(s => s.showToast)
  const selectCharacter = useCharacterPanelStore(s => s.selectCharacter)
  const combatGroupId = useCombatStore(s => s.combatGroupId)
  const setCombatGroup = useCombatStore(s => s.setCombatGroup)

  const [groupModal, setGroupModal] = useState(null)
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState(null)
  const [ultraXpOpen, setUltraXpOpen] = useState(false)
  const [lastUltraXp, setLastUltraXp] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filteredGroups = filterByActiveCampaign(groups, activeCampaignId)
  const activeGroup = filteredGroups[0] ?? null

  useEffect(() => {
    if (!activeCampaignId) return
    if (!filteredGroups.length) {
      if (combatGroupId) setCombatGroup(null)
      return
    }
    const valid = filteredGroups.some(g => g.id === combatGroupId)
    if (!valid) setCombatGroup(filteredGroups[0].id)
  }, [activeCampaignId, filteredGroups, combatGroupId, setCombatGroup])

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
      const created = addGroup(payload)
      if (!created) {
        showToast('Esta campanha já possui um grupo.', 'error')
        return
      }
      setCombatGroup(created.id)
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
      <div style={{
        padding: '1rem 1.5rem 0.85rem',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
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
            <div style={{ fontSize: '0.72rem', color: '#666', marginTop: 4, lineHeight: 1.4 }}>
              {activeGroup.description}
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          flexShrink: 0,
        }}>
          <div style={{ position: 'relative' }}>
            <Button
              type="button"
              variant="secondary"
              size="xs"
              disabled={members.length === 0}
              onClick={() => setUltraXpOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                borderColor: ultraXpOpen ? 'rgba(168,85,247,0.4)' : undefined,
                color: ultraXpOpen ? '#a855f7' : undefined,
              }}
            >
              <Sparkles size={12} /> Ultra XP
            </Button>
            {ultraXpOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 20,
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

          <FloatingTooltip.Provider>
            <FloatingTooltip.Trigger content="Limpa marcas de todos. Eco só zera na Sutura (Void).">
              <Button
                type="button"
                variant="secondary"
                size="xs"
                disabled={members.length === 0}
                onClick={() => {
                  const ids = members.map(m => m.id)
                  const { recovered, missing, ecoReset } = recoverGroupMembers(ids)
                  if (recovered > 0) {
                    showToast(
                      `Descanso: ${recovered} personagem${recovered > 1 ? 's' : ''} (marcas limpas${ecoReset > 0 ? ` · Eco da Sutura: ${ecoReset}` : ''}).`,
                      'success',
                    )
                  } else if (missing > 0) {
                    showToast('Alguns membros do grupo não foram encontrados na campanha.', 'error')
                  } else {
                    showToast('Adicione membros ao grupo para descansar.', 'info')
                  }
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <RotateCcw size={12} /> Descansar
              </Button>
            </FloatingTooltip.Trigger>
            <FloatingTooltip.Trigger content="Fim de sessão: zera Eco de todas as classes do grupo">
              <Button
                type="button"
                variant="secondary"
                size="xs"
                disabled={members.length === 0}
                onClick={() => {
                  const ids = members.map(m => m.id)
                  const { reset } = endSessionRestEco(ids)
                  if (reset > 0) {
                    showToast(
                      `Sessão encerrada: Eco resetado em ${reset} personagem${reset > 1 ? 's' : ''}.`,
                      'success',
                    )
                  } else {
                    showToast('Adicione membros ao grupo para encerrar a sessão.', 'info')
                  }
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                Encerrar sessão
              </Button>
            </FloatingTooltip.Trigger>
          </FloatingTooltip.Provider>
        </div>

        {lastUltraXp && (
          <div style={{
            width: '100%',
            fontSize: '0.62rem',
            color: '#a855f7',
            fontFamily: 'monospace',
            marginTop: '-0.35rem',
          }}>
            Último bônus: {lastUltraXp.label} · +{lastUltraXp.xp} XP
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <div style={{
          width: 'min(340px, 36%)',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '0.75rem 1.25rem 0.55rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            flexShrink: 0,
          }}>
            <span style={{
              fontSize: '0.62rem',
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
              color: '#666',
              textTransform: 'uppercase',
            }}>
              Membros · {members.length}
            </span>
            <Button
              onClick={() => setAddMemberOpen(true)}
              disabled={availableToAdd.length === 0}
              size="xs"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.55rem' }}
              title={availableToAdd.length === 0 ? 'Nenhum personagem em espera nesta campanha' : 'Adicionar personagem ao grupo'}
            >
              <UserPlus size={12} />
            </Button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.25rem 1.25rem' }}>
            {members.length === 0 ? (
              <EmptyState
                icon={UsersRound}
                title="Grupo sem membros"
                description="Adicione personagens jogáveis a este grupo."
                action={
                  <Button onClick={() => setAddMemberOpen(true)} size="xs">
                    Adicionar membro
                  </Button>
                }
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem 1.5rem 1.25rem 1rem',
          minWidth: 0,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
        }}>
          {selectedMemberId && selectedChar ? (
            <div style={{ width: '100%', maxWidth: 1100 }}>
              <CharacterFichaSheet characterId={selectedMemberId} adminMode={false} compact />
            </div>
          ) : (
            <div style={{ width: '100%', maxWidth: 480, margin: 'auto' }}>
              <EmptyState
                icon={UsersRound}
                title="Selecione um personagem"
                description="Clique em um membro do grupo para ver a ficha. Alterações feitas em Personagens aparecem aqui na hora."
              />
            </div>
          )}
        </div>
      </div>

      <Modal open={!!groupModal} onClose={() => setGroupModal(null)}
        title={groupModal?.mode === 'edit' ? 'Editar Grupo' : 'Novo Grupo'} maxWidth="480px">
        <GroupForm initial={groupModal?.group} onSave={handleSaveGroup} onCancel={() => setGroupModal(null)} />
      </Modal>

      <Modal open={addMemberOpen} onClose={() => setAddMemberOpen(false)} title="Adicionar ao grupo" maxWidth="440px">
        {availableToAdd.length === 0 ? (
          <EmptyState
            icon={UsersRound}
            title="Nenhum em espera"
            description="Crie personagens nesta campanha para designá-los ao grupo."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '360px', overflowY: 'auto' }}>
            {availableToAdd.map(c => (
              <PendingCharacterCard
                key={c.id}
                character={c}
                onAdd={() => { addMember(activeGroup.id, c.id); setAddMemberOpen(false) }}
              />
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
