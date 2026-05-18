import React from 'react'

export function PageHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid #1a1a1a',
        minHeight: '64px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {Icon && (
          <div style={{ color: '#dc2626', display: 'flex', alignItems: 'center' }}>
            <Icon size={18} />
          </div>
        )}
        <div>
          <h1 style={{ fontSize: '1rem', fontWeight: 600, color: '#e5e5e5', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {title}
          </h1>
          {subtitle && (
            <div style={{ fontSize: '0.65rem', color: '#333', fontFamily: 'monospace', letterSpacing: '0.08em', marginTop: '2px' }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {action && <div style={{ display: 'flex', gap: '0.5rem' }}>{action}</div>}
    </div>
  )
}
