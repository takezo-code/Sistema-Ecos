import React from 'react'
import { Sparkles, ChevronUp, Zap } from 'lucide-react'
import { ECO_UNLOCK_SKILL_COST, MAX_SKILL_TIER } from '../../constants/progression'
import { canUnlockRandomSkill, canUpgradeSkillTier, getSkillDisplay, getTierUpgradeCostLabel } from '../../services/skillService'
import { formatRuptureBonus } from '../../services/ruptureBonus'

export function EcoSkillsSection({ entity, onUnlockSkill, onUpgradeSkill }) {
  const eco = entity.ecoPoints ?? 0
  const skills = entity.skills || []
  const rupture = entity.attributes?.ruptura ?? 0
  const canUnlock = canUnlockRandomSkill(entity)

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

      <p style={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.6, marginBottom: '0.75rem' }}>
        Ecos desbloqueiam habilidades aleatórias e evoluem tiers. Níveis ímpares concedem +1 Eco automaticamente.
      </p>

      <button
        type="button"
        className="btn-secondary"
        disabled={!canUnlock}
        onClick={onUnlockSkill}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          marginBottom: '1rem',
          width: '100%',
          justifyContent: 'center',
          opacity: canUnlock ? 1 : 0.5,
        }}
      >
        <Zap size={13} />
        Desbloquear habilidade aleatória ({ECO_UNLOCK_SKILL_COST} Eco)
      </button>

      <div style={{ fontSize: '0.65rem', color: '#333', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
        {eco} ECO(S) DISPONÍVEIS · {skills.length} HABILIDADE(S)
      </div>

      {skills.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '1.5rem',
          border: '1px dashed #1a1a1a',
          borderRadius: '4px',
          color: '#333',
          fontSize: '0.775rem',
        }}>
          Nenhuma habilidade desbloqueada. O vazio temporal aguarda.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {skills.map(skill => {
            const display = getSkillDisplay(skill, rupture, entity.mentalState ?? 'estavel')
            const canUp = canUpgradeSkillTier(entity, skill.id)
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
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e5e5e5' }}>{skill.name}</div>
                    <div style={{ fontSize: '0.6rem', color: '#a855f7', fontFamily: 'monospace', marginTop: '2px' }}>
                      TIER {skill.tier} · PODER {display.effectivePower}
                      {rupture > 0 && <span style={{ color: '#d97706' }}> (base {skill.basePower} + ruptura)</span>}
                    </div>
                  </div>
                  {skill.tier < MAX_SKILL_TIER && (
                    <button
                      type="button"
                      className="btn-ghost"
                      disabled={!canUp}
                      onClick={() => onUpgradeSkill(skill.id)}
                      style={{ fontSize: '0.65rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <ChevronUp size={11} />
                      {getTierUpgradeCostLabel(skill.tier)}
                    </button>
                  )}
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
