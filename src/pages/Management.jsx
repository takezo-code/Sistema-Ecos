import React, { useEffect, useState } from 'react'
import { ManageCharacters } from './ManageCharacters'
import { ManageNPCs } from './ManageNPCs'
import { ManageBoss } from './ManageBoss'
import { ManageOrganizations } from './ManageOrganizations'
import {
  MANAGEMENT_VIEWS,
  normalizeManagementView,
} from '../constants/managementViews'

export { MANAGEMENT_VIEWS, skillAudienceToManagementView } from '../constants/managementViews'

export function Management({
  initialView = MANAGEMENT_VIEWS.CHARACTERS,
  onViewChange,
  onNavigate,
}) {
  const [activeView, setActiveView] = useState(() => normalizeManagementView(initialView))

  useEffect(() => {
    if (initialView) setActiveView(normalizeManagementView(initialView))
  }, [initialView])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeView === MANAGEMENT_VIEWS.CHARACTERS && <ManageCharacters embedded />}
        {activeView === MANAGEMENT_VIEWS.NPCS && <ManageNPCs embedded />}
        {activeView === MANAGEMENT_VIEWS.BOSS && <ManageBoss embedded />}
        {activeView === MANAGEMENT_VIEWS.ORGANIZATIONS && <ManageOrganizations />}
      </div>
    </div>
  )
}
