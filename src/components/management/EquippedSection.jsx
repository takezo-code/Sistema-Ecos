import React, { useState } from 'react'
import { Shirt, Sword } from 'lucide-react'
import { getArmorType } from '../../constants/equipmentTypes'
import {
  getCharacterArmor,
  getCharacterWeapon,
  getWeaponKindLabel,
  GEAR_CATEGORIES,
} from '../../mechanics/equipment/characterGear'
import { getArmorTier } from '../../mechanics/equipment/armorProgressionEngine'
import { formatPassive, getItemPassivesAligned } from '../../mechanics/equipment/gearPassiveEngine'
import { getWeaponSkill } from '../../mechanics/equipment/weaponProgressionEngine'
import { GearDetailModal } from '../equipment/GearDetailModal'

function GearSlotCard({ label, icon: Icon, color, item, emptyHint, onClick }) {
  const typeMeta = item && label === 'Armadura' ? getArmorType(item.type) : null
  const kindLabel = item && label === 'Arma' ? getWeaponKindLabel(item) : null

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!item}
      title={item ? `Ver ${label.toLowerCase()}` : emptyHint}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        width: '100%',
        textAlign: 'left',
        padding: '0.65rem 0.75rem',
        background: '#0d0d0d',
        border: `1px solid ${item ? `${color}44` : '#1a1a1a'}`,
        borderRadius: '4px',
        cursor: item ? 'pointer' : 'default',
        opacity: item ? 1 : 0.55,
      }}
    >
      <div style={{
        width: 40,
        height: 40,
        flexShrink: 0,
        borderRadius: '4px',
        background: '#111',
        border: `1px solid ${item ? `${color}33` : '#1e1e1e'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {item?.image ? (
          <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Icon size={16} style={{ color: item ? color : '#333' }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: '#555', letterSpacing: '0.08em' }}>
          {label.toUpperCase()}
        </div>
        <div style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: item ? '#e5e5e5' : '#444',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {item?.name || '—'}
        </div>
        {typeMeta && (
          <div style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: typeMeta.color || '#666', marginTop: '2px' }}>
            {typeMeta.label}
          </div>
        )}
        {kindLabel && (
          <div style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#666', marginTop: '2px' }}>
            {kindLabel}
          </div>
        )}
        {!kindLabel && item && label === 'Arma' && (() => {
          const skill = getWeaponSkill(item)
          return skill ? (
            <div style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#f97316', marginTop: '2px' }}>
              Skill: {skill.name}
            </div>
          ) : null
        })()}
        {item && label === 'Armadura' && (() => {
          const passives = getItemPassivesAligned(GEAR_CATEGORIES.ARMOR, item).filter(Boolean)
          return passives.length > 0 ? (
            <div style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: '#666', marginTop: '2px' }}>
              {passives.slice(0, 1).map((p, i) => <span key={i}>{formatPassive(p)}</span>)}
            </div>
          ) : null
        })()}
      </div>
    </button>
  )
}

/**
 * Leitura do equipamento. Clique abre detalhe. Edição fica em Equipamento.
 */
export function EquippedSection({ entity }) {
  const [viewing, setViewing] = useState(null)

  const weapon = getCharacterWeapon(entity)
  const armor = getCharacterArmor(entity)
  const armorTier = getArmorTier(entity)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
        <Sword size={14} style={{ color: '#f97316' }} />
        <span style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
          ARMA & ARMADURA
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '0.5rem',
      }}>
        <GearSlotCard
          label="Arma"
          icon={Sword}
          color="#f97316"
          item={weapon}
          emptyHint="Nenhuma arma forjada — use Equipamento"
          onClick={() => weapon && setViewing('arma')}
        />
        <GearSlotCard
          label="Armadura"
          icon={Shirt}
          color={armorTier?.color || '#16a34a'}
          item={armor}
          emptyHint="Nenhuma armadura forjada — use Equipamento"
          onClick={() => armor && setViewing('armadura')}
        />
      </div>

      <GearDetailModal
        open={!!viewing}
        onClose={() => setViewing(null)}
        entity={entity}
        kind={viewing}
        weapon={weapon}
        armor={armor}
      />
    </div>
  )
}
