/** Exibição padrão da barra de sobrecarga (0–5 estável, 6+ ruptura) */
export const ECO_OVERLOAD_DISPLAY_CAP = 5

/** Nível em que dispara Ruptura Total */
export const ECO_OVERLOAD_RUPTURE_TOTAL = 10

/** Ao atingir este valor, aplica status Mentalmente Abalado */
export const ECO_OVERLOAD_SHAKEN_THRESHOLD = 5

/** A partir deste valor entra em fase de Ruptura de Eco */
export const ECO_OVERLOAD_RUPTURE_PHASE_START = 6

export const ECO_OVERLOAD_PHASES = Object.freeze({
  STABLE: 'stable',
  SHAKEN: 'shaken',
  RUPTURE: 'rupture',
  TOTAL: 'total',
})

/** Penalidade de poder Eco por nível dentro do limite (1–5): −1% por nível */
export function getStableEcoPenaltyPercent(overload) {
  const level = Math.max(0, Math.min(ECO_OVERLOAD_DISPLAY_CAP, Number(overload) || 0))
  return level
}

/**
 * Atributos mentais afetados pela Sobrecarga de Eco (6/5+).
 * Força, Destreza e Vitalidade são afetados apenas pelo estado físico/marcas
 * (−1 / −2 / −3 flat conforme Ferido / Grave / Incapacitado).
 */
export const MENTAL_ATTR_KEYS = Object.freeze(['inteligencia', 'ruptura'])

/**
 * Penalidades ao ultrapassar 5/5.
 *
 * ecoPercent      — reduz poder/eficácia das habilidades de Eco
 * mentalAttrPercent — reduz Inteligência e Ruptura diretamente
 *
 * Atributos físicos (Força/Destreza/Vitalidade) NÃO são afetados pela sobrecarga mental.
 */
export const RUPTURE_BREAK_PENALTIES = Object.freeze({
  6:  { ecoPercent: 10,  mentalAttrPercent: 5  },
  7:  { ecoPercent: 20,  mentalAttrPercent: 10 },
  8:  { ecoPercent: 40,  mentalAttrPercent: 20 },
  9:  { ecoPercent: 80,  mentalAttrPercent: 40 },
  10: { ecoPercent: 100, mentalAttrPercent: 100, isTotal: true },
})

/** @deprecated use mentalAttrPercent — mantido para compatibilidade legada */
export function legacyAttributePercent(overload) {
  const n = Math.max(0, Math.min(10, Number(overload) || 0))
  return RUPTURE_BREAK_PENALTIES[n]?.mentalAttrPercent ?? 0
}

export function getOverloadPhase(overload) {
  const n = Math.max(0, Number(overload) || 0)
  if (n >= ECO_OVERLOAD_RUPTURE_TOTAL) return ECO_OVERLOAD_PHASES.TOTAL
  if (n >= ECO_OVERLOAD_RUPTURE_PHASE_START) return ECO_OVERLOAD_PHASES.RUPTURE
  if (n >= ECO_OVERLOAD_SHAKEN_THRESHOLD) return ECO_OVERLOAD_PHASES.SHAKEN
  return ECO_OVERLOAD_PHASES.STABLE
}

export function formatOverloadDisplay(overload) {
  const n = Math.max(0, Number(overload) || 0)
  return `${n}/${ECO_OVERLOAD_DISPLAY_CAP}`
}

export function isInRupturePhase(overload) {
  return (Number(overload) || 0) >= ECO_OVERLOAD_RUPTURE_PHASE_START
}
