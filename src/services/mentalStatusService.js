import { genId } from '../utils/id'
import { MENTAL_STATUS_EFFECTS, MENTAL_STATUS_SOURCES } from '../constants/mentalStatusEffects'
import { ECO_OVERLOAD_BASE_LIMIT, asSafeLimit } from '../constants/ecoOverload'

export function normalizeActiveMentalStatuses(list) {
  if (!Array.isArray(list)) return []
  return list
    .filter(s => s && MENTAL_STATUS_EFFECTS[s.effectId])
    .map(s => ({
      id: s.id || genId(),
      effectId: s.effectId,
      source: s.source || MENTAL_STATUS_SOURCES.NARRATIVE,
      appliedAt: s.appliedAt || new Date().toISOString(),
      meta: s.meta || {},
    }))
}

export function hasMentalStatus(activeStatuses, effectId) {
  return normalizeActiveMentalStatuses(activeStatuses).some(s => s.effectId === effectId)
}

export function applyMentalStatus(activeStatuses, effectId, { source, meta } = {}) {
  const list = normalizeActiveMentalStatuses(activeStatuses)
  if (hasMentalStatus(list, effectId)) return list
  const def = MENTAL_STATUS_EFFECTS[effectId]
  if (!def) return list
  return [
    ...list,
    {
      id: genId(),
      effectId,
      source: source || def.source,
      appliedAt: new Date().toISOString(),
      meta: meta || {},
    },
  ]
}

export function removeMentalStatusByEffect(activeStatuses, effectId) {
  return normalizeActiveMentalStatuses(activeStatuses).filter(s => s.effectId !== effectId)
}

export function removeMentalStatusById(activeStatuses, statusId) {
  return normalizeActiveMentalStatuses(activeStatuses).filter(s => s.id !== statusId)
}

/** Sincroniza Mentalmente Abalado ao atingir o limite seguro (5 + Ruptura). */
export function syncOverloadMentalStatus(activeStatuses, ecoOverload, safeLimit = ECO_OVERLOAD_BASE_LIMIT) {
  let list = normalizeActiveMentalStatuses(activeStatuses)
  const lim = asSafeLimit(safeLimit)
  const shouldHave = (Number(ecoOverload) || 0) >= lim

  if (shouldHave) {
    list = applyMentalStatus(list, 'mentalmente_abalado', {
      source: MENTAL_STATUS_SOURCES.ECO_OVERLOAD,
      meta: { overload: ecoOverload, safeLimit: lim },
    })
  } else {
    list = removeMentalStatusByEffect(list, 'mentalmente_abalado')
  }
  return list
}

export function listActiveMentalStatusDetails(activeStatuses) {
  return normalizeActiveMentalStatuses(activeStatuses).map(s => ({
    ...s,
    definition: MENTAL_STATUS_EFFECTS[s.effectId],
  }))
}
