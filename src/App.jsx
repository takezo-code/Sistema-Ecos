import React, { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { SaveToast } from './components/ui/SaveToast'
import { WelcomeScreen } from './pages/WelcomeScreen'
import { Campanha } from './pages/Campanha'
import { Management } from './pages/Management'
import { MANAGEMENT_VIEWS, skillAudienceToManagementView, normalizeManagementView } from './constants/managementViews'
import { EmJogo } from './pages/EmJogo'
import { Dice } from './pages/Dice'
import { Trash } from './pages/Trash'
import { Creation } from './pages/Creation'
import { Config } from './pages/Config'
import { persistUiState, autoSave } from './services/saveService'
import { isWelcomeIntroSeen } from './services/welcomeService'
import { storage, KEYS } from './services/storage'
import { EvilEyeLayer } from './components/react-bits/EvilEyeLayer'
import ClickSpark from './components/react-bits/ClickSpark'
import { ConfigNavButton } from './components/ConfigNavButton'

const PAGES = {
  campanha: Campanha,
  management: Management,
  emjogo: EmJogo,
  creation: Creation,
  dice: Dice,
  trash: Trash,
  config: Config,
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
    campanhaView = 'historia'
  }

  if (campanhaView === 'sessoes') {
    campanhaView = 'historia'
  }

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
  const [inApp, setInApp] = useState(false)
  const [welcomePhase, setWelcomePhase] = useState(() => (
    isWelcomeIntroSeen() ? 'home' : 'intro'
  ))
  const savedUi = loadUiState()
  const migrated = migrateUiState(savedUi)

  const [activePage, setActivePage] = useState(migrated.page)
  const [managementView, setManagementView] = useState(migrated.managementView)
  const [creationType, setCreationType] = useState(null)
  const [emjogoView, setEmjogoView] = useState(migrated.emjogoView)
  const [campanhaView, setCampanhaView] = useState(migrated.campanhaView)
  const [sidebarCollapsed] = useState(savedUi.sidebarCollapsed ?? false)

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
          : activePage === 'config'
            ? { onNavigate: handleNavigate, onBackToWelcome: () => { setWelcomePhase('home'); setInApp(false) } }
            : { onNavigate: handleNavigate }

  const shell = !inApp ? (
    <>
      <WelcomeScreen
        onEnter={() => setInApp(true)}
        initialPhase={welcomePhase}
      />
      <SaveToast />
    </>
  ) : (
    <div
      className="relative z-[1] flex h-screen w-screen flex-col overflow-hidden bg-transparent md:flex-row"
    >
      <Sidebar
        activePage={activePage}
        managementView={managementView}
        emjogoView={emjogoView}
        campanhaView={campanhaView}
        onNavigate={handleNavigate}
        footer={(
          <ConfigNavButton
            active={activePage === 'config'}
            onOpen={() => handleNavigate('config')}
          />
        )}
      />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-transparent">
        <PageComponent {...pageProps} />
      </main>
      <SaveToast />
    </div>
  )

  return (
    <ClickSpark sparkColor="#c4b5fd" sparkCount={9} sparkRadius={18} sparkSize={11} duration={420}>
      <EvilEyeLayer />
      {shell}
    </ClickSpark>
  )
}
