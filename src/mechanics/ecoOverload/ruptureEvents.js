/**
 * Eventos de Ruptura Total (10/5) — resultados críticos flexíveis.
 * Registre novos outcomes para expandir sem alterar o motor.
 */
export const RUPTURE_TOTAL_OUTCOMES = Object.freeze([
  {
    id: 'inconsciencia',
    label: 'Inconsciência',
    severity: 'high',
    description: 'O personagem desaba. Ecos cessam até intervenção ou descanso prolongado.',
  },
  {
    id: 'colapso_mental',
    label: 'Colapso mental',
    severity: 'high',
    description: 'Perda temporária de coerência; confusão, amnésia parcial ou fuga dissociativa.',
  },
  {
    id: 'perda_permanente',
    label: 'Perda permanente',
    severity: 'critical',
    description: 'Trauma duradouro: atributo, memória ou vínculo narrativo comprometido.',
  },
  {
    id: 'mutacao',
    label: 'Mutação',
    severity: 'critical',
    description: 'O corpo ou percepção alteram-se de forma visível e irreversível.',
  },
  {
    id: 'eco_descontrolado',
    label: 'Eco descontrolado',
    severity: 'critical',
    description: 'Habilidades disparam sem controle; efeitos colaterais em área.',
  },
  {
    id: 'morte',
    label: 'Morte',
    severity: 'critical',
    description: 'Colapso existencial total — fim do personagem, salvo exceção narrativa.',
  },
  {
    id: 'transformacao_monstruosa',
    label: 'Transformação monstruosa',
    severity: 'critical',
    description: 'O personagem torna-se ameaça ao grupo; controle passa ao mestre.',
  },
])

export function getRuptureOutcome(outcomeId) {
  return RUPTURE_TOTAL_OUTCOMES.find(o => o.id === outcomeId) || null
}

export function buildRuptureTotalEvent({ characterId, characterName, skillName, outcomeId = null } = {}) {
  const outcome = outcomeId
    ? getRuptureOutcome(outcomeId)
  : RUPTURE_TOTAL_OUTCOMES[Math.floor(Math.random() * RUPTURE_TOTAL_OUTCOMES.length)]

  return {
    type: 'rupture_total',
    timestamp: new Date().toISOString(),
    characterId,
    characterName,
    skillName,
    overload: 10,
    outcome,
    message: `RUPTURA TOTAL — ${characterName || 'Personagem'}: ${outcome?.label || 'Evento crítico'}`,
  }
}
