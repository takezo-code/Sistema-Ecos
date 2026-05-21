import React, { useState, useMemo, useEffect } from 'react'
import {
  UsersRound, Pencil, Trash2, Star, UserPlus, X, Sparkles, Swords, RotateCcw, Plus,
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
import { useCombatStore } from '../store/useCombatStore'

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
        <button type="submit" className="btn-primary">Salvar</button>
      </div>
    </form>
  )
}

function MemberRow({ character, selected, onManage, onRemove }) {
  const attrs = character.attributes || {}
  const physical = getPhysicalStateOption(character.physicalState ?? character.condition)
  const mental = getMentalStateOption(character.mentalState)
  const marks = character.damageMarks ?? 0
  const overload = character.ecoOverload ?? 0

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      background: selected ? '#151515' : '#111',
      border: `1px solid ${selected ? 'rgba(168,85,247,0.35)' : '#1a1a1a'}`,
      borderRadius: '4px',
      transition: 'border-color 0.15s',
    }}>
      <button
        type="button"
        onClick={onManage}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          padding: 0,
          minWidth: 0,
        }}
      >
        <EntityThumb src={character.image} alt={character.name} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e5e5' }}>{character.name}</span>
            <span style={{
              fontSize: '0.6rem', padding: '2px 6px', borderRadius: '2px',
              background: `${physical.color}15`, color: physical.color, fontFamily: 'monospace',
            }}>
              {physical.label.toUpperCase()}
            </span>
            {mental.value !== 'estavel' && (
              <span style={{
                fontSize: '0.6rem', padding: '2px 6px', borderRadius: '2px',
                background: `${mental.color}15`, color: mental.color, fontFamily: 'monospace',
              }}>
                {mental.label.toUpperCase()}
              </span>
            )}
            {marks > 0 && (
              <span style={{ fontSize: '0.55rem', color: physical.color, fontFamily: 'monospace' }}>{marks}M</span>
            )}
            {overload > 0 && (
              <span style={{ fontSize: '0.55rem', color: '#a855f7', fontFamily: 'monospace' }}>{formatOverloadDisplay(overload)}</span>
            )}
            <span style={{ fontSize: '0.6rem', color: '#a855f7', fontFamily: 'monospace' }}>NVL {character.level || 1}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {ATTRIBUTES.map(attr => (
              <span key={attr.key} style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: attrs[attr.key] > 0 ? attr.color : '#333' }}>
                {attr.label.slice(0, 3).toUpperCase()} {attrs[attr.key] || 0}
              </span>
            ))}
          </div>
        </div>
      </button>
      <button type="button" onClick={onRemove} title="Remover do grupo"
        style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '4px', display: 'flex' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#dc2626' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#333' }}
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function ManageGroups() {
  const { activeCampaignId } = useCampaignStore()
  const { combatGroupId, setCombatGroup } = useCombatStore()
  const { groups, addGroup, updateGroup, deleteGroup, addMember, removeMember } = useGroupStore()
  const { characters, addXpToMany, recoverGroupMembers } = useCharacterStore()
  const selectCharacter = useCharacterPanelStore(s => s.selectCharacter)

  const [groupModal, setGroupModal] = useState(null)
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState(null)
  const [groupXp, setGroupXp] = useState('')
  const [ultraXpOpen, setUltraXpOpen] = useState(false)
  const [lastUltraXp, setLastUltraXp] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filteredGroups = filterByActiveCampaign(groups, activeCampaignId)

  // usa sempre o primeiro (e único) grupo da campanha
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

  const handleGroupXp = () => {
    const amount = parseInt(groupXp, 10)
    if (!amount || !activeGroup) return
    addXpToMany(activeGroup.memberIds, amount)
    setGroupXp('')
  }

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

  // ── Sem grupo: tela de criação ────────────────────────────────────
  if (!activeGroup) {
    return (
      <>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <EmptyState
            icon={UsersRound}
            title="Nenhum grupo criado"
            description="Crie um grupo para organizar os personagens e gerenciar a sessão."
            action={
              <button
                className="btn-primary"
                onClick={() => setGroupModal({ mode: 'create' })}
                disabled={!activeCampaignId}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={14} /> Criar Grupo
              </button>
            }
          />
        </div>

        <Modal open={!!groupModal} onClose={() => setGroupModal(null)} title="Novo Grupo" maxWidth="480px">
          <GroupForm initial={null} onSave={handleSaveGroup} onCancel={() => setGroupModal(null)} />
        </Modal>
      </>
    )
  }

  // ── Com grupo: tela de detalhe direto ────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Cabeçalho do grupo */}
      <div style={{
        padding: '0.75rem 1.25rem',
        borderBottom: '1px solid #1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e5e5e5' }}>{activeGroup.name}</div>
          {activeGroup.description && (
            <div style={{ fontSize: '0.7rem', color: '#555', marginTop: '2px' }}>{activeGroup.description}</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn-ghost"
            onClick={() => setGroupModal({ mode: 'edit', group: activeGroup })}
            style={{ fontSize: '0.7rem', padding: '0.35rem 0.5rem' }}
            title="Editar grupo"
          >
            <Pencil size={12} />
          </button>
          <button
            className="btn-ghost"
            onClick={() => setDeleteConfirm(activeGroup)}
            style={{ fontSize: '0.7rem', padding: '0.35rem 0.5rem' }}
            title="Excluir grupo"
          >
            <Trash2 size={12} />
          </button>
          <button
            className="btn-secondary"
            onClick={() => setAddMemberOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem' }}
          >
            <UserPlus size={12} /> Membro
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setCombatGroup(combatGroupId === activeGroup.id ? null : activeGroup.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.7rem',
              borderColor: combatGroupId === activeGroup.id ? 'rgba(220,38,38,0.45)' : undefined,
              color: combatGroupId === activeGroup.id ? '#dc2626' : undefined,
            }}
          >
            <Swords size={12} />
            {combatGroupId === activeGroup.id ? 'Grupo no combate' : 'Usar no combate'}
          </button>
          <button
            type="button"
            className="btn-ghost"
            disabled={members.length === 0}
            onClick={() => recoverGroupMembers(activeGroup.memberIds)}
            title="Zera sobrecarga Eco, limpa marcas e volta estados ao estável"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem' }}
          >
            <RotateCcw size={12} /> Descansar grupo
          </button>
        </div>
      </div>

      {/* XP em grupo */}
      <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Star size={13} style={{ color: '#d97706', flexShrink: 0 }} />
          <Input
            type="number"
            min="1"
            value={groupXp}
            onChange={e => setGroupXp(e.target.value)}
            placeholder="XP para todo o grupo..."
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleGroupXp())}
            style={{ flex: 1, maxWidth: '200px' }}
          />
          <button className="btn-primary" onClick={handleGroupXp} disabled={members.length === 0} style={{ fontSize: '0.75rem' }}>
            Dar XP ao grupo
          </button>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn-secondary"
              disabled={members.length === 0}
              onClick={() => setUltraXpOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem',
                borderColor: ultraXpOpen ? 'rgba(168,85,247,0.4)' : undefined,
                color: ultraXpOpen ? '#a855f7' : undefined,
              }}
            >
              <Sparkles size={13} /> Ultra XP
            </button>
            {ultraXpOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 20,
                minWidth: '260px', background: '#111', border: '1px solid #2a2a2a',
                borderRadius: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', overflow: 'hidden',
              }}>
                <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #1a1a1a' }}>
                  <div style={{ fontSize: '0.6rem', color: '#a855f7', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                    BÔNUS DE FIM DE SESSÃO
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#555', marginTop: '2px' }}>
                    Aplica a todos os membros do grupo
                  </div>
                </div>
                {SESSION_ULTRA_XP_TIERS.map(tier => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => handleUltraXp(tier)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '0.625rem 0.75rem',
                      background: 'transparent', border: 'none',
                      borderBottom: '1px solid #1a1a1a', cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1a' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: tier.color }}>{tier.label}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e5e5e5', fontFamily: 'monospace' }}>+{tier.xp}</span>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#555', marginTop: '2px' }}>{tier.hint}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {lastUltraXp && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: '#a855f7', fontFamily: 'monospace' }}>
            Último Ultra XP: {lastUltraXp.label} · +{lastUltraXp.xp} para {members.length} membro(s)
          </div>
        )}
      </div>

      {/* Membros + ficha (mesma fonte que Gerenciamento → Personagens) */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <div style={{
          width: 'min(360px, 42%)',
          flexShrink: 0,
          overflowY: 'auto',
          padding: '1rem 1.25rem',
          borderRight: '1px solid #1a1a1a',
        }}>
          {members.length === 0 ? (
            <EmptyState
              icon={UsersRound}
              title="Grupo sem membros"
              description="Adicione personagens jogáveis a este grupo."
              action={
                <button className="btn-primary" onClick={() => setAddMemberOpen(true)}>
                  Adicionar membro
                </button>
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

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', minWidth: 0 }}>
          {selectedMemberId && selectedChar ? (
            <CharacterFichaSheet characterId={selectedMemberId} adminMode={false} />
          ) : (
            <EmptyState
              icon={UsersRound}
              title="Selecione um personagem"
              description="Clique em um membro do grupo para ver a ficha. Alterações feitas em Gerenciamento → Personagens aparecem aqui na hora."
            />
          )}
        </div>
      </div>

      {/* Modais */}
      <Modal open={!!groupModal} onClose={() => setGroupModal(null)}
        title={groupModal?.mode === 'edit' ? 'Editar Grupo' : 'Novo Grupo'} maxWidth="480px">
        <GroupForm initial={groupModal?.group} onSave={handleSaveGroup} onCancel={() => setGroupModal(null)} />
      </Modal>

      <Modal open={addMemberOpen} onClose={() => setAddMemberOpen(false)} title="Adicionar membro" maxWidth="400px">
        {availableToAdd.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: '#666' }}>Nenhum personagem disponível para adicionar.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '320px', overflowY: 'auto' }}>
            {availableToAdd.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => { addMember(activeGroup.id, c.id); setAddMemberOpen(false) }}
                style={{
                  textAlign: 'left', padding: '0.625rem 0.75rem',
                  background: '#0d0d0d', border: '1px solid #1a1a1a',
                  borderRadius: '3px', color: '#ccc', cursor: 'pointer', fontSize: '0.8rem',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2a2a2a' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <EntityThumb src={c.image} alt={c.name} size={32} />
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
          <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
          <button className="btn-primary" onClick={() => {
            deleteGroup(deleteConfirm.id)
            setDeleteConfirm(null)
          }}>Excluir</button>
        </div>
      </Modal>
    </div>
  )
}
