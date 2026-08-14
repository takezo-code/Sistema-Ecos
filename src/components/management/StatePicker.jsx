import React from 'react'

export function StatePicker({ title, icon: Icon, options, value, onChange, iconColor = '#666' }) {
  const activeOpt = options.find(o => o.value === value)

  return (
    <div>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          {Icon && <Icon size={14} style={{ color: iconColor }} />}
          <span style={{ fontSize: '0.65rem', color: '#888', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
            {title}
          </span>
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
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
                padding: '0.32rem 0.7rem',
                fontSize: '0.66rem',
                fontWeight: active ? 700 : 500,
                background: active ? `${opt.color}1f` : 'transparent',
                border: `1px solid ${active ? `${opt.color}88` : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 999,
                color: active ? opt.color : '#7a7a7a',
                cursor: 'pointer',
                transition: 'color 0.15s, background 0.15s, border-color 0.15s',
                boxShadow: active ? `0 0 14px ${opt.color}26` : 'none',
                textShadow: glitch ? `0 0 8px ${opt.color}` : 'none',
                letterSpacing: glitch ? '0.04em' : 'normal',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#c9c9c9' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#7a7a7a' }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      {(activeOpt?.noteLines || []).length > 0 && (
        <div style={{
          fontSize: '0.65rem',
          color: '#555',
          marginTop: '0.4rem',
          lineHeight: 1.5,
          fontStyle: 'italic',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {activeOpt.noteLines.map(line => (
            <span key={line}>{line}</span>
          ))}
        </div>
      )}
    </div>
  )
}
