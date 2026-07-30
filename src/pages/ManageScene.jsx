import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Clapperboard, RotateCcw, Skull } from 'lucide-react'
import { useCharacterStore } from '../store/useCharacterStore'
import { useNPCStore } from '../store/useNPCStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { useSceneStore } from '../store/useSceneStore'
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

import { getRollOutcome } from '../mechanics/combat/rollOutcome'

const SCENE_ACCENT = '#d97706'

function RollResultBanner({ result, onDismiss }) {
  if (!result) return null
  const sides = result.sides || 20
  const outcome = getRollOutcome(result.dice, result.bonus, sides)

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
            d{sides}({result.dice}) + {result.attrBonus ?? result.bonus}
            {result.classBonus > 0 && (
              <span style={{ color: '#d97706' }}> + {result.classBonus} classe</span>
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

export function ManageScene() {
  const {
    characters, updateCharacter, activateSkill, advanceTurn, addXp,
    recoverGroupMembers,
  } = useCharacterStore()
  const { npcs, updateNPC } = useNPCStore()
  const { groups } = useGroupStore()
  const activeCampaignId = useCampaignStore(s => s.activeCampaignId)
  const {
    globalNotes,
    turn,
    sceneGroupId,
    activeEnemyId,
    setCampaign,
    setSceneGroup,
    setGlobalNotes,
    setActiveEnemy,
    incrementTurn,
  } = useSceneStore()

  const [rollResult, setRollResult] = useState(null)
  const [sceneNotice, setSceneNotice] = useState(null)
  const [skillDetailRef, setSkillDetailRef] = useState(null)

  useEffect(() => {
    setCampaign(activeCampaignId)
  }, [activeCampaignId, setCampaign])

  const campaignGroups = useMemo(
    () => filterByActiveCampaign(groups, activeCampaignId),
    [groups, activeCampaignId]
  )

  const roster = useMemo(
    () => resolveCombatRoster(characters, groups, activeCampaignId, sceneGroupId),
    [characters, groups, activeCampaignId, sceneGroupId]
  )

  const sceneCharacters = useMemo(
    () => roster.map(c => ({
      ...c,
      _skillRuntimes: listCharacterSkillsRuntime(c),
    })),
    [roster]
  )

  const campaignEnemies = useMemo(
    () => filterByActiveCampaign(npcs, activeCampaignId).filter(n => n.papelCombate !== 'boss'),
    [npcs, activeCampaignId]
  )

  const activeEnemy = useMemo(
    () => activeEnemyId ? campaignEnemies.find(n => n.id === activeEnemyId) ?? null : null,
    [campaignEnemies, activeEnemyId]
  )

  const activeGroup = sceneGroupId ? groups.find(g => g.id === sceneGroupId) : null

  const skillDetail = useMemo(() => {
    if (!skillDetailRef) return null
    const character = sceneCharacters.find(c => c.id === skillDetailRef.characterId)
    if (!character) return null
    const runtime = character._skillRuntimes?.find(r => r.instance.id === skillDetailRef.skillId)
    return runtime ? { character, runtime } : null
  }, [skillDetailRef, sceneCharacters])

  const handleSelectSkill = useCallback((character, runtime) => {
    setSkillDetailRef({ characterId: character.id, skillId: runtime.instance.id })
  }, [])

  const handleRollAttribute = useCallback((character, _attrKey, attrLabel, eff, sides = 20, breakdown = null) => {
    const dice = Math.floor(Math.random() * sides) + 1
    const total = dice + eff
    setRollResult({
      dice,
      sides,
      bonus: eff,
      attrBonus: breakdown?.attrBonus ?? eff,
      classBonus: breakdown?.classBonus ?? 0,
      total,
      characterName: character.name,
      attrLabel,
    })
  }, [])

  const handleGrantHighlightXp = useCallback((character) => {
    const { levelUps } = addXp(character.id, COMBAT_HIGHLIGHT_XP) || {}
    if (levelUps?.length) {
      const lv = levelUps[levelUps.length - 1]
      setSceneNotice(`${character.name} subiu para o nível ${lv.level}! (+${COMBAT_HIGHLIGHT_XP} XP)`)
    } else {
      setSceneNotice(`+${COMBAT_HIGHLIGHT_XP} XP para ${character.name} — destaque na cena`)
    }
  }, [addXp])

  const handleEnemyRollAttribute = useCallback((enemy, _attrKey, attrLabel, eff, sides = 20) => {
    const dice = Math.floor(Math.random() * sides) + 1
    const total = dice + eff
    setRollResult({ dice, sides, bonus: eff, total, characterName: enemy.name, attrLabel })
  }, [])

  const handleActivateSkill = useCallback((characterId, skillId) => {
    const res = activateSkill(characterId, skillId)
    if (res?.warnings?.length) {
      setSceneNotice(res.warnings.join(' · '))
    } else if (res?.ok) {
      setSceneNotice(null)
    } else if (res?.message) {
      setSceneNotice(res.message)
    }
    return res
  }, [activateSkill])

  const handleAdvanceAllTurns = () => {
    sceneCharacters.forEach(c => advanceTurn(c.id))
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
            <Clapperboard size={14} style={{ color: SCENE_ACCENT }} />
            <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#555', letterSpacing: '0.1em' }}>
              CENA · {sceneCharacters.length} JOGADOR{sceneCharacters.length !== 1 ? 'ES' : ''}
              {activeGroup ? ` · ${activeGroup.name}` : ' · TODOS'}
            </span>
          </div>
          <select
            className="input-base"
            value={sceneGroupId || ''}
            onChange={e => setSceneGroup(e.target.value || null)}
            style={{ fontSize: '0.65rem', padding: '3px 6px', maxWidth: '180px' }}
            title="Grupo presente nesta cena"
          >
            <option value="">Todos os personagens</option>
            {campaignGroups.map(g => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.memberIds.length})
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Skull size={13} style={{ color: SCENE_ACCENT, flexShrink: 0 }} />
            <select
              className="input-base"
              value={activeEnemyId || ''}
              onChange={e => setActiveEnemy(e.target.value || null)}
              style={{
                fontSize: '0.65rem',
                padding: '3px 6px',
                maxWidth: '200px',
                borderColor: activeEnemyId ? 'rgba(217,119,6,0.4)' : undefined,
              }}
              title="Inimigo enfrentado nesta cena"
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
            disabled={sceneCharacters.length === 0}
            style={{ fontSize: '0.6rem', padding: '3px 8px' }}
          >
            Avançar turno (todos)
          </button>
          {activeGroup && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                const { recovered } = recoverGroupMembers(activeGroup.memberIds)
                setSceneNotice(
                  recovered > 0
                    ? `Grupo descansou — ${recovered} personagem${recovered > 1 ? 's' : ''} recuperado${recovered > 1 ? 's' : ''}.`
                    : 'Nenhum membro recuperado.',
                )
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

      <RollResultBanner result={rollResult} onDismiss={() => setRollResult(null)} />

      {sceneNotice && (
        <div style={{
          flexShrink: 0,
          padding: '0.4rem 1rem',
          background: 'rgba(217,119,6,0.08)',
          borderBottom: '1px solid rgba(217,119,6,0.2)',
          fontSize: '0.65rem',
          color: SCENE_ACCENT,
          fontFamily: 'monospace',
        }}>
          {sceneNotice}
        </div>
      )}

      {sceneCharacters.length === 0 ? (
        <EmptyState
          icon={Clapperboard}
          title={activeGroup ? 'Grupo sem membros' : 'Nenhum personagem na cena'}
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
            {sceneCharacters.map(c => (
              <CombatCharacterColumn
                key={c.id}
                character={c}
                variant="scene"
                onUpdate={data => updateCharacter(c.id, data)}
                onRollAttribute={handleRollAttribute}
                onActivateSkill={handleActivateSkill}
                onGrantHighlightXp={handleGrantHighlightXp}
                onSelectSkill={handleSelectSkill}
                onAdvanceTurn={() => advanceTurn(c.id)}
              />
            ))}
          </div>

          {activeEnemy ? (
            <div style={{
              flex: 1,
              minWidth: 0,
              borderLeft: `1px solid rgba(217,119,6,0.25)`,
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
                  color: SCENE_ACCENT,
                  fontFamily: 'monospace',
                  letterSpacing: '0.1em',
                  textAlign: 'center',
                }}>
                  INIMIGO NA CENA
                </div>
                <CombatEnemyCard
                  enemy={activeEnemy}
                  variant="scene"
                  onUpdate={data => updateNPC(activeEnemy.id, data)}
                  onRollAttribute={handleEnemyRollAttribute}
                />
              </div>
            </div>
          ) : (
            <aside style={{
              width: '220px',
              flexShrink: 0,
              borderLeft: '1px solid #1a1a1a',
              padding: '0.875rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              overflowY: 'auto',
            }}>
              <div style={{ fontSize: '0.5rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                NOTAS DA CENA
              </div>
              <textarea
                className="input-base"
                value={globalNotes}
                onChange={e => setGlobalNotes(e.target.value)}
                placeholder="Ambiente, tensão, pistas, falas importantes…"
                style={{
                  flex: 1,
                  minHeight: '300px',
                  fontSize: '0.8rem',
                  lineHeight: 1.55,
                  resize: 'none',
                }}
              />
            </aside>
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
