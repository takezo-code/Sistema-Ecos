import React, { useState } from 'react'
import { Zap, Play, ChevronDown, ChevronUp, Star } from 'lucide-react'
import { COMBAT_HIGHLIGHT_XP } from '../../constants/progression'
import { DamageMarksPanel } from './DamageMarksPanel'
import { EntityThumb } from '../ui/EntityThumb'
import { PHYSICAL_STATES, MENTAL_STATES } from '../../constants/states'
import { ATTRIBUTES } from '../../constants/attributes'
import { formatOverloadDisplay, ECO_OVERLOAD_DISPLAY_CAP } from '../../constants/ecoOverload'
import { getEffectiveAttributeValue } from '../../services/stateModifiers'
import { listActiveMentalStatusDetails } from '../../services/mentalStatusService'

export function CombatCharacterColumn({
  character,
  onUpdate,
  onRollAttribute,
  onActivateSkill,
  onAdvanceTurn,
  onGrantHighlightXp,
  onSelectSkill,
  onApplyMarks,
  onHealMarks,
  onClearMarks,
  onNotice,
}) {
  const [skillsOpen, setSkillsOpen] = useState(false)
  const [xpFlash, setXpFlash] = useState(false)

  const physical = character.physicalState ?? 'bem'
  const mental = character.mentalState ?? 'estavel'
  const physicalOpt = PHYSICAL_STATES.find(s => s.value === physical) || PHYSICAL_STATES[0]
  const mentalOpt = MENTAL_STATES.find(s => s.value === mental) || MENTAL_STATES[0]
  const mentalStatuses = listActiveMentalStatusDetails(character.activeMentalStatuses)
  const skills = character._skillRuntimes || []
  const overload = character.ecoOverload ?? 0
  const overloadPct = Math.min(overload / ECO_OVERLOAD_DISPLAY_CAP, 1)

  return (
    <article style={{
      width: '230px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      background: '#0d0d0d',
      border: `1px solid ${physicalOpt.color}44`,
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: physicalOpt.glow ? `0 0 20px ${physicalOpt.glow}` : 'none',
    }}>

      {/* Header compacto */}
      <header style={{ padding: '0.625rem 0.75rem', background: '#111', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          <EntityThumb src={character.image} alt={character.name} size={36} borderRadius="4px" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0 }}>
              <span style={{
                fontSize: '0.9rem',
                fontWeight: 800,
                color: '#f5f5f5',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1,
                minWidth: 0,
              }}>
                {character.name}
              </span>
              {onGrantHighlightXp && (
                <button
                  type="button"
                  onClick={() => {
                    onGrantHighlightXp(character)
                    setXpFlash(true)
                    setTimeout(() => setXpFlash(false), 700)
                  }}
                  title={`Bom desempenho — +${COMBAT_HIGHLIGHT_XP} XP`}
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    padding: '2px 5px',
                    background: xpFlash ? 'rgba(217,119,6,0.25)' : 'rgba(217,119,6,0.08)',
                    border: `1px solid ${xpFlash ? 'rgba(217,119,6,0.6)' : 'rgba(217,119,6,0.25)'}`,
                    borderRadius: '3px',
                    color: '#d97706',
                    cursor: 'pointer',
                    fontSize: '0.5rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                >
                  <Star size={9} fill={xpFlash ? '#d97706' : 'none'} />
                  XP
                </button>
              )}
            </div>
            <div style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#444', marginTop: '1px' }}>
              NVL {character.level ?? 1} · T{character.currentTurn ?? 0}
              <span style={{ color: '#333' }}> · {character.xp ?? 0} XP</span>
            </div>
          </div>
          {onAdvanceTurn && (
            <button
              type="button"
              onClick={onAdvanceTurn}
              title="Avançar turno deste personagem"
              style={{
                background: 'transparent',
                border: '1px solid #2a2a2a',
                borderRadius: '4px',
                color: '#555',
                cursor: 'pointer',
                padding: '2px 6px',
                fontSize: '0.55rem',
                fontFamily: 'monospace',
                flexShrink: 0,
              }}
            >
              +T
            </button>
          )}
        </div>

        {/* Barra de sobrecarga */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Zap size={10} style={{ color: '#a855f7', flexShrink: 0 }} />
          <div style={{ flex: 1, height: '4px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${overloadPct * 100}%`,
              background: overloadPct >= 0.8 ? '#dc2626' : overloadPct >= 0.5 ? '#f97316' : '#a855f7',
              borderRadius: '2px',
              transition: 'width 0.3s',
            }} />
          </div>
          <span style={{ fontSize: '0.55rem', color: '#a855f7', fontFamily: 'monospace', flexShrink: 0 }}>
            {formatOverloadDisplay(overload)}
          </span>
        </div>

        {/* Estados */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
          <div>
            <div style={{ fontSize: '0.45rem', color: physicalOpt.color, fontFamily: 'monospace', marginBottom: '2px' }}>FÍSICO</div>
            <select
              className="input-base"
              value={physical}
              onChange={e => onUpdate?.({ physicalState: e.target.value })}
              style={{ fontSize: '0.7rem', padding: '3px 4px', borderColor: `${physicalOpt.color}55`, width: '100%' }}
            >
              {PHYSICAL_STATES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={{ fontSize: '0.45rem', color: mentalOpt.color, fontFamily: 'monospace', marginBottom: '2px' }}>MENTAL</div>
            <select
              className="input-base"
              value={mental}
              onChange={e => onUpdate?.({ mentalState: e.target.value })}
              style={{ fontSize: '0.7rem', padding: '3px 4px', borderColor: `${mentalOpt.color}55`, width: '100%' }}
            >
              {MENTAL_STATES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {mentalStatuses.length > 0 && (
          <div style={{ marginTop: '0.35rem', fontSize: '0.55rem', color: '#eab308', fontFamily: 'monospace' }}>
            {mentalStatuses.map(s => s.definition?.label).join(' · ')}
          </div>
        )}
      </header>

      {/* Marcas de Dano */}
      <section style={{ padding: '0.5rem 0.625rem', borderBottom: '1px solid #1a1a1a' }}>
        <DamageMarksPanel
          character={character}
          onApplyMarks={onApplyMarks}
          onHealMarks={onHealMarks}
          onClearMarks={onClearMarks}
          onNotice={onNotice}
        />
      </section>

      {/* Atributos */}
      <section style={{ padding: '0.5rem 0.625rem', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ fontSize: '0.45rem', color: '#333', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '0.375rem' }}>
          ATRIBUTOS · CLIQUE PARA ROLAR
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.25rem' }}>
          {ATTRIBUTES.map(attr => {
            const base = character.attributes?.[attr.key] ?? 0
            const eff = getEffectiveAttributeValue(character.attributes, attr.key, {
              physicalState: physical,
              ecoOverload: overload,
              mentalState: mental,
            })
            const reduced = eff < base
            return (
              <button
                key={attr.key}
                type="button"
                onClick={() => onRollAttribute?.(character, attr.key, attr.label, eff)}
                title={`Rolar d20 + ${attr.label} (${eff})`}
                style={{
                  background: '#111',
                  border: `1px solid #1e1e1e`,
                  borderRadius: '4px',
                  padding: '0.35rem 0.25rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'border-color 0.12s, background 0.12s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = attr.color
                  e.currentTarget.style.background = `${attr.color}11`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#1e1e1e'
                  e.currentTarget.style.background = '#111'
                }}
              >
                <div style={{ fontSize: '0.45rem', color: attr.color, fontFamily: 'monospace', marginBottom: '1px' }}>
                  {attr.key === 'inteligencia' ? 'INT' : attr.key === 'vitalidade' ? 'VIT' : attr.key === 'ruptura' ? 'RUP' : attr.label.slice(0, 3).toUpperCase()}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: reduced ? '#ea580c' : '#e5e5e5', lineHeight: 1 }}>
                  {eff}
                </div>
                {reduced && (
                  <div style={{ fontSize: '0.4rem', color: '#444', fontFamily: 'monospace' }}>{base}</div>
                )}
              </button>
            )
          })}
        </div>
      </section>

      {/* Skills colapsável */}
      <section style={{ borderBottom: '1px solid #1a1a1a' }}>
        <button
          type="button"
          onClick={() => setSkillsOpen(v => !v)}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.4rem 0.625rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#444',
          }}
        >
          <span style={{ fontSize: '0.5rem', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
            SKILLS ({skills.length})
          </span>
          {skillsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {skillsOpen && (
          <div style={{ maxHeight: '180px', overflowY: 'auto', padding: '0 0.5rem 0.5rem' }}>
            {skills.length === 0 ? (
              <p style={{ fontSize: '0.7rem', color: '#333', textAlign: 'center', padding: '0.5rem' }}>Sem skills</p>
            ) : (
              skills.map(rt => (
                <div
                  key={rt.instance.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectSkill?.(character, rt)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectSkill?.(character, rt) } }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#111',
                    border: `1px solid ${rt.visualMeta?.border || '#1a1a1a'}`,
                    borderRadius: '4px',
                    padding: '0.35rem 0.5rem',
                    marginBottom: '0.25rem',
                    gap: '0.5rem',
                    cursor: onSelectSkill ? 'pointer' : 'default',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (onSelectSkill) e.currentTarget.style.background = '#161616' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#111' }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#e5e5e5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {rt.catalog.name}
                    </div>
                    <div style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: rt.visualMeta?.color || '#555' }}>
                      {rt.catalog.skillType?.toUpperCase()}
                      {!rt.isPassive && rt.cooldownTotal > 0 && ` · CD${rt.cooldownRemaining}/${rt.cooldownTotal}`}
                    </div>
                  </div>
                  {!rt.isPassive && onActivateSkill && (
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={!rt.canActivate}
                      onClick={e => {
                        e.stopPropagation()
                        onActivateSkill(character.id, rt.instance.id)
                      }}
                      title={rt.blockReason || 'Ativar'}
                      style={{ padding: '2px 6px', fontSize: '0.55rem', opacity: rt.canActivate ? 1 : 0.35, flexShrink: 0 }}
                    >
                      <Play size={9} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* Anotações do personagem */}
      <div style={{ padding: '0.5rem 0.625rem' }}>
        <div style={{ fontSize: '0.45rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
          ANOTAÇÕES
        </div>
        <textarea
          className="input-base"
          rows={2}
          value={character.combatNotes ?? ''}
          onChange={e => onUpdate?.({ combatNotes: e.target.value })}
          placeholder="mão ferida, envenenado…"
          style={{ fontSize: '0.75rem', lineHeight: 1.4, resize: 'none', width: '100%', padding: '4px 6px' }}
        />
      </div>
    </article>
  )
}
