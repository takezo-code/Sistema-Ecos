import React from 'react'
import { MANAGEMENT_VIEWS } from '../constants/managementViews'
import LineSidebar from './react-bits/LineSidebar'

export const SIDEBAR_LINKS = [
  { id: 'inicio', label: 'Início', home: true },
  { id: 'historia', label: 'História', page: 'campanha', subView: 'historia' },
  { id: 'sessoes', label: 'Sessões', page: 'campanha', subView: 'sessoes' },
  { id: 'characters', label: 'Personagens', page: 'management', subView: MANAGEMENT_VIEWS.CHARACTERS },
  { id: 'npcs', label: 'NPCs', page: 'management', subView: MANAGEMENT_VIEWS.NPCS },
  { id: 'boss', label: 'Boss', page: 'management', subView: MANAGEMENT_VIEWS.BOSS },
  { id: 'organizations', label: 'Organizações', page: 'management', subView: MANAGEMENT_VIEWS.ORGANIZATIONS },
  { id: 'ficha', label: 'Ficha', page: 'emjogo', subView: 'ficha' },
  { id: 'combat', label: 'Combate', page: 'emjogo', subView: 'combat' },
  { id: 'creation', label: 'Criação', page: 'creation' },
  { id: 'trash', label: 'Lixeira', page: 'trash' },
]

export function getSidebarActiveIndex({ activePage, managementView, emjogoView, campanhaView }) {
  const index = SIDEBAR_LINKS.findIndex(item => {
    if (item.home) return false
    if (item.page !== activePage) return false
    if (item.page === 'management') return item.subView === managementView
    if (item.page === 'emjogo') return item.subView === emjogoView
    if (item.page === 'campanha') return item.subView === campanhaView
    return !item.subView
  })
  return index >= 0 ? index : null
}

export function Sidebar({
  activePage,
  managementView = MANAGEMENT_VIEWS.CHARACTERS,
  emjogoView = 'ficha',
  campanhaView = 'historia',
  onNavigate,
  onGoHome,
  footer,
}) {
  const activeIndex = getSidebarActiveIndex({
    activePage,
    managementView,
    emjogoView,
    campanhaView,
  })

  const handleItemClick = (_index, _label, item) => {
    if (item?.home) {
      onGoHome?.()
      return
    }
    if (item?.page) onNavigate?.(item.page, item.subView)
  }

  return (
    <aside
      style={{
        width: '220px',
        minWidth: '220px',
        background: 'rgba(8,8,10,0.62)',
        borderRight: '1px solid #1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 10,
      }}
    >
      <div
        style={{
          padding: '1rem 1rem 0.75rem',
          borderBottom: '1px solid #1a1a1a',
          minHeight: '56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: '0.7rem', color: '#a855f7', fontFamily: 'monospace', letterSpacing: '0.15em', fontWeight: 700 }}>
          ECOS
        </div>
        <div style={{ fontSize: '0.6rem', color: '#333', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
          PANEL v1.0
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', padding: '0.5rem 0.75rem 0.5rem 0.5rem' }}>
        <LineSidebar
          items={SIDEBAR_LINKS}
          activeIndex={activeIndex}
          onItemClick={handleItemClick}
          showIndex
          showMarker
          fontSize={0.82}
          itemGap={14}
          markerLength={36}
          maxShift={14}
          proximityRadius={72}
        />
      </div>

      <div
        style={{
          borderTop: '1px solid #1a1a1a',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {footer}
      </div>
    </aside>
  )
}
