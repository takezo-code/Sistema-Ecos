export const SKILL_CATEGORIES = Object.freeze({
  COMBATE: 'combate',
  PERCEPCAO: 'percepcao',
  MOVIMENTACAO: 'movimentacao',
  MANIPULACAO: 'manipulacao',
  SUPORTE: 'suporte',
  SOBREVIVENCIA: 'sobrevivencia',
  EMOCIONAL: 'emocional',
  LEITURA: 'leitura',
  AMBIENTE: 'ambiente',
})

export const SKILL_CATEGORY_META = {
  [SKILL_CATEGORIES.COMBATE]: { label: 'Combate', color: '#dc2626' },
  [SKILL_CATEGORIES.PERCEPCAO]: { label: 'Percepção', color: '#06b6d4' },
  [SKILL_CATEGORIES.MOVIMENTACAO]: { label: 'Movimentação', color: '#84cc16' },
  [SKILL_CATEGORIES.MANIPULACAO]: { label: 'Manipulação', color: '#a855f7' },
  [SKILL_CATEGORIES.SUPORTE]: { label: 'Suporte', color: '#16a34a' },
  [SKILL_CATEGORIES.SOBREVIVENCIA]: { label: 'Sobrevivência', color: '#d97706' },
  [SKILL_CATEGORIES.EMOCIONAL]: { label: 'Controle emocional', color: '#6366f1' },
  [SKILL_CATEGORIES.LEITURA]: { label: 'Leitura corporal', color: '#ec4899' },
  [SKILL_CATEGORIES.AMBIENTE]: { label: 'Ambiente', color: '#78716c' },
}
