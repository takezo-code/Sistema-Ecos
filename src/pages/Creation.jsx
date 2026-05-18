import React, { useEffect, useState } from 'react'
import { Sparkles, Skull, Sword, Building2 } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { NPCs } from './NPCs'
import { Characters } from './Characters'
import { Organizations } from './Organizations'

const SUB_VIEWS = [
  { id: 'npcs', label: 'NPC', icon: Skull, color: '#06b6d4' },
  { id: 'characters', label: 'Personagem', icon: Sword, color: '#9ca3af' },
  { id: 'organizations', label: 'Organização', icon: Building2, color: '#d97706' },
]

function CreationSubNav({ activeView, onViewChange }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        background: '#0d0d0d',
        border: '1px solid #1a1a1a',
        borderRadius: '4px',
        padding: '3px',
      }}
    >
      {SUB_VIEWS.map(item => {
        const Icon = item.icon
        const isActive = activeView === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onViewChange(item.id)}
            title={item.label}
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
              letterSpacing: '0.02em',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.color = '#999'
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.color = '#555'
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            <Icon size={14} style={{ color: isActive ? item.color : 'inherit', flexShrink: 0 }} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function Creation({ initialView = 'npcs', onViewChange, onNavigate }) {
  const [activeView, setActiveView] = useState(initialView)

  useEffect(() => {
    if (initialView) setActiveView(initialView)
  }, [initialView])

  const handleViewChange = (view) => {
    setActiveView(view)
    onViewChange?.(view)
  }

  const subtitles = {
    npcs: 'PERSONAGENS NÃO JOGÁVEIS',
    characters: 'PERSONAGENS JOGÁVEIS',
    organizations: 'FAÇÕES E GRUPOS',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        icon={Sparkles}
        title="Criação"
        subtitle={subtitles[activeView]}
        action={<CreationSubNav activeView={activeView} onViewChange={handleViewChange} />}
      />

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeView === 'npcs' && <NPCs embedded onNavigate={onNavigate} />}
        {activeView === 'characters' && <Characters embedded onNavigate={onNavigate} />}
        {activeView === 'organizations' && <Organizations embedded onNavigate={onNavigate} />}
      </div>
    </div>
  )
}
