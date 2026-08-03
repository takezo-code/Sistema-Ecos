import React, { useState } from 'react'
import { Field, Input, Select, Textarea } from '../ui/Field'
import { ImageUpload } from '../ui/ImageUpload'
import {
  GEAR_CATEGORIES,
  getForgeableArmorTypes,
  getForgeableWeaponTypes,
} from '../../mechanics/equipment/characterGear'

/**
 * Forja da peça pessoal: nome, tipo, arte.
 * Armas ficam restritas aos tipos da classe — fora deles a rolagem leva −3.
 */
export function GearForgeForm({ category, classId, initial, onSave, onCancel }) {
  const isArmor = category === GEAR_CATEGORIES.ARMOR
  const typeOptions = isArmor ? getForgeableArmorTypes() : getForgeableWeaponTypes(classId)

  const [form, setForm] = useState({
    name: initial?.name ?? '',
    type: initial?.type ?? typeOptions[0]?.id ?? '',
    image: initial?.image ?? '',
    description: initial?.description ?? '',
  })

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
  const selectedType = typeOptions.find(t => t.id === form.type)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({ ...form, name: form.name.trim() })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Field label="Nome" required>
        <Input
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder={isArmor ? 'Ex.: Casaco de placas' : 'Ex.: Lâmina do Eco'}
          autoFocus
        />
      </Field>

      <Field label={isArmor ? 'Tipo de armadura' : 'Tipo de arma'} required>
        <Select value={form.type} onChange={e => set('type', e.target.value)}>
          {typeOptions.map(t => (
            <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
          ))}
        </Select>
      </Field>

      {selectedType?.mechDesc && (
        <p style={{ fontSize: '0.65rem', color: '#555', fontFamily: 'monospace', lineHeight: 1.5, margin: 0 }}>
          {selectedType.mechDesc}
        </p>
      )}

      <ImageUpload
        value={form.image}
        onChange={img => set('image', img)}
        label={isArmor ? 'Arte da armadura' : 'Arte da arma'}
        outputSize={256}
      />

      <Field label="Descrição">
        <Textarea
          rows={2}
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="História da peça, marcas de uso, quem forjou…"
        />
      </Field>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        {onCancel && (
          <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        )}
        <button type="submit" className="btn-primary" disabled={!form.name.trim()}>
          {initial ? 'Salvar' : 'Forjar'}
        </button>
      </div>
    </form>
  )
}
