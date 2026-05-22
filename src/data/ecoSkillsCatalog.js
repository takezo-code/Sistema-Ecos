/**
 * Catálogo de habilidades de personagem (Eco).
 * Builtin: ~15 por categoria em characterSkillsCatalog.js
 * Custom: aba Skills → Personagem (localStorage)
 */
import { CHARACTER_SKILLS_CATALOG } from './characterSkillsCatalog'

export const ECO_SKILLS_CATALOG = CHARACTER_SKILLS_CATALOG

export function getCatalogSkillIds() {
  return ECO_SKILLS_CATALOG.map(s => s.templateId)
}
