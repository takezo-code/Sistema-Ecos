import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Swords, Skull, X, AlertTriangle, Target } from 'lucide-react'
import { useCharacterStore } from '../store/useCharacterStore'
import { useNPCStore } from '../store/useNPCStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { useCombatStore } from '../store/useCombatStore'
import { useGroupStore } from '../store/useGroupStore'
import { filterByActiveCampaign } from '../utils/campaignScope'
import { canEnterCombat } from '../utils/npcScope'
import { resolveCombatRoster } from '../utils/combatRoster'
import { listCharacterSkillsRuntime } from '../services/ecoSkillRuntimeService'
import { CombatCharacterColumn } from '../components/combat/CombatCharacterColumn'
import { CombatEnemyCard } from '../components/combat/CombatEnemyCard'
import { CombatSkillDetailModal } from '../components/combat/CombatSkillDetailModal'
import { EmptyState } from '../components/ui/EmptyState'
import { ActiveCampaignBanner } from '../components/ui/ActiveCampaignBanner'
import { getRollOutcome, DIFFICULTY_PRESETS, getDefaultDc, getDcForPreset } from '../mechanics/combat/rollOutcome'

function DifficultyBar({ value, onChange }) {
  const active = DIFFICULTY_PRESETS.find(p => p.id === value) || DIFFICULTY_PRESETS[2]

  return (
    <div style={{
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      flexWrap: 'wrap',
      padding: '0.6rem 1rem',
    }}>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: '0.58rem',
        fontFamily: 'monospace',
        color: '#7a7a7a',
        letterSpacing: '0.1em',
      }}>
        <Target size={11} />
        DIFICULDADE
      </span>

      <div style={{
        display: 'flex',
        gap: 3,
        flexWrap: 'wrap',
      }}>
        {DIFFICULTY_PRESETS.map(p => {
          const isActive = p.id === active.id
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.id)}
              title={`d20 ${p.dc20} · d8 ${p.dc8}`}
              style={{
                border: isActive ? '1px solid rgba(217,119,6,0.5)' : '1px solid transparent',
                borderRadius: 999,
                padding: '0.25rem 0.7rem',
                fontSize: '0.66rem',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                color: isActive ? '#fbbf24' : '#7a7a7a',
                background: isActive ? 'rgba(217,119,6,0.16)' : 'transparent',
                boxShadow: isActive ? '0 0 14px rgba(217,119,6,0.22)' : 'none',
                transition: 'color 0.15s, background 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#c9c9c9' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#7a7a7a' }}
            >
              {p.label}
            </button>
          )
        })}
      </div>

      <span style={{
        fontSize: '0.6rem',
        fontFamily: 'monospace',
        color: '#8a8a8a',
        whiteSpace: 'nowrap',
      }}>
        CD <strong style={{ color: '#e5e5e5' }}>{active.dc20}</strong>
        <span style={{ color: '#5a5a5a' }}> d20</span>
        <span style={{ color: '#3f3f3f' }}> · </span>
        <strong style={{ color: '#e5e5e5' }}>{active.dc8}</strong>
        <span style={{ color: '#5a5a5a' }}> d8</span>
      </span>
    </div>
  )
}

function RollChip({ label, value, color = '#9a9a9a' }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: 4,
      fontSize: '0.6rem',
      fontFamily: 'monospace',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 999,
      padding: '0.16rem 0.5rem',
      color,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontWeight: 800 }}>{value}</span>
      <span style={{ color: '#6b6b6b', letterSpacing: '0.04em' }}>{label}</span>
    </span>
  )
}

function RollResultBanner({ result, onDismiss }) {
  if (!result) return null
  const sides = result.sides || 20
  const dc = result.dc ?? getDefaultDc(sides)
  const outcome = getRollOutcome(result.dice, result.bonus, sides, dc)
  const attrPart = result.attrBonus ?? result.bonus

  return (
    <div style={{ flexShrink: 0, padding: '0 1rem 0.6rem', maxWidth: 760 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        padding: '0.7rem 0.85rem',
        borderRadius: 14,
        border: `1px solid ${outcome.border}`,
        background: `${outcome.color}0d`,
        boxShadow: `0 0 24px ${outcome.color}1a, inset 0 1px 0 rgba(255,255,255,0.05)`,
        backdropFilter: 'blur(14px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.2)',
      }}>
        <div style={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.1rem',
          background: `${outcome.color}1f`,
          border: `1px solid ${outcome.color}55`,
          boxShadow: `0 0 16px ${outcome.color}33`,
        }}>
          {outcome.icon}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 6,
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: '1.6rem',
            fontWeight: 900,
            lineHeight: 1,
            color: outcome.color,
            letterSpacing: '-0.03em',
            textShadow: `0 0 18px ${outcome.color}55`,
          }}>
            {result.total}
          </span>
          <span style={{ fontSize: '0.6rem', color: '#6b6b6b', fontFamily: 'monospace' }}>
            / CD {dc}
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: outcome.color,
              letterSpacing: '-0.01em',
            }}>
              {outcome.label}
            </span>
            {result.characterName && (
              <span style={{ fontSize: '0.6rem', color: '#6b6b6b', fontFamily: 'monospace' }}>
                {result.characterName} · {result.attrLabel}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <RollChip label={`d${sides}`} value={result.dice} color="#d4d4d4" />
            {attrPart !== 0 && (
              <RollChip label="atributo" value={`${attrPart > 0 ? '+' : ''}${attrPart}`} color="#a3a3a3" />
            )}
            {result.classBonus > 0 && (
              <RollChip label="classe" value={`+${result.classBonus}`} color="#fbbf24" />
            )}
            {result.gearBonus > 0 && (
              <RollChip label="equip." value={`+${result.gearBonus}`} color="#94a3b8" />
            )}
            {result.weaponPenalty ? (
              <RollChip label="arma" value={result.weaponPenalty} color="#f87171" />
            ) : null}
          </div>

          <div style={{ fontSize: '0.65rem', color: '#8a8a8a', lineHeight: 1.35 }}>
            {outcome.desc}
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          title="Limpar resultado"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            color: '#666',
            padding: 5,
            borderRadius: 8,
            display: 'flex',
            flexShrink: 0,
            alignSelf: 'flex-start',
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#e5e5e5'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#666'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
          }}
        >
          <X size={12} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Página principal
// ──────────────────────────────────────────────
export function ManageCombat() {
  const {
    characters, updateCharacter, activateSkill, advanceTurn,
    applyDamageMarks, healDamageMarks, clearDamageMarks,
  } = useCharacterStore()
  const {
    npcs, updateNPC,
    applyDamageMarks: applyNPCDamageMarks,
    healDamageMarks: healNPCMarks, clearDamageMarks: clearNPCMarks,
  } = useNPCStore()
  const { groups } = useGroupStore()
  const activeCampaignId = useCampaignStore(s => s.activeCampaignId)
  const {
    combatGroupId,
    activeEnemyId,
    setCampaign,
    setActiveEnemy,
  } = useCombatStore()

  const [rollResult, setRollResult] = useState(null)
  const [combatNotice, setCombatNotice] = useState(null)
  const [skillDetailRef, setSkillDetailRef] = useState(null)
  const [dcPreset, setDcPreset] = useState('medium')

  useEffect(() => {
    setCampaign(activeCampaignId)
  }, [activeCampaignId, setCampaign])

  const roster = useMemo(
    () => resolveCombatRoster(characters, groups, activeCampaignId, combatGroupId),
    [characters, groups, activeCampaignId, combatGroupId]
  )

  const combatCharacters = useMemo(
    () => roster.map(c => ({
      ...c,
      _skillRuntimes: listCharacterSkillsRuntime(c),
    })),
    [roster]
  )

  // Inimigos da campanha (capangas, elites e bosses)
  const campaignEnemies = useMemo(
    () => filterByActiveCampaign(npcs, activeCampaignId)
      .filter(canEnterCombat)
      .sort((a, b) => {
        const rank = { boss: 0, elite: 1, capanga: 2 }
        return (rank[a.papelCombate] ?? 3) - (rank[b.papelCombate] ?? 3)
          || (a.name || '').localeCompare(b.name || '', 'pt')
      }),
    [npcs, activeCampaignId]
  )

  const activeEnemy = useMemo(
    () => activeEnemyId ? campaignEnemies.find(n => n.id === activeEnemyId) ?? null : null,
    [campaignEnemies, activeEnemyId]
  )

  const activeGroup = combatGroupId ? groups.find(g => g.id === combatGroupId) : null

  const skillDetail = useMemo(() => {
    if (!skillDetailRef) return null
    const character = combatCharacters.find(c => c.id === skillDetailRef.characterId)
    if (!character) return null
    const runtime = character._skillRuntimes?.find(r => r.instance.id === skillDetailRef.skillId)
    return runtime ? { character, runtime } : null
  }, [skillDetailRef, combatCharacters])

  const handleSelectSkill = useCallback((character, runtime) => {
    setSkillDetailRef({ characterId: character.id, skillId: runtime.instance.id })
  }, [])

  const handleRollAttribute = useCallback((character, _attrKey, attrLabel, eff, sides = 20, breakdown = null) => {
    const dice = Math.floor(Math.random() * sides) + 1
    const total = dice + eff
    const dc = getDcForPreset(dcPreset, sides)
    setRollResult({
      dice,
      sides,
      bonus: eff,
      attrBonus: breakdown?.attrBonus ?? eff,
      classBonus: breakdown?.classBonus ?? 0,
      weaponPenalty: breakdown?.weaponPenalty ?? 0,
      gearBonus: breakdown?.gearBonus ?? 0,
      total,
      dc,
      characterName: character.name,
      attrLabel,
    })
    advanceTurn(character.id)
  }, [advanceTurn, dcPreset])

  const handleApplyMarks = useCallback((character, markType) => {
    const result = applyDamageMarks(character.id, markType)
    if (result?.stateChanged) {
      setCombatNotice(`${character.name}: ${result.narratives?.join(' · ') || 'Estado alterado.'}`)
    }
    return result
  }, [applyDamageMarks])

  const handleHealMarks = useCallback((character, amount) => {
    healDamageMarks(character.id, amount)
  }, [healDamageMarks])

  const handleClearMarks = useCallback((character) => {
    clearDamageMarks(character.id)
    setCombatNotice(`${character.name} se recuperou — marcas de dano limpas.`)
  }, [clearDamageMarks])

  const handleEnemyRollAttribute = useCallback((enemy, _attrKey, attrLabel, eff, sides = 20, breakdown = null) => {
    const dice = Math.floor(Math.random() * sides) + 1
    const total = dice + eff
    const dc = getDcForPreset(dcPreset, sides)
    setRollResult({
      dice,
      sides,
      bonus: eff,
      attrBonus: breakdown?.attrBonus ?? eff,
      classBonus: breakdown?.classBonus ?? 0,
      weaponPenalty: breakdown?.weaponPenalty ?? 0,
      gearBonus: breakdown?.gearBonus ?? 0,
      total,
      dc,
      characterName: enemy.name,
      attrLabel,
    })
  }, [dcPreset])

  const handleBossAttackRoll = useCallback((result) => {
    setRollResult({
      dice: result.dice,
      sides: result.sides,
      bonus: result.bonus,
      total: result.total,
      dc: result.dc ?? getDcForPreset(dcPreset, result.sides || 20),
      characterName: result.characterName,
      attrLabel: result.attrLabel,
    })
    if (result.hit && result.damage) {
      setCombatNotice(
        `${result.characterName} → ${result.targetName}: ${result.outcome.label} · ${result.damage.label} (+${result.damage.value})`
      )
    } else if (result.bossExpose) {
      setCombatNotice(`${result.characterName} falhou criticamente e se expôs! (+1 marca no boss)`)
    } else {
      setCombatNotice(`${result.characterName} errou o ataque contra ${result.targetName}.`)
    }
  }, [dcPreset])

  const handleApplyMarksToTarget = useCallback((targetId, markType) => {
    const target = combatCharacters.find(c => c.id === targetId)
    if (!target) return
    const result = applyDamageMarks(targetId, markType)
    if (result?.stateChanged) {
      setCombatNotice(`${target.name}: ${result.narratives?.join(' · ') || 'Estado alterado.'}`)
    }
  }, [combatCharacters, applyDamageMarks])

  const handleBossExpose = useCallback((markType = 'leve') => {
    if (!activeEnemyId) return
    applyNPCDamageMarks(activeEnemyId, markType)
  }, [activeEnemyId, applyNPCDamageMarks])

  const handleEnemyApplyMarks = useCallback((markType) => {
    if (!activeEnemyId) return
    const result = applyNPCDamageMarks(activeEnemyId, markType)
    if (result?.stateChanged) {
      setCombatNotice(`${activeEnemy?.name}: ${result.narratives?.join(' · ') || 'Estado alterado.'}`)
    } else if (result) {
      setCombatNotice(`${activeEnemy?.name}: +${result.markAdded} marca(s)`)
    }
  }, [activeEnemyId, activeEnemy, applyNPCDamageMarks])

  const handleActivateSkill = useCallback((characterId, skillId) => {
    const res = activateSkill(characterId, skillId, {
      allyIds: combatCharacters.map(c => c.id),
    })
    if (res?.warnings?.length) {
      setCombatNotice(res.warnings.join(' · '))
    } else if (res?.ok) {
      setCombatNotice(null)
    } else if (res?.message) {
      setCombatNotice(res.message)
    }
    return res
  }, [activateSkill, combatCharacters])

  if (!activeCampaignId) {
    return <ActiveCampaignBanner />
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      overflow: 'hidden',
      background: 'transparent',
    }}>

      <DifficultyBar value={dcPreset} onChange={setDcPreset} />

      {/* Banner de resultado da rolagem */}
      <RollResultBanner result={rollResult} onDismiss={() => setRollResult(null)} />

      {combatNotice && (
        <div style={{ flexShrink: 0, padding: '0 1rem 0.6rem', maxWidth: 760 }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.55rem',
            padding: '0.5rem 0.7rem',
            borderRadius: 12,
            border: '1px solid rgba(234,179,8,0.28)',
            background: 'rgba(234,179,8,0.07)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            backdropFilter: 'blur(14px) saturate(1.2)',
            WebkitBackdropFilter: 'blur(14px) saturate(1.2)',
          }}>
            <AlertTriangle size={13} color="#eab308" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: '0.66rem', color: '#fcd34d', lineHeight: 1.4 }}>
              {combatNotice}
            </span>
          </div>
        </div>
      )}

      {/* Conteúdo */}
      {combatCharacters.length === 0 ? (
        <EmptyState
          icon={Swords}
          title={activeGroup ? 'Grupo sem membros' : 'Nenhum personagem'}
          description={activeGroup
            ? 'Adicione personagens ao grupo em Em jogo → Ficha.'
            : 'Cadastre personagens na campanha ativa ou monte um grupo em Em jogo → Ficha.'}
        />
      ) : (
        <div style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          overflow: 'hidden',
        }}>
          {/* Colunas dos jogadores */}
          <div style={{
            flex: 1,
            minWidth: 0,
            overflowX: 'auto',
            overflowY: 'auto',
            padding: '1.15rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            alignItems: 'flex-start',
            alignContent: 'flex-start',
          }}>
            {combatCharacters.map(c => (
              <CombatCharacterColumn
                key={c.id}
                character={c}
                onUpdate={data => updateCharacter(c.id, data)}
                onRollAttribute={handleRollAttribute}
                onActivateSkill={handleActivateSkill}
                onSelectSkill={handleSelectSkill}
                onApplyMarks={(markType) => handleApplyMarks(c, markType)}
                onHealMarks={(amount) => handleHealMarks(c, amount)}
                onClearMarks={() => handleClearMarks(c)}
              />
            ))}
          </div>

          {/* Painel do inimigo / boss — largura só do conteúdo, sem coluna no meio */}
          <div style={{
            flexShrink: 0,
            padding: '0.875rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            gap: '0.5rem',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              paddingTop: '0.55rem',
              flexShrink: 0,
            }}>
              <Skull size={13} style={{ color: '#dc2626', flexShrink: 0 }} />
              <select
                className="input-base"
                value={activeEnemyId || ''}
                onChange={e => setActiveEnemy(e.target.value || null)}
                style={{
                  fontSize: '0.65rem',
                  padding: '3px 6px',
                  width: '150px',
                  borderColor: activeEnemyId ? 'rgba(220,38,38,0.4)' : undefined,
                }}
                title="Inimigo ativo neste combate"
              >
                <option value="">Sem inimigo</option>
                {campaignEnemies.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.papelCombate === 'boss' ? '★ BOSS · ' : n.papelCombate === 'elite' ? 'Elite · ' : ''}
                    {n.name}
                  </option>
                ))}
              </select>
            </div>

            {activeEnemy ? (
              <CombatEnemyCard
                enemy={activeEnemy}
                targets={combatCharacters}
                getRollDc={(sides) => getDcForPreset(dcPreset, sides)}
                onUpdate={data => updateNPC(activeEnemy.id, data)}
                onApplyMarks={handleEnemyApplyMarks}
                onHealMarks={(amount) => healNPCMarks(activeEnemy.id, amount)}
                onClearMarks={() => { clearNPCMarks(activeEnemy.id); setCombatNotice(`${activeEnemy.name}: marcas limpas.`) }}
                onNotice={msg => setCombatNotice(msg)}
                onRollAttribute={handleEnemyRollAttribute}
                onBossAttackRoll={handleBossAttackRoll}
                onApplyMarksToTarget={handleApplyMarksToTarget}
                onBossExpose={handleBossExpose}
              />
            ) : (
              <div style={{
                width: '220px',
                flexShrink: 0,
                padding: '1.25rem 0.75rem',
                textAlign: 'center',
                fontSize: '0.6rem',
                color: '#444',
                fontFamily: 'monospace',
                border: '1px dashed #1e1e1e',
                borderRadius: '8px',
              }}>
                Escolha um inimigo ou boss
              </div>
            )}
          </div>
        </div>
      )}

      <CombatSkillDetailModal
        open={!!skillDetail}
        character={skillDetail?.character}
        runtime={skillDetail?.runtime}
        onClose={() => setSkillDetailRef(null)}
        onActivate={handleActivateSkill}
      />
    </div>
  )
}
