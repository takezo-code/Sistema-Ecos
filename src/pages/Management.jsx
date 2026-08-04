import React, { useEffect, useState } from 'react'
import { Skull, Sword, Building2, ShieldAlert } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { ManageCharacters } from './ManageCharacters'
import { ManageNPCs } from './ManageNPCs'
import { ManageBoss } from './ManageBoss'
import { ManageOrganizations } from './ManageOrganizations'
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
      />

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeView === MANAGEMENT_VIEWS.CHARACTERS && <ManageCharacters embedded />}
        {activeView === MANAGEMENT_VIEWS.NPCS && <ManageNPCs embedded />}
        {activeView === MANAGEMENT_VIEWS.BOSS && <ManageBoss embedded />}
        {activeView === MANAGEMENT_VIEWS.ORGANIZATIONS && <ManageOrganizations />}
      </div>
    </div>
  )
}
