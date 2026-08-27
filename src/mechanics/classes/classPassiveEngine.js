/**
 * Passivas de classe.
 * Traçado: texto de cena.
 * Baluarte: regeneração mecânica abaixo de 10 de vida.
 * Fratura: bônus mecânico na Fúria Cega quando a vida restante está baixa.
 * Fenda: base de usos de Eco em 8 (Canal Amplo) — ver ecoOverload.getEcoBaseLimitForEntity.
 */
import { getCharacterClass, normalizeClassId } from '../../constants/classes'
import { getRemainingLife, healDamageMarks } from '../combat/damageMarksEngine'
import { BUFF_KINDS, BUFF_TARGETS } from '../skills/skillBuffEngine'
import { genId } from '../../utils/id'

export const FRATURA_FURY_TEMPLATE_ID = 'porradeiro_1'
export const FRATURA_FURY_LIFE_THRESHOLD = 5
export const FRATURA_FURY_PASSIVE_BONUS = 2
export const BALUARTE_REGEN_LIFE_THRESHOLD = 10
export const BALUARTE_REGEN_PER_TURN = 1

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

/**
 * Regeneração do Baluarte:
 * abaixo de 10 de vida, recupera +1 por turno, parando no teto 10.
 */
export function buildClassPassiveTurnPatch(entity = {}) {
  if (normalizeClassId(entity.classId) !== 'tank') return { patch: null, warning: null }

  const life = getRemainingLife(entity)
  if (life.current >= BALUARTE_REGEN_LIFE_THRESHOLD) return { patch: null, warning: null }
  if (life.marks <= 0) return { patch: null, warning: null }

  const missingToThreshold = BALUARTE_REGEN_LIFE_THRESHOLD - life.current
  const healAmount = Math.min(BALUARTE_REGEN_PER_TURN, missingToThreshold)
  if (healAmount <= 0) return { patch: null, warning: null }

  const healed = healDamageMarks(entity, healAmount)
  return {
    patch: healed.patch,
    warning: `Passiva do Baluarte: +${healed.marksRemoved} vida (teto ${BALUARTE_REGEN_LIFE_THRESHOLD}).`,
  }
}
