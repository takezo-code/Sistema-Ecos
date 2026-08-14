import { useMemo, useState } from 'react'
import { CombatCharacterColumn } from './CombatCharacterColumn'
import { ATTRIBUTES } from '../../constants/attributes'

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
  onUpdate,
  onApplyMarks,
  onHealMarks,
  onClearMarks,
  onNotice,
  onRollAttribute,
}) {
  const [diceSides, setDiceSides] = useState(20)

  const marks = enemy.damageMarks ?? 0
  const maxMarks = enemy.marcasMaximas ?? 0
  const isDefeated = maxMarks > 0 && marks >= maxMarks
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
      diceSides={diceSides}
      onDiceSidesChange={setDiceSides}
      onUpdate={onUpdate}
      onRollAttribute={onRollAttribute}
      onApplyMarks={onApplyMarks}
      onHealMarks={onHealMarks}
      onClearMarks={onClearMarks}
      onNotice={onNotice}
    />
  )
}
