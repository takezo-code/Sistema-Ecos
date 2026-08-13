import React from 'react'
import SpotlightCard from '../react-bits/SpotlightCard'

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <SpotlightCard
      spotlightColor="rgba(37, 99, 235, 0.12)"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        gap: '0.75rem',
        textAlign: 'center',
        maxWidth: 420,
        margin: '2rem auto',
      }}
    >
      {Icon && <Icon size={32} style={{ color: '#3a3a3a' }} />}
      <div style={{ fontSize: '0.875rem', color: '#777', fontWeight: 500 }}>{title}</div>
      {description && (
        <div style={{ fontSize: '0.75rem', color: '#444', maxWidth: '300px', lineHeight: 1.5 }}>
          {description}
        </div>
      )}
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </SpotlightCard>
  )
}
