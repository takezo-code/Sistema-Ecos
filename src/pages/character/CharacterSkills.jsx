import React, { useMemo } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { SkillCard } from '../../components/skills/SkillCard'
import { ClassSkillBook } from '../../components/skills/ClassSkillBook'
import { TurnControlBar } from '../../components/skills/TurnControlBar'
import { listCharacterSkillsRuntime } from '../../services/ecoSkillRuntimeService'

export function CharacterSkills({
  character,
  onActivate,
  onAdvanceTurn,
  onRestEco,
  onInvestSkillPoint,
  onUpgradeSkillGrade,
  lastSkillError,
  onClearSkillError,
  lastOverloadEvents,
}) {
  const runtimes = useMemo(
    () => listCharacterSkillsRuntime(character).filter(r => (r.instance?.tier ?? 0) > 0),
    [character],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        title="Habilidades"
        subtitle="3 skills de classe + 1 da arma · 9 Ecos no nv.15 maxam tudo"
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
        <TurnControlBar
          currentTurn={character.currentTurn}
          ecoOverload={character.ecoOverload}
          entity={character}
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

        <div style={{ marginBottom: '1.25rem' }}>
          <ClassSkillBook
            entity={character}
            onInvestPoint={onInvestSkillPoint}
            onUpgradeGrade={onUpgradeSkillGrade}
            onActivate={onActivate}
          />
        </div>

        {runtimes.length > 0 && (
          <>
            <div style={{
              fontSize: '0.6rem',
              color: '#444',
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
              marginBottom: '0.65rem',
            }}>
              PRONTAS PARA ATIVAR
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '0.75rem',
            }}>
              {runtimes.map(runtime => (
                <SkillCard
                  key={runtime.instance.id}
                  runtime={runtime}
                  onActivate={onActivate}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
