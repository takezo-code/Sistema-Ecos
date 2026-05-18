import { MAX_LEVEL, getXpRequiredForLevel } from '../constants/progression'
import {
  ATTRIBUTES,
  STARTING_ATTRIBUTE_POINTS,
  getTotalAttributePoints,
} from '../constants/attributes'

/** Pontos de atributo ganhos em níveis pares (2, 4, 6…) */
export function getAttributePointsFromLevel(level) {
  return Math.floor(Math.max(1, level) / 2)
}

/** Total de pontos de status permitidos (criação + nível) */
export function getAttributeBudget(level) {
  return STARTING_ATTRIBUTE_POINTS + getAttributePointsFromLevel(level)
}

/** Ecos ganhos em níveis ímpares a partir do 3 (3, 5, 7…) */
export function getEcoPointsFromLevel(level) {
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
  const spent = getTotalAttributePoints(entity.attributes)
  const budget = getAttributeBudget(level)
  const unspent = entity.unspentAttributePoints ?? 0
  const pending = entity.pendingAttributePoints ?? 0
  const poolTotal = unspent + pending
  const available = Math.max(0, budget - spent)

  const ecoBudget = getEcoPointsFromLevel(level)
  const ecoSpent = getEcoSpentOnSkills(entity.skills)
  const ecoFree = entity.ecoPoints ?? 0
  const ecoTotal = ecoFree + ecoSpent

  const fromLevel = getAttributePointsFromLevel(level)
  const spentFromLevel = Math.max(0, spent - STARTING_ATTRIBUTE_POINTS)
  const maxPending = Math.max(0, fromLevel - spentFromLevel)

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

  const available = budget - spent
  let pending = Math.min(entity.pendingAttributePoints ?? 0, s.maxPending, available)
  let unspent = Math.min(entity.unspentAttributePoints ?? 0, available - pending)
  if (pending + unspent > available) {
    unspent = Math.max(0, available - pending)
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
  const spent = getTotalAttributePoints(entity.attributes)
  const budget = getAttributeBudget(level)

  if (spent > budget) {
    return {
      patch: null,
      error: {
        code: 'ATTR_OVER_BUDGET',
        message: `Não é possível sincronizar: ${spent} pontos em atributos, mas o nível ${level} permite apenas ${budget}. Reduza atributos primeiro.`,
      },
    }
  }

  const available = budget - spent
  const fromLevel = getAttributePointsFromLevel(level)
  const spentFromLevel = Math.max(0, spent - STARTING_ATTRIBUTE_POINTS)
  const pending = Math.max(0, Math.min(fromLevel - spentFromLevel, available))
  const unspent = available - pending

  const ecoBudget = getEcoPointsFromLevel(level)
  const ecoSpent = getEcoSpentOnSkills(entity.skills)
  const ecoPoints = Math.max(0, ecoBudget - ecoSpent)

  return {
    patch: {
      pendingAttributePoints: pending,
      unspentAttributePoints: unspent,
      ecoPoints,
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
    const available = s.budget - s.spent
    const fromLevel = getAttributePointsFromLevel(level)
    const spentFromLevel = Math.max(0, s.spent - STARTING_ATTRIBUTE_POINTS)
    pending = Math.max(0, Math.min(fromLevel - spentFromLevel, available))
    unspent = Math.max(0, available - pending)
  }

  return {
    patch: {
      level,
      xp,
      ecoPoints,
      pendingAttributePoints: pending,
      unspentAttributePoints: unspent,
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
  const budget = getAttributeBudget(level)
  const attributes = { ...(entity.attributes || {}) }
  let spent = getTotalAttributePoints(attributes)

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
