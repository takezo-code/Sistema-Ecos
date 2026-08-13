import React from 'react'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { getSkillTypeMeta } from '../../constants/skillTypes'
import { SKILL_AUDIENCE_META, getSkillAudience } from '../../constants/skillAudience'
import { getCharacterClass } from '../../constants/classes'
import { Button } from '../ui/Button'

function DetailBlock({ label, color, children }) {
  return (
    <section style={{
      background: '#0d0d0d',
      border: '1px solid #1a1a1a',
      borderRadius: '4px',
      padding: '1rem 1.125rem',
    }}>
      <div style={{
        fontSize: '0.55rem',
        fontFamily: 'monospace',
        letterSpacing: '0.12em',
        color: color || '#444',
        marginBottom: '0.5rem',
      }}>
        {label}
      </div>
      <div style={{ fontSize: '0.85rem', color: '#bbb', lineHeight: 1.65, margin: 0 }}>
        {children}
      </div>
    </section>
  )
}

export function SkillDetailPanel({ skill, onBack, onEdit, onDelete }) {
  if (!skill) return null

  const typeMeta = getSkillTypeMeta(skill.skillType)
  const audienceMeta = SKILL_AUDIENCE_META[getSkillAudience(skill)]
  const skillClass = getCharacterClass(skill.classId)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #1a1a1a',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
      }}>
        <button
          type="button"
          className="btn-ghost"
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
        >
          <ArrowLeft size={14} /> Voltar
        </button>
        <div style={{ flex: 1, minWidth: 0 }} />
        {onEdit && (
          <Button type="button" variant="secondary" size="xs" onClick={() => onEdit(skill)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Pencil size={12} /> Editar
          </Button>
        )}
        {onDelete && (
          <button type="button" className="btn-ghost" onClick={() => onDelete(skill)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: '#dc2626' }}>
            <Trash2 size={12} /> Excluir
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{
            marginBottom: '1.5rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid #1a1a1a',
          }}>
            <h1 style={{
              margin: '0 0 0.75rem',
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#f5f5f5',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}>
              {skill.name}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{
                fontSize: '0.65rem',
                fontFamily: 'monospace',
                color: audienceMeta.color,
                border: `1px solid ${audienceMeta.color}44`,
                padding: '2px 8px',
                borderRadius: '2px',
              }}>
                {audienceMeta.label.toUpperCase()}
              </span>
              {skillClass && (
                <span style={{
                  fontSize: '0.65rem',
                  fontFamily: 'monospace',
                  color: skillClass.color,
                  border: `1px solid ${skillClass.color}44`,
                  padding: '4px 10px',
                  borderRadius: '3px',
                }}>
                  {skillClass.label.toUpperCase()}
                </span>
              )}
              <span style={{
                fontSize: '0.65rem',
                fontFamily: 'monospace',
                color: typeMeta.color,
                border: `1px solid ${typeMeta.color}44`,
                padding: '4px 10px',
                borderRadius: '3px',
              }}>
                ATIVA
              </span>
              {skill.cooldownTurns > 0 && (
                <span style={{
                  fontSize: '0.65rem',
                  fontFamily: 'monospace',
                  color: '#888',
                  border: '1px solid #333',
                  padding: '4px 10px',
                  borderRadius: '3px',
                }}>
                  COOLDOWN {skill.cooldownTurns} TURNO(S)
                </span>
              )}
              <span style={{
                fontSize: '0.65rem',
                fontFamily: 'monospace',
                color: '#a855f7',
                border: '1px solid rgba(168,85,247,0.25)',
                padding: '4px 10px',
                borderRadius: '3px',
              }}>
                USOS +{skill.overloadCost ?? 1}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <DetailBlock label="DESCRIÇÃO" color="#888">
              {skill.description || '—'}
            </DetailBlock>
            <DetailBlock label="EFEITO MECÂNICO" color="#06b6d4">
              {skill.mechanicalEffect || '—'}
            </DetailBlock>
            <DetailBlock label="CONSEQUÊNCIA NARRATIVA" color="#eab308">
              {skill.narrativeConsequence || '—'}
            </DetailBlock>
          </div>
        </div>
      </div>
    </div>
  )
}
