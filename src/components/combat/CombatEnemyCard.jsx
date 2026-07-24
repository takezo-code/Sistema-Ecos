import React, { useState } from 'react'
import { DamageMarksPanel } from './DamageMarksPanel'
import { BossTargetPanel } from './BossTargetPanel'
import { ATTRIBUTES, SOCIAL_ATTRIBUTES } from '../../constants/attributes'
import { PHYSICAL_STATES, MENTAL_STATES, getPhysicalStateOption, getMentalStateOption } from '../../constants/states'
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

function ResistancePill({ label, value, color }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: `${color}11`,
      border: `1px solid ${color}33`,
      borderRadius: '4px',
      padding: '0.3rem 0.5rem',
      flex: 1,
    }}>
      <span style={{ fontSize: '0.4rem', color, fontFamily: 'monospace', letterSpacing: '0.1em' }}>{label}</span>
      <span style={{ fontSize: '1rem', fontWeight: 800, color: value > 0 ? color : '#333', lineHeight: 1 }}>{value}</span>
    </div>
  )
}

function DiceSideToggle({ diceSides, setDiceSides }) {
  return (
    <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }} role="group" aria-label="Tipo de dado">
      {[6, 20].map(sides => {
        const active = diceSides === sides
        return (
          <button
            key={sides}
            type="button"
            onClick={() => setDiceSides(sides)}
            title={`Usar d${sides} nas rolagens`}
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
  )
}

function SocialAttributesGrid({ enemy, onRollAttribute, diceSides }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.25rem' }}>
      {SOCIAL_ATTRIBUTES.map(attr => {
        const val = enemy.socialAttributes?.[attr.key] ?? 0
        return (
          <button key={attr.key} type="button"
            onClick={() => onRollAttribute?.(enemy, attr.key, attr.label, val, diceSides)}
            title={`Rolar d${diceSides} + ${attr.label} (${val})`}
            style={{
              background: '#111', border: '1px solid #1e1e1e', borderRadius: '4px',
              padding: '0.35rem 0.25rem', cursor: 'pointer', textAlign: 'center',
              transition: 'border-color 0.12s, background 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = attr.color; e.currentTarget.style.background = `${attr.color}11` }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.background = '#111' }}
          >
            <div style={{ fontSize: '0.45rem', color: attr.color, fontFamily: 'monospace', marginBottom: '1px' }}>{socialAttrShort(attr)}</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#e5e5e5', lineHeight: 1 }}>{val}</div>
          </button>
        )
      })}
    </div>
  )
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
  variant = 'combat',
}) {
  const isScene = variant === 'scene'
  const [diceSides, setDiceSides] = useState(20)
  const marks = enemy.damageMarks ?? 0
  const maxMarks = enemy.marcasMaximas ?? 0
  const physical = enemy.physicalState ?? 'bem'
  const mental = enemy.mentalState ?? 'estavel'
  const physOpt = getPhysicalStateOption(physical)
  const mentalOpt = getMentalStateOption(mental)
  const papel = PAPEL_META[enemy.papelCombate ?? 'nenhum'] ?? PAPEL_META.nenhum
  const overload = enemy.ecoOverload ?? 0
  const isDefeated = !isScene && maxMarks > 0 && marks >= maxMarks
  const borderOpt = isScene ? mentalOpt : physOpt

  return (
    <article style={{
      width: '230px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      background: '#0d0d0d',
      border: `1px solid ${isDefeated ? '#dc262644' : `${borderOpt.color}44`}`,
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: isDefeated ? '0 0 24px rgba(220,38,38,0.25)' : !isScene && physOpt.glow ? `0 0 20px ${physOpt.glow}` : 'none',
      opacity: isDefeated ? 0.65 : 1,
    }}>
      <header style={{ padding: '0.625rem 0.75rem', background: '#111', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          <EntityThumb src={enemy.image} alt={enemy.name} size={36} borderRadius="4px" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f5f5f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {enemy.name}
              </span>
              <span style={{
                fontSize: '0.45rem', fontFamily: 'monospace', fontWeight: 700,
                color: papel.color, border: `1px solid ${papel.color}44`,
                borderRadius: '2px', padding: '1px 4px', flexShrink: 0,
              }}>
                {papel.label}
              </span>
            </div>
            <div style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#444' }}>
              NVL {enemy.level ?? 1}
              {enemy.xpRecompensa > 0 && <span style={{ color: '#d97706' }}> · {enemy.xpRecompensa} XP ao derrotar</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isScene ? '1fr' : '1fr 1fr', gap: '0.35rem', marginBottom: isScene ? 0 : '0.5rem' }}>
          {!isScene && (
            <div>
              <div style={{ fontSize: '0.45rem', color: physOpt.color, fontFamily: 'monospace', marginBottom: '2px' }}>FÍSICO</div>
              <select className="input-base" value={physical}
                onChange={e => onUpdate?.({ physicalState: e.target.value })}
                style={{ fontSize: '0.7rem', padding: '3px 4px', borderColor: `${physOpt.color}55`, width: '100%' }}>
                {PHYSICAL_STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          )}
          <div>
            <div style={{ fontSize: '0.45rem', color: mentalOpt.color, fontFamily: 'monospace', marginBottom: '2px' }}>MENTAL</div>
            <select className="input-base" value={mental}
              onChange={e => onUpdate?.({ mentalState: e.target.value })}
              style={{ fontSize: '0.7rem', padding: '3px 4px', borderColor: `${mentalOpt.color}55`, width: '100%' }}>
              {MENTAL_STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {!isScene && (
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {maxMarks > 0 && (
              <ResistancePill
                label="VIDA"
                value={Math.max(0, maxMarks - marks)}
                color="#dc2626"
              />
            )}
            {maxMarks > 0 && (
              <ResistancePill label="MÁX" value={maxMarks} color="#d97706" />
            )}
          </div>
        )}
      </header>

      {!isScene && (
        <section style={{ padding: '0.5rem 0.625rem', borderBottom: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
            onApplyMarks={onApplyMarks}
            onHealMarks={onHealMarks}
            onClearMarks={onClearMarks}
            onNotice={onNotice}
          />
          {isDefeated && (
            <div style={{ fontSize: '0.6rem', color: '#dc2626', fontFamily: 'monospace', textAlign: 'center', fontWeight: 700 }}>
              ✕ DERROTADO
            </div>
          )}
        </section>
      )}

      <section style={{ padding: '0.5rem 0.625rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem', marginBottom: '0.375rem' }}>
          <div style={{ fontSize: '0.45rem', color: '#333', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
            {isScene ? 'ATRIBUTOS SOCIAIS' : 'ATRIBUTOS'}
          </div>
          <DiceSideToggle diceSides={diceSides} setDiceSides={setDiceSides} />
        </div>

        {isScene ? (
          <SocialAttributesGrid enemy={enemy} onRollAttribute={onRollAttribute} diceSides={diceSides} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.25rem' }}>
            {ATTRIBUTES.map(attr => {
              if (attr.key === 'ruptura' && !enemy.hasEcoPowers) return null
              const base = enemy.attributes?.[attr.key] ?? 0
              const eff = getEffectiveAttributeValue(enemy.attributes, attr.key, {
                physicalState: physical, ecoOverload: overload, mentalState: mental,
              })
              const reduced = eff < base
              const short = attr.key === 'inteligencia' ? 'INT' : attr.key === 'vitalidade' ? 'VIT' : attr.key === 'ruptura' ? 'RUP' : attr.label.slice(0, 3).toUpperCase()
              return (
                <button key={attr.key} type="button"
                  onClick={() => onRollAttribute?.(enemy, attr.key, attr.label, eff, diceSides)}
                  title={`Rolar d${diceSides} + ${attr.label} (${eff})`}
                  style={{
                    background: '#111', border: '1px solid #1e1e1e', borderRadius: '4px',
                    padding: '0.35rem 0.25rem', cursor: 'pointer', textAlign: 'center',
                    transition: 'border-color 0.12s, background 0.12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = attr.color; e.currentTarget.style.background = `${attr.color}11` }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.background = '#111' }}
                >
                  <div style={{ fontSize: '0.45rem', color: attr.color, fontFamily: 'monospace', marginBottom: '1px' }}>{short}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: reduced ? '#ea580c' : '#e5e5e5', lineHeight: 1 }}>{eff}</div>
                  {reduced && <div style={{ fontSize: '0.4rem', color: '#444', fontFamily: 'monospace' }}>{base}</div>}
                </button>
              )
            })}
          </div>
        )}
      </section>
    </article>
  )
}
