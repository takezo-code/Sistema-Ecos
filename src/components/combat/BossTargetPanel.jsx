import React, { useState } from 'react'
import { Crosshair, Dices } from 'lucide-react'
import { DAMAGE_MARK_META } from '../../mechanics/combat/damageMarksEngine'
import { getRollOutcome, getBossAttackDamage } from '../../mechanics/combat/rollOutcome'
import { getEffectiveAttributeValue } from '../../services/stateModifiers'

/**
 * Escolhe um player, rola o dado do boss e aplica dano automaticamente:
 * parcial → Leve · sucesso → Médio · crítico → Grave · falha crítica → boss se expõe.
 */
export function BossTargetPanel({
  enemy,
  targets = [],
  diceSides = 20,
  onDiceSidesChange,
  onRollResult,
  onApplyMarksToTarget,
  onBossExpose,
}) {
  const [targetId, setTargetId] = useState('')
  const [lastResult, setLastResult] = useState(null)

  const target = targets.find(t => t.id === targetId) || null
  const physical = enemy.physicalState ?? 'bem'
  const mental = enemy.mentalState ?? 'estavel'
  const overload = enemy.ecoOverload ?? 0
  const forca = getEffectiveAttributeValue(enemy.attributes, 'forca', {
    physicalState: physical,
    ecoOverload: overload,
    mentalState: mental,
  })

  const handleRoll = () => {
    if (!target) return
    const dice = Math.floor(Math.random() * diceSides) + 1
    const bonus = forca
    const total = dice + bonus
    const outcome = getRollOutcome(dice, bonus, diceSides)
    const damage = getBossAttackDamage(outcome.key)
    const hit = !!damage.markType

    if (hit) {
      onApplyMarksToTarget?.(target.id, damage.markType)
    } else if (damage.bossExpose) {
      onBossExpose?.('leve')
    }

    const summary = {
      targetId: target.id,
      targetName: target.name,
      outcome,
      damage,
      hit,
    }
    setLastResult(summary)

    onRollResult?.({
      dice,
      sides: diceSides,
      bonus,
      total,
      characterName: enemy.name,
      attrLabel: `vs ${target.name}`,
      targetId: target.id,
      targetName: target.name,
      hit,
      outcome,
      damage,
      bossExpose: !!damage.bossExpose,
    })
  }

  if (!targets.length) {
    return (
      <div style={{
        padding: '0.4rem 0.5rem',
        background: '#111',
        border: '1px solid #1a1a1a',
        borderRadius: '4px',
        fontSize: '0.55rem',
        color: '#444',
        fontFamily: 'monospace',
      }}>
        Sem players no combate para mirar.
      </div>
    )
  }

  const damageMeta = lastResult?.damage?.markType
    ? DAMAGE_MARK_META[lastResult.damage.markType]
    : null

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem',
      padding: '0.45rem 0.5rem',
      background: 'rgba(220,38,38,0.06)',
      border: '1px solid rgba(220,38,38,0.2)',
      borderRadius: '4px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Crosshair size={11} style={{ color: '#dc2626' }} />
          <span style={{ fontSize: '0.45rem', color: '#dc2626', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
            ALVO DO ATAQUE
          </span>
        </div>
        <div style={{ display: 'flex', gap: '2px' }} role="group" aria-label="Dado do ataque">
          {[6, 20].map(sides => {
            const active = diceSides === sides
            return (
              <button
                key={sides}
                type="button"
                onClick={() => onDiceSidesChange?.(sides)}
                style={{
                  padding: '1px 5px',
                  fontSize: '0.5rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  borderRadius: '3px',
                  cursor: 'pointer',
                  border: `1px solid ${active ? (sides === 6 ? '#06b6d4' : '#e5e5e5') : '#2a2a2a'}`,
                  background: active ? (sides === 6 ? 'rgba(6,182,212,0.15)' : 'rgba(229,229,229,0.1)') : 'transparent',
                  color: active ? (sides === 6 ? '#06b6d4' : '#e5e5e5') : '#444',
                }}
              >
                d{sides}
              </button>
            )
          })}
        </div>
      </div>

      <select
        className="input-base"
        value={targetId}
        onChange={e => {
          setTargetId(e.target.value)
          setLastResult(null)
        }}
        style={{ fontSize: '0.7rem', padding: '4px 6px', width: '100%' }}
      >
        <option value="">Escolher player...</option>
        {targets.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      <button
        type="button"
        className="btn-primary"
        disabled={!target}
        onClick={handleRoll}
        style={{
          width: '100%',
          fontSize: '0.65rem',
          padding: '0.4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.35rem',
          opacity: target ? 1 : 0.45,
        }}
      >
        <Dices size={12} />
        Atacar · d{diceSides} + FOR ({forca})
      </button>

      <div style={{ fontSize: '0.45rem', color: '#444', fontFamily: 'monospace', lineHeight: 1.4 }}>
        Parcial → Leve · Sucesso → Médio · Crítico → Grave
      </div>

      {lastResult && lastResult.targetId === targetId && (
        <div style={{
          fontSize: '0.55rem',
          fontFamily: 'monospace',
          textAlign: 'center',
          color: lastResult.outcome.color,
          padding: '0.3rem',
          background: `${lastResult.outcome.color}11`,
          borderRadius: '3px',
          border: `1px solid ${lastResult.outcome.color}33`,
        }}>
          {lastResult.outcome.icon}{' '}
          {lastResult.hit && damageMeta
            ? `${lastResult.outcome.label} → ${damageMeta.label} (+${damageMeta.value}) em ${lastResult.targetName}`
            : lastResult.damage?.bossExpose
              ? `${lastResult.outcome.label} → boss se expõe (+1 marca nele)`
              : `${lastResult.outcome.label} · errou ${lastResult.targetName}`}
        </div>
      )}
    </div>
  )
}
