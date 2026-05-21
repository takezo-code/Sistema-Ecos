function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '255,255,255'
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
}

/**
 * Card de seleção de tipo (Equipamentos, Gerenciamento → Criação, etc.)
 */
export function CreationChoiceCard({ type, disabled, onClick }) {
  const Icon = type.icon
  return (
    <button
      type="button"
      onClick={() => onClick(type.id)}
      disabled={disabled}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '1.25rem',
        background: type.bg,
        border: `1px solid ${type.border}`,
        borderRadius: '6px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        textAlign: 'left',
        width: '100%',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => {
        if (disabled) return
        e.currentTarget.style.borderColor = type.color
        e.currentTarget.style.background = `rgba(${hexToRgb(type.color)}, 0.08)`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = type.border
        e.currentTarget.style.background = type.bg
      }}
    >
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '6px',
        background: `rgba(${hexToRgb(type.color)}, 0.1)`,
        border: `1px solid rgba(${hexToRgb(type.color)}, 0.2)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={18} style={{ color: type.color }} />
      </div>
      <div style={{ minWidth: 0, width: '100%' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e5e5e5', marginBottom: '0.3rem' }}>
          {type.label}
        </div>
        <div style={{ fontSize: '0.7rem', color: '#555', lineHeight: 1.5 }}>
          {type.description}
        </div>
      </div>
    </button>
  )
}
