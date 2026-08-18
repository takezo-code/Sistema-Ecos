/**
 * Passivas de classe — texto de cena, sem bônus de rolagem.
 */
import { getCharacterClass } from '../../constants/classes'

export function getClassPassive(entityOrClassId) {
  return getCharacterClass(entityOrClassId)?.passive ?? null
}
