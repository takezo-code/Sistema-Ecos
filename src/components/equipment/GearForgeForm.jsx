import React, { useState } from 'react'
import { Field, Input, Select } from '../ui/Field'
import { ImageUpload } from '../ui/ImageUpload'
import {
  GEAR_CATEGORIES,
  getForgeableArmorTypes,
} from '../../mechanics/equipment/characterGear'
import { Button } from '../ui/Button'

/**
 * Edição da peça pessoal na ficha.
 * Arma: nome e foto. Armadura: só tipo (nome derivado do tipo).
 */
export function GearForgeForm({ category, initial, onSave, onCancel }) {
  const isArmor = category === GEAR_CATEGORIES.ARMOR
  const armorTypes = getForgeableArmorTypes()

  const [form, setForm] = useState({
    name: initial?.name ?? '',
    type: initial?.type ?? (isArmor ? armorTypes[0]?.id ?? '' : null),
    image: initial?.image ?? '',
  })

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isArmor) {
      onSave({
        type: form.type,
        image: form.image,
      })
      return
    }
    if (!form.name.trim()) return
    onSave({
      name: form.name.trim(),
      type: null,
      image: form.image,
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {isArmor ? (
        <Field label="Tipo de armadura" required>
          <Select value={form.type} onChange={e => set('type', e.target.value)}>
            {armorTypes.map(t => (
              <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
            ))}
          </Select>
        </Field>
      ) : (
        <>
          <Field label="Nome" required>
            <Input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Ex.: Lâmina do Eco"
              autoFocus
            />
          </Field>
          <ImageUpload
            value={form.image}
            onChange={img => set('image', img)}
            label="Foto da arma"
            outputSize={256}
          />
        </>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        {onCancel && (
          <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        )}
        <Button type="submit" disabled={!isArmor && !form.name.trim()}>
          {initial ? 'Salvar' : 'Forjar'}
        </Button>
      </div>
    </form>
  )
}
