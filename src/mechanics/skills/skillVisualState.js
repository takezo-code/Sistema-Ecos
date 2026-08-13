import {
  getEcoSafeLimit,
  getEcoTotalRuptureThreshold,
} from '../../constants/ecoOverload'
import { SKILL_VISUAL_STATES } from '../../constants/skillVisualStates'
import { ECO_SKILL_TYPES } from '../../constants/skillTypes'
import { isOnCooldown } from './cooldownEngine'

/**
 * Resolve estado visual do card conforme cooldown, sobrecarga e tipo.
 * safeLimit = 5 + Ruptura (passado pelo runtime ou derivado).
 */
export function resolveSkillVisualState({
  skillType,
  cooldownRemaining = 0,
  ecoOverload = 0,
  mentalState = 'estavel',
  explicitlyBlocked = false,
  safeLimit,
  ruptura = 0,
} = {}) {
  const lim = safeLimit != null ? safeLimit : getEcoSafeLimit(ruptura)
  const totalAt = getEcoTotalRuptureThreshold(lim)

  if (explicitlyBlocked || ecoOverload >= totalAt) {
    return SKILL_VISUAL_STATES.BLOQUEADA
  }

  if (skillType === ECO_SKILL_TYPES.ATIVA && cooldownRemaining > 0) {
    return SKILL_VISUAL_STATES.EM_COOLDOWN
  }

  if (ecoOverload > lim) {
    return SKILL_VISUAL_STATES.SOBRECARGA_ALTA
  }

  const unstableMental = ['abalado', 'fragmentado', 'dissociado', 'perdido_no_tempo'].includes(mentalState)
  if (unstableMental || ecoOverload >= lim) {
    return SKILL_VISUAL_STATES.INSTAVEL
  }

  return SKILL_VISUAL_STATES.DISPONIVEL
}

export function canActivateActiveSkill({
  skillType,
  cooldowns,
  templateId,
  ecoOverload = 0,
  safeLimit,
  ruptura = 0,
}) {
  const lim = safeLimit != null ? safeLimit : getEcoSafeLimit(ruptura)
  const totalAt = getEcoTotalRuptureThreshold(lim)

  if (skillType !== ECO_SKILL_TYPES.ATIVA) {
    return { allowed: false, reason: 'Habilidades passivas não são ativadas manualmente.' }
  }
  if (ecoOverload >= totalAt) {
    return { allowed: false, reason: 'Ruptura total — habilidades bloqueadas.' }
  }
  if (isOnCooldown(cooldowns, templateId)) {
    return { allowed: false, reason: 'Em cooldown.' }
  }
  return { allowed: true, reason: null }
}
