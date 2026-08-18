import React from 'react'
import { Crosshair, Shield, Axe, Sparkles, HeartPulse } from 'lucide-react'
import { CHARACTER_CLASSES, getAttributeLabel } from '../../constants/classes'
import MagicBento from '../react-bits/MagicBento'
import { ExportClassHandbookButton } from '../character/ExportClassHandbookButton'

const CLASS_ICONS = {
  atirador: Crosshair,
  tank: Shield,
  porradeiro: Axe,
  magica: Sparkles,
  suporte: HeartPulse,
}

export function ClassPicker({ value, onChange }) {
  const cards = CHARACTER_CLASSES.map(cls => ({
    id: cls.id,
    title: cls.label,
    label: cls.attributes.map(getAttributeLabel).join(' · '),
    description: cls.description,
    icon: CLASS_ICONS[cls.id],
    accent: cls.color,
    color: '#120f17',
    selected: value === cls.id,
  }))

  return (
    <div>
      <div style={{
        fontSize: '0.65rem',
        color: '#444',
        fontFamily: 'monospace',
        letterSpacing: '0.1em',
        marginBottom: '0.65rem',
      }}>
        CLASSE
      </div>
      <MagicBento
        cards={cards}
        columns={2}
        compact
        onCardClick={card => onChange(value === card.id ? null : card.id)}
      />
      {value === 'atirador' && (
        <div style={{ marginTop: '0.65rem' }}>
          <ExportClassHandbookButton classId="atirador" />
        </div>
      )}
    </div>
  )
}
