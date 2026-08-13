import React from 'react'
import { Circle, Loader, CheckCheck } from 'lucide-react'
import SpotlightCard from '../react-bits/SpotlightCard'

const FLOW_STATUSES = [
  {
    value: 'não iniciado',
    label: 'Não Iniciado',
    icon: Circle,
    color: '#a1a1aa',
    spotlight: 'rgba(161,161,170,0.14)',
  },
  {
    value: 'em andamento',
    label: 'Em Andamento',
    icon: Loader,
    color: '#22d3ee',
    spotlight: 'rgba(6,182,212,0.18)',
  },
  {
    value: 'concluído',
    label: 'Concluído',
    icon: CheckCheck,
    color: '#4ade80',
    spotlight: 'rgba(22,163,74,0.18)',
  },
]

/**
 * Seletor de status visual (substitui <select> nativo genérico).
 */
export function StatusPicker({ value, onChange, options = FLOW_STATUSES }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '0.5rem',
    }}>
      {options.map(opt => {
        const Icon = opt.icon
        const selected = value === opt.value
        return (
          <SpotlightCard
            key={opt.value}
            onClick={() => onChange?.(opt.value)}
            spotlightColor={opt.spotlight}
            style={{
              padding: '0.75rem 0.85rem',
              cursor: 'pointer',
              borderColor: selected ? `${opt.color}55` : undefined,
              boxShadow: selected
                ? `inset 0 0 0 1px ${opt.color}40, 0 0 18px ${opt.color}18`
                : undefined,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: selected ? `${opt.color}22` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${selected ? `${opt.color}55` : 'rgba(255,255,255,0.08)'}`,
                flexShrink: 0,
              }}>
                <Icon size={14} style={{ color: selected ? opt.color : '#666' }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: '0.78rem',
                  fontWeight: selected ? 700 : 500,
                  color: selected ? opt.color : '#c4c4c4',
                  lineHeight: 1.2,
                }}>
                  {opt.label}
                </div>
                {selected && (
                  <div style={{
                    fontSize: '0.58rem',
                    color: '#666',
                    fontFamily: 'monospace',
                    letterSpacing: '0.08em',
                    marginTop: 2,
                  }}>
                    SELECIONADO
                  </div>
                )}
              </div>
            </div>
          </SpotlightCard>
        )
      })}
    </div>
  )
}

export { FLOW_STATUSES }
