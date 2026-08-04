import React, { useState } from 'react'
import { Field, Input, Select, Textarea } from '../ui/Field'
import { ImageUpload } from '../ui/ImageUpload'
import {
  GEAR_CATEGORIES,
  getForgeableArmorTypes,
} from '../../mechanics/equipment/characterGear'

/**
 * Forja da peça pessoal.
 * Arma: campos livres (nome, o que é, descrição, arte) — sem tipos pré-setados.
 * Armadura: ainda usa tipos leves/médios/pesados (efeito mecânico).
 */
export function GearForgeForm({ category, initial, onSave, onCancel }) {
  const isArmor = category === GEAR_CATEGORIES.ARMOR
  const armorTypes = getForgeableArmorTypes()

  const [form, setForm] = useState({
    name: initial?.name ?? '',
    kind: initial?.kind ?? '',
    type: initial?.type ?? (isArmor ? armorTypes[0]?.id ?? '' : null),
    image: initial?.image ?? '',
    description: initial?.description ?? '',
  })

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (isArmor) {
      onSave({
        name: form.name.trim(),
        type: form.type,
        image: form.image,
        description: form.description,
      })
      return
    }
    onSave({
      name: form.name.trim(),
      kind: form.kind.trim(),
      type: null,
      image: form.image,
      description: form.description,
    })
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

      {isArmor ? (
        <Field label="Tipo de armadura" required>
          <Select value={form.type} onChange={e => set('type', e.target.value)}>
            {armorTypes.map(t => (
              <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
            ))}
          </Select>
        </Field>
      ) : (
        <Field label="O que é a arma">
          <Input
            value={form.kind}
            onChange={e => set('kind', e.target.value)}
            placeholder="Ex.: rifle de precisão, katana quebrada, orbe de vidro…"
          />
        </Field>
      )}

      <Field label="Descrição">
        <Textarea
          rows={3}
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder={isArmor
            ? 'História da peça, marcas de uso, quem forjou…'
            : 'Como parece, de onde veio, como o personagem usa…'}
        />
      </Field>

      <ImageUpload
        value={form.image}
        onChange={img => set('image', img)}
        label={isArmor ? 'Arte da armadura' : 'Arte da arma'}
        outputSize={256}
      />

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
