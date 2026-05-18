import React from 'react'

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        gap: '0.75rem',
        textAlign: 'center',
      }}
    >
      {Icon && <Icon size={32} style={{ color: '#2a2a2a' }} />}
      <div style={{ fontSize: '0.875rem', color: '#444', fontWeight: 500 }}>{title}</div>
      {description && <div style={{ fontSize: '0.75rem', color: '#333', maxWidth: '300px' }}>{description}</div>}
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  )
}
