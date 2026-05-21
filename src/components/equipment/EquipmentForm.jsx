import React, { useState } from 'react'
import { useSkillsCatalogStore } from '../../store/useSkillsCatalogStore'
import {
  WEAPON_TYPES, ARMOR_TYPES, RARITY_OPTIONS,
  getWeaponType, getArmorType,
} from '../../constants/equipmentTypes'

export function EquipmentForm({ initial, category, onSave, onCancel, submitLabel = 'Criar equipamento' }) {
  const skillsCatalog = useSkillsCatalogStore(s => s.skills)
  const types = category === 'arma' ? WEAPON_TYPES : ARMOR_TYPES

  const [form, setForm] = useState(() => {
    const def = types[0]
    return {
      type: initial?.type ?? def.id,
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      rarity: initial?.rarity ?? 'comum',
      bonusAtaque: initial?.bonusAtaque ?? (category === 'arma' ? (def.defaultBonusAtaque ?? 1) : 0),
      bonusResistencia: initial?.bonusResistencia ?? (category === 'arma' ? (def.defaultBonusResistencia ?? 0) : def.resistenciaFisica ?? 1),
      penaltyDestreza: initial?.penaltyDestreza ?? (category === 'armadura' ? (def.penaltyDestreza ?? 0) : 0),
      skillsGranted: initial?.skillsGranted ?? [],
    }
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const selectedTypeMeta = category === 'arma'
    ? getWeaponType(form.type)
    : getArmorType(form.type)

  const handleTypeChange = (typeId) => {
    const t = category === 'arma' ? getWeaponType(typeId) : getArmorType(typeId)
    set('type', typeId)
    if (t) {
      if (category === 'arma') {
        set('bonusAtaque', t.defaultBonusAtaque ?? 1)
        set('bonusResistencia', t.defaultBonusResistencia ?? 0)
      } else {
        set('bonusResistencia', t.resistenciaFisica ?? 1)
        set('penaltyDestreza', t.penaltyDestreza ?? 0)
      }
    }
  }

  const toggleSkill = (templateId) => {
    set('skillsGranted', form.skillsGranted.includes(templateId)
      ? form.skillsGranted.filter(id => id !== templateId)
      : [...form.skillsGranted, templateId])
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
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
        {category === 'arma' && (
          <div>
            <label style={labelStyle}>BÔNUS DE ATAQUE</label>
            <input type="number" className="input-base" min={-5} max={10}
              value={form.bonusAtaque} onChange={e => set('bonusAtaque', parseInt(e.target.value, 10) || 0)}
              style={inputStyle} />
          </div>
        )}
        <div>
          <label style={labelStyle}>{category === 'arma' ? 'BÔNUS RESIST.' : 'RESIST. FÍSICA'}</label>
          <input type="number" className="input-base" min={0} max={10}
            value={form.bonusResistencia} onChange={e => set('bonusResistencia', parseInt(e.target.value, 10) || 0)}
            style={inputStyle} />
        </div>
        {category === 'armadura' && (
          <div>
            <label style={labelStyle}>PENALIDADE DES</label>
            <input type="number" className="input-base" min={0} max={5}
              value={form.penaltyDestreza} onChange={e => set('penaltyDestreza', parseInt(e.target.value, 10) || 0)}
              style={inputStyle} />
          </div>
        )}
      </div>

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

      {skillsCatalog.length > 0 && (
        <div>
          <span style={labelStyle}>SKILLS CONCEDIDAS AO EQUIPAR</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '160px', overflowY: 'auto' }}>
            {skillsCatalog.map(skill => {
              const active = form.skillsGranted.includes(skill.templateId)
              return (
                <button key={skill.templateId} type="button" onClick={() => toggleSkill(skill.templateId)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.35rem 0.625rem', borderRadius: '3px',
                    background: active ? 'rgba(168,85,247,0.1)' : '#0d0d0d',
                    border: `1px solid ${active ? '#a855f7' : '#1a1a1a'}`,
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
                  }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: active ? '#a855f7' : '#222', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.7rem', color: active ? '#e5e5e5' : '#555' }}>{skill.name}</span>
                  <span style={{ fontSize: '0.5rem', color: '#333', fontFamily: 'monospace', marginLeft: 'auto' }}>{skill.skillType}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem' }}>
        <button type="button" className="btn-primary" onClick={() => canSave && onSave(form)} disabled={!canSave}
          style={{ flex: 1 }}>
          {submitLabel}
        </button>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  )
}
