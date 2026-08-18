/**
 * Passivas de classe.
 * Traçado/Baluarte: texto de cena.
 * Fratura: bônus mecânico na Fúria Cega quando a vida restante está baixa.
 */
import { getCharacterClass, normalizeClassId } from '../../constants/classes'
import { getRemainingLife } from '../combat/damageMarksEngine'
import { BUFF_KINDS, BUFF_TARGETS } from '../skills/skillBuffEngine'
import { genId } from '../../utils/id'

export const FRATURA_FURY_TEMPLATE_ID = 'porradeiro_1'
export const FRATURA_FURY_LIFE_THRESHOLD = 5
export const FRATURA_FURY_PASSIVE_BONUS = 2

export function getClassPassive(entityOrClassId) {
  return getCharacterClass(entityOrClassId)?.passive ?? null
}

export function isFraturaFuryPassiveActive(entity = {}) {
  if (normalizeClassId(entity.classId) !== 'porradeiro') return false
  return getRemainingLife(entity).current <= FRATURA_FURY_LIFE_THRESHOLD
}

/** Buff extra aplicado ao ativar Fúria Cega com vida restante ≤ 5. */
export function buildClassPassiveBuffs(entity = {}, catalogDef) {
  if (!isFraturaFuryPassiveActive(entity)) return []
  if (catalogDef?.templateId !== FRATURA_FURY_TEMPLATE_ID) return []

  const name = getClassPassive(entity)?.name || 'Fúria da Queda'
  return [{
    id: genId(),
    kind: BUFF_KINDS.ATTR_BONUS,
    attrKey: 'forca',
    value: FRATURA_FURY_PASSIVE_BONUS,
    turnsRemaining: 1,
    delayTurns: 0,
    sourceName: name,
    sourceTemplateId: 'porradeiro_passive',
    target: BUFF_TARGETS.SELF,
  }]
}
