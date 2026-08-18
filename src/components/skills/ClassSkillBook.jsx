import React, { useMemo, useState } from 'react'
import { Gem } from 'lucide-react'
import { getCharacterClass } from '../../constants/classes'
import { getClassPassive } from '../../mechanics/classes/classPassiveEngine'
import {
  ECO_SKILL_POINT_COST,
  ECO_SKILL_MAX_LEVEL,
  MAX_CLASS_SKILL_LEVEL,
  isSkillGradeLevel,
} from '../../constants/progression'
import {
  listClassSkillBook,
  canInvestSkillPoint,
  canUpgradeSkillGrade,
} from '../../mechanics/skills/classSkillProgressionEngine'
import { countGradeCatalysts } from '../../constants/merchantItems'
import { Button } from '../ui/Button'
import SpotlightCard from '../react-bits/SpotlightCard'
import ElectricBorder from '../react-bits/ElectricBorder'
import GlassSurface from '../react-bits/GlassSurface'
import GlowingBadge from '../ui/GlowingBadge'

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

function ElectricShell({
  active,
  color,
  speed,
  chaos,
  displacement,
  borderRadius = 12,
  borderOffset = 12,
  children,
}) {
  if (!active) return children
  return (
    <ElectricBorder
      color={color}
      speed={speed}
      chaos={chaos}
      displacement={displacement}
      borderRadius={borderRadius}
      borderOffset={borderOffset}
      style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}
    >
      {children}
    </ElectricBorder>
  )
}

/** Quanto maior o nível, mais rápidos e caóticos os choques na borda. */
function electricForSkill(entry, classColor) {
  const level = Math.max(0, entry?.level ?? 0)
  const t = Math.min(1, level / MAX_CLASS_SKILL_LEVEL)
  return {
    color: entry?.isGrade ? '#c084fc' : classColor,
    speed: 0.45 + t * 1.35,
    chaos: 0.05 + t * 0.16,
    displacement: 6 + t * 12,
  }
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
        ? `rgba(${rgb}, 0.4)`
        : 'rgba(255,255,255,0.08)'

  return (
    <ElectricShell
      active={unlocked}
      {...electricForSkill(entry, classColor)}
      borderRadius={12}
      borderOffset={10}
    >
      <button
        type="button"
        onClick={() => onSelect(def.templateId)}
        title={def.name}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.65rem 0.4rem',
          background: selected
            ? `rgba(${rgb}, 0.16)`
            : 'rgba(255,255,255,0.03)',
          border: `1px solid ${borderColor}`,
          borderRadius: 12,
          cursor: 'pointer',
          opacity: unlocked ? 1 : 0.55,
          minWidth: 0,
          boxShadow: selected ? `0 0 20px rgba(${rgb}, 0.2)` : 'none',
          transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
        }}
      >
        <div style={{
          width: 54,
          height: 54,
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
          background: unlocked
            ? (def.iconSrc ? '#050508' : `linear-gradient(145deg, rgba(${rgb},${intensity + 0.2}), rgba(${rgb},${intensity * 0.35}))`)
            : 'rgba(255,255,255,0.04)',
          border: `2px solid ${isGrade ? '#a855f7' : unlocked ? classColor : '#2a2a2a'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          filter: unlocked ? 'none' : 'grayscale(1)',
          boxShadow: unlocked ? `inset 0 0 14px rgba(${rgb}, 0.3), 0 0 12px rgba(${rgb}, 0.15)` : 'none',
        }}>
          {def.iconSrc ? (
            <img
              src={def.iconSrc}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              fontFamily: 'monospace',
              color: unlocked ? '#f5f5f5' : '#555',
              letterSpacing: '0.02em',
            }}>
              {def.icon}
            </span>
          )}
          <span style={{
            position: 'absolute',
            right: 2,
            bottom: 1,
            fontSize: '0.55rem',
            fontFamily: 'monospace',
            fontWeight: 700,
            color: isGrade ? '#c084fc' : unlocked ? classColor : '#444',
            textShadow: '0 1px 2px #000',
          }}>
            {levelLabel(level)}
          </span>
        </div>
        <div style={{
          fontSize: '0.62rem',
          color: selected ? '#f0f0f0' : '#888',
          textAlign: 'center',
          lineHeight: 1.25,
          maxWidth: 76,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontWeight: selected ? 600 : 500,
        }}>
          {def.name}
        </div>
      </button>
    </ElectricShell>
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
      <SpotlightCard style={{ padding: '1.25rem', textAlign: 'center' }}>
        <div style={{ color: '#888', fontSize: '0.8rem' }}>
          Defina a <strong style={{ color: '#ccc' }}>classe</strong> do personagem para ver o livro de skills.
        </div>
      </SpotlightCard>
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
  const rgb = hexToRgb(classColor)
  const classPassive = getClassPassive(entity)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: '0.65rem', color: '#888', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
          Habilidades
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <GlowingBadge variant={eco > 0 ? 'cyan' : 'gray'} pulse={eco > 0} dot>
            {eco} · Ecos disponíveis
          </GlowingBadge>
          {!compact && MAX_CLASS_SKILL_LEVEL > ECO_SKILL_MAX_LEVEL && (
            <GlowingBadge variant={catalysts > 0 ? 'default' : 'gray'} pulse={catalysts > 0} dot>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Gem size={11} /> catalisador [{catalysts}]
              </span>
            </GlowingBadge>
          )}
        </div>
      </div>

      {classPassive && (
        <SpotlightCard
          spotlightColor={`rgba(${rgb}, 0.18)`}
          style={{
            padding: '0.85rem 1rem',
            borderColor: `rgba(${rgb}, 0.22)`,
          }}
        >
          <div style={{ fontSize: '0.55rem', color: classColor, fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 6 }}>
            PASSIVA · {classPassive.name.toUpperCase()}
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#b8b8b8', lineHeight: 1.55 }}>
            {classPassive.description}
          </p>
          <p style={{ margin: '0.45rem 0 0', fontSize: '0.7rem', color: '#6b7280', lineHeight: 1.45 }}>
            Narrativa — o mestre interpreta na cena.
          </p>
        </SpotlightCard>
      )}

      <SpotlightCard
        spotlightColor={`rgba(${rgb}, 0.22)`}
        style={{
          padding: '0.85rem',
          borderColor: `rgba(${rgb}, 0.22)`,
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.max(book.length, 1)}, minmax(0, 1fr))`,
          gap: '0.5rem',
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
      </SpotlightCard>

      {selected && (
        <SpotlightCard
          spotlightColor={selected.isGrade ? 'rgba(168,85,247,0.2)' : `rgba(${rgb}, 0.2)`}
          style={{
            padding: '1rem 1.1rem',
            borderColor: selected.isGrade
              ? 'rgba(168,85,247,0.35)'
              : selected.unlocked
                ? `rgba(${rgb}, 0.35)`
                : undefined,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', gap: '0.7rem', minWidth: 0 }}>
              {selected.def.iconSrc && (
                <img
                  src={selected.def.iconSrc}
                  alt=""
                  style={{
                    width: 52,
                    height: 52,
                    objectFit: 'cover',
                    borderRadius: 10,
                    border: `1px solid rgba(${rgb}, 0.35)`,
                    flexShrink: 0,
                    background: '#050508',
                  }}
                />
              )}
              <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f5f5f5', letterSpacing: '-0.02em' }}>
                {selected.def.name}
              </div>
              <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                <GlowingBadge variant="default" pulse={false} dot>
                  Ativa
                </GlowingBadge>
                <GlowingBadge variant={selected.isGrade ? 'default' : 'cyan'} pulse={false} dot>
                  {selected.isGrade ? 'Grau' : 'Nível'} {selected.level}/{MAX_CLASS_SKILL_LEVEL}
                  {selected.atMax ? ' · Máx' : ''}
                </GlowingBadge>
                {selected.def.cooldownTurns > 0 && (
                  <GlowingBadge variant="gray" pulse={false} dot={false}>
                    CD {selected.def.cooldownTurns}
                  </GlowingBadge>
                )}
              </div>
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
                  {selected.unlocked ? 'Investir Eco' : 'Desbloquear'}
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
                    opacity: gradeCheck.ok ? 1 : 0.45,
                  }}
                >
                  <Gem size={12} />
                  Subir grau
                </Button>
              )}
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: '#999', lineHeight: 1.55, margin: '0 0 0.75rem', fontStyle: 'italic' }}>
            {selected.def.description}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <GlassSurface borderRadius={10} padding="0.65rem 0.75rem">
              <div style={{ fontSize: '0.55rem', color: '#22d3ee', fontFamily: 'monospace', marginBottom: 4, letterSpacing: '0.1em' }}>
                EFEITO
              </div>
              <div style={{ fontSize: '0.78rem', color: '#c4c4c4', lineHeight: 1.5 }}>
                {selected.def.mechanicalEffect}
              </div>
            </GlassSurface>
            {selected.def.narrativeConsequence && (
              <GlassSurface borderRadius={10} padding="0.65rem 0.75rem" style={{ borderColor: 'rgba(248,113,113,0.25)' }}>
                <div style={{ fontSize: '0.55rem', color: '#f87171', fontFamily: 'monospace', marginBottom: 4, letterSpacing: '0.1em' }}>
                  CONSEQUÊNCIA
                </div>
                <div style={{ fontSize: '0.78rem', color: '#aaa', lineHeight: 1.5 }}>
                  {selected.def.narrativeConsequence}
                </div>
              </GlassSurface>
            )}
          </div>

          {needsGrade && !gradeCheck.ok && (
            <div style={{ marginTop: '0.65rem', fontSize: '0.65rem', color: '#c084fc', fontFamily: 'monospace' }}>
              {gradeCheck.reason}
            </div>
          )}
        </SpotlightCard>
      )}
    </div>
  )
}
