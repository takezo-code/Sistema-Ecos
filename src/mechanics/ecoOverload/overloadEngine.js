import {
  ECO_OVERLOAD_RUPTURE_TOTAL,
  ECO_OVERLOAD_SHAKEN_THRESHOLD,
  getOverloadPhase,
} from '../../constants/ecoOverload'
import { skillTypeIncrementsOverload } from '../../constants/skillTypes'
import { buildRuptureTotalEvent } from './ruptureEvents'
import { syncOverloadMentalStatus } from '../../services/mentalStatusService'
import { mergeMentalStateWithOverload, getMentalStateLabelForOverload } from '../../constants/states'

/**
 * Incrementa sobrecarga e aplica consequências (status, eventos).
 * @returns {{ patch: object, events: object[], warnings: string[] }}
 */
export function processEcoSkillUse(entity, skill, options = {}) {
  const events = []
  const warnings = []
  const skillType = skill?.skillType ?? 'ativa'

  if (!skillTypeIncrementsOverload(skillType)) {
    return {
      patch: {},
      events,
      warnings: ['Habilidades passivas não aumentam Sobrecarga de Eco.'],
      skippedOverload: true,
    }
  }

  const current = Math.max(0, Number(entity.ecoOverload) || 0)
  const next = current + 1
  let activeMentalStatuses = [...(entity.activeMentalStatuses || [])]

  activeMentalStatuses = syncOverloadMentalStatus(activeMentalStatuses, next)

  const mentalState = mergeMentalStateWithOverload(entity.mentalState, next)
  const mentalLabel = getMentalStateLabelForOverload(next)

  const patch = {
    ecoOverload: next,
    activeMentalStatuses,
    mentalState,
    lastEcoUseAt: new Date().toISOString(),
    lastEcoSkillUsedId: skill?.id ?? null,
  }

  if (next >= ECO_OVERLOAD_SHAKEN_THRESHOLD && current < ECO_OVERLOAD_SHAKEN_THRESHOLD) {
    warnings.push('Limite de sobrecarga atingido (5/5): personagem Mentalmente Abalado.')
  }

  if (mentalState !== (entity.mentalState ?? 'estavel') && mentalLabel) {
    warnings.push(`Estado mental degradado para: ${mentalLabel}.`)
  }

  if (next >= 6 && current < 6) {
    warnings.push('Ruptura de Eco: penalidades dobram progressivamente em poder e atributos.')
  }

  if (next >= ECO_OVERLOAD_RUPTURE_TOTAL) {
    const ruptureEvent = buildRuptureTotalEvent({
      characterId: entity.id,
      characterName: entity.name,
      skillName: skill?.name,
      outcomeId: options.ruptureOutcomeId,
    })
    events.push(ruptureEvent)
    patch.ruptureTotalCount = (entity.ruptureTotalCount ?? 0) + 1
    patch.lastRuptureTotalEvent = ruptureEvent
    warnings.push(ruptureEvent.message)
  }

  return {
    patch,
    events,
    warnings,
    phase: getOverloadPhase(next),
    overloadBefore: current,
    overloadAfter: next,
  }
}

export function resetEcoOverload(entity, { clearStatuses = true } = {}) {
  let activeMentalStatuses = entity.activeMentalStatuses || []
  if (clearStatuses) {
    activeMentalStatuses = syncOverloadMentalStatus(activeMentalStatuses, 0)
  }
  return {
    ecoOverload: 0,
    activeMentalStatuses,
    mentalState: 'estavel',
  }
}

export function setEcoOverloadLevel(entity, level) {
  const n = Math.max(0, Math.min(99, Number(level) || 0))
  const activeMentalStatuses = syncOverloadMentalStatus(entity.activeMentalStatuses || [], n)
  const mentalState = mergeMentalStateWithOverload(entity.mentalState, n)
  return { ecoOverload: n, activeMentalStatuses, mentalState }
}

/** Aplica status de sobrecarga sem usar habilidade (mestre) */
export function applyOverloadSideEffects(entity, overload) {
  const n = Math.max(0, Number(overload) || 0)
  return {
    activeMentalStatuses: syncOverloadMentalStatus(entity.activeMentalStatuses || [], n),
    mentalState: mergeMentalStateWithOverload(entity.mentalState, n),
  }
}
