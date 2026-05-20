import React, { useState, useMemo } from 'react'
import { Plus, Filter } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { SkillCard } from '../../components/skills/SkillCard'
import { TurnControlBar } from '../../components/skills/TurnControlBar'
import { listCharacterSkillsRuntime } from '../../services/ecoSkillRuntimeService'
import { getMergedCatalog } from '../../services/skillsCatalogService'
import { SKILL_AUDIENCE } from '../../constants/skillAudience'
import { ECO_SKILL_TYPES } from '../../constants/skillTypes'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'

export function CharacterSkills({
  character,
  onActivate,
  onAdvanceTurn,
  onRestEco,
  onLearnSkill,
  lastSkillError,
  onClearSkillError,
  lastOverloadEvents,
}) {
  const [typeFilter, setTypeFilter] = useState('all')
  const [catalogOpen, setCatalogOpen] = useState(false)

  const runtimes = useMemo(
    () => listCharacterSkillsRuntime(character),
    [character]
  )

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return runtimes
    if (typeFilter === 'ativa') return runtimes.filter(r => r.catalog.skillType === ECO_SKILL_TYPES.ATIVA)
    if (typeFilter === 'passiva') return runtimes.filter(r => r.catalog.skillType === ECO_SKILL_TYPES.PASSIVA)
    return runtimes
  }, [runtimes, typeFilter])

  const catalogAvailable = useMemo(() => {
    const ownedIds = new Set((character.skills || []).map(s => s.templateId))
    return getMergedCatalog(SKILL_AUDIENCE.CHARACTER).filter(c => !ownedIds.has(c.templateId))
  }, [character.skills])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        title="Habilidades"
        subtitle="Eco limitado · consequências leves · risco constante"
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
        <TurnControlBar
          currentTurn={character.currentTurn}
          ecoOverload={character.ecoOverload}
          onAdvanceTurn={onAdvanceTurn}
          onRestEco={onRestEco}
        />

        {lastSkillError && (
          <div style={{
            marginBottom: '0.75rem',
            padding: '0.5rem 0.75rem',
            background: 'rgba(220,38,38,0.08)',
            border: '1px solid rgba(220,38,38,0.2)',
            borderRadius: '3px',
            fontSize: '0.75rem',
            color: '#dc2626',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            {lastSkillError.message}
            {onClearSkillError && (
              <button type="button" className="btn-ghost" style={{ fontSize: '0.65rem' }} onClick={onClearSkillError}>×</button>
            )}
          </div>
        )}

        {lastOverloadEvents?.length > 0 && (
          <div style={{
            marginBottom: '0.75rem',
            padding: '0.625rem 0.75rem',
            background: 'rgba(153,27,27,0.1)',
            border: '1px solid rgba(153,27,27,0.3)',
            borderRadius: '3px',
            fontSize: '0.75rem',
            color: '#f87171',
          }}>
            {lastOverloadEvents[0]?.message}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Filter size={13} style={{ color: '#444' }} />
            {['all', 'ativa', 'passiva'].map(f => (
              <button
                key={f}
                type="button"
                className={typeFilter === f ? 'btn-secondary' : 'btn-ghost'}
                onClick={() => setTypeFilter(f)}
                style={{ fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase' }}
              >
                {f === 'all' ? 'Todas' : f}
              </button>
            ))}
          </div>
          <button type="button" className="btn-secondary" onClick={() => setCatalogOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem' }}>
            <Plus size={13} /> Aprender do catálogo
          </button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="Nenhuma habilidade"
            description="Adicione habilidades do catálogo de Eco. São poderes limitados de humanos alterados — não magia."
          />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '0.75rem',
          }}>
            {filtered.map(runtime => (
              <SkillCard
                key={runtime.instance.id}
                runtime={runtime}
                onActivate={onActivate}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={catalogOpen} onClose={() => setCatalogOpen(false)} title="Catálogo de Eco" maxWidth="560px">
        <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '1rem', lineHeight: 1.5 }}>
          Habilidades pé no chão para ruptura humana. Escolha com critério — cada uma carrega peso narrativo.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
          {catalogAvailable.length === 0 ? (
            <p style={{ color: '#444', fontSize: '0.8rem' }}>Todas as habilidades do catálogo já foram aprendidas.</p>
          ) : (
            catalogAvailable.map(skill => (
              <button
                key={skill.templateId}
                type="button"
                onClick={() => {
                  onLearnSkill?.(skill.templateId)
                  setCatalogOpen(false)
                }}
                style={{
                  textAlign: 'left',
                  background: '#111',
                  border: '1px solid #1a1a1a',
                  borderRadius: '3px',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  color: '#ccc',
                }}
              >
                <div style={{ fontWeight: 600, color: '#e5e5e5', marginBottom: '4px' }}>{skill.name}</div>
                <div style={{ fontSize: '0.65rem', color: '#555', fontFamily: 'monospace' }}>
                  {skill.skillType.toUpperCase()} · CD {skill.cooldownTurns || '—'}
                </div>
              </button>
            ))
          )}
        </div>
      </Modal>
    </div>
  )
}
