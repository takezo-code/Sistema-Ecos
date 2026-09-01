import { storage, KEYS } from './storage'

export function isWelcomeIntroSeen() {
  return storage.get(KEYS.welcomeIntroSeen) === true
}

export function markWelcomeIntroSeen() {
  storage.set(KEYS.welcomeIntroSeen, true)
}
