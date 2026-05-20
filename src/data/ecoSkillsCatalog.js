/**
 * Catálogo de habilidades de personagem (Eco).
 * Preencha pela aba Skills → Personagem.
 */
export const ECO_SKILLS_CATALOG = []

export function getCatalogSkillIds() {
  return ECO_SKILLS_CATALOG.map(s => s.templateId)
}
