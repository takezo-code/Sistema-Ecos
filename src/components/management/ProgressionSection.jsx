import React, { useState, useEffect, useMemo } from 'react'
import { ChevronUp, ChevronDown, TrendingUp, AlertTriangle } from 'lucide-react'
import { Input } from '../ui/Field'
import { MAX_LEVEL } from '../../constants/progression'
import { getProgressionSnapshot, validateProgression } from '../../services/progressionBudget'
import { entityHasEcoPowers, isNpcEntity } from '../../constants/entityProgression'
import { isInCreationPhase, STARTING_ATTRIBUTE_POINTS } from '../../constants/attributes'
import { Button } from '../ui/Button'
import { PanelSection, SectionLabel, MetaChip } from './PanelSection'

function clampLevel(value) {
  return Math.min(MAX_LEVEL, Math.max(1, value))
}

function StatCard({ label, value, suffix, color = '#e5e5e5', accent = '#666', warn = false }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 92,
      padding: '0.6rem 0.75rem',
      borderRadius: 10,
      border: `1px solid ${warn ? 'rgba(220,38,38,0.35)' : 'rgba(255,255,255,0.07)'}`,
      background: 'rgba(255,255,255,0.025)',
    }}>
      <div style={{
        fontSize: '0.55rem',
        fontFamily: 'monospace',
        letterSpacing: '0.1em',
        color: accent,
        marginBottom: 4,
        textTransform: 'uppercase',
      }}>
        {label}
      </div>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.02em' }}>
        {value}
        {suffix != null && (
          <span style={{ fontSize: '0.62rem', color: '#555', fontWeight: 400 }}> / {suffix}</span>
        )}
      </div>
    </div>
  )
}

function Stepper({ label, value, min, max, onChange, color = '#e5e5e5' }) {
  const atMin = value <= min
  const atMax = value >= max
  const btn = (disabled) => ({
    width: 26,
    height: 26,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    color: disabled ? '#333' : '#999',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: 0,
  })

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.6rem',
      padding: '0.55rem 0.7rem',
      borderRadius: 10,
      border: '1px solid rgba(255,255,255,0.07)',
      background: 'rgba(255,255,255,0.02)',
    }}>
      <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#777', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <button type="button" disabled={atMin} onClick={() => onChange(value - 1)} style={btn(atMin)}>
          <ChevronDown size={13} />
        </button>
        <span style={{ fontSize: '1rem', fontWeight: 800, color, minWidth: 24, textAlign: 'center' }}>{value}</span>
        <button type="button" disabled={atMax} onClick={() => onChange(value + 1)} style={btn(atMax)}>
          <ChevronUp size={13} />
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

  const availableChips = []
  if (!adminMode) {
    if (pending > 0) availableChips.push({ key: 'attr', color: '#d97706', text: `${pending} atributo` })
    if (pendingSocial > 0) availableChips.push({ key: 'social', color: '#e879f9', text: `${pendingSocial} cena` })
    if (pool > 0) availableChips.push({ key: 'pool', color: '#16a34a', text: `${pool} criação` })
    if (hasEco && (entity.ecoPoints ?? 0) > 0) {
      availableChips.push({ key: 'eco', color: '#a855f7', text: `${entity.ecoPoints} eco` })
    }
  }

  const errorMessage = masterError?.message || (validation && !validation.valid ? validation.errors[0]?.message : null)

  return (
    <PanelSection
      icon={TrendingUp}
      title="Nível e progressão"
      accent="#a855f7"
      meta={availableChips.length > 0 ? (
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {availableChips.map(chip => (
            <MetaChip key={chip.key} color={chip.color} tone="solid">{chip.text}</MetaChip>
          ))}
        </div>
      ) : null}
    >
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <StatCard
          label="Nível"
          value={level}
          suffix={MAX_LEVEL}
          accent="#a855f7"
          color={atMax ? '#d97706' : '#f0f0f0'}
        />
        {hasEco && (
          <StatCard label="Ecos" value={entity.ecoPoints ?? 0} accent="#a855f7" />
        )}
        {adminMode && snapshot && (
          <>
            <StatCard
              label="Pts atributos"
              value={snapshot.spent}
              suffix={snapshot.budget}
              accent="#d97706"
              warn={snapshot.spent > snapshot.budget}
              color={snapshot.spent > snapshot.budget ? '#f87171' : '#f0f0f0'}
            />
            <StatCard
              label="Pts cena"
              value={snapshot.socialSpent}
              suffix={snapshot.socialBudget}
              accent="#e879f9"
              warn={snapshot.socialSpent > snapshot.socialBudget}
              color={snapshot.socialSpent > snapshot.socialBudget ? '#f87171' : '#f0f0f0'}
            />
          </>
        )}
      </div>

      {adminMode && snapshot && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.7rem',
          padding: '0.8rem',
          borderRadius: 10,
          border: '1px solid rgba(217,119,6,0.18)',
          background: 'rgba(217,119,6,0.045)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
            <SectionLabel accent="#d97706">Ajustes do mestre</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                type="button"
                disabled={parsedLevelDraft <= 1}
                onClick={() => nudgeLevel(-1)}
                style={{
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  color: parsedLevelDraft <= 1 ? '#333' : '#999',
                  cursor: parsedLevelDraft <= 1 ? 'not-allowed' : 'pointer',
                  padding: 0,
                }}
              >
                <ChevronDown size={14} />
              </button>
              <Input
                type="number"
                min="1"
                max={MAX_LEVEL}
                value={levelDraft}
                onChange={e => setLevelDraft(e.target.value)}
                style={{ width: '64px', textAlign: 'center', padding: '5px 8px' }}
              />
              <button
                type="button"
                disabled={parsedLevelDraft >= MAX_LEVEL}
                onClick={() => nudgeLevel(1)}
                style={{
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  color: parsedLevelDraft >= MAX_LEVEL ? '#333' : '#999',
                  cursor: parsedLevelDraft >= MAX_LEVEL ? 'not-allowed' : 'pointer',
                  padding: 0,
                }}
              >
                <ChevronUp size={14} />
              </button>
            </div>
          </div>

          {(showCreationPool || (hasEco && snapshot.maxEcoFree > 0)) && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.5rem',
            }}>
              {showCreationPool && (
                <Stepper
                  label="PTS DE CRIAÇÃO"
                  value={poolDraft}
                  min={0}
                  max={Math.max(0, STARTING_ATTRIBUTE_POINTS - snapshot.spent + (entity.unspentAttributePoints ?? 0))}
                  color="#4ade80"
                  onChange={setPoolDraft}
                />
              )}
              {hasEco && snapshot.maxEcoFree > 0 && (
                <Stepper
                  label={`ECOS (MÁX ${snapshot.maxEcoFree})`}
                  value={ecoDraft}
                  min={0}
                  max={snapshot.maxEcoFree}
                  color="#c084fc"
                  onChange={setEcoDraft}
                />
              )}
            </div>
          )}

          {(pending > 0 || pendingSocial > 0) && !showCreationPool && (
            <p style={{ fontSize: '0.72rem', color: '#888', margin: 0, lineHeight: 1.5 }}>
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

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              type="button"
              size="xs"
              onClick={confirmChanges}
              disabled={!isDirty}
              style={{ opacity: isDirty ? 1 : 0.45, cursor: isDirty ? 'pointer' : 'not-allowed' }}
            >
              Confirmar alterações
            </Button>
            {isDirty && (
              <button type="button" className="btn-ghost" onClick={resetDrafts} style={{ fontSize: '0.7rem' }}>
                Descartar
              </button>
            )}
            {validation && !validation.valid && (
              <>
                <button type="button" className="btn-ghost" onClick={onClampAuxiliary} style={{ fontSize: '0.7rem', color: '#d97706' }}>
                  Corrigir XP / Ecos
                </button>
                {snapshot.spent > snapshot.budget && (
                  <Button type="button" variant="secondary" size="xs" onClick={onScaleAttributes}>
                    Ajustar atributos ({snapshot.budget} pts)
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {adminMode && errorMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5rem',
          fontSize: '0.7rem',
          color: '#f87171',
          background: 'rgba(220,38,38,0.07)',
          border: '1px solid rgba(220,38,38,0.22)',
          borderRadius: 10,
          padding: '0.55rem 0.7rem',
          lineHeight: 1.45,
        }}>
          <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{errorMessage}</span>
        </div>
      )}
    </PanelSection>
  )
}
