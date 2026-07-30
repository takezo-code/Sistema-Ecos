import React, { useState, useEffect, useRef } from 'react'
import { Dices, Trash2, Zap } from 'lucide-react'
import { useDiceStore } from '../store/useDiceStore'
import { useCharacterStore } from '../store/useCharacterStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { PageHeader } from '../components/ui/PageHeader'
import { formatDateTime } from '../utils/id'
import { getAllAttributeLabels, SOCIAL_ATTRIBUTES } from '../constants/attributes'
import { getEffectiveAttributeValue, getEffectiveSocialAttributeValue } from '../services/stateModifiers'
import { getCharacterClass } from '../constants/classes'
import { getClassAttributeBonus } from '../mechanics/classes/classBonusEngine'
import { getArmorDestrezaPenalty } from '../mechanics/equipment/armorEffectsEngine'

const SOCIAL_ATTR_KEYS = new Set(SOCIAL_ATTRIBUTES.map(a => a.key))

function resolveAttrValue(char, attrKey) {
  if (SOCIAL_ATTR_KEYS.has(attrKey)) {
    return getEffectiveSocialAttributeValue(char.socialAttributes || {}, attrKey, {
      ecoOverload: char.ecoOverload ?? 0,
      mentalState: char.mentalState ?? 'estavel',
      ruptura: char.attributes?.ruptura,
    })
  }
  return getEffectiveAttributeValue(char.attributes, attrKey, {
    physicalState: char.physicalState ?? char.condition ?? 'bem',
    ecoOverload: char.ecoOverload ?? 0,
    mentalState: char.mentalState ?? 'estavel',
    destrezaPenalty: getArmorDestrezaPenalty(char),
    ruptura: char.attributes?.ruptura,
  })
}

const DICE_TYPES = [
  { sides: 4, label: 'd4', color: '#a855f7' },
  { sides: 6, label: 'd6', color: '#06b6d4' },
  { sides: 8, label: 'd8', color: '#16a34a' },
  { sides: 10, label: 'd10', color: '#d97706' },
  { sides: 12, label: 'd12', color: '#dc2626' },
  { sides: 20, label: 'd20', color: '#e5e5e5' },
  { sides: 100, label: 'd100', color: '#9ca3af' },
]

const ATTRIBUTE_LABELS = getAllAttributeLabels()

function DiceButton({ dice, onClick, rolling }) {
  return (
    <button
      onClick={onClick}
      disabled={rolling}
      style={{
        background: '#111',
        border: `1px solid ${dice.color}20`,
        borderRadius: '6px',
        padding: '1.25rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.375rem',
        cursor: rolling ? 'wait' : 'pointer',
        transition: 'all 0.15s',
        minHeight: '90px',
      }}
      onMouseEnter={e => {
        if (!rolling) {
          e.currentTarget.style.background = `${dice.color}10`
          e.currentTarget.style.borderColor = `${dice.color}40`
          e.currentTarget.style.transform = 'translateY(-2px)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = '#111'
        e.currentTarget.style.borderColor = `${dice.color}20`
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: dice.color, fontFamily: 'monospace', letterSpacing: '-0.03em' }}>
        {dice.label}
      </span>
      <span style={{ fontSize: '0.6rem', color: '#333', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
        1–{dice.sides}
      </span>
    </button>
  )
}

function ResultDisplay({ result, rolling }) {
  return (
    <div
      style={{
        background: '#0d0d0d',
        border: '1px solid #1a1a1a',
        borderRadius: '6px',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        minHeight: '160px',
      }}
    >
      {result ? (
        <>
          <div style={{ fontSize: '0.6rem', color: '#333', fontFamily: 'monospace', letterSpacing: '0.15em' }}>
            {result.label?.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: '5rem',
              fontWeight: 900,
              lineHeight: 1,
              fontFamily: 'monospace',
              color: result.total !== undefined && result.bonus > 0
                ? (result.total >= 15 ? '#16a34a' : result.total >= 10 ? '#d97706' : '#dc2626')
                : (result.result >= Math.ceil(result.sides * 0.8) ? '#16a34a' : result.result <= Math.ceil(result.sides * 0.2) ? '#dc2626' : '#e5e5e5'),
              transition: 'color 0.3s',
              animation: rolling ? 'none' : 'fadeIn 0.2s ease',
            }}
          >
            {result.total !== undefined ? result.total : result.result}
          </div>
          {result.total !== undefined && (
            <div style={{ fontSize: '0.75rem', color: '#444', fontFamily: 'monospace' }}>
              {result.result} + {result.attrBonus ?? result.bonus} (atributo)
              {result.classBonus > 0 && (
                <span style={{ color: '#d97706' }}> + {result.classBonus} (classe)</span>
              )}
            </div>
          )}
          {result.result === result.sides && result.total === undefined && (
            <div style={{ fontSize: '0.65rem', color: '#16a34a', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
              ★ CRÍTICO ★
            </div>
          )}
          {result.result === 1 && result.total === undefined && (
            <div style={{ fontSize: '0.65rem', color: '#dc2626', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
              ✕ FALHA CRÍTICA
            </div>
          )}
        </>
      ) : (
        <div style={{ color: '#1a1a1a', fontSize: '0.8rem', fontFamily: 'monospace' }}>
          AGUARDANDO ROLAGEM
        </div>
      )}
    </div>
  )
}

export function Dice() {
  const { history, roll, rollWithAttribute, clearHistory } = useDiceStore()
  const { activeCampaignId } = useCampaignStore()
  const { characters } = useCharacterStore()
  const [lastResult, setLastResult] = useState(null)
  const [rolling, setRolling] = useState(false)
  const [contextDice, setContextDice] = useState('20')
  const [contextChar, setContextChar] = useState('')
  const [contextAttr, setContextAttr] = useState('inteligencia')

  const campChars = activeCampaignId
    ? characters.filter(c => c.campaignId === activeCampaignId)
    : characters

  const handleRoll = (sides) => {
    if (rolling) return
    setRolling(true)
    setTimeout(() => {
      const r = roll(sides)
      const entry = { result: r, sides, label: `d${sides}` }
      setLastResult(entry)
      setRolling(false)
    }, 200)
  }

  const handleContextRoll = () => {
    const sides = parseInt(contextDice) || 20
    const char = campChars.find(c => c.id === contextChar)
    const attrVal = char ? resolveAttrValue(char, contextAttr) : 0
    const classBonus = char ? getClassAttributeBonus(char, contextAttr) : 0
    const charName = char ? char.name : ''
    const label = charName
      ? `d${sides} + ${ATTRIBUTE_LABELS[contextAttr]} (${charName})`
      : `d${sides} + ${ATTRIBUTE_LABELS[contextAttr]}`
    if (rolling) return
    setRolling(true)
    setTimeout(() => {
      const { diceResult, total } = rollWithAttribute(sides, attrVal, label, classBonus)
      setLastResult({
        result: diceResult,
        sides,
        bonus: attrVal + classBonus,
        attrBonus: attrVal,
        classBonus,
        total,
        label,
      })
      setRolling(false)
    }, 200)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        icon={Dices}
        title="Dados"
        subtitle="SISTEMA DE ROLAGEM"
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', maxWidth: '960px' }}>
          {/* Left: dice grid + context */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Dice grid */}
            <div>
              <div style={{ fontSize: '0.65rem', color: '#333', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                DADOS DISPONÍVEIS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {DICE_TYPES.map(dice => (
                  <DiceButton key={dice.sides} dice={dice} onClick={() => handleRoll(dice.sides)} rolling={rolling} />
                ))}
              </div>
            </div>

            {/* Result */}
            <ResultDisplay result={lastResult} rolling={rolling} />

            {/* Contextual roll */}
            <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '4px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                <Zap size={13} style={{ color: '#d97706' }} />
                <span style={{ fontSize: '0.7rem', color: '#999', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                  ROLAGEM CONTEXTUAL
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.625rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.6rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '4px' }}>DADO</div>
                  <select
                    className="input-base"
                    value={contextDice}
                    onChange={e => setContextDice(e.target.value)}
                    style={{ fontSize: '0.8rem' }}
                  >
                    {DICE_TYPES.map(d => <option key={d.sides} value={d.sides}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: '0.6rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '4px' }}>PERSONAGEM</div>
                  <select
                    className="input-base"
                    value={contextChar}
                    onChange={e => setContextChar(e.target.value)}
                    style={{ fontSize: '0.8rem' }}
                  >
                    <option value="">Nenhum</option>
                    {campChars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: '0.6rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '4px' }}>ATRIBUTO</div>
                  <select
                    className="input-base"
                    value={contextAttr}
                    onChange={e => setContextAttr(e.target.value)}
                    style={{ fontSize: '0.8rem' }}
                  >
                    {Object.entries(ATTRIBUTE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {contextChar && (
                <div style={{ fontSize: '0.7rem', color: '#555', fontFamily: 'monospace', marginBottom: '0.625rem' }}>
                  {(() => {
                    const c = campChars.find(ch => ch.id === contextChar)
                    if (!c) return ''
                    const isSoc = SOCIAL_ATTR_KEYS.has(contextAttr)
                    const eff = resolveAttrValue(c, contextAttr)
                    const base = isSoc ? (c.socialAttributes?.[contextAttr] || 0) : (c.attributes?.[contextAttr] || 0)
                    const clsBonus = getClassAttributeBonus(c, contextAttr)
                    const cls = getCharacterClass(c)
                    const attrText = eff !== base
                      ? `${c.name} · ${ATTRIBUTE_LABELS[contextAttr]}: ${eff} (${base})`
                      : `${c.name} · ${ATTRIBUTE_LABELS[contextAttr]}: ${eff}`
                    return (
                      <>
                        {attrText}
                        {clsBonus > 0 && (
                          <span style={{ color: '#d97706' }}> · +{clsBonus} {cls?.label}</span>
                        )}
                      </>
                    )
                  })()}
                </div>
              )}
              <button
                onClick={handleContextRoll}
                className="btn-primary"
                disabled={rolling}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Zap size={13} /> Rolar d{contextDice} + {ATTRIBUTE_LABELS[contextAttr]}
              </button>
            </div>
          </div>

          {/* Right: history */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.65rem', color: '#333', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                HISTÓRICO ({history.length})
              </div>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', fontFamily: 'monospace', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                  onMouseLeave={e => e.currentTarget.style.color = '#333'}
                >
                  <Trash2 size={11} /> LIMPAR
                </button>
              )}
            </div>
            <div
              style={{
                background: '#0d0d0d',
                border: '1px solid #1a1a1a',
                borderRadius: '4px',
                overflow: 'hidden',
                flex: 1,
              }}
            >
              {history.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#222', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                  NENHUMA ROLAGEM
                </div>
              ) : (
                <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
                  {history.map((entry, i) => {
                    const value = entry.total !== undefined ? entry.total : entry.result
                    const isHigh = entry.total !== undefined
                      ? entry.total >= 15
                      : entry.result === entry.sides
                    const isLow = entry.total === undefined && entry.result === 1
                    const color = isHigh ? '#16a34a' : isLow ? '#dc2626' : '#666'
                    return (
                      <div
                        key={entry.id}
                        style={{
                          padding: '0.5rem 0.875rem',
                          borderBottom: '1px solid #111',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                          background: i === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.7rem', color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {entry.label}
                          </div>
                          {entry.total !== undefined && (
                            <div style={{ fontSize: '0.6rem', color: '#333', fontFamily: 'monospace' }}>
                              {entry.result} + {entry.attrBonus ?? entry.bonus}
                              {entry.classBonus > 0 && (
                                <span style={{ color: '#8a5a10' }}> + {entry.classBonus}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 700, color, fontFamily: 'monospace', lineHeight: 1 }}>
                            {value}
                          </span>
                          <span style={{ fontSize: '0.55rem', color: '#2a2a2a', fontFamily: 'monospace' }}>
                            {new Date(entry.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
