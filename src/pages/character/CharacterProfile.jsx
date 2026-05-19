import React from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { EntityThumb } from '../../components/ui/EntityThumb'

export function CharacterProfile({ character }) {
  return (
    <div style={{ padding: '1rem 1.5rem', overflowY: 'auto', height: '100%' }}>
      <PageHeader title="Personagem" subtitle="Identidade e narrativa" />
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', maxWidth: '640px' }}>
        <EntityThumb src={character.image} alt={character.name} size={80} borderRadius="4px" />
        <div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: '#e5e5e5' }}>{character.name}</h2>
          <p style={{ fontSize: '0.65rem', color: '#a855f7', fontFamily: 'monospace', marginBottom: '0.75rem' }}>
            NVL {character.level ?? 1} · {character.ecoPoints ?? 0} Ecos livres
          </p>
          {character.description && (
            <p style={{ fontSize: '0.85rem', color: '#888', lineHeight: 1.6 }}>{character.description}</p>
          )}
          {character.narrativeStatus && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#111', border: '1px solid #1a1a1a', borderRadius: '3px' }}>
              <div style={{ fontSize: '0.55rem', color: '#444', fontFamily: 'monospace', marginBottom: '4px' }}>STATUS NARRATIVO</div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa' }}>{character.narrativeStatus}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
