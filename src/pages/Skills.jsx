import React, { useEffect, useState } from 'react'
import { Sword, Skull, ShieldAlert } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { SkillsCatalogView } from './SkillsCatalogView'
import { SKILL_AUDIENCE } from '../constants/skillAudience'

const VIEW_META = {
  [SKILL_AUDIENCE.CHARACTER]: { title: 'Skills Personagem', icon: Sword },
  [SKILL_AUDIENCE.NPC]: { title: 'Skills NPC', icon: Skull },
  [SKILL_AUDIENCE.BOSS]: { title: 'Skills Boss', icon: ShieldAlert },
}

const SUBTITLES = {
  [SKILL_AUDIENCE.CHARACTER]: 'CATÁLOGO · PERSONAGENS JOGÁVEIS',
  [SKILL_AUDIENCE.NPC]: 'CATÁLOGO · NPCs',
  [SKILL_AUDIENCE.BOSS]: 'CATÁLOGO · BOSSES E INIMIGOS',
}

export function Skills({
  initialView = SKILL_AUDIENCE.CHARACTER,
  onViewChange,
}) {
  const [activeView, setActiveView] = useState(initialView === 'creation' ? SKILL_AUDIENCE.CHARACTER : initialView)

  useEffect(() => {
    if (initialView && initialView !== 'creation') setActiveView(initialView)
  }, [initialView])

  const meta = VIEW_META[activeView] || VIEW_META[SKILL_AUDIENCE.CHARACTER]
  const HeaderIcon = meta.icon

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        icon={HeaderIcon}
        title={meta.title}
        subtitle={SUBTITLES[activeView] || ''}
      />

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeView === SKILL_AUDIENCE.CHARACTER && (
          <SkillsCatalogView audience={SKILL_AUDIENCE.CHARACTER} />
        )}
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
