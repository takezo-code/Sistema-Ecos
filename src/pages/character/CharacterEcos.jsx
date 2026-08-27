import React from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { EcoOverloadSection } from '../../components/management/EcoOverloadSection'
import { ProgressionSection } from '../../components/management/ProgressionSection'

export function CharacterEcos({
  character,
  onUpdate: _onUpdate,
  onRestOverload,
  onSetOverload,
  lastOverloadEvents,
  onClearOverloadEvents,
}) {
  return (
    <div style={{ padding: '1rem 1.5rem', overflowY: 'auto', height: '100%' }}>
      <PageHeader title="Ecos" subtitle="Sobrecarga, progressão e poder temporal" />
      <EcoOverloadSection
        entity={character}
        onRestOverload={onRestOverload}
        onSetOverload={onSetOverload}
        lastOverloadEvents={lastOverloadEvents}
        onClearEvents={onClearOverloadEvents}
      />
      <hr className="divide-line" style={{ margin: '1.5rem 0' }} />
      <ProgressionSection entity={character} adminMode={false} />
      <p style={{ fontSize: '0.7rem', color: '#444', marginTop: '0.75rem' }}>
        Para conceder XP e Ecos, use Gerenciamento em modo mestre.
      </p>
    </div>
  )
}
