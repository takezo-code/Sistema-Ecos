import React, { useState } from 'react'
import { Sword, Settings2, Trash2 } from 'lucide-react'
import { EntityThumb } from '../components/ui/EntityThumb'
import { useCharacterStore } from '../store/useCharacterStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { Select } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { EntityManagePanel } from '../components/management/EntityManagePanel'
import { CharacterForm } from './Characters'
import { ATTRIBUTES } from '../constants/attributes'
import { filterByActiveCampaign } from '../utils/campaignScope'
import { ActiveCampaignBanner } from '../components/ui/ActiveCampaignBanner'
import { useTrashStore } from '../store/useTrashStore'

function CharacterManageCard({ character, onManage, onDelete }) {
  const attrs = character.attributes || {}
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
          <EntityThumb src={character.image} alt={character.name} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e5e5e5', marginBottom: '4px' }}>{character.name}</div>
            <div style={{ fontSize: '0.65rem', color: '#a855f7', fontFamily: 'monospace', marginBottom: '6px' }}>
              NVL {character.level || 1} · {character.ecoPoints ?? 0} Ecos
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
      {(character.inventory?.length > 0) && (
        <div style={{ padding: '0.5rem 1.25rem 0.875rem', borderTop: '1px solid #1a1a1a', fontSize: '0.65rem', color: '#333', fontFamily: 'monospace' }}>
          MOCHILA: {character.inventory.length} {character.inventory.length === 1 ? 'ITEM' : 'ITENS'}
        </div>
      )}
    </div>
  )
}

export function ManageCharacters({ embedded = false }) {
  const { activeCampaignId } = useCampaignStore()
  const {
    characters,
    deleteCharacter,
    updateCharacter,
    addXp,
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
    unlockSkill,
    upgradeSkill,
    useEcoSkill,
    restEcoOverload,
    setEcoOverloadLevel,
    lastOverloadEvents,
    clearOverloadEvents,
    addInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
    addEquippedItem,
    removeEquippedItem,
    lastLevelUps,
    clearLevelUps,
  } = useCharacterStore()
  const refreshTrash = useTrashStore(s => s.refresh)
  const [managing, setManaging] = useState(null)
  const [editingProfile, setEditingProfile] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const filtered = filterByActiveCampaign(characters, activeCampaignId)

  const current = managing ? characters.find(c => c.id === managing.id) : null

  const handleDelete = (character) => {
    deleteCharacter(character.id)
    refreshTrash()
    if (managing?.id === character.id) {
      setManaging(null)
      clearLevelUps()
      clearOverloadEvents()
      clearMasterError()
    }
    if (editingProfile?.id === character.id) setEditingProfile(null)
    setDeleteConfirm(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ActiveCampaignBanner />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Sword}
            title="Nenhum personagem para gerenciar"
            description="Crie personagens em Gerenciamento → Criação para gerenciar status, nível e mochila aqui."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '720px' }}>
            {filtered.map(c => (
              <CharacterManageCard
                key={c.id}
                character={c}
                onManage={() => setManaging(c)}
                onDelete={() => setDeleteConfirm(c)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={!!current} onClose={() => { setManaging(null); clearLevelUps(); clearOverloadEvents(); clearMasterError() }} title={`Gerenciar — ${current?.name}`} maxWidth="720px">
        {current && (
          <EntityManagePanel
            entity={current}
            showProgression
            adminMode
            levelUps={lastLevelUps}
            onUpdate={data => updateCharacter(current.id, data)}
            onAddXp={amount => addXp(current.id, amount)}
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

            onEditProfile={() => setEditingProfile(current)}
            onUnlockSkill={() => unlockSkill(current.id)}
            onUpgradeSkill={skillId => upgradeSkill(current.id, skillId)}
            onUseSkill={(skillId, opts) => useEcoSkill(current.id, skillId, opts)}
            onRestOverload={() => restEcoOverload(current.id)}
            onSetOverload={level => setEcoOverloadLevel(current.id, level)}
            lastOverloadEvents={lastOverloadEvents}
            onClearOverloadEvents={clearOverloadEvents}
            onAddItem={item => addInventoryItem(current.id, item)}
            onUpdateItem={(itemId, data) => updateInventoryItem(current.id, itemId, data)}
            onRemoveItem={itemId => removeInventoryItem(current.id, itemId)}
            onAddEquipped={item => addEquippedItem(current.id, item)}
            onRemoveEquipped={itemId => removeEquippedItem(current.id, itemId)}
          />
        )}
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Excluir personagem" maxWidth="380px">
        <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1.25rem' }}>
          Enviar o personagem <strong style={{ color: '#e5e5e5' }}>{deleteConfirm?.name}</strong> para a lixeira?
          Será removido dos grupos da campanha. Você pode restaurá-lo em Lixeira.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
          <button type="button" className="btn-primary" onClick={() => handleDelete(deleteConfirm)}>Excluir</button>
        </div>
      </Modal>

      <Modal
        open={!!editingProfile}
        onClose={() => setEditingProfile(null)}
        title={`Editar ficha — ${editingProfile?.name}`}
        maxWidth="640px"
      >
        {editingProfile && (
          <CharacterForm
            initial={editingProfile}
            profileOnly
            onSave={data => {
              updateCharacter(editingProfile.id, data)
              setEditingProfile(null)
            }}
            onCancel={() => setEditingProfile(null)}
          />
        )}
      </Modal>
    </div>
  )
}
