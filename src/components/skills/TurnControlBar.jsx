import React from 'react'
import { SkipForward, RotateCcw } from 'lucide-react'
import { formatOverloadDisplay, getEcoSafeLimitFromEntity } from '../../constants/ecoOverload'
import { Button } from '../ui/Button'

export function TurnControlBar({ currentTurn, ecoOverload, entity, onAdvanceTurn, onRestEco }) {
  const limOpts = entity || { safeLimit: getEcoSafeLimitFromEntity(entity) }
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      background: '#111',
      border: '1px solid #1a1a1a',
      borderRadius: '4px',
      marginBottom: '1rem',
    }}>
      <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#666' }}>
        TURNO <span style={{ color: '#e5e5e5', fontWeight: 700 }}>{currentTurn ?? 0}</span>
        <span style={{ color: '#333', margin: '0 0.5rem' }}>·</span>
        SOBRECARGA <span style={{ color: '#a855f7' }}>{formatOverloadDisplay(ecoOverload ?? 0, limOpts)}</span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {onRestEco && (
          <button type="button" className="btn-ghost" onClick={onRestEco} style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <RotateCcw size={12} /> Descansar Eco (Void)
          </button>
        )}
        {onAdvanceTurn && (
          <Button type="button" variant="secondary" size="xs" onClick={onAdvanceTurn} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <SkipForward size={12} /> Avançar turno
          </Button>
        )}
      </div>
    </div>
  )
}
