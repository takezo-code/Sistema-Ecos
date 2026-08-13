import React, { useState } from 'react'
import {
  Zap, Play, ChevronDown, ChevronUp, Star, Info, Sword, Shield as ShieldIcon,
  Dices, Sparkles, StickyNote, Brain,
} from 'lucide-react'
import { COMBAT_HIGHLIGHT_XP } from '../../constants/progression'
import { DamageMarksPanel, PLAYER_MARK_TYPES } from './DamageMarksPanel'
import { EntityThumb } from '../ui/EntityThumb'
import { PHYSICAL_STATES, mergeMentalStateWithOverload, getMentalStateOption } from '../../constants/states'
import { ATTRIBUTES, SOCIAL_ATTRIBUTES } from '../../constants/attributes'
import { getRupturaPool, getOverloadPhase, ECO_OVERLOAD_PHASES } from '../../constants/ecoOverload'
import { getEffectiveAttributeValue, getEffectiveSocialAttributeValue } from '../../services/stateModifiers'
import { listActiveMentalStatusDetails } from '../../services/mentalStatusService'
import { getCharacterClass } from '../../constants/classes'
import { getClassAttributeBonus } from '../../mechanics/classes/classBonusEngine'
import { getArmorDestrezaPenalty, getArmorMarkBonus } from '../../mechanics/equipment/armorEffectsEngine'
import { sumGearRollBonus, sumAttrBonus } from '../../mechanics/equipment/gearPassiveEngine'
import { listActiveBuffs, sumMarkBuffBonus, sumAttrBuffBonus, formatBuff } from '../../mechanics/skills/skillBuffEngine'
import { getCharacterWeapon, getCharacterArmor } from '../../mechanics/equipment/characterGear'
import { getArmorTier } from '../../mechanics/equipment/armorProgressionEngine'
import { GearDetailModal } from '../equipment/GearDetailModal'
import ElectricBorder from '../react-bits/ElectricBorder'
import { Button } from '../ui/Button'

function socialAttrShort(attr) {
  if (attr.key === 'carisma') return 'CAR'
  if (attr.key === 'percepcao') return 'PER'
  if (attr.key === 'vontade') return 'VON'
  if (attr.key === 'sabedoria') return 'SAB'
  return attr.label.slice(0, 3).toUpperCase()
}

function electricForPhysical(physicalState) {
  if (physicalState === 'incapacitado') {
    return { color: '#ef4444', speed: 2.8, chaos: 0.26 }
  }
  if (physicalState === 'grave') {
    return { color: '#dc2626', speed: 2.1, chaos: 0.2 }
  }
  if (physicalState === 'ferido') {
    return { color: '#60a5fa', speed: 1.05, chaos: 0.14 }
  }
  return { color: '#3b82f6', speed: 0.45, chaos: 0.09 }
}

function IconChip({ active, color, disabled, title, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: 30,
        height: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        background: active
          ? `linear-gradient(145deg, ${color}28, ${color}10)`
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${active ? `${color}66` : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 9,
        color: active ? color : '#3a3a3a',
        cursor: disabled ? 'default' : 'pointer',
        overflow: 'hidden',
        boxShadow: active ? `0 0 14px ${color}33, inset 0 1px 0 rgba(255,255,255,0.08)` : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s, color 0.15s',
      }}
    >
      {children}
    </button>
  )
}

function SectionLabel({ children, accent = '#666' }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: '0.3rem',
    }}>
      <span style={{
        fontSize: '0.42rem',
        color: accent,
        fontFamily: 'monospace',
        letterSpacing: '0.12em',
        fontWeight: 700,
      }}>
        {children}
      </span>
      <div style={{
        flex: 1,
        height: 1,
        background: `linear-gradient(90deg, ${accent}44, transparent)`,
      }} />
    </div>
  )
}

function AttrRollButton({
  shortKey,
  color,
  displayVal,
  classBonus,
  reduced,
  highlighted,
  title,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)',
        border: `1px solid ${highlighted ? 'rgba(217,119,6,0.45)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 8,
        padding: '0.38rem 0.15rem 0.32rem',
        cursor: 'pointer',
        textAlign: 'center',
        overflow: 'hidden',
        boxShadow: highlighted
          ? '0 0 12px rgba(217,119,6,0.15), inset 0 1px 0 rgba(255,255,255,0.06)'
          : 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: '15%',
        right: '15%',
        height: 2,
        borderRadius: '0 0 2px 2px',
        background: color,
        boxShadow: `0 0 8px ${color}`,
        opacity: 0.9,
      }} />
      <div style={{
        fontSize: '0.42rem',
        color,
        fontFamily: 'monospace',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textShadow: `0 0 10px ${color}66`,
      }}>
        {shortKey}
      </div>
      <div style={{
        fontSize: '0.98rem',
        fontWeight: 800,
        color: reduced ? '#ea580c' : '#f3f3f3',
        lineHeight: 1.1,
        marginTop: 2,
        textShadow: reduced ? '0 0 10px rgba(234,88,12,0.35)' : 'none',
      }}>
        {displayVal}
        {classBonus > 0 && (
          <span style={{ fontSize: '0.48rem', color: '#fbbf24', marginLeft: 1 }}>+{classBonus}</span>
        )}
      </div>
    </button>
  )
}

function AccordionHeader({ open, onToggle, icon: Icon, label, accent = '#777' }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.42rem 0.7rem',
        background: open
          ? 'linear-gradient(90deg, rgba(255,255,255,0.04), transparent)'
          : 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: open ? accent : '#555',
        transition: 'color 0.15s, background 0.15s',
      }}
    >
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: '0.52rem',
        fontFamily: 'monospace',
        letterSpacing: '0.08em',
        fontWeight: 700,
      }}>
        <Icon size={11} strokeWidth={2.2} style={{ opacity: 0.85 }} />
        {label}
      </span>
      {open
        ? <ChevronUp size={12} strokeWidth={2.2} />
        : <ChevronDown size={12} strokeWidth={2.2} />}
    </button>
  )
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
  const [infoOpen, setInfoOpen] = useState(false)
  const [gearView, setGearView] = useState(null)

  const physical = character.physicalState ?? 'bem'
  const rupturaPool = getRupturaPool(character)
  const safeLimit = rupturaPool.max
  const overload = rupturaPool.spent
  const mental = mergeMentalStateWithOverload(character.mentalState, overload, safeLimit)
  const physicalOpt = PHYSICAL_STATES.find(s => s.value === physical) || PHYSICAL_STATES[0]
  const mentalOpt = getMentalStateOption(mental)
  const mentalStatuses = listActiveMentalStatusDetails(character.activeMentalStatuses)
  const skills = character._skillRuntimes || []
  const characterClass = getCharacterClass(character)
  const armorDexPenalty = getArmorDestrezaPenalty(character)
  const overloadPct = Math.min(overload / Math.max(safeLimit, 1), 1)
  const overloadPhase = getOverloadPhase(overload, safeLimit)
  const barColor = overloadPhase === ECO_OVERLOAD_PHASES.TOTAL || overloadPhase === ECO_OVERLOAD_PHASES.RUPTURE
    ? '#dc2626'
    : overloadPhase === ECO_OVERLOAD_PHASES.SHAKEN
      ? '#f97316'
      : '#a855f7'
  const hasNotes = Boolean((character.combatNotes || '').trim())
  const vitBuffer = Math.floor(Math.max(0, Number(character.attributes?.vitalidade) || 0) / 2)
  const armorMarks = getArmorMarkBonus(character)
  const buffMarks = sumMarkBuffBonus(character)
  const activeBuffs = listActiveBuffs(character)
  const hasInfoRows = vitBuffer > 0 || armorMarks > 0 || buffMarks > 0
    || activeBuffs.length > 0 || armorDexPenalty > 0
  const weapon = getCharacterWeapon(character)
  const armor = getCharacterArmor(character)
  const armorTier = getArmorTier(character)
  const electric = electricForPhysical(physical)
  const classColor = characterClass?.color || '#a855f7'

  return (
    <ElectricBorder
      color={electric.color}
      speed={electric.speed}
      chaos={electric.chaos}
      borderRadius={12}
      displacement={12}
      borderOffset={12}
      style={{
        width: '220px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: infoOpen ? 20 : 1,
      }}
    >
    <article style={{
      width: '100%',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(165deg, #121218 0%, #0a0a0e 55%, #0d0d12 100%)',
      border: `1px solid ${physicalOpt.color}33`,
      borderRadius: 12,
      overflow: infoOpen ? 'visible' : 'hidden',
      position: 'relative',
      zIndex: 1,
      boxShadow: physicalOpt.glow
        ? `0 0 20px ${physicalOpt.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`
        : 'inset 0 1px 0 rgba(255,255,255,0.04)',
    }}>

      <header style={{
        padding: '0.6rem 0.7rem 0.55rem',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
        position: 'relative',
      }}>
        <button
          type="button"
          onClick={() => setInfoOpen(v => !v)}
          title="Bônus e detalhes"
          style={{
            position: 'absolute',
            top: '0.45rem',
            right: '0.45rem',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            padding: '3px 7px',
            background: infoOpen
              ? 'linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))'
              : 'rgba(255,255,255,0.04)',
            border: `1px solid ${infoOpen ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 999,
            color: infoOpen ? '#e5e5e5' : '#777',
            cursor: 'pointer',
            fontSize: '0.48rem',
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            boxShadow: infoOpen ? '0 0 12px rgba(255,255,255,0.08)' : 'none',
          }}
        >
          <Info size={9} strokeWidth={2.4} />
          Info
        </button>

        {infoOpen && (
          <div
            style={{
              position: 'absolute',
              top: '1.75rem',
              right: '0.45rem',
              left: '0.45rem',
              zIndex: 30,
              background: 'rgba(14,14,20,0.96)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10,
              padding: '0.55rem 0.6rem',
              boxShadow: '0 12px 28px rgba(0,0,0,0.55)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem',
            }}
          >
            <div style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: '#999', fontWeight: 700, letterSpacing: '0.08em' }}>
              BÔNUS
            </div>
            {!hasInfoRows && (
              <div style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: '#555' }}>
                Nenhum bônus ativo
              </div>
            )}
            {vitBuffer > 0 && (
              <div style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#4ade80' }}>
                +{vitBuffer} vida máx. (VIT)
              </div>
            )}
            {armorMarks > 0 && (
              <div style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#94a3b8' }}>
                +{armorMarks} vida · armadura
              </div>
            )}
            {buffMarks > 0 && (
              <div style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#c084fc' }}>
                +{buffMarks} vida · skills
              </div>
            )}
            {armorDexPenalty > 0 && (
              <div style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#fb923c' }}>
                −{armorDexPenalty} DES · armadura
              </div>
            )}
            {activeBuffs.length > 0 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                marginTop: 2,
                paddingTop: 6,
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}>
                {activeBuffs.map(b => (
                  <div
                    key={b.id || b.sourceTemplateId}
                    style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: '#c084fc', lineHeight: 1.35 }}
                  >
                    {formatBuff(b)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', paddingRight: '3rem' }}>
          <div style={{
            borderRadius: 10,
            padding: 1,
            background: `linear-gradient(145deg, ${classColor}66, transparent)`,
            boxShadow: `0 0 14px ${classColor}22`,
          }}>
            <EntityThumb src={character.image} alt={character.name} size={36} borderRadius="9px" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', minWidth: 0 }}>
              <span style={{
                fontSize: '0.88rem',
                fontWeight: 800,
                color: '#f8f8f8',
                letterSpacing: '-0.02em',
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
                    padding: 4,
                    background: xpFlash
                      ? 'linear-gradient(145deg, rgba(217,119,6,0.35), rgba(217,119,6,0.12))'
                      : 'rgba(217,119,6,0.1)',
                    border: `1px solid ${xpFlash ? 'rgba(251,191,36,0.65)' : 'rgba(217,119,6,0.35)'}`,
                    borderRadius: 8,
                    color: '#fbbf24',
                    cursor: 'pointer',
                    boxShadow: xpFlash ? '0 0 14px rgba(217,119,6,0.4)' : 'none',
                  }}
                >
                  <Star size={10} fill={xpFlash ? '#fbbf24' : 'none'} strokeWidth={2.2} />
                </button>
              )}
            </div>
            <div style={{
              fontSize: '0.52rem',
              fontFamily: 'monospace',
              color: '#6b6b6b',
              marginTop: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              flexWrap: 'wrap',
            }}>
              <span>Nv.{character.level ?? 1}</span>
              {characterClass && (
                <span style={{
                  color: classColor,
                  background: `${classColor}18`,
                  border: `1px solid ${classColor}40`,
                  borderRadius: 999,
                  padding: '1px 6px',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  boxShadow: `0 0 10px ${classColor}22`,
                }}>
                  {characterClass.label}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '0.55rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <div style={{
              width: 18,
              height: 18,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${barColor}18`,
              border: `1px solid ${barColor}44`,
              boxShadow: `0 0 10px ${barColor}33`,
              flexShrink: 0,
            }}>
              <Zap size={10} fill={barColor} style={{ color: barColor }} strokeWidth={2} />
            </div>
            <div style={{
              flex: 1,
              height: 5,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 999,
              overflow: 'hidden',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.45)',
            }}>
              <div style={{
                height: '100%',
                width: `${overloadPct * 100}%`,
                background: `linear-gradient(90deg, ${barColor}aa, ${barColor})`,
                borderRadius: 999,
                boxShadow: `0 0 10px ${barColor}`,
                transition: 'width 0.3s',
              }} />
            </div>
            <span style={{
              fontSize: '0.52rem',
              color: barColor,
              fontFamily: 'monospace',
              flexShrink: 0,
              fontWeight: 800,
              textShadow: `0 0 8px ${barColor}55`,
            }}>
              {rupturaPool.spent}/{rupturaPool.max}
            </span>
          </div>
        </div>

        <div
          title="Estado mental (definido pelos usos de Ruptura)"
          style={{
            marginTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: '0.68rem',
            padding: '6px 8px',
            border: `1px solid ${mentalOpt.color}55`,
            borderRadius: 10,
            color: mentalOpt.color,
            fontFamily: 'monospace',
            fontWeight: 700,
            background: `linear-gradient(145deg, ${mentalOpt.color}22, ${mentalOpt.color}08)`,
            boxShadow: `0 0 16px ${mentalOpt.color}18, inset 0 1px 0 rgba(255,255,255,0.05)`,
            pointerEvents: 'none',
            userSelect: 'none',
            letterSpacing: '0.02em',
          }}
        >
          <Brain size={12} strokeWidth={2.2} />
          {mentalOpt.label}
        </div>

        {mentalStatuses.length > 0 && (
          <div style={{
            marginTop: '0.35rem',
            fontSize: '0.5rem',
            color: '#fbbf24',
            fontFamily: 'monospace',
            textAlign: 'center',
            opacity: 0.9,
          }}>
            {mentalStatuses.map(s => s.definition?.label).join(' · ')}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.45rem' }}>
          <IconChip
            active={!!weapon}
            color="#f97316"
            disabled={!weapon}
            title={weapon ? `Arma: ${weapon.name}` : 'Sem arma'}
            onClick={() => weapon && setGearView('arma')}
          >
            {weapon?.image ? (
              <img src={weapon.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Sword size={13} strokeWidth={2.2} />
            )}
          </IconChip>
          <IconChip
            active={!!armor}
            color={armorTier.color}
            disabled={!armor}
            title={armor ? `Armadura: ${armor.name}` : 'Sem armadura'}
            onClick={() => armor && setGearView('armadura')}
          >
            {armor?.image ? (
              <img src={armor.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <ShieldIcon size={13} strokeWidth={2.2} />
            )}
          </IconChip>
        </div>
      </header>

      <section style={{ padding: '0.5rem 0.7rem' }}>
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

      <section style={{ padding: '0.15rem 0.7rem 0.55rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.4rem',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            color: '#666',
            fontSize: '0.45rem',
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '0.08em',
          }}>
            <Dices size={11} strokeWidth={2.2} />
            DADO
          </div>
          <div style={{
            display: 'inline-flex',
            padding: 2,
            borderRadius: 9,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            gap: 2,
          }}>
            {[8, 20].map(sides => {
              const active = diceSides === sides
              const accent = sides === 8 ? '#22d3ee' : '#e5e5e5'
              return (
                <button
                  key={sides}
                  type="button"
                  onClick={() => setDiceSides(sides)}
                  title={`d${sides}`}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.52rem',
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    borderRadius: 7,
                    cursor: 'pointer',
                    border: 'none',
                    background: active
                      ? `linear-gradient(145deg, ${accent}33, ${accent}12)`
                      : 'transparent',
                    color: active ? accent : '#555',
                    boxShadow: active ? `0 0 10px ${accent}33` : 'none',
                  }}
                >
                  d{sides}
                </button>
              )
            })}
          </div>
        </div>

        {(() => {
          const physicalList = attributeList ?? ATTRIBUTES

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
              const gearAttrBonus = sumAttrBonus(character, attr.key)
              const gearRollExtra = sumGearRollBonus(character, attr.key)
              const skillAttrBonus = sumAttrBuffBonus(character, attr.key)
              const displayVal = eff + gearAttrBonus + skillAttrBonus
              const rollBonus = eff + classBonus + gearRollExtra + skillAttrBonus
              const reduced = eff < base
              const shortKey = attr.key === 'inteligencia' ? 'INT'
                : attr.key === 'vitalidade' ? 'VIT'
                : attr.key === 'ruptura' ? 'RUP'
                : attr.label.slice(0, 3).toUpperCase()
              return (
                <AttrRollButton
                  key={attr.key}
                  shortKey={shortKey}
                  color={attr.color}
                  displayVal={displayVal}
                  classBonus={classBonus}
                  reduced={reduced}
                  highlighted={classBonus > 0 || gearRollExtra > 0}
                  title={`d${diceSides} + ${attr.label}`}
                  onClick={() => onRollAttribute?.(
                    character, attr.key, attr.label, rollBonus, diceSides,
                    { attrBonus: eff + skillAttrBonus, classBonus, weaponPenalty: 0, gearBonus: gearRollExtra },
                  )}
                />
              )
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${top.length}, 1fr)`,
                  gap: '0.25rem',
                }}>
                  {top.map(renderBtn)}
                </div>
                {bottom.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${bottom.length}, 1fr)`,
                    gap: '0.25rem',
                  }}>
                    {bottom.map(renderBtn)}
                  </div>
                )}
              </div>
            )
          }

          const renderSocial = () => (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.25rem' }}>
              {SOCIAL_ATTRIBUTES.map(attr => {
                const base = character.socialAttributes?.[attr.key] ?? 0
                const eff = getEffectiveSocialAttributeValue(character.socialAttributes || {}, attr.key, {
                  ecoOverload: overload,
                  mentalState: mental,
                  safeLimit,
                })
                const classBonus = getClassAttributeBonus(character, attr.key)
                const gearAttrBonus = sumAttrBonus(character, attr.key)
                const gearRollExtra = sumGearRollBonus(character, attr.key)
                const skillAttrBonus = sumAttrBuffBonus(character, attr.key)
                const displayVal = eff + gearAttrBonus + skillAttrBonus
                const rollBonus = eff + classBonus + gearRollExtra + skillAttrBonus
                const reduced = eff < base
                return (
                  <AttrRollButton
                    key={attr.key}
                    shortKey={socialAttrShort(attr)}
                    color={attr.color}
                    displayVal={displayVal}
                    classBonus={classBonus}
                    reduced={reduced}
                    highlighted={classBonus > 0 || gearRollExtra > 0}
                    title={`d${diceSides} + ${attr.label}`}
                    onClick={() => onRollAttribute?.(
                      character, attr.key, attr.label, rollBonus, diceSides,
                      { attrBonus: eff + skillAttrBonus, classBonus, weaponPenalty: 0, gearBonus: gearRollExtra },
                    )}
                  />
                )
              })}
            </div>
          )

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>
                <SectionLabel accent="#888">ATRIBUTOS</SectionLabel>
                {renderPhysical()}
              </div>
              <div>
                <SectionLabel accent="#64748b">CENA</SectionLabel>
                {renderSocial()}
              </div>
            </div>
          )
        })()}
      </section>

      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <AccordionHeader
          open={skillsOpen}
          onToggle={() => setSkillsOpen(v => !v)}
          icon={Sparkles}
          label={`SKILLS · ${skills.length}`}
          accent="#c084fc"
        />

        {skillsOpen && (
          <div style={{ maxHeight: '160px', overflowY: 'auto', padding: '0 0.55rem 0.5rem' }}>
            {skills.length === 0 ? (
              <p style={{ fontSize: '0.65rem', color: '#444', textAlign: 'center', margin: 0 }}>Sem skills</p>
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
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
                    border: `1px solid ${rt.visualMeta?.border || 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 9,
                    padding: '0.35rem 0.5rem',
                    marginBottom: '0.25rem',
                    gap: '0.35rem',
                    cursor: onSelectSkill ? 'pointer' : 'default',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontSize: '0.65rem',
                      fontWeight: 650,
                      color: '#ececec',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {rt.catalog.name}
                    </div>
                    {!rt.isPassive && rt.cooldownTotal > 0 && (
                      <div style={{ fontSize: '0.45rem', fontFamily: 'monospace', color: '#666' }}>
                        CD {rt.cooldownRemaining}/{rt.cooldownTotal}
                      </div>
                    )}
                  </div>
                  {!rt.isPassive && onActivateSkill && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="xs"
                      disabled={!rt.canActivate}
                      onClick={e => {
                        e.stopPropagation()
                        onActivateSkill(character.id, rt.instance.id)
                      }}
                      title={rt.blockReason || 'Ativar'}
                      style={{
                        padding: '3px 6px',
                        opacity: rt.canActivate ? 1 : 0.35,
                        flexShrink: 0,
                        borderRadius: 7,
                      }}
                    >
                      <Play size={9} fill="currentColor" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </section>

      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <AccordionHeader
          open={notesOpen}
          onToggle={() => setNotesOpen(v => !v)}
          icon={StickyNote}
          label={hasNotes ? 'NOTAS · ···' : 'NOTAS'}
          accent={hasNotes ? '#94a3b8' : '#555'}
        />
        {notesOpen && (
          <div style={{ padding: '0 0.7rem 0.55rem' }}>
            <textarea
              className="input-base"
              rows={2}
              value={character.combatNotes ?? ''}
              onChange={e => onUpdate?.({ combatNotes: e.target.value })}
              placeholder="Anotações…"
              style={{
                fontSize: '0.7rem',
                lineHeight: 1.35,
                resize: 'none',
                width: '100%',
                padding: '6px 8px',
                borderRadius: 9,
                background: 'rgba(255,255,255,0.03)',
                borderColor: 'rgba(255,255,255,0.1)',
              }}
            />
          </div>
        )}
      </section>

      <GearDetailModal
        open={!!gearView}
        onClose={() => setGearView(null)}
        entity={character}
        kind={gearView}
        weapon={weapon}
        armor={armor}
      />
    </article>
    </ElectricBorder>
  )
}
