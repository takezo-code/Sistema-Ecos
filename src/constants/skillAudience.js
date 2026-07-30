export const SKILL_AUDIENCE = Object.freeze({
  CHARACTER: 'character',
  NPC: 'npc',
  BOSS: 'boss',
})

/** Audiences que o mestre pode criar/editar no app. Skills de personagem vêm pré-definidas por classe. */
export const CREATABLE_SKILL_AUDIENCES = Object.freeze([
  SKILL_AUDIENCE.NPC,
  SKILL_AUDIENCE.BOSS,
])

export const SKILL_AUDIENCE_META = {
  [SKILL_AUDIENCE.CHARACTER]: {
    label: 'Personagem',
    shortLabel: 'PC',
    color: '#9ca3af',
    description: 'Skills pré-definidas por classe — jogadores só liberam; criação manual desativada.',
  },
  [SKILL_AUDIENCE.NPC]: {
    label: 'NPC',
    shortLabel: 'NPC',
    color: '#06b6d4',
    description: 'Habilidades exclusivas de NPCs — escolha manual no Gerenciamento; personagens não acessam este pool.',
  },
  [SKILL_AUDIENCE.BOSS]: {
    label: 'Boss',
    shortLabel: 'BOSS',
    color: '#dc2626',
    description: 'Habilidades de inimigos poderosos — exclusivas para bosses e combatentes de elite.',
  },
}

export function normalizeSkillAudience(audience) {
  if (audience === SKILL_AUDIENCE.NPC) return SKILL_AUDIENCE.NPC
  if (audience === SKILL_AUDIENCE.BOSS) return SKILL_AUDIENCE.BOSS
  return SKILL_AUDIENCE.CHARACTER
}

export function isCreatableSkillAudience(audience) {
  return CREATABLE_SKILL_AUDIENCES.includes(normalizeSkillAudience(audience))
}

/** Normaliza audience para criação: só NPC ou Boss (default NPC). */
export function normalizeCreatableAudience(audience) {
  if (audience === SKILL_AUDIENCE.BOSS) return SKILL_AUDIENCE.BOSS
  return SKILL_AUDIENCE.NPC
}

export function getSkillAudience(skill) {
  return normalizeSkillAudience(skill?.audience)
}

export function skillMatchesAudience(skill, audience) {
  return getSkillAudience(skill) === normalizeSkillAudience(audience)
}
