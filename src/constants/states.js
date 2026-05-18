/** Atributos afetados por estado físico */
export const PHYSICAL_AFFECTED_KEYS = ['forca', 'destreza', 'vitalidade']

export const PHYSICAL_STATES = [
  {
    value: 'bem',
    label: 'Bem',
    multiplier: 1.0,
    penaltyPercent: 0,
    color: '#16a34a',
    glow: 'rgba(22,163,74,0.2)',
    note: null,
  },
  {
    value: 'ferido',
    label: 'Ferido',
    multiplier: 0.9,
    penaltyPercent: 10,
    color: '#eab308',
    glow: 'rgba(234,179,8,0.15)',
    note: null,
  },
  {
    value: 'grave',
    label: 'Grave',
    multiplier: 0.75,
    penaltyPercent: 25,
    color: '#ea580c',
    glow: 'rgba(234,88,12,0.18)',
    note: null,
  },
  {
    value: 'incapacitado',
    label: 'Incapacitado',
    multiplier: 0.5,
    penaltyPercent: 50,
    color: '#991b1b',
    glow: 'rgba(153,27,27,0.25)',
    note: 'Combate limitado · movimentação restrita',
  },
]

export const MENTAL_STATES = [
  {
    value: 'estavel',
    label: 'Estável',
    multiplier: 1.0,
    penaltyPercent: 0,
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.15)',
    note: null,
    ecoFailureChance: 0,
  },
  {
    value: 'abalado',
    label: 'Abalado',
    multiplier: 0.9,
    penaltyPercent: 10,
    color: '#eab308',
    glow: 'rgba(234,179,8,0.12)',
    note: null,
    ecoFailureChance: 0,
  },
  {
    value: 'fragmentado',
    label: 'Fragmentado',
    multiplier: 0.75,
    penaltyPercent: 25,
    color: '#f97316',
    glow: 'rgba(249,115,22,0.15)',
    note: null,
    ecoFailureChance: 0.05,
  },
  {
    value: 'dissociado',
    label: 'Dissociado',
    multiplier: 0.5,
    penaltyPercent: 50,
    color: '#dc2626',
    glow: 'rgba(220,38,38,0.18)',
    note: null,
    ecoFailureChance: 0.15,
  },
  {
    value: 'perdido_no_tempo',
    label: 'Perdido no Tempo',
    multiplier: 0.3,
    penaltyPercent: 70,
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.22)',
    note: 'Ecos instáveis · falhas e efeitos colaterais possíveis',
    ecoFailureChance: 0.35,
    glitch: true,
  },
]

const LEGACY_CONDITION_MAP = {
  bem: 'bem',
  ferido: 'ferido',
  grave: 'grave',
  incapacitado: 'incapacitado',
}

export function normalizePhysicalState(value) {
  if (!value) return 'bem'
  const key = String(value).toLowerCase().replace(/\s+/g, '_')
  if (PHYSICAL_STATES.some(s => s.value === key)) return key
  return LEGACY_CONDITION_MAP[key] || 'bem'
}

export function normalizeMentalState(value) {
  if (!value) return 'estavel'
  const key = String(value).toLowerCase().replace(/\s+/g, '_')
  if (MENTAL_STATES.some(s => s.value === key)) return key
  if (key === 'perdido_no_tempo' || key === 'perdido') return 'perdido_no_tempo'
  return 'estavel'
}

export function getPhysicalStateOption(value) {
  return PHYSICAL_STATES.find(s => s.value === normalizePhysicalState(value)) || PHYSICAL_STATES[0]
}

export function getMentalStateOption(value) {
  return MENTAL_STATES.find(s => s.value === normalizeMentalState(value)) || MENTAL_STATES[0]
}
