import React, { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { SaveToolbar } from './components/SaveToolbar'
import { SaveToast } from './components/ui/SaveToast'
import { WelcomeScreen } from './pages/WelcomeScreen'
import { Dashboard } from './pages/Dashboard'
import { Campaigns } from './pages/Campaigns'
import { Creation } from './pages/Creation'
import { Management } from './pages/Management'
import { Sessions } from './pages/Sessions'
import { Dice } from './pages/Dice'
import { isAppBootstrapped, persistUiState, autoSave } from './services/saveService'
import { storage, KEYS } from './services/storage'

const PAGES = {
  dashboard: Dashboard,
  campaigns: Campaigns,
  creation: Creation,
  management: Management,
  sessions: Sessions,
  dice: Dice,
}

function loadUiState() {
  return storage.get(KEYS.uiState) || {}
}

export default function App() {
  const [inApp, setInApp] = useState(() => isAppBootstrapped())
  const savedUi = loadUiState()
  const [activePage, setActivePage] = useState(savedUi.activePage || 'dashboard')
  const [creationView, setCreationView] = useState(savedUi.creationView || 'npcs')
  const [managementView, setManagementView] = useState(savedUi.managementView || 'characters')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(savedUi.sidebarCollapsed ?? false)

  useEffect(() => {
    if (!inApp) return
    persistUiState({
      activePage,
      creationView,
      managementView,
      sidebarCollapsed,
    })
  }, [inApp, activePage, creationView, managementView, sidebarCollapsed])

  useEffect(() => {
    if (inApp) autoSave()
  }, [inApp])

  const handleNavigate = (page, subView) => {
    setActivePage(page)
    if (page === 'creation' && subView) setCreationView(subView)
    if (page === 'management' && subView) setManagementView(subView)
  }

  if (!inApp) {
    return (
      <>
        <WelcomeScreen onEnter={() => setInApp(true)} />
        <SaveToast />
      </>
    )
  }

  const PageComponent = PAGES[activePage] || Dashboard
  const pageProps = activePage === 'creation'
    ? { initialView: creationView, onViewChange: setCreationView, onNavigate: handleNavigate }
    : activePage === 'management'
      ? { initialView: managementView, onViewChange: setManagementView, onNavigate: handleNavigate }
      : { onNavigate: handleNavigate }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: '#0a0a0a',
    }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        activePage={activePage}
        onNavigate={handleNavigate}
        footer={<SaveToolbar collapsed={sidebarCollapsed} />}
      />
      <main style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0a0a',
        minWidth: 0,
      }}>
        <PageComponent {...pageProps} />
      </main>
      <SaveToast />
    </div>
  )
}
