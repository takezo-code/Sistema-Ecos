import React from 'react'
import { Settings } from 'lucide-react'
import { SidebarLink } from './ui/aceternity-sidebar'
import { cn } from '../lib/utils'

/** Botão de Config na sidebar — abre a tela de configuração. */
export function ConfigNavButton({ active = false, onOpen }) {
  return (
    <SidebarLink
      active={active}
      onClick={onOpen}
      link={{
        label: 'Config',
        href: '#',
        icon: (
          <Settings
            className={cn(
              'h-6 w-6 shrink-0',
              active ? 'text-violet-400' : 'text-neutral-400',
            )}
          />
        ),
      }}
    />
  )
}
