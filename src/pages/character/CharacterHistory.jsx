import React from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState } from '../../components/ui/EmptyState'

export function CharacterHistory({ character }) {
  const history = [...(character.ecoSkillHistory || [])].reverse()

  return (
    <div style={{ padding: '1rem 1.5rem', overflowY: 'auto', height: '100%' }}>
      <PageHeader title="Histórico" subtitle="Ativações e consequências registradas" />
      {history.length === 0 ? (
        <EmptyState title="Sem registros" description="O uso de habilidades de Eco aparecerá aqui." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '640px' }}>
          {history.map(entry => (
            <div
              key={entry.id}
              style={{
                background: '#111',
                border: '1px solid #1a1a1a',
                borderRadius: '3px',
                padding: '0.75rem 1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#e5e5e5', fontSize: '0.85rem' }}>{entry.skillName}</span>
                <span style={{ fontSize: '0.6rem', color: '#444', fontFamily: 'monospace' }}>
                  T{entry.turn ?? '?'} · {entry.overloadAfter ?? 0}/5
                </span>
              </div>
              {entry.narrativeConsequence && (
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#666', lineHeight: 1.5 }}>{entry.narrativeConsequence}</p>
              )}
            </div>
          ))}
        </div>
      )}
      {character.lastRuptureTotalEvent && (
        <div style={{ marginTop: '1.5rem', maxWidth: '640px' }}>
          <div style={{ fontSize: '0.6rem', color: '#dc2626', fontFamily: 'monospace', marginBottom: '0.5rem' }}>ÚLTIMA RUPTURA TOTAL</div>
          <div style={{ background: 'rgba(153,27,27,0.08)', border: '1px solid rgba(153,27,27,0.25)', padding: '0.75rem', borderRadius: '3px' }}>
            <strong style={{ color: '#dc2626' }}>{character.lastRuptureTotalEvent.outcome?.label}</strong>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#888' }}>
              {character.lastRuptureTotalEvent.outcome?.description}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
