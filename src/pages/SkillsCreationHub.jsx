import React, { useEffect, useState } from 'react'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { SkillForm } from '../components/skills/SkillForm'
import { useSkillsCatalogStore } from '../store/useSkillsCatalogStore'
import { SKILL_AUDIENCE, normalizeSkillAudience } from '../constants/skillAudience'
import { CreationChoiceCard } from '../components/creation/CreationChoiceCard'

const CREATION_SKILL = {
  id: 'skill',
  label: 'Criar Skill',
  description: 'Habilidades para NPC ou boss. Skills de personagem vêm pré-definidas por classe.',
  icon: Sparkles,
  color: '#a855f7',
  border: 'rgba(168,85,247,0.25)',
  bg: 'rgba(168,85,247,0.04)',
}

export function SkillsCreationHub({
  onViewChange,
  initialCreationType,
  onCreationTypeConsumed,
}) {
  const [formOpen, setFormOpen] = useState(false)
  const [defaultAudience, setDefaultAudience] = useState(SKILL_AUDIENCE.NPC)
  const addSkill = useSkillsCatalogStore(s => s.addSkill)

  useEffect(() => {
    if (!initialCreationType) return
    if (initialCreationType === 'skill' || initialCreationType === SKILL_AUDIENCE.CHARACTER) {
      setDefaultAudience(SKILL_AUDIENCE.NPC)
    } else {
      setDefaultAudience(normalizeSkillAudience(initialCreationType) === SKILL_AUDIENCE.BOSS
        ? SKILL_AUDIENCE.BOSS
        : SKILL_AUDIENCE.NPC)
    }
    setFormOpen(true)
    onCreationTypeConsumed?.()
  }, [initialCreationType, onCreationTypeConsumed])

  const handleCreate = draft => {
    addSkill(draft)
    setFormOpen(false)
    onViewChange?.(draft.audience || defaultAudience)
  }

  if (formOpen) {
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
            onClick={() => setFormOpen(false)}
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
            Voltar
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <div style={{ maxWidth: '520px', margin: '0 auto' }}>
            <SkillForm
              key={defaultAudience}
              defaultAudience={defaultAudience}
              onSubmit={handleCreate}
              onCancel={() => setFormOpen(false)}
              submitLabel="Criar skill"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '420px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e5e5e5', marginBottom: '0.35rem' }}>
            Nova skill
          </div>
          <div style={{ fontSize: '0.75rem', color: '#444' }}>
            Apenas NPC ou boss. Skills de personagem são pré-definidas por classe.
          </div>
        </div>

        <CreationChoiceCard
          type={CREATION_SKILL}
          disabled={false}
          onClick={() => {
            setDefaultAudience(SKILL_AUDIENCE.NPC)
            setFormOpen(true)
          }}
        />
      </div>
    </div>
  )
}
