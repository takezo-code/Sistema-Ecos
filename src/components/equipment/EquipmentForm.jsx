import React, { useState } from 'react'
import {
  WEAPON_TYPES, ARMOR_TYPES, RARITY_OPTIONS,
  getWeaponType, getArmorType, getPassiveSlotsForRarity,
} from '../../constants/equipmentTypes'
import { ImageUpload } from '../ui/ImageUpload'

export function EquipmentForm({ initial, category, onSave, onCancel, submitLabel = 'Criar equipamento' }) {
  const types = category === 'arma' ? WEAPON_TYPES : ARMOR_TYPES

  const [form, setForm] = useState(() => {
    const def = types[0]
    const rarity = initial?.rarity ?? 'comum'
    return {
      type: initial?.type ?? def.id,
      name: initial?.name ?? '',
      image: initial?.image ?? '',
      description: initial?.description ?? '',
      rarity,
      passives: Array.isArray(initial?.passives) ? initial.passives : [],
    }
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const selectedTypeMeta = category === 'arma'
    ? getWeaponType(form.type)
    : getArmorType(form.type)

  const passiveSlots = category === 'arma' ? getPassiveSlotsForRarity(form.rarity) : 0

  const handleTypeChange = (typeId) => {
    set('type', typeId)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    const payload = {
      type: form.type,
      name: form.name,
      image: form.image || '',
      description: form.description,
      rarity: form.rarity,
      passives: form.passives,
    }
    if (category === 'armadura') {
      const t = getArmorType(form.type)
      payload.penaltyDestreza = t?.penaltyDestreza ?? 0
      payload.markBonus = t?.markBonus ?? 0
    }
    onSave(payload)
  }

  const canSave = form.name.trim().length > 0

  const inputStyle = {
    background: '#111', border: '1px solid #1a1a1a', borderRadius: '4px',
    color: '#e5e5e5', padding: '0.5rem 0.625rem', fontSize: '0.8rem',
    fontFamily: 'inherit', width: '100%', outline: 'none',
  }
  const labelStyle = { fontSize: '0.6rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.08em', display: 'block', marginBottom: '0.25rem' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '560px' }}>
      <div>
        <span style={labelStyle}>TIPO</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.4rem' }}>
          {types.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTypeChange(t.id)}
              style={{
                padding: '0.5rem 0.5rem',
                background: form.type === t.id ? `${t.color}18` : '#111',
                border: `1px solid ${form.type === t.id ? t.color : '#1a1a1a'}`,
                borderRadius: '4px',
                color: form.type === t.id ? t.color : '#555',
                cursor: 'pointer',
                fontSize: '0.65rem',
                fontFamily: 'monospace',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.12s',
              }}
            >
              <span>{t.icon}</span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.label}</span>
            </button>
          ))}
        </div>
        {selectedTypeMeta && (
          <div style={{ marginTop: '0.4rem', fontSize: '0.6rem', color: '#444', fontFamily: 'monospace', padding: '0.35rem 0.5rem', background: '#0d0d0d', borderRadius: '3px' }}>
            {selectedTypeMeta.handsLabel && (
              <span style={{ color: '#666' }}>{selectedTypeMeta.handsLabel.toUpperCase()} · </span>
            )}
            {selectedTypeMeta.mechDesc}
          </div>
        )}
      </div>

      <div>
        <label style={labelStyle}>NOME</label>
        <input
          className="input-base"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder={`Nome do ${category === 'arma' ? 'item' : 'equipamento'}…`}
          style={inputStyle}
        />
      </div>

      <ImageUpload
        value={form.image}
        onChange={v => set('image', v)}
        label="Imagem do item"
      />

      <div>
        <span style={labelStyle}>RARIDADE</span>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {RARITY_OPTIONS.map(r => (
            <button key={r.id} type="button" onClick={() => set('rarity', r.id)}
              style={{
                padding: '0.3rem 0.75rem', fontSize: '0.65rem', fontFamily: 'monospace',
                background: form.rarity === r.id ? `${r.color}18` : 'transparent',
                border: `1px solid ${form.rarity === r.id ? r.color : '#1a1a1a'}`,
                borderRadius: '3px', color: form.rarity === r.id ? r.color : '#444', cursor: 'pointer',
              }}
            >{r.label}</button>
          ))}
        </div>
        {category === 'arma' && (
          <div style={{ marginTop: '0.4rem', fontSize: '0.6rem', color: '#555', fontFamily: 'monospace' }}>
            Passivas: {passiveSlots} slot{passiveSlots !== 1 ? 's' : ''} (comum 1 · incomum 2 · raro 3 · lendário 4)
          </div>
        )}
      </div>

      {category === 'arma' && (
        <div style={{
          padding: '0.625rem 0.75rem',
          background: '#0d0d0d',
          border: '1px dashed #1a1a1a',
          borderRadius: '4px',
          fontSize: '0.7rem',
          color: '#555',
          lineHeight: 1.5,
        }}>
          <div style={{ fontSize: '0.5rem', color: '#333', fontFamily: 'monospace', marginBottom: '0.25rem' }}>
            PASSIVAS · {form.passives.length}/{passiveSlots}
          </div>
          Passivas serão randomizadas em breve. Por enquanto a arma só reserva os slots pela raridade.
        </div>
      )}

      <div>
        <label style={labelStyle}>DESCRIÇÃO / LORE</label>
        <textarea
          className="input-base"
          rows={3}
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="História, aparência, efeitos especiais…"
          style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem' }}>
        <button type="button" className="btn-primary" onClick={handleSave} disabled={!canSave}
          style={{ flex: 1 }}>
          {submitLabel}
        </button>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  )
}
