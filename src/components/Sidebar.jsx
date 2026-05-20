import React, { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ScrollText,
  Dices,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Swords,
  Trash2,
  Sparkles,
  Skull,
  Building2,
  ShieldAlert,
  Sword,
  UsersRound,
  Clapperboard,
} from 'lucide-react'
import { SKILL_AUDIENCE } from '../constants/skillAudience'

const MANAGEMENT_CHILDREN = [
  { id: 'characters', label: 'Personagens', icon: Sword },
  { id: 'npcs', label: 'NPCs', icon: Skull },
  { id: 'boss', label: 'Boss', icon: ShieldAlert },
  { id: 'organizations', label: 'Organizações', icon: Building2 },
  { id: 'creation', label: 'Criação', icon: Sparkles },
]

const SKILLS_CHILDREN = [
  { id: SKILL_AUDIENCE.CHARACTER, label: 'Skills Personagem', icon: Sword },
  { id: SKILL_AUDIENCE.NPC, label: 'Skills NPC', icon: Skull },
  { id: SKILL_AUDIENCE.BOSS, label: 'Skills Boss', icon: ShieldAlert },
  { id: 'creation', label: 'Criação', icon: Sparkles },
]

const EMJOGO_CHILDREN = [
  { id: 'ficha', label: 'Ficha', icon: UsersRound },
  { id: 'cena', label: 'Cena', icon: Clapperboard },
  { id: 'combat', label: 'Combate', icon: Swords },
]

const CAMPANHA_CHILDREN = [
  { id: 'historia', label: 'História', icon: BookOpen },
  { id: 'sessoes', label: 'Sessões', icon: ScrollText },
]

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    id: 'campanha',
    label: 'Campanha',
    icon: BookOpen,
    children: CAMPANHA_CHILDREN,
    defaultSubView: 'historia',
  },
  {
    id: 'management',
    label: 'Gerenciamento',
    icon: Users,
    children: MANAGEMENT_CHILDREN,
    defaultSubView: 'characters',
  },
  {
    id: 'skills',
    label: 'Skills',
    icon: Sparkles,
    children: SKILLS_CHILDREN,
    defaultSubView: SKILL_AUDIENCE.CHARACTER,
  },
  {
    id: 'emjogo',
    label: 'Em jogo',
    icon: Swords,
    children: EMJOGO_CHILDREN,
    defaultSubView: 'ficha',
  },
  { id: 'dice', label: 'Dados', icon: Dices },
  { id: 'trash', label: 'Lixeira', icon: Trash2 },
]

const navBtnBase = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  width: '100%',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.8rem',
  letterSpacing: '0.01em',
  transition: 'all 0.15s',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
}

function NavItemButton({ item, isActive, collapsed, onClick, indent = 0 }) {
  const Icon = item.icon
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? item.label : ''}
      style={{
        ...navBtnBase,
        padding: collapsed ? '0.625rem 0' : `0.5rem 1rem 0.5rem ${1 + indent * 0.85}rem`,
        justifyContent: collapsed ? 'center' : 'flex-start',
        background: isActive ? 'rgba(220,38,38,0.08)' : 'transparent',
        borderLeft: isActive ? '2px solid #dc2626' : '2px solid transparent',
        color: isActive ? '#e5e5e5' : '#555',
        fontWeight: isActive ? 500 : 400,
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
      <Icon size={indent > 0 ? 14 : 15} style={{ minWidth: indent > 0 ? '14px' : '15px', color: isActive ? '#dc2626' : 'inherit' }} />
      {!collapsed && <span>{item.label}</span>}
    </button>
  )
}

function NavGroup({
  group,
  pageId,
  collapsed,
  isGroupActive,
  activeSubView,
  expanded,
  onToggleExpand,
  onNavigate,
}) {
  const GroupIcon = group.icon
  const defaultSub = group.defaultSubView

  if (collapsed) {
    return (
      <NavItemButton
        item={group}
        isActive={isGroupActive}
        collapsed
        onClick={() => onNavigate(pageId, activeSubView || defaultSub)}
      />
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={onToggleExpand}
        style={{
          ...navBtnBase,
          padding: '0.5rem 1rem',
          justifyContent: 'flex-start',
          background: isGroupActive ? 'rgba(220,38,38,0.05)' : 'transparent',
          borderLeft: isGroupActive ? '2px solid rgba(220,38,38,0.35)' : '2px solid transparent',
          color: isGroupActive ? '#ccc' : '#555',
          fontWeight: 500,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = '#999'
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = isGroupActive ? '#ccc' : '#555'
          e.currentTarget.style.background = isGroupActive ? 'rgba(220,38,38,0.05)' : 'transparent'
        }}
      >
        <GroupIcon size={15} style={{ minWidth: '15px', color: isGroupActive ? '#dc2626' : 'inherit' }} />
        <span style={{ flex: 1, textAlign: 'left' }}>{group.label}</span>
        {expanded
          ? <ChevronUp size={13} style={{ color: '#444', flexShrink: 0 }} />
          : <ChevronDown size={13} style={{ color: '#444', flexShrink: 0 }} />
        }
      </button>
      {expanded && group.children.map(child => (
        <NavItemButton
          key={child.id}
          item={child}
          isActive={isGroupActive && activeSubView === child.id}
          collapsed={false}
          indent={1}
          onClick={() => onNavigate(pageId, child.id)}
        />
      ))}
    </div>
  )
}

export function Sidebar({
  collapsed,
  onToggle,
  activePage,
  managementView = 'characters',
  skillsView = SKILL_AUDIENCE.CHARACTER,
  emjogoView = 'ficha',
  campanhaView = 'historia',
  onNavigate,
  footer,
}) {
  const [managementExpanded, setManagementExpanded] = useState(activePage === 'management')
  const [skillsExpanded, setSkillsExpanded] = useState(activePage === 'skills')
  const [emjogoExpanded, setEmjogoExpanded] = useState(activePage === 'emjogo')
  const [campanhaExpanded, setCampanhaExpanded] = useState(activePage === 'campanha')

  useEffect(() => {
    if (activePage === 'management') setManagementExpanded(true)
    if (activePage === 'skills') setSkillsExpanded(true)
    if (activePage === 'emjogo') setEmjogoExpanded(true)
    if (activePage === 'campanha') setCampanhaExpanded(true)
  }, [activePage])

  const getSubView = (pageId) => {
    if (pageId === 'management') return managementView
    if (pageId === 'skills') return skillsView
    if (pageId === 'emjogo') return emjogoView
    if (pageId === 'campanha') return campanhaView
    return null
  }

  const getExpanded = (pageId) => {
    if (pageId === 'management') return managementExpanded
    if (pageId === 'skills') return skillsExpanded
    if (pageId === 'emjogo') return emjogoExpanded
    if (pageId === 'campanha') return campanhaExpanded
    return false
  }

  const setExpanded = (pageId, value) => {
    if (pageId === 'management') setManagementExpanded(value)
    if (pageId === 'skills') setSkillsExpanded(value)
    if (pageId === 'emjogo') setEmjogoExpanded(value)
    if (pageId === 'campanha') setCampanhaExpanded(value)
  }

  const toggleExpanded = (pageId, item) => {
    const subView = getSubView(pageId)
    const defaultSub = item.defaultSubView
    if (activePage !== pageId) {
      onNavigate(pageId, subView || defaultSub)
      setExpanded(pageId, true)
    } else {
      setExpanded(pageId, !getExpanded(pageId))
    }
  }

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
          type="button"
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
          onMouseEnter={e => { e.currentTarget.style.color = '#666' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#333' }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav style={{ flex: 1, padding: '0.5rem 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_ITEMS.map(item => {
          if (item.children) {
            const pageId = item.id
            return (
              <NavGroup
                key={item.id}
                group={item}
                pageId={pageId}
                collapsed={collapsed}
                isGroupActive={activePage === pageId}
                activeSubView={getSubView(pageId)}
                expanded={getExpanded(pageId)}
                onToggleExpand={() => toggleExpanded(pageId, item)}
                onNavigate={onNavigate}
              />
            )
          }

          const Icon = item.icon
          const isActive = activePage === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : ''}
              style={{
                ...navBtnBase,
                padding: collapsed ? '0.625rem 0' : '0.625rem 1rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive ? 'rgba(220,38,38,0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid #dc2626' : '2px solid transparent',
                color: isActive ? '#e5e5e5' : '#555',
                fontWeight: isActive ? 500 : 400,
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
              <Icon size={15} style={{ minWidth: '15px', color: isActive ? '#dc2626' : 'inherit' }} />
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
