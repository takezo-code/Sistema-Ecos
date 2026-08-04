import React from 'react'
import { Modal } from '../ui/Modal'
import { EntityThumb } from '../ui/EntityThumb'
import { NarrativeProfileView } from './NarrativeProfileView'
import { resolveCharacterNarrative, resolveNpcNarrative } from '../../utils/entityNarrative'
import { isNpcEntity } from '../../constants/entityProgression'

export function NarrativeProfileModal({ open, onClose, entity }) {
  if (!entity) return null

  const isNpc = isNpcEntity(entity)
  const narrative = isNpc ? resolveNpcNarrative(entity) : resolveCharacterNarrative(entity)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Perfil narrativo"
      maxWidth="520px"
    >
      <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <EntityThumb src={entity.image} alt={entity.name} size={52} borderRadius="4px" />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e5e5e5' }}>{entity.name}</div>
          <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', marginTop: '4px' }}>
            {isNpc ? 'NPC' : 'PERSONAGEM'}
          </div>
        </div>
      </div>
      <NarrativeProfileView narrative={narrative} variant={isNpc ? 'npc' : 'character'} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
        <button type="button" className="btn-ghost" onClick={onClose}>Fechar</button>
      </div>
    </Modal>
  )
}
