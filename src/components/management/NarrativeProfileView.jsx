import React from 'react'

function NarrativeBlock({ label, text, color = '#666', borderColor }) {
  if (!text?.trim()) return null
  return (
    <div style={{
      background: '#0d0d0d',
      border: `1px solid ${borderColor || '#1a1a1a'}`,
      borderRadius: '4px',
      padding: '0.85rem 1rem',
    }}>
      <div style={{
        fontSize: '0.6rem',
        color,
        fontFamily: 'monospace',
        letterSpacing: '0.1em',
        marginBottom: '6px',
      }}>
        {label}
      </div>
      <p style={{
        fontSize: '0.8rem',
        color: '#aaa',
        lineHeight: 1.65,
        margin: 0,
        whiteSpace: 'pre-wrap',
      }}>
        {text}
      </p>
    </div>
  )
}

export function NarrativeProfileView({ narrative, variant = 'character' }) {
  const isNpc = variant === 'npc'
  const hasContent = Object.values(narrative).some(v => v?.trim())

  if (!hasContent) {
    return (
      <p style={{ fontSize: '0.8rem', color: '#555', textAlign: 'center', margin: '1.5rem 0', lineHeight: 1.6 }}>
        Nenhum texto de perfil narrativo preenchido.
        <br />
        Use <strong style={{ color: '#888', fontWeight: 600 }}>Editar ficha</strong> para adicionar.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
        <NarrativeBlock label="APARÊNCIA" text={narrative.appearance} color="#a78bfa" />
        <NarrativeBlock label="PERSONALIDADE" text={narrative.personality} color="#eab308" />
      </div>
      <NarrativeBlock label="HISTÓRIA" text={narrative.history} />
      <NarrativeBlock
        label="MOTIVAÇÕES"
        text={narrative.motivation}
        color="#06b6d4"
        borderColor="rgba(6,182,212,0.15)"
      />
      {isNpc && (
        <NarrativeBlock
          label="SEGREDOS"
          text={narrative.secret}
          color="#dc2626"
          borderColor="rgba(220,38,38,0.15)"
        />
      )}
    </div>
  )
}
