import React from 'react'
import { Heart, Brain } from 'lucide-react'
import { PHYSICAL_STATES, MENTAL_STATES } from '../../constants/states'
import { StatePicker } from './StatePicker'
import { PanelSection, MetaChip } from './PanelSection'
import { listActiveMentalStatusDetails } from '../../services/mentalStatusService'

function StateRow({ icon: Icon, accent, label, options, value, onChange }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      flexWrap: 'wrap',
    }}>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        width: 78,
        flexShrink: 0,
        paddingTop: 7,
        fontSize: '0.58rem',
        fontFamily: 'monospace',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#7a7a7a',
      }}>
        <Icon size={11} style={{ color: accent }} />
        {label}
      </span>

      <div style={{ flex: 1, minWidth: 200 }}>
        <StatePicker options={options} value={value} onChange={onChange} />
      </div>
    </div>
  )
}

export function StatesSection({ entity, physicalState, mentalState, onPhysicalChange, onMentalChange }) {
  const activeStatuses = listActiveMentalStatusDetails(entity?.activeMentalStatuses)

  return (
    <PanelSection
      meta={activeStatuses.length > 0 ? (
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {activeStatuses.map(s => (
            <MetaChip key={s.id} color={s.definition?.color || '#eab308'} tone="solid">
              {s.definition?.label}
            </MetaChip>
          ))}
        </div>
      ) : null}
    >
      <StateRow
        icon={Heart}
        accent="#dc2626"
        label="Físico"
        options={PHYSICAL_STATES}
        value={physicalState}
        onChange={onPhysicalChange}
      />
      <StateRow
        icon={Brain}
        accent="#06b6d4"
        label="Mental"
        options={MENTAL_STATES}
        value={mentalState}
        onChange={onMentalChange}
      />
    </PanelSection>
  )
}
