/** Resultado visual de rolagem d20 + bônus (clique nos atributos). */
export function getRollOutcome(dice, bonus) {
  const total = dice + bonus
  if (dice === 1) {
    return {
      label: 'Falha Crítica',
      desc: 'Algo dá terrivelmente errado. Consequência severa.',
      color: '#ef4444',
      bg: 'rgba(127,29,29,0.6)',
      border: 'rgba(239,68,68,0.4)',
      icon: '💀',
    }
  }
  if (total <= 9) {
    return {
      label: 'Falha',
      desc: 'A ação não funciona como esperado.',
      color: '#f87171',
      bg: 'rgba(153,27,27,0.4)',
      border: 'rgba(248,113,113,0.3)',
      icon: '✕',
    }
  }
  if (total <= 17) {
    return {
      label: 'Sucesso Parcial',
      desc: 'Consegue, mas há uma pequena consequência.',
      color: '#fb923c',
      bg: 'rgba(124,45,18,0.45)',
      border: 'rgba(251,146,60,0.35)',
      icon: '◑',
    }
  }
  if (dice === 20) {
    return {
      label: 'Sucesso Crítico',
      desc: 'Resultado excepcional. Além do esperado.',
      color: '#c084fc',
      bg: 'rgba(88,28,135,0.5)',
      border: 'rgba(192,132,252,0.4)',
      icon: '★',
    }
  }
  return {
    label: 'Sucesso',
    desc: 'A ação é realizada com clareza.',
    color: '#4ade80',
    bg: 'rgba(20,83,45,0.45)',
    border: 'rgba(74,222,128,0.3)',
    icon: '✓',
  }
}
