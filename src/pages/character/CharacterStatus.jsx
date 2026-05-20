import React from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { AttributeGrid } from '../../components/management/AttributeGrid'
import { StatesSection } from '../../components/management/StatesSection'
import { isInCreationPhase } from '../../constants/attributes'

export function CharacterStatus({ character, onUpdate, onChangeAttribute, onSpendPending }) {
  const isCreation = isInCreationPhase(character)

  return (
    <div style={{ padding: '1rem 1.5rem', overflowY: 'auto', height: '100%' }}>
      <PageHeader title="Status" subtitle="Atributos, corpo e mente" />
      <StatesSection
        entity={character}
        physicalState={character.physicalState ?? 'bem'}
        mentalState={character.mentalState ?? 'estavel'}
        onPhysicalChange={v => onUpdate?.({ physicalState: v })}
        onMentalChange={v => onUpdate?.({ mentalState: v })}
      />
      <hr className="divide-line" style={{ margin: '1.25rem 0' }} />
      <AttributeGrid
        entity={character}
        isCreation={isCreation}
        onChange={(key, val, opts) => onChangeAttribute?.(key, val, opts)}
        onSpendPending={onSpendPending}
      />
    </div>
  )
}
