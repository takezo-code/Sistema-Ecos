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

export function getEcoSafeLimitFromEntity(entity) {
  return getEcoSafeLimit(entity?.attributes?.ruptura)
}

export function getEcoTotalRuptureThreshold(safeLimit = ECO_OVERLOAD_BASE_LIMIT) {
  return Math.max(ECO_OVERLOAD_BASE_LIMIT, Number(safeLimit) || ECO_OVERLOAD_BASE_LIMIT) + ECO_OVERLOAD_OVERAGE_TO_TOTAL
}

/** Usos acima do limite seguro (0 = ainda seguro). */
export function getOverloadOverage(overload = 0, safeLimit = ECO_OVERLOAD_BASE_LIMIT) {
  return Math.max(0, (Number(overload) || 0) - (Number(safeLimit) || ECO_OVERLOAD_BASE_LIMIT))
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
 * overage 0 no limite → Abalado (−1), tratado em getMentalAttributeFlatPenalty
 */
export const RUPTURE_BREAK_PENALTIES = Object.freeze({
  1: { mentalAttrFlat: 2 },
  2: { mentalAttrFlat: 3 },
  3: { mentalAttrFlat: 3 },
  4: { mentalAttrFlat: 4 },
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
      return Math.max(ECO_OVERLOAD_BASE_LIMIT, Number(rupturaOrOpts.safeLimit) || ECO_OVERLOAD_BASE_LIMIT)
    }
    if (rupturaOrOpts.attributes != null) {
      return getEcoSafeLimit(rupturaOrOpts.attributes.ruptura)
    }
    if (rupturaOrOpts.ruptura != null) {
      return getEcoSafeLimit(rupturaOrOpts.ruptura)
    }
  }
  return ECO_OVERLOAD_BASE_LIMIT
}

/** Segundo argumento numérico = limite seguro já calculado (não ruptura). */
export function asSafeLimit(limit) {
  return Math.max(ECO_OVERLOAD_BASE_LIMIT, Number(limit) || ECO_OVERLOAD_BASE_LIMIT)
}

export function getOverloadPhase(overload, safeLimit = ECO_OVERLOAD_BASE_LIMIT) {
  const n = Math.max(0, Number(overload) || 0)
  const lim = Math.max(ECO_OVERLOAD_BASE_LIMIT, Number(safeLimit) || ECO_OVERLOAD_BASE_LIMIT)
  const totalAt = getEcoTotalRuptureThreshold(lim)
  if (n >= totalAt) return ECO_OVERLOAD_PHASES.TOTAL
  if (n > lim) return ECO_OVERLOAD_PHASES.RUPTURE
  if (n >= lim) return ECO_OVERLOAD_PHASES.SHAKEN
  return ECO_OVERLOAD_PHASES.STABLE
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
