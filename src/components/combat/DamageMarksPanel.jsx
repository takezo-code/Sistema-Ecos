import React, { useState } from 'react'
import { Shield, Trash2, Plus } from 'lucide-react'
import {
  DAMAGE_MARK_META,
  DAMAGE_MARK_TYPES,
  getBufferedTierRange,
  getRemainingLife,
  getVitalityMarkBuffer,
  MARK_STATE_THRESHOLDS,
} from '../../mechanics/combat/damageMarksEngine'
import { getPhysicalStateOption } from '../../constants/states'
import { getArmorMarkBonus } from '../../mechanics/equipment/armorEffectsEngine'

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
        padding: compact ? '0.4rem 0.55rem' : '0.5rem 0.65rem',
        background: `${color}12`,
        border: `1px solid ${color}33`,
        borderRadius: '4px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0 }}>
        <Shield size={compact ? 11 : 12} style={{ color, flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
          <span style={{ fontSize: compact ? '0.65rem' : '0.7rem', fontWeight: 700, color }}>
            {stateOpt?.label ?? 'Saudável'}
          </span>
          {(stateOpt?.attrPenalty ?? 0) > 0 && (
            <span style={{ fontSize: '0.45rem', color, fontFamily: 'monospace', opacity: 0.85 }}>
              {stateOpt.note || `−${stateOpt.attrPenalty} FOR · DES · VIT`}
            </span>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div
          style={{
            fontSize: compact ? '1.05rem' : '1.25rem',
            fontWeight: 800,
            color,
            fontFamily: 'monospace',
            lineHeight: 1,
          }}
        >
          {current}{max > 0 ? `/${max}` : ''}
        </div>
        <div style={{ fontSize: '0.45rem', color: '#666', fontFamily: 'monospace', marginTop: '2px' }}>
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
  const vitalityBuffer = getVitalityMarkBuffer(character)
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
    const armorMarks = getArmorMarkBonus(character)
    const feridoAt = getBufferedTierRange(MARK_STATE_THRESHOLDS[1], vitalityBuffer).min
    const vidaWhenFerido = Math.max(0, max - feridoAt)

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <LifeCountBlock current={current} max={max} stateOpt={stateOpt} compact />

        {vitalityBuffer > 0 && (
          <div style={{ fontSize: '0.45rem', color: '#555', fontFamily: 'monospace', lineHeight: 1.35 }}>
            +{vitalityBuffer} vida (2 VIT = 1)
            {armorMarks > 0 ? ` · armadura +${armorMarks}` : ''}
            {' · '}Ferido com {vidaWhenFerido} vida
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.25rem' }}>
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
                  padding: '5px 2px',
                  background: `${meta.color}10`,
                  border: `1px solid ${meta.color}40`,
                  borderRadius: '4px',
                  color: meta.color,
                  cursor: 'pointer',
                  fontSize: '0.55rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                }}
              >
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
              width: '28px',
              flexShrink: 0,
              padding: '5px 0',
              background: 'transparent',
              border: '1px solid #2a2a2a',
              borderRadius: '4px',
              color: marks === 0 ? '#2a2a2a' : '#16a34a',
              cursor: marks === 0 ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plus size={10} />
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={marks === 0}
            title={confirmClear ? 'Confirmar restaurar vida' : 'Restaurar vida total'}
            style={{
              width: '28px',
              flexShrink: 0,
              padding: '5px 0',
              background: confirmClear ? 'rgba(220,38,38,0.12)' : 'transparent',
              border: `1px solid ${confirmClear ? 'rgba(220,38,38,0.4)' : '#2a2a2a'}`,
              borderRadius: '4px',
              color: marks === 0 ? '#2a2a2a' : confirmClear ? '#ef4444' : '#555',
              cursor: marks === 0 ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Trash2 size={10} />
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
