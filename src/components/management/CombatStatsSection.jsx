import React from 'react'
import { Field, Input, Select } from '../ui/Field'

const PAPEL_OPTIONS = [
  { value: 'capanga', label: 'Capanga' },
  { value: 'elite', label: 'Elite' },
  { value: 'boss', label: 'Boss' },
]

export function CombatStatsSection({ entity, onUpdate }) {
  const set = (field, value) => onUpdate?.({ [field]: value })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
        ESTATÍSTICAS DE COMBATE
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Field label="Papel no Combate">
          <Select
            value={entity.papelCombate ?? 'capanga'}
            onChange={e => set('papelCombate', e.target.value)}
          >
            {PAPEL_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="XP de Recompensa">
          <Input
            type="number"
            min={0}
            value={entity.xpRecompensa ?? 0}
            onChange={e => set('xpRecompensa', Math.max(0, parseInt(e.target.value, 10) || 0))}
          />
        </Field>
      </div>

      <p style={{ fontSize: '0.6rem', color: '#555', fontFamily: 'monospace', margin: 0, lineHeight: 1.5 }}>
        RESISTÊNCIAS — reduzem o dano antes de virar marcas (dano − resistência = dano efetivo)
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '0.75rem',
        alignItems: 'start',
      }}>
        <Field label="Resist. Física">
          <Input
            type="number"
            min={0}
            max={20}
            value={entity.resistenciaFisica ?? 0}
            onChange={e => set('resistenciaFisica', Math.max(0, Math.min(20, parseInt(e.target.value, 10) || 0)))}
          />
        </Field>
        <Field label="Resist. Mental">
          <Input
            type="number"
            min={0}
            max={20}
            value={entity.resistenciaMental ?? 0}
            onChange={e => set('resistenciaMental', Math.max(0, Math.min(20, parseInt(e.target.value, 10) || 0)))}
          />
        </Field>
        <Field label="Marcas máx.">
          <Input
            type="number"
            min={0}
            value={entity.marcasMaximas ?? 0}
            onChange={e => set('marcasMaximas', Math.max(0, parseInt(e.target.value, 10) || 0))}
            title="0 = sem limite"
          />
        </Field>
      </div>
      <p style={{ fontSize: '0.55rem', color: '#444', margin: 0 }}>
        Marcas máx.: 0 = sem limite
      </p>

      <div style={{ fontSize: '0.55rem', color: '#333', fontFamily: 'monospace' }}>
        Marcas atuais: {entity.damageMarks ?? 0}
        {(entity.marcasMaximas ?? 0) > 0 && ` / ${entity.marcasMaximas} máx`}
      </div>
    </div>
  )
}
