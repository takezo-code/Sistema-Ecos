import React from 'react'
import { Modal } from '../ui/Modal'
import { EntityThumb } from '../ui/EntityThumb'
import {
  getArmorType,
} from '../../constants/equipmentTypes'
import { GEAR_CATEGORIES, getWeaponKindLabel } from '../../mechanics/equipment/characterGear'
import {
  formatPassive,
  getItemPassivesAligned,
} from '../../mechanics/equipment/gearPassiveEngine'
import {
  getArmorTier,
} from '../../mechanics/equipment/armorProgressionEngine'
import { getWeaponSkill } from '../../mechanics/equipment/weaponProgressionEngine'

function DetailRow({ label, children, color = '#888' }) {
  if (!children) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <div style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: '#444', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.75rem', color, lineHeight: 1.45 }}>{children}</div>
    </div>
  )
}

function WeaponDetailBody({ weapon }) {
  const kindLabel = getWeaponKindLabel(weapon)
  const passives = getItemPassivesAligned(GEAR_CATEGORIES.WEAPON, weapon).filter(Boolean)
  const skill = getWeaponSkill(weapon)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        {weapon.image && (
          <EntityThumb src={weapon.image} alt={weapon.name} size={64} borderRadius="4px" />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e5e5e5' }}>{weapon.name}</div>
          {kindLabel && (
            <div style={{
              fontSize: '0.6rem',
              fontFamily: 'monospace',
              color: '#f97316',
              marginTop: '4px',
            }}>
              {kindLabel}
            </div>
          )}
        </div>
      </div>

      {passives.length > 0 && (
        <DetailRow label="ATRIBUTOS DE ITEM" color="#ccc">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontFamily: 'monospace', fontSize: '0.7rem' }}>
            {passives.map((p, i) => (
              <span key={i}>{formatPassive(p)}</span>
            ))}
          </div>
        </DetailRow>
      )}

      {skill && (
        <DetailRow label="SKILL DA ARMA" color="#e5e5e5">
          <div>
            <div style={{ fontWeight: 700 }}>{skill.name}</div>
            {skill.mechanicalEffect && (
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.7rem', color: '#888', lineHeight: 1.45 }}>
                {skill.mechanicalEffect}
              </p>
            )}
            {skill.narrativeConsequence && (
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.65rem', color: '#666', lineHeight: 1.4 }}>
                {skill.narrativeConsequence}
              </p>
            )}
            {(skill.cooldownTurns != null || skill.overloadCost != null) && (
              <div style={{ marginTop: '0.35rem', fontSize: '0.55rem', fontFamily: 'monospace', color: '#555' }}>
                {skill.cooldownTurns != null && `CD ${skill.cooldownTurns}`}
                {skill.cooldownTurns != null && skill.overloadCost != null && ' · '}
                {skill.overloadCost != null && `${skill.overloadCost} uso(s)`}
              </div>
            )}
          </div>
        </DetailRow>
      )}

      {weapon.description && (
        <DetailRow label="DESCRIÇÃO" color="#888">
          {weapon.description}
        </DetailRow>
      )}
    </div>
  )
}

function ArmorDetailBody({ entity, armor }) {
  const typeMeta = getArmorType(armor.type)
  const tier = getArmorTier(entity)
  const passives = getItemPassivesAligned(GEAR_CATEGORIES.ARMOR, armor).filter(Boolean)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        {armor.image && (
          <EntityThumb src={armor.image} alt={armor.name} size={64} borderRadius="4px" />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e5e5e5' }}>{armor.name}</div>
          <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: tier.color, marginTop: '4px' }}>
            {tier.label.toUpperCase()} · NV {tier.level}
            {typeMeta ? ` · ${typeMeta.icon} ${typeMeta.label}` : ''}
          </div>
        </div>
      </div>

      {passives.length > 0 && (
        <DetailRow label="ATRIBUTOS DE ITEM" color="#ccc">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontFamily: 'monospace', fontSize: '0.7rem' }}>
            {passives.map((p, i) => (
              <span key={i}>{formatPassive(p)}</span>
            ))}
          </div>
        </DetailRow>
      )}

      {armor.description && (
        <DetailRow label="DESCRIÇÃO" color="#888">
          {armor.description}
        </DetailRow>
      )}
    </div>
  )
}

/**
 * Modal de leitura da arma ou armadura.
 * @param {'arma' | 'armadura' | null} kind
 */
export function GearDetailModal({ open, onClose, entity, kind, weapon, armor }) {
  const isArmor = kind === 'armadura'
  const item = isArmor ? armor : weapon
  if (!open || !item) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isArmor ? 'Armadura' : 'Arma'}
      maxWidth="440px"
    >
      {isArmor
        ? <ArmorDetailBody entity={entity} armor={item} />
        : <WeaponDetailBody weapon={item} />}
    </Modal>
  )
}
