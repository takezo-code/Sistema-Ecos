import React, { useState } from 'react'
import { ShieldAlert, Settings2, Search, Trash2, Sparkles, Package } from 'lucide-react'
import { EntityThumb } from '../components/ui/EntityThumb'
import { useNPCStore } from '../store/useNPCStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { filterByActiveCampaign } from '../utils/campaignScope'
import { EntityManagePanel } from '../components/management/EntityManagePanel'
import { CombatStatsSection } from '../components/management/CombatStatsSection'
import { getAttributesForEntity, entityHasEcoPowers } from '../constants/entityProgression'
import { useTrashStore } from '../store/useTrashStore'
import { getEntityEffectiveAttributes } from '../services/stateModifiers'
import { Button } from '../components/ui/Button'
import SpotlightCard from '../components/react-bits/SpotlightCard'
import GlowingBadge from '../components/ui/GlowingBadge'
import { FloatingTooltip } from '../components/ui/FloatingTooltip'
import GlassSurface from '../components/react-bits/GlassSurface'

const ACCENT = '#dc2626'

function BossManageCard({ npc, onManage, onDelete }) {
  const { effective: attrs, base } = getEntityEffectiveAttributes(npc)
  const attrList = getAttributesForEntity(npc)
  const inventoryCount = npc.inventory?.length || 0
  const skillCount = npc.skills?.length || 0
  const hasEco = entityHasEcoPowers(npc)
  const marks = npc.damageMarks ?? 0
  const maxMarks = npc.marcasMaximas ?? 0
  const lifeLeft = Math.max(0, maxMarks - marks)

  return (
    <SpotlightCard
      onClick={onManage}
      spotlightColor="rgba(220, 38, 38, 0.22)"
      style={{
        padding: 0,
        cursor: 'pointer',
        borderLeft: `3px solid ${ACCENT}`,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '1.1rem 1.2rem 0.85rem',
      }}>
        <div style={{ display: 'flex', gap: '0.9rem', flex: 1, minWidth: 0 }}>
          <EntityThumb
            src={npc.image}
            alt={npc.name}
            size={64}
            borderRadius="12px"
            fallbackIcon={ShieldAlert}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#f5f5f5',
              letterSpacing: '-0.02em',
              marginBottom: '0.45rem',
            }}>
              {npc.name}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: ACCENT,
                background: 'rgba(220,38,38,0.14)',
                border: '1px solid rgba(220,38,38,0.35)',
                borderRadius: 999,
                padding: '0.22rem 0.55rem',
                letterSpacing: '0.04em',
              }}>
                BOSS
              </span>
              <GlowingBadge variant="default" dot>
                NVL {npc.level || 1}
              </GlowingBadge>
              <GlowingBadge variant="error" pulse={false} dot>
                VIDA {lifeLeft}{maxMarks > 0 ? `/${maxMarks}` : ''}
              </GlowingBadge>
              {hasEco && (
                <GlowingBadge variant="cyan" pulse dot>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Sparkles size={10} />
                    {npc.ecoPoints ?? 0} Ecos
                  </span>
                </GlowingBadge>
              )}
              {hasEco && skillCount > 0 && (
                <GlowingBadge variant="default" pulse={false} dot>
                  {skillCount} skill{skillCount === 1 ? '' : 's'}
                </GlowingBadge>
              )}
            </div>
          </div>
        </div>

        <FloatingTooltip.Provider>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flexShrink: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <FloatingTooltip.Trigger content="Gerenciar ficha">
              <button
                type="button"
                onClick={onManage}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  color: '#888',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  transition: 'color 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#e5e5e5'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#888'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                }}
              >
                <Settings2 size={14} />
              </button>
            </FloatingTooltip.Trigger>
            <FloatingTooltip.Trigger content="Excluir">
              <button
                type="button"
                onClick={onDelete}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  color: '#666',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
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
                <Trash2 size={14} />
              </button>
            </FloatingTooltip.Trigger>
          </div>
        </FloatingTooltip.Provider>
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

export function ManageBoss({ embedded = false }) {
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
    learnCatalogSkill,
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

  let filtered = filterByActiveCampaign(npcs, activeCampaignId).filter(n => n.papelCombate === 'boss')
  if (search) filtered = filtered.filter(n => n.name.toLowerCase().includes(search.toLowerCase()))

  const current = managing ? npcs.find(n => n.id === managing.id) : null

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
      <div style={{ padding: '1rem 1.5rem 0', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
          <input
            className="input-base"
            style={{
              paddingLeft: '2.15rem',
              fontSize: '0.8rem',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.03)',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
            placeholder="Buscar boss..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem 1.25rem' }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="Nenhum boss para gerenciar"
            description="Crie um Boss em Criação na sidebar para gerenciar status, combate e mochila aqui."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '720px' }}>
            {filtered.map(n => (
              <BossManageCard
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
          <>
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
              onLearnCatalogSkill={templateId => learnCatalogSkill(current.id, templateId, { free: true })}
              onAddInlineSkill={draft => addInlineSkill(current.id, draft)}
              onUpdateInlineSkill={(skillId, draft) => updateInlineSkill(current.id, skillId, draft)}
              onRemoveSkill={skillId => removeSkill(current.id, skillId)}
              onForgeGear={(category, data) => setGearItem(current.id, category, data)}
              onSetGearPassive={(category, passives) => setGearPassives(current.id, category, passives)}
              onSetWeaponSkill={data => setWeaponSkill(current.id, data)}
              onRestOverload={() => restEcoOverload(current.id)}
              onSetOverload={level => setEcoOverloadLevel(current.id, level)}
              lastOverloadEvents={lastOverloadEvents}
              onClearOverloadEvents={clearOverloadEvents}
              onAddItem={item => addInventoryItem(current.id, item)}
              onUpdateItem={(itemId, data) => updateInventoryItem(current.id, itemId, data)}
              onRemoveItem={itemId => removeInventoryItem(current.id, itemId)}
            />
            <hr className="divide-line" style={{ margin: '1.25rem 0' }} />
            <CombatStatsSection
              entity={current}
              onUpdate={data => updateNPC(current.id, data)}
            />
          </>
        )}
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Excluir boss" maxWidth="380px">
        <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1.25rem' }}>
          Enviar <strong style={{ color: '#e5e5e5' }}>{deleteConfirm?.name}</strong> para a lixeira?
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
          <Button type="button" variant="danger" onClick={() => handleDelete(deleteConfirm)}>Excluir</Button>
        </div>
      </Modal>
    </div>
  )
}
