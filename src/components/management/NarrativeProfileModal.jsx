import React from 'react'
import { Modal } from '../ui/Modal'
import { EntityThumb } from '../ui/EntityThumb'
import { ClassIcon } from '../ui/ClassIcon'
import { NarrativeProfileView } from './NarrativeProfileView'
import { Button } from '../ui/Button'
import { resolveCharacterNarrative, resolveNpcNarrative } from '../../utils/entityNarrative'
import { isNpcEntity } from '../../constants/entityProgression'
import { getCharacterClass } from '../../constants/classes'

export function NarrativeProfileModal({ open, onClose, entity }) {
  if (!entity) return null

  const isNpc = isNpcEntity(entity)
  const narrative = isNpc ? resolveNpcNarrative(entity) : resolveCharacterNarrative(entity)
  const charClass = !isNpc ? getCharacterClass(entity) : null
  const accent = charClass?.color || (isNpc ? '#06b6d4' : '#a855f7')

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Perfil narrativo"
      maxWidth="540px"
    >
      <div style={{
        display: 'flex',
        gap: '0.85rem',
        alignItems: 'center',
        marginBottom: '1rem',
        paddingBottom: '0.9rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          padding: 2,
          borderRadius: 14,
          flexShrink: 0,
          background: `linear-gradient(145deg, ${accent}99, transparent)`,
        }}>
          <EntityThumb src={entity.image} alt={entity.name} size={52} borderRadius="12px" />
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: '1.05rem',
            fontWeight: 750,
            color: '#f2f2f2',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {entity.name}
          </div>
          <div style={{
            marginTop: 6,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            flexWrap: 'wrap',
          }}>
            <span style={{
              fontSize: '0.55rem',
              fontFamily: 'monospace',
              letterSpacing: '0.06em',
              color: accent,
              background: `${accent}14`,
              border: `1px solid ${accent}33`,
              borderRadius: 999,
              padding: '0.14rem 0.45rem',
            }}>
              {isNpc ? 'NPC' : 'PERSONAGEM'}
            </span>
            <span style={{
              fontSize: '0.55rem',
              fontFamily: 'monospace',
              color: '#777',
              letterSpacing: '0.04em',
            }}>
              Nv.{entity.level || 1}
            </span>
            {charClass && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.55rem',
                fontFamily: 'monospace',
                color: accent,
              }}>
                <ClassIcon classIdOrEntity={entity} size={16} />
                {charClass.label}
              </span>
            )}
          </div>
        </div>
      </div>

      <NarrativeProfileView narrative={narrative} variant={isNpc ? 'npc' : 'character'} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.1rem' }}>
        <Button type="button" variant="secondary" size="xs" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </Modal>
  )
}
