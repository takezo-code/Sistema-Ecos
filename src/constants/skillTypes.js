/** Tipos de habilidade de Eco — define comportamento de uso e sobrecarga */
export const ECO_SKILL_TYPES = Object.freeze({
  ATIVA: 'ativa',
  PASSIVA: 'passiva',
  RUPTURA: 'ruptura',
})

export const ECO_SKILL_TYPE_LIST = Object.values(ECO_SKILL_TYPES)

export const ECO_SKILL_TYPE_META = {
  [ECO_SKILL_TYPES.ATIVA]: {
    label: 'Ativa',
    color: '#06b6d4',
    incrementsOverload: true,
    description: 'Uso consciente — +1 Sobrecarga por ativação.',
  },
  [ECO_SKILL_TYPES.PASSIVA]: {
    label: 'Passiva',
    color: '#16a34a',
    incrementsOverload: false,
    description: 'Sempre presente — não aumenta Sobrecarga ao “usar”.',
  },
  [ECO_SKILL_TYPES.RUPTURA]: {
    label: 'Ruptura',
    color: '#dc2626',
    incrementsOverload: true,
    description: 'Poder instável — +1 Sobrecarga; risco narrativo elevado.',
  },
}

export function normalizeSkillType(value) {
  const key = String(value || '').toLowerCase()
  return ECO_SKILL_TYPE_LIST.includes(key) ? key : ECO_SKILL_TYPES.ATIVA
}

export function skillTypeIncrementsOverload(skillType) {
  return ECO_SKILL_TYPE_META[normalizeSkillType(skillType)]?.incrementsOverload ?? true
}

export function getSkillTypeMeta(skillType) {
  return ECO_SKILL_TYPE_META[normalizeSkillType(skillType)]
}
