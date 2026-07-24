/** Mapeia a face do dado para a escala d20 (mantém as faixas de sucesso/falha). */
function toD20Equivalent(dice, sides) {
  if (sides === 20) return dice
  if (dice <= 1) return 1
  if (dice >= sides) return 20
  return Math.round(1 + ((dice - 1) * 19) / (sides - 1))
}

/**
 * Resultado visual de rolagem (d6 ou d20) + bônus.
 * Faixas (na escala d20): ≤9 falha · ≤17 parcial · acima sucesso · face máxima = crítico.
 */
export function getRollOutcome(dice, bonus, sides = 20) {
  const equivDice = toD20Equivalent(dice, sides)
  const equivTotal = equivDice + bonus

  if (dice === 1) {
    return {
      label: 'Falha Crítica',
      desc: 'Algo dá terrivelmente errado. Consequência severa.',
      color: '#ef4444',
      bg: 'rgba(127,29,29,0.6)',
      border: 'rgba(239,68,68,0.4)',
      icon: '💀',
      key: 'crit_fail',
    }
  }
  if (equivTotal <= 9) {
    return {
      label: 'Falha',
      desc: 'A ação não funciona como esperado.',
      color: '#f87171',
      bg: 'rgba(153,27,27,0.4)',
      border: 'rgba(248,113,113,0.3)',
      icon: '✕',
      key: 'fail',
    }
  }
  if (equivTotal <= 17) {
    return {
      label: 'Sucesso Parcial',
      desc: 'Consegue, mas há uma pequena consequência.',
      color: '#fb923c',
      bg: 'rgba(124,45,18,0.45)',
      border: 'rgba(251,146,60,0.35)',
      icon: '◑',
      key: 'partial',
    }
  }
  if (dice === sides) {
    return {
      label: 'Sucesso Crítico',
      desc: 'Resultado excepcional. Além do esperado.',
      color: '#c084fc',
      bg: 'rgba(88,28,135,0.5)',
      border: 'rgba(192,132,252,0.4)',
      icon: '★',
      key: 'crit',
    }
  }
  return {
    label: 'Sucesso',
    desc: 'A ação é realizada com clareza.',
    color: '#4ade80',
    bg: 'rgba(20,83,45,0.45)',
    border: 'rgba(74,222,128,0.3)',
    icon: '✓',
    key: 'success',
  }
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
