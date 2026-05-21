import React, { useState } from 'react'
import { Shield, Zap, Trash2, Minus } from 'lucide-react'
import {
  DAMAGE_MARK_META,
  DAMAGE_MARK_TYPES,
  getMarkProgress,
  MARK_STATE_THRESHOLDS,
} from '../../mechanics/combat/damageMarksEngine'
import { getPhysicalStateOption } from '../../constants/states'

// Barra de progresso de marcas com segmentos por tier
export function MarksProgressBar({ marks }) {
  const MAX_SHOWN = 12
  const progress = getMarkProgress(marks)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', gap: '2px' }}>
        {Array.from({ length: MAX_SHOWN }).map((_, i) => {
          const filled = i < marks
          const tier = MARK_STATE_THRESHOLDS.find(t => i >= t.min && i <= (t.max === Infinity ? 99 : t.max))
          const color = filled ? (tier?.color ?? '#dc2626') : '#1a1a1a'
          const isThreshold = tier && i === tier.min && i > 0

          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: '6px',
                background: color,
                borderRadius: '2px',
                marginLeft: isThreshold ? '3px' : '0',
                transition: 'background 0.2s',
                opacity: filled ? 1 : 0.55,
              }}
            />
          )
        })}
        {marks > MAX_SHOWN && (
          <span style={{ fontSize: '0.45rem', color: '#dc2626', fontFamily: 'monospace', alignSelf: 'center', marginLeft: '3px' }}>
            +{marks - MAX_SHOWN}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.4rem', color: '#333', fontFamily: 'monospace' }}>
        {MARK_STATE_THRESHOLDS.map((t, i) => (
          <span
            key={t.state}
            style={{ color: marks >= t.min ? t.color : '#333', fontWeight: progress.state === t.state ? 700 : 400 }}
          >
            {i === 0 ? t.label : `${t.min}+ ${t.label}`}
          </span>
        ))}
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
}) {
  const [confirmClear, setConfirmClear] = useState(false)

  const marks = character.damageMarks ?? 0
  const physicalState = character.physicalState ?? 'bem'
  const stateOpt = getPhysicalStateOption(physicalState)
  const progress = getMarkProgress(marks)

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

      {/* Cabeçalho: estado + total de marcas */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.35rem 0.5rem',
        background: `${stateOpt.color}11`,
        border: `1px solid ${stateOpt.color}33`,
        borderRadius: '4px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Shield size={12} style={{ color: stateOpt.color }} />
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: stateOpt.color }}>
            {stateOpt.label}
          </span>
        </div>
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: stateOpt.color, fontFamily: 'monospace' }}>
          {marks}{maxMarks > 0 ? `/${maxMarks}` : ''} marca{marks !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Barra de progresso */}
      <MarksProgressBar marks={marks} />

      {/* Próximo estado */}
      {progress.marksToNextTier != null && (
        <div style={{ fontSize: '0.5rem', color: '#444', fontFamily: 'monospace', textAlign: 'right' }}>
          {progress.marksToNextTier} marca{progress.marksToNextTier !== 1 ? 's' : ''} para{' '}
          <span style={{ color: MARK_STATE_THRESHOLDS.find(t => t.state === progress.nextState)?.color ?? '#666' }}>
            {MARK_STATE_THRESHOLDS.find(t => t.state === progress.nextState)?.label}
          </span>
        </div>
      )}

      {/* Botões de aplicar dano */}
      <div style={{ display: 'flex', gap: '0.3rem' }}>
        {Object.values(DAMAGE_MARK_TYPES).map(type => {
          const meta = DAMAGE_MARK_META[type]
          return (
            <button
              key={type}
              type="button"
              onClick={() => handleApply(type)}
              title={`${meta.description} (+${meta.value} marca)`}
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
                transition: 'background 0.12s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1px',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${meta.color}22` }}
              onMouseLeave={e => { e.currentTarget.style.background = `${meta.color}11` }}
            >
              <span>{meta.label}</span>
              <span style={{ fontSize: '0.45rem', opacity: 0.75 }}>+{meta.value}</span>
            </button>
          )
        })}
      </div>

      {/* Cura / limpar */}
      <div style={{ display: 'flex', gap: '0.3rem' }}>
        <button
          type="button"
          onClick={() => onHealMarks?.(1)}
          disabled={marks === 0}
          title="Curar 1 marca"
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
          <Minus size={9} /> −1
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={marks === 0}
          title={confirmClear ? 'Clique novamente para confirmar' : 'Limpar todas as marcas (descanso)'}
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
            transition: 'all 0.15s',
          }}
        >
          <Trash2 size={9} />
          {confirmClear ? 'Confirmar?' : 'Limpar marcas'}
        </button>
      </div>

    </div>
  )
}
