import React from 'react'
import { Sidebar } from '../components/Sidebar'
import { SaveToolbar } from '../components/SaveToolbar'

export function MainLayout({ children, onNavigate, onGoHome, activePage, managementView, emjogoView, campanhaView }) {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'transparent' }}>
      <Sidebar
        activePage={activePage}
        managementView={managementView}
        emjogoView={emjogoView}
        campanhaView={campanhaView}
        onNavigate={onNavigate}
        onGoHome={onGoHome}
        footer={<SaveToolbar />}
      />
      <main
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: 'transparent',
          minWidth: 0,
        }}
      >
        {children}
      </main>
    </div>
  )
}
