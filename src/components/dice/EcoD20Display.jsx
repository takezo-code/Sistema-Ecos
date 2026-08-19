import React from 'react'

export function EcoD20Display({ value, isRolling, subtitle = 'D20 · ECO' }) {
  return (
    <div className="eco-d20-shell" aria-live="polite">
      <div className={`eco-d20-aura ${isRolling ? 'is-rolling' : ''}`} />
      <div className={`eco-d20-core ${isRolling ? 'is-rolling' : ''}`}>
        <div className="eco-d20-facet" />
        <div className="eco-d20-value">{value ?? '?'}</div>
      </div>
      <div className="eco-d20-subtitle">{subtitle}</div>
    </div>
  )
}

