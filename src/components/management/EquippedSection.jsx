import React from 'react'
import { Shield } from 'lucide-react'
import {
  getWeaponType, getArmorType, isWeaponProficientForClass,
} from '../../constants/equipmentTypes'
import { getWeaponProficiencySummary } from '../../mechanics/equipment/weaponProficiencyEngine'
import { getArmorEffects } from '../../mechanics/equipment/armorEffectsEngine'
import { getArmorTier } from '../../mechanics/equipment/armorProgressionEngine'
import { formatPassive, getItemPassivesAligned } from '../../mechanics/equipment/gearPassiveEngine'
import { GEAR_CATEGORIES } from '../../mechanics/equipment/characterGear'
import { getWeaponSkill } from '../../mechanics/equipment/weaponProgressionEngine'

/**
 * Leitura do equipamento pessoal. Edição fica na aba Equipamento.
 */
export function EquippedSection({ entity }) {
  const equipped = entity.equipped || []
  const proficiency = getWeaponProficiencySummary(entity)
  const armorFx = getArmorEffects(entity)
  const armorTier = getArmorTier(entity)

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
          {armorFx.typeMeta ? ` (${armorFx.typeMeta.label}` : ''}
          {armorTier ? ` · ${armorTier.label}` : ''}
          {armorFx.typeMeta ? ')' : ''}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.75rem' }}>
        {equipped.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#333', fontSize: '0.775rem', padding: '1rem', border: '1px dashed #1a1a1a', borderRadius: '4px' }}>
            Nenhum equipamento forjado — use Equipamento
          </div>
        ) : (
          equipped.map(item => {
            const isArmor = item.category === 'armadura' || (!!getArmorType(item.type) && !getWeaponType(item.type))
            const typeMeta = isArmor ? getArmorType(item.type) : getWeaponType(item.type)
            const ok = isArmor || !entity.classId || !item.type || isWeaponProficientForClass(entity.classId, item.type)
            const category = isArmor ? GEAR_CATEGORIES.ARMOR : GEAR_CATEGORIES.WEAPON
            const passives = getItemPassivesAligned(category, item).filter(Boolean)
            const weaponSkill = !isArmor ? getWeaponSkill(item) : null
            return (
              <div key={item.id} style={{
                background: '#0d0d0d',
                border: `1px solid ${ok ? 'rgba(168,85,247,0.15)' : 'rgba(220,38,38,0.35)'}`,
                borderRadius: '3px',
                padding: '0.5rem 0.75rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                  {isArmor && (
                    <span style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: armorTier.color, flexShrink: 0 }}>
                      {armorTier.label.toUpperCase()}
                    </span>
                  )}
                </div>
                {passives.length > 0 && (
                  <div style={{ marginTop: '0.35rem', fontSize: '0.55rem', fontFamily: 'monospace', color: '#666' }}>
                    {passives.map((p, i) => (
                      <div key={i}>{formatPassive(p)}</div>
                    ))}
                  </div>
                )}
                {weaponSkill && (
                  <div style={{ marginTop: '0.35rem', fontSize: '0.55rem', fontFamily: 'monospace', color: '#f97316' }}>
                    Skill: {weaponSkill.name}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
