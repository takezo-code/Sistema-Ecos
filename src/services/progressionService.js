import {
  MAX_LEVEL,
  getXpRequiredForLevel,
  getLevelRewardType,
} from '../constants/progression'
import {
  STARTING_ATTRIBUTE_POINTS,
  getAttributeMax,
  getInitialAttributeMax,
  getTotalAttributePoints,
} from '../constants/attributes'
import {
  getAttributeBudget,
  getEcoPointsFromLevel,
  getEcoSpentOnSkills,
  getProgressionSnapshot,
  validateProgression,
  enforceProgressionCaps,
  syncProgressionToLevel,
  clampMasterAuxiliary,
  scaleAttributesToBudget,
} from './progressionBudget'

export {
  getAttributeBudget,
  getAttributePointsFromLevel,
  getEcoPointsFromLevel,
  getEcoSpentOnSkills,
  getProgressionSnapshot,
  validateProgression,
  syncProgressionToLevel,
  clampMasterAuxiliary,
  scaleAttributesToBudget,
} from './progressionBudget'

export function normalizeProgressionFields(entity) {
  const level = Math.min(MAX_LEVEL, Math.max(1, entity.level ?? 1))
  return {
    level,
    xp: Math.max(0, entity.xp ?? 0),
    xpToNextLevel: getXpRequiredForLevel(level),
    ecoPoints: Math.max(0, entity.ecoPoints ?? 0),
    pendingAttributePoints: Math.max(0, entity.pendingAttributePoints ?? 0),
    skills: Array.isArray(entity.skills) ? entity.skills : [],
  }
}

/**
 * Adiciona XP e processa level-ups até o máximo.
 * Retorna patch parcial + lista de recompensas ganhas.
 */
export function applyXpGain(character, amount) {
  const gain = Math.max(0, Number(amount) || 0)
  if (gain <= 0) return { patch: {}, levelUps: [] }

  let level = character.level ?? 1
  let xp = (character.xp ?? 0) + gain
  let ecoPoints = character.ecoPoints ?? 0
  let pendingAttributePoints = character.pendingAttributePoints ?? 0
  const levelUps = []

  while (level < MAX_LEVEL) {
    const needed = getXpRequiredForLevel(level)
    if (xp < needed) break

    xp -= needed
    level += 1

    const rewardType = getLevelRewardType(level)
    if (rewardType === 'attribute') {
      pendingAttributePoints += 1
      levelUps.push({ level, type: 'attribute', message: `Nível ${level}: +1 ponto de atributo` })
    } else if (rewardType === 'eco') {
      ecoPoints += 1
      levelUps.push({ level, type: 'eco', message: `Nível ${level}: +1 Eco` })
    } else {
      levelUps.push({ level, type: 'none', message: `Nível ${level}` })
    }
  }

  return {
    patch: {
      level,
      xp,
      ecoPoints,
      pendingAttributePoints,
      xpToNextLevel: getXpRequiredForLevel(level),
    },
    levelUps,
  }
}

/** Gasta 1 ponto pendente de level-up em um atributo */
export function applyPendingAttributePoint(character, attrKey) {
  const pending = character.pendingAttributePoints ?? 0
  if (pending <= 0) return null

  const current = character.attributes?.[attrKey] ?? 0
  const max = getAttributeMax(attrKey)
  if (current >= max) return null

  return {
    attributes: { ...character.attributes, [attrKey]: current + 1 },
    pendingAttributePoints: pending - 1,
  }
}

/** Valida distribuição inicial (pool de 10, máx 4 por atributo) */
export function applyInitialAttributeChange(entity, attrKey, newValue) {
  const value = Math.max(0, Math.min(getInitialAttributeMax(), Number(newValue) || 0))
  const current = entity.attributes?.[attrKey] ?? 0
  const delta = value - current
  const pool = entity.unspentAttributePoints ?? 0

  if (delta > 0 && pool < delta) return null
  if (value > getInitialAttributeMax()) return null

  return {
    attributes: { ...entity.attributes, [attrKey]: value },
    unspentAttributePoints: pool - delta,
  }
}

/** Alteração de atributo fora da criação (pool inicial ou pendente de level) */
export function applyAttributePointSpend(entity, attrKey, newValue) {
  const value = Math.max(0, Math.min(getAttributeMax(attrKey), Number(newValue) || 0))
  const current = entity.attributes?.[attrKey] ?? 0
  const delta = value - current

  if (delta === 0) return { attributes: { ...entity.attributes, [attrKey]: value } }

  if (delta < 0) {
    const pool = (entity.unspentAttributePoints ?? 0) + Math.abs(delta)
    return {
      attributes: { ...entity.attributes, [attrKey]: value },
      unspentAttributePoints: pool,
    }
  }

  const pending = entity.pendingAttributePoints ?? 0
  const creationPool = entity.unspentAttributePoints ?? 0
  const totalAvailable = pending + creationPool

  if (delta > totalAvailable) return null
  if (value > getAttributeMax(attrKey)) return null

  let usePending = Math.min(delta, pending)
  let useCreation = delta - usePending

  return {
    attributes: { ...entity.attributes, [attrKey]: value },
    pendingAttributePoints: pending - usePending,
    unspentAttributePoints: creationPool - useCreation,
  }
}

export function isCreationPhase(entity) {
  const spent = Object.values(entity.attributes || {}).reduce((s, v) => s + (Number(v) || 0), 0)
  const pool = entity.unspentAttributePoints ?? 0
  return pool > 0 || spent < STARTING_ATTRIBUTE_POINTS
}

/**
 * Modo mestre: altera atributo respeitando orçamento do nível e consumindo/devolvendo pools.
 */
export function applyMasterAttributeChange(entity, attrKey, newValue) {
  const max = getAttributeMax(attrKey)
  const value = Math.max(0, Math.min(max, Number(newValue) || 0))
  const current = entity.attributes?.[attrKey] ?? 0
  const delta = value - current

  if (delta === 0) {
    return { patch: { attributes: { ...entity.attributes, [attrKey]: value } } }
  }

  const spent = getTotalAttributePoints(entity.attributes)
  const budget = getAttributeBudget(entity.level ?? 1)
  const newSpent = spent + delta

  if (newSpent > budget) {
    return {
      patch: null,
      error: {
        code: 'ATTR_OVER_BUDGET',
        message: `Orçamento esgotado: nível ${entity.level ?? 1} permite ${budget} pontos (${newSpent} seriam usados). Sincronize ou reduza outro atributo.`,
      },
    }
  }

  if (delta > 0) {
    let pending = entity.pendingAttributePoints ?? 0
    let unspent = entity.unspentAttributePoints ?? 0
    let need = delta
    const usePending = Math.min(need, pending)
    pending -= usePending
    need -= usePending
    const useUnspent = Math.min(need, unspent)
    unspent -= useUnspent
    need -= useUnspent
    if (need > 0) {
      return {
        patch: null,
        error: {
          code: 'NO_POOL',
          message: `Sem pontos disponíveis (${need} faltando). Ajuste pools ou sincronize ao nível.`,
        },
      }
    }
    return {
      patch: {
        attributes: { ...entity.attributes, [attrKey]: value },
        pendingAttributePoints: pending,
        unspentAttributePoints: unspent,
      },
    }
  }

  const returned = Math.abs(delta)
  const overBudget = spent > budget
  const patch = {
    attributes: { ...entity.attributes, [attrKey]: value },
  }
  if (!overBudget) {
    patch.unspentAttributePoints = (entity.unspentAttributePoints ?? 0) + returned
  }
  return { patch }
}

/** Modo mestre: ajusta nível, XP, Ecos e pools com validação */
export function buildMasterProgressionPatch(entity, data = {}) {
  const level = Math.min(MAX_LEVEL, Math.max(1, data.level ?? entity.level ?? 1))
  const neededXp = getXpRequiredForLevel(level)
  let xpVal = data.xp !== undefined ? Math.max(0, Number(data.xp) || 0) : entity.xp ?? 0
  if (neededXp != null && xpVal >= neededXp) {
    xpVal = Math.max(0, neededXp - 1)
  }

  const draft = {
    ...entity,
    level,
    xp: xpVal,
    ecoPoints: data.ecoPoints !== undefined ? Math.max(0, Number(data.ecoPoints) || 0) : entity.ecoPoints ?? 0,
    pendingAttributePoints: data.pendingAttributePoints !== undefined
      ? Math.max(0, Number(data.pendingAttributePoints) || 0)
      : entity.pendingAttributePoints ?? 0,
    unspentAttributePoints: data.unspentAttributePoints !== undefined
      ? Math.max(0, Number(data.unspentAttributePoints) || 0)
      : entity.unspentAttributePoints ?? 0,
  }

  const levelChanged = level !== (entity.level ?? 1)
  if (levelChanged) {
    const spent = getTotalAttributePoints(entity.attributes)
    const newBudget = getAttributeBudget(level)
    if (spent > newBudget) {
      return {
        patch: null,
        error: {
          code: 'LEVEL_DOWN_BLOCKED',
          message: `Não é possível ir para nível ${level}: ${spent} pontos em atributos, mas o máximo é ${newBudget}. Reduza atributos primeiro.`,
        },
      }
    }
  }

  const { patch: capped, error: capError } = enforceProgressionCaps(draft)
  if (capError) return { patch: null, error: capError }

  const validation = validateProgression({ ...draft, ...capped })
  if (!validation.valid) {
    return { patch: null, error: validation.errors[0] }
  }

  const ecoBudget = getEcoPointsFromLevel(level)
  const ecoSpent = getEcoSpentOnSkills(entity.skills)
  const maxEco = Math.max(0, ecoBudget - ecoSpent)

  return {
    patch: {
      level,
      xp: draft.xp,
      ecoPoints: Math.min(draft.ecoPoints, maxEco),
      pendingAttributePoints: capped.pendingAttributePoints,
      unspentAttributePoints: capped.unspentAttributePoints,
      xpToNextLevel: getXpRequiredForLevel(level),
    },
  }
}

export function getXpProgress(character) {
  const level = character.level ?? 1
  const needed = getXpRequiredForLevel(level)
  if (!needed || level >= MAX_LEVEL) return { current: character.xp ?? 0, needed: null, percent: 100 }
  const current = character.xp ?? 0
  return {
    current,
    needed,
    percent: Math.min(100, (current / needed) * 100),
  }
}
