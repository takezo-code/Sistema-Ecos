import React, { useEffect, useState } from 'react'
import { ArrowLeft, Sword, Skull, ShieldAlert } from 'lucide-react'
import { SkillForm } from '../components/skills/SkillForm'
import { useSkillsCatalogStore } from '../store/useSkillsCatalogStore'
import { SKILL_AUDIENCE } from '../constants/skillAudience'

const CREATION_TYPES = [
  {
    id: SKILL_AUDIENCE.CHARACTER,
    label: 'Skill de Personagem',
    description: 'Poderes que personagens jogadores podem descobrir e aprender.',
    icon: Sword,
    color: '#9ca3af',
    border: 'rgba(156,163,175,0.2)',
    bg: 'rgba(156,163,175,0.04)',
  },
  {
    id: SKILL_AUDIENCE.NPC,
    label: 'Skill de NPC',
    description: 'Habilidades exclusivas para NPCs — atribuição manual no Gerenciamento.',
    icon: Skull,
    color: '#06b6d4',
    border: 'rgba(6,182,212,0.2)',
    bg: 'rgba(6,182,212,0.04)',
  },
  {
    id: SKILL_AUDIENCE.BOSS,
    label: 'Skill de Boss',
    description: 'Poderes de inimigos poderosos — catálogo separado para bosses.',
    icon: ShieldAlert,
    color: '#dc2626',
    border: 'rgba(220,38,38,0.2)',
    bg: 'rgba(220,38,38,0.04)',
  },
]

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '255,255,255'
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
}

export function SkillsCreationHub({
  onViewChange,
  initialCreationType,
  onCreationTypeConsumed,
}) {
  const [selected, setSelected] = useState(initialCreationType || null)
  const [formOpen, setFormOpen] = useState(false)
  const addSkill = useSkillsCatalogStore(s => s.addSkill)

  useEffect(() => {
    if (initialCreationType) {
      setSelected(initialCreationType)
      setFormOpen(true)
      onCreationTypeConsumed?.()
    }
  }, [initialCreationType, onCreationTypeConsumed])

  const handleSelect = (audience) => {
    setSelected(audience)
    setFormOpen(true)
  }

  const handleCreate = draft => {
    addSkill(draft)
    setFormOpen(false)
    setSelected(null)
    onViewChange?.(draft.audience || selected)
  }

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
          <div style={{ maxWidth: '520px', margin: '0 auto' }}>
            <SkillForm
              defaultAudience={selected}
              onSubmit={handleCreate}
              onCancel={() => { setFormOpen(false); setSelected(null) }}
              submitLabel="Criar skill"
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
            Qual skill você quer criar?
          </div>
          <div style={{ fontSize: '0.75rem', color: '#444' }}>
            Escolha o destino da habilidade no catálogo.
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
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '1.25rem',
                  background: type.bg,
                  border: `1px solid ${type.border}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => {
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
