import { SKILL_AUDIENCE } from './skillAudience'

export const MANAGEMENT_VIEWS = {
  CHARACTERS: 'characters',
  NPCS: 'npcs',
  BOSS: 'boss',
  ORGANIZATIONS: 'organizations',
  ARMAS: 'armas',
  ARMADURA: 'armadura',
  SKILLS_CHARACTER: 'skills-character',
  SKILLS_NPC: 'skills-npc',
  SKILLS_BOSS: 'skills-boss',
}

/** Converte audience de skill / view legada para a subview de Gerenciamento. */
export function skillAudienceToManagementView(audience) {
  if (audience === SKILL_AUDIENCE.NPC || audience === MANAGEMENT_VIEWS.SKILLS_NPC) {
    return MANAGEMENT_VIEWS.SKILLS_NPC
  }
  if (audience === SKILL_AUDIENCE.BOSS || audience === MANAGEMENT_VIEWS.SKILLS_BOSS) {
    return MANAGEMENT_VIEWS.SKILLS_BOSS
  }
  return MANAGEMENT_VIEWS.SKILLS_CHARACTER
}

export function normalizeManagementView(view) {
  if (!view || view === 'creation') return MANAGEMENT_VIEWS.CHARACTERS
  // Views atuais primeiro — 'boss' é Gerenciamento → Boss (não Skills Boss)
  if (Object.values(MANAGEMENT_VIEWS).includes(view)) return view
  // Legado: audiences gravadas como managementView (character/npc; boss nunca foi skills)
  if (view === SKILL_AUDIENCE.CHARACTER) return MANAGEMENT_VIEWS.SKILLS_CHARACTER
  if (view === SKILL_AUDIENCE.NPC) return MANAGEMENT_VIEWS.SKILLS_NPC
  return MANAGEMENT_VIEWS.CHARACTERS
}
