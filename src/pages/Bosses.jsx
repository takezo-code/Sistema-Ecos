import React, { useState, useEffect } from 'react'
import { ShieldAlert, Plus, Search } from 'lucide-react'
import { useNPCStore } from '../store/useNPCStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { useOrganizationStore } from '../store/useOrganizationStore'
import { filterByActiveCampaign, withActiveCampaign } from '../utils/campaignScope'
import { isCombatNpc } from '../utils/npcScope'
import { ActiveCampaignBanner } from '../components/ui/ActiveCampaignBanner'
import { PageHeader } from '../components/ui/PageHeader'
import { Modal } from '../components/ui/Modal'
import { Select } from '../components/ui/Field'
import { EmptyState } from '../components/ui/EmptyState'
import { NPCForm, buildNpcPayloadForSave } from './NPCs'

export function Bosses({
  embedded = false,
  onNavigate,
  autoOpenCreate = false,
  onCreateFlowClose,
  onCreateFlowSuccess,
}) {
  const { activeCampaignId } = useCampaignStore()
  const { npcs, addNPC, updateNPC } = useNPCStore()
  const { organizations } = useOrganizationStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')

  const orgsByCampaign = filterByActiveCampaign(organizations, activeCampaignId)

  let filtered = filterByActiveCampaign(npcs, activeCampaignId).filter(isCombatNpc)
  if (search) {
    filtered = filtered.filter(n =>
      n.name.toLowerCase().includes(search.toLowerCase()),
    )
  }

  const openCreate = () => { setEditing(null); setModalOpen(true) }
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
    const combatPayload = { ...data, podeCombater: true, papelCombate: data.papelCombate || 'boss' }
    if (editing) {
      updateNPC(editing.id, buildNpcPayloadForSave(combatPayload, false))
    } else {
      addNPC(withActiveCampaign(buildNpcPayloadForSave(combatPayload, true), activeCampaignId))
    }
    closeModal()
    if (autoOpenCreate && isNew) onCreateFlowSuccess?.()
  }

  const creationFlowOnly = embedded && autoOpenCreate

  if (creationFlowOnly) {
    return (
      <Modal open={modalOpen} onClose={handleModalClose} title="Novo Boss" maxWidth="720px">
        <NPCForm
          variant="boss"
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
          icon={ShieldAlert}
          title="Boss"
          subtitle={`${filtered.length} INIMIGOS DE COMBATE`}
          action={
            <button
              className="btn-primary"
              onClick={openCreate}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}
            >
              <Plus size={13} /> Novo Boss
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
            placeholder="Buscar boss..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {embedded && (
          <button
            className="btn-primary"
            onClick={openCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', marginLeft: 'auto' }}
          >
            <Plus size={13} /> Novo Boss
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="Nenhum boss encontrado"
            description="Crie inimigos de combate em Gerenciamento → Criação → Boss."
            action={<button className="btn-primary" onClick={openCreate}>Criar Boss</button>}
          />
        ) : (
          <p style={{ fontSize: '0.8rem', color: '#555' }}>
            {filtered.length} inimigo(s). Gerencie fichas em Gerenciamento → Boss.
          </p>
        )}
      </div>

      <Modal open={modalOpen} onClose={handleModalClose} title={editing ? 'Editar Boss' : 'Novo Boss'} maxWidth="720px">
        <NPCForm
          variant="boss"
          initial={editing}
          campaignId={activeCampaignId}
          organizations={orgsByCampaign}
          onSave={handleSave}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  )
}
