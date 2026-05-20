import { storage, KEYS } from './storage'
import { purgeCustomSkillsCatalog } from './skillsCatalogService'

const WIPE_FLAG = 'system_all_skills_removed_v1'

function stripEntitySkillsInStorage() {
  for (const key of [KEYS.characters, KEYS.npcs]) {
    const list = storage.get(key)
    if (!Array.isArray(list)) continue
    storage.set(key, list.map(entity => ({ ...entity, skills: [] })))
  }
}

/** Limpa catálogo custom e skills nas fichas salvas (executa uma vez por navegador) */
export function runSkillsSystemWipeIfNeeded() {
  if (storage.get(WIPE_FLAG)) return false
  purgeCustomSkillsCatalog()
  stripEntitySkillsInStorage()
  storage.set(WIPE_FLAG, true)
  return true
}

runSkillsSystemWipeIfNeeded()
