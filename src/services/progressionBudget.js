import { MAX_LEVEL, getXpRequiredForLevel, getSocialPointsFromLevel } from '../constants/progression'
import {
  ATTRIBUTES,
  STARTING_ATTRIBUTE_POINTS,
  getTotalAttributePoints,
  isInCreationPhase,
  STARTING_SOCIAL_POINTS,
  getTotalSocialPoints,
} from '../constants/attributes'
import { entityHasEcoPowers } from '../constants/entityProgression'

/** Pontos de atributo de nível: pares + (sem Eco) também os slots que seriam Eco */
export function getAttributePointsFromLevel(level, entity = null) {
  const l = Math.max(1, level)
  const fromEven = Math.floor(l / 2)
  if (!entity || entityHasEcoPowers(entity)) return fromEven
  const ecoSlots = l < 3 ? 0 : Math.floor((l - 1) / 2)
  return fromEven + ecoSlots
}

/** Total de pontos de status permitidos (criação + nível) */
export function getAttributeBudget(level, entity = null) {
  return STARTING_ATTRIBUTE_POINTS + getAttributePointsFromLevel(level, entity)
}

/** Orçamento total de pontos sociais para um nível */
export function getSocialBudget(level) {
  return STARTING_SOCIAL_POINTS + getSocialPointsFromLevel(level)
}

/** Ecos ganhos em níveis ímpares a partir do 3 — zero se entidade sem poderes de Eco */
export function getEcoPointsFromLevel(level, entity = null) {
  if (entity && !entityHasEcoPowers(entity)) return 0
  const l = Math.max(1, level)
  if (l < 3) return 0
  return Math.floor((l - 1) / 2)
}

/** Ecos já gastos em habilidades (1 por desbloqueio + 1 por tier acima de 1) */
export function getEcoSpentOnSkills(skills = []) {
  return (skills || []).reduce((sum, s) => sum + Math.max(1, Number(s.tier) || 1), 0)
}

export function getProgressionSnapshot(entity) {
  const level = Math.min(MAX_LEVEL, Math.max(1, entity.level ?? 1))
  const spent = getTotalAttributePoints(entity.attributes, entity)
  const budget = getAttributeBudget(level, entity)
  const unspent = entity.unspentAttributePoints ?? 0
  const pending = entity.pendingAttributePoints ?? 0
  const poolTotal = unspent + pending
  const available = Math.max(0, budget - spent)

  const ecoBudget = getEcoPointsFromLevel(level, entity)
  const ecoSpent = getEcoSpentOnSkills(entity.skills)
  const ecoFree = entity.ecoPoints ?? 0
  const ecoTotal = ecoFree + ecoSpent

  const fromLevel = getAttributePointsFromLevel(level, entity)
  const spentFromLevel = Math.max(0, spent - STARTING_ATTRIBUTE_POINTS)
  const maxPending = Math.max(0, fromLevel - spentFromLevel)

  const socialSpent = getTotalSocialPoints(entity.socialAttributes)
  const socialBudget = getSocialBudget(level)
  const socialFromLevel = getSocialPointsFromLevel(level)
  const socialUnspent = entity.unspentSocialPoints ?? 0
  const pendingSocial = entity.pendingSocialPoints ?? 0
  const socialSpentFromLevel = Math.max(0, socialSpent - STARTING_SOCIAL_POINTS)
  const maxPendingSocial = Math.max(0, socialFromLevel - socialSpentFromLevel)

  return {
    level,
    spent,
    budget,
    unspent,
    pending,
    poolTotal,
    available,
    maxPending,
    maxUnspent: Math.max(0, available - pending),
    ecoBudget,
    ecoSpent,
    ecoFree,
    ecoTotal,
    maxEcoFree: Math.max(0, ecoBudget - ecoSpent),
    socialSpent,
    socialBudget,
    socialUnspent,
    pendingSocial,
    maxPendingSocial,
    socialFromLevel,
  }
}

export function validateProgression(entity) {
  const s = getProgressionSnapshot(entity)
  const errors = []

  if (s.spent > s.budget) {
    errors.push({
      code: 'ATTR_OVER_BUDGET',
      message: `Atributos (${s.spent}) excedem o permitido para nível ${s.level} (máx. ${s.budget}). Reduza atributos antes de baixar o nível.`,
      spent: s.spent,
      budget: s.budget,
    })
  }

  if (s.spent + s.poolTotal > s.budget) {
    errors.push({
      code: 'POOL_OVER_BUDGET',
      message: `Pools (${s.poolTotal}) + atributos (${s.spent}) excedem o orçamento (${s.budget}).`,
    })
  }

  if (s.ecoTotal > s.ecoBudget) {
    errors.push({
      code: 'ECO_OVER_BUDGET',
      message: `Ecos (${s.ecoTotal}) excedem o permitido para nível ${s.level} (máx. ${s.ecoBudget}).`,
    })
  }

  if (s.pending > s.maxPending) {
    errors.push({
      code: 'PENDING_OVER_LEVEL',
      message: `Pontos pendentes (${s.pending}) acima do máximo para o nível (${s.maxPending}).`,
    })
  }

  return {
    valid: errors.length === 0,
    errors,
    snapshot: s,
  }
}

/** Limita pools e ecos aos tetos do nível (não altera atributos) */
export function enforceProgressionCaps(entity) {
  const level = Math.min(MAX_LEVEL, Math.max(1, entity.level ?? 1))
  const s = getProgressionSnapshot({ ...entity, level })
  const spent = s.spent
  const budget = s.budget

  if (spent > budget) {
    return { patch: null, error: validateProgression({ ...entity, level }).errors[0] }
  }

  const available = Math.max(0, budget - spent)
  const inCreation = isInCreationPhase(entity)
  let pending = Math.min(entity.pendingAttributePoints ?? 0, s.maxPending, available)
  let unspent = inCreation
    ? Math.min(entity.unspentAttributePoints ?? 0, Math.max(0, available - pending))
    : 0
  if (inCreation && pending + unspent > available) {
    unspent = Math.max(0, available - pending)
  } else if (!inCreation) {
    pending = Math.min(pending, s.maxPending, available)
    unspent = 0
  }

  const ecoPoints = Math.min(entity.ecoPoints ?? 0, s.maxEcoFree)

  return {
    patch: {
      level,
      pendingAttributePoints: pending,
      unspentAttributePoints: unspent,
      ecoPoints,
      xpToNextLevel: getXpRequiredForLevel(level),
    },
    error: null,
  }
}

/**
 * Recalcula pools e ecos com base no nível atual e nos atributos já distribuídos.
 * Não altera valores de atributos.
 */
export function syncProgressionToLevel(entity) {
  const level = Math.min(MAX_LEVEL, Math.max(1, entity.level ?? 1))
  const spent = getTotalAttributePoints(entity.attributes, entity)
  const budget = getAttributeBudget(level, entity)

  if (spent > budget) {
    return {
      patch: null,
      error: {
        code: 'ATTR_OVER_BUDGET',
        message: `Não é possível sincronizar: ${spent} pontos em atributos, mas o nível ${level} permite apenas ${budget}. Reduza atributos primeiro.`,
      },
    }
  }

  const available = Math.max(0, budget - spent)
  const fromLevel = getAttributePointsFromLevel(level, entity)
  const spentFromLevel = Math.max(0, spent - STARTING_ATTRIBUTE_POINTS)
  const maxPendingFromLevel = Math.max(0, fromLevel - spentFromLevel)
  const inCreation = isInCreationPhase(entity)

  let pending = Math.max(0, Math.min(maxPendingFromLevel, available))
  let unspent = inCreation
    ? Math.max(0, Math.min(entity.unspentAttributePoints ?? 0, available - pending))
    : 0

  const ecoBudget = getEcoPointsFromLevel(level, entity)
  const ecoSpent = getEcoSpentOnSkills(entity.skills)
  const ecoPoints = Math.max(0, ecoBudget - ecoSpent)

  // Social progression
  const socialBudgetFromLevel = getSocialPointsFromLevel(level)
  const totalSocialSpent = getTotalSocialPoints(entity.socialAttributes)
  const spentSocialFromLevel = Math.max(0, totalSocialSpent - STARTING_SOCIAL_POINTS)
  const pendingSocial = Math.max(0, socialBudgetFromLevel - spentSocialFromLevel)

  return {
    patch: {
      pendingAttributePoints: pending,
      unspentAttributePoints: unspent,
      ecoPoints,
      pendingSocialPoints: pendingSocial,
    },
    error: null,
  }
}

/** Corrige XP, Ecos e pools ao teto do nível (não mexe nos atributos) */
export function clampMasterAuxiliary(entity) {
  const level = Math.min(MAX_LEVEL, Math.max(1, entity.level ?? 1))
  const needed = getXpRequiredForLevel(level)
  let xp = Math.max(0, Number(entity.xp) || 0)
  if (needed != null && xp >= needed) {
    xp = Math.max(0, needed - 1)
  }

  const s = getProgressionSnapshot({ ...entity, level, xp })
  const ecoPoints = Math.min(entity.ecoPoints ?? 0, s.maxEcoFree)

  let pending = 0
  let unspent = 0
  if (s.spent <= s.budget) {
    const available = Math.max(0, s.budget - s.spent)
    const fromLevel = getAttributePointsFromLevel(level, entity)
    const spentFromLevel = Math.max(0, s.spent - STARTING_ATTRIBUTE_POINTS)
    const maxPendingFromLevel = Math.max(0, fromLevel - spentFromLevel)
    pending = Math.max(0, Math.min(maxPendingFromLevel, available))
    unspent = isInCreationPhase(entity)
      ? Math.max(0, Math.min(entity.unspentAttributePoints ?? 0, available - pending))
      : 0
  }

  // Social pending
  const socialBudgetFromLevel = getSocialPointsFromLevel(level)
  const totalSocialSpent = getTotalSocialPoints(entity.socialAttributes)
  const spentSocialFromLevel = Math.max(0, totalSocialSpent - STARTING_SOCIAL_POINTS)
  const maxSocialPending = Math.max(0, socialBudgetFromLevel - spentSocialFromLevel)
  const pendingSocial = Math.min(entity.pendingSocialPoints ?? 0, maxSocialPending)

  return {
    patch: {
      level,
      xp,
      ecoPoints,
      pendingAttributePoints: pending,
      unspentAttributePoints: unspent,
      pendingSocialPoints: pendingSocial,
      xpToNextLevel: needed,
    },
    error: null,
  }
}

/**
 * Reduz atributos (dos maiores para os menores) até caber no orçamento do nível,
 * depois sincroniza pools e ecos.
 */
export function scaleAttributesToBudget(entity) {
  const level = Math.min(MAX_LEVEL, Math.max(1, entity.level ?? 1))
  const budget = getAttributeBudget(level, entity)
  const attributes = { ...(entity.attributes || {}) }
  let spent = getTotalAttributePoints(attributes, entity)

  if (spent <= budget) {
    return {
      patch: null,
      error: { message: 'Os atributos já estão dentro do orçamento do nível.' },
    }
  }

  const keys = ATTRIBUTES.map(a => a.key)
  while (spent > budget) {
    let pick = null
    let highest = 0
    keys.forEach(k => {
      const v = attributes[k] ?? 0
      if (v > highest) {
        highest = v
        pick = k
      }
    })
    if (!pick || highest <= 0) break
    attributes[pick] = highest - 1
    spent--
  }

  const merged = { ...entity, attributes }
  const sync = syncProgressionToLevel(merged)

  return {
    patch: {
      attributes,
      pendingAttributePoints: sync.patch?.pendingAttributePoints ?? 0,
      unspentAttributePoints: sync.patch?.unspentAttributePoints ?? 0,
      ecoPoints: sync.patch?.ecoPoints ?? merged.ecoPoints ?? 0,
    },
    error: null,
  }
}
