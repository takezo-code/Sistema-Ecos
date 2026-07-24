import React, { useState, useEffect, useMemo } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Input } from '../ui/Field'
import { MAX_LEVEL } from '../../constants/progression'
import { getXpProgress } from '../../services/progressionService'
import { getProgressionSnapshot, validateProgression } from '../../services/progressionBudget'
import { entityHasEcoPowers, isNpcEntity } from '../../constants/entityProgression'
import { isInCreationPhase, STARTING_ATTRIBUTE_POINTS, STARTING_SOCIAL_POINTS } from '../../constants/attributes'

function clampLevel(value) {
  return Math.min(MAX_LEVEL, Math.max(1, value))
}

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
  adminMode = false,
  onMasterProgression,
  onSyncProgression,
  onClampAuxiliary,
  onScaleAttributes,
  masterError,
}) {
  const [levelDraft, setLevelDraft] = useState(String(entity.level ?? 1))
  const [ecoDraft, setEcoDraft] = useState(entity.ecoPoints ?? 0)
  const [poolDraft, setPoolDraft] = useState(entity.unspentAttributePoints ?? 0)

  useEffect(() => {
    setLevelDraft(String(entity.level ?? 1))
    setEcoDraft(entity.ecoPoints ?? 0)
    setPoolDraft(entity.unspentAttributePoints ?? 0)
  }, [entity.id, entity.level, entity.ecoPoints, entity.unspentAttributePoints])

  const level = entity.level ?? 1
  const progress = getXpProgress(entity)
  const atMax = level >= MAX_LEVEL
  const snapshot = getProgressionSnapshot(entity)
  const validation = adminMode ? validateProgression(entity) : null
  const pending = entity.pendingAttributePoints ?? 0
  const pendingSocial = entity.pendingSocialPoints ?? 0
  const pool = entity.unspentAttributePoints ?? 0
  const hasEco = entityHasEcoPowers(entity)
  const inCreation = isInCreationPhase(entity)
  const showCreationPool = inCreation && (pool > 0 || poolDraft > 0)
  const isNpc = isNpcEntity(entity)

  const parsedLevelDraft = clampLevel(parseInt(levelDraft, 10) || 1)

  const isDirty = useMemo(() => {
    if (parsedLevelDraft !== level) return true
    if (hasEco && ecoDraft !== (entity.ecoPoints ?? 0)) return true
    if (showCreationPool && poolDraft !== (entity.unspentAttributePoints ?? 0)) return true
    return false
  }, [parsedLevelDraft, level, hasEco, ecoDraft, entity.ecoPoints, showCreationPool, poolDraft, entity.unspentAttributePoints])

  const resetDrafts = () => {
    setLevelDraft(String(entity.level ?? 1))
    setEcoDraft(entity.ecoPoints ?? 0)
    setPoolDraft(entity.unspentAttributePoints ?? 0)
  }

  const confirmChanges = () => {
    if (!isDirty) return
    const nextLevel = parsedLevelDraft
    const patch = { level: nextLevel }
    if (hasEco) patch.ecoPoints = ecoDraft
    if (showCreationPool) patch.unspentAttributePoints = poolDraft
    onMasterProgression?.(patch)
    if (nextLevel !== level) {
      queueMicrotask(() => onSyncProgression?.())
    }
  }

  const nudgeLevel = (delta) => {
    setLevelDraft(String(clampLevel(parsedLevelDraft + delta)))
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

        {hasEco && (
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(168,85,247,0.15)', borderRadius: '4px', padding: '0.75rem 1rem', minWidth: '80px' }}>
            <div style={{ fontSize: '0.6rem', color: '#a855f7', fontFamily: 'monospace', marginBottom: '4px' }}>ECOS</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#e5e5e5' }}>{entity.ecoPoints ?? 0}</div>
          </div>
        )}
      </div>

      {!adminMode && (pending > 0 || pool > 0 || (entity.ecoPoints ?? 0) > 0 || (entity.pendingSocialPoints ?? 0) > 0) && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '0.75rem',
          padding: '0.625rem 0.75rem',
          background: '#0d0d0d',
          border: '1px solid #1a1a1a',
          borderRadius: '4px',
        }}>
          <div style={{ fontSize: '0.6rem', color: '#444', fontFamily: 'monospace', width: '100%', marginBottom: '2px' }}>
            PONTOS DISPONÍVEIS
          </div>
          {pending > 0 && (
            <span style={{ fontSize: '0.7rem', color: '#d97706', fontFamily: 'monospace' }}>
              {pending} ponto(s) de atributo pendente(s)
            </span>
          )}
          {(entity.pendingSocialPoints ?? 0) > 0 && (
            <span style={{ fontSize: '0.7rem', color: '#e879f9', fontFamily: 'monospace' }}>
              {entity.pendingSocialPoints} ponto(s) de cena pendente(s)
            </span>
          )}
          {pool > 0 && (
            <span style={{ fontSize: '0.7rem', color: '#16a34a', fontFamily: 'monospace' }}>
              {pool} ponto(s) de criação
            </span>
          )}
          {hasEco && (entity.ecoPoints ?? 0) > 0 && (
            <span style={{ fontSize: '0.7rem', color: '#a855f7', fontFamily: 'monospace' }}>
              {entity.ecoPoints} Eco(s) para skills
            </span>
          )}
        </div>
      )}

      {adminMode && snapshot && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginBottom: '1rem',
          padding: '0.75rem',
          background: 'rgba(217,119,6,0.05)',
          border: '1px solid rgba(217,119,6,0.15)',
          borderRadius: '4px',
        }}>
          <div>
            <div style={{ fontSize: '0.6rem', color: '#444', fontFamily: 'monospace', marginBottom: '4px' }}>ALTERAR NÍVEL</div>
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              <button
                type="button"
                disabled={parsedLevelDraft <= 1}
                onClick={() => nudgeLevel(-1)}
                style={{ background: '#1a1a1a', border: 'none', color: parsedLevelDraft <= 1 ? '#222' : '#666', cursor: parsedLevelDraft <= 1 ? 'not-allowed' : 'pointer', padding: '6px 8px', borderRadius: '2px', display: 'flex' }}
              >
                <ChevronDown size={14} />
              </button>
              <Input
                type="number"
                min="1"
                max={MAX_LEVEL}
                value={levelDraft}
                onChange={e => setLevelDraft(e.target.value)}
                style={{ width: '64px', textAlign: 'center' }}
              />
              <button
                type="button"
                disabled={parsedLevelDraft >= MAX_LEVEL}
                onClick={() => nudgeLevel(1)}
                style={{ background: '#1a1a1a', border: 'none', color: parsedLevelDraft >= MAX_LEVEL ? '#222' : '#666', cursor: parsedLevelDraft >= MAX_LEVEL ? 'not-allowed' : 'pointer', padding: '6px 8px', borderRadius: '2px', display: 'flex' }}
              >
                <ChevronUp size={14} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
            <div style={{
              background: pending > 0 ? 'rgba(217,119,6,0.08)' : '#0d0d0d',
              border: `1px solid ${pending > 0 ? 'rgba(217,119,6,0.25)' : '#1a1a1a'}`,
              borderRadius: '4px',
              padding: '0.625rem 0.75rem',
            }}>
              <div style={{ fontSize: '0.55rem', color: '#d97706', fontFamily: 'monospace' }}>PTS ATRIBUTOS</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: snapshot.spent > snapshot.budget ? '#dc2626' : '#e5e5e5' }}>
                {snapshot.spent}<span style={{ fontSize: '0.7rem', color: '#555' }}> / {snapshot.budget}</span>
              </div>
              <div style={{ fontSize: '0.55rem', color: pending > 0 ? '#d97706' : '#333', marginTop: '2px' }}>
                {pending > 0 ? `${pending} para distribuir` : `${STARTING_ATTRIBUTE_POINTS} criação + ${Math.max(0, snapshot.budget - STARTING_ATTRIBUTE_POINTS)} nível`}
              </div>
            </div>
            <div style={{
              background: pendingSocial > 0 ? 'rgba(232,121,249,0.08)' : '#0d0d0d',
              border: `1px solid ${pendingSocial > 0 ? 'rgba(232,121,249,0.25)' : '#1a1a1a'}`,
              borderRadius: '4px',
              padding: '0.625rem 0.75rem',
            }}>
              <div style={{ fontSize: '0.55rem', color: '#e879f9', fontFamily: 'monospace' }}>PTS CENA</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: snapshot.socialSpent > snapshot.socialBudget ? '#dc2626' : '#e5e5e5' }}>
                {snapshot.socialSpent}<span style={{ fontSize: '0.7rem', color: '#555' }}> / {snapshot.socialBudget}</span>
              </div>
              <div style={{ fontSize: '0.55rem', color: pendingSocial > 0 ? '#e879f9' : '#333', marginTop: '2px' }}>
                {pendingSocial > 0
                  ? `${pendingSocial} para distribuir`
                  : `${STARTING_SOCIAL_POINTS} criação + ${snapshot.socialFromLevel} nível`}
              </div>
            </div>
            {hasEco && (
              <div style={{ background: '#0d0d0d', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '4px', padding: '0.625rem 0.75rem' }}>
                <div style={{ fontSize: '0.55rem', color: '#a855f7', fontFamily: 'monospace' }}>PTS ECO</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e5e5e5' }}>{snapshot.ecoFree}</div>
                <div style={{ fontSize: '0.55rem', color: '#333', marginTop: '2px' }}>
                  livres · máx. {snapshot.maxEcoFree} · {snapshot.ecoSpent} em skills
                </div>
              </div>
            )}
          </div>

          {(pending > 0 || pendingSocial > 0) && !showCreationPool && (
            <p style={{ fontSize: '0.75rem', color: '#888', margin: 0, lineHeight: 1.5 }}>
              Use as setas na grade abaixo para gastar
              {pending > 0 && (
                <> <strong style={{ color: '#d97706' }}>{pending} de atributo</strong></>
              )}
              {pending > 0 && pendingSocial > 0 && ' e'}
              {pendingSocial > 0 && (
                <> <strong style={{ color: '#e879f9' }}>{pendingSocial} de cena</strong></>
              )}
              .
              {isNpc && ' Os pontos de criação já foram definidos ao criar o NPC.'}
            </p>
          )}

          {showCreationPool && (
            <AdminStepper
              label="PTS DE CRIAÇÃO (ficha nova)"
              value={poolDraft}
              min={0}
              max={Math.max(0, STARTING_ATTRIBUTE_POINTS - snapshot.spent + (entity.unspentAttributePoints ?? 0))}
              color="#16a34a"
              onChange={setPoolDraft}
            />
          )}

          {hasEco && snapshot.maxEcoFree > 0 && (
            <AdminStepper
              label={`AJUSTAR ECOS (máx ${snapshot.maxEcoFree})`}
              value={ecoDraft}
              min={0}
              max={snapshot.maxEcoFree}
              color="#a855f7"
              onChange={setEcoDraft}
            />
          )}

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={confirmChanges}
              disabled={!isDirty}
              style={{ fontSize: '0.75rem', opacity: isDirty ? 1 : 0.45, cursor: isDirty ? 'pointer' : 'not-allowed' }}
            >
              Confirmar alterações
            </button>
            {isDirty && (
              <button
                type="button"
                className="btn-ghost"
                onClick={resetDrafts}
                style={{ fontSize: '0.7rem' }}
              >
                Descartar
              </button>
            )}
          </div>

          {validation && !validation.valid && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              <button type="button" className="btn-ghost" onClick={onClampAuxiliary} style={{ fontSize: '0.7rem', color: '#d97706' }}>
                Corrigir XP / Ecos
              </button>
              {snapshot.spent > snapshot.budget && (
                <button type="button" className="btn-secondary" onClick={onScaleAttributes} style={{ fontSize: '0.7rem' }}>
                  Ajustar atributos ({snapshot.budget} pts)
                </button>
              )}
            </div>
          )}
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
          Nv.{level}: {snapshot.budget} pts atributos · {snapshot.socialBudget} pts cena
          {hasEco ? ` · ${snapshot.ecoBudget} Ecos` : ' · sem Ecos'}
          {snapshot.ecoSpent > 0 && ` · ${snapshot.ecoSpent} Eco(s) em skills`}
        </div>
      )}

    </div>
  )
}
