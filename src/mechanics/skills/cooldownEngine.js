/** Cooldowns por templateId: { [templateId]: turnos restantes } */

export function normalizeSkillCooldowns(cooldowns = {}) {
  if (!cooldowns || typeof cooldowns !== 'object') return {}
  const next = {}
  Object.entries(cooldowns).forEach(([key, val]) => {
    const n = Math.max(0, Number(val) || 0)
    if (n > 0) next[key] = n
  })
  return next
}

export function getCooldownRemaining(cooldowns, templateId) {
  return Math.max(0, Number(normalizeSkillCooldowns(cooldowns)[templateId]) || 0)
}

export function isOnCooldown(cooldowns, templateId) {
  return getCooldownRemaining(cooldowns, templateId) > 0
}

export function setCooldown(cooldowns, templateId, turns) {
  const next = { ...normalizeSkillCooldowns(cooldowns) }
  const n = Math.max(0, Number(turns) || 0)
  if (n <= 0) {
    delete next[templateId]
  } else {
    next[templateId] = n
  }
  return next
}

/** Reduz 1 turno em todos os cooldowns ativos */
export function tickCooldowns(cooldowns) {
  const next = {}
  Object.entries(normalizeSkillCooldowns(cooldowns)).forEach(([key, val]) => {
    const remaining = Math.max(0, val - 1)
    if (remaining > 0) next[key] = remaining
  })
  return next
}

export function clearAllCooldowns() {
  return {}
}
