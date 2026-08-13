import React, { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { SaveToolbar } from './components/SaveToolbar'
import { SaveToast } from './components/ui/SaveToast'
import { WelcomeScreen } from './pages/WelcomeScreen'
import { Campanha } from './pages/Campanha'
import { Management } from './pages/Management'
import { MANAGEMENT_VIEWS, skillAudienceToManagementView, normalizeManagementView } from './constants/managementViews'
import { EmJogo } from './pages/EmJogo'
import { Dice } from './pages/Dice'
import { Trash } from './pages/Trash'
import { Creation } from './pages/Creation'
import { isAppBootstrapped, persistUiState, autoSave } from './services/saveService'
import { storage, KEYS } from './services/storage'
import { DarkVeilLayer } from './components/react-bits/DarkVeilLayer'

const PAGES = {
  campanha: Campanha,
  management: Management,
  emjogo: EmJogo,
  creation: Creation,
  dice: Dice,
  trash: Trash,
}

function loadUiState() {
  return storage.get(KEYS.uiState) || {}
}

function migrateUiState(savedUi) {
  let page = savedUi.activePage || 'campanha'
  let managementView = savedUi.managementView || MANAGEMENT_VIEWS.CHARACTERS
  let campanhaView = savedUi.campanhaView || 'historia'
  let emjogoView = savedUi.emjogoView || 'ficha'

  if (page === 'dashboard') page = 'campanha'
  if (page === 'character') page = 'emjogo'
  if (emjogoView === 'skills') emjogoView = 'ficha'
  if (emjogoView === 'mercador') emjogoView = 'ficha'
  if (emjogoView === 'cena') emjogoView = 'combat'

  if (page === 'campaigns') {
    page = 'campanha'
    campanhaView = 'historia'
  } else if (page === 'sessions') {
    page = 'campanha'
    campanhaView = 'sessoes'
  }

  // Aba antiga Equipamentos → catálogo saiu; equipamento agora vive na ficha
  if (page === 'equipamentos') {
    page = 'management'
    managementView = MANAGEMENT_VIEWS.CHARACTERS
  } else if (page === 'skills') {
    page = 'management'
    managementView = skillAudienceToManagementView(savedUi.skillsView)
  }

  if (managementView === 'creation') {
    page = 'creation'
    managementView = MANAGEMENT_VIEWS.CHARACTERS
  }

  // Audiences / catálogos antigos gravados como managementView
  if (
    managementView === 'character'
    || managementView === MANAGEMENT_VIEWS.SKILLS_CHARACTER
    || managementView === MANAGEMENT_VIEWS.SKILLS_NPC
    || managementView === 'npc'
  ) {
    managementView = MANAGEMENT_VIEWS.NPCS
  }
  if (managementView === MANAGEMENT_VIEWS.SKILLS_BOSS) {
    managementView = MANAGEMENT_VIEWS.BOSS
  }

  return { page, managementView, campanhaView, emjogoView }
}

export default function App() {
  const [inApp, setInApp] = useState(() => isAppBootstrapped())
  const savedUi = loadUiState()
  const migrated = migrateUiState(savedUi)

  const [activePage, setActivePage] = useState(migrated.page)
  const [managementView, setManagementView] = useState(migrated.managementView)
  const [creationType, setCreationType] = useState(null)
  const [emjogoView, setEmjogoView] = useState(migrated.emjogoView)
  const [campanhaView, setCampanhaView] = useState(migrated.campanhaView)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(savedUi.sidebarCollapsed ?? false)

  useEffect(() => {
    if (!inApp) return
    persistUiState({
      activePage,
      managementView,
      emjogoView,
      campanhaView,
      sidebarCollapsed,
    })
  }, [inApp, activePage, managementView, emjogoView, campanhaView, sidebarCollapsed])

  useEffect(() => {
    if (inApp) autoSave()
  }, [inApp])

  const handleNavigate = (page, subView, type) => {
    // Compat: links antigos Gerenciamento/Equipamentos/Skills → Criação
    if (subView === 'creation') {
      setActivePage('creation')
      if (type) setCreationType(type)
      return
    }

    // Compat: páginas Equipamentos / Skills removidas da sidebar
    if (page === 'equipamentos') {
      setActivePage('management')
      setManagementView(MANAGEMENT_VIEWS.CHARACTERS)
      return
    }
    if (page === 'skills') {
      setActivePage('management')
      setManagementView(skillAudienceToManagementView(subView))
      return
    }

    setActivePage(page === 'dashboard' ? 'campanha' : page)
    if (page === 'creation' && type) {
      setCreationType(type)
    }
    if (page === 'management' && subView) {
      setManagementView(
        subView === 'creation'
          ? MANAGEMENT_VIEWS.CHARACTERS
          : normalizeManagementView(subView),
      )
    }
    if (page === 'emjogo' && subView) setEmjogoView(subView)
    if (page === 'campanha' && subView) setCampanhaView(subView)
  }

  const PageComponent = PAGES[activePage] || Campanha
  const pageProps = activePage === 'management'
    ? {
        initialView: managementView,
        onViewChange: setManagementView,
        onNavigate: handleNavigate,
      }
    : activePage === 'creation'
      ? {
          onNavigate: handleNavigate,
          initialCreationType: creationType,
          onCreationTypeConsumed: () => setCreationType(null),
        }
      : activePage === 'emjogo'
        ? { initialView: emjogoView, onViewChange: setEmjogoView, onNavigate: handleNavigate }
        : activePage === 'campanha'
          ? { initialView: campanhaView, onViewChange: setCampanhaView, onNavigate: handleNavigate }
          : { onNavigate: handleNavigate }

  const shell = !inApp ? (
    <>
      <WelcomeScreen
        onEnter={() => setInApp(true)}
        canContinue={isAppBootstrapped()}
      />
      <SaveToast />
    </>
  ) : (
    <div style={{
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: 'transparent',
    }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        activePage={activePage}
        managementView={managementView}
        emjogoView={emjogoView}
        campanhaView={campanhaView}
        onNavigate={handleNavigate}
        onGoHome={() => setInApp(false)}
        footer={<SaveToolbar collapsed={sidebarCollapsed} />}
      />
      <main style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
        minWidth: 0,
      }}>
        <PageComponent {...pageProps} />
      </main>
      <SaveToast />
    </div>
  )

  return (
    <>
      <DarkVeilLayer />
      {shell}
    </>
  )
}
