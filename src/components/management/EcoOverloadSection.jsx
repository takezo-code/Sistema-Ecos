import React, { useState } from 'react'
import { Activity, AlertTriangle, Minus, Plus } from 'lucide-react'
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
  onSetOverload,
  lastOverloadEvents = [],
  onClearEvents,
}) {
  const snapshot = getEcoOverloadSnapshot(entity)
  const phaseMeta = PHASE_LABELS[snapshot.phase] || PHASE_LABELS[ECO_OVERLOAD_PHASES.STABLE]
  const [masterLevel, setMasterLevel] = useState(String(snapshot.overload))
  const lim = snapshot.safeLimit
  const maxLevel = lim + ECO_OVERLOAD_OVERAGE_TO_TOTAL + 5

  const barPercent = Math.min(100, (snapshot.overload / Math.max(lim, 1)) * 100)
  const barColor = snapshot.inRupturePhase ? '#dc2626' : snapshot.atCap ? '#eab308' : '#a855f7'

  const nudgeLevel = (delta) => {
    const current = Number(masterLevel)
    const base = Number.isFinite(current) ? current : 0
    const next = Math.max(0, Math.min(maxLevel, base + delta))
    setMasterLevel(String(next))
  }

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

      {onSetOverload && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <Button
            type="button"
            variant="secondary"
            size="xs"
            onClick={() => nudgeLevel(-1)}
            aria-label="Diminuir sobrecarga"
            style={{ width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Minus size={12} />
          </Button>
          <input
            type="number"
            min={0}
            max={maxLevel}
            value={masterLevel}
            onChange={e => setMasterLevel(e.target.value)}
            aria-label="Nível de sobrecarga (mestre)"
            className="input-base"
            style={{
              width: '52px',
              textAlign: 'center',
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px',
              color: '#e5e5e5',
              fontSize: '0.75rem',
              padding: '6px 8px',
              fontFamily: 'monospace',
              MozAppearance: 'textfield',
              appearance: 'textfield',
            }}
          />
          <Button
            type="button"
            variant="secondary"
            size="xs"
            onClick={() => nudgeLevel(1)}
            aria-label="Aumentar sobrecarga"
            style={{ width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Plus size={12} />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="xs"
            onClick={() => onSetOverload(Number(masterLevel) || 0)}
          >
            Confirmar
          </Button>
        </div>
      )}

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
