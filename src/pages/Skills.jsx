import React, { useEffect, useState } from 'react'
import { Sparkles, Sword, Skull, ShieldAlert } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { SkillsCatalogView } from './SkillsCatalogView'
import { SkillsCreationHub } from './SkillsCreationHub'
import { SKILL_AUDIENCE } from '../constants/skillAudience'

const VIEW_META = {
  [SKILL_AUDIENCE.CHARACTER]: { title: 'Skills Personagem', icon: Sword },
  [SKILL_AUDIENCE.NPC]: { title: 'Skills NPC', icon: Skull },
  [SKILL_AUDIENCE.BOSS]: { title: 'Skills Boss', icon: ShieldAlert },
  creation: { title: 'Criação', icon: Sparkles },
}

const SUBTITLES = {
  [SKILL_AUDIENCE.CHARACTER]: 'CATÁLOGO · PERSONAGENS JOGÁVEIS',
  [SKILL_AUDIENCE.NPC]: 'CATÁLOGO · NPCs',
  [SKILL_AUDIENCE.BOSS]: 'CATÁLOGO · BOSSES E INIMIGOS',
  creation: 'SKILL DE PERSONAGEM · NPC · BOSS',
}

export function Skills({
  initialView = SKILL_AUDIENCE.CHARACTER,
  initialCreationType,
  onCreationTypeConsumed,
  onViewChange,
}) {
  const [activeView, setActiveView] = useState(initialView)

  useEffect(() => {
    if (initialView) setActiveView(initialView)
  }, [initialView])

  const handleViewChange = (view) => {
    setActiveView(view)
    onViewChange?.(view)
    if (view !== 'creation') onCreationTypeConsumed?.()
  }

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
        {activeView === 'creation' && (
          <SkillsCreationHub
            onViewChange={handleViewChange}
            initialCreationType={initialCreationType}
            onCreationTypeConsumed={onCreationTypeConsumed}
          />
        )}
      </div>
    </div>
  )
}
