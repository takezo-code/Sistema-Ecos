import React, { useState } from 'react'
import { Skull, Settings2, Search, Trash2 } from 'lucide-react'
import { EntityThumb } from '../components/ui/EntityThumb'
import { useNPCStore } from '../store/useNPCStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { filterByActiveCampaign } from '../utils/campaignScope'
import { isNarrativeNpc } from '../utils/npcScope'
import { ActiveCampaignBanner } from '../components/ui/ActiveCampaignBanner'
import { EntityManagePanel } from '../components/management/EntityManagePanel'
import { StatusTag } from '../components/ui/StatusTag'
import { getAttributesForEntity, entityHasEcoPowers } from '../constants/entityProgression'
import { applyInitialAttributeChange, applyAttributePointSpend } from '../services/progressionService'
import { useTrashStore } from '../store/useTrashStore'
import { getEntityEffectiveAttributes } from '../services/stateModifiers'
import { Button } from '../components/ui/Button'

function NPCManageCard({ npc, onManage, onDelete }) {
  const { effective: attrs, base } = getEntityEffectiveAttributes(npc)
  return (
    <div
      style={{
        background: '#111',
        border: '1px solid #1a1a1a',
        borderRadius: '4px',
        overflow: 'hidden',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#2a2a2a' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', padding: '1rem 1.25rem' }}>
        <button
          type="button"
          onClick={onManage}
          style={{
            flex: 1,
            display: 'flex',
            gap: '0.75rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            padding: 0,
            minWidth: 0,
          }}
        >
          <EntityThumb src={npc.image} alt={npc.name} size={44} fallbackIcon={Skull} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e5e5e5' }}>{npc.name}</span>
              <StatusTag status={npc.status} />
            </div>
            {npc.organization && (
              <div style={{ fontSize: '0.7rem', color: '#444', marginBottom: '6px' }}>{npc.organization}</div>
            )}
            <div style={{ fontSize: '0.65rem', color: '#06b6d4', fontFamily: 'monospace', marginBottom: '6px' }}>
              NVL {npc.level || 1} · {npc.xp || 0} XP
              {entityHasEcoPowers(npc) && (npc.skills?.length > 0) && (
                <span style={{ color: '#a855f7' }}> · {(npc.skills || []).length} skill(s)</span>
              )}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${getAttributesForEntity(npc).length}, 1fr)`,
              gap: '0.25rem',
            }}>
              {getAttributesForEntity(npc).map(attr => {
                const eff = attrs[attr.key] || 0
                const raw = base?.[attr.key] || 0
                const reduced = eff < raw
                return (
                  <div key={attr.key} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: eff > 0 ? (reduced ? '#ea580c' : attr.color) : '#333' }}>{eff}</div>
                    <div style={{ fontSize: '0.5rem', color: '#333', fontFamily: 'monospace' }}>{attr.label.slice(0, 3).toUpperCase()}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flexShrink: 0 }}>
          <button
            type="button"
            onClick={onManage}
            title="Gerenciar"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#333',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#999' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#333' }}
          >
            <Settings2 size={14} />
          </button>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onDelete() }}
            title="Excluir"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#333',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#dc2626' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#333' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {(npc.inventory?.length > 0) && (
        <div style={{ padding: '0 1.25rem 1rem', borderTop: '1px solid #1a1a1a', fontSize: '0.65rem', color: '#333', fontFamily: 'monospace' }}>
          MOCHILA: {npc.inventory.length} {npc.inventory.length === 1 ? 'ITEM' : 'ITENS'}
        </div>
      )}
    </div>
  )
}

export function ManageNPCs({ embedded = false }) {
  const { activeCampaignId } = useCampaignStore()
  const {
    npcs,
    updateNPC,
    deleteNPC,
    changeAttribute,
    setMasterAttribute,
    setMasterProgression,
    syncMasterProgression,
    clampMasterAuxiliary,
    scaleMasterAttributesToBudget,
    lastMasterError,
    clearMasterError,
    spendPendingAttribute,
    spendPendingSocialAttribute,
    changeSocialAttribute,
    addInlineSkill,
    updateInlineSkill,
    removeSkill,
    setGearItem,
    setGearPassives,
    setWeaponSkill,
    restEcoOverload,
    setEcoOverloadLevel,
    lastOverloadEvents,
    clearOverloadEvents,
    lastLevelUps,
    clearLevelUps,
    addInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
  } = useNPCStore()
  const refreshTrash = useTrashStore(s => s.refresh)
  const [managing, setManaging] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [search, setSearch] = useState('')
  let filtered = filterByActiveCampaign(npcs, activeCampaignId).filter(isNarrativeNpc)
  if (search) filtered = filtered.filter(n => n.name.toLowerCase().includes(search.toLowerCase()))

  const current = managing ? npcs.find(n => n.id === managing.id) : null
  const showEcoProgression = current ? entityHasEcoPowers(current) : false

  const handleOpenManage = (npc) => {
    setManaging(npc)
    queueMicrotask(() => {
      syncMasterProgression(npc.id)
      clearMasterError()
    })
  }

  const handleDelete = (npc) => {
    deleteNPC(npc.id)
    refreshTrash()
    if (managing?.id === npc.id) setManaging(null)
    setDeleteConfirm(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #1a1a1a', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '240px' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#333' }} />
          <input
            className="input-base"
            style={{ paddingLeft: '2rem', fontSize: '0.8rem' }}
            placeholder="Buscar NPC..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <ActiveCampaignBanner />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Skull}
            title="Nenhum NPC para gerenciar"
            description="Crie NPCs em Criação → NPC. Bosses ficam em Criação → Boss."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '720px' }}>
            {filtered.map(n => (
              <NPCManageCard
                key={n.id}
                npc={n}
                onManage={() => handleOpenManage(n)}
                onDelete={() => setDeleteConfirm(n)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={!!current}
        onClose={() => { setManaging(null); clearLevelUps(); clearOverloadEvents(); clearMasterError() }}
        title={`Gerenciar — ${current?.name}`}
        maxWidth="720px"
      >
        {current && (
          <EntityManagePanel
            entity={current}
            showProgression
            adminMode
            onUpdate={data => updateNPC(current.id, data)}
            onChangeAttribute={(key, val, opts) => {
              if (opts?.admin) return setMasterAttribute(current.id, key, val)
              return changeAttribute(current.id, key, val, opts)
            }}
            onChangeSocialAttribute={(key, val) => changeSocialAttribute(current.id, key, val)}
            onSpendPendingSocialAttribute={key => spendPendingSocialAttribute(current.id, key)}
            onMasterProgression={patch => setMasterProgression(current.id, patch)}
            onSyncProgression={() => syncMasterProgression(current.id)}
            onClampAuxiliary={() => clampMasterAuxiliary(current.id)}
            onScaleAttributes={() => scaleMasterAttributesToBudget(current.id)}
            masterError={lastMasterError}
            onSpendPendingAttribute={key => spendPendingAttribute(current.id, key)}
            onAddInlineSkill={showEcoProgression ? draft => addInlineSkill(current.id, draft) : undefined}
            onUpdateInlineSkill={showEcoProgression ? (skillId, draft) => updateInlineSkill(current.id, skillId, draft) : undefined}
            onRemoveSkill={showEcoProgression ? skillId => removeSkill(current.id, skillId) : undefined}
            onForgeGear={(category, data) => setGearItem(current.id, category, data)}
            onSetGearPassive={(category, passives) => setGearPassives(current.id, category, passives)}
            onSetWeaponSkill={data => setWeaponSkill(current.id, data)}
            onRestOverload={showEcoProgression ? () => restEcoOverload(current.id) : undefined}
            onSetOverload={showEcoProgression ? level => setEcoOverloadLevel(current.id, level) : undefined}
            lastOverloadEvents={lastOverloadEvents}
            onClearOverloadEvents={clearOverloadEvents}
            onAddItem={item => addInventoryItem(current.id, item)}
            onUpdateItem={(itemId, data) => updateInventoryItem(current.id, itemId, data)}
            onRemoveItem={itemId => removeInventoryItem(current.id, itemId)}
          />
        )}
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Excluir NPC" maxWidth="380px">
        <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1.25rem' }}>
          Enviar o NPC <strong style={{ color: '#e5e5e5' }}>{deleteConfirm?.name}</strong> para a lixeira?
          Você pode restaurá-lo em Lixeira.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
          <Button type="button" variant="danger" onClick={() => handleDelete(deleteConfirm)}>Excluir</Button>
        </div>
      </Modal>
    </div>
  )
}
