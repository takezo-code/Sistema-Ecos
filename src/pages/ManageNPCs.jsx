import React, { useState } from 'react'
import { Skull, Package } from 'lucide-react'
import { EntityThumb } from '../components/ui/EntityThumb'
import { useNPCStore } from '../store/useNPCStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { filterByActiveCampaign } from '../utils/campaignScope'
import { isNarrativeNpc } from '../utils/npcScope'
import { EntityManagePanel } from '../components/management/EntityManagePanel'
import { getAttributesForEntity, entityHasEcoPowers } from '../constants/entityProgression'
import { getEntityEffectiveAttributes } from '../services/stateModifiers'
import SpotlightCard from '../components/react-bits/SpotlightCard'
import GlassSurface from '../components/react-bits/GlassSurface'

const ACCENT = '#06b6d4'

function NPCManageCard({ npc, onManage }) {
  const { effective: attrs, base } = getEntityEffectiveAttributes(npc)
  const attrList = getAttributesForEntity(npc)
  const inventoryCount = npc.inventory?.length || 0

  return (
    <SpotlightCard
      onClick={onManage}
      spotlightColor="rgba(6, 182, 212, 0.2)"
      style={{
        padding: 0,
        cursor: 'pointer',
        borderLeft: `3px solid ${ACCENT}`,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        padding: '1.1rem 1.2rem 0.85rem',
      }}>
        <div style={{ display: 'flex', gap: '0.9rem', flex: 1, minWidth: 0 }}>
          <EntityThumb
            src={npc.image}
            alt={npc.name}
            size={64}
            borderRadius="12px"
            fallbackIcon={Skull}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#f5f5f5',
              letterSpacing: '-0.02em',
            }}>
              {npc.name}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${attrList.length}, minmax(0, 1fr))`,
        gap: '0.45rem',
        padding: '0 1.1rem 1rem',
      }}>
        {attrList.map(attr => {
          const eff = attrs[attr.key] || 0
          const raw = base?.[attr.key] || 0
          const reduced = eff < raw
          const color = eff > 0 ? (reduced ? '#ea580c' : attr.color) : '#555'
          return (
            <GlassSurface
              key={attr.key}
              borderRadius={10}
              padding="0.55rem 0.35rem"
              style={{ textAlign: 'center' }}
            >
              <div style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color,
                lineHeight: 1,
                textShadow: eff > 0 ? `0 0 18px ${color}55` : 'none',
              }}>
                {eff}
              </div>
              <div style={{
                fontSize: '0.58rem',
                color: '#777',
                fontFamily: 'monospace',
                letterSpacing: '0.08em',
                marginTop: 5,
              }}>
                {attr.label.slice(0, 3).toUpperCase()}
              </div>
            </GlassSurface>
          )
        })}
      </div>

      {inventoryCount > 0 && (
        <div style={{
          padding: '0.55rem 1.2rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
        }}>
          <Package size={12} style={{ color: '#666' }} />
          <span style={{ fontSize: '0.65rem', color: '#777', fontFamily: 'monospace', letterSpacing: '0.06em' }}>
            MOCHILA · {inventoryCount} {inventoryCount === 1 ? 'ITEM' : 'ITENS'}
          </span>
        </div>
      )}
    </SpotlightCard>
  )
}

export function ManageNPCs({ embedded: _embedded = false }) {
  const { activeCampaignId } = useCampaignStore()
  const {
    npcs,
    updateNPC,
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
    clearLevelUps,
    addInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
  } = useNPCStore()
  const [managing, setManaging] = useState(null)
  const filtered = filterByActiveCampaign(npcs, activeCampaignId).filter(isNarrativeNpc)

  const current = managing ? npcs.find(n => n.id === managing.id) : null
  const showEcoProgression = current ? entityHasEcoPowers(current) : false

  const handleOpenManage = (npc) => {
    setManaging(npc)
    queueMicrotask(() => {
      syncMasterProgression(npc.id)
      clearMasterError()
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
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
    </div>
  )
}
