import React, { useEffect, useState } from 'react'
import { Users, Skull, Sword, UsersRound } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { ManageCharacters } from './ManageCharacters'
import { ManageNPCs } from './ManageNPCs'
import { ManageGroups } from './ManageGroups'

const SUB_VIEWS = [
  { id: 'characters', label: 'Personagens', icon: Sword, color: '#9ca3af' },
  { id: 'npcs', label: 'NPCs', icon: Skull, color: '#06b6d4' },
  { id: 'groups', label: 'Grupos', icon: UsersRound, color: '#e5e5e5' },
]

function ManagementSubNav({ activeView, onViewChange }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.35rem',
      background: '#0d0d0d',
      border: '1px solid #1a1a1a',
      borderRadius: '4px',
      padding: '3px',
    }}>
      {SUB_VIEWS.map(item => {
        const Icon = item.icon
        const isActive = activeView === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onViewChange(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              background: isActive ? 'rgba(220,38,38,0.1)' : 'transparent',
              border: isActive ? '1px solid rgba(220,38,38,0.25)' : '1px solid transparent',
              borderRadius: '3px',
              color: isActive ? '#e5e5e5' : '#555',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            <Icon size={14} style={{ color: isActive ? item.color : 'inherit' }} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function Management({ initialView = 'characters', onViewChange }) {
  const [activeView, setActiveView] = useState(initialView)

  useEffect(() => {
    if (initialView) setActiveView(initialView)
  }, [initialView])

  const handleViewChange = (view) => {
    setActiveView(view)
    onViewChange?.(view)
  }

  const subtitles = {
    characters: 'STATUS · NÍVEL · XP · MOCHILA',
    npcs: 'STATUS · NÍVEL · XP · MOCHILA',
    groups: 'PARTY · NÍVEIS · CONDIÇÃO · XP EM GRUPO',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        icon={Users}
        title="Gerenciamento"
        subtitle={subtitles[activeView]}
        action={<ManagementSubNav activeView={activeView} onViewChange={handleViewChange} />}
      />

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeView === 'characters' && <ManageCharacters embedded />}
        {activeView === 'npcs' && <ManageNPCs embedded />}
        {activeView === 'groups' && <ManageGroups />}
      </div>
    </div>
  )
}
