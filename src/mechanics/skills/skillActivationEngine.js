import { genId } from '../../utils/id'
import { processEcoSkillUse } from '../ecoOverload/overloadEngine'
import { setCooldown, tickCooldowns } from './cooldownEngine'
import { ECO_SKILL_TYPES } from '../../constants/skillTypes'
import { applyOverloadSideEffects } from '../ecoOverload/overloadEngine'
import { healDamageMarks } from '../combat/damageMarksEngine'
import {
  applyBuffsToEntity,
  buildSkillBuffs,
  BUFF_TARGETS,
  resolveBuffValue,
  tickActiveBuffs,
} from './skillBuffEngine'

/**
 * Ativa habilidade ativa: sobe o contador de usos de Ruptura pelo custo da skill
 * (1, 2, …) e aplica cooldown, buffs e cura de marcas.
 */
export function activateActiveSkill(entity, skillInstance, catalogDef) {
  const templateId = skillInstance.templateId || catalogDef.templateId
  const rupturaCost = Math.max(0, Math.floor(Number(
    catalogDef.overloadCost ?? skillInstance.overloadCost ?? 1
  ) || 0))

  const syntheticSkill = {
    id: skillInstance.id,
    name: catalogDef.name,
    skillType: ECO_SKILL_TYPES.ATIVA,
    templateId,
  }

  let patch = {}
  const events = []
  const warnings = []

  if (rupturaCost > 0) {
    const step = processEcoSkillUse({ ...entity, ...patch }, syntheticSkill, { amount: rupturaCost })
    patch = { ...patch, ...step.patch }
    events.push(...step.events)
    warnings.push(...step.warnings)
  }

  const skillCooldowns = setCooldown(
    { ...entity.skillCooldowns, ...patch.skillCooldowns },
    templateId,
    catalogDef.cooldownTurns ?? 0
  )

  const skillTier = Math.max(1, Number(skillInstance.tier) || 1)
  const allBuffs = buildSkillBuffs(catalogDef, skillTier)
  const selfBuffs = allBuffs.filter(b => b.target !== BUFF_TARGETS.PARTY)
  const partyBuffs = allBuffs.filter(b => b.target === BUFF_TARGETS.PARTY)

  const buffResult = applyBuffsToEntity({ ...entity, ...patch }, selfBuffs)
  if (buffResult.applied) {
    patch = { ...patch, ...buffResult.patch }
    events.push({
      type: 'skill_buff',
      message: selfBuffs.map(b => `${b.sourceName}: ${b.kind === 'mark_bonus' ? `+${b.value} marcas` : `${b.value > 0 ? '+' : ''}${b.value}`}`).join(' · '),
    })
  }

  const healAmount = catalogDef.heal ? resolveBuffValue(catalogDef.heal, skillTier) : 0
  const healTarget = catalogDef.heal?.target || BUFF_TARGETS.SELF
  let partyHeal = null
  if (healAmount > 0 && healTarget === BUFF_TARGETS.PARTY) {
    partyHeal = { amount: healAmount, sourceName: catalogDef.name }
  } else if (healAmount > 0) {
    const healed = healDamageMarks({ ...entity, ...patch }, healAmount)
    patch = { ...patch, ...healed.patch }
    events.push({
      type: 'skill_heal',
      message: `${catalogDef.name}: −${healed.marksRemoved} marca(s).`,
    })
  }

  const historyEntry = {
    id: genId(),
    templateId,
    skillName: catalogDef.name,
    type: 'activation',
    turn: entity.currentTurn ?? 0,
    overloadAfter: patch.ecoOverload ?? entity.ecoOverload ?? 0,
    rupturaCost,
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
    partyBuffs,
    partyHeal,
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
  const buffTick = tickActiveBuffs(entity)

  const currentTurn = (entity.currentTurn ?? 0) + 1

  return {
    patch: {
      skillCooldowns,
      ecoOverload,
      activeMentalStatuses: overloadFx.activeMentalStatuses,
      mentalState: overloadFx.mentalState,
      currentTurn,
      ...buffTick.patch,
    },
    passiveWarnings,
  }
}
