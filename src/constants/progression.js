export const MAX_LEVEL = 20
export const MAX_SOCIAL_LEVEL = 15
export const XP_PER_LEVEL_MULTIPLIER = 150

/** XP necessário para subir do nível atual ao próximo */
export function getXpRequiredForLevel(currentLevel) {
  if (currentLevel >= MAX_LEVEL) return null
  return currentLevel * XP_PER_LEVEL_MULTIPLIER
}

/**
 * Recompensa de atributo ao subir de nível.
 * Eco é concedido à parte (1 por nível) — ver applyXpGain.
 */
export function getLevelRewardType(newLevel, { hasEcoPowers = true } = {}) {
  if (newLevel <= 1) return null
  if (!hasEcoPowers) return 'attribute'
  return newLevel % 2 === 0 ? 'attribute' : null
}

/**
 * Pontos sociais ganhos por nível: +1 por nível de 2 a 15.
 * Após nível 15, nenhum ponto social adicional.
 */
export function getSocialPointsFromLevel(level) {
  const l = Math.max(1, level)
  return Math.max(0, Math.min(l - 1, MAX_SOCIAL_LEVEL - 1))
}

/** Nível máximo absoluto da skill (Eco + graus com item) */
export const MAX_SKILL_TIER = 5

/** Com Eco dá para subir até este nível (1–4). */
export const ECO_SKILL_MAX_LEVEL = 4

/** A partir daqui a skill entra em grau — só sobe com item do mercador. */
export const SKILL_GRADE_START_LEVEL = 5

/** Custo em Eco para +1 nível (só até ECO_SKILL_MAX_LEVEL) */
export const ECO_SKILL_POINT_COST = 1

/** @deprecated use ECO_SKILL_POINT_COST */
export const ECO_UNLOCK_SKILL_COST = ECO_SKILL_POINT_COST

export const MAX_CLASS_SKILL_LEVEL = MAX_SKILL_TIER

export function isSkillGradeLevel(level) {
  return Math.max(0, Number(level) || 0) >= SKILL_GRADE_START_LEVEL
}

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
