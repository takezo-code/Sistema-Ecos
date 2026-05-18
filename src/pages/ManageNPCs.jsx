import React, { useState } from 'react'
import { Skull, Settings2, Search } from 'lucide-react'
import { EntityThumb } from '../components/ui/EntityThumb'
import { useNPCStore } from '../store/useNPCStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { Select } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { filterByActiveCampaign } from '../utils/campaignScope'
import { ActiveCampaignBanner } from '../components/ui/ActiveCampaignBanner'
import { EntityManagePanel } from '../components/management/EntityManagePanel'
import { StatusTag } from '../components/ui/StatusTag'
import { ATTRIBUTES } from '../constants/attributes'
import { applyInitialAttributeChange, applyAttributePointSpend } from '../services/progressionService'

function NPCManageCard({ npc, onManage }) {
  const attrs = npc.attributes || {}
  return (
    <button
      type="button"
      onClick={onManage}
      style={{
        background: '#111',
        border: '1px solid #1a1a1a',
        borderRadius: '4px',
        padding: '1rem 1.25rem',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.background = '#141414' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.background = '#111' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: 0 }}>
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
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.25rem' }}>
            {ATTRIBUTES.map(attr => (
              <div key={attr.key} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: attrs[attr.key] > 0 ? attr.color : '#333' }}>{attrs[attr.key] || 0}</div>
                <div style={{ fontSize: '0.5rem', color: '#333', fontFamily: 'monospace' }}>{attr.label.slice(0, 3).toUpperCase()}</div>
              </div>
            ))}
          </div>
          </div>
        </div>
        <Settings2 size={16} style={{ color: '#333', flexShrink: 0 }} />
      </div>
      {(npc.inventory?.length > 0) && (
        <div style={{ marginTop: '0.625rem', paddingTop: '0.625rem', borderTop: '1px solid #1a1a1a', fontSize: '0.65rem', color: '#333', fontFamily: 'monospace' }}>
          MOCHILA: {npc.inventory.length} {npc.inventory.length === 1 ? 'ITEM' : 'ITENS'}
        </div>
      )}
    </button>
  )
}

export function ManageNPCs({ embedded = false }) {
  const { activeCampaignId } = useCampaignStore()
  const {
    npcs,
    updateNPC,
    addInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
    addEquippedItem,
    removeEquippedItem,
  } = useNPCStore()
  const [managing, setManaging] = useState(null)
  const [search, setSearch] = useState('')
  let filtered = filterByActiveCampaign(npcs, activeCampaignId)
  if (search) filtered = filtered.filter(n => n.name.toLowerCase().includes(search.toLowerCase()))

  const current = managing ? npcs.find(n => n.id === managing.id) : null

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
            description="Crie NPCs na aba Criação para gerenciar status e mochila aqui."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '720px' }}>
            {filtered.map(n => (
              <NPCManageCard key={n.id} npc={n} onManage={() => setManaging(n)} />
            ))}
          </div>
        )}
      </div>

      <Modal open={!!current} onClose={() => setManaging(null)} title={`Gerenciar — ${current?.name}`} maxWidth="680px">
        {current && (
          <EntityManagePanel
            entity={current}
            showProgression={false}
            onUpdate={data => updateNPC(current.id, data)}
            onChangeAttribute={(key, val, opts) => {
              const patch = opts?.isCreation
                ? applyInitialAttributeChange(current, key, val)
                : applyAttributePointSpend(current, key, val)
              if (patch) updateNPC(current.id, patch)
            }}
            onAddItem={item => addInventoryItem(current.id, item)}
            onUpdateItem={(itemId, data) => updateInventoryItem(current.id, itemId, data)}
            onRemoveItem={itemId => removeInventoryItem(current.id, itemId)}
            onAddEquipped={item => addEquippedItem(current.id, item)}
            onRemoveEquipped={itemId => removeEquippedItem(current.id, itemId)}
          />
        )}
      </Modal>
    </div>
  )
}
