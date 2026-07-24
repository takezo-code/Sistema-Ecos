import { ATTRIBUTES } from './attributes'

export function isNpcEntity(entity) {
  if (!entity) return false
  const s = entity.status
  return s === 'vivo' || s === 'morto' || s === 'desaparecido'
}

/**
 * Personagens (sem flag): progressão alternada atributo/eco.
 * Boss: sempre tem Eco (skills manuais do catálogo boss).
 * NPC: só com hasEcoPowers === true; caso contrário só atributos (sem Ruptura).
 */
export function entityHasEcoPowers(entity) {
  if (entity?.papelCombate === 'boss') return true
  if (entity?.hasEcoPowers === true) return true
  if (entity?.hasEcoPowers === false) return false
  if (isNpcEntity(entity)) return false
  return true
}

export function getAttributesForEntity(entity) {
  if (entityHasEcoPowers(entity)) return ATTRIBUTES
  return ATTRIBUTES.filter(a => a.key !== 'ruptura')
}

export function sanitizeEntityForEcoFlag(entity) {
  if (!entity || entityHasEcoPowers(entity)) return entity
  return {
    ...entity,
    attributes: { ...(entity.attributes || {}), ruptura: 0 },
    ecoPoints: 0,
    skills: [],
  }
}
