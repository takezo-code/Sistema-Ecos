import React from 'react'
import { CHARACTER_CLASSES, getAttributeLabel } from '../../constants/classes'

export function ClassPicker({ value, onChange }) {
  return (
    <div>
      <div style={{
        fontSize: '0.65rem',
        color: '#444',
        fontFamily: 'monospace',
        letterSpacing: '0.1em',
        marginBottom: '0.5rem',
      }}>
        CLASSE
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '0.5rem',
      }}>
        {CHARACTER_CLASSES.map(cls => {
          const selected = value === cls.id
          return (
            <button
              key={cls.id}
              type="button"
              onClick={() => onChange(selected ? null : cls.id)}
              title={cls.description}
              style={{
                background: selected ? `${cls.color}14` : '#0d0d0d',
                border: `1px solid ${selected ? cls.color : '#1a1a1a'}`,
                borderRadius: '3px',
                padding: '0.6rem 0.7rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                if (!selected) e.currentTarget.style.borderColor = `${cls.color}55`
              }}
              onMouseLeave={e => {
                if (!selected) e.currentTarget.style.borderColor = '#1a1a1a'
              }}
            >
              <div style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: selected ? cls.color : '#ccc',
                marginBottom: '3px',
              }}>
                {cls.label}
              </div>
              <div style={{
                fontSize: '0.55rem',
                color: selected ? '#888' : '#444',
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
              }}>
                {cls.attributes.map(getAttributeLabel).join(' · ')}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
