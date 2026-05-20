import React, { useState } from 'react'
import { Shield, ShieldAlert, Skull, ChevronDown, ChevronUp, Minus, RotateCcw, Trash2, Zap } from 'lucide-react'
import { DAMAGE_MARK_TYPES, DAMAGE_MARK_META, DAMAGE_MARK_VALUES, getMarkProgress, MARK_STATE_THRESHOLDS } from '../../mechanics/combat/damageMarksEngine'
import { ATTRIBUTES, SOCIAL_ATTRIBUTES } from '../../constants/attributes'
import { PHYSICAL_STATES, MENTAL_STATES, getPhysicalStateOption, getMentalStateOption } from '../../constants/states'
import { EntityThumb } from '../ui/EntityThumb'
import { getEffectiveAttributeValue } from '../../services/stateModifiers'

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

function MarksBar({ marks, maxMarks }) {
  const slots = maxMarks > 0 ? maxMarks : 15
  const shown = Math.min(slots, 15)
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {Array.from({ length: shown }).map((_, i) => {
        const filled = i < marks
        const tier = MARK_STATE_THRESHOLDS.find(t => i >= t.min && i <= (t.max === Infinity ? 99 : t.max))
        return (
          <div key={i} style={{
            flex: 1, height: '6px',
            background: filled ? (tier?.color ?? '#dc2626') : '#1a1a1a',
            borderRadius: '2px',
            marginLeft: tier && i === tier.min && i > 0 ? '3px' : 0,
            opacity: filled ? 1 : 0.3,
          }} />
        )
      })}
      {maxMarks > 0 && marks > maxMarks && (
        <span style={{ fontSize: '0.45rem', color: '#dc2626', fontFamily: 'monospace', alignSelf: 'center', marginLeft: '2px' }}>!!</span>
      )}
    </div>
  )
}

export function CombatEnemyCard({
  enemy,
  onUpdate,
  onApplyDamage,
  onApplyDamageWithResistance,
  onHealMarks,
  onClearMarks,
  onRollAttribute,
}) {
  const [attrsOpen, setAttrsOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  const marks = enemy.damageMarks ?? 0
  const maxMarks = enemy.marcasMaximas ?? 0
  const physical = enemy.physicalState ?? 'bem'
  const mental = enemy.mentalState ?? 'estavel'
  const physOpt = getPhysicalStateOption(physical)
  const mentalOpt = getMentalStateOption(mental)
  const progress = getMarkProgress(marks)
  const papel = PAPEL_META[enemy.papelCombate ?? 'nenhum'] ?? PAPEL_META.nenhum
  const overload = enemy.ecoOverload ?? 0

  const isDefeated = maxMarks > 0 && marks >= maxMarks

  const handleClear = () => {
    if (!confirmClear) { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 2500); return }
    onClearMarks?.()
    setConfirmClear(false)
  }

  return (
    <article style={{
      width: '230px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      background: '#0d0d0d',
      border: `1px solid ${isDefeated ? '#dc262644' : `${physOpt.color}44`}`,
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: isDefeated ? '0 0 24px rgba(220,38,38,0.25)' : physOpt.glow ? `0 0 20px ${physOpt.glow}` : 'none',
      opacity: isDefeated ? 0.65 : 1,
    }}>
      {/* Header */}
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

        {/* Estados */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', marginBottom: '0.5rem' }}>
          <div>
            <div style={{ fontSize: '0.45rem', color: physOpt.color, fontFamily: 'monospace', marginBottom: '2px' }}>FÍSICO</div>
            <select className="input-base" value={physical}
              onChange={e => onUpdate?.({ physicalState: e.target.value })}
              style={{ fontSize: '0.7rem', padding: '3px 4px', borderColor: `${physOpt.color}55`, width: '100%' }}>
              {PHYSICAL_STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: '0.45rem', color: mentalOpt.color, fontFamily: 'monospace', marginBottom: '2px' }}>MENTAL</div>
            <select className="input-base" value={mental}
              onChange={e => onUpdate?.({ mentalState: e.target.value })}
              style={{ fontSize: '0.7rem', padding: '3px 4px', borderColor: `${mentalOpt.color}55`, width: '100%' }}>
              {MENTAL_STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Resistências */}
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          <ResistancePill label="RESIST.FÍS" value={enemy.resistenciaFisica ?? 0} color="#dc2626" />
          <ResistancePill label="RESIST.MEN" value={enemy.resistenciaMental ?? 0} color="#06b6d4" />
          {maxMarks > 0 && <ResistancePill label="MARCAS MÁX" value={maxMarks} color="#d97706" />}
        </div>
      </header>

      {/* Marcas de dano */}
      <section style={{ padding: '0.5rem 0.625rem', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Shield size={11} style={{ color: physOpt.color }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: physOpt.color }}>{physOpt.label}</span>
          </div>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: physOpt.color, fontFamily: 'monospace' }}>
            {marks}{maxMarks > 0 ? `/${maxMarks}` : ''} marca{marks !== 1 ? 's' : ''}
          </span>
        </div>
        <MarksBar marks={marks} maxMarks={maxMarks} />
        {isDefeated && (
          <div style={{ fontSize: '0.6rem', color: '#dc2626', fontFamily: 'monospace', textAlign: 'center', marginTop: '0.25rem', fontWeight: 700 }}>
            ✕ DERROTADO
          </div>
        )}
        {progress.marksToNextTier != null && !isDefeated && (
          <div style={{ fontSize: '0.45rem', color: '#444', fontFamily: 'monospace', textAlign: 'right', marginTop: '2px' }}>
            {progress.marksToNextTier}m para {MARK_STATE_THRESHOLDS.find(t => t.state === progress.nextState)?.label}
          </div>
        )}

        {/* Aplicar dano COM resistência */}
        <div style={{ marginTop: '0.4rem' }}>
          <div style={{ fontSize: '0.4rem', color: '#333', fontFamily: 'monospace', marginBottom: '3px' }}>
            DANO FÍSICO (com resist. {enemy.resistenciaFisica ?? 0})
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {Object.values(DAMAGE_MARK_TYPES).map(type => {
              const meta = DAMAGE_MARK_META[type]
              const raw = DAMAGE_MARK_VALUES[type]
              const res = enemy.resistenciaFisica ?? 0
              const eff = Math.max(0, raw - res)
              return (
                <button key={type} type="button"
                  onClick={() => onApplyDamageWithResistance?.(type, { mental: false })}
                  title={`${meta.label}: ${raw} − ${res} resist. = ${eff} efetivo`}
                  style={{
                    flex: 1, padding: '4px 2px',
                    background: eff === 0 ? '#0d0d0d' : `${meta.color}11`,
                    border: `1px solid ${eff === 0 ? '#1a1a1a' : `${meta.color}44`}`,
                    borderRadius: '4px', color: eff === 0 ? '#333' : meta.color,
                    cursor: 'pointer', fontSize: '0.5rem', fontFamily: 'monospace', fontWeight: 700,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px',
                  }}
                  onMouseEnter={e => eff > 0 && (e.currentTarget.style.background = `${meta.color}22`)}
                  onMouseLeave={e => { e.currentTarget.style.background = eff === 0 ? '#0d0d0d' : `${meta.color}11` }}
                >
                  <span>{meta.label}</span>
                  <span style={{ fontSize: '0.4rem', opacity: 0.7 }}>{raw}→{eff}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Dano mental */}
        <div style={{ marginTop: '0.35rem' }}>
          <div style={{ fontSize: '0.4rem', color: '#333', fontFamily: 'monospace', marginBottom: '3px' }}>
            DANO MENTAL (com resist. {enemy.resistenciaMental ?? 0})
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {Object.values(DAMAGE_MARK_TYPES).map(type => {
              const meta = DAMAGE_MARK_META[type]
              const raw = DAMAGE_MARK_VALUES[type]
              const res = enemy.resistenciaMental ?? 0
              const eff = Math.max(0, raw - res)
              return (
                <button key={type} type="button"
                  onClick={() => onApplyDamageWithResistance?.(type, { mental: true })}
                  title={`${meta.label}: ${raw} − ${res} resist. = ${eff} efetivo`}
                  style={{
                    flex: 1, padding: '4px 2px',
                    background: eff === 0 ? '#0d0d0d' : 'rgba(6,182,212,0.06)',
                    border: `1px solid ${eff === 0 ? '#1a1a1a' : 'rgba(6,182,212,0.25)'}`,
                    borderRadius: '4px', color: eff === 0 ? '#333' : '#06b6d4',
                    cursor: 'pointer', fontSize: '0.5rem', fontFamily: 'monospace', fontWeight: 700,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px',
                  }}
                  onMouseEnter={e => eff > 0 && (e.currentTarget.style.background = 'rgba(6,182,212,0.12)')}
                  onMouseLeave={e => { e.currentTarget.style.background = eff === 0 ? '#0d0d0d' : 'rgba(6,182,212,0.06)' }}
                >
                  <span>{meta.label}</span>
                  <span style={{ fontSize: '0.4rem', opacity: 0.7 }}>{raw}→{eff}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Curar / limpar */}
        <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.35rem' }}>
          <button type="button" onClick={() => onHealMarks?.(1)} disabled={marks === 0}
            style={{ flex: 1, padding: '3px', background: 'transparent', border: '1px solid #2a2a2a',
              borderRadius: '4px', color: marks === 0 ? '#2a2a2a' : '#16a34a', cursor: marks === 0 ? 'default' : 'pointer',
              fontSize: '0.5rem', fontFamily: 'monospace', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
            <Minus size={8} /> −1
          </button>
          <button type="button" onClick={handleClear} disabled={marks === 0}
            style={{ flex: 2, padding: '3px', background: confirmClear ? 'rgba(220,38,38,0.12)' : 'transparent',
              border: `1px solid ${confirmClear ? 'rgba(220,38,38,0.4)' : '#2a2a2a'}`,
              borderRadius: '4px', color: marks === 0 ? '#2a2a2a' : confirmClear ? '#ef4444' : '#555',
              cursor: marks === 0 ? 'default' : 'pointer', fontSize: '0.5rem', fontFamily: 'monospace',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
            <Trash2 size={8} /> {confirmClear ? 'Confirmar?' : 'Limpar'}
          </button>
        </div>
      </section>

      {/* Atributos colapsáveis */}
      <section>
        <button type="button" onClick={() => setAttrsOpen(v => !v)}
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.4rem 0.625rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#444' }}>
          <span style={{ fontSize: '0.45rem', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
            ATRIBUTOS · CLIQUE PARA ROLAR
          </span>
          {attrsOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>

        {attrsOpen && (
          <div style={{ padding: '0 0.625rem 0.625rem' }}>
            <div style={{ fontSize: '0.4rem', color: '#333', fontFamily: 'monospace', marginBottom: '4px' }}>FÍSICOS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.2rem', marginBottom: '0.4rem' }}>
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
                    onClick={() => onRollAttribute?.(enemy, attr.key, attr.label, eff)}
                    title={`Rolar d20 + ${attr.label} (${eff})`}
                    style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '4px',
                      padding: '0.3rem 0.2rem', cursor: 'pointer', textAlign: 'center' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = attr.color; e.currentTarget.style.background = `${attr.color}11` }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.background = '#111' }}
                  >
                    <div style={{ fontSize: '0.4rem', color: attr.color, fontFamily: 'monospace' }}>{short}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: reduced ? '#ea580c' : '#e5e5e5', lineHeight: 1 }}>{eff}</div>
                  </button>
                )
              })}
            </div>
            <div style={{ fontSize: '0.4rem', color: '#333', fontFamily: 'monospace', marginBottom: '4px' }}>CENA</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.2rem' }}>
              {SOCIAL_ATTRIBUTES.map(attr => {
                const val = enemy.socialAttributes?.[attr.key] ?? 0
                const short = attr.key === 'percepcao' ? 'PER' : attr.key === 'sabedoria' ? 'SAB' : attr.label.slice(0, 3).toUpperCase()
                return (
                  <button key={attr.key} type="button"
                    onClick={() => onRollAttribute?.(enemy, attr.key, attr.label, val)}
                    title={`Rolar d20 + ${attr.label} (${val})`}
                    style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '4px',
                      padding: '0.3rem 0.2rem', cursor: 'pointer', textAlign: 'center' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = attr.color; e.currentTarget.style.background = `${attr.color}11` }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.background = '#111' }}
                  >
                    <div style={{ fontSize: '0.4rem', color: attr.color, fontFamily: 'monospace' }}>{short}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#e5e5e5', lineHeight: 1 }}>{val}</div>
                  </button>
                )
              })}
            </div>
            {enemy.fraquezas && (
              <div style={{ marginTop: '0.35rem', fontSize: '0.5rem', color: '#d97706', fontFamily: 'monospace' }}>
                ⚡ {enemy.fraquezas}
              </div>
            )}
          </div>
        )}
      </section>
    </article>
  )
}
