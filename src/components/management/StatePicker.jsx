import React from 'react'

export function StatePicker({ title, icon: Icon, options, value, onChange, iconColor = '#666' }) {
  const activeOpt = options.find(o => o.value === value)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        {Icon && <Icon size={14} style={{ color: iconColor }} />}
        <span style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
          {title}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
        {options.map(opt => {
          const active = value === opt.value
          const glitch = opt.glitch && active
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              title={opt.note || undefined}
              style={{
                padding: '0.4rem 0.7rem',
                fontSize: '0.68rem',
                fontWeight: active ? 600 : 400,
                background: active
                  ? `linear-gradient(135deg, ${opt.glow || opt.color + '22'}, transparent)`
                  : 'transparent',
                border: `1px solid ${active ? opt.color : '#1a1a1a'}`,
                borderRadius: '3px',
                color: active ? opt.color : '#555',
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: active ? `0 0 12px ${opt.glow || 'transparent'}` : 'none',
                textShadow: glitch ? `0 0 8px ${opt.color}` : 'none',
                letterSpacing: glitch ? '0.04em' : 'normal',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      {activeOpt?.note && (
        <p style={{
          fontSize: '0.65rem',
          color: '#555',
          marginTop: '0.4rem',
          lineHeight: 1.5,
          fontStyle: 'italic',
        }}>
          {activeOpt.note}
        </p>
      )}
    </div>
  )
}
