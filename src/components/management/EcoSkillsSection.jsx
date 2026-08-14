import React from 'react'
import { Pencil, Trash2, Sparkles, Timer, Zap } from 'lucide-react'
import { ClassSkillBook } from '../skills/ClassSkillBook'
import { getSkillDisplay } from '../../services/skillService'
import { MAX_CLASS_SKILL_LEVEL } from '../../constants/progression'
import { getCharacterClass } from '../../constants/classes'
import SpotlightCard from '../react-bits/SpotlightCard'
import GlassSurface from '../react-bits/GlassSurface'
import { FloatingTooltip } from '../ui/FloatingTooltip'

function Chip({ icon: Icon, color = '#8a8a8a', children }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: '0.58rem',
      fontFamily: 'monospace',
      letterSpacing: '0.04em',
      color,
      background: `${color}12`,
      border: `1px solid ${color}30`,
      borderRadius: 999,
      padding: '0.16rem 0.45rem',
      whiteSpace: 'nowrap',
    }}>
      {Icon && <Icon size={10} />}
      {children}
    </span>
  )
}

function IconAction({ label, color, onClick, children }) {
  return (
    <FloatingTooltip.Trigger content={label}>
      <button
        type="button"
        onClick={onClick}
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          color: '#6a6a6a',
          cursor: 'pointer',
          padding: '5px',
          display: 'flex',
          transition: 'color 0.15s, border-color 0.15s, background 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = color
          e.currentTarget.style.borderColor = `${color}55`
          e.currentTarget.style.background = `${color}12`
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = '#6a6a6a'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
        }}
      >
        {children}
      </button>
    </FloatingTooltip.Trigger>
  )
}

function TextBlock({ label, color, children }) {
  return (
    <GlassSurface borderRadius={10} padding="0.6rem 0.7rem">
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: '0.52rem',
        color,
        fontFamily: 'monospace',
        letterSpacing: '0.1em',
        marginBottom: 6,
      }}>
        <span style={{
          width: 4,
          height: 4,
          borderRadius: 999,
          background: color,
          boxShadow: `0 0 7px ${color}`,
        }} />
        {label}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#c0c0c0', lineHeight: 1.55 }}>
        {children}
      </div>
    </GlassSurface>
  )
}

/**
 * Skills de Eco do personagem — livro de classe (investir Eco) ou lista legada/NPC/boss.
 */
export function EcoSkillsSection({
  entity,
  onInvestSkillPoint,
  onUpgradeSkillGrade,
  onActivateSkill,
  manualSkillPick = false,
  inlineOwned = false,
  onEditSkill,
  onRemoveSkill,
}) {
  const classMeta = getCharacterClass(entity)
  const skills = entity.skills || []
  const rupture = entity.attributes?.ruptura ?? 0
  const mentalState = entity.mentalState ?? 'estavel'
  const ecoOverload = entity.ecoOverload ?? 0

  // Personagem com classe → livro de skills
  if (!manualSkillPick && classMeta) {
    return (
      <ClassSkillBook
        entity={entity}
        onInvestPoint={onInvestSkillPoint}
        onUpgradeGrade={onUpgradeSkillGrade}
        onActivate={onActivateSkill}
      />
    )
  }

  // NPC / boss / sem classe: lista simples
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        flexWrap: 'wrap',
      }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.62rem',
          color: '#888',
          fontFamily: 'monospace',
          letterSpacing: '0.1em',
        }}>
          <Sparkles size={11} style={{ color: '#a855f7' }} />
          Habilidades
        </span>
        {skills.length > 0 && (
          <Chip color="#a855f7">{skills.length}</Chip>
        )}
      </div>

      {skills.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '1.75rem 1.25rem',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.018)',
          textAlign: 'center',
        }}>
          <Sparkles size={20} style={{ color: '#555' }} />
          <div style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 600 }}>
            Nenhuma habilidade
          </div>
          {inlineOwned && (
            <div style={{ fontSize: '0.7rem', color: '#666' }}>
              Use <span style={{ color: '#999' }}>Criar skill</span> acima.
            </div>
          )}
          {!manualSkillPick && !classMeta && (
            <div style={{ fontSize: '0.7rem', color: '#666' }}>
              Defina a classe para abrir o livro de skills.
            </div>
          )}
        </div>
      ) : (
        <FloatingTooltip.Provider>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {skills.map(skill => {
              const display = getSkillDisplay(skill, rupture, mentalState, ecoOverload)
              const atMaxTier = skill.tier >= MAX_CLASS_SKILL_LEVEL
              const typeColor = display.typeMeta?.color || '#a855f7'
              return (
                <SpotlightCard
                  key={skill.id}
                  spotlightColor={`${typeColor}22`}
                  style={{
                    padding: '0.85rem 0.95rem',
                    borderLeft: `3px solid ${typeColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.6rem' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#f2f2f2',
                        letterSpacing: '-0.02em',
                      }}>
                        {skill.name}
                      </div>
                      <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        <Chip color={typeColor}>{display.typeMeta?.label}</Chip>
                        {inlineOwned ? (
                          <>
                            <Chip icon={Timer}>CD {skill.cooldownTurns ?? 0}</Chip>
                            <Chip icon={Zap} color="#67e8f9">{skill.overloadCost ?? 1} uso(s)</Chip>
                          </>
                        ) : (
                          <>
                            <Chip color="#67e8f9">
                              Nível {skill.tier}{atMaxTier ? ' · máx' : ''}
                            </Chip>
                            <Chip>Poder {display.effectivePower}</Chip>
                            {display.overloadAttrPenalty > 0 && (
                              <Chip color="#f87171">−{display.overloadAttrPenalty} mentais</Chip>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {inlineOwned && (onEditSkill || onRemoveSkill) && (
                      <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                        {onEditSkill && (
                          <IconAction label="Editar skill" color="#67e8f9" onClick={() => onEditSkill(skill)}>
                            <Pencil size={13} />
                          </IconAction>
                        )}
                        {onRemoveSkill && (
                          <IconAction label="Remover skill" color="#f87171" onClick={() => onRemoveSkill(skill.id)}>
                            <Trash2 size={13} />
                          </IconAction>
                        )}
                      </div>
                    )}
                  </div>

                  {skill.description && (
                    <p style={{
                      fontSize: '0.76rem',
                      color: '#8a8a8a',
                      lineHeight: 1.55,
                      margin: 0,
                      fontStyle: 'italic',
                    }}>
                      {skill.description}
                    </p>
                  )}

                  {(skill.effect || skill.mechanicalEffect) && (
                    <TextBlock label="EFEITO" color="#22d3ee">
                      {skill.effect || skill.mechanicalEffect}
                    </TextBlock>
                  )}

                  {(skill.sideEffect || skill.narrativeConsequence) && (
                    <TextBlock label="EFEITO COLATERAL" color="#f87171">
                      {skill.sideEffect || skill.narrativeConsequence}
                    </TextBlock>
                  )}
                </SpotlightCard>
              )
            })}
          </div>
        </FloatingTooltip.Provider>
      )}
    </div>
  )
}
