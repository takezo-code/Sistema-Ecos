import React, { useEffect, useState } from 'react'
import { ArrowLeft, Sword, Shield } from 'lucide-react'
import { EquipmentForm } from '../components/equipment/EquipmentForm'
import { useEquipmentStore } from '../store/useEquipmentStore'
import { useCampaignStore } from '../store/useCampaignStore'

export const EQUIPMENT_CREATION_ARMA = 'arma'
export const EQUIPMENT_CREATION_ARMADURA = 'armadura'

const CREATION_TYPES = [
  {
    id: EQUIPMENT_CREATION_ARMA,
    label: 'Arma',
    description: 'Armas à distância, magia, escudo, corpo a corpo — passivas pela raridade.',
    icon: Sword,
    color: '#dc2626',
    border: 'rgba(220,38,38,0.2)',
    bg: 'rgba(220,38,38,0.04)',
  },
  {
    id: EQUIPMENT_CREATION_ARMADURA,
    label: 'Armadura',
    description: 'Proteção leve, média ou pesada — −Destreza e +limiar de marcas.',
    icon: Shield,
    color: '#06b6d4',
    border: 'rgba(6,182,212,0.2)',
    bg: 'rgba(6,182,212,0.04)',
  },
]

import { CreationChoiceCard } from '../components/creation/CreationChoiceCard'

export function EquipmentCreationHub({
  onViewChange,
  initialCreationType,
  onCreationTypeConsumed,
}) {
  const [selected, setSelected] = useState(initialCreationType || null)
  const [formOpen, setFormOpen] = useState(false)
  const addItem = useEquipmentStore(s => s.addItem)
  const activeCampaignId = useCampaignStore(s => s.activeCampaignId)

  useEffect(() => {
    if (initialCreationType) {
      setSelected(initialCreationType)
      setFormOpen(true)
      onCreationTypeConsumed?.()
    }
  }, [initialCreationType, onCreationTypeConsumed])

  const handleSelect = (category) => {
    setSelected(category)
    setFormOpen(true)
  }

  const handleCreate = (formData) => {
    addItem({ ...formData, category: selected, campaignId: activeCampaignId })
    setFormOpen(false)
    setSelected(null)
    onViewChange?.(selected === EQUIPMENT_CREATION_ARMADURA ? 'armadura' : 'armas')
  }

  const categoryLabel = selected === EQUIPMENT_CREATION_ARMADURA ? 'armadura' : 'arma'

  if (selected && formOpen) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{
          padding: '0.6rem 1.5rem',
          borderBottom: '1px solid #1a1a1a',
          display: 'flex',
          alignItems: 'center',
        }}>
          <button
            type="button"
            onClick={() => { setFormOpen(false); setSelected(null) }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'transparent',
              border: 'none',
              color: '#555',
              cursor: 'pointer',
              fontSize: '0.7rem',
              padding: '2px 0',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#e5e5e5' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#555' }}
          >
            <ArrowLeft size={13} />
            Voltar à seleção
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <div style={{ maxWidth: '560px', margin: '0 auto' }}>
            <EquipmentForm
              category={categoryLabel}
              onSave={handleCreate}
              onCancel={() => { setFormOpen(false); setSelected(null) }}
              submitLabel="Criar equipamento"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e5e5e5', marginBottom: '0.35rem' }}>
            O que você quer criar?
          </div>
          <div style={{ fontSize: '0.75rem', color: '#444' }}>
            Escolha o tipo de equipamento para o catálogo da campanha.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem' }}>
          {CREATION_TYPES.map(type => (
            <CreationChoiceCard
              key={type.id}
              type={type}
              disabled={false}
              onClick={handleSelect}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
