import React from 'react'
import { Heart, Brain } from 'lucide-react'
import { PHYSICAL_STATES, MENTAL_STATES } from '../../constants/states'
import { StatePicker } from './StatePicker'
import { formatPhysicalPenalty, formatMentalPenaltiesSummary } from '../../services/stateModifiers'
import { listActiveMentalStatusDetails } from '../../services/mentalStatusService'

export function StatesSection({ entity, physicalState, mentalState, onPhysicalChange, onMentalChange }) {
  const ecoOverload = entity?.ecoOverload ?? 0

  const physicalPenalty = formatPhysicalPenalty(physicalState)
  const mentalSummary = formatMentalPenaltiesSummary({
    ecoOverload,
    mentalState,
    ruptura: entity?.attributes?.ruptura,
  })
  const activeStatuses = listActiveMentalStatusDetails(entity?.activeMentalStatuses)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <StatePicker
        title="ESTADO FÍSICO"
        icon={Heart}
        iconColor="#dc2626"
        options={PHYSICAL_STATES}
        value={physicalState}
        onChange={onPhysicalChange}
      />

      {physicalPenalty && (
        <div style={{
          padding: '0.45rem 0.625rem',
          background: '#0a0a0a',
          border: '1px solid #1a1a1a',
          borderRadius: '3px',
          fontSize: '0.6rem',
          fontFamily: 'monospace',
          color: '#ea580c',
        }}>
          {physicalPenalty}
        </div>
      )}

      <StatePicker
        title="ESTADO MENTAL (BASE)"
        icon={Brain}
        iconColor="#06b6d4"
        options={MENTAL_STATES}
        value={mentalState}
        onChange={onMentalChange}
      />

      {mentalSummary.hasPenalties && (
        <div style={{
          padding: '0.45rem 0.625rem',
          background: '#0a0a0a',
          border: '1px solid rgba(6,182,212,0.15)',
          borderRadius: '3px',
          fontSize: '0.6rem',
          fontFamily: 'monospace',
          color: '#06b6d4',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.2rem',
        }}>
          {mentalSummary.lines.map(line => (
            <span key={line}>{line}</span>
          ))}
        </div>
      )}

      {activeStatuses.length > 0 && (
        <div style={{ fontSize: '0.65rem', color: '#888' }}>
          <span style={{ fontFamily: 'monospace', color: '#555' }}>Efeitos ativos: </span>
          {activeStatuses.map((s, i) => (
            <span key={s.id} style={{ color: s.definition?.color || '#eab308' }}>
              {i > 0 ? ', ' : ''}{s.definition?.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
