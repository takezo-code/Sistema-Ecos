import React, { useState } from 'react'
import { Sparkles, ChevronUp, Zap, Search, ArrowLeft } from 'lucide-react'
import { ECO_UNLOCK_SKILL_COST, MAX_SKILL_TIER } from '../../constants/progression'
import {
  canUnlockRandomSkill,
  canAffordAnySkillUpgrade,
  listUpgradeableSkills,
  getSkillDisplay,
  getTierUpgradeCostLabel,
} from '../../services/skillService'
import { formatRuptureBonus } from '../../services/ruptureBonus'

const CHOICE = Object.freeze({
  NONE: null,
  UNLOCK: 'unlock',
  UPGRADE: 'upgrade',
})

function EcoPointsBar({ eco, hasEcoToSpend }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
      padding: '0.625rem 0.75rem',
      marginBottom: '0.75rem',
      background: hasEcoToSpend ? 'rgba(168,85,247,0.1)' : '#0d0d0d',
      border: `1px solid ${hasEcoToSpend ? 'rgba(168,85,247,0.35)' : '#1a1a1a'}`,
      borderRadius: '4px',
      boxShadow: hasEcoToSpend ? '0 0 16px rgba(168,85,247,0.15)' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Zap size={16} style={{ color: hasEcoToSpend ? '#a855f7' : '#444' }} />
        <div>
          <div style={{ fontSize: '0.55rem', color: '#666', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
            PONTOS DE ECO
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: hasEcoToSpend ? '#a855f7' : '#555',
            lineHeight: 1,
            fontFamily: 'monospace',
          }}>
            {eco}
          </div>
        </div>
      </div>
      {hasEcoToSpend ? (
        <span style={{
          fontSize: '0.65rem',
          color: '#a855f7',
          fontFamily: 'monospace',
          fontWeight: 600,
          textAlign: 'right',
        }}>
          Pronto para gastar
        </span>
      ) : (
        <span style={{ fontSize: '0.6rem', color: '#444', fontFamily: 'monospace', textAlign: 'right', maxWidth: '140px', lineHeight: 1.4 }}>
          Sem Ecos · ganhe em níveis ímpares
        </span>
      )}
    </div>
  )
}

export function EcoSkillsSection({ entity, onUnlockSkill, onUpgradeSkill, manualSkillPick = false }) {
  const eco = entity.ecoPoints ?? 0
  const skills = entity.skills || []
  const rupture = entity.attributes?.ruptura ?? 0
  const mentalState = entity.mentalState ?? 'estavel'
  const ecoOverload = entity.ecoOverload ?? 0
  const canUnlock = !manualSkillPick && canUnlockRandomSkill(entity)
  const canUpgradeAny = canAffordAnySkillUpgrade(entity)
  const upgradeable = listUpgradeableSkills(entity)
  const hasEcoToSpend = eco >= ECO_UNLOCK_SKILL_COST

  const [choiceMode, setChoiceMode] = useState(CHOICE.NONE)

  const handleUnlock = () => {
    onUnlockSkill?.()
    setChoiceMode(CHOICE.NONE)
  }

  const handleUpgrade = (skillId) => {
    onUpgradeSkill?.(skillId)
    setChoiceMode(CHOICE.NONE)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={14} style={{ color: '#a855f7' }} />
          <span style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
            HABILIDADES DE RUPTURA
          </span>
        </div>
        <span style={{ fontSize: '0.65rem', color: '#d97706', fontFamily: 'monospace' }}>
          Bônus Ruptura: {formatRuptureBonus(rupture)}
        </span>
      </div>

      <EcoPointsBar eco={eco} hasEcoToSpend={hasEcoToSpend} />

      <p style={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.6, marginBottom: '0.75rem' }}>
        {manualSkillPick
          ? 'Adicione habilidades pelo grimório do mestre. Gaste Eco apenas para evoluir o tier das que já possui.'
          : 'Gaste um Eco para descobrir uma habilidade nova ou evoluir uma que já possui.'}
      </p>

      <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
        {skills.length} HABILIDADE(S) DESBLOQUEADA(S)
      </div>

      {choiceMode === CHOICE.NONE && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
          {!manualSkillPick && (
            <button
              type="button"
              className="btn-primary"
              disabled={!canUnlock || !onUnlockSkill}
              onClick={() => setChoiceMode(CHOICE.UNLOCK)}
              title={canUnlock ? `Gasta ${ECO_UNLOCK_SKILL_COST} Eco` : 'Precisa de pelo menos 1 Eco'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                fontSize: '0.8rem',
                opacity: canUnlock ? 1 : 0.5,
              }}
            >
              <Search size={14} />
              Descobrir habilidade ({ECO_UNLOCK_SKILL_COST} Eco)
            </button>
          )}
          <button
            type="button"
            className="btn-secondary"
            disabled={!canUpgradeAny || !onUpgradeSkill}
            onClick={() => setChoiceMode(CHOICE.UPGRADE)}
            title={canUpgradeAny ? 'Escolha qual habilidade evoluir' : 'Sem Eco ou nenhuma habilidade evoluível'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              fontSize: '0.75rem',
              opacity: canUpgradeAny ? 1 : 0.5,
            }}
          >
            <ChevronUp size={14} style={{ color: '#d97706' }} />
            Evoluir habilidade existente
          </button>
        </div>
      )}

      {!manualSkillPick && choiceMode === CHOICE.UNLOCK && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          background: '#0d0d0d',
          border: '1px solid rgba(168,85,247,0.25)',
          borderRadius: '4px',
        }}>
          <button type="button" className="btn-ghost" onClick={() => setChoiceMode(CHOICE.NONE)}
            style={{ fontSize: '0.65rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={11} /> Voltar
          </button>
          <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.75rem', lineHeight: 1.5 }}>
            Revela uma habilidade de Eco que você ainda não possui. O sorteio evita duplicar o que já tem.
          </p>
          <button
            type="button"
            className="btn-primary"
            disabled={!canUnlock}
            onClick={handleUnlock}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', fontSize: '0.75rem' }}
          >
            <Zap size={13} />
            Confirmar descoberta ({ECO_UNLOCK_SKILL_COST} Eco)
          </button>
        </div>
      )}

      {choiceMode === CHOICE.UPGRADE && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          background: '#0d0d0d',
          border: '1px solid rgba(217,119,6,0.25)',
          borderRadius: '4px',
        }}>
          <button type="button" className="btn-ghost" onClick={() => setChoiceMode(CHOICE.NONE)}
            style={{ fontSize: '0.65rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={11} /> Voltar
          </button>
          <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem', lineHeight: 1.5 }}>
            Escolha qual habilidade evoluir de tier:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {upgradeable.map(skill => (
              <button
                key={skill.id}
                type="button"
                className="btn-secondary"
                onClick={() => handleUpgrade(skill.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.75rem',
                  textAlign: 'left',
                }}
              >
                <span>
                  <strong style={{ color: '#e5e5e5' }}>{skill.name}</strong>
                  <span style={{ color: '#666', fontFamily: 'monospace', marginLeft: '0.5rem' }}>
                    Tier {skill.tier} → {skill.tier + 1}
                  </span>
                </span>
                <span style={{ fontSize: '0.65rem', color: '#d97706', fontFamily: 'monospace', flexShrink: 0 }}>
                  {getTierUpgradeCostLabel(skill.tier)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {skills.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '1.5rem',
          border: '1px dashed #1a1a1a',
          borderRadius: '4px',
          color: '#333',
          fontSize: '0.775rem',
        }}>
          Nenhuma habilidade desbloqueada.
          {manualSkillPick ? (
            <div style={{ marginTop: '0.5rem', color: '#555' }}>Use &quot;Adicionar skill&quot; no grimório acima.</div>
          ) : canUnlock && choiceMode === CHOICE.NONE && (
            <div style={{ marginTop: '0.5rem', color: '#555' }}>Use o botão &quot;Descobrir habilidade&quot; acima.</div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {skills.map(skill => {
            const display = getSkillDisplay(skill, rupture, mentalState, ecoOverload)
            const atMaxTier = skill.tier >= MAX_SKILL_TIER
            return (
              <div
                key={skill.id}
                style={{
                  background: '#0d0d0d',
                  border: '1px solid rgba(168,85,247,0.12)',
                  borderRadius: '4px',
                  padding: '0.875rem 1rem',
                }}
              >
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e5e5e5' }}>{skill.name}</div>
                  <div style={{ fontSize: '0.6rem', color: '#a855f7', fontFamily: 'monospace', marginTop: '2px' }}>
                    <span style={{ color: display.typeMeta?.color }}>{display.typeMeta?.label?.toUpperCase()} · </span>
                    TIER {skill.tier}{atMaxTier ? ' (máx)' : ''} · PODER {display.effectivePower}
                    {display.overloadPenaltyPercent > 0 && (
                      <span style={{ color: '#dc2626' }}> (−{display.overloadPenaltyPercent}%)</span>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.6, marginBottom: '0.5rem' }}>{skill.description}</p>
                <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '3px', padding: '0.5rem 0.625rem', marginBottom: '0.35rem' }}>
                  <div style={{ fontSize: '0.55rem', color: '#06b6d4', fontFamily: 'monospace', marginBottom: '2px' }}>EFEITO</div>
                  <div style={{ fontSize: '0.7rem', color: '#888', lineHeight: 1.5 }}>{skill.effect}</div>
                </div>
                {skill.sideEffect && (
                  <div style={{ background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.12)', borderRadius: '3px', padding: '0.5rem 0.625rem' }}>
                    <div style={{ fontSize: '0.55rem', color: '#dc2626', fontFamily: 'monospace', marginBottom: '2px' }}>EFEITO COLATERAL</div>
                    <div style={{ fontSize: '0.7rem', color: '#666', lineHeight: 1.5 }}>{skill.sideEffect}</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
