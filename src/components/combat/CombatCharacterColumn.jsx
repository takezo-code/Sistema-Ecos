import React, { useState } from 'react'
import {
  Zap, Play, ChevronDown, ChevronUp, Star, Info, Sword, Shield as ShieldIcon,
  Dices, Sparkles, Brain,
} from 'lucide-react'
import { COMBAT_HIGHLIGHT_XP } from '../../constants/progression'
import { DamageMarksPanel, PLAYER_MARK_TYPES } from './DamageMarksPanel'
import { EntityThumb } from '../ui/EntityThumb'
import { mergeMentalStateWithOverload, getMentalStateOption } from '../../constants/states'
import { ATTRIBUTES, SOCIAL_ATTRIBUTES } from '../../constants/attributes'
import { getRupturaPool, getOverloadPhase, ECO_OVERLOAD_PHASES } from '../../constants/ecoOverload'
import { getEffectiveAttributeValue, getEffectiveSocialAttributeValue } from '../../services/stateModifiers'
import { listActiveMentalStatusDetails } from '../../services/mentalStatusService'
import { getCharacterClass } from '../../constants/classes'
import { getClassAttributeBonus } from '../../mechanics/classes/classBonusEngine'
import { getArmorDestrezaPenalty, getArmorMarkBonus } from '../../mechanics/equipment/armorEffectsEngine'
import { sumGearRollBonus, sumAttrBonus, getRupturaUsesBreakdown } from '../../mechanics/equipment/gearPassiveEngine'
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

function SectionLabel({ children, accent = '#777' }) {
  return (
    <div style={{
      fontSize: '0.5rem',
      color: accent,
      fontFamily: 'monospace',
      letterSpacing: '0.1em',
      fontWeight: 600,
      marginBottom: '0.28rem',
    }}>
      {children}
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
        background: highlighted ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${highlighted ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 8,
        padding: '0.32rem 0.12rem 0.28rem',
        cursor: 'pointer',
        textAlign: 'center',
      }}
    >
      <div style={{
        fontSize: '0.42rem',
        color,
        fontFamily: 'monospace',
        fontWeight: 700,
        letterSpacing: '0.06em',
        opacity: 0.9,
      }}>
        {shortKey}
      </div>
      <div style={{
        fontSize: '0.92rem',
        fontWeight: 700,
        color: reduced ? '#ea580c' : '#ececec',
        lineHeight: 1.15,
        marginTop: 2,
      }}>
        {displayVal}
        {classBonus > 0 && (
          <span style={{ fontSize: '0.45rem', color: '#c4b5fd', marginLeft: 1 }}>+{classBonus}</span>
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
  maxMarks = 0,
  defeated = false,
  badge = null,
  extraBeforeMarks = null,
  diceSides: controlledDiceSides,
  onDiceSidesChange,
}) {
  const [skillsOpen, setSkillsOpen] = useState(false)
  const [xpFlash, setXpFlash] = useState(false)
  const [internalDiceSides, setInternalDiceSides] = useState(20)
  const [infoOpen, setInfoOpen] = useState(false)
  const [gearView, setGearView] = useState(null)

  const diceSides = controlledDiceSides ?? internalDiceSides
  const setDiceSides = onDiceSidesChange ?? setInternalDiceSides

  const physical = character.physicalState ?? 'bem'
  const rupturaPool = getRupturaPool(character)
  const safeLimit = rupturaPool.max
  const overload = rupturaPool.spent
  const mental = mergeMentalStateWithOverload(character.mentalState, overload, safeLimit)
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
  const vitBuffer = Math.floor(Math.max(0, Number(character.attributes?.vitalidade) || 0) / 2)
  const armorMarks = getArmorMarkBonus(character)
  const buffMarks = sumMarkBuffBonus(character)
  const activeBuffs = listActiveBuffs(character)
  const rupturaGear = getRupturaUsesBreakdown(character)
  const hasInfoRows = vitBuffer > 0 || armorMarks > 0 || buffMarks > 0
    || activeBuffs.length > 0 || armorDexPenalty > 0 || rupturaGear.total > 0
  const weapon = getCharacterWeapon(character)
  const armor = getCharacterArmor(character)
  const armorTier = getArmorTier(character)
  const electric = electricForPhysical(physical)
  const badgeLabel = badge?.label || characterClass?.label
  const badgeColor = badge?.color || characterClass?.color || '#a855f7'

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
        opacity: defeated ? 0.65 : 1,
      }}
    >
    <article style={{
      width: '100%',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(12, 12, 16, 0.96)',
      border: `1px solid ${defeated ? 'rgba(220,38,38,0.35)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 12,
      overflow: infoOpen ? 'visible' : 'hidden',
      position: 'relative',
      zIndex: 1,
    }}>

      <header style={{
        padding: '0.55rem 0.65rem 0.5rem',
        position: 'relative',
      }}>
        <button
          type="button"
          onClick={() => setInfoOpen(v => !v)}
          title="Bônus e detalhes"
          style={{
            position: 'absolute',
            top: '0.4rem',
            right: '0.4rem',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            padding: '3px 6px',
            background: infoOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
            border: `1px solid ${infoOpen ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 999,
            color: infoOpen ? '#ddd' : '#666',
            cursor: 'pointer',
            fontSize: '0.45rem',
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          <Info size={9} strokeWidth={2.4} />
          Info
        </button>

        {infoOpen && (
          <div
            style={{
              position: 'absolute',
              top: '1.7rem',
              right: '0.4rem',
              left: '0.4rem',
              zIndex: 30,
              background: 'rgba(14,14,20,0.98)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              padding: '0.5rem 0.55rem',
              boxShadow: '0 12px 28px rgba(0,0,0,0.55)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.28rem',
            }}
          >
            <div style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: '#888', fontWeight: 700, letterSpacing: '0.08em' }}>
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
            {rupturaGear.weapon > 0 && (
              <div style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#d97706' }}>
                +{rupturaGear.weapon} usos · arma
              </div>
            )}
            {rupturaGear.armor > 0 && (
              <div style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#d97706' }}>
                +{rupturaGear.armor} usos · armadura
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

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', paddingRight: '2.8rem' }}>
          <EntityThumb src={character.image} alt={character.name} size={34} borderRadius="8px" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', minWidth: 0 }}>
              <span style={{
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#f0f0f0',
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
                    padding: 3,
                    background: xpFlash ? 'rgba(217,119,6,0.2)' : 'transparent',
                    border: `1px solid ${xpFlash ? 'rgba(251,191,36,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 7,
                    color: '#c4b5fd',
                    cursor: 'pointer',
                  }}
                >
                  <Star size={10} fill={xpFlash ? '#fbbf24' : 'none'} strokeWidth={2.2} />
                </button>
              )}
            </div>
            <div style={{
              fontSize: '0.5rem',
              fontFamily: 'monospace',
              color: '#777',
              marginTop: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span>Nv.{character.level ?? 1}</span>
              {badgeLabel && (
                <span style={{ color: badgeColor, opacity: 0.9 }}>
                  {badgeLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Zap size={11} style={{ color: barColor, flexShrink: 0 }} strokeWidth={2.2} />
          <div style={{
            flex: 1,
            height: 4,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 999,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${overloadPct * 100}%`,
              background: barColor,
              borderRadius: 999,
              transition: 'width 0.3s',
              opacity: 0.85,
            }} />
          </div>
          <span style={{
            fontSize: '0.5rem',
            color: '#999',
            fontFamily: 'monospace',
            flexShrink: 0,
            fontWeight: 600,
          }}>
            {rupturaPool.spent}/{rupturaPool.max}
          </span>
        </div>

        <div style={{
          marginTop: '0.4rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
        }}>
          <div
            title="Estado mental (definido pelos usos de Ruptura)"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              fontSize: '0.58rem',
              padding: '4px 6px',
              border: `1px solid ${mentalOpt.color}40`,
              borderRadius: 8,
              color: mentalOpt.color,
              fontFamily: 'monospace',
              fontWeight: 600,
              background: `${mentalOpt.color}12`,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <Brain size={11} strokeWidth={2.2} />
            {mentalOpt.label}
          </div>
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
              <Sword size={12} strokeWidth={2.2} />
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
              <ShieldIcon size={12} strokeWidth={2.2} />
            )}
          </IconChip>
        </div>

        {mentalStatuses.length > 0 && (
          <div style={{
            marginTop: '0.3rem',
            fontSize: '0.48rem',
            color: '#c4b5fd',
            fontFamily: 'monospace',
            textAlign: 'center',
          }}>
            {mentalStatuses.map(s => s.definition?.label).join(' · ')}
          </div>
        )}
      </header>

      <section style={{ padding: '0.45rem 0.65rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {extraBeforeMarks}
        <DamageMarksPanel
          character={character}
          maxMarks={maxMarks}
          markTypes={PLAYER_MARK_TYPES}
          compact
          onApplyMarks={onApplyMarks}
          onHealMarks={onHealMarks}
          onClearMarks={onClearMarks}
          onNotice={onNotice}
        />
        {defeated && (
          <div style={{
            fontSize: '0.55rem',
            color: '#dc2626',
            fontFamily: 'monospace',
            textAlign: 'center',
            fontWeight: 700,
            letterSpacing: '0.06em',
          }}>
            DERROTADO
          </div>
        )}
      </section>

      <section style={{ padding: '0.1rem 0.65rem 0.5rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.35rem',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            color: '#777',
            fontSize: '0.48rem',
            fontFamily: 'monospace',
            fontWeight: 600,
            letterSpacing: '0.08em',
          }}>
            <Dices size={10} strokeWidth={2.2} />
            DADO
          </div>
          <div style={{ display: 'inline-flex', gap: 3 }}>
            {[8, 20].map(sides => {
              const active = diceSides === sides
              return (
                <button
                  key={sides}
                  type="button"
                  onClick={() => setDiceSides(sides)}
                  title={`d${sides}`}
                  style={{
                    padding: '2px 7px',
                    fontSize: '0.5rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    borderRadius: 6,
                    cursor: 'pointer',
                    border: `1px solid ${active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)'}`,
                    background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: active ? '#e5e5e5' : '#666',
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.22rem' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${top.length}, 1fr)`,
                  gap: '0.22rem',
                }}>
                  {top.map(renderBtn)}
                </div>
                {bottom.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${bottom.length}, 1fr)`,
                    gap: '0.22rem',
                  }}>
                    {bottom.map(renderBtn)}
                  </div>
                )}
              </div>
            )
          }

          const renderSocial = () => (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.22rem' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div>
                <SectionLabel accent="#888">ATRIBUTOS</SectionLabel>
                {renderPhysical()}
              </div>
              <div>
                <SectionLabel accent="#6b7280">CENA</SectionLabel>
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
