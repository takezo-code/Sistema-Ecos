import React from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import {
  SOCIAL_ATTRIBUTES,
  getTotalAttributePoints,
  getTotalSocialPoints,
  getAttributeMax,
  getSocialAttributeMax,
  getInitialAttributeMax,
  getInitialSocialMax,
  getCreationAttributeFloor,
  getCreationSocialFloor,
  isInCreationPhase,
  isInSocialCreationPhase,
} from '../../constants/attributes'
import { getAttributesForEntity } from '../../constants/entityProgression'
import {
  calculateEffectiveAttributes,
  calculateEffectiveSocialAttributes,
  getPhysicalPenaltyLines,
  formatMentalPenaltiesSummary,
} from '../../services/stateModifiers'
import { getArmorDestrezaPenalty } from '../../mechanics/equipment/armorEffectsEngine'
import { sumAttrBonus } from '../../mechanics/equipment/gearPassiveEngine'
import { getProgressionSnapshot, validateProgression, getSocialBudget } from '../../services/progressionBudget'
import { getSocialPointsFromLevel } from '../../constants/progression'

function AttributeInput({ attr, value, effectiveValue, max, showMax, onChange, canIncrease, canDecrease }) {
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
          onClick={() => canDecrease && onChange(value - 1)}
          disabled={!canDecrease}
          style={{
            background: '#1a1a1a', border: 'none',
            color: canDecrease ? '#666' : '#222',
            cursor: canDecrease ? 'pointer' : 'not-allowed',
            padding: '3px 6px', borderRadius: '2px', display: 'flex',
          }}
        >
          <ChevronDown size={12} />
        </button>
      </div>
    </div>
  )
}

export function AttributeGrid({
  entity,
  onChange,
  onChangeSocial,
  isCreation = false,
  onSpendPending,
  onSpendPendingSocial,
  adminMode = false,
}) {
  const pool = entity.unspentAttributePoints ?? 0
  const pending = entity.pendingAttributePoints ?? 0
  const pendingSocial = entity.pendingSocialPoints ?? 0
  const socialPool = entity.unspentSocialPoints ?? 0
  const attrList = getAttributesForEntity(entity)
  const spent = getTotalAttributePoints(entity.attributes, entity)
  const socialSpent = getTotalSocialPoints(entity.socialAttributes)
  const snapshot = adminMode ? getProgressionSnapshot(entity) : null
  const validation = adminMode ? validateProgression(entity) : null
  const level = entity.level ?? 1
  const socialBudget = adminMode ? getSocialBudget(level) : null
  const physicalState = entity.physicalState ?? 'bem'
  const mentalState = entity.mentalState ?? 'estavel'
  const ecoOverload = entity.ecoOverload ?? 0
  const { effective: effectiveAttrs } = calculateEffectiveAttributes(entity.attributes, {
    physicalState,
    ecoOverload,
    mentalState,
    destrezaPenalty: getArmorDestrezaPenalty(entity),
    ruptura: entity.attributes?.ruptura,
  })
  for (const key of Object.keys(effectiveAttrs)) {
    effectiveAttrs[key] = (Number(effectiveAttrs[key]) || 0) + sumAttrBonus(entity, key)
  }
  const { effective: effectiveSocial } = calculateEffectiveSocialAttributes(entity.socialAttributes || {}, {
    ecoOverload,
    mentalState,
    ruptura: entity.attributes?.ruptura,
  })
  for (const key of Object.keys(effectiveSocial)) {
    effectiveSocial[key] = (Number(effectiveSocial[key]) || 0) + sumAttrBonus(entity, key)
  }
  const physicalPenaltyLines = getPhysicalPenaltyLines(physicalState)
  const mentalPenalties = formatMentalPenaltiesSummary({
    ecoOverload,
    mentalState,
    ruptura: entity.attributes?.ruptura,
  })

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

  const handleSocialChange = (key, newVal) => {
    if (adminMode) {
      onChangeSocial?.(key, newVal, { admin: true })
      return
    }
    if (onSpendPendingSocial && pendingSocial > 0) {
      const current = entity.socialAttributes?.[key] ?? 0
      if (newVal === current + 1 && newVal <= getSocialAttributeMax(key)) {
        onSpendPendingSocial(key)
        return
      }
    }
    onChangeSocial?.(key, newVal, { isCreation })
  }

  const canIncreaseAttr = (key, value) => {
    const max = isCreation ? getInitialAttributeMax() : getAttributeMax(key)
    if (value >= max) return false
    if (adminMode) {
      return (pool + pending) > 0 && spent < snapshot.budget
    }
    if (isCreation) return pool > 0
    return pending > 0
  }

  const canIncreaseSocialAttr = (key, value) => {
    const max = isCreation ? getInitialSocialMax() : getSocialAttributeMax(key)
    if (value >= max) return false
    if (adminMode) {
      return socialSpent < socialBudget
    }
    if (isCreation) return socialPool > 0
    return pendingSocial > 0
  }

  const getCanDecrease = (key, value) => {
    if (isCreation) return value > 0
    const floor = getCreationAttributeFloor(entity, key)
    if (adminMode) return value > floor
    return false
  }

  const getCanDecreaseSocial = (key, value) => {
    if (isCreation) return value > 0
    const floor = getCreationSocialFloor(entity, key)
    if (adminMode) return value > floor
    return false
  }

  return (
    <div>
      {/* ATRIBUTOS FÍSICOS */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
          ATRIBUTOS FÍSICOS
          {adminMode && (
            <span style={{ marginLeft: '0.5rem', color: '#d97706', fontSize: '0.6rem' }}>· MODO MESTRE</span>
          )}
        </div>
        <div style={{
          fontSize: '0.65rem',
          fontFamily: 'monospace',
          textAlign: 'right',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}>
          {isCreation ? (
            <span>
              <span style={{ color: pool > 0 ? '#eab308' : '#16a34a' }}>{pool}</span>
              <span style={{ color: '#444' }}> disponíveis</span>
            </span>
          ) : adminMode && snapshot ? (
            <>
              <span style={{ color: spent > snapshot.budget ? '#dc2626' : '#888' }}>
                {spent}/{snapshot.budget} usados
              </span>
              {pending > 0 && <span style={{ color: '#d97706' }}>{pending} pend.</span>}
            </>
          ) : (
            <>
              {physicalPenaltyLines.map(line => (
                <span key={line} style={{ color: '#ea580c' }}>{line}</span>
              ))}
              {mentalPenalties.lines.map(line => (
                <span key={line} style={{ color: '#06b6d4' }}>{line}</span>
              ))}
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {attrList.map(attr => {
          const value = entity.attributes?.[attr.key] || 0
          const max = isCreation ? getInitialAttributeMax() : getAttributeMax(attr.key)
          const baseVal = entity.attributes?.[attr.key] || 0
          const effectiveValue = effectiveAttrs[attr.key] !== baseVal ? effectiveAttrs[attr.key] : null
          return (
            <AttributeInput
              key={attr.key}
              attr={attr}
              value={value}
              effectiveValue={effectiveValue}
              max={max}
              showMax={!isCreation}
              canIncrease={canIncreaseAttr(attr.key, value)}
              canDecrease={getCanDecrease(attr.key, value)}
              onChange={v => {
                const floor = isCreation ? 0 : getCreationAttributeFloor(entity, attr.key)
                handleChange(attr.key, Math.max(floor, Math.min(max, v)))
              }}
            />
          )
        })}
      </div>

      {/* ATRIBUTOS DE CENA */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
          ATRIBUTOS DE CENA
        </div>
        <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', textAlign: 'right' }}>
          {isCreation ? (
            <>
              <span style={{ color: socialPool > 0 ? '#e879f9' : '#16a34a' }}>{socialPool}</span>
              <span style={{ color: '#444' }}> disponíveis</span>
            </>
          ) : adminMode && socialBudget != null ? (
            <>
              <span style={{ color: socialSpent > socialBudget ? '#dc2626' : '#888' }}>
                {socialSpent}/{socialBudget} usados
              </span>
              {pendingSocial > 0 && <span style={{ color: '#e879f9' }}> · {pendingSocial} pend.</span>}
            </>
          ) : pendingSocial > 0 ? (
            <span style={{ color: '#e879f9' }}>{pendingSocial} pend.</span>
          ) : null}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
        {SOCIAL_ATTRIBUTES.map(attr => {
          const value = entity.socialAttributes?.[attr.key] || 0
          const max = isCreation ? getInitialSocialMax() : getSocialAttributeMax(attr.key)
          const eff = effectiveSocial[attr.key]
          const effectiveValue = eff !== value ? eff : null
          return (
            <AttributeInput
              key={attr.key}
              attr={attr}
              value={value}
              effectiveValue={effectiveValue}
              max={max}
              showMax={!isCreation}
              canIncrease={canIncreaseSocialAttr(attr.key, value)}
              canDecrease={getCanDecreaseSocial(attr.key, value)}
              onChange={v => {
                const floor = isCreation ? 0 : getCreationSocialFloor(entity, attr.key)
                handleSocialChange(attr.key, Math.max(floor, Math.min(max, v)))
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
