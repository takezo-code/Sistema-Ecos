import React from 'react'
import { Heart } from 'lucide-react'
import { CONDITION_OPTIONS } from '../../constants/attributes'

export function ConditionSection({ condition, onChange }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <Heart size={14} style={{ color: '#dc2626' }} />
        <span style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em' }}>CONDIÇÃO</span>
      </div>
      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
        {CONDITION_OPTIONS.map(opt => {
          const active = condition === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.7rem',
                fontWeight: active ? 600 : 400,
                background: active ? `${opt.color}15` : 'transparent',
                border: `1px solid ${active ? opt.color : '#1a1a1a'}`,
                borderRadius: '3px',
                color: active ? opt.color : '#555',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
