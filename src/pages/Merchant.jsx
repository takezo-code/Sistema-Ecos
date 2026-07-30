import React, { useMemo, useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { Select } from '../components/ui/Field'
import { EmptyState } from '../components/ui/EmptyState'
import { useCharacterStore } from '../store/useCharacterStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { filterByActiveCampaign } from '../utils/campaignScope'
import { useCharacterPanelStore } from '../store/useCharacterPanelStore'
import {
  MERCHANT_CATALOG,
  MERCHANT_ITEM_IDS,
  buildMerchantInventoryItem,
  countGradeCatalysts,
} from '../constants/merchantItems'

export function Merchant() {
  const { activeCampaignId } = useCampaignStore()
  const characters = useCharacterStore(s => s.characters)
  const addInventoryItem = useCharacterStore(s => s.addInventoryItem)
  const { selectedCharacterId, selectCharacter } = useCharacterPanelStore()

  const filtered = useMemo(
    () => filterByActiveCampaign(characters, activeCampaignId),
    [characters, activeCampaignId],
  )

  const character = filtered.find(c => c.id === selectedCharacterId) || filtered[0] || null
  const [notice, setNotice] = useState(null)

  const buy = (itemId) => {
    if (!character) return
    const payload = buildMerchantInventoryItem(itemId, 1)
    if (!payload) return
    addInventoryItem(character.id, payload)
    setNotice(`${payload.name} adicionado ao inventário de ${character.name}.`)
  }

  if (!activeCampaignId) {
    return <EmptyState title="Sem campanha" description="Selecione uma campanha ativa." />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '320px' }}>
          <div style={{ fontSize: '0.55rem', color: '#444', fontFamily: 'monospace', marginBottom: '0.35rem' }}>
            COMPRADOR
          </div>
          {filtered.length === 0 ? (
            <div style={{ color: '#555', fontSize: '0.8rem' }}>Nenhum personagem na campanha.</div>
          ) : (
            <Select
              value={character?.id || ''}
              onChange={e => selectCharacter(e.target.value)}
            >
              {filtered.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          )}
        </div>
        {character && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#666', fontFamily: 'monospace' }}>
            Catalisadores na mochila: {countGradeCatalysts(character.inventory)}
          </div>
        )}
        {notice && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#a855f7' }}>{notice}</div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'grid', gap: '0.75rem', maxWidth: '560px' }}>
          {MERCHANT_CATALOG.map(item => (
            <div
              key={item.id}
              style={{
                background: '#0d0d0d',
                border: `1px solid ${item.color}33`,
                borderRadius: '6px',
                padding: '1rem 1.125rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e5e5e5', marginBottom: '0.35rem' }}>
                  {item.name}
                </div>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#777', lineHeight: 1.5 }}>
                  {item.description}
                </p>
                <div style={{ fontSize: '0.6rem', color: item.color, fontFamily: 'monospace' }}>
                  {item.priceLabel}
                </div>
              </div>
              <button
                type="button"
                className="btn-primary"
                disabled={!character}
                onClick={() => buy(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.7rem',
                  flexShrink: 0,
                  background: item.id === MERCHANT_ITEM_IDS.CATALISADOR_GRAU ? '#7c3aed' : undefined,
                }}
              >
                <ShoppingBag size={13} />
                Comprar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
