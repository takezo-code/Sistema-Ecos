const OUTCOMES = {
  crit_fail: {
    label: 'Falha Crítica',
    desc: 'Algo dá terrivelmente errado. Consequência severa.',
    color: '#ef4444',
    bg: 'rgba(127,29,29,0.6)',
    border: 'rgba(239,68,68,0.4)',
    icon: '💀',
    key: 'crit_fail',
  },
  fail: {
    label: 'Falha',
    desc: 'Não alcançou a dificuldade.',
    color: '#f87171',
    bg: 'rgba(153,27,27,0.4)',
    border: 'rgba(248,113,113,0.3)',
    icon: '✕',
    key: 'fail',
  },
  partial: {
    label: 'Sucesso Parcial',
    desc: 'Quase lá — consegue com custo ou complicação.',
    color: '#fb923c',
    bg: 'rgba(124,45,18,0.45)',
    border: 'rgba(251,146,60,0.35)',
    icon: '◑',
    key: 'partial',
  },
  success: {
    label: 'Sucesso',
    desc: 'Alcançou a dificuldade. Ação clara.',
    color: '#4ade80',
    bg: 'rgba(20,83,45,0.45)',
    border: 'rgba(74,222,128,0.3)',
    icon: '✓',
    key: 'success',
  },
  crit: {
    label: 'Sucesso Crítico',
    desc: 'Face máxima e passou a CD. Resultado excepcional.',
    color: '#c084fc',
    bg: 'rgba(88,28,135,0.5)',
    border: 'rgba(192,132,252,0.4)',
    icon: '★',
    key: 'crit',
  },
}

/** Quantos pontos abaixo da CD ainda contam como parcial. */
export const PARTIAL_MARGIN = 3

/** CD padrão do sistema d20 (dificuldade média). */
export const DEFAULT_DC = 15

/**
 * Presets de dificuldade — escala clássica d20.
 */
export const DIFFICULTY_PRESETS = Object.freeze([
  { id: 'trivial', label: 'Trivial', dc: 5 },
  { id: 'easy', label: 'Fácil', dc: 10 },
  { id: 'medium', label: 'Médio', dc: 15 },
  { id: 'hard', label: 'Difícil', dc: 20 },
  { id: 'very_hard', label: 'Muito difícil', dc: 25 },
  { id: 'extreme', label: 'Extremo', dc: 30 },
])

export function getDefaultDc() {
  return DEFAULT_DC
}

export function getDcForPreset(presetId) {
  const preset = DIFFICULTY_PRESETS.find(p => p.id === presetId)
  return preset?.dc ?? getDefaultDc()
}

export function clampDc(dc) {
  const n = Math.max(1, Math.floor(Number(dc) || getDefaultDc()))
  return Math.min(40, n)
}

/**
 * Mesa tradicional: total (dado + bônus) contra uma CD.
 *
 * - Natural 1 → falha crítica
 * - Natural máximo e total ≥ CD → sucesso crítico
 * - total ≥ CD → sucesso
 * - total ≥ CD − 3 → sucesso parcial (quase passou)
 * - resto → falha
 *
 * @param {number} dice
 * @param {number} bonus
 * @param {number} [sides=20]
 * @param {number} [dc] dificuldade pedida pelo mestre
 */
export function getRollOutcome(dice, bonus, sides = 20, dc) {
  const total = dice + bonus
  const target = clampDc(dc ?? getDefaultDc())

  let outcome
  if (dice === 1) {
    outcome = OUTCOMES.crit_fail
  } else if (dice === sides && total >= target) {
    outcome = OUTCOMES.crit
  } else if (total >= target) {
    outcome = OUTCOMES.success
  } else if (total >= target - PARTIAL_MARGIN) {
    outcome = OUTCOMES.partial
  } else {
    outcome = OUTCOMES.fail
  }

  return {
    ...outcome,
    total,
    dc: target,
    margin: total - target,
  }
}

/** @deprecated mantido por compat. */
export function toD20Equivalent(dice, sides) {
  if (sides === 20) return dice
  if (dice <= 1) return 1
  if (dice >= sides) return 20
  return Math.round(1 + ((dice - 1) * 19) / (sides - 1))
}
