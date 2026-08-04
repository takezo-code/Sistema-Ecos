import React from 'react'
import { Field, Input, Textarea, Select } from '../ui/Field'
import { ImageUpload } from '../ui/ImageUpload'
import { getForgeableArmorTypes } from '../../mechanics/equipment/characterGear'

/**
 * Forja inicial: arma livre (nome, o que é, descrição, arte) e armadura com tipo mecânico.
 */
export function StarterGearSection({
  weapon,
  armor,
  onChangeWeapon,
  onChangeArmor,
  subtitle = 'Esta arma e esta armadura acompanham a ficha.',
}) {
  const armorTypes = getForgeableArmorTypes()
  const armorType = armorTypes.find(t => t.id === armor.type) ?? armorTypes[0]

  return (
    <>
      <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
        EQUIPAMENTO INICIAL
      </div>
      {subtitle && (
        <p style={{ fontSize: '0.72rem', color: '#666', margin: '0 0 0.75rem', lineHeight: 1.45 }}>
          {subtitle}
        </p>
      )}

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        padding: '0.75rem',
        background: '#0d0d0d',
        border: '1px solid #1a1a1a',
        borderRadius: '3px',
        marginBottom: '0.75rem',
      }}>
        <div style={{ fontSize: '0.55rem', color: '#f97316', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
          ARMA
        </div>
        <Field label="Nome" required>
          <Input
            value={weapon.name}
            onChange={e => onChangeWeapon({ ...weapon, name: e.target.value })}
            placeholder="Ex.: Lâmina do Eco"
          />
        </Field>
        <Field label="O que é a arma">
          <Input
            value={weapon.kind || ''}
            onChange={e => onChangeWeapon({ ...weapon, kind: e.target.value })}
            placeholder="Ex.: rifle de precisão, katana quebrada, orbe de vidro…"
          />
        </Field>
        <Field label="Descrição">
          <Textarea
            rows={3}
            value={weapon.description || ''}
            onChange={e => onChangeWeapon({ ...weapon, description: e.target.value })}
            placeholder="Como parece, de onde veio, como é usada…"
          />
        </Field>
        <ImageUpload
          value={weapon.image || ''}
          onChange={img => onChangeWeapon({ ...weapon, image: img })}
          label="Arte da arma"
          outputSize={256}
        />
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        padding: '0.75rem',
        background: '#0d0d0d',
        border: '1px solid #1a1a1a',
        borderRadius: '3px',
      }}>
        <div style={{ fontSize: '0.55rem', color: '#94a3b8', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
          ARMADURA
        </div>
        <Field label="Nome">
          <Input
            value={armor.name}
            onChange={e => onChangeArmor({ ...armor, name: e.target.value })}
            placeholder={armorType ? armorType.label : 'Nome da armadura'}
          />
        </Field>
        <Field label="Tipo">
          <Select
            value={armorType?.id ?? ''}
            onChange={e => onChangeArmor({ ...armor, type: e.target.value })}
          >
            {armorTypes.map(t => (
              <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
            ))}
          </Select>
        </Field>
      </div>
    </>
  )
}
