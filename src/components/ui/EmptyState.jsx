import React from 'react'
import SpotlightCard from '../react-bits/SpotlightCard'

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <SpotlightCard
      spotlightColor="rgba(37, 99, 235, 0.16)"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 2rem',
        gap: '0.85rem',
        textAlign: 'center',
        maxWidth: 480,
        margin: '2.5rem auto',
        minHeight: 220,
      }}
    >
      {Icon && <Icon size={36} style={{ color: '#555' }} />}
      <div style={{ fontSize: '0.95rem', color: '#c4c4c4', fontWeight: 600 }}>{title}</div>
      {description && (
        <div style={{ fontSize: '0.8rem', color: '#666', maxWidth: '340px', lineHeight: 1.55 }}>
          {description}
        </div>
      )}
      {action && <div style={{ marginTop: '0.65rem' }}>{action}</div>}
    </SpotlightCard>
  )
}
