import React from 'react'
import { Heart, Brain } from 'lucide-react'
import { PHYSICAL_STATES, MENTAL_STATES } from '../../constants/states'
import { StatePicker } from './StatePicker'
import {
  formatMentalPenalty,
  formatPhysicalPenalty,
  getEcoFailureChance,
  hasTemporalInstability,
} from '../../services/stateModifiers'

export function StatesSection({ physicalState, mentalState, onPhysicalChange, onMentalChange }) {
  const physicalPenalty = formatPhysicalPenalty(physicalState)
  const mentalPenalty = formatMentalPenalty(mentalState)
  const failureChance = getEcoFailureChance(mentalState)
  const unstable = hasTemporalInstability(mentalState)

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

      <StatePicker
        title="ESTADO MENTAL"
        icon={Brain}
        iconColor="#06b6d4"
        options={MENTAL_STATES}
        value={mentalState}
        onChange={onMentalChange}
      />

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        padding: '0.5rem 0.625rem',
        background: '#0a0a0a',
        border: '1px solid #1a1a1a',
        borderRadius: '3px',
        fontSize: '0.6rem',
        fontFamily: 'monospace',
      }}>
        {physicalPenalty && (
          <span style={{ color: '#ea580c' }}>{physicalPenalty}</span>
        )}
        {mentalPenalty && (
          <span style={{ color: unstable ? '#a855f7' : '#06b6d4' }}>{mentalPenalty}</span>
        )}
        {!physicalPenalty && !mentalPenalty && (
          <span style={{ color: '#333' }}>Sem penalidades ativas</span>
        )}
        {failureChance > 0 && (
          <span style={{ color: '#a855f7' }}>
            · falha Eco ~{Math.round(failureChance * 100)}%
          </span>
        )}
      </div>
    </div>
  )
}
