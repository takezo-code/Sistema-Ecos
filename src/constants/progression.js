export const MAX_LEVEL = 20
export const MAX_SOCIAL_LEVEL = 15
export const XP_PER_LEVEL_MULTIPLIER = 150

/** XP necessário para subir do nível atual ao próximo */
export function getXpRequiredForLevel(currentLevel) {
  if (currentLevel >= MAX_LEVEL) return null
  return currentLevel * XP_PER_LEVEL_MULTIPLIER
}

/** @param {{ hasEcoPowers?: boolean }} options — false: só pontos de atributo em cada nível */
export function getLevelRewardType(newLevel, { hasEcoPowers = true } = {}) {
  if (newLevel <= 1) return null
  if (!hasEcoPowers) return 'attribute'
  return newLevel % 2 === 0 ? 'attribute' : 'eco'
}

/**
 * Pontos sociais ganhos por nível: +1 por nível de 2 a 15.
 * Após nível 15, nenhum ponto social adicional.
 */
export function getSocialPointsFromLevel(level) {
  const l = Math.max(1, level)
  return Math.max(0, Math.min(l - 1, MAX_SOCIAL_LEVEL - 1))
}

export const MAX_SKILL_TIER = 3

/** Descobrir habilidade aleatória (1 Eco) */
export const ECO_UNLOCK_SKILL_COST = 1

/**
 * Bônus Ultra XP — fim de sessão (grupo inteiro).
 * Valores calibrados para nível×150: recompensa extra sem pular vários níveis de uma vez.
 */
/** Bônus pontual no combate (bom desempenho em ação/ataque) — mestre concede manualmente */
export const COMBAT_HIGHLIGHT_XP = 50

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
