import React, { useEffect, useState } from 'react'
import { Swords, UsersRound } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { ManageGroups } from './ManageGroups'
import { ManageCombat } from './ManageCombat'

const VIEW_META = {
  ficha: { title: 'Ficha', icon: UsersRound },
  combat: { title: 'Combate', icon: Swords },
}

const SUBTITLES = {
  ficha: '',
  combat: '',
}

export function EmJogo({ initialView = 'ficha', onViewChange }) {
  const [activeView, setActiveView] = useState(initialView)

  useEffect(() => {
    if (initialView) setActiveView(initialView)
  }, [initialView])

  const meta = VIEW_META[activeView] || VIEW_META.ficha
  const HeaderIcon = meta.icon

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        icon={HeaderIcon}
        title={meta.title}
        subtitle={SUBTITLES[activeView] || ''}
      />

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeView === 'ficha' && <ManageGroups />}
        {activeView === 'combat' && <ManageCombat />}
      </div>
    </div>
  )
}
