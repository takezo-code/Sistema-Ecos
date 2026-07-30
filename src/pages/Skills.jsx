import React, { useEffect, useState } from 'react'
import { Skull, ShieldAlert } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { SkillsCatalogView } from './SkillsCatalogView'
import { SKILL_AUDIENCE } from '../constants/skillAudience'

const VIEW_META = {
  [SKILL_AUDIENCE.NPC]: { title: 'Skills NPC', icon: Skull },
  [SKILL_AUDIENCE.BOSS]: { title: 'Skills Boss', icon: ShieldAlert },
}

const SUBTITLES = {
  [SKILL_AUDIENCE.NPC]: 'CATÁLOGO · NPCs',
  [SKILL_AUDIENCE.BOSS]: 'CATÁLOGO · BOSSES E INIMIGOS',
}

function normalizeSkillsView(view) {
  if (view === SKILL_AUDIENCE.BOSS) return SKILL_AUDIENCE.BOSS
  return SKILL_AUDIENCE.NPC
}

export function Skills({
  initialView = SKILL_AUDIENCE.NPC,
  onViewChange,
}) {
  const [activeView, setActiveView] = useState(
    initialView === 'creation' ? SKILL_AUDIENCE.NPC : normalizeSkillsView(initialView),
  )

  useEffect(() => {
    if (initialView && initialView !== 'creation') setActiveView(normalizeSkillsView(initialView))
  }, [initialView])

  const meta = VIEW_META[activeView] || VIEW_META[SKILL_AUDIENCE.NPC]
  const HeaderIcon = meta.icon

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        icon={HeaderIcon}
        title={meta.title}
        subtitle={SUBTITLES[activeView] || ''}
      />

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeView === SKILL_AUDIENCE.NPC && (
          <SkillsCatalogView audience={SKILL_AUDIENCE.NPC} />
        )}
        {activeView === SKILL_AUDIENCE.BOSS && (
          <SkillsCatalogView audience={SKILL_AUDIENCE.BOSS} />
        )}
      </div>
    </div>
  )
}
