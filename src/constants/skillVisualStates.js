/** Estados visuais dos cards de habilidade */
export const SKILL_VISUAL_STATES = Object.freeze({
  DISPONIVEL: 'disponivel',
  EM_COOLDOWN: 'em_cooldown',
  INSTAVEL: 'instavel',
  SOBRECARGA_ALTA: 'sobrecarga_alta',
  BLOQUEADA: 'bloqueada',
})

export const SKILL_VISUAL_STATE_META = {
  [SKILL_VISUAL_STATES.DISPONIVEL]: {
    label: 'Disponível',
    color: '#16a34a',
    border: 'rgba(22,163,74,0.35)',
    glow: 'rgba(22,163,74,0.08)',
  },
  [SKILL_VISUAL_STATES.EM_COOLDOWN]: {
    label: 'Em cooldown',
    color: '#6b7280',
    border: 'rgba(107,114,128,0.35)',
    glow: 'rgba(107,114,128,0.06)',
  },
  [SKILL_VISUAL_STATES.INSTAVEL]: {
    label: 'Instável',
    color: '#eab308',
    border: 'rgba(234,179,8,0.4)',
    glow: 'rgba(234,179,8,0.1)',
  },
  [SKILL_VISUAL_STATES.SOBRECARGA_ALTA]: {
    label: 'Sobrecarga alta',
    color: '#ea580c',
    border: 'rgba(234,88,12,0.45)',
    glow: 'rgba(234,88,12,0.12)',
  },
  [SKILL_VISUAL_STATES.BLOQUEADA]: {
    label: 'Bloqueada',
    color: '#991b1b',
    border: 'rgba(153,27,27,0.5)',
    glow: 'rgba(153,27,27,0.15)',
  },
}
