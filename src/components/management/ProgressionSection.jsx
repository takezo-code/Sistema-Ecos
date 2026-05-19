import React, { useState, useEffect } from 'react'
import { Sparkles, ChevronUp, ChevronDown } from 'lucide-react'
import { Input } from '../ui/Field'
import { MAX_LEVEL } from '../../constants/progression'
import { getXpProgress } from '../../services/progressionService'
import { getProgressionSnapshot, validateProgression } from '../../services/progressionBudget'

function AdminStepper({ label, value, min, max, onChange, color = '#e5e5e5' }) {
  const atMin = value <= min
  const atMax = value >= max
  return (
    <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '4px', padding: '0.5rem 0.75rem', flex: 1, minWidth: '120px' }}>
      <div style={{ fontSize: '0.6rem', color: '#444', fontFamily: 'monospace', marginBottom: '4px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <button type="button" disabled={atMin} onClick={() => onChange(value - 1)}
          style={{ background: '#1a1a1a', border: 'none', color: atMin ? '#222' : '#666', cursor: atMin ? 'not-allowed' : 'pointer', padding: '2px 5px', borderRadius: '2px', display: 'flex' }}>
          <ChevronDown size={12} />
        </button>
        <span style={{ fontSize: '1.25rem', fontWeight: 700, color, flex: 1, textAlign: 'center' }}>{value}</span>
        <button type="button" disabled={atMax} onClick={() => onChange(value + 1)}
          style={{ background: '#1a1a1a', border: 'none', color: atMax ? '#222' : '#666', cursor: atMax ? 'not-allowed' : 'pointer', padding: '2px 5px', borderRadius: '2px', display: 'flex' }}>
          <ChevronUp size={12} />
        </button>
      </div>
    </div>
  )
}

export function ProgressionSection({
  entity,
  levelUps = [],
  adminMode = false,
  onMasterProgression,
  onSyncProgression,
  onClampAuxiliary,
  onScaleAttributes,
  masterError,
}) {
  const [xpDirect, setXpDirect] = useState(String(entity.xp ?? 0))
  useEffect(() => {
    setXpDirect(String(entity.xp ?? 0))
  }, [entity.id, entity.xp])
  const level = entity.level ?? 1
  const progress = getXpProgress(entity)
  const atMax = level >= MAX_LEVEL
  const snapshot = adminMode ? getProgressionSnapshot(entity) : null
  const validation = adminMode ? validateProgression(entity) : null

  const applyXpDirect = () => {
    const xp = Math.max(0, parseInt(xpDirect, 10) || 0)
    onMasterProgression?.({ xp })
  }

  return (
    <div>
      <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
        NÍVEL E EXPERIÊNCIA
        {adminMode && <span style={{ marginLeft: '0.5rem', color: '#d97706' }}>· MODO MESTRE</span>}
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '4px', padding: '0.75rem 1rem', minWidth: '100px' }}>
          <div style={{ fontSize: '0.6rem', color: '#a855f7', fontFamily: 'monospace', marginBottom: '4px' }}>NÍVEL</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: atMax ? '#d97706' : '#e5e5e5', lineHeight: 1 }}>
            {level}
            <span style={{ fontSize: '0.65rem', color: '#444', fontWeight: 400 }}> / {MAX_LEVEL}</span>
          </div>
        </div>

        <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '4px', padding: '0.75rem 1rem', flex: 1, minWidth: '200px' }}>
          <div style={{ fontSize: '0.6rem', color: '#d97706', fontFamily: 'monospace', marginBottom: '4px' }}>XP (PRÓXIMO NÍVEL)</div>
          {atMax ? (
            <div style={{ fontSize: '0.8rem', color: '#d97706', fontStyle: 'italic' }}>Nível máximo atingido</div>
          ) : (
            <>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e5e5e5', marginBottom: '6px' }}>
                {progress.current}
                <span style={{ fontSize: '0.75rem', color: '#444', fontWeight: 400 }}> / {progress.needed}</span>
              </div>
              <div style={{ height: '4px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress.percent}%`, background: '#d97706', transition: 'width 0.3s' }} />
              </div>
              <div style={{ fontSize: '0.6rem', color: '#333', fontFamily: 'monospace', marginTop: '4px' }}>
                Fórmula: nível × 150 XP
              </div>
            </>
          )}
        </div>

        <div style={{ background: '#0d0d0d', border: '1px solid rgba(168,85,247,0.15)', borderRadius: '4px', padding: '0.75rem 1rem', minWidth: '80px' }}>
          <div style={{ fontSize: '0.6rem', color: '#a855f7', fontFamily: 'monospace', marginBottom: '4px' }}>ECOS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#e5e5e5' }}>{entity.ecoPoints ?? 0}</div>
        </div>
      </div>

      {adminMode && snapshot && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '1rem',
          padding: '0.75rem',
          background: 'rgba(217,119,6,0.05)',
          border: '1px solid rgba(217,119,6,0.15)',
          borderRadius: '4px',
        }}>
          <AdminStepper
            label="NÍVEL"
            value={level}
            min={1}
            max={MAX_LEVEL}
            color="#a855f7"
            onChange={v => onMasterProgression?.({ level: v })}
          />
          <AdminStepper
            label={`ECOS (máx ${snapshot.maxEcoFree})`}
            value={entity.ecoPoints ?? 0}
            min={0}
            max={snapshot.maxEcoFree}
            color="#a855f7"
            onChange={v => onMasterProgression?.({ ecoPoints: v })}
          />
          <AdminStepper
            label={`PTS PEND. (máx ${snapshot.maxPending})`}
            value={entity.pendingAttributePoints ?? 0}
            min={0}
            max={snapshot.maxPending}
            color="#d97706"
            onChange={v => onMasterProgression?.({ pendingAttributePoints: v })}
          />
          <AdminStepper
            label="PTS CRIAÇÃO"
            value={entity.unspentAttributePoints ?? 0}
            min={0}
            max={Math.max(0, snapshot.available - (entity.pendingAttributePoints ?? 0))}
            color="#16a34a"
            onChange={v => onMasterProgression?.({ unspentAttributePoints: v })}
          />
          <div style={{ flex: '1 1 180px', minWidth: '180px' }}>
            <div style={{ fontSize: '0.6rem', color: '#444', fontFamily: 'monospace', marginBottom: '4px' }}>XP ATUAL</div>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <Input
                type="number"
                min="0"
                value={xpDirect}
                onChange={e => setXpDirect(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyXpDirect())}
                style={{ flex: 1 }}
              />
              <button type="button" className="btn-ghost" onClick={applyXpDirect} style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                Aplicar
              </button>
            </div>
          </div>
          <div style={{ flex: '1 1 100%', display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={onSyncProgression}
              disabled={validation?.valid === false && snapshot.spent > snapshot.budget}
              style={{ flex: 1, fontSize: '0.7rem', minWidth: '140px' }}
              title="Recalcula pools e ecos (requer atributos válidos)"
            >
              Sincronizar pontos ao nível
            </button>
            {validation && !validation.valid && (
              <>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={onClampAuxiliary}
                  style={{ flex: 1, fontSize: '0.7rem', minWidth: '140px', color: '#d97706' }}
                  title="Ajusta XP, Ecos e pools ao teto do nível"
                >
                  Corrigir XP / Ecos / pools
                </button>
                {snapshot.spent > snapshot.budget && (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={onScaleAttributes}
                    style={{ flex: '1 1 100%', fontSize: '0.7rem' }}
                    title="Reduz atributos excedentes e sincroniza"
                  >
                    Ajustar atributos ao teto ({snapshot.budget} pts)
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {adminMode && (masterError || (validation && !validation.valid)) && (
        <div style={{
          fontSize: '0.7rem',
          color: '#dc2626',
          background: 'rgba(220,38,38,0.08)',
          border: '1px solid rgba(220,38,38,0.2)',
          borderRadius: '3px',
          padding: '0.5rem 0.75rem',
          marginBottom: '0.75rem',
        }}>
          {masterError?.message || validation?.errors[0]?.message}
        </div>
      )}

      {adminMode && snapshot && (
        <div style={{ fontSize: '0.6rem', color: '#444', fontFamily: 'monospace', marginBottom: '0.75rem' }}>
          Orçamento nv.{level}: {snapshot.budget} pts status · {snapshot.ecoBudget} Ecos
          {snapshot.ecoSpent > 0 && ` (${snapshot.ecoSpent} em habilidades)`}
        </div>
      )}

      {levelUps.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {levelUps.map((lu, i) => (
            <div key={i} style={{
              fontSize: '0.75rem',
              color: lu.type === 'eco' ? '#a855f7' : '#16a34a',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid #1a1a1a',
              borderRadius: '3px',
              padding: '0.5rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <Sparkles size={12} />
              {lu.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
