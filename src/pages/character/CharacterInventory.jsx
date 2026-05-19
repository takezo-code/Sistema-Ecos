import React from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { BackpackSection } from '../../components/management/BackpackSection'
import { EquippedSection } from '../../components/management/EquippedSection'

export function CharacterInventory({
  character,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onAddEquipped,
  onRemoveEquipped,
}) {
  return (
    <div style={{ padding: '1rem 1.5rem', overflowY: 'auto', height: '100%' }}>
      <PageHeader title="Inventário" subtitle="Mochila e equipamento" />
      <EquippedSection
        entity={character}
        onAddItem={onAddEquipped}
        onRemoveItem={onRemoveEquipped}
      />
      <hr className="divide-line" style={{ margin: '1.25rem 0' }} />
      <BackpackSection
        entity={character}
        onAddItem={onAddItem}
        onUpdateItem={onUpdateItem}
        onRemoveItem={onRemoveItem}
      />
    </div>
  )
}
