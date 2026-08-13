import React, { useState } from 'react'
import { Activity, RotateCcw, AlertTriangle } from 'lucide-react'
import { getEcoOverloadSnapshot } from '../../services/ecoOverloadService'
import { ECO_OVERLOAD_PHASES, ECO_OVERLOAD_OVERAGE_TO_TOTAL } from '../../constants/ecoOverload'
import { Button } from '../ui/Button'
import SpotlightCard from '../react-bits/SpotlightCard'
import GlowingBadge from '../ui/GlowingBadge'
import GlassSurface from '../react-bits/GlassSurface'

const PHASE_LABELS = {
  [ECO_OVERLOAD_PHASES.STABLE]: { label: 'Estável', color: '#4ade80', variant: 'success' },
  [ECO_OVERLOAD_PHASES.SHAKEN]: { label: 'Sobrecarga', color: '#fbbf24', variant: 'warning' },
  [ECO_OVERLOAD_PHASES.RUPTURE]: { label: 'Ruptura de Eco', color: '#fb923c', variant: 'warning' },
  [ECO_OVERLOAD_PHASES.TOTAL]: { label: 'Ruptura Total', color: '#f87171', variant: 'error' },
}

export function EcoOverloadSection({
  entity,
  onRestOverload,
  onSetOverload,
  lastOverloadEvents = [],
  onClearEvents,
}) {
  const snapshot = getEcoOverloadSnapshot(entity)
  const phaseMeta = PHASE_LABELS[snapshot.phase] || PHASE_LABELS[ECO_OVERLOAD_PHASES.STABLE]
  const [masterLevel, setMasterLevel] = useState(String(snapshot.overload))
  const lim = snapshot.safeLimit

  const barPercent = Math.min(100, (snapshot.overload / Math.max(lim, 1)) * 100)
  const barColor = snapshot.inRupturePhase ? '#dc2626' : snapshot.atCap ? '#eab308' : '#a855f7'

  return (
    <SpotlightCard
      spotlightColor={`${phaseMeta.color}22`}
      style={{ padding: '0.95rem 1.05rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={14} style={{ color: '#a855f7' }} />
          <span style={{ fontSize: '0.65rem', color: '#888', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
            SOBRECARGA DE ECO
          </span>
        </div>
        <GlowingBadge variant={phaseMeta.variant} pulse dot>
          {snapshot.display} · {phaseMeta.label}
        </GlowingBadge>
      </div>

      <div style={{
        height: 10,
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 999,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{
          width: `${barPercent}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${barColor}aa, ${barColor})`,
          transition: 'width 0.25s ease',
          boxShadow: `0 0 14px ${barColor}66`,
        }} />
      </div>

      {snapshot.activeMentalStatuses.length > 0 && (
        <GlassSurface borderRadius={10} padding="0.65rem 0.75rem">
          <div style={{ fontSize: '0.55rem', color: '#eab308', fontFamily: 'monospace', marginBottom: '0.35rem', letterSpacing: '0.08em' }}>
            ESTADOS MENTAIS ATIVOS
          </div>
          {snapshot.activeMentalStatuses.map(status => (
            <div key={status.id} style={{ marginBottom: '0.35rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: status.definition?.color || '#eab308' }}>
                {status.definition?.label || status.effectId}
              </div>
              {(status.definition?.narrativeConsequences || []).map((line, i) => (
                <div key={i} style={{ fontSize: '0.65rem', color: '#888', marginLeft: '0.5rem' }}>· {line}</div>
              ))}
            </div>
          ))}
        </GlassSurface>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {onRestOverload && (
          <Button type="button" variant="secondary" size="xs" onClick={onRestOverload}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <RotateCcw size={12} /> Descansar Eco (0/{lim})
          </Button>
        )}
        {onSetOverload && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <input
              type="number"
              min={0}
              max={lim + ECO_OVERLOAD_OVERAGE_TO_TOTAL + 5}
              value={masterLevel}
              onChange={e => setMasterLevel(e.target.value)}
              style={{
                width: '48px',
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#ccc',
                fontSize: '0.7rem',
                padding: '6px 8px',
                fontFamily: 'monospace',
              }}
            />
            <button type="button" className="btn-ghost" style={{ fontSize: '0.65rem' }}
              onClick={() => onSetOverload(Number(masterLevel) || 0)}>
              Ajustar (mestre)
            </button>
          </div>
        )}
      </div>

      {lastOverloadEvents?.length > 0 && (
        <GlassSurface borderRadius={10} padding="0.75rem" style={{ borderColor: 'rgba(220,38,38,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
            <AlertTriangle size={14} style={{ color: '#f87171' }} />
            <span style={{ fontSize: '0.6rem', color: '#f87171', fontFamily: 'monospace', letterSpacing: '0.08em' }}>EVENTOS CRÍTICOS</span>
            {onClearEvents && (
              <button type="button" className="btn-ghost" onClick={onClearEvents}
                style={{ marginLeft: 'auto', fontSize: '0.6rem' }}>Limpar</button>
            )}
          </div>
          {lastOverloadEvents.map((ev, i) => (
            <div key={i} style={{ fontSize: '0.75rem', color: '#ccc', marginBottom: '0.35rem' }}>
              <strong style={{ color: '#f87171' }}>{ev.outcome?.label || 'Ruptura'}</strong>
              <div style={{ fontSize: '0.7rem', color: '#888' }}>{ev.outcome?.description}</div>
            </div>
          ))}
        </GlassSurface>
      )}
    </SpotlightCard>
  )
}
