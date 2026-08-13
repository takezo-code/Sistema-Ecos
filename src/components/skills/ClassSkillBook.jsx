import React, { useMemo, useState } from 'react'
import { Plus, Zap, Gem } from 'lucide-react'
import { getCharacterClass } from '../../constants/classes'
import {
  ECO_SKILL_POINT_COST,
  ECO_SKILL_MAX_LEVEL,
  MAX_CLASS_SKILL_LEVEL,
  SKILL_GRADE_START_LEVEL,
  isSkillGradeLevel,
} from '../../constants/progression'
import {
  listClassSkillBook,
  canInvestSkillPoint,
  canUpgradeSkillGrade,
} from '../../mechanics/skills/classSkillProgressionEngine'
import { countGradeCatalysts } from '../../constants/merchantItems'
import { Button } from '../ui/Button'

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '156,163,175'
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
}

function levelLabel(level) {
  if (level <= 0) return '—'
  if (isSkillGradeLevel(level)) return `G${level}`
  return String(level)
}

function SkillIconCell({ entry, selected, classColor, onSelect }) {
  const { def, level, unlocked, isGrade } = entry
  const rgb = hexToRgb(classColor)
  const intensity = unlocked ? Math.min(1, 0.35 + level * 0.12) : 0.08
  const borderColor = selected
    ? classColor
    : isGrade
      ? '#a855f7'
      : unlocked
        ? `rgba(${rgb}, 0.35)`
        : '#1a1a1a'

  return (
    <button
      type="button"
      onClick={() => onSelect(def.templateId)}
      title={def.name}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.5rem 0.35rem',
        background: selected ? `rgba(${rgb}, 0.12)` : '#0a0a0a',
        border: `1px solid ${borderColor}`,
        borderRadius: '4px',
        cursor: 'pointer',
        opacity: unlocked ? 1 : 0.55,
        minWidth: 0,
      }}
    >
      <div style={{
        width: '52px',
        height: '52px',
        clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
        background: unlocked
          ? `linear-gradient(145deg, rgba(${rgb},${intensity + 0.15}), rgba(${rgb},${intensity * 0.4}))`
          : '#111',
        border: `2px solid ${isGrade ? '#a855f7' : unlocked ? classColor : '#2a2a2a'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        filter: unlocked ? 'none' : 'grayscale(1)',
        boxShadow: unlocked ? `inset 0 0 12px rgba(${rgb}, 0.25)` : 'none',
      }}>
        <span style={{
          fontSize: '0.85rem',
          fontWeight: 800,
          fontFamily: 'monospace',
          color: unlocked ? '#f5f5f5' : '#444',
          letterSpacing: '0.02em',
        }}>
          {def.icon}
        </span>
        <span style={{
          position: 'absolute',
          right: '2px',
          bottom: '1px',
          fontSize: '0.55rem',
          fontFamily: 'monospace',
          fontWeight: 700,
          color: isGrade ? '#c084fc' : unlocked ? classColor : '#333',
          textShadow: '0 1px 2px #000',
        }}>
          {levelLabel(level)}
        </span>
      </div>
      <div style={{
        fontSize: '0.58rem',
        color: selected ? '#e5e5e5' : '#666',
        textAlign: 'center',
        lineHeight: 1.25,
        maxWidth: '72px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {def.name}
      </div>
    </button>
  )
}

export function ClassSkillBook({
  entity,
  onInvestPoint,
  onUpgradeGrade,
  onActivate,
  compact = false,
}) {
  const classMeta = getCharacterClass(entity)
  const book = useMemo(() => listClassSkillBook(entity), [entity])
  const [selectedId, setSelectedId] = useState(book[0]?.def.templateId || null)
  const eco = entity.ecoPoints ?? 0
  const catalysts = countGradeCatalysts(entity.inventory)

  const selected = book.find(e => e.def.templateId === selectedId) || book[0] || null

  if (!classMeta) {
    return (
      <div style={{
        padding: '1.25rem',
        border: '1px dashed #1a1a1a',
        borderRadius: '4px',
        textAlign: 'center',
        color: '#555',
        fontSize: '0.8rem',
      }}>
        Defina a <strong style={{ color: '#aaa' }}>classe</strong> do personagem para ver o livro de skills.
      </div>
    )
  }

  const investCheck = selected
    ? canInvestSkillPoint(entity, selected.def.templateId)
    : { ok: false }
  const gradeCheck = selected
    ? canUpgradeSkillGrade(entity, selected.def.templateId)
    : { ok: false }

  const needsGrade = selected && selected.level >= ECO_SKILL_MAX_LEVEL && selected.level < MAX_CLASS_SKILL_LEVEL

  const classColor = classMeta.color

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        marginBottom: '0.85rem',
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
            LIVRO DE SKILLS · {classMeta.label.toUpperCase()}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.65rem',
            background: eco > 0 ? `rgba(${hexToRgb(classColor)}, 0.12)` : '#0d0d0d',
            border: `1px solid ${eco > 0 ? classColor : '#1a1a1a'}`,
            borderRadius: '3px',
          }}>
            <Zap size={13} style={{ color: eco > 0 ? classColor : '#444' }} />
            <span style={{ fontSize: '0.65rem', color: '#666', fontFamily: 'monospace' }}>eco</span>
            <span style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'monospace', color: eco > 0 ? classColor : '#555' }}>
              [ {eco} ]
            </span>
          </div>
          {!compact && MAX_CLASS_SKILL_LEVEL > ECO_SKILL_MAX_LEVEL && (
            <div
              title="Catalisador de Grau — sobe a skill além do Eco"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.65rem',
                background: catalysts > 0 ? 'rgba(168,85,247,0.12)' : '#0d0d0d',
                border: `1px solid ${catalysts > 0 ? '#a855f7' : '#1a1a1a'}`,
                borderRadius: '3px',
              }}
            >
              <Gem size={13} style={{ color: catalysts > 0 ? '#a855f7' : '#444' }} />
              <span style={{ fontSize: '0.65rem', color: '#666', fontFamily: 'monospace' }}>catalisador</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'monospace', color: catalysts > 0 ? '#a855f7' : '#555' }}>
                [ {catalysts} ]
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.max(book.length, 1)}, minmax(0, 1fr))`,
        gap: '0.4rem',
        marginBottom: '1rem',
        padding: '0.75rem',
        background: '#080808',
        border: '1px solid #1a1a1a',
        borderRadius: '6px',
      }}>
        {book.map(entry => (
          <SkillIconCell
            key={entry.def.templateId}
            entry={entry}
            selected={selected?.def.templateId === entry.def.templateId}
            classColor={classColor}
            onSelect={setSelectedId}
          />
        ))}
      </div>

      {selected && (
        <div style={{
          background: '#0d0d0d',
          border: `1px solid ${selected.isGrade ? '#a855f744' : selected.unlocked ? `${classColor}33` : '#1a1a1a'}`,
          borderRadius: '4px',
          padding: '0.875rem 1rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e5e5e5' }}>{selected.def.name}</div>
              <div style={{ fontSize: '0.6rem', color: selected.isGrade ? '#c084fc' : classColor, fontFamily: 'monospace', marginTop: '2px' }}>
                ATIVA · {selected.isGrade ? 'GRAU' : 'NÍVEL'} {selected.level}/{MAX_CLASS_SKILL_LEVEL}
                {selected.atMax ? ' · MÁX' : ''}
                {selected.def.cooldownTurns > 0 ? ` · CD ${selected.def.cooldownTurns}` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {selected.unlocked && onActivate && selected.instance && (
                <Button type="button" variant="secondary" size="xs" onClick={() => onActivate(selected.instance.id)}>
                  Ativar
                </Button>
              )}
              {!needsGrade && (
                <Button
                  type="button"
                  size="xs"
                  disabled={!investCheck.ok || !onInvestPoint}
                  onClick={() => investCheck.ok && onInvestPoint?.(selected.def.templateId)}
                  title={investCheck.ok
                    ? (selected.unlocked
                      ? `Gasta ${ECO_SKILL_POINT_COST} Eco para subir 1 nível`
                      : `Gasta ${ECO_SKILL_POINT_COST} Eco nesta skill`)
                    : undefined}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', opacity: investCheck.ok ? 1 : 0.45 }}
                >
                  <Plus size={12} />
                  {selected.unlocked ? 'Aumentar nível' : 'Desbloquear'}
                </Button>
              )}
              {needsGrade && (
                <Button
                  type="button"
                  size="xs"
                  disabled={!gradeCheck.ok || !onUpgradeGrade}
                  onClick={() => gradeCheck.ok && onUpgradeGrade?.(selected.def.templateId)}
                  title={gradeCheck.ok ? 'Consome 1 Catalisador de Grau' : gradeCheck.reason}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    background: gradeCheck.ok ? '#7c3aed' : undefined,
                    borderColor: gradeCheck.ok ? '#a855f7' : undefined,
                    opacity: gradeCheck.ok ? 1 : 0.45,
                  }}
                >
                  <Gem size={12} />
                  Subir grau (catalisador)
                </Button>
              )}
            </div>
          </div>

          <p style={{ fontSize: '0.75rem', color: '#777', lineHeight: 1.55, margin: '0 0 0.5rem' }}>{selected.def.description}</p>
          <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '3px', padding: '0.5rem 0.625rem', marginBottom: '0.35rem' }}>
            <div style={{ fontSize: '0.5rem', color: '#06b6d4', fontFamily: 'monospace', marginBottom: '2px' }}>EFEITO</div>
            <div style={{ fontSize: '0.7rem', color: '#888', lineHeight: 1.5 }}>{selected.def.mechanicalEffect}</div>
          </div>
          {selected.def.narrativeConsequence && (
            <div style={{ background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.12)', borderRadius: '3px', padding: '0.5rem 0.625rem' }}>
              <div style={{ fontSize: '0.5rem', color: '#dc2626', fontFamily: 'monospace', marginBottom: '2px' }}>CONSEQUÊNCIA</div>
              <div style={{ fontSize: '0.7rem', color: '#666', lineHeight: 1.5 }}>{selected.def.narrativeConsequence}</div>
            </div>
          )}
          {needsGrade && !gradeCheck.ok && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: '#a855f7', fontFamily: 'monospace' }}>{gradeCheck.reason}</div>
          )}
        </div>
      )}
    </div>
  )
}
