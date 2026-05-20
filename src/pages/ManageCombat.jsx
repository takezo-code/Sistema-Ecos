import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Swords, RotateCcw, Skull } from 'lucide-react'
import { useCharacterStore } from '../store/useCharacterStore'
import { useNPCStore } from '../store/useNPCStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { useCombatStore } from '../store/useCombatStore'
import { useGroupStore } from '../store/useGroupStore'
import { filterByActiveCampaign } from '../utils/campaignScope'
import { resolveCombatRoster } from '../utils/combatRoster'
import { listCharacterSkillsRuntime } from '../services/ecoSkillRuntimeService'
import { COMBAT_HIGHLIGHT_XP } from '../constants/progression'
import { CombatCharacterColumn } from '../components/combat/CombatCharacterColumn'
import { CombatEnemyCard } from '../components/combat/CombatEnemyCard'
import { CombatSkillDetailModal } from '../components/combat/CombatSkillDetailModal'
import { EmptyState } from '../components/ui/EmptyState'
import { ActiveCampaignBanner } from '../components/ui/ActiveCampaignBanner'

// ──────────────────────────────────────────────
// Lógica de resultado da rolagem
// ──────────────────────────────────────────────
function getRollOutcome(dice, bonus) {
  const total = dice + bonus
  if (dice === 1) return {
    label: 'Falha Crítica',
    desc: 'Algo dá terrivelmente errado. Consequência severa.',
    color: '#ef4444',
    bg: 'rgba(127,29,29,0.6)',
    border: 'rgba(239,68,68,0.4)',
    icon: '💀',
  }
  if (total <= 9) return {
    label: 'Falha',
    desc: 'A ação não funciona como esperado.',
    color: '#f87171',
    bg: 'rgba(153,27,27,0.4)',
    border: 'rgba(248,113,113,0.3)',
    icon: '✕',
  }
  if (total <= 17) return {
    label: 'Sucesso Parcial',
    desc: 'Consegue, mas há uma pequena consequência.',
    color: '#fb923c',
    bg: 'rgba(124,45,18,0.45)',
    border: 'rgba(251,146,60,0.35)',
    icon: '◑',
  }
  if (dice === 20) return {
    label: 'Sucesso Crítico',
    desc: 'Resultado excepcional. Além do esperado.',
    color: '#c084fc',
    bg: 'rgba(88,28,135,0.5)',
    border: 'rgba(192,132,252,0.4)',
    icon: '★',
  }
  return {
    label: 'Sucesso',
    desc: 'A ação é realizada com clareza.',
    color: '#4ade80',
    bg: 'rgba(20,83,45,0.45)',
    border: 'rgba(74,222,128,0.3)',
    icon: '✓',
  }
}

// ──────────────────────────────────────────────
// Painel de resultado (exibido no topo do conteúdo)
// ──────────────────────────────────────────────
function RollResultBanner({ result, onDismiss }) {
  if (!result) return null
  const outcome = getRollOutcome(result.dice, result.bonus)

  return (
    <div style={{
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.625rem 1.25rem',
      background: outcome.bg,
      borderBottom: `1px solid ${outcome.border}`,
    }}>
      <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{outcome.icon}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1rem', fontWeight: 900, color: outcome.color }}>{result.total}</span>
          <span style={{ fontSize: '0.65rem', color: '#aaa', fontFamily: 'monospace' }}>
            d20({result.dice}) + {result.bonus}
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: outcome.color }}>{outcome.label}</span>
          {result.characterName && (
            <span style={{ fontSize: '0.6rem', color: '#666', fontFamily: 'monospace' }}>
              · {result.characterName} / {result.attrLabel}
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.65rem', color: '#888', marginTop: '1px' }}>{outcome.desc}</div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        title="Limpar resultado"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#444',
          padding: '4px',
          borderRadius: '3px',
          flexShrink: 0,
        }}
      >
        <RotateCcw size={13} />
      </button>
    </div>
  )
}

// ──────────────────────────────────────────────
// Página principal
// ──────────────────────────────────────────────
export function ManageCombat() {
  const {
    characters, updateCharacter, activateSkill, advanceTurn, addXp,
    applyDamageMarks, healDamageMarks, clearDamageMarks, recoverGroupMembers,
  } = useCharacterStore()
  const {
    npcs, updateNPC,
    applyDamageWithResistance, applyDamageMarks: applyNPCDamageMarks,
    healDamageMarks: healNPCMarks, clearDamageMarks: clearNPCMarks,
  } = useNPCStore()
  const { groups } = useGroupStore()
  const activeCampaignId = useCampaignStore(s => s.activeCampaignId)
  const {
    turn,
    combatGroupId,
    activeEnemyId,
    setCampaign,
    setCombatGroup,
    setActiveEnemy,
    incrementTurn,
  } = useCombatStore()

  const [rollResult, setRollResult] = useState(null)
  const [combatNotice, setCombatNotice] = useState(null)
  const [skillDetailRef, setSkillDetailRef] = useState(null)

  useEffect(() => {
    setCampaign(activeCampaignId)
  }, [activeCampaignId, setCampaign])

  const campaignGroups = useMemo(
    () => filterByActiveCampaign(groups, activeCampaignId),
    [groups, activeCampaignId]
  )

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

  // Inimigos da campanha que podem combater
  const campaignEnemies = useMemo(
    () => filterByActiveCampaign(npcs, activeCampaignId).filter(n => n.podeCombater),
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

  const handleRollAttribute = useCallback((character, _attrKey, attrLabel, eff) => {
    const dice = Math.floor(Math.random() * 20) + 1
    const total = dice + eff
    setRollResult({
      dice,
      bonus: eff,
      total,
      characterName: character.name,
      attrLabel,
    })
  }, [])

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

  const handleGrantHighlightXp = useCallback((character) => {
    const { levelUps } = addXp(character.id, COMBAT_HIGHLIGHT_XP) || {}
    if (levelUps?.length) {
      const lv = levelUps[levelUps.length - 1]
      setCombatNotice(`${character.name} subiu para o nível ${lv.level}! (+${COMBAT_HIGHLIGHT_XP} XP)`)
    } else {
      setCombatNotice(`+${COMBAT_HIGHLIGHT_XP} XP para ${character.name} — bom desempenho na cena`)
    }
  }, [addXp])

  const handleEnemyRollAttribute = useCallback((enemy, _attrKey, attrLabel, eff) => {
    const dice = Math.floor(Math.random() * 20) + 1
    const total = dice + eff
    setRollResult({ dice, bonus: eff, total, characterName: enemy.name, attrLabel })
  }, [])

  const handleEnemyApplyDamage = useCallback((markType, { mental = false } = {}) => {
    if (!activeEnemyId) return
    const result = applyDamageWithResistance(activeEnemyId, markType, { mental })
    if (result) {
      const msg = result.damageReduced > 0
        ? `${activeEnemy?.name}: ${result.effectiveDamage > 0 ? `+${result.effectiveDamage} marca(s) efetivas` : 'dano absorvido'} (resist. reduziu ${result.damageReduced})`
        : `${activeEnemy?.name}: +${result.effectiveDamage} marca(s)`
      setCombatNotice(msg)
    }
  }, [activeEnemyId, activeEnemy, applyDamageWithResistance])

  const handleActivateSkill = useCallback((characterId, skillId) => {
    const res = activateSkill(characterId, skillId)
    if (res?.warnings?.length) {
      setCombatNotice(res.warnings.join(' · '))
    } else if (res?.ok) {
      setCombatNotice(null)
    } else if (res?.message) {
      setCombatNotice(res.message)
    }
    return res
  }, [activateSkill])

  const handleAdvanceAllTurns = () => {
    combatCharacters.forEach(c => advanceTurn(c.id))
    incrementTurn()
  }

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
      background: '#0a0a0a',
    }}>

      {/* Barra de topo */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.45rem 1rem',
        borderBottom: '1px solid #1a1a1a',
        background: '#0d0d0d',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Swords size={14} style={{ color: '#dc2626' }} />
            <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#555', letterSpacing: '0.1em' }}>
              {combatCharacters.length} JOGADOR{combatCharacters.length !== 1 ? 'ES' : ''}
              {activeGroup ? ` · ${activeGroup.name}` : ' · TODOS'}
            </span>
          </div>
          <select
            className="input-base"
            value={combatGroupId || ''}
            onChange={e => setCombatGroup(e.target.value || null)}
            style={{ fontSize: '0.65rem', padding: '3px 6px', maxWidth: '180px' }}
            title="Escolha o grupo em Em jogo → Ficha ou aqui"
          >
            <option value="">Todos os personagens</option>
            {campaignGroups.map(g => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.memberIds.length})
              </option>
            ))}
          </select>

          {/* Seletor de inimigo ativo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Skull size={13} style={{ color: '#dc2626', flexShrink: 0 }} />
            <select
              className="input-base"
              value={activeEnemyId || ''}
              onChange={e => setActiveEnemy(e.target.value || null)}
              style={{ fontSize: '0.65rem', padding: '3px 6px', maxWidth: '200px',
                borderColor: activeEnemyId ? 'rgba(220,38,38,0.4)' : undefined }}
              title="Inimigo ativo neste combate"
            >
              <option value="">Sem inimigo</option>
              {campaignEnemies.map(n => (
                <option key={n.id} value={n.id}>
                  {n.papelCombate === 'boss' ? '★ ' : ''}{n.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#444' }}>
            TURNO <strong style={{ color: '#e5e5e5' }}>{turn}</strong>
          </span>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleAdvanceAllTurns}
            disabled={combatCharacters.length === 0}
            style={{ fontSize: '0.6rem', padding: '3px 8px' }}
          >
            Avançar turno (todos)
          </button>
          {activeGroup && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                recoverGroupMembers(activeGroup.memberIds)
                setCombatNotice('Grupo descansou — sobrecarga e marcas zeradas.')
              }}
              disabled={activeGroup.memberIds.length === 0}
              style={{ fontSize: '0.6rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Zera sobrecarga Eco e marcas de dano de todo o grupo"
            >
              <RotateCcw size={12} /> Descansar grupo
            </button>
          )}
        </div>
      </div>

      {/* Banner de resultado da rolagem */}
      <RollResultBanner result={rollResult} onDismiss={() => setRollResult(null)} />

      {combatNotice && (
        <div style={{
          flexShrink: 0,
          padding: '0.4rem 1rem',
          background: 'rgba(234,179,8,0.08)',
          borderBottom: '1px solid rgba(234,179,8,0.2)',
          fontSize: '0.65rem',
          color: '#eab308',
          fontFamily: 'monospace',
        }}>
          {combatNotice}
        </div>
      )}

      {/* Conteúdo */}
      {combatCharacters.length === 0 ? (
        <EmptyState
          icon={Swords}
          title={activeGroup ? 'Grupo sem membros' : 'Nenhum personagem'}
          description={activeGroup
            ? 'Adicione personagens ao grupo em Em jogo → Ficha, ou escolha outro grupo no seletor acima.'
            : 'Cadastre personagens na campanha ativa ou selecione um grupo com membros.'}
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
            padding: '0.875rem',
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
                onGrantHighlightXp={handleGrantHighlightXp}
                onSelectSkill={handleSelectSkill}
                onApplyMarks={(markType) => handleApplyMarks(c, markType)}
                onHealMarks={(amount) => handleHealMarks(c, amount)}
                onClearMarks={() => handleClearMarks(c)}
                onAdvanceTurn={() => advanceTurn(c.id)}
              />
            ))}
          </div>

          {/* Card do inimigo ativo — mesmo tamanho dos jogadores, centralizado */}
          {activeEnemy && (
            <div style={{
              flex: 1,
              minWidth: 0,
              borderLeft: '1px solid rgba(220,38,38,0.25)',
              padding: '0.875rem',
              overflowY: 'auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}>
              <div style={{
                width: '230px',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}>
                <div style={{
                  fontSize: '0.45rem',
                  color: '#dc2626',
                  fontFamily: 'monospace',
                  letterSpacing: '0.1em',
                  textAlign: 'center',
                }}>
                  INIMIGO ATIVO
                </div>
                <CombatEnemyCard
                  enemy={activeEnemy}
                  onUpdate={data => updateNPC(activeEnemy.id, data)}
                  onApplyDamageWithResistance={(markType, opts) => handleEnemyApplyDamage(markType, opts)}
                  onHealMarks={(amount) => healNPCMarks(activeEnemy.id, amount)}
                  onClearMarks={() => { clearNPCMarks(activeEnemy.id); setCombatNotice(`${activeEnemy.name}: marcas limpas.`) }}
                  onRollAttribute={handleEnemyRollAttribute}
                />
              </div>
            </div>
          )}
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
