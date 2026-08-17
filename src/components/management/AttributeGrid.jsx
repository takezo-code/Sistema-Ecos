import { ChevronUp, ChevronDown, Dumbbell, Users } from 'lucide-react'
import { PanelSection, MetaChip } from './PanelSection'
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
} from '../../constants/attributes'
import { getAttributesForEntity } from '../../constants/entityProgression'
import {
  calculateEffectiveAttributes,
  calculateEffectiveSocialAttributes,
} from '../../services/stateModifiers'
import { getArmorDestrezaPenalty } from '../../mechanics/equipment/armorEffectsEngine'
import { sumAttrBonus } from '../../mechanics/equipment/gearPassiveEngine'
import { getProgressionSnapshot, validateProgression, getSocialBudget } from '../../services/progressionBudget'
import { getEcoSafeLimitFromEntity } from '../../constants/ecoOverload'

function AttributeInput({ attr, value, effectiveValue, max, showMax, onChange, canIncrease, canDecrease }) {
  const modified = effectiveValue != null && effectiveValue !== value
  const stepBtn = (enabled) => ({
    width: 22,
    height: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 6,
    color: enabled ? '#aaa' : '#333',
    cursor: enabled ? 'pointer' : 'not-allowed',
  })

  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)',
      border: `1px solid ${modified ? 'rgba(234,88,12,0.35)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 10,
      padding: '0.6rem 0.7rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.5rem',
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: '0.55rem',
          color: attr.color,
          fontFamily: 'monospace',
          letterSpacing: '0.1em',
          marginBottom: 3,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {attr.label.toUpperCase()}
        </div>
        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f0f0f0', lineHeight: 1, letterSpacing: '-0.02em' }}>
          {modified ? (
            <>
              <span style={{ color: '#ea580c' }}>{effectiveValue}</span>
              <span style={{ fontSize: '0.62rem', color: '#777', fontWeight: 400, marginLeft: 4 }}>({value})</span>
            </>
          ) : (
            value
          )}
          {showMax && <span style={{ fontSize: '0.58rem', color: '#4a4a4a', fontWeight: 400 }}> / {max}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
        <button
          type="button"
          disabled={!canIncrease}
          onClick={() => onChange(value + 1)}
          style={stepBtn(canIncrease)}
        >
          <ChevronUp size={12} />
        </button>
        <button
          type="button"
          onClick={() => canDecrease && onChange(value - 1)}
          disabled={!canDecrease}
          style={stepBtn(canDecrease)}
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
  const safeLimit = getEcoSafeLimitFromEntity(entity)
  const { effective: effectiveAttrs } = calculateEffectiveAttributes(entity.attributes, {
    physicalState,
    ecoOverload,
    mentalState,
    destrezaPenalty: getArmorDestrezaPenalty(entity),
    safeLimit,
  })
  for (const key of Object.keys(effectiveAttrs)) {
    effectiveAttrs[key] = (Number(effectiveAttrs[key]) || 0) + sumAttrBonus(entity, key)
  }
  const { effective: effectiveSocial } = calculateEffectiveSocialAttributes(entity.socialAttributes || {}, {
    ecoOverload,
    mentalState,
    safeLimit,
  })
  for (const key of Object.keys(effectiveSocial)) {
    effectiveSocial[key] = (Number(effectiveSocial[key]) || 0) + sumAttrBonus(entity, key)
  }

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

  const physicalMeta = isCreation ? (
    <MetaChip color={pool > 0 ? '#eab308' : '#4ade80'} tone="solid">{pool} disponíveis</MetaChip>
  ) : adminMode && snapshot ? (
    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      <MetaChip color={spent > snapshot.budget ? '#f87171' : '#8a8a8a'}>
        {spent}/{snapshot.budget} usados
      </MetaChip>
      {pending > 0 && <MetaChip color="#d97706" tone="solid">{pending} pend.</MetaChip>}
    </div>
  ) : pending > 0 ? (
    <MetaChip color="#d97706" tone="solid">{pending} pend.</MetaChip>
  ) : null

  const socialMeta = isCreation ? (
    <MetaChip color={socialPool > 0 ? '#e879f9' : '#4ade80'} tone="solid">{socialPool} disponíveis</MetaChip>
  ) : adminMode && socialBudget != null ? (
    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      <MetaChip color={socialSpent > socialBudget ? '#f87171' : '#8a8a8a'}>
        {socialSpent}/{socialBudget} usados
      </MetaChip>
      {pendingSocial > 0 && <MetaChip color="#e879f9" tone="solid">{pendingSocial} pend.</MetaChip>}
    </div>
  ) : pendingSocial > 0 ? (
    <MetaChip color="#e879f9" tone="solid">{pendingSocial} pend.</MetaChip>
  ) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <PanelSection icon={Dumbbell} title="Atributos físicos" accent="#dc2626" meta={physicalMeta}>
        {adminMode && validation && !validation.valid && (
          <div style={{
            fontSize: '0.7rem',
            color: '#f87171',
            background: 'rgba(220,38,38,0.07)',
            border: '1px solid rgba(220,38,38,0.22)',
            borderRadius: 10,
            padding: '0.5rem 0.7rem',
          }}>
            {validation.errors[0]?.message}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(132px, 1fr))', gap: '0.45rem' }}>
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
      </PanelSection>

      <PanelSection icon={Users} title="Atributos de cena" accent="#e879f9" meta={socialMeta}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(132px, 1fr))', gap: '0.45rem' }}>
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
      </PanelSection>
    </div>
  )
}
