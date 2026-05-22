import React from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { EntityThumb } from '../../components/ui/EntityThumb'
import { NarrativeProfileView } from '../../components/management/NarrativeProfileView'
import { resolveCharacterNarrative } from '../../utils/entityNarrative'

export function CharacterProfile({ character }) {
  const narrative = resolveCharacterNarrative(character)

  return (
    <div style={{ padding: '1rem 1.5rem', overflowY: 'auto', height: '100%' }}>
      <PageHeader title="Personagem" subtitle="Identidade e narrativa" />
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', maxWidth: '640px' }}>
        <EntityThumb src={character.image} alt={character.name} size={80} borderRadius="4px" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: '#e5e5e5' }}>{character.name}</h2>
          <p style={{ fontSize: '0.65rem', color: '#a855f7', fontFamily: 'monospace', marginBottom: '0.75rem' }}>
            NVL {character.level ?? 1} · {character.ecoPoints ?? 0} Ecos livres
          </p>
          <NarrativeProfileView narrative={narrative} variant="character" />
        </div>
      </div>
    </div>
  )
}
