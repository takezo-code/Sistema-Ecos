import React from 'react'
import { Field, Input, Select } from '../ui/Field'

const PAPEL_OPTIONS = [
  { value: 'capanga', label: 'Capanga' },
  { value: 'elite', label: 'Elite' },
  { value: 'boss', label: 'Boss' },
]

export function CombatStatsSection({ entity, onUpdate }) {
  const set = (field, value) => onUpdate?.({ [field]: value })
  const vida = entity.marcasMaximas ?? 0
  const marks = entity.damageMarks ?? 0
  const remaining = Math.max(0, vida - marks)

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
        <Field label="Vida" required>
          <Input
            type="number"
            min={1}
            value={vida || ''}
            onChange={e => set('marcasMaximas', Math.max(1, parseInt(e.target.value, 10) || 1))}
            title="Pontos de vida (marcas até derrotar)"
          />
        </Field>
      </div>

      {vida > 0 && (
        <div style={{ fontSize: '0.55rem', color: '#333', fontFamily: 'monospace' }}>
          Vida atual: {remaining} / {vida}
          {marks > 0 && ` · ${marks} marca(s) recebida(s)`}
        </div>
      )}
    </div>
  )
}
