import React from 'react'
import { Sidebar } from '../components/Sidebar'
import { ConfigNavButton } from '../components/ConfigNavButton'

export function MainLayout({ children, onNavigate, activePage, managementView, emjogoView, campanhaView }) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-transparent md:flex-row">
      <Sidebar
        activePage={activePage}
        managementView={managementView}
        emjogoView={emjogoView}
        campanhaView={campanhaView}
        onNavigate={onNavigate}
        footer={(
          <ConfigNavButton
            active={activePage === 'config'}
            onOpen={() => onNavigate?.('config')}
          />
        )}
      />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-transparent">
        {children}
      </main>
    </div>
  )
}
