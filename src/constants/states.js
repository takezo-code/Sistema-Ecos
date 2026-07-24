/** Atributos afetados por estado físico (Força, Destreza, Vitalidade) */
export const PHYSICAL_AFFECTED_KEYS = ['forca', 'destreza', 'vitalidade']

/**
 * Estados físicos do personagem (derivados das marcas de dano).
 * A cada 3 marcas avança um estado e aplica −1 FOR · DES · VIT (acumulativo).
 *   0–2  Estável       → −0
 *   3–5  Ferido        → −1
 *   6–8  Grave         → −2
 *   9+   Incapacitado  → −3
 */
export const PHYSICAL_STATES = [
  {
    value: 'bem',
    label: 'Estável',
    multiplier: 1.0,
    penaltyPercent: 0,
    attrPenalty: 0,
    color: '#16a34a',
    glow: 'rgba(22,163,74,0.2)',
    note: null,
  },
  {
    value: 'ferido',
    label: 'Ferido (−1)',
    multiplier: 1.0,
    penaltyPercent: 0,
    attrPenalty: 1,
    color: '#eab308',
    glow: 'rgba(234,179,8,0.15)',
    note: '−1 Força · Destreza · Vitalidade',
  },
  {
    value: 'grave',
    label: 'Grave (−2)',
    multiplier: 1.0,
    penaltyPercent: 0,
    attrPenalty: 2,
    color: '#ea580c',
    glow: 'rgba(234,88,12,0.18)',
    note: '−2 Força · Destreza · Vitalidade',
  },
  {
    value: 'incapacitado',
    label: 'Incapacitado (−3)',
    multiplier: 1.0,
    penaltyPercent: 0,
    attrPenalty: 3,
    color: '#991b1b',
    glow: 'rgba(153,27,27,0.25)',
    note: '−3 Força · Destreza · Vitalidade · combate limitado',
  },
]

/**
 * Estados mentais.
 * Ativados progressivamente pela Sobrecarga de Eco.
 * As penalidades de INT e Ruptura são calculadas em overloadPenalties.js.
 * O multiplier aqui afeta a eficácia narrativa/mecânica geral das habilidades de Eco.
 */
export const MENTAL_STATES = [
  {
    value: 'estavel',
    label: 'Estável',
    multiplier: 1.0,
    /** @deprecated use ecoPowerPenaltyPercent */
    penaltyPercent: 0,
    ecoPowerPenaltyPercent: 0,
    mentalAttrPenaltyPercent: 0,
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.15)',
    note: null,
    ecoFailureChance: 0,
    overloadRange: '0–4/5',
    narrativeConsequences: [],
  },
  {
    value: 'abalado',
    label: 'Abalado',
    multiplier: 0.95,
    penaltyPercent: 5,
    ecoPowerPenaltyPercent: 5,
    mentalAttrPenaltyPercent: 0,
    color: '#eab308',
    glow: 'rgba(234,179,8,0.12)',
    note: null,
    ecoFailureChance: 0,
    overloadRange: '5/5',
    narrativeConsequences: [
      'Dificuldade de foco',
      'Lapsos mentais leves',
      'Paranoia leve',
      'Tremores nas mãos',
      'Impulsividade crescente',
      'Fadiga psicológica',
    ],
  },
  {
    value: 'fragmentado',
    label: 'Fragmentado',
    multiplier: 0.90,
    penaltyPercent: 10,
    ecoPowerPenaltyPercent: 10,
    mentalAttrPenaltyPercent: 5,
    color: '#f97316',
    glow: 'rgba(249,115,22,0.15)',
    note: null,
    ecoFailureChance: 0.05,
    overloadRange: '6/5',
    narrativeConsequences: [
      'Pensamentos fragmentados',
      'Dificuldade de raciocínio complexo',
      'Memória de curto prazo comprometida',
      'Sensação de perda de controle',
      'Agressividade involuntária',
    ],
  },
  {
    value: 'dissociado',
    label: 'Dissociado',
    multiplier: 0.80,
    penaltyPercent: 20,
    ecoPowerPenaltyPercent: 20,
    mentalAttrPenaltyPercent: 10,
    color: '#dc2626',
    glow: 'rgba(220,38,38,0.18)',
    note: null,
    ecoFailureChance: 0.15,
    overloadRange: '7/5',
    narrativeConsequences: [
      'Desconexão com a realidade',
      'Incapacidade de distinguir memória e presente',
      'Ações involuntárias e automáticas',
      'Eco se manifesta sem controle intencional',
      'Fala incoerente sob pressão',
    ],
  },
  {
    value: 'perdido_no_tempo',
    label: 'Perdido no Tempo',
    multiplier: 0.20,
    penaltyPercent: 80,
    ecoPowerPenaltyPercent: 80,
    mentalAttrPenaltyPercent: 40,
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.22)',
    note: null,
    ecoFailureChance: 0.35,
    overloadRange: '9/5',
    glitch: true,
    narrativeConsequences: [
      'Consciência fragmentada no tempo',
      'Incapaz de diferenciar passado e presente',
      'Eco escapa sem intenção — perigo para aliados',
      'Respostas físicas desconectadas da mente',
      'A identidade começa a se dissolver',
    ],
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

/** Ordem crescente de gravidade do estado mental */
export const MENTAL_STATE_ORDER = MENTAL_STATES.map(s => s.value)

export function compareMentalSeverity(a, b) {
  return MENTAL_STATE_ORDER.indexOf(normalizeMentalState(a)) - MENTAL_STATE_ORDER.indexOf(normalizeMentalState(b))
}

/** Estado mental mínimo exigido pela sobrecarga de Eco (5→abalado, 6→fragmentado, 7→dissociado, 8+→perdido) */
export function getMentalStateFromEcoOverload(ecoOverload) {
  const n = Math.max(0, Number(ecoOverload) || 0)
  if (n >= 9) return 'perdido_no_tempo'
  if (n >= 7) return 'dissociado'
  if (n >= 6) return 'fragmentado'
  if (n >= 5) return 'abalado'
  return null
}

/** Mantém o estado mais grave entre o atual e o exigido pela sobrecarga */
export function mergeMentalStateWithOverload(currentMentalState, ecoOverload) {
  const required = getMentalStateFromEcoOverload(ecoOverload)
  if (!required) return normalizeMentalState(currentMentalState)
  const current = normalizeMentalState(currentMentalState)
  return compareMentalSeverity(current, required) >= 0 ? current : required
}

export function getMentalStateLabelForOverload(ecoOverload) {
  const state = getMentalStateFromEcoOverload(ecoOverload)
  if (!state) return null
  return getMentalStateOption(state).label
}
