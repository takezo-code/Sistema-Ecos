import { useMemo } from 'react'
import { CombatCharacterColumn } from './CombatCharacterColumn'
import { ATTRIBUTES } from '../../constants/attributes'
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
}) {
  const isBoss = enemy.papelCombate === 'boss'
  const maxMarks = isBoss ? 0 : (enemy.marcasMaximas ?? 0)
  const life = getRemainingLife(enemy)
  const isDefeated = life.max > 0 && life.current <= 0
  const papel = PAPEL_META[enemy.papelCombate ?? 'nenhum'] ?? PAPEL_META.nenhum

  const attributeList = useMemo(
    () => ATTRIBUTES.filter(attr => attr.key !== 'ruptura' || enemy.hasEcoPowers),
    [enemy.hasEcoPowers],
  )

  return (
    <CombatCharacterColumn
      character={enemy}
      attributeList={attributeList}
      maxMarks={maxMarks}
      defeated={isDefeated}
      badge={papel}
      onRollAttribute={onRollAttribute}
      onApplyMarks={onApplyMarks}
      onHealMarks={onHealMarks}
      onClearMarks={onClearMarks}
      onNotice={onNotice}
    />
  )
}
