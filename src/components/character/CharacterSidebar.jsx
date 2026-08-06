import React from 'react'
import {
  User,
  Backpack,
  Activity,
  Sparkles,
  Zap,
  History,
  Settings,
} from 'lucide-react'
import { CHARACTER_PANEL_TABS } from '../../store/useCharacterPanelStore'
import { THEME_ACCENT, THEME_ACCENT_SOFT } from '../../constants/theme'

const TABS = [
  { id: CHARACTER_PANEL_TABS.PROFILE, label: 'Personagem', icon: User },
  { id: CHARACTER_PANEL_TABS.INVENTORY, label: 'Inventário', icon: Backpack },
  { id: CHARACTER_PANEL_TABS.STATUS, label: 'Status', icon: Activity },
  { id: CHARACTER_PANEL_TABS.SKILLS, label: 'Habilidades', icon: Sparkles },
  { id: CHARACTER_PANEL_TABS.ECOS, label: 'Ecos', icon: Zap },
  { id: CHARACTER_PANEL_TABS.HISTORY, label: 'Histórico', icon: History },
  { id: CHARACTER_PANEL_TABS.SETTINGS, label: 'Configurações', icon: Settings },
]

export function CharacterSidebar({ activeTab, onTabChange, characterName }) {
  return (
    <aside
      style={{
        width: '200px',
        minWidth: '200px',
        background: '#0c0c0c',
        borderRight: '1px solid #1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div style={{ padding: '1rem', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ fontSize: '0.55rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.12em', marginBottom: '4px' }}>
          FICHA
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e5e5', lineHeight: 1.3 }}>
          {characterName || '—'}
        </div>
      </div>
      <nav style={{ flex: 1, padding: '0.35rem 0', overflowY: 'auto' }}>
        {TABS.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                width: '100%',
                padding: '0.55rem 1rem',
                background: active ? THEME_ACCENT_SOFT : 'transparent',
                border: 'none',
                borderLeft: active ? `2px solid ${THEME_ACCENT}` : '2px solid transparent',
                color: active ? '#e5e5e5' : '#555',
                cursor: 'pointer',
                fontSize: '0.78rem',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={14} style={{ color: active ? THEME_ACCENT : 'inherit', flexShrink: 0 }} />
              {tab.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
