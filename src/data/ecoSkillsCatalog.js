/**
 * Catálogo de habilidades de personagem (Eco).
 * Builtin — skills pré-definidas por classe; jogadores só liberam (sem criação manual).
 */
import { CHARACTER_SKILLS_CATALOG } from './characterSkillsCatalog'

export const ECO_SKILLS_CATALOG = CHARACTER_SKILLS_CATALOG

export function getCatalogSkillIds() {
  return ECO_SKILLS_CATALOG.map(s => s.templateId)
}
