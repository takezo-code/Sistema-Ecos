import React, { useState } from 'react'
import { Sword, Package } from 'lucide-react'
import { EntityThumb } from '../components/ui/EntityThumb'
import { useCharacterStore } from '../store/useCharacterStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { CharacterFichaSheet } from '../components/character/CharacterFichaSheet'
import { useCharacterManagementPanel } from '../hooks/useCharacterManagementPanel'
import { ATTRIBUTES } from '../constants/attributes'
import { getCharacterClass } from '../constants/classes'
import { filterByActiveCampaign } from '../utils/campaignScope'
import { getEntityEffectiveAttributes } from '../services/stateModifiers'
import SpotlightCard from '../components/react-bits/SpotlightCard'
import GlassSurface from '../components/react-bits/GlassSurface'

function CharacterManageCard({ character, onManage }) {
  const { effective: attrs, base } = getEntityEffectiveAttributes(character)
  const charClass = getCharacterClass(character)
  const inventoryCount = character.inventory?.length || 0

  return (
    <SpotlightCard
      onClick={onManage}
      spotlightColor={charClass?.color ? `${charClass.color}33` : 'rgba(168, 85, 247, 0.2)'}
      style={{
        padding: 0,
        cursor: 'pointer',
        borderLeft: `3px solid ${charClass?.color || '#a855f7'}`,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        padding: '1.1rem 1.2rem 0.85rem',
      }}>
        <div style={{ display: 'flex', gap: '0.9rem', flex: 1, minWidth: 0 }}>
          <EntityThumb
            src={character.image}
            alt={character.name}
            size={64}
            borderRadius="12px"
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#f5f5f5',
              letterSpacing: '-0.02em',
            }}>
              {character.name}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
        gap: '0.45rem',
        padding: '0 1.1rem 1rem',
      }}>
        {ATTRIBUTES.map(attr => {
          const eff = attrs[attr.key] || 0
          const raw = base?.[attr.key] || 0
          const reduced = eff < raw
          const color = eff > 0 ? (reduced ? '#ea580c' : attr.color) : '#555'
          return (
            <GlassSurface
              key={attr.key}
              borderRadius={10}
              padding="0.55rem 0.35rem"
              style={{ textAlign: 'center' }}
            >
              <div style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color,
                lineHeight: 1,
                textShadow: eff > 0 ? `0 0 18px ${color}55` : 'none',
              }}>
                {eff}
              </div>
              <div style={{
                fontSize: '0.58rem',
                color: '#777',
                fontFamily: 'monospace',
                letterSpacing: '0.08em',
                marginTop: 5,
              }}>
                {attr.label.slice(0, 3).toUpperCase()}
              </div>
            </GlassSurface>
          )
        })}
      </div>

      {inventoryCount > 0 && (
        <div style={{
          padding: '0.55rem 1.2rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
        }}>
          <Package size={12} style={{ color: '#666' }} />
          <span style={{ fontSize: '0.65rem', color: '#777', fontFamily: 'monospace', letterSpacing: '0.06em' }}>
            MOCHILA · {inventoryCount} {inventoryCount === 1 ? 'ITEM' : 'ITENS'}
          </span>
        </div>
      )}
    </SpotlightCard>
  )
}

export function ManageCharacters({ embedded: _embedded = false }) {
  const { activeCampaignId } = useCampaignStore()
  const { characters } = useCharacterStore()
  const [managingId, setManagingId] = useState(null)
  const filtered = filterByActiveCampaign(characters, activeCampaignId)
  const { entity: current, clearPanelSession } = useCharacterManagementPanel(managingId, { adminMode: true })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Sword}
            title="Nenhum personagem para gerenciar"
            description="Crie personagens em Criação na sidebar para gerenciar status, nível e mochila aqui."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '720px' }}>
            {filtered.map(c => (
              <CharacterManageCard
                key={c.id}
                character={c}
                onManage={() => setManagingId(c.id)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={!!current}
        onClose={() => { setManagingId(null); clearPanelSession() }}
        title={`Gerenciar — ${current?.name}`}
        maxWidth="720px"
      >
        {managingId && <CharacterFichaSheet characterId={managingId} adminMode />}
      </Modal>

    </div>
  )
}
