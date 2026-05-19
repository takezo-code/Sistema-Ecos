import React from 'react'
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Users,
  ScrollText,
  Dices,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'skills', label: 'Skills', icon: Zap, highlight: true },
  { id: 'campaigns', label: 'Campanhas', icon: BookOpen },
  { id: 'creation', label: 'Criação', icon: Sparkles },
  { id: 'management', label: 'Gerenciamento', icon: Users },
  { id: 'sessions', label: 'Sessões', icon: ScrollText },
  { id: 'dice', label: 'Dados', icon: Dices },
]

export function Sidebar({ collapsed, onToggle, activePage, onNavigate, footer }) {
  return (
    <aside
      style={{
        width: collapsed ? '56px' : '220px',
        minWidth: collapsed ? '56px' : '220px',
        background: '#0d0d0d',
        borderRight: '1px solid #1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s, min-width 0.2s',
        overflow: 'hidden',
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: collapsed ? '1rem 0' : '1rem',
          borderBottom: '1px solid #1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: '56px',
        }}
      >
        {!collapsed && (
          <div>
            <div style={{ fontSize: '0.7rem', color: '#dc2626', fontFamily: 'monospace', letterSpacing: '0.15em', fontWeight: 700 }}>
              RPG MASTER
            </div>
            <div style={{ fontSize: '0.6rem', color: '#333', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
              PANEL v1.0
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{ color: '#dc2626', fontSize: '0.65rem', fontFamily: 'monospace', fontWeight: 700 }}>RM</div>
        )}
        <button
          onClick={onToggle}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#333',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '2px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#666'}
          onMouseLeave={e => e.currentTarget.style.color = '#333'}
        >
          {collapsed
            ? <ChevronRight size={14} />
            : <ChevronLeft size={14} />
          }
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.5rem 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const isActive = activePage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: collapsed ? '0.625rem 0' : '0.625rem 1rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive
                  ? (item.highlight ? 'rgba(168,85,247,0.08)' : 'rgba(220,38,38,0.08)')
                  : 'transparent',
                border: 'none',
                borderLeft: isActive
                  ? `2px solid ${item.highlight ? '#a855f7' : '#dc2626'}`
                  : '2px solid transparent',
                color: isActive ? '#e5e5e5' : '#555',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: isActive ? 500 : 400,
                letterSpacing: '0.01em',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
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
              title={collapsed ? item.label : ''}
            >
              <Icon size={15} style={{ minWidth: '15px', color: isActive ? (item.highlight ? '#a855f7' : '#dc2626') : 'inherit' }} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {footer || (
        <div
          style={{
            padding: collapsed ? '0.75rem 0' : '0.75rem 1rem',
            borderTop: '1px solid #1a1a1a',
            display: 'flex',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <div style={{ fontSize: '0.6rem', color: '#222', fontFamily: 'monospace' }}>
            {collapsed ? '●' : 'LOCAL MODE ●'}
          </div>
        </div>
      )}
    </aside>
  )
}
