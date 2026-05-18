import React from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import {
  ATTRIBUTES,
  STARTING_ATTRIBUTE_POINTS,
  getTotalAttributePoints,
  getAttributeMax,
  getInitialAttributeMax,
} from '../../constants/attributes'
import { PHYSICAL_AFFECTED_KEYS } from '../../constants/states'
import { calculatePhysicalAttributes, formatPhysicalPenalty } from '../../services/stateModifiers'
import { getProgressionSnapshot, validateProgression } from '../../services/progressionBudget'

function AttributeInput({ attr, value, effectiveValue, max, showMax, onChange, canIncrease }) {
  const modified = effectiveValue != null && effectiveValue !== value

  return (
    <div style={{
      background: '#0d0d0d',
      border: `1px solid ${modified ? 'rgba(234,88,12,0.25)' : '#1a1a1a'}`,
      borderRadius: '3px',
      padding: '0.625rem 0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div>
        <div style={{ fontSize: '0.6rem', color: attr.color, fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '2px' }}>
          {attr.label.toUpperCase()}
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e5e5e5', lineHeight: 1 }}>
          {modified ? (
            <>
              <span style={{ color: '#ea580c' }}>{effectiveValue}</span>
              <span style={{ fontSize: '0.65rem', color: '#444', fontWeight: 400, marginLeft: '4px' }}>({value})</span>
            </>
          ) : (
            value
          )}
          {showMax && <span style={{ fontSize: '0.6rem', color: '#333', fontWeight: 400 }}>/{max}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <button type="button"
          disabled={!canIncrease}
          onClick={() => onChange(value + 1)}
          style={{
            background: '#1a1a1a', border: 'none',
            color: canIncrease ? '#666' : '#222',
            cursor: canIncrease ? 'pointer' : 'not-allowed',
            padding: '3px 6px', borderRadius: '2px', display: 'flex',
          }}
        >
          <ChevronUp size={12} />
        </button>
        <button type="button"
          onClick={() => onChange(value - 1)}
          disabled={value <= 0}
          style={{
            background: '#1a1a1a', border: 'none',
            color: value > 0 ? '#666' : '#222',
            cursor: value > 0 ? 'pointer' : 'not-allowed',
            padding: '3px 6px', borderRadius: '2px', display: 'flex',
          }}
        >
          <ChevronDown size={12} />
        </button>
      </div>
    </div>
  )
}

export function AttributeGrid({ entity, onChange, isCreation = false, onSpendPending, adminMode = false }) {
  const pool = entity.unspentAttributePoints ?? 0
  const pending = entity.pendingAttributePoints ?? 0
  const spent = getTotalAttributePoints(entity.attributes)
  const snapshot = adminMode ? getProgressionSnapshot(entity) : null
  const validation = adminMode ? validateProgression(entity) : null
  const rupture = entity.attributes?.ruptura ?? 0
  const physicalState = entity.physicalState ?? 'bem'
  const { effective: effectiveAttrs } = calculatePhysicalAttributes(entity.attributes, physicalState)
  const physicalPenalty = formatPhysicalPenalty(physicalState)

  const handleChange = (key, newVal) => {
    if (adminMode) {
      onChange?.(key, newVal, { admin: true })
      return
    }
    if (onSpendPending && pending > 0) {
      const current = entity.attributes?.[key] ?? 0
      if (newVal === current + 1 && newVal <= getAttributeMax(key)) {
        onSpendPending(key)
        return
      }
    }
    onChange?.(key, newVal, { isCreation })
  }

  const canIncreaseAttr = (key, value) => {
    const max = isCreation ? getInitialAttributeMax() : getAttributeMax(key)
    if (value >= max) return false
    if (adminMode) {
      return (pool + pending) > 0 && spent < snapshot.budget
    }
    if (isCreation) return pool > 0
    return pending > 0 || pool > 0
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
          PONTOS DE STATUS
          {adminMode && (
            <span style={{ marginLeft: '0.5rem', color: '#d97706', fontSize: '0.6rem' }}>· MODO MESTRE</span>
          )}
        </div>
        <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textAlign: 'right' }}>
          {isCreation ? (
            <>
              <span style={{ color: '#16a34a' }}>{pool}</span>
              <span style={{ color: '#333' }}> livres · </span>
              <span style={{ color: '#888' }}>{spent}/{STARTING_ATTRIBUTE_POINTS}</span>
              <span style={{ color: '#333' }}> · máx {getInitialAttributeMax()}/atributo na criação</span>
            </>
          ) : adminMode && snapshot ? (
            <>
              <span style={{ color: spent > snapshot.budget ? '#dc2626' : '#888' }}>
                {spent}/{snapshot.budget} usados
              </span>
              <span style={{ color: '#333' }}> · </span>
              <span style={{ color: '#16a34a' }}>{snapshot.available} livre(s)</span>
              {pending > 0 && <span style={{ color: '#d97706' }}> · {pending} pend.</span>}
              {pool > 0 && <span style={{ color: '#16a34a' }}> · {pool} criação</span>}
            </>
          ) : (
            <>
              {pending > 0 && <span style={{ color: '#d97706' }}>{pending} pendente(s) · </span>}
              {pool > 0 && <span style={{ color: '#16a34a' }}>{pool} criação · </span>}
              <span style={{ color: '#d97706' }}>Ruptura +{rupture}% Ecos</span>
              {physicalPenalty && <span style={{ color: '#ea580c' }}> · {physicalPenalty}</span>}
            </>
          )}
        </div>
      </div>
      {adminMode && validation && !validation.valid && (
        <div style={{
          fontSize: '0.7rem',
          color: '#dc2626',
          background: 'rgba(220,38,38,0.08)',
          border: '1px solid rgba(220,38,38,0.2)',
          borderRadius: '3px',
          padding: '0.5rem 0.75rem',
          marginBottom: '0.5rem',
        }}>
          {validation.errors[0]?.message}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
        {ATTRIBUTES.map(attr => {
          const value = entity.attributes?.[attr.key] || 0
          const max = isCreation ? getInitialAttributeMax() : getAttributeMax(attr.key)
          const effectiveValue = PHYSICAL_AFFECTED_KEYS.includes(attr.key)
            ? effectiveAttrs[attr.key]
            : null
          return (
            <AttributeInput
              key={attr.key}
              attr={attr}
              value={value}
              effectiveValue={effectiveValue}
              max={max}
              showMax={!isCreation}
              canIncrease={canIncreaseAttr(attr.key, value)}
              onChange={v => handleChange(attr.key, Math.max(0, Math.min(max, v)))}
            />
          )
        })}
      </div>
    </div>
  )
}
