import React, { useEffect, useState } from 'react'
import { ManageGroups } from './ManageGroups'
import { ManageCombat } from './ManageCombat'

export function EmJogo({ initialView = 'ficha', onViewChange }) {
  const [activeView, setActiveView] = useState(initialView)

  useEffect(() => {
    if (initialView) setActiveView(initialView)
  }, [initialView])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeView === 'ficha' && <ManageGroups />}
        {activeView === 'combat' && <ManageCombat />}
      </div>
    </div>
  )
}
