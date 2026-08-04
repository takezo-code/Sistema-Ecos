import { SKILL_AUDIENCE } from './skillAudience'

export const MANAGEMENT_VIEWS = {
  CHARACTERS: 'characters',
  NPCS: 'npcs',
  BOSS: 'boss',
  ORGANIZATIONS: 'organizations',
  /** @deprecated catálogos de skills saíram do Gerenciamento */
  SKILLS_CHARACTER: 'skills-character',
  SKILLS_NPC: 'skills-npc',
  SKILLS_BOSS: 'skills-boss',
}

/** Views removidas: o catálogo de equipamento virou equipamento pessoal na ficha. */
const REMOVED_VIEWS = ['armas', 'armadura']

const LEGACY_SKILL_VIEWS = [
  MANAGEMENT_VIEWS.SKILLS_CHARACTER,
  MANAGEMENT_VIEWS.SKILLS_NPC,
  MANAGEMENT_VIEWS.SKILLS_BOSS,
  SKILL_AUDIENCE.CHARACTER,
  SKILL_AUDIENCE.NPC,
  SKILL_AUDIENCE.BOSS,
  'skills-character',
  'skills-npc',
  'skills-boss',
]

/** Converte audience de skill / view legada para a subview de Gerenciamento. */
export function skillAudienceToManagementView(audience) {
  if (audience === SKILL_AUDIENCE.BOSS || audience === MANAGEMENT_VIEWS.SKILLS_BOSS || audience === 'boss') {
    return MANAGEMENT_VIEWS.BOSS
  }
  return MANAGEMENT_VIEWS.NPCS
}

export function normalizeManagementView(view) {
  if (!view || view === 'creation') return MANAGEMENT_VIEWS.CHARACTERS
  if (REMOVED_VIEWS.includes(view)) return MANAGEMENT_VIEWS.CHARACTERS
  // Catálogos de skills removidos — criação na ficha / criação da entidade
  if (LEGACY_SKILL_VIEWS.includes(view)) {
    return skillAudienceToManagementView(view)
  }
  // Views atuais primeiro — 'boss' é Gerenciamento → Boss (não Skills Boss)
  if (Object.values(MANAGEMENT_VIEWS).includes(view)) {
    if (
      view === MANAGEMENT_VIEWS.SKILLS_CHARACTER
      || view === MANAGEMENT_VIEWS.SKILLS_NPC
      || view === MANAGEMENT_VIEWS.SKILLS_BOSS
    ) {
      return skillAudienceToManagementView(view)
    }
    return view
  }
  return MANAGEMENT_VIEWS.CHARACTERS
}
