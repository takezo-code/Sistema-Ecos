import React from 'react'
import { User, Skull } from 'lucide-react'
import { SKILL_AUDIENCE, SKILL_AUDIENCE_META } from '../../constants/skillAudience'

const TABS = [
  { id: SKILL_AUDIENCE.CHARACTER, icon: User },
  { id: SKILL_AUDIENCE.NPC, icon: Skull },
]

export function SkillAudienceTabs({ active, onChange, counts = {} }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.35rem',
      background: '#0d0d0d',
      border: '1px solid #1a1a1a',
      borderRadius: '4px',
      padding: '3px',
    }}>
      {TABS.map(tab => {
        const Icon = tab.icon
        const meta = SKILL_AUDIENCE_META[tab.id]
        const isActive = active === tab.id
        const count = counts[tab.id] ?? 0
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              background: isActive ? `${meta.color}18` : 'transparent',
              border: isActive ? `1px solid ${meta.color}55` : '1px solid transparent',
              borderRadius: '3px',
              color: isActive ? '#e5e5e5' : '#555',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            <Icon size={14} style={{ color: isActive ? meta.color : 'inherit' }} />
            <span>{meta.label}</span>
            <span style={{
              fontSize: '0.6rem',
              fontFamily: 'monospace',
              color: isActive ? meta.color : '#444',
            }}>
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
