/** Limite base de usos de Eco sem consequência (Ruptura 0). */
export const ECO_OVERLOAD_BASE_LIMIT = 5

/** Ruptura máxima no atributo → limite seguro sobe até 15. */
export const ECO_OVERLOAD_MAX_RUPTURA_BONUS = 10

/** Quantos usos acima do limite até Ruptura Total. */
export const ECO_OVERLOAD_OVERAGE_TO_TOTAL = 5

/** @deprecated use getEcoSafeLimit(ruptura) — mantido como base */
export const ECO_OVERLOAD_DISPLAY_CAP = ECO_OVERLOAD_BASE_LIMIT

/** @deprecated use getEcoTotalRuptureThreshold(safeLimit) */
export const ECO_OVERLOAD_RUPTURE_TOTAL = ECO_OVERLOAD_BASE_LIMIT + ECO_OVERLOAD_OVERAGE_TO_TOTAL

/** @deprecated limiar relativo — use getEcoSafeLimit */
export const ECO_OVERLOAD_SHAKEN_THRESHOLD = ECO_OVERLOAD_BASE_LIMIT

/** @deprecated use safeLimit + 1 */
export const ECO_OVERLOAD_RUPTURE_PHASE_START = ECO_OVERLOAD_BASE_LIMIT + 1

export const ECO_OVERLOAD_PHASES = Object.freeze({
  STABLE: 'stable',
  SHAKEN: 'shaken',
  RUPTURE: 'rupture',
  TOTAL: 'total',
})

/**
 * Limite seguro de sobrecarga = 5 + Ruptura (máx. 15).
 * Dentro do limite: sem redução de atributos.
 */
export function getEcoSafeLimit(ruptura = 0) {
  const r = Math.max(0, Math.min(ECO_OVERLOAD_MAX_RUPTURA_BONUS, Number(ruptura) || 0))
  return ECO_OVERLOAD_BASE_LIMIT + r
}

function isRupturaUsesPassive(passive, item) {
  if (!passive) return false
  if (passive.kind === 'ruptura_uses') return true
  if (passive.kind) return false
  const slot = Number(passive.slot)
  if (item?.category === 'armadura' && slot === 3) return true
  if (item?.category === 'arma' && slot === 2) return true
  return false
}

/**
 * Pool de usos no card: 5 de base + 1 por ponto de Ruptura da ficha
 * + usos da arma + usos da armadura.
 */
export function getRupturaPool(entity = {}) {
  const attr = Math.max(0, Number(entity?.attributes?.ruptura) || 0)
  const base = ECO_OVERLOAD_BASE_LIMIT + attr
  let weapon = 0
  let armor = 0
  const list = Array.isArray(entity?.equipped) ? entity.equipped : []
  for (const item of list) {
    const passives = Array.isArray(item?.passives) ? item.passives : []
    const isArmor = item?.category === 'armadura'
    for (const p of passives) {
      if (!p || !isRupturaUsesPassive(p, item)) continue
      const value = Math.max(0, Number(p.value) || 0)
      if (isArmor) armor += value
      else weapon += value
    }
  }
  const max = base + weapon + armor
  const spent = Math.max(0, Number(entity?.ecoOverload) || 0)
  return { base, attr, weapon, armor, max, spent }
}

export function formatRupturaPoolSources(pool = {}) {
  return [
    pool.base > 0 ? `base ${pool.base}` : null,
    pool.weapon > 0 ? `arma +${pool.weapon}` : null,
    pool.armor > 0 ? `armadura +${pool.armor}` : null,
  ].filter(Boolean).join(' · ')
}

/** Limite do contador = soma de todas as fontes de Ruptura da entidade. */
export function getEcoSafeLimitFromEntity(entity) {
  return getRupturaPool(entity).max
}

export function getEcoTotalRuptureThreshold(safeLimit = 0) {
  return Math.max(0, Number(safeLimit) || 0) + ECO_OVERLOAD_OVERAGE_TO_TOTAL
}

/** Usos acima do limite seguro (0 = ainda seguro). */
export function getOverloadOverage(overload = 0, safeLimit = 0) {
  return Math.max(0, (Number(overload) || 0) - Math.max(0, Number(safeLimit) || 0))
}

/**
 * Atributos reduzidos ao passar do limite:
 * INT (físico) · PER · SAB · CAR (cena). Ruptura NÃO é penalizada.
 */
export const OVERLOAD_ATTR_KEYS = Object.freeze([
  'inteligencia',
  'percepcao',
  'sabedoria',
  'carisma',
])

/** Subconjunto no grid físico */
export const MENTAL_ATTR_KEYS = Object.freeze(['inteligencia'])

/** Subconjunto no grid de cena */
export const OVERLOAD_SOCIAL_ATTR_KEYS = Object.freeze([
  'percepcao',
  'sabedoria',
  'carisma',
])

/**
 * Penalidades por excesso acima do limite (overage).
 * mentalAttrFlat — −INT · PER · SAB · CAR
 * overage 0 no limite → ainda Estável (sem penalidade)
 * overage 1 (ex.: 10/9) → Abalado (−1)
 */
export const RUPTURE_BREAK_PENALTIES = Object.freeze({
  1: { mentalAttrFlat: 1 },
  2: { mentalAttrFlat: 2 },
  3: { mentalAttrFlat: 3 },
  4: { mentalAttrFlat: 3 },
  5: { mentalAttrFlat: 4, isTotal: true },
})

/** Resolve safeLimit a partir de entidade / { safeLimit } / { ruptura } / número (ruptura). */
export function resolveEcoSafeLimit(rupturaOrOpts) {
  if (rupturaOrOpts == null) return ECO_OVERLOAD_BASE_LIMIT
  if (typeof rupturaOrOpts === 'number') {
    return getEcoSafeLimit(rupturaOrOpts)
  }
  if (typeof rupturaOrOpts === 'object') {
    if (rupturaOrOpts.safeLimit != null) {
      return Math.max(0, Number(rupturaOrOpts.safeLimit) || 0)
    }
    if (rupturaOrOpts.attributes != null || Array.isArray(rupturaOrOpts.equipped)) {
      return getEcoSafeLimitFromEntity(rupturaOrOpts)
    }
    if (rupturaOrOpts.ruptura != null) {
      return getEcoSafeLimit(rupturaOrOpts.ruptura)
    }
  }
  return ECO_OVERLOAD_BASE_LIMIT
}

/** Segundo argumento numérico = limite seguro já calculado (não ruptura). */
export function asSafeLimit(limit) {
  return Math.max(0, Number(limit) || 0)
}

export function getOverloadPhase(overload, safeLimit = 0) {
  const n = Math.max(0, Number(overload) || 0)
  const lim = Math.max(0, Number(safeLimit) || 0)
  if (n <= lim) return ECO_OVERLOAD_PHASES.STABLE
  const totalAt = getEcoTotalRuptureThreshold(lim)
  if (n >= totalAt) return ECO_OVERLOAD_PHASES.TOTAL
  if (n > lim + 1) return ECO_OVERLOAD_PHASES.RUPTURE
  return ECO_OVERLOAD_PHASES.SHAKEN
}

export function formatOverloadDisplay(overload, rupturaOrOpts) {
  const n = Math.max(0, Number(overload) || 0)
  const lim = resolveEcoSafeLimit(rupturaOrOpts)
  return `${n}/${lim}`
}

export function isInRupturePhase(overload, safeLimit = ECO_OVERLOAD_BASE_LIMIT) {
  return getOverloadPhase(overload, safeLimit) === ECO_OVERLOAD_PHASES.RUPTURE
    || getOverloadPhase(overload, safeLimit) === ECO_OVERLOAD_PHASES.TOTAL
}

/** @deprecated sem uso no modelo novo (sem −% dentro do limite) */
export function getStableEcoPenaltyPercent() {
  return 0
}
