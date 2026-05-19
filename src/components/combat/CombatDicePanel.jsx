import React, { useState } from 'react'
import { Dices } from 'lucide-react'

const DICE = [
  { sides: 4, color: '#a855f7' },
  { sides: 6, color: '#06b6d4' },
  { sides: 8, color: '#16a34a' },
  { sides: 10, color: '#d97706' },
  { sides: 12, color: '#dc2626' },
  { sides: 20, color: '#e5e5e5' },
]

export function CombatDicePanel({ lastRoll, onRoll }) {
  const [diceType, setDiceType] = useState(20)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Dices size={18} style={{ color: '#dc2626' }} />
        <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#666', letterSpacing: '0.12em' }}>
          DADOS
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
        {DICE.map(d => (
          <button
            key={d.sides}
            type="button"
            onClick={() => setDiceType(d.sides)}
            style={{
              aspectRatio: '1',
              background: diceType === d.sides ? `${d.color}22` : '#111',
              border: `2px solid ${diceType === d.sides ? d.color : '#1a1a1a'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: d.color }}>d{d.sides}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        className="btn-primary"
        onClick={() => onRoll?.(diceType)}
        style={{ width: '100%', padding: '0.875rem', fontSize: '0.85rem' }}
      >
        ROLAR d{diceType}
      </button>

      {lastRoll && (
        <div style={{
          padding: '1rem',
          background: '#111',
          border: '1px solid #1a1a1a',
          borderRadius: '6px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.55rem', color: '#444', fontFamily: 'monospace', marginBottom: '0.35rem' }}>
            ÚLTIMO RESULTADO
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#dc2626', lineHeight: 1 }}>
            {lastRoll.result}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.35rem' }}>
            d{lastRoll.sides}
            {lastRoll.label && ` · ${lastRoll.label}`}
            {lastRoll.modifier != null && lastRoll.modifier !== 0 && (
              <span> ({lastRoll.modifier > 0 ? '+' : ''}{lastRoll.modifier})</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
