import React from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { ClassSkillBook } from '../skills/ClassSkillBook'
import { getSkillDisplay } from '../../services/skillService'
import { MAX_CLASS_SKILL_LEVEL } from '../../constants/progression'
import { getCharacterClass } from '../../constants/classes'

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
    <div>
      <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
        HABILIDADES · {skills.length}
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
          Nenhuma habilidade.
          {inlineOwned && (
            <div style={{ marginTop: '0.5rem', color: '#555' }}>Use &quot;Criar skill&quot; acima.</div>
          )}
          {!manualSkillPick && !classMeta && (
            <div style={{ marginTop: '0.5rem', color: '#555' }}>Defina a classe para abrir o livro de skills.</div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {skills.map(skill => {
            const display = getSkillDisplay(skill, rupture, mentalState, ecoOverload)
            const atMaxTier = skill.tier >= MAX_CLASS_SKILL_LEVEL
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
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e5e5e5' }}>{skill.name}</div>
                    <div style={{ fontSize: '0.6rem', color: '#a855f7', fontFamily: 'monospace', marginTop: '2px' }}>
                      <span style={{ color: display.typeMeta?.color }}>{display.typeMeta?.label?.toUpperCase()} · </span>
                      {inlineOwned
                        ? `CD ${skill.cooldownTurns ?? 0} · Usos ${skill.overloadCost ?? 1}`
                        : `NÍVEL ${skill.tier}${atMaxTier ? ' (máx)' : ''} · PODER ${display.effectivePower}`}
                      {!inlineOwned && display.overloadAttrPenalty > 0 && (
                        <span style={{ color: '#dc2626' }}> (−{display.overloadAttrPenalty} INT/PER/SAB/CAR)</span>
                      )}
                    </div>
                  </div>
                  {inlineOwned && (onEditSkill || onRemoveSkill) && (
                    <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                      {onEditSkill && (
                        <button
                          type="button"
                          className="btn-ghost"
                          onClick={() => onEditSkill(skill)}
                          title="Editar"
                          style={{ padding: '0.25rem' }}
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                      {onRemoveSkill && (
                        <button
                          type="button"
                          className="btn-ghost"
                          onClick={() => onRemoveSkill(skill.id)}
                          title="Remover"
                          style={{ padding: '0.25rem', color: '#dc2626' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {skill.description && (
                  <p style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.6, marginBottom: '0.5rem' }}>{skill.description}</p>
                )}
                {(skill.effect || skill.mechanicalEffect) && (
                  <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '3px', padding: '0.5rem 0.625rem', marginBottom: '0.35rem' }}>
                    <div style={{ fontSize: '0.55rem', color: '#06b6d4', fontFamily: 'monospace', marginBottom: '2px' }}>EFEITO</div>
                    <div style={{ fontSize: '0.7rem', color: '#888', lineHeight: 1.5 }}>{skill.effect || skill.mechanicalEffect}</div>
                  </div>
                )}
                {(skill.sideEffect || skill.narrativeConsequence) && (
                  <div style={{ background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.12)', borderRadius: '3px', padding: '0.5rem 0.625rem' }}>
                    <div style={{ fontSize: '0.55rem', color: '#dc2626', fontFamily: 'monospace', marginBottom: '2px' }}>EFEITO COLATERAL</div>
                    <div style={{ fontSize: '0.7rem', color: '#666', lineHeight: 1.5 }}>{skill.sideEffect || skill.narrativeConsequence}</div>
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
