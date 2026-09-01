import React from 'react'

export function EntityQuickActionTile({ icon: Icon, label, color = '#e5e5e5', onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        width: '100%',
        padding: '0.65rem 0.75rem',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.025)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        textAlign: 'left',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => {
        if (disabled) return
        e.currentTarget.style.borderColor = `${color}55`
        e.currentTarget.style.background = `${color}0d`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
        e.currentTarget.style.background = 'rgba(255,255,255,0.025)'
      }}
    >
      <span style={{
        width: 32,
        height: 32,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        background: `${color}14`,
        border: `1px solid ${color}33`,
        color,
      }}>
        <Icon size={15} strokeWidth={2.1} />
      </span>
      <span style={{ fontSize: '0.78rem', fontWeight: 650, color: '#ececec', lineHeight: 1.2, minWidth: 0 }}>
        {label}
      </span>
    </button>
  )
}
