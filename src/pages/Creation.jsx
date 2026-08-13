import React, { useEffect, useState } from 'react'
import {
  ArrowLeft, Sword, Skull, Building2, ShieldAlert, Sparkles,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { CreationChoiceGrid } from '../components/creation/CreationChoiceCard'
import { Characters } from './Characters'
import { NPCs } from './NPCs'
import { Bosses } from './Bosses'
import { Organizations } from './Organizations'
import { useCampaignStore } from '../store/useCampaignStore'

const ARTEFATO_TYPES = [
  {
    id: 'characters',
    label: 'Player',
    description: 'Personagem jogável com atributos, progressão e habilidades de Eco.',
    icon: Sword,
    color: '#9ca3af',
    border: 'rgba(156,163,175,0.2)',
    bg: 'rgba(156,163,175,0.04)',
    needsCampaign: true,
  },
  {
    id: 'npcs',
    label: 'NPC',
    description: 'Figura da narrativa — aliado, informante ou inimigo de cena.',
    icon: Skull,
    color: '#06b6d4',
    border: 'rgba(6,182,212,0.2)',
    bg: 'rgba(6,182,212,0.04)',
    needsCampaign: true,
  },
  {
    id: 'boss',
    label: 'Boss',
    description: 'Inimigo de combate com vida e atributos.',
    icon: ShieldAlert,
    color: '#dc2626',
    border: 'rgba(220,38,38,0.2)',
    bg: 'rgba(220,38,38,0.04)',
    needsCampaign: true,
  },
  {
    id: 'organizations',
    label: 'Org',
    description: 'Facção, corporação, culto ou grupo organizado da campanha.',
    icon: Building2,
    color: '#d97706',
    border: 'rgba(217,119,6,0.2)',
    bg: 'rgba(217,119,6,0.04)',
    needsCampaign: true,
  },
]

const ENTITY_IDS = new Set(ARTEFATO_TYPES.map(t => t.id))

function BackBar({ onBack, label = 'Voltar' }) {
  return (
    <div style={{
      padding: '0.6rem 1.5rem',
      borderBottom: '1px solid #1a1a1a',
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
    }}>
      <button
        type="button"
        onClick={onBack}
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
        {label}
      </button>
    </div>
  )
}

function ChoiceGrid({ types, disabled, onClick }) {
  return (
    <CreationChoiceGrid
      types={types}
      disabled={disabled}
      onClick={onClick}
      columns={2}
    />
  )
}

export function Creation({
  onNavigate,
  initialCreationType,
  onCreationTypeConsumed,
}) {
  const [selected, setSelected] = useState(null)
  const { activeCampaignId } = useCampaignStore()

  useEffect(() => {
    if (!initialCreationType) return
    if (ENTITY_IDS.has(initialCreationType)) {
      setSelected(initialCreationType)
    } else {
      setSelected(null)
    }
    onCreationTypeConsumed?.()
  }, [initialCreationType, onCreationTypeConsumed])

  const openLeaf = (typeId) => {
    const type = ARTEFATO_TYPES.find(t => t.id === typeId)
    if (type?.needsCampaign && !activeCampaignId) return
    setSelected(typeId)
  }

  const backToHome = () => setSelected(null)

  const handleEntitySuccess = (typeId) => {
    backToHome()
    onNavigate?.('management', typeId)
  }

  if (selected && ENTITY_IDS.has(selected)) {
    const flowProps = {
      embedded: true,
      onNavigate,
      autoOpenCreate: true,
      onCreateFlowClose: backToHome,
      onCreateFlowSuccess: () => handleEntitySuccess(selected),
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <PageHeader icon={Sparkles} title="Criação" subtitle="ARTEFATO" />
        <BackBar onBack={backToHome} label="Voltar" />
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {selected === 'characters' && <Characters {...flowProps} />}
          {selected === 'npcs' && <NPCs {...flowProps} />}
          {selected === 'boss' && <Bosses {...flowProps} />}
          {selected === 'organizations' && <Organizations {...flowProps} />}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        icon={Sparkles}
        title="Criação"
        subtitle="ARTEFATO"
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e5e5e5', marginBottom: '0.35rem' }}>
              O que você quer criar?
            </div>
            <div style={{ fontSize: '0.75rem', color: '#444' }}>
              {activeCampaignId
                ? 'Escolha o tipo de artefato.'
                : 'Selecione uma campanha ativa para criar artefatos (player, NPC, boss, org).'}
            </div>
          </div>

          <ChoiceGrid
            types={ARTEFATO_TYPES}
            disabled={(type) => Boolean(type.needsCampaign && !activeCampaignId)}
            onClick={openLeaf}
          />
        </div>
      </div>
    </div>
  )
}
