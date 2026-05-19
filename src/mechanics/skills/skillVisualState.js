import { ECO_OVERLOAD_DISPLAY_CAP, ECO_OVERLOAD_RUPTURE_TOTAL } from '../../constants/ecoOverload'
import { SKILL_VISUAL_STATES } from '../../constants/skillVisualStates'
import { ECO_SKILL_TYPES } from '../../constants/skillTypes'
import { isOnCooldown } from './cooldownEngine'

/**
 * Resolve estado visual do card conforme cooldown, sobrecarga e tipo.
 */
export function resolveSkillVisualState({
  skillType,
  cooldownRemaining = 0,
  ecoOverload = 0,
  mentalState = 'estavel',
  explicitlyBlocked = false,
} = {}) {
  if (explicitlyBlocked || ecoOverload >= ECO_OVERLOAD_RUPTURE_TOTAL) {
    return SKILL_VISUAL_STATES.BLOQUEADA
  }

  if (skillType === ECO_SKILL_TYPES.ATIVA && cooldownRemaining > 0) {
    return SKILL_VISUAL_STATES.EM_COOLDOWN
  }

  if (ecoOverload >= ECO_OVERLOAD_DISPLAY_CAP) {
    return SKILL_VISUAL_STATES.SOBRECARGA_ALTA
  }

  const unstableMental = ['fragmentado', 'dissociado', 'perdido_no_tempo'].includes(mentalState)
  if (unstableMental || ecoOverload >= 4) {
    return SKILL_VISUAL_STATES.INSTAVEL
  }

  return SKILL_VISUAL_STATES.DISPONIVEL
}

export function canActivateActiveSkill({
  skillType,
  cooldowns,
  templateId,
  ecoOverload = 0,
}) {
  if (skillType !== ECO_SKILL_TYPES.ATIVA) {
    return { allowed: false, reason: 'Habilidades passivas não são ativadas manualmente.' }
  }
  if (ecoOverload >= ECO_OVERLOAD_RUPTURE_TOTAL) {
    return { allowed: false, reason: 'Ruptura total — habilidades bloqueadas.' }
  }
  if (isOnCooldown(cooldowns, templateId)) {
    return { allowed: false, reason: 'Em cooldown.' }
  }
  return { allowed: true, reason: null }
}
