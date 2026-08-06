import React, { useState } from 'react'
import { Dices } from 'lucide-react'
import { Field, Input, Textarea, Select } from '../ui/Field'
import { ImageUpload } from '../ui/ImageUpload'
import {
  GEAR_CATEGORIES,
  getForgeableArmorTypes,
} from '../../mechanics/equipment/characterGear'
import {
  formatPassive,
  getItemPassivesAligned,
  getPassiveSlotsForCategory,
  rollPassive,
} from '../../mechanics/equipment/gearPassiveEngine'

function StarterPassivesRoller({ category, item, color, onChange }) {
  const slots = getPassiveSlotsForCategory(category)
  const aligned = getItemPassivesAligned(category, item)
  const [drafts, setDrafts] = useState(null)
  const hasDrafts = drafts != null

  const handleRollAll = () => {
    const next = {}
    for (const def of slots) {
      const rolled = rollPassive(category, def.slot)
      if (rolled) next[def.slot] = rolled
    }
    setDrafts(next)
  }

  const handleKeepAll = () => {
    if (!drafts) return
    const list = slots.map(def => drafts[def.slot]).filter(Boolean)
    onChange?.({ ...item, passives: list })
    setDrafts(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <div style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: '#444', letterSpacing: '0.06em' }}>
        ATRIBUTOS DE ITEM
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={handleRollAll}
          title="Rola todos os slots de uma vez"
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', padding: '4px 10px' }}
        >
          <Dices size={12} />
          Rolagem
        </button>
        {hasDrafts && (
          <button
            type="button"
            className="btn-primary"
            onClick={handleKeepAll}
            style={{ fontSize: '0.65rem', padding: '4px 10px' }}
          >
            Manter tudo
          </button>
        )}
      </div>

      {slots.map((def, i) => {
        const kept = aligned[i]
        const draft = hasDrafts ? drafts[def.slot] : null
        const shown = draft || (!hasDrafts ? kept : null)
        return (
          <div
            key={def.slot}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.5rem',
              border: `1px solid ${shown ? `${color}44` : '#1e1e1e'}`,
              borderRadius: '3px',
              background: draft ? 'rgba(168,85,247,0.06)' : '#0a0a0a',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: shown ? '#ccc' : '#333', fontFamily: 'monospace' }}>
              {shown ? formatPassive(shown) : (hasDrafts ? '—' : 'não rolado')}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Forja inicial: arma livre (nome, o que é, descrição, arte) e armadura com tipo mecânico.
 * Na criação dá para rolar os atributos de item antes de salvar.
 */
export function StarterGearSection({
  weapon,
  armor,
  onChangeWeapon,
  onChangeArmor,
  subtitle = 'Esta arma e esta armadura acompanham a ficha.',
}) {
  const armorTypes = getForgeableArmorTypes()
  const weaponDraft = {
    name: '',
    kind: '',
    description: '',
    image: '',
    passives: [],
    ...(weapon || {}),
  }
  const armorDraft = {
    name: '',
    type: armorTypes[0]?.id ?? 'leve',
    image: '',
    passives: [],
    ...(armor || {}),
  }
  const armorType = armorTypes.find(t => t.id === armorDraft.type) ?? armorTypes[0]

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
            value={weaponDraft.name}
            onChange={e => onChangeWeapon({ ...weaponDraft, name: e.target.value })}
            placeholder="Ex.: Lâmina do Eco"
          />
        </Field>
        <Field label="O que é a arma">
          <Input
            value={weaponDraft.kind || ''}
            onChange={e => onChangeWeapon({ ...weaponDraft, kind: e.target.value })}
            placeholder="Ex.: rifle de precisão, katana quebrada, orbe de vidro…"
          />
        </Field>
        <Field label="Descrição">
          <Textarea
            rows={3}
            value={weaponDraft.description || ''}
            onChange={e => onChangeWeapon({ ...weaponDraft, description: e.target.value })}
            placeholder="Como parece, de onde veio, como é usada…"
          />
        </Field>
        <ImageUpload
          value={weaponDraft.image || ''}
          onChange={img => onChangeWeapon({ ...weaponDraft, image: img })}
          label="Foto da arma"
          outputSize={256}
        />
        <StarterPassivesRoller
          category={GEAR_CATEGORIES.WEAPON}
          item={weaponDraft}
          color="#f97316"
          onChange={onChangeWeapon}
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
            value={armorDraft.name}
            onChange={e => onChangeArmor({ ...armorDraft, name: e.target.value })}
            placeholder={armorType ? armorType.label : 'Nome da armadura'}
          />
        </Field>
        <ImageUpload
          value={armorDraft.image || ''}
          onChange={img => onChangeArmor({ ...armorDraft, image: img })}
          label="Foto da armadura"
          outputSize={256}
        />
        <Field label="Tipo">
          <Select
            value={armorType?.id ?? ''}
            onChange={e => onChangeArmor({ ...armorDraft, type: e.target.value })}
          >
            {armorTypes.map(t => (
              <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
            ))}
          </Select>
        </Field>
        <StarterPassivesRoller
          category={GEAR_CATEGORIES.ARMOR}
          item={armorDraft}
          color="#16a34a"
          onChange={onChangeArmor}
        />
      </div>
    </>
  )
}
