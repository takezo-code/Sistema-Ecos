/**
 * Catálogo de estados mentais ativos (efeitos empilháveis além do mentalState base).
 * Expansível: registre novos efeitos e aplique via mentalStatusService.
 */
export const MENTAL_STATUS_SOURCES = Object.freeze({
  ECO_OVERLOAD: 'eco_overload',
  MASTER: 'master',
  NARRATIVE: 'narrative',
})

export const MENTAL_STATUS_EFFECTS = Object.freeze({
  mentalmente_abalado: {
    id: 'mentalmente_abalado',
    label: 'Mentalmente Abalado',
    source: MENTAL_STATUS_SOURCES.ECO_OVERLOAD,
    color: '#eab308',
    overloadTrigger: 5,
    narrativeConsequences: [
      'Dificuldade de foco',
      'Tremores involuntários',
      'Lapsos mentais',
      'Paranoia leve',
      'Impulsividade',
      'Exaustão psicológica',
    ],
    modifiers: { ecoPowerPenalty: 5 },
  },

  ruptura_fragmentada: {
    id: 'ruptura_fragmentada',
    label: 'Ruptura Fragmentada',
    source: MENTAL_STATUS_SOURCES.ECO_OVERLOAD,
    color: '#f97316',
    overloadTrigger: 6,
    narrativeConsequences: [
      'Pensamentos fragmentados',
      'Raciocínio comprometido',
      'Memória de curto prazo instável',
      'Agressividade involuntária',
    ],
    modifiers: { ecoPowerPenalty: 10, intPenalty: 5, rupturePenalty: 5 },
  },

  dissociacao_mental: {
    id: 'dissociacao_mental',
    label: 'Dissociação Mental',
    source: MENTAL_STATUS_SOURCES.ECO_OVERLOAD,
    color: '#dc2626',
    overloadTrigger: 7,
    narrativeConsequences: [
      'Desconexão severa com a realidade',
      'Eco se manifesta sem controle',
      'Fala incoerente sob pressão',
      'Ações automáticas e involuntárias',
    ],
    modifiers: { ecoPowerPenalty: 20, intPenalty: 10, rupturePenalty: 10 },
  },

  colapso_iminente: {
    id: 'colapso_iminente',
    label: 'Colapso Iminente',
    source: MENTAL_STATUS_SOURCES.ECO_OVERLOAD,
    color: '#a855f7',
    overloadTrigger: 9,
    narrativeConsequences: [
      'Identidade se dissolve',
      'Passado e presente se confundem',
      'Eco escapa sem intenção — risco a aliados',
      'Um passo antes da Ruptura Total',
    ],
    modifiers: { ecoPowerPenalty: 80, intPenalty: 40, rupturePenalty: 40 },
  },
})

export function getMentalStatusEffect(effectId) {
  return MENTAL_STATUS_EFFECTS[effectId] || null
}
