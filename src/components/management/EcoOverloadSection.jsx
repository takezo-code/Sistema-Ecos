import React, { useState } from 'react'
import { Activity, RotateCcw, AlertTriangle } from 'lucide-react'
import { getEcoOverloadSnapshot } from '../../services/ecoOverloadService'
import { ECO_OVERLOAD_PHASES, ECO_OVERLOAD_OVERAGE_TO_TOTAL } from '../../constants/ecoOverload'
import { Button } from '../ui/Button'

const PHASE_LABELS = {
  [ECO_OVERLOAD_PHASES.STABLE]: { label: 'Estável', color: '#16a34a' },
  [ECO_OVERLOAD_PHASES.SHAKEN]: { label: 'Sobrecarga', color: '#eab308' },
  [ECO_OVERLOAD_PHASES.RUPTURE]: { label: 'Ruptura de Eco', color: '#ea580c' },
  [ECO_OVERLOAD_PHASES.TOTAL]: { label: 'Ruptura Total', color: '#dc2626' },
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={14} style={{ color: '#a855f7' }} />
          <span style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
            SOBRECARGA DE ECO
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: phaseMeta.color, fontWeight: 700 }}>
          {snapshot.display} · {phaseMeta.label.toUpperCase()}
        </span>
      </div>

      <div style={{ height: '8px', background: '#111', borderRadius: '4px', overflow: 'hidden', border: '1px solid #1a1a1a' }}>
        <div style={{
          width: `${barPercent}%`,
          height: '100%',
          background: barColor,
          transition: 'width 0.25s ease',
          boxShadow: snapshot.inRupturePhase ? `0 0 12px ${barColor}66` : 'none',
        }} />
      </div>

      {snapshot.activeMentalStatuses.length > 0 && (
        <div style={{
          background: 'rgba(234,179,8,0.06)',
          border: '1px solid rgba(234,179,8,0.2)',
          borderRadius: '4px',
          padding: '0.625rem 0.75rem',
        }}>
          <div style={{ fontSize: '0.55rem', color: '#eab308', fontFamily: 'monospace', marginBottom: '0.35rem' }}>
            ESTADOS MENTAIS ATIVOS
          </div>
          {snapshot.activeMentalStatuses.map(status => (
            <div key={status.id} style={{ marginBottom: '0.35rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: status.definition?.color || '#eab308' }}>
                {status.definition?.label || status.effectId}
              </div>
              {(status.definition?.narrativeConsequences || []).map((line, i) => (
                <div key={i} style={{ fontSize: '0.65rem', color: '#666', marginLeft: '0.5rem' }}>· {line}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                background: '#111',
                border: '1px solid #2a2a2a',
                borderRadius: '3px',
                color: '#ccc',
                fontSize: '0.7rem',
                padding: '4px 6px',
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
        <div style={{
          background: 'rgba(220,38,38,0.08)',
          border: '1px solid rgba(220,38,38,0.25)',
          borderRadius: '4px',
          padding: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
            <AlertTriangle size={14} style={{ color: '#dc2626' }} />
            <span style={{ fontSize: '0.6rem', color: '#dc2626', fontFamily: 'monospace' }}>EVENTOS CRÍTICOS</span>
            {onClearEvents && (
              <button type="button" className="btn-ghost" onClick={onClearEvents}
                style={{ marginLeft: 'auto', fontSize: '0.6rem' }}>Limpar</button>
            )}
          </div>
          {lastOverloadEvents.map((ev, i) => (
            <div key={i} style={{ fontSize: '0.75rem', color: '#ccc', marginBottom: '0.35rem' }}>
              <strong style={{ color: '#dc2626' }}>{ev.outcome?.label || 'Ruptura'}</strong>
              <div style={{ fontSize: '0.7rem', color: '#888' }}>{ev.outcome?.description}</div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
