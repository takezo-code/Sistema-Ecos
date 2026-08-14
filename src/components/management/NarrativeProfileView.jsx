import React from 'react'
import { BookOpen } from 'lucide-react'
import GlassSurface from '../react-bits/GlassSurface'

function NarrativeBlock({ label, text, color = '#888' }) {
  if (!text?.trim()) return null
  return (
    <GlassSurface borderRadius={12} padding="0.8rem 0.9rem">
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: '0.55rem',
        color,
        fontFamily: 'monospace',
        letterSpacing: '0.1em',
        marginBottom: 8,
        textTransform: 'uppercase',
      }}>
        <span style={{
          width: 5,
          height: 5,
          borderRadius: 999,
          background: color,
          boxShadow: `0 0 8px ${color}`,
        }} />
        {label}
      </div>
      <p style={{
        fontSize: '0.8rem',
        color: '#c4c4c4',
        lineHeight: 1.65,
        margin: 0,
        whiteSpace: 'pre-wrap',
      }}>
        {text}
      </p>
    </GlassSurface>
  )
}

export function NarrativeProfileView({ narrative, variant = 'character' }) {
  const isNpc = variant === 'npc'
  const hasContent = Object.values(narrative).some(v => v?.trim())

  if (!hasContent) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.55rem',
        padding: '2rem 1.25rem',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.018)',
        textAlign: 'center',
      }}>
        <BookOpen size={22} style={{ color: '#555' }} />
        <div style={{ fontSize: '0.82rem', color: '#b0b0b0', fontWeight: 600 }}>
          Perfil vazio
        </div>
        <div style={{ fontSize: '0.72rem', color: '#666', lineHeight: 1.55, maxWidth: 280 }}>
          Use <span style={{ color: '#999' }}>Editar ficha</span> para preencher aparência, história e motivações.
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
        <NarrativeBlock label="Aparência" text={narrative.appearance} color="#a78bfa" />
        <NarrativeBlock label="Personalidade" text={narrative.personality} color="#eab308" />
      </div>
      <NarrativeBlock label="História" text={narrative.history} color="#94a3b8" />
      <NarrativeBlock label="Motivações" text={narrative.motivation} color="#06b6d4" />
      {isNpc && (
        <NarrativeBlock label="Segredos" text={narrative.secret} color="#f87171" />
      )}
    </div>
  )
}
