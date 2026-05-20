import React, { useEffect, useState } from 'react'
import { Skull, Sword, Building2, Sparkles, ShieldAlert } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { ManageCharacters } from './ManageCharacters'
import { ManageNPCs } from './ManageNPCs'
import { ManageBoss } from './ManageBoss'
import { ManageOrganizations } from './ManageOrganizations'
import { ManagementCreationHub } from './ManagementCreationHub'

const VIEW_META = {
  characters: { title: 'Personagens', icon: Sword },
  npcs: { title: 'NPCs', icon: Skull },
  boss: { title: 'Boss', icon: ShieldAlert },
  organizations: { title: 'Organizações', icon: Building2 },
  creation: { title: 'Criação', icon: Sparkles },
}

export function Management({
  initialView = 'characters',
  initialCreationType,
  onCreationTypeConsumed,
  onViewChange,
  onNavigate,
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

  const subtitles = {
    characters: 'STATUS · NÍVEL · XP · MOCHILA',
    npcs: 'STATUS · NÍVEL · XP · MOCHILA',
    boss: 'RESISTÊNCIAS · MARCAS · PAPEL DE COMBATE',
    organizations: 'FAÇÕES · ALIADOS · INIMIGOS',
    creation: 'PERSONAGEM · NPC · BOSS · ORGANIZAÇÃO',
  }

  const meta = VIEW_META[activeView] || VIEW_META.characters
  const HeaderIcon = meta.icon

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        icon={HeaderIcon}
        title={meta.title}
        subtitle={subtitles[activeView] || ''}
      />

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeView === 'characters' && <ManageCharacters embedded />}
        {activeView === 'npcs' && <ManageNPCs embedded />}
        {activeView === 'boss' && <ManageBoss embedded />}
        {activeView === 'organizations' && <ManageOrganizations />}
        {activeView === 'creation' && (
          <ManagementCreationHub
            onNavigate={onNavigate}
            onViewChange={handleViewChange}
            initialCreationType={initialCreationType}
            onCreationTypeConsumed={onCreationTypeConsumed}
          />
        )}
      </div>
    </div>
  )
}
