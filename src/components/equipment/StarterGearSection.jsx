import React, { useState } from 'react'
import { Dices } from 'lucide-react'
import { Field, Input, Select } from '../ui/Field'
import { ImageUpload } from '../ui/ImageUpload'
import {
  GEAR_CATEGORIES,
  getForgeableArmorTypes,
  STARTER_GEAR_MAX_ROLLS,
} from '../../mechanics/equipment/characterGear'
import {
  formatPassive,
  getItemPassivesAligned,
  getPassiveSlotsForCategory,
  rollPassive,
} from '../../mechanics/equipment/gearPassiveEngine'
import { Button } from '../ui/Button'

function StarterPassivesRoller({ category, item, color, onChange, maxRolls = STARTER_GEAR_MAX_ROLLS }) {
  const slots = getPassiveSlotsForCategory(category)
  const aligned = getItemPassivesAligned(category, item)
  const [drafts, setDrafts] = useState(null)
  const hasDrafts = drafts != null
  const rollCount = item?.rollCount ?? 0
  const rollsLeft = Math.max(0, maxRolls - rollCount)
  const canRoll = rollsLeft > 0

  const handleRollAll = () => {
    if (!canRoll) return
    const next = {}
    for (const def of slots) {
      const rolled = rollPassive(category, def.slot)
      if (rolled) next[def.slot] = rolled
    }
    setDrafts(next)
    onChange?.({ ...item, rollCount: rollCount + 1 })
  }

  const handleKeepAll = () => {
    if (!drafts) return
    const list = slots.map(def => drafts[def.slot]).filter(Boolean)
    onChange?.({ ...item, passives: list })
    setDrafts(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <Button
          type="button"
          variant="secondary"
          size="xs"
          onClick={handleRollAll}
          disabled={!canRoll}
          title={canRoll ? 'Rola todos os atributos de uma vez' : 'Limite de rolagens na criação'}
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '4px 10px' }}
        >
          <Dices size={12} />
          Rolagem ({rollCount}/{maxRolls})
        </Button>
        {hasDrafts && (
          <Button
            type="button"
            size="xs"
            onClick={handleKeepAll}
            style={{ padding: '4px 10px' }}
          >
            Manter
          </Button>
        )}
      </div>

      {!canRoll && !hasDrafts && (
        <p style={{ fontSize: '0.65rem', color: '#666', margin: 0, lineHeight: 1.45 }}>
          Limite de rolagens atingido. Novas rolagens ficam na ficha.
        </p>
      )}

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

function GearCard({ label, color, children }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.65rem',
      padding: '0.75rem',
      background: '#0d0d0d',
      border: '1px solid #1a1a1a',
      borderRadius: '3px',
    }}>
      <div style={{ fontSize: '0.55rem', color, fontFamily: 'monospace', letterSpacing: '0.1em' }}>
        {label}
      </div>
      {children}
    </div>
  )
}

/**
 * Equipamento inicial na criação: arma (nome + foto + rolagem) e armadura (tipo + rolagem).
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
    image: '',
    passives: [],
    rollCount: 0,
    ...(weapon || {}),
  }
  const armorDraft = {
    type: armorTypes[0]?.id ?? 'leve',
    passives: [],
    rollCount: 0,
    ...(armor || {}),
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {subtitle && (
        <p style={{ fontSize: '0.72rem', color: '#666', margin: 0, lineHeight: 1.45 }}>
          {subtitle}
        </p>
      )}

      <GearCard label="ARMA" color="#f97316">
        <Field label="Nome" required>
          <Input
            value={weaponDraft.name}
            onChange={e => onChangeWeapon({ ...weaponDraft, name: e.target.value })}
            placeholder="Ex.: Lâmina do Eco"
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
      </GearCard>

      <GearCard label="ARMADURA" color="#94a3b8">
        <Field label="Tipo" required>
          <Select
            value={armorDraft.type ?? armorTypes[0]?.id ?? ''}
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
      </GearCard>
    </div>
  )
}
