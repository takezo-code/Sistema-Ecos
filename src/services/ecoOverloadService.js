import {
  ECO_OVERLOAD_DISPLAY_CAP,
  ECO_OVERLOAD_RUPTURE_TOTAL,
  formatOverloadDisplay,
  getOverloadPhase,
  isInRupturePhase,
} from '../constants/ecoOverload'
import {
  getEcoPowerPenaltyPercent,
  getGlobalAttributePenaltyPercent,
  getMentalAttributePenaltyPercent,
} from '../mechanics/ecoOverload/overloadPenalties'
import { processEcoSkillUse, resetEcoOverload, setEcoOverloadLevel } from '../mechanics/ecoOverload/overloadEngine'
import { buildRuptureTotalEvent, RUPTURE_TOTAL_OUTCOMES } from '../mechanics/ecoOverload/ruptureEvents'
import { listActiveMentalStatusDetails } from './mentalStatusService'
import { skillTypeIncrementsOverload } from '../constants/skillTypes'

export {
  getEcoPowerPenaltyPercent,
  getGlobalAttributePenaltyPercent,
  getMentalAttributePenaltyPercent,
  calculateEffectiveAttributes,
  getEffectiveAttributeValue,
  formatEcoOverloadPenalty,
  formatMentalPenaltiesSummary,
  formatSkillPowerPenalty,
  formatMentalAttrPenalty,
  resolveMentalPenalties,
  applySkillPowerPenalty,
} from '../mechanics/ecoOverload/overloadPenalties'

export { processEcoSkillUse, resetEcoOverload, setEcoOverloadLevel } from '../mechanics/ecoOverload/overloadEngine'
export { buildRuptureTotalEvent, RUPTURE_TOTAL_OUTCOMES } from '../mechanics/ecoOverload/ruptureEvents'

/** Snapshot completo para UI e rolagens */
export function getEcoOverloadSnapshot(entity) {
  const overload = Math.max(0, Number(entity?.ecoOverload) || 0)
  const phase = getOverloadPhase(overload)
  const ecoPenalty      = getEcoPowerPenaltyPercent(overload)
  const mentalAttrPenalty = getMentalAttributePenaltyPercent(overload)

  return {
    overload,
    display: formatOverloadDisplay(overload),
    phase,
    inRupturePhase: isInRupturePhase(overload),
    atCap: overload >= ECO_OVERLOAD_DISPLAY_CAP,
    atTotalRupture: overload >= ECO_OVERLOAD_RUPTURE_TOTAL,
    ecoPenaltyPercent: ecoPenalty,
    mentalAttrPenaltyPercent: mentalAttrPenalty,
    // compat alias
    attributePenaltyPercent: mentalAttrPenalty,
    activeMentalStatuses: listActiveMentalStatusDetails(entity?.activeMentalStatuses),
    lastRuptureTotalEvent: entity?.lastRuptureTotalEvent ?? null,
    ruptureTotalCount: entity?.ruptureTotalCount ?? 0,
  }
}

/** Usa habilidade de Eco e retorna patch + eventos para o store */
export function useEcoSkill(entity, skillId, options = {}) {
  const skills = entity?.skills || []
  const skill = skills.find(s => s.id === skillId)
  if (!skill) {
    return { ok: false, error: { message: 'Habilidade não encontrada.' } }
  }

  if (!skillTypeIncrementsOverload(skill.skillType) && !options.force) {
    return {
      ok: true,
      patch: {},
      events: [],
      warnings: ['Habilidade passiva — sem incremento de sobrecarga.'],
      skill,
    }
  }

  const result = processEcoSkillUse(entity, skill, options)
  return {
    ok: true,
    patch: result.patch,
    events: result.events,
    warnings: result.warnings,
    skill,
    snapshot: getEcoOverloadSnapshot({ ...entity, ...result.patch }),
  }
}

export function restEcoOverload(entity) {
  return {
    ok: true,
    patch: resetEcoOverload(entity),
    events: [],
  }
}

export function masterSetEcoOverload(entity, level) {
  return {
    ok: true,
    patch: setEcoOverloadLevel(entity, level),
  }
}
