import React, { useState } from 'react'
import { Shield, Trash2 } from 'lucide-react'
import { Input, Select } from '../ui/Field'
import {
  WEAPON_TYPES, ARMOR_TYPES,
  getWeaponType, getArmorType, isWeaponProficientForClass,
} from '../../constants/equipmentTypes'
import { getWeaponProficiencySummary } from '../../mechanics/equipment/weaponProficiencyEngine'
import { getArmorEffects } from '../../mechanics/equipment/armorEffectsEngine'

export function EquippedSection({ entity, onAddItem, onRemoveItem }) {
  const [newItem, setNewItem] = useState('')
  const [category, setCategory] = useState('arma')
  const [itemType, setItemType] = useState(WEAPON_TYPES[0].id)
  const equipped = entity.equipped || []
  const proficiency = getWeaponProficiencySummary(entity)
  const armorFx = getArmorEffects(entity)
  const typeOptions = category === 'arma' ? WEAPON_TYPES : ARMOR_TYPES

  const handleCategoryChange = (next) => {
    setCategory(next)
    setItemType(next === 'arma' ? WEAPON_TYPES[0].id : ARMOR_TYPES[0].id)
  }

  const handleAdd = () => {
    if (!newItem.trim()) return
    onAddItem({
      name: newItem.trim(),
      category,
      type: itemType,
    })
    setNewItem('')
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Shield size={14} style={{ color: '#a855f7' }} />
        <span style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em' }}>ITENS EM USO</span>
      </div>

      {entity.classId && (
        <div style={{
          fontSize: '0.55rem',
          color: proficiency.hasPenalty ? '#dc2626' : '#555',
          fontFamily: 'monospace',
          marginBottom: '0.35rem',
          lineHeight: 1.45,
        }}>
          {proficiency.allowedLabels.length > 0
            ? `Perícia: ${proficiency.allowedLabels.join(' · ')}`
            : 'Sem perícia de arma'}
          {proficiency.hasPenalty && ' · −3 (arma fora da perícia)'}
        </div>
      )}

      {armorFx.markBonus > 0 && (
        <div style={{
          fontSize: '0.55rem',
          color: '#16a34a',
          fontFamily: 'monospace',
          marginBottom: '0.5rem',
        }}>
          Armadura: −{armorFx.penaltyDestreza} DES · +{armorFx.markBonus} limiar de marcas
          {armorFx.typeMeta ? ` (${armorFx.typeMeta.label})` : ''}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.5rem' }}>
        {['arma', 'armadura'].map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => handleCategoryChange(cat)}
            style={{
              padding: '2px 8px',
              fontSize: '0.55rem',
              fontFamily: 'monospace',
              borderRadius: '3px',
              cursor: 'pointer',
              border: `1px solid ${category === cat ? '#a855f7' : '#2a2a2a'}`,
              background: category === cat ? 'rgba(168,85,247,0.12)' : 'transparent',
              color: category === cat ? '#a855f7' : '#555',
            }}
          >
            {cat === 'arma' ? 'ARMA' : 'ARMADURA'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <Input
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          placeholder={category === 'arma' ? 'Nome da arma...' : 'Nome da armadura...'}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          style={{ flex: '1 1 140px' }}
        />
        <Select
          value={itemType}
          onChange={e => setItemType(e.target.value)}
          style={{ flex: '0 1 160px', fontSize: '0.75rem' }}
        >
          {typeOptions.map(t => (
            <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
          ))}
        </Select>
        <button type="button" className="btn-secondary" onClick={handleAdd} style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
          Equipar
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {equipped.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#333', fontSize: '0.775rem', padding: '1rem', border: '1px dashed #1a1a1a', borderRadius: '4px' }}>
            Nenhum item equipado
          </div>
        ) : (
          equipped.map(item => {
            const isArmor = item.category === 'armadura' || (!!getArmorType(item.type) && !getWeaponType(item.type))
            const typeMeta = isArmor ? getArmorType(item.type) : getWeaponType(item.type)
            const ok = isArmor || !entity.classId || !item.type || isWeaponProficientForClass(entity.classId, item.type)
            return (
              <div key={item.id} style={{
                background: '#0d0d0d',
                border: `1px solid ${ok ? 'rgba(168,85,247,0.15)' : 'rgba(220,38,38,0.35)'}`,
                borderRadius: '3px',
                padding: '0.5rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', color: '#ccc' }}>{item.name}</div>
                  {typeMeta && (
                    <div style={{ fontSize: '0.5rem', color: ok ? typeMeta.color : '#dc2626', fontFamily: 'monospace', marginTop: '2px' }}>
                      {typeMeta.label}
                      {isArmor && typeMeta.markBonus != null && (
                        <> · −{typeMeta.penaltyDestreza} DES · +{typeMeta.markBonus} marcas</>
                      )}
                      {!isArmor && !ok && ' · sem perícia (−3)'}
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => onRemoveItem(item.id)}
                  style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '2px', display: 'flex', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                  onMouseLeave={e => e.currentTarget.style.color = '#333'}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
