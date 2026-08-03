import React, { useState } from 'react'
import { DamageMarksPanel, PLAYER_MARK_TYPES } from './DamageMarksPanel'
import { BossTargetPanel } from './BossTargetPanel'
import { ATTRIBUTES, SOCIAL_ATTRIBUTES } from '../../constants/attributes'
import { MENTAL_STATES, getPhysicalStateOption, getMentalStateOption } from '../../constants/states'
import { EntityThumb } from '../ui/EntityThumb'
import { getEffectiveAttributeValue } from '../../services/stateModifiers'

function socialAttrShort(attr) {
  if (attr.key === 'carisma') return 'CAR'
  if (attr.key === 'percepcao') return 'PER'
  if (attr.key === 'vontade') return 'VON'
  if (attr.key === 'sabedoria') return 'SAB'
  return attr.label.slice(0, 3).toUpperCase()
}

const PAPEL_META = {
  capanga: { label: 'Capanga', color: '#6b7280' },
  elite:   { label: 'Elite',   color: '#d97706' },
  boss:    { label: 'BOSS',    color: '#dc2626' },
  nenhum:  { label: 'NPC',     color: '#06b6d4' },
}

export function CombatEnemyCard({
  enemy,
  onUpdate,
  onApplyMarks,
  onHealMarks,
  onClearMarks,
  onNotice,
  onRollAttribute,
  targets = [],
  onBossAttackRoll,
  onApplyMarksToTarget,
  onBossExpose,
}) {
  const [diceSides, setDiceSides] = useState(20)
  const marks = enemy.damageMarks ?? 0
  const maxMarks = enemy.marcasMaximas ?? 0
  const physical = enemy.physicalState ?? 'bem'
  const mental = enemy.mentalState ?? 'estavel'
  const physOpt = getPhysicalStateOption(physical)
  const mentalOpt = getMentalStateOption(mental)
  const papel = PAPEL_META[enemy.papelCombate ?? 'nenhum'] ?? PAPEL_META.nenhum
  const overload = enemy.ecoOverload ?? 0
  const isDefeated = maxMarks > 0 && marks >= maxMarks
  const borderOpt = physOpt

  return (
    <article style={{
      width: '220px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      background: '#0d0d0d',
      border: `1px solid ${isDefeated ? '#dc262644' : `${borderOpt.color}44`}`,
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: isDefeated
        ? '0 0 20px rgba(220,38,38,0.2)'
        : physOpt.glow ? `0 0 16px ${physOpt.glow}` : 'none',
      opacity: isDefeated ? 0.65 : 1,
    }}>
      <header style={{ padding: '0.5rem 0.625rem', background: '#111', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
          <EntityThumb src={enemy.image} alt={enemy.name} size={32} borderRadius="4px" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: '#f5f5f5',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                minWidth: 0,
              }}>
                {enemy.name}
              </span>
              <span style={{
                fontSize: '0.45rem',
                fontFamily: 'monospace',
                fontWeight: 700,
                color: papel.color,
                border: `1px solid ${papel.color}44`,
                borderRadius: '2px',
                padding: '1px 4px',
                flexShrink: 0,
              }}>
                {papel.label}
              </span>
            </div>
            <div style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: '#555', marginTop: '1px' }}>
              Nv.{enemy.level ?? 1}
              {enemy.xpRecompensa > 0 && (
                <span style={{ color: '#a16207' }}> · {enemy.xpRecompensa} XP</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '0.45rem' }}>
          <select
            className="input-base"
            value={mental}
            onChange={e => onUpdate?.({ mentalState: e.target.value })}
            style={{ fontSize: '0.65rem', padding: '3px 4px', borderColor: `${mentalOpt.color}55`, width: '100%' }}
          >
            {MENTAL_STATES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </header>

      <section style={{
        padding: '0.45rem 0.625rem',
        borderBottom: '1px solid #1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem',
      }}>
        <BossTargetPanel
          enemy={enemy}
          targets={targets}
          diceSides={diceSides}
          onDiceSidesChange={setDiceSides}
          onRollResult={onBossAttackRoll}
          onApplyMarksToTarget={onApplyMarksToTarget}
          onBossExpose={onBossExpose}
        />
        <DamageMarksPanel
          character={enemy}
          maxMarks={maxMarks}
          markTypes={PLAYER_MARK_TYPES}
          compact
          onApplyMarks={onApplyMarks}
          onHealMarks={onHealMarks}
          onClearMarks={onClearMarks}
          onNotice={onNotice}
        />
        {isDefeated && (
          <div style={{
            fontSize: '0.55rem',
            color: '#dc2626',
            fontFamily: 'monospace',
            textAlign: 'center',
            fontWeight: 700,
          }}>
            DERROTADO
          </div>
        )}
      </section>

      <section style={{ padding: '0.45rem 0.625rem' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '2px', marginBottom: '0.35rem' }}>
          {[6, 20].map(sides => {
            const active = diceSides === sides
            return (
              <button
                key={sides}
                type="button"
                onClick={() => setDiceSides(sides)}
                title={`d${sides}`}
                style={{
                  padding: '1px 5px',
                  fontSize: '0.5rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  borderRadius: '3px',
                  cursor: 'pointer',
                  border: `1px solid ${active ? (sides === 6 ? '#06b6d4' : '#888') : '#222'}`,
                  background: active ? (sides === 6 ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.06)') : 'transparent',
                  color: active ? (sides === 6 ? '#06b6d4' : '#ccc') : '#444',
                }}
              >
                d{sides}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <div>
            <div style={{ fontSize: '0.4rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
              ATRIBUTOS
            </div>
            {(() => {
              const list = ATTRIBUTES.filter(attr => attr.key !== 'ruptura' || enemy.hasEcoPowers)
              const top = list.length === 4 ? list.slice(0, 2) : list.slice(0, 3)
              const bottom = list.length === 4 ? list.slice(2) : list.slice(top.length)

              const renderBtn = (attr) => {
                const base = enemy.attributes?.[attr.key] ?? 0
                const eff = getEffectiveAttributeValue(enemy.attributes, attr.key, {
                  physicalState: physical,
                  ecoOverload: overload,
                  mentalState: mental,
                })
                const reduced = eff < base
                const short = attr.key === 'inteligencia' ? 'INT'
                  : attr.key === 'vitalidade' ? 'VIT'
                  : attr.key === 'ruptura' ? 'RUP'
                  : attr.label.slice(0, 3).toUpperCase()
                return (
                  <button
                    key={attr.key}
                    type="button"
                    onClick={() => onRollAttribute?.(enemy, attr.key, attr.label, eff, diceSides)}
                    title={`d${diceSides} + ${attr.label}`}
                    style={{
                      background: '#111',
                      border: '1px solid #1e1e1e',
                      borderRadius: '4px',
                      padding: '0.3rem 0.2rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.4rem', color: attr.color, fontFamily: 'monospace' }}>{short}</div>
                    <div style={{
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      color: reduced ? '#ea580c' : '#e5e5e5',
                      lineHeight: 1.1,
                    }}>
                      {eff}
                    </div>
                  </button>
                )
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${top.length}, 1fr)`,
                    gap: '0.2rem',
                  }}>
                    {top.map(renderBtn)}
                  </div>
                  {bottom.length > 0 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${bottom.length}, 1fr)`,
                      gap: '0.2rem',
                    }}>
                      {bottom.map(renderBtn)}
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
          <div>
            <div style={{ fontSize: '0.4rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
              CENA
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.2rem' }}>
              {SOCIAL_ATTRIBUTES.map(attr => {
                const val = enemy.socialAttributes?.[attr.key] ?? 0
                return (
                  <button
                    key={attr.key}
                    type="button"
                    onClick={() => onRollAttribute?.(enemy, attr.key, attr.label, val, diceSides)}
                    title={`d${diceSides} + ${attr.label}`}
                    style={{
                      background: '#111',
                      border: '1px solid #1e1e1e',
                      borderRadius: '4px',
                      padding: '0.3rem 0.2rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.4rem', color: attr.color, fontFamily: 'monospace' }}>
                      {socialAttrShort(attr)}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#e5e5e5', lineHeight: 1.1 }}>
                      {val}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}
