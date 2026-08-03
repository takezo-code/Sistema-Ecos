import React, { useEffect, useState } from 'react'
import { Skull, Sword, Building2, ShieldAlert } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { ManageCharacters } from './ManageCharacters'
import { ManageNPCs } from './ManageNPCs'
import { ManageBoss } from './ManageBoss'
import { ManageOrganizations } from './ManageOrganizations'
import { SkillsCatalogView } from './SkillsCatalogView'
import { SKILL_AUDIENCE } from '../constants/skillAudience'
import {
  MANAGEMENT_VIEWS,
  normalizeManagementView,
} from '../constants/managementViews'

export { MANAGEMENT_VIEWS, skillAudienceToManagementView } from '../constants/managementViews'

const VIEW_META = {
  [MANAGEMENT_VIEWS.CHARACTERS]: { title: 'Personagens', icon: Sword },
  [MANAGEMENT_VIEWS.NPCS]: { title: 'NPCs', icon: Skull },
  [MANAGEMENT_VIEWS.BOSS]: { title: 'Boss', icon: ShieldAlert },
  [MANAGEMENT_VIEWS.ORGANIZATIONS]: { title: 'Organizações', icon: Building2 },
  [MANAGEMENT_VIEWS.SKILLS_NPC]: { title: 'Skills NPC', icon: Skull },
  [MANAGEMENT_VIEWS.SKILLS_BOSS]: { title: 'Skills Boss', icon: ShieldAlert },
}

const SUBTITLES = {
  [MANAGEMENT_VIEWS.CHARACTERS]: 'STATUS · NÍVEL · XP · MOCHILA',
  [MANAGEMENT_VIEWS.NPCS]: 'STATUS · NÍVEL · XP · MOCHILA',
  [MANAGEMENT_VIEWS.BOSS]: 'VIDA · MARCAS · PAPEL DE COMBATE',
  [MANAGEMENT_VIEWS.ORGANIZATIONS]: 'FAÇÕES · ALIADOS · INIMIGOS',
  [MANAGEMENT_VIEWS.SKILLS_NPC]: 'CATÁLOGO · NPCs',
  [MANAGEMENT_VIEWS.SKILLS_BOSS]: 'CATÁLOGO · BOSSES E INIMIGOS',
}

export function Management({
  initialView = MANAGEMENT_VIEWS.CHARACTERS,
  onViewChange,
  onNavigate,
}) {
  const [activeView, setActiveView] = useState(() => normalizeManagementView(initialView))

  useEffect(() => {
    if (initialView) setActiveView(normalizeManagementView(initialView))
  }, [initialView])

  const meta = VIEW_META[activeView] || VIEW_META[MANAGEMENT_VIEWS.CHARACTERS]
  const HeaderIcon = meta.icon

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        icon={HeaderIcon}
        title={meta.title}
        subtitle={SUBTITLES[activeView] || ''}
      />

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeView === MANAGEMENT_VIEWS.CHARACTERS && <ManageCharacters embedded />}
        {activeView === MANAGEMENT_VIEWS.NPCS && <ManageNPCs embedded />}
        {activeView === MANAGEMENT_VIEWS.BOSS && <ManageBoss embedded />}
        {activeView === MANAGEMENT_VIEWS.ORGANIZATIONS && <ManageOrganizations />}
        {activeView === MANAGEMENT_VIEWS.SKILLS_NPC && (
          <SkillsCatalogView audience={SKILL_AUDIENCE.NPC} />
        )}
        {activeView === MANAGEMENT_VIEWS.SKILLS_BOSS && (
          <SkillsCatalogView audience={SKILL_AUDIENCE.BOSS} />
        )}
      </div>
    </div>
  )
}
