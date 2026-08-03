import React, { useState } from 'react'
import { Zap, Play, ChevronDown, ChevronUp, Star } from 'lucide-react'
import { COMBAT_HIGHLIGHT_XP } from '../../constants/progression'
import { DamageMarksPanel, PLAYER_MARK_TYPES } from './DamageMarksPanel'
import { EntityThumb } from '../ui/EntityThumb'
import { PHYSICAL_STATES, MENTAL_STATES } from '../../constants/states'
import { ATTRIBUTES, SOCIAL_ATTRIBUTES } from '../../constants/attributes'
import { formatOverloadDisplay, getEcoSafeLimitFromEntity } from '../../constants/ecoOverload'
import { getEffectiveAttributeValue, getEffectiveSocialAttributeValue } from '../../services/stateModifiers'
import { listActiveMentalStatusDetails } from '../../services/mentalStatusService'
import { getCharacterClass } from '../../constants/classes'
import { getClassAttributeBonus } from '../../mechanics/classes/classBonusEngine'
import { getWeaponProficiencyPenalty } from '../../mechanics/equipment/weaponProficiencyEngine'
import { getArmorDestrezaPenalty } from '../../mechanics/equipment/armorEffectsEngine'
import { sumGearRollBonus, getRupturaUsesRemaining, getRupturaUsesMax } from '../../mechanics/equipment/gearPassiveEngine'

function socialAttrShort(attr) {
  if (attr.key === 'carisma') return 'CAR'
  if (attr.key === 'percepcao') return 'PER'
  if (attr.key === 'vontade') return 'VON'
  if (attr.key === 'sabedoria') return 'SAB'
  return attr.label.slice(0, 3).toUpperCase()
}

export function CombatCharacterColumn({
  character,
  onUpdate,
  onRollAttribute,
  onActivateSkill,
  onGrantHighlightXp,
  onSelectSkill,
  onApplyMarks,
  onHealMarks,
  onClearMarks,
  onNotice,
  attributeList = null,
}) {
  const [skillsOpen, setSkillsOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [xpFlash, setXpFlash] = useState(false)
  const [diceSides, setDiceSides] = useState(20)

  const physical = character.physicalState ?? 'bem'
  const mental = character.mentalState ?? 'estavel'
  const physicalOpt = PHYSICAL_STATES.find(s => s.value === physical) || PHYSICAL_STATES[0]
  const mentalOpt = MENTAL_STATES.find(s => s.value === mental) || MENTAL_STATES[0]
  const mentalStatuses = listActiveMentalStatusDetails(character.activeMentalStatuses)
  const skills = character._skillRuntimes || []
  const characterClass = getCharacterClass(character)
  const armorDexPenalty = getArmorDestrezaPenalty(character)
  const overload = character.ecoOverload ?? 0
  const safeLimit = getEcoSafeLimitFromEntity(character)
  const overloadPct = Math.min(overload / Math.max(safeLimit, 1), 1)
  const hasNotes = Boolean((character.combatNotes || '').trim())
  const rupturaMax = getRupturaUsesMax(character)
  const rupturaLeft = getRupturaUsesRemaining(character)

  return (
    <article style={{
      width: '220px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      background: '#0d0d0d',
      border: `1px solid ${physicalOpt.color}44`,
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: physicalOpt.glow ? `0 0 16px ${physicalOpt.glow}` : 'none',
    }}>

      <header style={{ padding: '0.5rem 0.625rem', background: '#111', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
          <EntityThumb src={character.image} alt={character.name} size={32} borderRadius="4px" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', minWidth: 0 }}>
              <span style={{
                fontSize: '0.85rem',
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
                  title={`+${COMBAT_HIGHLIGHT_XP} XP`}
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    padding: '2px 4px',
                    background: xpFlash ? 'rgba(217,119,6,0.25)' : 'transparent',
                    border: `1px solid ${xpFlash ? 'rgba(217,119,6,0.5)' : '#2a2a2a'}`,
                    borderRadius: '3px',
                    color: '#d97706',
                    cursor: 'pointer',
                  }}
                >
                  <Star size={9} fill={xpFlash ? '#d97706' : 'none'} />
                </button>
              )}
            </div>
            <div style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: '#555', marginTop: '1px' }}>
              Nv.{character.level ?? 1}
              {characterClass && (
                <span style={{ color: characterClass.color }}> · {characterClass.label}</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.45rem' }}>
          <Zap size={9} style={{ color: '#a855f7', flexShrink: 0 }} />
          <div style={{ flex: 1, height: '3px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${overloadPct * 100}%`,
              background: overloadPct >= 0.8 ? '#dc2626' : overloadPct >= 0.5 ? '#f97316' : '#a855f7',
              borderRadius: '2px',
              transition: 'width 0.3s',
            }} />
          </div>
          <span style={{ fontSize: '0.5rem', color: '#777', fontFamily: 'monospace', flexShrink: 0 }}>
            {formatOverloadDisplay(overload, { safeLimit })}
          </span>
        </div>

        {rupturaMax > 0 && (
          <div style={{ marginTop: '0.3rem', fontSize: '0.5rem', fontFamily: 'monospace', color: '#d97706' }}>
            Usos Ruptura (gear) {rupturaLeft}/{rupturaMax}
          </div>
        )}

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

        {mentalStatuses.length > 0 && (
          <div style={{ marginTop: '0.3rem', fontSize: '0.5rem', color: '#eab308', fontFamily: 'monospace' }}>
            {mentalStatuses.map(s => s.definition?.label).join(' · ')}
          </div>
        )}
      </header>

      <section style={{ padding: '0.45rem 0.625rem', borderBottom: '1px solid #1a1a1a' }}>
        <DamageMarksPanel
          character={character}
          markTypes={PLAYER_MARK_TYPES}
          compact
          onApplyMarks={onApplyMarks}
          onHealMarks={onHealMarks}
          onClearMarks={onClearMarks}
          onNotice={onNotice}
        />
      </section>

      <section style={{ padding: '0.45rem 0.625rem', borderBottom: '1px solid #1a1a1a' }}>
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
        {(() => {
          const physicalList = attributeList ?? ATTRIBUTES
          const weaponPenalty = getWeaponProficiencyPenalty(character)

          const renderPhysical = () => {
            const list = physicalList
            const top = list.length === 4 ? list.slice(0, 2) : list.slice(0, 3)
            const bottom = list.length === 4 ? list.slice(2) : list.slice(top.length)

            const renderBtn = (attr) => {
              const base = character.attributes?.[attr.key] ?? 0
              const eff = getEffectiveAttributeValue(character.attributes, attr.key, {
                physicalState: physical,
                ecoOverload: overload,
                mentalState: mental,
                destrezaPenalty: armorDexPenalty,
                safeLimit,
              })
                const classBonus = getClassAttributeBonus(character, attr.key)
                const gearBonus = sumGearRollBonus(character, attr.key)
                const rollBonus = eff + classBonus + weaponPenalty + gearBonus
                const reduced = eff < base
                const shortKey = attr.key === 'inteligencia' ? 'INT'
                  : attr.key === 'vitalidade' ? 'VIT'
                  : attr.key === 'ruptura' ? 'RUP'
                  : attr.label.slice(0, 3).toUpperCase()
                return (
                  <button
                    key={attr.key}
                    type="button"
                    onClick={() => onRollAttribute?.(
                      character, attr.key, attr.label, rollBonus, diceSides,
                      { attrBonus: eff, classBonus, weaponPenalty, gearBonus },
                    )}
                    title={`d${diceSides} + ${attr.label}`}
                    style={{
                      background: '#111',
                      border: `1px solid ${weaponPenalty
                        ? 'rgba(220,38,38,0.35)'
                        : (classBonus > 0 || gearBonus > 0) ? 'rgba(217,119,6,0.3)' : '#1e1e1e'}`,
                      borderRadius: '4px',
                      padding: '0.3rem 0.2rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.4rem', color: attr.color, fontFamily: 'monospace' }}>
                      {shortKey}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: reduced ? '#ea580c' : '#e5e5e5', lineHeight: 1.1 }}>
                      {eff + gearBonus}
                      {classBonus > 0 && (
                        <span style={{ fontSize: '0.5rem', color: '#d97706', marginLeft: '1px' }}>+{classBonus}</span>
                      )}
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
          }

          const renderSocial = () => (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.2rem' }}>
              {SOCIAL_ATTRIBUTES.map(attr => {
                const base = character.socialAttributes?.[attr.key] ?? 0
                const eff = getEffectiveSocialAttributeValue(character.socialAttributes || {}, attr.key, {
                  ecoOverload: overload,
                  mentalState: mental,
                  safeLimit,
                })
                const classBonus = getClassAttributeBonus(character, attr.key)
                const gearBonus = sumGearRollBonus(character, attr.key)
                const rollBonus = eff + classBonus + gearBonus
                const reduced = eff < base
                return (
                  <button
                    key={attr.key}
                    type="button"
                    onClick={() => onRollAttribute?.(
                      character, attr.key, attr.label, rollBonus, diceSides,
                      { attrBonus: eff, classBonus, weaponPenalty: 0, gearBonus },
                    )}
                    title={`d${diceSides} + ${attr.label}`}
                    style={{
                      background: '#111',
                      border: `1px solid ${(classBonus > 0 || gearBonus > 0) ? 'rgba(217,119,6,0.3)' : '#1e1e1e'}`,
                      borderRadius: '4px',
                      padding: '0.3rem 0.2rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.4rem', color: attr.color, fontFamily: 'monospace' }}>
                      {socialAttrShort(attr)}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: reduced ? '#ea580c' : '#e5e5e5', lineHeight: 1.1 }}>
                      {eff + gearBonus}
                      {classBonus > 0 && (
                        <span style={{ fontSize: '0.5rem', color: '#d97706', marginLeft: '1px' }}>+{classBonus}</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div>
                <div style={{ fontSize: '0.4rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
                  ATRIBUTOS
                </div>
                {renderPhysical()}
              </div>
              <div>
                <div style={{ fontSize: '0.4rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
                  CENA
                </div>
                {renderSocial()}
              </div>
            </div>
          )
        })()}
      </section>

      <section style={{ borderBottom: '1px solid #1a1a1a' }}>
        <button
          type="button"
          onClick={() => setSkillsOpen(v => !v)}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.35rem 0.625rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#555',
          }}
        >
          <span style={{ fontSize: '0.5rem', fontFamily: 'monospace', letterSpacing: '0.06em' }}>
            SKILLS · {skills.length}
          </span>
          {skillsOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>

        {skillsOpen && (
          <div style={{ maxHeight: '160px', overflowY: 'auto', padding: '0 0.5rem 0.45rem' }}>
            {skills.length === 0 ? (
              <p style={{ fontSize: '0.65rem', color: '#333', textAlign: 'center', margin: 0 }}>Sem skills</p>
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
                    padding: '0.3rem 0.45rem',
                    marginBottom: '0.2rem',
                    gap: '0.35rem',
                    cursor: onSelectSkill ? 'pointer' : 'default',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#e5e5e5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {rt.catalog.name}
                    </div>
                    {!rt.isPassive && rt.cooldownTotal > 0 && (
                      <div style={{ fontSize: '0.45rem', fontFamily: 'monospace', color: '#555' }}>
                        CD {rt.cooldownRemaining}/{rt.cooldownTotal}
                      </div>
                    )}
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
                      style={{ padding: '2px 5px', fontSize: '0.5rem', opacity: rt.canActivate ? 1 : 0.35, flexShrink: 0 }}
                    >
                      <Play size={8} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </section>

      <section>
        <button
          type="button"
          onClick={() => setNotesOpen(v => !v)}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.35rem 0.625rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: hasNotes ? '#777' : '#444',
          }}
        >
          <span style={{ fontSize: '0.5rem', fontFamily: 'monospace', letterSpacing: '0.06em' }}>
            NOTAS{hasNotes ? ' · ···' : ''}
          </span>
          {notesOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
        {notesOpen && (
          <div style={{ padding: '0 0.625rem 0.5rem' }}>
            <textarea
              className="input-base"
              rows={2}
              value={character.combatNotes ?? ''}
              onChange={e => onUpdate?.({ combatNotes: e.target.value })}
              placeholder="Anotações…"
              style={{ fontSize: '0.7rem', lineHeight: 1.35, resize: 'none', width: '100%', padding: '4px 6px' }}
            />
          </div>
        )}
      </section>
    </article>
  )
}
