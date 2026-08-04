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

/** CD padrão por tipo de dado (dificuldade média). */
export const DEFAULT_DC_BY_SIDES = Object.freeze({
  8: 6,
  20: 15,
})

/**
 * Presets de dificuldade — mesa tradicional.
 * d20: escala clássica · d8: ~40% da escala d20 (mesmo “nível” de desafio).
 */
export const DIFFICULTY_PRESETS = Object.freeze([
  { id: 'trivial', label: 'Trivial', dc20: 5, dc8: 3 },
  { id: 'easy', label: 'Fácil', dc20: 10, dc8: 4 },
  { id: 'medium', label: 'Médio', dc20: 15, dc8: 6 },
  { id: 'hard', label: 'Difícil', dc20: 20, dc8: 8 },
  { id: 'very_hard', label: 'Muito difícil', dc20: 25, dc8: 10 },
  { id: 'extreme', label: 'Extremo', dc20: 30, dc8: 12 },
])

export function getDefaultDc(sides = 20) {
  return DEFAULT_DC_BY_SIDES[sides] ?? DEFAULT_DC_BY_SIDES[20]
}

export function getDcForPreset(presetId, sides = 20) {
  const preset = DIFFICULTY_PRESETS.find(p => p.id === presetId)
  if (!preset) return getDefaultDc(sides)
  return sides === 8 ? preset.dc8 : preset.dc20
}

export function clampDc(dc, sides = 20) {
  const n = Math.max(1, Math.floor(Number(dc) || getDefaultDc(sides)))
  const max = sides === 8 ? 16 : 40
  return Math.min(max, n)
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
  const target = clampDc(dc ?? getDefaultDc(sides), sides)

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

/** Dano automático do ataque do boss conforme o resultado da rolagem. */
export function getBossAttackDamage(outcomeKey) {
  switch (outcomeKey) {
    case 'partial':
      return { markType: 'leve', label: 'Leve', value: 1 }
    case 'success':
      return { markType: 'medio', label: 'Médio', value: 2 }
    case 'crit':
      return { markType: 'grave', label: 'Grave', value: 3 }
    case 'crit_fail':
      return { markType: null, label: null, value: 0, bossExpose: true }
    default:
      return { markType: null, label: null, value: 0 }
  }
}
