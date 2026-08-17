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
 * Eco é concedido à parte — ver applyXpGain / getEcoPointsFromLevel.
 */
export function getLevelRewardType(newLevel) {
  if (newLevel <= 1) return null
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

/**
 * Skills de classe: 3 skills × até nv.3 com Eco.
 * 1 Eco = +1 nível → 3 Ecos deixam uma skill no máximo.
 * Sem graus / catalisador.
 */
export const MAX_SKILL_TIER = 3

/** Com Eco sobe até este nível (1–3). */
export const ECO_SKILL_MAX_LEVEL = 3

/** Grau desativado (máximo = 3 só com Eco). */
export const SKILL_GRADE_START_LEVEL = 4

/** Custo em Eco para +1 nível (só até ECO_SKILL_MAX_LEVEL) */
export const ECO_SKILL_POINT_COST = 1

/** @deprecated use ECO_SKILL_POINT_COST */
export const ECO_UNLOCK_SKILL_COST = ECO_SKILL_POINT_COST

export const MAX_CLASS_SKILL_LEVEL = MAX_SKILL_TIER

/**
 * Orçamento total de Eco (= 3 skills × nv.3).
 * Completo no nível 15 — ver getEcoPointsFromLevel.
 */
export const MAX_ECO_POINTS = 9

/** Nível em que o orçamento de Eco fica completo (todas as skills maxáveis). */
export const ECO_COMPLETE_LEVEL = 15

/**
 * Ecos totais ganhos até este nível.
 *
 *   nv.1          → 1 (criação)
 *   pares 2–14    → +1 cada (7)
 *   nv.15         → +1 marco
 *   total no 15   → 9 (congela depois)
 */
export function getEcoPointsFromLevel(level) {
  const l = Math.max(1, Math.min(MAX_LEVEL, Number(level) || 1))
  if (l <= 1) return 1
  const fromEvens = Math.floor(Math.min(l, ECO_COMPLETE_LEVEL - 1) / 2)
  const milestone = l >= ECO_COMPLETE_LEVEL ? 1 : 0
  return Math.min(MAX_ECO_POINTS, 1 + fromEvens + milestone)
}

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
