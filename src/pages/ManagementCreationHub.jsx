import React, { useEffect, useState } from 'react'
import { Sword, Skull, Building2, ArrowLeft, ShieldAlert } from 'lucide-react'
import { Characters } from './Characters'
import { NPCs } from './NPCs'
import { Organizations } from './Organizations'
import { useCampaignStore } from '../store/useCampaignStore'

const CREATION_TYPES = [
  {
    id: 'characters',
    label: 'Personagem',
    description: 'Personagem jogável com atributos, progressão e habilidades.',
    icon: Sword,
    color: '#9ca3af',
    border: 'rgba(156,163,175,0.2)',
    bg: 'rgba(156,163,175,0.04)',
  },
  {
    id: 'npcs',
    label: 'NPC',
    description: 'Personagem não jogável: aliado, inimigo ou figura da narrativa.',
    icon: Skull,
    color: '#06b6d4',
    border: 'rgba(6,182,212,0.2)',
    bg: 'rgba(6,182,212,0.04)',
  },
  {
    id: 'boss',
    label: 'Boss',
    description: 'Inimigo poderoso com resistências físicas e mentais altas. Pronto para combate.',
    icon: ShieldAlert,
    color: '#dc2626',
    border: 'rgba(220,38,38,0.2)',
    bg: 'rgba(220,38,38,0.04)',
  },
  {
    id: 'organizations',
    label: 'Organização',
    description: 'Facção, corporação, culto ou qualquer grupo organizado da campanha.',
    icon: Building2,
    color: '#d97706',
    border: 'rgba(217,119,6,0.2)',
    bg: 'rgba(217,119,6,0.04)',
  },
]

const CREATION_FLOW_PROPS = {
  autoOpenCreate: true,
}

export function ManagementCreationHub({
  onNavigate,
  onViewChange,
  initialCreationType,
  onCreationTypeConsumed,
}) {
  const [selected, setSelected] = useState(initialCreationType || null)
  const { activeCampaignId } = useCampaignStore()

  useEffect(() => {
    if (initialCreationType) {
      setSelected(initialCreationType)
      onCreationTypeConsumed?.()
    }
  }, [initialCreationType, onCreationTypeConsumed])

  const handleSelect = (typeId) => {
    if (!activeCampaignId) return
    setSelected(typeId)
  }

  const handleCreateSuccess = (typeId) => {
    setSelected(null)
    onViewChange?.(typeId)
  }

  if (selected) {
    const flowProps = {
      embedded: true,
      onNavigate,
      ...CREATION_FLOW_PROPS,
      onCreateFlowClose: () => setSelected(null),
      onCreateFlowSuccess: () => handleCreateSuccess(selected),
    }

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
            onClick={() => setSelected(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'transparent',
              border: 'none',
              color: '#555',
              cursor: 'pointer',
              fontSize: '0.7rem',
              transition: 'color 0.15s',
              padding: '2px 0',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#e5e5e5' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#555' }}
          >
            <ArrowLeft size={13} />
            Voltar à seleção
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {selected === 'characters' && <Characters {...flowProps} />}
          {selected === 'npcs' && <NPCs {...flowProps} />}
          {selected === 'boss' && <NPCs {...flowProps} bossMode />}
          {selected === 'organizations' && <Organizations {...flowProps} />}
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
            {activeCampaignId
              ? 'Escolha o tipo de entidade para adicionar à campanha ativa.'
              : 'Selecione uma campanha ativa antes de criar entidades.'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {CREATION_TYPES.map(type => {
            const Icon = type.icon
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => handleSelect(type.id)}
                disabled={!activeCampaignId}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '1.25rem',
                  background: type.bg,
                  border: `1px solid ${type.border}`,
                  borderRadius: '6px',
                  cursor: activeCampaignId ? 'pointer' : 'not-allowed',
                  opacity: activeCampaignId ? 1 : 0.4,
                  textAlign: 'left',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => {
                  if (!activeCampaignId) return
                  e.currentTarget.style.borderColor = type.color
                  e.currentTarget.style.background = `rgba(${hexToRgb(type.color)}, 0.08)`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = type.border
                  e.currentTarget.style.background = type.bg
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  background: `rgba(${hexToRgb(type.color)}, 0.1)`,
                  border: `1px solid rgba(${hexToRgb(type.color)}, 0.2)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={18} style={{ color: type.color }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e5e5e5', marginBottom: '0.3rem' }}>
                    {type.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#555', lineHeight: 1.5 }}>
                    {type.description}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '255,255,255'
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
}
