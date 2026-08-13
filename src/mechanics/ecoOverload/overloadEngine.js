import {
  getEcoSafeLimitFromEntity,
  getEcoTotalRuptureThreshold,
  getOverloadPhase,
  formatOverloadDisplay,
} from '../../constants/ecoOverload'
import { skillTypeIncrementsOverload } from '../../constants/skillTypes'
import { buildRuptureTotalEvent } from './ruptureEvents'
import { syncOverloadMentalStatus } from '../../services/mentalStatusService'
import { mergeMentalStateWithOverload, getMentalStateLabelForOverload } from '../../constants/states'

/**
 * Incrementa sobrecarga e aplica consequências (status, eventos).
 * Limite seguro = 5 + Ruptura. Acima disso: −INT/PER/SAB/CAR progressivo.
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

  const safeLimit = getEcoSafeLimitFromEntity(entity)
  const totalAt = getEcoTotalRuptureThreshold(safeLimit)
  const amount = Math.max(1, Math.floor(Number(options.amount) || 1))
  const current = Math.max(0, Number(entity.ecoOverload) || 0)
  const next = current + amount
  let activeMentalStatuses = [...(entity.activeMentalStatuses || [])]

  activeMentalStatuses = syncOverloadMentalStatus(activeMentalStatuses, next, safeLimit)

  const mentalState = mergeMentalStateWithOverload(entity.mentalState, next, safeLimit)
  const mentalLabel = getMentalStateLabelForOverload(next, safeLimit)

  const patch = {
    ecoOverload: next,
    activeMentalStatuses,
    mentalState,
    lastEcoUseAt: new Date().toISOString(),
    lastEcoSkillUsedId: skill?.id ?? null,
  }

  if (next === safeLimit && current < safeLimit) {
    warnings.push(
      `Limite de Eco atingido (${formatOverloadDisplay(next, { safeLimit })}): ainda Estável. O próximo uso acima do limite causa Abalado.`,
    )
  }

  if (mentalState !== (entity.mentalState ?? 'estavel') && mentalLabel) {
    warnings.push(`Estado mental degradado para: ${mentalLabel}.`)
  }

  if (next > safeLimit && current <= safeLimit) {
    warnings.push('Passou do limite: a penalidade nos atributos mentais sobe com o estado (Abalado −1 … Perdido −4).')
  }

  if (next >= totalAt && current < totalAt) {
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
    phase: getOverloadPhase(next, safeLimit),
    overloadBefore: current,
    overloadAfter: next,
    safeLimit,
  }
}

export function resetEcoOverload(entity, { clearStatuses = true } = {}) {
  const safeLimit = getEcoSafeLimitFromEntity(entity)
  let activeMentalStatuses = entity.activeMentalStatuses || []
  if (clearStatuses) {
    activeMentalStatuses = syncOverloadMentalStatus(activeMentalStatuses, 0, safeLimit)
  }
  return {
    ecoOverload: 0,
    rupturaUsesSpent: 0,
    activeMentalStatuses,
    mentalState: 'estavel',
  }
}

export function setEcoOverloadLevel(entity, level) {
  const safeLimit = getEcoSafeLimitFromEntity(entity)
  const n = Math.max(0, Math.min(99, Number(level) || 0))
  const activeMentalStatuses = syncOverloadMentalStatus(entity.activeMentalStatuses || [], n, safeLimit)
  const mentalState = mergeMentalStateWithOverload(entity.mentalState, n, safeLimit)
  return { ecoOverload: n, activeMentalStatuses, mentalState }
}

/** Aplica status de sobrecarga sem usar habilidade (mestre) */
export function applyOverloadSideEffects(entity, overload) {
  const safeLimit = getEcoSafeLimitFromEntity(entity)
  const n = Math.max(0, Number(overload) || 0)
  return {
    activeMentalStatuses: syncOverloadMentalStatus(entity.activeMentalStatuses || [], n, safeLimit),
    mentalState: mergeMentalStateWithOverload(entity.mentalState, n, safeLimit),
  }
}
