import React, { useState } from 'react'
import { HeartPulse, Trash2, Plus, Crosshair } from 'lucide-react'
import {
  DAMAGE_MARK_META,
  DAMAGE_MARK_TYPES,
  getRemainingLife,
} from '../../mechanics/combat/damageMarksEngine'
import { getPhysicalStateOption } from '../../constants/states'

/** Botões de marca no card do player (sem Médio). */
export const PLAYER_MARK_TYPES = [DAMAGE_MARK_TYPES.LEVE, DAMAGE_MARK_TYPES.GRAVE]

/** Bloco de vida restante (começa no total e reduz com o dano). */
function LifeCountBlock({ current, max, stateOpt, compact = false }) {
  const color = stateOpt?.color ?? '#666'
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
        padding: compact ? '0.4rem 0.55rem' : '0.55rem 0.7rem',
        background: compact ? `${color}10` : `linear-gradient(145deg, ${color}22, ${color}08)`,
        border: `1px solid ${compact ? `${color}33` : `${color}44`}`,
        borderRadius: compact ? 8 : 8,
        boxShadow: compact ? 'none' : `0 0 16px ${color}14, inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: compact ? '0.35rem' : '0.45rem', minWidth: 0 }}>
        <HeartPulse size={compact ? 13 : 13} strokeWidth={2.3} style={{ color, flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
          <span style={{
            fontSize: compact ? '0.64rem' : '0.72rem',
            fontWeight: 650,
            color,
            letterSpacing: '-0.01em',
          }}>
            {stateOpt?.label ?? 'Saudável'}
          </span>
          {(stateOpt?.attrPenalty ?? 0) > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {(stateOpt.noteLines || []).map(line => (
                <span key={line} style={{ fontSize: '0.45rem', color, fontFamily: 'monospace', opacity: 0.85 }}>
                  {line}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div
          style={{
            fontSize: compact ? '1rem' : '1.25rem',
            fontWeight: 750,
            color,
            fontFamily: 'monospace',
            lineHeight: 1,
          }}
        >
          {current}{max > 0 ? `/${max}` : ''}
        </div>
        <div style={{
          fontSize: '0.4rem',
          color: '#777',
          fontFamily: 'monospace',
          marginTop: 2,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          vida
        </div>
      </div>
    </div>
  )
}

export function DamageMarksPanel({
  character,
  maxMarks = 0,
  onApplyMarks,
  onHealMarks,
  onClearMarks,
  onNotice,
  markTypes = null,
  compact = false,
}) {
  const [confirmClear, setConfirmClear] = useState(false)

  const physicalState = character.physicalState ?? 'bem'
  const stateOpt = getPhysicalStateOption(physicalState)
  const life = getRemainingLife(
    maxMarks > 0 ? { ...character, marcasMaximas: maxMarks } : character,
  )
  const { current, max, marks } = life
  const types = markTypes || Object.values(DAMAGE_MARK_TYPES)

  const handleApply = (markType) => {
    const result = onApplyMarks?.(markType)
    if (result?.narratives?.length && onNotice) {
      onNotice(result.narratives.join(' · '), result.stateChanged ? 'warning' : 'info')
    }
  }

  const handleClear = () => {
    if (!confirmClear) { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 2500); return }
    onClearMarks?.()
    setConfirmClear(false)
  }

  if (compact) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <LifeCountBlock current={current} max={max} stateOpt={stateOpt} compact />

        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {types.map(type => {
            const meta = DAMAGE_MARK_META[type]
            if (!meta) return null
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleApply(type)}
                title={`${meta.label} (−${meta.value} vida)`}
                style={{
                  flex: 1,
                  padding: '6px 3px',
                  background: `linear-gradient(145deg, ${meta.color}22, ${meta.color}0a)`,
                  border: `1px solid ${meta.color}50`,
                  borderRadius: 9,
                  color: meta.color,
                  cursor: 'pointer',
                  fontSize: '0.55rem',
                  fontFamily: 'monospace',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  boxShadow: `0 0 12px ${meta.color}18, inset 0 1px 0 rgba(255,255,255,0.05)`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                }}
              >
                <Crosshair size={9} strokeWidth={2.4} />
                {meta.label} −{meta.value}
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => onHealMarks?.(1)}
            disabled={marks === 0}
            title="Recuperar 1 vida"
            style={{
              width: 30,
              flexShrink: 0,
              padding: 0,
              background: marks === 0
                ? 'rgba(255,255,255,0.02)'
                : 'linear-gradient(145deg, rgba(22,163,74,0.22), rgba(22,163,74,0.08))',
              border: `1px solid ${marks === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(22,163,74,0.45)'}`,
              borderRadius: 9,
              color: marks === 0 ? '#2f2f2f' : '#4ade80',
              cursor: marks === 0 ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: marks === 0 ? 'none' : '0 0 10px rgba(22,163,74,0.2)',
            }}
          >
            <Plus size={12} strokeWidth={2.4} />
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={marks === 0}
            title={confirmClear ? 'Confirmar restaurar vida' : 'Restaurar vida total'}
            style={{
              width: 30,
              flexShrink: 0,
              padding: 0,
              background: confirmClear
                ? 'linear-gradient(145deg, rgba(220,38,38,0.28), rgba(220,38,38,0.1))'
                : marks === 0
                  ? 'rgba(255,255,255,0.02)'
                  : 'rgba(255,255,255,0.04)',
              border: `1px solid ${
                marks === 0
                  ? 'rgba(255,255,255,0.06)'
                  : confirmClear
                    ? 'rgba(239,68,68,0.55)'
                    : 'rgba(255,255,255,0.1)'
              }`,
              borderRadius: 9,
              color: marks === 0 ? '#2f2f2f' : confirmClear ? '#f87171' : '#777',
              cursor: marks === 0 ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: confirmClear ? '0 0 12px rgba(239,68,68,0.25)' : 'none',
            }}
          >
            <Trash2 size={11} strokeWidth={2.3} />
          </button>
        </div>
      </div>
    )
  }

  // Layout completo (inimigos / boss)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <LifeCountBlock current={current} max={max} stateOpt={stateOpt} />

      <div style={{ display: 'flex', gap: '0.3rem' }}>
        {types.map(type => {
          const meta = DAMAGE_MARK_META[type]
          if (!meta) return null
          return (
            <button
              key={type}
              type="button"
              onClick={() => handleApply(type)}
              title={`${meta.description} (−${meta.value} vida)`}
              style={{
                flex: 1,
                padding: '4px 2px',
                background: `${meta.color}11`,
                border: `1px solid ${meta.color}44`,
                borderRadius: '4px',
                color: meta.color,
                cursor: 'pointer',
                fontSize: '0.5rem',
                fontFamily: 'monospace',
                fontWeight: 700,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1px',
              }}
            >
              <span>{meta.label}</span>
              <span style={{ fontSize: '0.45rem', opacity: 0.75 }}>−{meta.value}</span>
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: '0.3rem' }}>
        <button
          type="button"
          onClick={() => onHealMarks?.(1)}
          disabled={marks === 0}
          title="Recuperar 1 vida"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            padding: '3px',
            background: 'transparent',
            border: '1px solid #2a2a2a',
            borderRadius: '4px',
            color: marks === 0 ? '#2a2a2a' : '#16a34a',
            cursor: marks === 0 ? 'default' : 'pointer',
            fontSize: '0.5rem',
            fontFamily: 'monospace',
          }}
        >
          <Plus size={9} /> +1
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={marks === 0}
          title={confirmClear ? 'Clique novamente para confirmar' : 'Restaurar vida total'}
          style={{
            flex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            padding: '3px',
            background: confirmClear ? 'rgba(220,38,38,0.12)' : 'transparent',
            border: `1px solid ${confirmClear ? 'rgba(220,38,38,0.4)' : '#2a2a2a'}`,
            borderRadius: '4px',
            color: marks === 0 ? '#2a2a2a' : confirmClear ? '#ef4444' : '#666',
            cursor: marks === 0 ? 'default' : 'pointer',
            fontSize: '0.5rem',
            fontFamily: 'monospace',
          }}
        >
          <Trash2 size={9} />
          {confirmClear ? 'Confirmar?' : 'Restaurar'}
        </button>
      </div>
    </div>
  )
}
