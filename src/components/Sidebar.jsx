import React, { useState } from 'react'
import {
  BookOpen,
  Building2,
  Settings,
  Shield,
  Skull,
  Sparkles,
  Swords,
  Users,
  UsersRound,
} from 'lucide-react'
import { MANAGEMENT_VIEWS } from '../constants/managementViews'
import {
  AceternitySidebar,
  SidebarBody,
  SidebarLink,
} from './ui/aceternity-sidebar'
import { cn } from '../lib/utils'

const ICON_CLASS = 'h-6 w-6 shrink-0'

export const SIDEBAR_LINKS = [
  {
    id: 'historia',
    label: 'História',
    page: 'campanha',
    subView: 'historia',
    icon: <BookOpen className={ICON_CLASS} />,
  },
  {
    id: 'characters',
    label: 'Personagens',
    page: 'management',
    subView: MANAGEMENT_VIEWS.CHARACTERS,
    icon: <Users className={ICON_CLASS} />,
  },
  {
    id: 'npcs',
    label: 'NPCs',
    page: 'management',
    subView: MANAGEMENT_VIEWS.NPCS,
    icon: <UsersRound className={ICON_CLASS} />,
  },
  {
    id: 'boss',
    label: 'Boss',
    page: 'management',
    subView: MANAGEMENT_VIEWS.BOSS,
    icon: <Skull className={ICON_CLASS} />,
  },
  {
    id: 'organizations',
    label: 'Organizações',
    page: 'management',
    subView: MANAGEMENT_VIEWS.ORGANIZATIONS,
    icon: <Building2 className={ICON_CLASS} />,
  },
  {
    id: 'ficha',
    label: 'Ficha',
    page: 'emjogo',
    subView: 'ficha',
    icon: <Shield className={ICON_CLASS} />,
  },
  {
    id: 'combat',
    label: 'Combate',
    page: 'emjogo',
    subView: 'combat',
    icon: <Swords className={ICON_CLASS} />,
  },
  {
    id: 'creation',
    label: 'Criação',
    page: 'creation',
    icon: <Sparkles className={ICON_CLASS} />,
  },
]

export function getSidebarActiveIndex({ activePage, managementView, emjogoView, campanhaView }) {
  const index = SIDEBAR_LINKS.findIndex(item => {
    if (item.page !== activePage) return false
    if (item.page === 'management') return item.subView === managementView
    if (item.page === 'emjogo') return item.subView === emjogoView
    if (item.page === 'campanha') return item.subView === campanhaView
    return !item.subView
  })
  return index >= 0 ? index : null
}

function ConfigFooterLink({ active, onOpen }) {
  return (
    <SidebarLink
      active={active}
      onClick={onOpen}
      link={{
        label: 'Config',
        href: '#',
        icon: (
          <Settings
            className={cn(ICON_CLASS, active ? 'text-violet-400' : 'text-neutral-400')}
          />
        ),
      }}
    />
  )
}

export function Sidebar({
  activePage,
  managementView = MANAGEMENT_VIEWS.CHARACTERS,
  emjogoView = 'ficha',
  campanhaView = 'historia',
  onNavigate,
  footer,
}) {
  const [open, setOpen] = useState(false)
  const activeIndex = getSidebarActiveIndex({
    activePage,
    managementView,
    emjogoView,
    campanhaView,
  })

  return (
    <AceternitySidebar open={open} setOpen={setOpen}>
      <SidebarBody className="h-full min-h-0 justify-between gap-8">
        <nav className="flex flex-col gap-4 overflow-y-auto py-2">
          {SIDEBAR_LINKS.map((item, idx) => (
            <SidebarLink
              key={item.id}
              active={activeIndex === idx}
              onClick={() => {
                if (item.page) onNavigate?.(item.page, item.subView)
                setOpen(false)
              }}
              link={{
                label: item.label,
                href: '#',
                icon: item.icon,
              }}
            />
          ))}
        </nav>
        <div className="shrink-0 border-t border-white/[0.06] pt-5">
          {footer ?? (
            <ConfigFooterLink
              active={activePage === 'config'}
              onOpen={() => {
                onNavigate?.('config')
                setOpen(false)
              }}
            />
          )}
        </div>
      </SidebarBody>
    </AceternitySidebar>
  )
}
