import React from 'react'
import { Heart, Brain } from 'lucide-react'
import { PHYSICAL_STATES, MENTAL_STATES, getMentalStateOption } from '../../constants/states'
import { StatePicker } from './StatePicker'
import { getPhysicalPenaltyLines, getMentalAttrPenaltyLines } from '../../services/stateModifiers'
import { listActiveMentalStatusDetails } from '../../services/mentalStatusService'

function PenaltyBox({ lines, color = '#ea580c' }) {
  if (!lines?.length) return null
  return (
    <div style={{
      padding: '0.45rem 0.625rem',
      background: '#141418',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '3px',
      fontSize: '0.6rem',
      fontFamily: 'monospace',
      color,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.2rem',
    }}>
      {lines.map(line => (
        <span key={line}>{line}</span>
      ))}
    </div>
  )
}

export function StatesSection({ entity, physicalState, mentalState, onPhysicalChange, onMentalChange }) {
  const physicalPenaltyLines = getPhysicalPenaltyLines(physicalState)
  const mentalOpt = getMentalStateOption(mentalState)
  const mentalPenaltyLines = getMentalAttrPenaltyLines(mentalOpt.mentalAttrPenalty ?? 0)
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

      <PenaltyBox lines={physicalPenaltyLines} color="#ea580c" />

      <StatePicker
        title="ESTADO MENTAL"
        icon={Brain}
        iconColor="#06b6d4"
        options={MENTAL_STATES}
        value={mentalState}
        onChange={onMentalChange}
      />

      <PenaltyBox lines={mentalPenaltyLines} color={mentalOpt.color || '#a855f7'} />

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
