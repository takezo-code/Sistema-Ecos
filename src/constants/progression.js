export const MAX_LEVEL = 15
export const XP_PER_LEVEL_MULTIPLIER = 150

/** XP necessário para subir do nível atual ao próximo */
export function getXpRequiredForLevel(currentLevel) {
  if (currentLevel >= MAX_LEVEL) return null
  return currentLevel * XP_PER_LEVEL_MULTIPLIER
}

export function getLevelRewardType(newLevel) {
  if (newLevel <= 1) return null
  return newLevel % 2 === 0 ? 'attribute' : 'eco'
}

export const MAX_SKILL_TIER = 3

/** Custo em Ecos para subir um tier (T1→T2 e T2→T3 custam 1 cada) */
export function getSkillTierUpgradeCost(targetTier) {
  if (targetTier < 2 || targetTier > MAX_SKILL_TIER) return null
  return 1
}

/** Desbloquear habilidade aleatória */
export const ECO_UNLOCK_SKILL_COST = 1

/**
 * Bônus Ultra XP — fim de sessão (grupo inteiro).
 * Valores calibrados para nível×150: recompensa extra sem pular vários níveis de uma vez.
 */
export const SESSION_ULTRA_XP_TIERS = [
  {
    id: 'ruim',
    label: 'Sessão fraca',
    hint: 'Pouco avanço, cenas curtas ou interrupções',
    xp: 300,
    color: '#666',
  },
  {
    id: 'media',
    label: 'Sessão regular',
    hint: 'Ritmo bom, objetivos parcialmente cumpridos',
    xp: 550,
    color: '#d97706',
  },
  {
    id: 'boa',
    label: 'Sessão excelente',
    hint: 'Clímax, revelação forte ou marco na campanha',
    xp: 850,
    color: '#a855f7',
  },
]
