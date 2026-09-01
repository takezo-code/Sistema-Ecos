import { chromium } from 'playwright'
import { spawn } from 'child_process'
import { copyFileSync, mkdirSync, readFileSync, unlinkSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, 'docs', 'screenshots')
const demoPath = join(root, 'public', 'demo', 'ecos-demo-screenshots.json')
const baseUrl = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:5173'
const PREFIX = 'rpg_master_'

const SHOTS = [
  { file: '02-campanha-historia.png', nav: 'História', wait: 1400 },
  { file: '04-criacao.png', nav: 'Criação', wait: 1200 },
  { file: '05-personagens.png', nav: 'Personagens', wait: 1400 },
  { file: '07-organizacao.png', nav: 'Organizações', wait: 1400 },
  { file: '08-ficha-tracado.png', nav: 'Ficha', wait: 1600 },
  { file: '11-combate.png', nav: 'Combate', wait: 2000 },
]

function buildStorageSeed(data) {
  return {
    campaigns: data.campaigns,
    active_campaign: data.activeCampaignId,
    characters: data.characters,
    groups: data.groups,
    npcs: data.npcs,
    organizations: data.organizations,
    narrative_events: data.events,
    dice_history: data.diceHistory || [],
    trash: data.trash || [],
    combat_session: data.combatSession,
    settings: data.settings || {},
    ui_state: {
      ...data.uiState,
      activePage: 'campanha',
      campanhaView: 'historia',
      sidebarCollapsed: false,
    },
    autosave_campaign: data,
    app_bootstrapped: true,
    welcome_intro_seen: true,
    character_panel: { selectedCharacterId: 'demo-char-kael', activeTab: 'profile' },
    skills_catalog_custom: data.skillsCatalog || [],
  }
}

async function waitForServer(url, timeout = 90_000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {
      // server still booting
    }
    await new Promise((r) => setTimeout(r, 400))
  }
  throw new Error(`Servidor não respondeu em ${url}`)
}

function startDevServer() {
  return spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173'], {
    cwd: root,
    shell: true,
    stdio: 'pipe',
  })
}

async function enterApp(page) {
  await page.getByRole('button', { name: /Carregar campanha/i }).click()
  await page.waitForTimeout(600)
  await page.getByRole('button', { name: /^Jogar$/i }).click()
  await page.waitForTimeout(1500)
}

async function captureScreenshots() {
  if (!existsSync(demoPath)) {
    throw new Error(`Demo não encontrada: ${demoPath}\nRode: npm run demo:export`)
  }

  const demo = JSON.parse(readFileSync(demoPath, 'utf-8'))
  const seed = buildStorageSeed(demo)

  mkdirSync(outDir, { recursive: true })

  const ownedServer = !process.env.SCREENSHOT_BASE_URL
  let devProc = null

  if (ownedServer) {
    devProc = startDevServer()
    await waitForServer(baseUrl)
  }

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
  })

  await context.addInitScript(({ storageSeed, storagePrefix }) => {
    for (const [key, value] of Object.entries(storageSeed)) {
      localStorage.setItem(storagePrefix + key, JSON.stringify(value))
    }
  }, { storageSeed: seed, storagePrefix: PREFIX })

  const page = await context.newPage()
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60_000 })
  await enterApp(page)

  for (const shot of SHOTS) {
    await page.getByRole('link', { name: shot.nav }).click()
    await page.waitForTimeout(shot.wait)
    await page.screenshot({
      path: join(outDir, shot.file),
      type: 'png',
      fullPage: false,
    })
    console.log(`✓ ${shot.file}`)
  }

  copyFileSync(join(root, 'public', 'logo.jpg'), join(outDir, 'logo.jpg'))

  for (const legacy of [
    '02-campanha-historia.jpg',
    '04-criacao.jpg',
    '05-personagens.jpg',
    '07-organizacao.jpg',
    '08-ficha-tracado.jpg',
    '11-combate.jpg',
  ]) {
    const legacyPath = join(outDir, legacy)
    if (existsSync(legacyPath)) unlinkSync(legacyPath)
  }

  await browser.close()
  if (devProc) devProc.kill('SIGTERM')

  console.log(`\nScreenshots salvas em ${outDir}`)
}

captureScreenshots().catch((err) => {
  console.error(err)
  process.exit(1)
})
