import React from 'react'
import { CHARACTER_CLASSES, getAttributeLabel } from '../../constants/classes'
import { CLASS_FALLBACK_ICONS } from '../../constants/classIcons'
import MagicBento from '../react-bits/MagicBento'

export function ClassPicker({ value, onChange }) {
  const cards = CHARACTER_CLASSES.map(cls => ({
    id: cls.id,
    title: cls.label,
    label: cls.attributes.map(getAttributeLabel).join(' · '),
    description: cls.description,
    icon: CLASS_FALLBACK_ICONS[cls.id],
    iconSrc: cls.iconSrc,
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
    </div>
  )
}
