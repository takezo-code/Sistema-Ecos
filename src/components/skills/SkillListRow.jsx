import React from 'react'
import { ChevronRight } from 'lucide-react'
import { getSkillTypeMeta } from '../../constants/skillTypes'
import { SKILL_CATEGORY_META } from '../../constants/skillCategories'
import { SKILL_AUDIENCE_META, getSkillAudience } from '../../constants/skillAudience'

export function SkillListRow({ skill, onClick }) {
  const typeMeta = getSkillTypeMeta(skill.skillType)
  const catMeta = SKILL_CATEGORY_META[skill.category]
  const audienceMeta = SKILL_AUDIENCE_META[getSkillAudience(skill)]

  return (
    <button
      type="button"
      onClick={() => onClick(skill)}
      style={{
        width: '100%',
        textAlign: 'left',
        background: '#111',
        border: '1px solid #1a1a1a',
        borderRadius: '4px',
        padding: '0.875rem 1rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#2a2a2a'
        e.currentTarget.style.background = '#141414'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#1a1a1a'
        e.currentTarget.style.background = '#111'
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e5e5e5' }}>{skill.name}</span>
          {!skill.isBuiltin && (
            <span style={{
              fontSize: '0.5rem',
              color: '#a855f7',
              fontFamily: 'monospace',
              border: '1px solid rgba(168,85,247,0.3)',
              padding: '1px 5px',
              borderRadius: '2px',
            }}>
              CUSTOM
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.6rem', fontFamily: 'monospace' }}>
          <span style={{ color: audienceMeta.color }}>{audienceMeta.shortLabel}</span>
          <span style={{ color: typeMeta.color }}>{typeMeta.label.toUpperCase()}</span>
          {skill.cooldownTurns > 0 && <span style={{ color: '#555' }}>CD {skill.cooldownTurns}T</span>}
          {catMeta && <span style={{ color: catMeta.color }}>{catMeta.label}</span>}
        </div>
        <p style={{
          margin: '6px 0 0',
          fontSize: '0.72rem',
          color: '#666',
          lineHeight: 1.45,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {skill.description}
        </p>
      </div>
      <ChevronRight size={16} style={{ color: '#333', flexShrink: 0 }} />
    </button>
  )
}
