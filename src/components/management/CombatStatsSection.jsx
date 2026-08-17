import { Field, Select } from '../ui/Field'
import { getRemainingLife } from '../../mechanics/combat/damageMarksEngine'

const PAPEL_OPTIONS = [
  { value: 'capanga', label: 'Capanga' },
  { value: 'elite', label: 'Elite' },
  { value: 'boss', label: 'Boss' },
]

export function CombatStatsSection({ entity, onUpdate }) {
  const set = (field, value) => onUpdate?.({ [field]: value })
  const life = getRemainingLife(entity)

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
        <div style={{
          alignSelf: 'end',
          padding: '0.7rem 0.8rem',
          borderRadius: 10,
          border: '1px solid rgba(22,163,74,0.25)',
          background: 'rgba(22,163,74,0.07)',
          fontFamily: 'monospace',
        }}>
          <div style={{ fontSize: '0.55rem', color: '#6b8f75', marginBottom: 3 }}>VIDA POR VITALIDADE</div>
          <strong style={{ color: '#4ade80', fontSize: '0.9rem' }}>{life.current} / {life.max}</strong>
        </div>
      </div>

      <div style={{ fontSize: '0.55rem', color: '#444', fontFamily: 'monospace' }}>
        Mesmo cálculo dos players: Vitalidade + armadura + buffs de vida.
      </div>
    </div>
  )
}
