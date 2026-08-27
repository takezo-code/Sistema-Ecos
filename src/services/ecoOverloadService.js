import {
  getEcoSafeLimitFromEntity,
  getEcoTotalRuptureThreshold,
  formatOverloadDisplay,
  getOverloadPhase,
  isInRupturePhase,
} from '../constants/ecoOverload'
import {
  getMentalAttributePenaltyPercent,
} from '../mechanics/ecoOverload/overloadPenalties'
import { processEcoSkillUse, resetEcoOverload, setEcoOverloadLevel } from '../mechanics/ecoOverload/overloadEngine'
import { listActiveMentalStatusDetails } from './mentalStatusService'
import { getCatalogSkill } from './skillsCatalogService'
import { skillTypeIncrementsOverload } from '../constants/skillTypes'

export {
  getEcoPowerPenaltyPercent,
  getGlobalAttributePenaltyPercent,
  getMentalAttributePenaltyPercent,
  calculateEffectiveAttributes,
  calculateEffectiveSocialAttributes,
  getEffectiveAttributeValue,
  getEffectiveSocialAttributeValue,
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
  const safeLimit = getEcoSafeLimitFromEntity(entity)
  const totalAt = getEcoTotalRuptureThreshold(safeLimit)
  const phase = getOverloadPhase(overload, safeLimit)
  const mentalAttrFlat = getMentalAttributePenaltyPercent(overload, safeLimit)

  return {
    overload,
    safeLimit,
    display: formatOverloadDisplay(overload, { safeLimit }),
    phase,
    inRupturePhase: isInRupturePhase(overload, safeLimit),
    atCap: overload >= safeLimit,
    atTotalRupture: overload >= totalAt,
    ecoPenaltyPercent: 0,
    mentalAttrFlat,
    mentalAttrPenaltyPercent: mentalAttrFlat,
    attributePenaltyPercent: mentalAttrFlat,
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

  const catalog = skill.templateId ? getCatalogSkill(skill.templateId) : null
  const amount = Math.max(
    1,
    Math.floor(Number(options.amount ?? catalog?.overloadCost ?? skill.overloadCost ?? 1) || 1),
  )
  const result = processEcoSkillUse(entity, skill, { ...options, amount })
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
