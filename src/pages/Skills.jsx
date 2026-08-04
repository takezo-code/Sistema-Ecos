import React, { useEffect, useState } from 'react'
import { Skull } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { SkillsCatalogView } from './SkillsCatalogView'
import { SKILL_AUDIENCE } from '../constants/skillAudience'

export function Skills({
  initialView = SKILL_AUDIENCE.NPC,
  onViewChange,
}) {
  const [activeView, setActiveView] = useState(SKILL_AUDIENCE.NPC)

  useEffect(() => {
    if (initialView && initialView !== 'creation') setActiveView(SKILL_AUDIENCE.NPC)
    onViewChange?.(SKILL_AUDIENCE.NPC)
  }, [initialView, onViewChange])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        icon={Skull}
        title="Skills NPC"
        subtitle="CATÁLOGO · NPCs"
      />

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeView === SKILL_AUDIENCE.NPC && (
          <SkillsCatalogView audience={SKILL_AUDIENCE.NPC} />
        )}
      </div>
    </div>
  )
}
