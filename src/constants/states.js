import { asSafeLimit } from './ecoOverload'

/** Atributos afetados por estado físico (Força, Destreza, Vitalidade) */
export const PHYSICAL_AFFECTED_KEYS = ['forca', 'destreza', 'vitalidade']

/** Rótulos usados nas linhas de penalidade — uma linha por atributo. */
export const PHYSICAL_PENALTY_LABELS = ['Força', 'Destreza', 'Vitalidade']
export const MENTAL_PENALTY_LABELS = ['Inteligência', 'Percepção', 'Sabedoria', 'Carisma']

/** `−2 Força` / `−2 Destreza` … — nunca `−2 Força · Destreza`. */
export function buildPenaltyLines(value, labels, extras = []) {
  const n = Math.max(0, Number(value) || 0)
  if (n <= 0) return [...extras]
  return [...labels.map(label => `−${n} ${label}`), ...extras]
}

function withNote(state, lines) {
  return { ...state, noteLines: lines, note: lines.length ? lines.join('\n') : null }
}

/**
 * Estados físicos do personagem (derivados das marcas de dano).
 * Thresholds base — a cada 4 marcas troca de estado (ver damageMarksEngine):
 *   0–4  Saudável      → −0
 *   5–9  Ferido        → −1
 *   10–14 Grave        → −2
 *   15+  Incapacitado  → −3
 *
 * Vitalidade (2 VIT base → +1 limiar) atrasa esses degraus — usa VIT de base.
 */
export const PHYSICAL_STATES = [
  withNote({
    value: 'bem',
    label: 'Saudável',
    multiplier: 1.0,
    penaltyPercent: 0,
    attrPenalty: 0,
    color: '#16a34a',
    glow: 'rgba(22,163,74,0.2)',
  }, []),
  withNote({
    value: 'ferido',
    label: 'Ferido',
    multiplier: 1.0,
    penaltyPercent: 0,
    attrPenalty: 1,
    color: '#eab308',
    glow: 'rgba(234,179,8,0.15)',
  }, []),
  withNote({
    value: 'grave',
    label: 'Grave',
    multiplier: 1.0,
    penaltyPercent: 0,
    attrPenalty: 2,
    color: '#ea580c',
    glow: 'rgba(234,88,12,0.18)',
  }, []),
  withNote({
    value: 'incapacitado',
    label: 'Incapacitado',
    multiplier: 1.0,
    penaltyPercent: 0,
    attrPenalty: 3,
    color: '#991b1b',
    glow: 'rgba(153,27,27,0.25)',
  }, []),
]

/**
 * Estados mentais.
 * Ativados progressivamente pela Sobrecarga de Eco.
 * Penalidade flat em INT · PER · SAB · CAR (não %).
 */
export const MENTAL_STATES = [
  withNote({
    value: 'estavel',
    label: 'Estável',
    multiplier: 1.0,
    penaltyPercent: 0,
    ecoPowerPenaltyPercent: 0,
    mentalAttrPenalty: 0,
    mentalAttrPenaltyPercent: 0,
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.15)',
    ecoFailureChance: 0,
    overloadRange: 'até o limite (inclusive)',
    narrativeConsequences: [],
  }, []),
  withNote({
    value: 'abalado',
    label: 'Abalado',
    multiplier: 1.0,
    penaltyPercent: 0,
    ecoPowerPenaltyPercent: 0,
    mentalAttrPenalty: 1,
    mentalAttrPenaltyPercent: 0,
    color: '#eab308',
    glow: 'rgba(234,179,8,0.12)',
    ecoFailureChance: 0,
    overloadRange: '1 acima',
    narrativeConsequences: [
      'Dificuldade de foco',
      'Lapsos mentais leves',
      'Paranoia leve',
      'Tremores nas mãos',
      'Impulsividade crescente',
      'Fadiga psicológica',
    ],
  }, []),
  withNote({
    value: 'fragmentado',
    label: 'Fragmentado',
    multiplier: 1.0,
    penaltyPercent: 0,
    ecoPowerPenaltyPercent: 0,
    mentalAttrPenalty: 2,
    mentalAttrPenaltyPercent: 0,
    color: '#f97316',
    glow: 'rgba(249,115,22,0.15)',
    ecoFailureChance: 0.05,
    overloadRange: '2 acima',
    narrativeConsequences: [
      'Pensamentos fragmentados',
      'Dificuldade de raciocínio complexo',
      'Memória de curto prazo comprometida',
      'Sensação de perda de controle',
      'Agressividade involuntária',
    ],
  }, []),
  withNote({
    value: 'dissociado',
    label: 'Dissociado',
    multiplier: 1.0,
    penaltyPercent: 0,
    ecoPowerPenaltyPercent: 0,
    mentalAttrPenalty: 3,
    mentalAttrPenaltyPercent: 0,
    color: '#dc2626',
    glow: 'rgba(220,38,38,0.18)',
    ecoFailureChance: 0.15,
    overloadRange: '3–4 acima',
    narrativeConsequences: [
      'Desconexão com a realidade',
      'Incapacidade de distinguir memória e presente',
      'Ações involuntárias e automáticas',
      'Eco se manifesta sem controle intencional',
      'Fala incoerente sob pressão',
    ],
  }, []),
  withNote({
    value: 'perdido_no_tempo',
    label: 'Perdido no Tempo',
    multiplier: 1.0,
    penaltyPercent: 0,
    ecoPowerPenaltyPercent: 0,
    mentalAttrPenalty: 4,
    mentalAttrPenaltyPercent: 0,
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.22)',
    ecoFailureChance: 0.35,
    overloadRange: '5+ acima',
    glitch: true,
    narrativeConsequences: [
      'Consciência fragmentada no tempo',
      'Incapaz de diferenciar passado e presente',
      'Eco escapa sem intenção — perigo para aliados',
      'Respostas físicas desconectadas da mente',
      'A identidade começa a se dissolver',
    ],
  }, []),
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

/** Estado mental mínimo exigido pela sobrecarga (relativo ao limite 5+RUP).
 * No limite (ex.: 9/9) ainda é Estável. Só sai de Estável ao ultrapassar (10/9 → Abalado). */
export function getMentalStateFromEcoOverload(ecoOverload, safeLimit = 5) {
  const n = Math.max(0, Number(ecoOverload) || 0)
  const lim = asSafeLimit(safeLimit)
  const overage = n - lim
  if (overage <= 0) return null
  if (overage >= 5) return 'perdido_no_tempo'
  if (overage >= 3) return 'dissociado'
  if (overage >= 2) return 'fragmentado'
  return 'abalado'
}

/** Mantém o estado mais grave entre o atual e o exigido pela sobrecarga */
export function mergeMentalStateWithOverload(currentMentalState, ecoOverload, safeLimit = 5) {
  const required = getMentalStateFromEcoOverload(ecoOverload, safeLimit)
  if (!required) return normalizeMentalState(currentMentalState)
  const current = normalizeMentalState(currentMentalState)
  return compareMentalSeverity(current, required) >= 0 ? current : required
}

export function getMentalStateLabelForOverload(ecoOverload, safeLimit = 5) {
  const state = getMentalStateFromEcoOverload(ecoOverload, safeLimit)
  if (!state) return null
  return getMentalStateOption(state).label
}
