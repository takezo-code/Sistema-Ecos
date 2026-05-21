const PREFIX = 'rpg_master_'

let onSetListeners = []

export const storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
      onSetListeners.forEach(fn => {
        try { fn(key, value) } catch (e) { console.error('[storage listener]', e) }
      })
    } catch (e) {
      console.error('Storage error:', e)
      if (e?.name === 'QuotaExceededError') {
        console.error('LocalStorage cheio. Exporte e limpe dados antigos.')
      }
    }
  },

  onSet(listener) {
    onSetListeners.push(listener)
    return () => {
      onSetListeners = onSetListeners.filter(l => l !== listener)
    }
  },

  remove(key) {
    localStorage.removeItem(PREFIX + key)
  },

  clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k))
  },
}

export const KEYS = {
  campaigns: 'campaigns',
  activeCampaign: 'active_campaign',
  npcs: 'npcs',
  organizations: 'organizations',
  characters: 'characters',
  sessions: 'sessions',
  narrative: 'narrative_events',
  diceHistory: 'dice_history',
  groups: 'groups',
  settings: 'settings',
  uiState: 'ui_state',
  autosave: 'autosave_campaign',
  autosaveAt: 'autosave_at',
  appBootstrapped: 'app_bootstrapped',
  skillsCatalog: 'skills_catalog_custom',
  combatSession: 'combat_session',
  sceneSession: 'scene_session',
  trash: 'trash',
  equipment: 'equipment_catalog',
}
