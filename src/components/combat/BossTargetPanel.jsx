import React, { useMemo, useState } from 'react'
import { Crosshair, Dices } from 'lucide-react'
import { ATTRIBUTES } from '../../constants/attributes'
import { DAMAGE_MARK_META } from '../../mechanics/combat/damageMarksEngine'
import { getRollOutcome, getBossAttackDamage, getDefaultDc } from '../../mechanics/combat/rollOutcome'
import { getEffectiveAttributeValue } from '../../services/stateModifiers'
import { getArmorDestrezaPenalty } from '../../mechanics/equipment/armorEffectsEngine'
import { sumGearRollBonus } from '../../mechanics/equipment/gearPassiveEngine'

function attrShort(attr) {
  if (attr.key === 'inteligencia') return 'INT'
  if (attr.key === 'vitalidade') return 'VIT'
  if (attr.key === 'ruptura') return 'RUP'
  return attr.label.slice(0, 3).toUpperCase()
}

/**
 * Escolhe player + atributo, rola o dado do boss e aplica dano:
 * parcial → Leve · sucesso → Médio · crítico → Grave · falha crítica → boss se expõe.
 */
export function BossTargetPanel({
  enemy,
  targets = [],
  diceSides = 20,
  onDiceSidesChange,
  getRollDc,
  onRollResult,
  onApplyMarksToTarget,
  onBossExpose,
}) {
  const [targetId, setTargetId] = useState('')
  const [attrKey, setAttrKey] = useState('forca')
  const [lastResult, setLastResult] = useState(null)

  const attrOptions = useMemo(
    () => ATTRIBUTES.filter(a => a.key !== 'ruptura' || enemy.hasEcoPowers),
    [enemy.hasEcoPowers],
  )

  const selectedAttr = attrOptions.find(a => a.key === attrKey) || attrOptions[0] || null
  const target = targets.find(t => t.id === targetId) || null

  const physical = enemy.physicalState ?? 'bem'
  const mental = enemy.mentalState ?? 'estavel'
  const overload = enemy.ecoOverload ?? 0

  const attrBonus = selectedAttr
    ? getEffectiveAttributeValue(enemy.attributes, selectedAttr.key, {
      physicalState: physical,
      ecoOverload: overload,
      mentalState: mental,
      destrezaPenalty: getArmorDestrezaPenalty(enemy),
    })
    : 0
  const gearBonus = selectedAttr ? sumGearRollBonus(enemy, selectedAttr.key) : 0
  const rollBonus = attrBonus + gearBonus

  const canAttack = Boolean(target && selectedAttr)

  const handleRoll = () => {
    if (!canAttack) return
    const dice = Math.floor(Math.random() * diceSides) + 1
    const bonus = rollBonus
    const total = dice + bonus
    const dc = typeof getRollDc === 'function' ? getRollDc(diceSides) : getDefaultDc(diceSides)
    const outcome = getRollOutcome(dice, bonus, diceSides, dc)
    const damage = getBossAttackDamage(outcome.key)
    const hit = !!damage.markType

    if (hit) {
      onApplyMarksToTarget?.(target.id, damage.markType)
    } else if (damage.bossExpose) {
      onBossExpose?.('leve')
    }

    const short = attrShort(selectedAttr)
    const summary = {
      targetId: target.id,
      targetName: target.name,
      attrKey: selectedAttr.key,
      attrShort: short,
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
      dc,
      characterName: enemy.name,
      attrLabel: `${selectedAttr.label} vs ${target.name}`,
      attrBonus,
      gearBonus,
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

  const selectStyle = {
    fontSize: '0.65rem',
    padding: '4px 6px',
    width: '100%',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Crosshair size={11} style={{ color: '#dc2626' }} />
          <span style={{ fontSize: '0.45rem', color: '#888', fontFamily: 'monospace', letterSpacing: '0.06em' }}>
            ATAQUE
          </span>
        </div>
        <div style={{ display: 'flex', gap: '2px' }} role="group" aria-label="Dado do ataque">
          {[8, 20].map(sides => {
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
                  border: `1px solid ${active ? (sides === 8 ? '#06b6d4' : '#888') : '#222'}`,
                  background: active ? (sides === 8 ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.06)') : 'transparent',
                  color: active ? (sides === 8 ? '#06b6d4' : '#ccc') : '#444',
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
        style={selectStyle}
        aria-label="Player alvo"
      >
        <option value="">Player alvo...</option>
        {targets.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      <select
        className="input-base"
        value={selectedAttr?.key || ''}
        onChange={e => {
          setAttrKey(e.target.value)
          setLastResult(null)
        }}
        style={selectStyle}
        aria-label="Atributo do ataque"
      >
        {attrOptions.map(a => {
          const val = getEffectiveAttributeValue(enemy.attributes, a.key, {
            physicalState: physical,
            ecoOverload: overload,
            mentalState: mental,
          })
          return (
            <option key={a.key} value={a.key}>
              {attrShort(a)} · {a.label} ({val})
            </option>
          )
        })}
      </select>

      <button
        type="button"
        className="btn-primary"
        disabled={!canAttack}
        onClick={handleRoll}
        style={{
          width: '100%',
          fontSize: '0.6rem',
          padding: '0.35rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.3rem',
          opacity: canAttack ? 1 : 0.45,
        }}
      >
        <Dices size={11} />
        Atacar · {selectedAttr ? attrShort(selectedAttr) : '—'} {rollBonus}
      </button>

      {lastResult && lastResult.targetId === targetId && (
        <div style={{
          fontSize: '0.5rem',
          fontFamily: 'monospace',
          textAlign: 'center',
          color: lastResult.outcome.color,
          padding: '0.25rem',
          background: `${lastResult.outcome.color}11`,
          borderRadius: '3px',
          border: `1px solid ${lastResult.outcome.color}33`,
        }}>
          {lastResult.hit && damageMeta
            ? `${lastResult.attrShort} · ${lastResult.outcome.label} → ${damageMeta.label} em ${lastResult.targetName}`
            : lastResult.damage?.bossExpose
              ? `${lastResult.attrShort} · ${lastResult.outcome.label} → boss se expõe`
              : `${lastResult.attrShort} · ${lastResult.outcome.label} · errou`}
        </div>
      )}
    </div>
  )
}
