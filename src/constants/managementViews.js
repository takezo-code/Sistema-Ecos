import { SKILL_AUDIENCE } from './skillAudience'

export const MANAGEMENT_VIEWS = {
  CHARACTERS: 'characters',
  NPCS: 'npcs',
  BOSS: 'boss',
  ORGANIZATIONS: 'organizations',
  ARMAS: 'armas',
  ARMADURA: 'armadura',
  /** @deprecated skills de personagem saíram do Gerenciamento — redireciona para NPC */
  SKILLS_CHARACTER: 'skills-character',
  SKILLS_NPC: 'skills-npc',
  SKILLS_BOSS: 'skills-boss',
}

/** Converte audience de skill / view legada para a subview de Gerenciamento. */
export function skillAudienceToManagementView(audience) {
  if (audience === SKILL_AUDIENCE.BOSS || audience === MANAGEMENT_VIEWS.SKILLS_BOSS) {
    return MANAGEMENT_VIEWS.SKILLS_BOSS
  }
  // Character / legado → Skills NPC (catálogo editável)
  return MANAGEMENT_VIEWS.SKILLS_NPC
}

export function normalizeManagementView(view) {
  if (!view || view === 'creation') return MANAGEMENT_VIEWS.CHARACTERS
  // Aba removida: Skills Personagem
  if (
    view === MANAGEMENT_VIEWS.SKILLS_CHARACTER
    || view === SKILL_AUDIENCE.CHARACTER
    || view === 'skills-character'
  ) {
    return MANAGEMENT_VIEWS.SKILLS_NPC
  }
  // Views atuais primeiro — 'boss' é Gerenciamento → Boss (não Skills Boss)
  if (Object.values(MANAGEMENT_VIEWS).includes(view)) return view
  // Legado: audiences gravadas como managementView
  if (view === SKILL_AUDIENCE.NPC) return MANAGEMENT_VIEWS.SKILLS_NPC
  return MANAGEMENT_VIEWS.CHARACTERS
}
