/**
 * Cada ponto de Ruptura = +1% na eficiência das habilidades de Eco.
 */
export function getRuptureBonusPercent(rupturePoints = 0) {
  return Math.max(0, Number(rupturePoints) || 0)
}

export function getEffectiveSkillPower(basePower, rupturePoints = 0, tier = 1, mentalMultiplier = 1) {
  const base = Number(basePower) || 0
  const tierMult = 1 + (tier - 1) * 0.15
  const ruptureMult = 1 + getRuptureBonusPercent(rupturePoints) / 100
  const mentalMult = Math.max(0, Number(mentalMultiplier) || 1)
  return Math.round(base * tierMult * ruptureMult * mentalMult)
}

export function formatRuptureBonus(rupturePoints = 0) {
  const pct = getRuptureBonusPercent(rupturePoints)
  return pct > 0 ? `+${pct}%` : '0%'
}
