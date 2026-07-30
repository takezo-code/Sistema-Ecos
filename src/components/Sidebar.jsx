import React, { useEffect, useState } from 'react'
import {
  BookOpen,
  Users,
  ScrollText,
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
  Shield,
  UsersRound,
  Clapperboard,
  Store,
} from 'lucide-react'
import { MANAGEMENT_VIEWS } from '../constants/managementViews'

const MANAGEMENT_SECTIONS = [
  {
    id: 'entities',
    label: 'Entidades',
    items: [
      { id: MANAGEMENT_VIEWS.CHARACTERS, label: 'Personagens', icon: Sword },
      { id: MANAGEMENT_VIEWS.NPCS, label: 'NPCs', icon: Skull },
      { id: MANAGEMENT_VIEWS.BOSS, label: 'Boss', icon: ShieldAlert },
      { id: MANAGEMENT_VIEWS.ORGANIZATIONS, label: 'Organizações', icon: Building2 },
    ],
  },
  {
    id: 'equipment',
    label: 'Equipamentos',
    items: [
      { id: MANAGEMENT_VIEWS.ARMAS, label: 'Armas', icon: Sword },
      { id: MANAGEMENT_VIEWS.ARMADURA, label: 'Armadura', icon: Shield },
    ],
  },
  {
    id: 'skills',
    label: 'Skills',
    items: [
      { id: MANAGEMENT_VIEWS.SKILLS_NPC, label: 'NPC', icon: Skull },
      { id: MANAGEMENT_VIEWS.SKILLS_BOSS, label: 'Boss', icon: ShieldAlert },
    ],
  },
]

const EMJOGO_CHILDREN = [
  { id: 'ficha', label: 'Ficha', icon: UsersRound },
  { id: 'cena', label: 'Cena', icon: Clapperboard },
  { id: 'combat', label: 'Combate', icon: Swords },
  { id: 'mercador', label: 'Mercador', icon: Store },
]

const CAMPANHA_CHILDREN = [
  { id: 'historia', label: 'História', icon: BookOpen },
  { id: 'sessoes', label: 'Sessões', icon: ScrollText },
]

const NAV_ITEMS = [
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
    sections: MANAGEMENT_SECTIONS,
    defaultSubView: MANAGEMENT_VIEWS.CHARACTERS,
  },
  {
    id: 'emjogo',
    label: 'Em jogo',
    icon: Swords,
    children: EMJOGO_CHILDREN,
    defaultSubView: 'ficha',
  },
  { id: 'creation', label: 'Criação', icon: Sparkles },
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

function NavSectionLabel({ label }) {
  return (
    <div
      style={{
        padding: '0.55rem 1rem 0.2rem 1.85rem',
        fontSize: '0.58rem',
        color: '#3a3a3a',
        fontFamily: 'monospace',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        userSelect: 'none',
      }}
    >
      {label}
    </div>
  )
}

function getGroupItems(group) {
  if (group.sections) {
    return group.sections.flatMap(section => section.items)
  }
  return group.children || []
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
      {expanded && group.sections && group.sections.map((section, sectionIndex) => (
        <div key={section.id} style={{ marginTop: sectionIndex > 0 ? '0.25rem' : 0 }}>
          <NavSectionLabel label={section.label} />
          {section.items.map(child => (
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
      ))}
      {expanded && !group.sections && getGroupItems(group).map(child => (
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
  managementView = MANAGEMENT_VIEWS.CHARACTERS,
  emjogoView = 'ficha',
  campanhaView = 'historia',
  onNavigate,
  footer,
}) {
  const [managementExpanded, setManagementExpanded] = useState(activePage === 'management')
  const [emjogoExpanded, setEmjogoExpanded] = useState(activePage === 'emjogo')
  const [campanhaExpanded, setCampanhaExpanded] = useState(activePage === 'campanha')

  useEffect(() => {
    if (activePage === 'management') setManagementExpanded(true)
    if (activePage === 'emjogo') setEmjogoExpanded(true)
    if (activePage === 'campanha') setCampanhaExpanded(true)
  }, [activePage])

  const getSubView = (pageId) => {
    if (pageId === 'management') return managementView
    if (pageId === 'emjogo') return emjogoView
    if (pageId === 'campanha') return campanhaView
    return null
  }

  const getExpanded = (pageId) => {
    if (pageId === 'management') return managementExpanded
    if (pageId === 'emjogo') return emjogoExpanded
    if (pageId === 'campanha') return campanhaExpanded
    return false
  }

  const setExpanded = (pageId, value) => {
    if (pageId === 'management') setManagementExpanded(value)
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
          padding: collapsed ? '0.75rem 0' : '1rem',
          borderBottom: '1px solid #1a1a1a',
          display: 'flex',
          flexDirection: collapsed ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: collapsed ? '0.5rem' : 0,
          minHeight: '56px',
        }}
      >
        {!collapsed && (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.7rem', color: '#dc2626', fontFamily: 'monospace', letterSpacing: '0.15em', fontWeight: 700 }}>
              RPG MASTER
            </div>
            <div style={{ fontSize: '0.6rem', color: '#333', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
              PANEL v1.0
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          style={{
            background: collapsed ? 'rgba(255,255,255,0.04)' : 'transparent',
            border: collapsed ? '1px solid #1a1a1a' : 'none',
            borderRadius: '4px',
            color: '#666',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: collapsed ? '32px' : 'auto',
            height: collapsed ? '32px' : 'auto',
            padding: collapsed ? 0 : '4px',
            flexShrink: 0,
            transition: 'color 0.15s, background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#e5e5e5'
            e.currentTarget.style.borderColor = '#333'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#666'
            e.currentTarget.style.borderColor = '#1a1a1a'
          }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav style={{ flex: 1, padding: '0.5rem 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_ITEMS.map(item => {
          if (item.children || item.sections) {
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

      <div
        style={{
          borderTop: '1px solid #1a1a1a',
          padding: collapsed ? '0.5rem 0' : 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: collapsed ? 'center' : 'stretch',
        }}
      >
        {footer || (
          <div
            style={{
              padding: collapsed ? '0.75rem 0' : '0.75rem 1rem',
              display: 'flex',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <div style={{ fontSize: '0.6rem', color: '#222', fontFamily: 'monospace' }}>
              {collapsed ? '●' : 'LOCAL MODE ●'}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
