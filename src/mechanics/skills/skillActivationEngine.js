import { genId } from '../../utils/id'
import { processEcoSkillUse } from '../ecoOverload/overloadEngine'
import { setCooldown, tickCooldowns } from './cooldownEngine'
import { ECO_SKILL_TYPES } from '../../constants/skillTypes'
import { applyOverloadSideEffects } from '../ecoOverload/overloadEngine'
import {
  getRupturaUsesRemaining,
  getRupturaUsesSpent,
} from '../equipment/gearPassiveEngine'

/**
 * Ativa habilidade ativa: sobrecarga + cooldown + histórico.
 * Se houver usos de Ruptura restantes (passivas de equipamento),
 * consome 1 e pula a sobrecarga deste uso.
 */
export function activateActiveSkill(entity, skillInstance, catalogDef) {
  const templateId = skillInstance.templateId || catalogDef.templateId
  const overloadCost = catalogDef.overloadCost ?? 1
  const rupturaRemaining = getRupturaUsesRemaining(entity)
  const useFreeRuptura = rupturaRemaining > 0

  const syntheticSkill = {
    id: skillInstance.id,
    name: catalogDef.name,
    skillType: ECO_SKILL_TYPES.ATIVA,
    templateId,
  }

  let patch = {}
  const events = []
  const warnings = []

  if (useFreeRuptura) {
    patch.rupturaUsesSpent = getRupturaUsesSpent(entity) + 1
    events.push({
      type: 'ruptura_use',
      message: `Uso de Ruptura da arma/armadura (${rupturaRemaining - 1} restantes).`,
    })
  } else {
    for (let i = 0; i < overloadCost; i++) {
      const step = processEcoSkillUse({ ...entity, ...patch }, syntheticSkill)
      patch = { ...patch, ...step.patch }
      events.push(...step.events)
      warnings.push(...step.warnings)
    }
  }

  const skillCooldowns = setCooldown(
    { ...entity.skillCooldowns, ...patch.skillCooldowns },
    templateId,
    catalogDef.cooldownTurns ?? 0
  )

  const historyEntry = {
    id: genId(),
    templateId,
    skillName: catalogDef.name,
    type: 'activation',
    turn: entity.currentTurn ?? 0,
    overloadAfter: patch.ecoOverload ?? entity.ecoOverload ?? 0,
    usedRupturaCharge: useFreeRuptura,
    narrativeConsequence: catalogDef.narrativeConsequence,
    timestamp: new Date().toISOString(),
  }

  return {
    patch: {
      ...patch,
      skillCooldowns,
      activeMentalStatuses: patch.activeMentalStatuses ?? entity.activeMentalStatuses,
      ecoSkillHistory: [...(entity.ecoSkillHistory || []), historyEntry].slice(-50),
      lastEcoSkillUsedId: skillInstance.id,
    },
    events,
    warnings,
    historyEntry,
  }
}

/** Avança turno: reduz cooldowns; passivas com risco podem aumentar sobrecarga */
export function advanceTurnForEntity(entity, catalogSkillsById = {}) {
  let skillCooldowns = tickCooldowns(entity.skillCooldowns)
  let ecoOverload = entity.ecoOverload ?? 0
  const passiveWarnings = []

  const riskyPassives = (entity.skills || [])
    .map(s => catalogSkillsById[s.templateId])
    .filter(def => def?.passiveOverloadRisk)
  if (riskyPassives.length > 0) {
    ecoOverload += 1
    passiveWarnings.push(
      `Eco residual no ambiente (+1 sobrecarga): ${riskyPassives.map(d => d.name).join(', ')}.`
    )
  }

  const overloadFx = applyOverloadSideEffects({ ...entity, ecoOverload }, ecoOverload)

  const currentTurn = (entity.currentTurn ?? 0) + 1

  return {
    patch: {
      skillCooldowns,
      ecoOverload,
      activeMentalStatuses: overloadFx.activeMentalStatuses,
      mentalState: overloadFx.mentalState,
      currentTurn,
    },
    passiveWarnings,
  }
}
