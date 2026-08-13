import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Swords, RotateCcw, Skull } from 'lucide-react'
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

function RollResultBanner({ result, onDismiss }) {
  if (!result) return null
  const sides = result.sides || 20
  const dc = result.dc ?? getDefaultDc(sides)
  const outcome = getRollOutcome(result.dice, result.bonus, sides, dc)
  const attrPart = result.attrBonus ?? result.bonus

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
          <span style={{ fontSize: '0.65rem', color: '#777', fontFamily: 'monospace' }}>
            vs CD {dc}
          </span>
          <span style={{ fontSize: '0.65rem', color: '#aaa', fontFamily: 'monospace' }}>
            d{sides}({result.dice}) + {attrPart}
            {result.classBonus > 0 && (
              <span style={{ color: '#d97706' }}> + {result.classBonus} classe</span>
            )}
            {result.weaponPenalty ? (
              <span style={{ color: '#dc2626' }}> {result.weaponPenalty} arma</span>
            ) : null}
            {result.gearBonus > 0 && (
              <span style={{ color: '#94a3b8' }}> + {result.gearBonus} gear</span>
            )}
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
    setCombatGroup,
    setActiveEnemy,
  } = useCombatStore()

  const [rollResult, setRollResult] = useState(null)
  const [combatNotice, setCombatNotice] = useState(null)
  const [skillDetailRef, setSkillDetailRef] = useState(null)
  const [dcPreset, setDcPreset] = useState('medium')

  const activeDcPreset = DIFFICULTY_PRESETS.find(p => p.id === dcPreset) || DIFFICULTY_PRESETS[2]

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
      background: '#0a0a0a',
    }}>

      {/* Barra de topo */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        padding: '0.45rem 1rem',
        borderBottom: '1px solid #1a1a1a',
        background: '#0d0d0d',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', minWidth: 0 }}>
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
        </div>
      </div>

      {/* CD — linha abaixo do seletor de grupo */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        flexWrap: 'wrap',
        padding: '0.35rem 1rem',
        borderBottom: '1px solid #1a1a1a',
        background: '#0b0b0b',
      }}>
        {DIFFICULTY_PRESETS.map(p => {
          const active = p.id === dcPreset
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setDcPreset(p.id)}
              title={`d20: ${p.dc20} · d8: ${p.dc8}`}
              style={{
                padding: '2px 6px',
                fontSize: '0.55rem',
                fontFamily: 'monospace',
                fontWeight: 700,
                borderRadius: '3px',
                cursor: 'pointer',
                border: `1px solid ${active ? '#d97706' : '#2a2a2a'}`,
                background: active ? 'rgba(217,119,6,0.15)' : 'transparent',
                color: active ? '#d97706' : '#666',
              }}
            >
              {p.label}
            </button>
          )
        })}
        <span style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#888' }}>
          d20:{activeDcPreset.dc20} · d8:{activeDcPreset.dc8}
        </span>
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
                onSelectSkill={handleSelectSkill}
                onApplyMarks={(markType) => handleApplyMarks(c, markType)}
                onHealMarks={(amount) => handleHealMarks(c, amount)}
                onClearMarks={() => handleClearMarks(c)}
              />
            ))}
          </div>

          {/* Painel do inimigo / boss — seletor à esquerda do card */}
          <div style={{
            flex: 1,
            minWidth: 0,
            borderLeft: '1px solid rgba(220,38,38,0.25)',
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
