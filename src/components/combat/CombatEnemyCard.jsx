import { useMemo } from 'react'
import { useNPCStore } from '../../store/useNPCStore'
import { CombatCharacterColumn } from './CombatCharacterColumn'
import { ATTRIBUTES } from '../../constants/attributes'
import { entityHasEcoPowers } from '../../constants/entityProgression'
import { getRemainingLife } from '../../mechanics/combat/damageMarksEngine'

const PAPEL_META = {
  capanga: { label: 'Capanga', color: '#6b7280' },
  elite: { label: 'Elite', color: '#d97706' },
  boss: { label: 'BOSS', color: '#dc2626' },
  nenhum: { label: 'NPC', color: '#06b6d4' },
}

/**
 * Card de inimigo/boss — mesmo visual do player, com vida gerenciada manualmente.
 */
export function CombatEnemyCard({
  enemy,
  onApplyMarks,
  onHealMarks,
  onClearMarks,
  onNotice,
  onRollAttribute,
  onSelectSkill,
  onActivateSkill,
  onRemove,
}) {
  const liveEnemy = useNPCStore(s => (
    enemy?.id ? s.npcs.find(n => n.id === enemy.id) ?? null : null
  ))
  const resolvedEnemy = liveEnemy ?? enemy
  const isBoss = resolvedEnemy.papelCombate === 'boss'
  const maxMarks = isBoss ? 0 : (resolvedEnemy.marcasMaximas ?? 0)
  const life = getRemainingLife(resolvedEnemy)
  const isDefeated = life.max > 0 && life.current <= 0
  const papel = PAPEL_META[resolvedEnemy.papelCombate ?? 'nenhum'] ?? PAPEL_META.nenhum

  const enemyView = useMemo(() => resolvedEnemy, [resolvedEnemy])

  const attributeList = useMemo(
    () => ATTRIBUTES.filter(attr => attr.key !== 'ruptura' || entityHasEcoPowers(resolvedEnemy)),
    [resolvedEnemy],
  )

  return (
    <CombatCharacterColumn
      character={enemyView}
      attributeList={attributeList}
      maxMarks={maxMarks}
      defeated={isDefeated}
      badge={papel}
      onRemove={onRemove}
      onRollAttribute={onRollAttribute}
      onSelectSkill={onSelectSkill}
      onActivateSkill={onActivateSkill}
      onApplyMarks={onApplyMarks}
      onHealMarks={onHealMarks}
      onClearMarks={onClearMarks}
      onNotice={onNotice}
    />
  )
}
