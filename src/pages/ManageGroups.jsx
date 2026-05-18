import React, { useState } from 'react'
import {
  UsersRound, Plus, Pencil, Trash2, Star, ChevronRight, UserPlus, X, Sparkles,
} from 'lucide-react'
import { SESSION_ULTRA_XP_TIERS } from '../constants/progression'
import { EntityThumb } from '../components/ui/EntityThumb'
import { useGroupStore } from '../store/useGroupStore'
import { useCharacterStore } from '../store/useCharacterStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { Modal } from '../components/ui/Modal'
import { Field, Input, Textarea, Select } from '../components/ui/Field'
import { EmptyState } from '../components/ui/EmptyState'
import { EntityManagePanel } from '../components/management/EntityManagePanel'
import { ATTRIBUTES } from '../constants/attributes'
import { getPhysicalStateOption } from '../constants/states'
import { filterByActiveCampaign } from '../utils/campaignScope'
import { ActiveCampaignBanner } from '../components/ui/ActiveCampaignBanner'

function GroupForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { name: '', description: '' })
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }))

  return (
    <form onSubmit={e => { e.preventDefault(); if (!form.name.trim()) return; onSave(form) }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

function MemberRow({ character, onManage, onRemove }) {
  const attrs = character.attributes || {}
  const cond = getPhysicalStateOption(character.physicalState ?? character.condition)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        background: '#111',
        border: '1px solid #1a1a1a',
        borderRadius: '4px',
        transition: 'border-color 0.15s',
      }}
    >
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
              fontSize: '0.6rem',
              padding: '2px 6px',
              borderRadius: '2px',
              background: `${cond.color}15`,
              color: cond.color,
              fontFamily: 'monospace',
            }}>
              {cond.label.toUpperCase()}
            </span>
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
        <ChevronRight size={14} style={{ color: '#333', flexShrink: 0 }} />
      </button>
      <button type="button" onClick={onRemove} title="Remover do grupo"
        style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '4px', display: 'flex' }}
        onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
        onMouseLeave={e => e.currentTarget.style.color = '#333'}
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function ManageGroups() {
  const { activeCampaignId } = useCampaignStore()
  const { groups, addGroup, updateGroup, deleteGroup, addMember, removeMember } = useGroupStore()
  const {
    characters,
    updateCharacter,
    addXp,
    addXpToMany,
    changeAttribute,
    setMasterAttribute,
    setMasterProgression,
    syncMasterProgression,
    clampMasterAuxiliary,
    scaleMasterAttributesToBudget,
    lastMasterError,
    clearMasterError,
    spendPendingAttribute,
    unlockSkill,
    upgradeSkill,
    addInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
    addEquippedItem,
    removeEquippedItem,
    lastLevelUps,
    clearLevelUps,
  } = useCharacterStore()

  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [groupModal, setGroupModal] = useState(null)
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [managingChar, setManagingChar] = useState(null)
  const [groupXp, setGroupXp] = useState('')
  const [ultraXpOpen, setUltraXpOpen] = useState(false)
  const [lastUltraXp, setLastUltraXp] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filteredGroups = filterByActiveCampaign(groups, activeCampaignId)

  const selectedGroup = selectedGroupId ? groups.find(g => g.id === selectedGroupId) : null
  const members = selectedGroup
    ? selectedGroup.memberIds.map(id => characters.find(c => c.id === id)).filter(Boolean)
    : []

  const campChars = filterByActiveCampaign(characters, activeCampaignId)
  const availableToAdd = campChars.filter(c => {
    if (!selectedGroup) return false
    if (selectedGroup.memberIds.includes(c.id)) return false
    return true
  })

  const currentChar = managingChar ? characters.find(c => c.id === managingChar.id) : null

  const handleGroupXp = () => {
    const amount = parseInt(groupXp, 10)
    if (!amount || !selectedGroup) return
    addXpToMany(selectedGroup.memberIds, amount)
    setGroupXp('')
  }

  const handleUltraXp = (tier) => {
    if (!selectedGroup || members.length === 0) return
    addXpToMany(selectedGroup.memberIds, tier.xp)
    setLastUltraXp({ label: tier.label, xp: tier.xp, at: Date.now() })
    setUltraXpOpen(false)
  }

  const openCreateGroup = () => setGroupModal({ mode: 'create' })
  const openEditGroup = (g) => setGroupModal({ mode: 'edit', group: g })

  const handleSaveGroup = (data) => {
    const payload = { ...data, campaignId: activeCampaignId || null }
    if (groupModal.mode === 'edit') {
      updateGroup(groupModal.group.id, payload)
    } else {
      const g = addGroup(payload)
      setSelectedGroupId(g.id)
    }
    setGroupModal(null)
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Lista de grupos */}
      <div style={{
        width: selectedGroup ? '260px' : '100%',
        minWidth: selectedGroup ? '260px' : undefined,
        borderRight: selectedGroup ? '1px solid #1a1a1a' : 'none',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <ActiveCampaignBanner />
          <button className="btn-primary" onClick={openCreateGroup} disabled={!activeCampaignId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
            <Plus size={13} /> Novo Grupo
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
          {filteredGroups.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#333', fontSize: '0.75rem' }}>
              Nenhum grupo criado
            </div>
          ) : (
            filteredGroups.map(g => (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedGroupId(g.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.75rem',
                  marginBottom: '0.35rem',
                  background: selectedGroupId === g.id ? 'rgba(220,38,38,0.08)' : '#111',
                  border: `1px solid ${selectedGroupId === g.id ? 'rgba(220,38,38,0.25)' : '#1a1a1a'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e5e5', marginBottom: '2px' }}>{g.name}</div>
                <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace' }}>
                  {g.memberIds.length} {g.memberIds.length === 1 ? 'membro' : 'membros'}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Painel do grupo */}
      {selectedGroup ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <div style={{
            padding: '0.75rem 1.25rem',
            borderBottom: '1px solid #1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e5e5e5' }}>{selectedGroup.name}</div>
              {selectedGroup.description && (
                <div style={{ fontSize: '0.7rem', color: '#555', marginTop: '2px' }}>{selectedGroup.description}</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn-ghost" onClick={() => openEditGroup(selectedGroup)} style={{ fontSize: '0.7rem', padding: '0.35rem 0.5rem' }}>
                <Pencil size={12} />
              </button>
              <button className="btn-ghost" onClick={() => setDeleteConfirm(selectedGroup)} style={{ fontSize: '0.7rem', padding: '0.35rem 0.5rem' }}>
                <Trash2 size={12} />
              </button>
              <button className="btn-secondary" onClick={() => setAddMemberOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem' }}>
                <UserPlus size={12} /> Membro
              </button>
            </div>
          </div>

          {/* XP em grupo */}
          <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #1a1a1a' }}>
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.75rem',
                    borderColor: ultraXpOpen ? 'rgba(168,85,247,0.4)' : undefined,
                    color: ultraXpOpen ? '#a855f7' : undefined,
                  }}
                >
                  <Sparkles size={13} />
                  Ultra XP
                </button>
                {ultraXpOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    zIndex: 20,
                    minWidth: '260px',
                    background: '#111',
                    border: '1px solid #2a2a2a',
                    borderRadius: '4px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
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
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.625rem 0.75rem',
                          background: 'transparent',
                          border: 'none',
                          borderBottom: '1px solid #1a1a1a',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
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
              <div style={{
                marginTop: '0.5rem',
                fontSize: '0.65rem',
                color: '#a855f7',
                fontFamily: 'monospace',
              }}>
                Último Ultra XP: {lastUltraXp.label} · +{lastUltraXp.xp} para {members.length} membro(s)
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '720px' }}>
                {members.map(c => (
                  <MemberRow
                    key={c.id}
                    character={c}
                    onManage={() => setManagingChar(c)}
                    onRemove={() => removeMember(selectedGroup.id, c.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState
            icon={UsersRound}
            title="Selecione um grupo"
            description="Escolha um grupo na lista ou crie um novo para gerenciar os jogadores."
            action={filteredGroups.length === 0 && (
              <button className="btn-primary" onClick={openCreateGroup}>Criar Grupo</button>
            )}
          />
        </div>
      )}

      <Modal open={!!groupModal} onClose={() => setGroupModal(null)} title={groupModal?.mode === 'edit' ? 'Editar Grupo' : 'Novo Grupo'} maxWidth="480px">
        <GroupForm
          initial={groupModal?.group}
          onSave={handleSaveGroup}
          onCancel={() => setGroupModal(null)}
        />
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
                onClick={() => { addMember(selectedGroup.id, c.id); setAddMemberOpen(false) }}
                style={{
                  textAlign: 'left',
                  padding: '0.625rem 0.75rem',
                  background: '#0d0d0d',
                  border: '1px solid #1a1a1a',
                  borderRadius: '3px',
                  color: '#ccc',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a1a'}
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

      <Modal open={!!currentChar} onClose={() => { setManagingChar(null); clearLevelUps(); clearMasterError() }} title={`Ficha — ${currentChar?.name}`} maxWidth="720px">
        {currentChar && (
          <EntityManagePanel
            entity={currentChar}
            showProgression
            adminMode
            levelUps={lastLevelUps}
            onUpdate={data => updateCharacter(currentChar.id, data)}
            onAddXp={amount => addXp(currentChar.id, amount)}
            onChangeAttribute={(key, val, opts) => {
              if (opts?.admin) return setMasterAttribute(currentChar.id, key, val)
              return changeAttribute(currentChar.id, key, val, opts)
            }}
            onMasterProgression={patch => setMasterProgression(currentChar.id, patch)}
            onSyncProgression={() => syncMasterProgression(currentChar.id)}
            onClampAuxiliary={() => clampMasterAuxiliary(currentChar.id)}
            onScaleAttributes={() => scaleMasterAttributesToBudget(currentChar.id)}
            masterError={lastMasterError}
            onSpendPendingAttribute={key => spendPendingAttribute(currentChar.id, key)}
            onUnlockSkill={() => unlockSkill(currentChar.id)}
            onUpgradeSkill={skillId => upgradeSkill(currentChar.id, skillId)}
            onAddItem={item => addInventoryItem(currentChar.id, item)}
            onUpdateItem={(itemId, data) => updateInventoryItem(currentChar.id, itemId, data)}
            onRemoveItem={itemId => removeInventoryItem(currentChar.id, itemId)}
            onAddEquipped={item => addEquippedItem(currentChar.id, item)}
            onRemoveEquipped={itemId => removeEquippedItem(currentChar.id, itemId)}
          />
        )}
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Excluir grupo" maxWidth="380px">
        <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1.25rem' }}>
          Excluir o grupo <strong style={{ color: '#e5e5e5' }}>{deleteConfirm?.name}</strong>?
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
          <button className="btn-primary" onClick={() => {
            deleteGroup(deleteConfirm.id)
            if (selectedGroupId === deleteConfirm.id) setSelectedGroupId(null)
            setDeleteConfirm(null)
          }}>Excluir</button>
        </div>
      </Modal>
    </div>
  )
}

