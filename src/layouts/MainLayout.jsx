import React, { useState } from 'react'
import { Sidebar } from '../components/Sidebar'

export function MainLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#0a0a0a' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <main
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: '#0a0a0a',
          transition: 'all 0.2s',
        }}
      >
        {children}
      </main>
    </div>
  )
}
