import React, { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { SaveToolbar } from './components/SaveToolbar'
import { SaveToast } from './components/ui/SaveToast'
import { WelcomeScreen } from './pages/WelcomeScreen'
import { Dashboard } from './pages/Dashboard'
import { Campanha } from './pages/Campanha'
import { Management } from './pages/Management'
import { EmJogo } from './pages/EmJogo'
import { Dice } from './pages/Dice'
import { Trash } from './pages/Trash'
import { Skills } from './pages/Skills'
import { isAppBootstrapped, persistUiState, autoSave } from './services/saveService'
import { storage, KEYS } from './services/storage'

const PAGES = {
  dashboard: Dashboard,
  campanha: Campanha,
  management: Management,
  emjogo: EmJogo,
  skills: Skills,
  dice: Dice,
  trash: Trash,
}

function loadUiState() {
  return storage.get(KEYS.uiState) || {}
}

export default function App() {
  const [inApp, setInApp] = useState(() => isAppBootstrapped())
  const savedUi = loadUiState()
  const legacyPage = savedUi.activePage
  let migratedPage = legacyPage || 'dashboard'
  let migratedCampanhaView = savedUi.campanhaView || 'historia'
  if (legacyPage === 'character') migratedPage = 'emjogo'
  else if (legacyPage === 'skills' || savedUi.emjogoView === 'skills') migratedPage = 'skills'
  else if (legacyPage === 'campaigns') {
    migratedPage = 'campanha'
    migratedCampanhaView = 'historia'
  } else if (legacyPage === 'sessions') {
    migratedPage = 'campanha'
    migratedCampanhaView = 'sessoes'
  }
  const [activePage, setActivePage] = useState(migratedPage)
  const [managementView, setManagementView] = useState(savedUi.managementView || 'characters')
  const [managementCreationType, setManagementCreationType] = useState(null)
  const [skillsView, setSkillsView] = useState(savedUi.skillsView || 'character')
  const [skillsCreationType, setSkillsCreationType] = useState(null)
  const [emjogoView, setEmjogoView] = useState(
    savedUi.emjogoView === 'skills' ? 'ficha' : (savedUi.emjogoView || 'ficha')
  )
  const [campanhaView, setCampanhaView] = useState(migratedCampanhaView)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(savedUi.sidebarCollapsed ?? false)

  useEffect(() => {
    if (!inApp) return
    persistUiState({
      activePage,
      managementView,
      skillsView,
      emjogoView,
      campanhaView,
      sidebarCollapsed,
    })
  }, [inApp, activePage, managementView, skillsView, emjogoView, campanhaView, sidebarCollapsed])

  useEffect(() => {
    if (inApp) autoSave()
  }, [inApp])

  const handleNavigate = (page, subView, creationType) => {
    setActivePage(page)
    if (page === 'management' && subView) {
      setManagementView(subView)
      if (subView === 'creation' && creationType) {
        setManagementCreationType(creationType)
      } else if (subView !== 'creation') {
        setManagementCreationType(null)
      }
    }
    if (page === 'skills' && subView) {
      setSkillsView(subView)
      if (subView === 'creation' && creationType) {
        setSkillsCreationType(creationType)
      } else if (subView !== 'creation') {
        setSkillsCreationType(null)
      }
    }
    if (page === 'emjogo' && subView) setEmjogoView(subView)
    if (page === 'campanha' && subView) setCampanhaView(subView)
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
  const pageProps = activePage === 'management'
    ? {
        initialView: managementView,
        initialCreationType: managementCreationType,
        onCreationTypeConsumed: () => setManagementCreationType(null),
        onViewChange: setManagementView,
        onNavigate: handleNavigate,
      }
    : activePage === 'skills'
      ? {
          initialView: skillsView,
          initialCreationType: skillsCreationType,
          onCreationTypeConsumed: () => setSkillsCreationType(null),
          onViewChange: setSkillsView,
          onNavigate: handleNavigate,
        }
      : activePage === 'emjogo'
        ? { initialView: emjogoView, onViewChange: setEmjogoView, onNavigate: handleNavigate }
        : activePage === 'campanha'
          ? { initialView: campanhaView, onViewChange: setCampanhaView, onNavigate: handleNavigate }
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
        managementView={managementView}
        skillsView={skillsView}
        emjogoView={emjogoView}
        campanhaView={campanhaView}
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
