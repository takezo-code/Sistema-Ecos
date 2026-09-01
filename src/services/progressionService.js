import {
  MAX_LEVEL,
  MAX_SOCIAL_LEVEL,
  getXpRequiredForLevel,
  getLevelRewardType,
} from '../constants/progression'
import {
  STARTING_ATTRIBUTE_POINTS,
  STARTING_SOCIAL_POINTS,
  defaultAttributes,
  defaultSocialAttributes,
  getAttributeMax,
  getSocialAttributeMax,
  getInitialAttributeMax,
  getInitialSocialMax,
  getTotalAttributePoints,
  getTotalSocialPoints,
  getCreationAttributeFloor,
  isInCreationPhase,
} from '../constants/attributes'
import { entityHasEcoPowers } from '../constants/entityProgression'
import { normalizeClassId } from '../constants/classes'
import {
  getAttributeBudget,
  getEcoPointsFromLevel,
  getEcoSpentOnSkills,
  validateProgression,
  enforceProgressionCaps,
  syncProgressionToLevel,
} from './progressionBudget'

export {
  getAttributeBudget,
  getSocialBudget,
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
  let pendingSocialPoints = character.pendingSocialPoints ?? 0
  const levelUps = []

  while (level < MAX_LEVEL) {
    const needed = getXpRequiredForLevel(level)
    if (xp < needed) break

    xp -= needed
    level += 1

    const hasEco = entityHasEcoPowers(character)

    if (hasEco) {
      const ecoBudget = getEcoPointsFromLevel(level, character)
      const ecoSpent = getEcoSpentOnSkills(character.skills)
      if (ecoPoints + ecoSpent < ecoBudget) {
        ecoPoints += 1
        levelUps.push({ level, type: 'eco', message: `Nível ${level}: +1 Eco` })
      }
    }

    const rewardType = getLevelRewardType(level)
    if (rewardType === 'attribute') {
      pendingAttributePoints += 1
      levelUps.push({ level, type: 'attribute', message: `Nível ${level}: +1 ponto de atributo` })
    }

    if (level <= MAX_SOCIAL_LEVEL) {
      pendingSocialPoints += 1
      levelUps.push({ level, type: 'social', message: `Nível ${level}: +1 ponto de cena` })
    }
  }

  return {
    patch: {
      level,
      xp,
      ecoPoints,
      pendingAttributePoints,
      pendingSocialPoints,
      xpToNextLevel: getXpRequiredForLevel(level),
    },
    levelUps,
  }
}

/** Gasta 1 ponto pendente de level-up em um atributo */
export function applyPendingAttributePoint(character, attrKey) {
  if (attrKey === 'ruptura' && !entityHasEcoPowers(character)) return null
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

/** Criação: exige os 6 pontos sociais iniciais totalmente distribuídos. */
export function validateStartingSocialDistributed(entity) {
  const pool = entity.unspentSocialPoints ?? 0
  const spent = getTotalSocialPoints(entity.socialAttributes)
  if (pool > 0) {
    return {
      ok: false,
      message: `Distribua os ${pool} ponto(s) restante(s) dos ${STARTING_SOCIAL_POINTS} pontos de cena antes de salvar.`,
    }
  }
  if (spent !== STARTING_SOCIAL_POINTS) {
    return {
      ok: false,
      message: `Distribua exatamente ${STARTING_SOCIAL_POINTS} pontos de cena (você colocou ${spent}).`,
    }
  }
  return { ok: true }
}

/** Criação: exige os 10 pontos iniciais totalmente distribuídos (pool zerado). */
export function validateStartingAttributesDistributed(entity) {
  const pool = entity.unspentAttributePoints ?? 0
  const spent = getTotalAttributePoints(entity.attributes, entity)
  if (pool > 0) {
    return {
      ok: false,
      message: `Distribua os ${pool} ponto(s) restante(s) dos ${STARTING_ATTRIBUTE_POINTS} iniciais antes de salvar.`,
    }
  }
  if (spent !== STARTING_ATTRIBUTE_POINTS) {
    return {
      ok: false,
      message: `Distribua exatamente ${STARTING_ATTRIBUTE_POINTS} pontos iniciais (você colocou ${spent}).`,
    }
  }
  return { ok: true }
}

/**
 * Criação de personagem: exige classe + gastar o Eco inicial em pelo menos 1 skill.
 */
export function validateStartingEcoSkillSelected(entity) {
  const classId = normalizeClassId(entity?.classId)
  if (!classId) {
    return { ok: false, message: 'Escolha uma classe antes de criar o personagem.' }
  }

  const unlocked = (entity.skills || []).filter(s => (Number(s.tier) || 0) > 0)
  if (unlocked.length < 1) {
    return {
      ok: false,
      message: 'Gaste o Eco inicial e desbloqueie uma skill da classe para liberar a criação.',
    }
  }

  if ((entity.ecoPoints ?? 0) > 0) {
    return {
      ok: false,
      message: 'Gaste o ponto de Eco inicial em uma skill para liberar a criação.',
    }
  }

  return { ok: true }
}

/** Criação: exige nome da arma e tipo de armadura iniciais. */
export function validateStartingStarterGear(entity) {
  const weaponName = String(entity?.starterWeapon?.name || '').trim()
  if (!weaponName) {
    return { ok: false, message: 'Dê um nome à arma inicial para continuar.' }
  }
  if (!entity?.starterArmor?.type) {
    return { ok: false, message: 'Escolha o tipo de armadura para continuar.' }
  }
  return { ok: true }
}

/** Criação: exige nome do personagem. */
export function validateStartingCharacterName(entity) {
  if (!String(entity?.name || '').trim()) {
    return { ok: false, message: 'Digite o nome do personagem para continuar.' }
  }
  return { ok: true }
}

/** Criação: exige classe escolhida. */
export function validateStartingClassSelected(entity) {
  if (!normalizeClassId(entity?.classId)) {
    return { ok: false, message: 'Escolha uma classe para continuar.' }
  }
  return { ok: true }
}

/** Valida distribuição inicial (pool de 10, máx 4 por atributo). Na criação pode subir e descer redistribuindo o pool. */
export function applyInitialAttributeChange(entity, attrKey, newValue) {
  if (attrKey === 'ruptura' && !entityHasEcoPowers(entity)) return null
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

/** Criação social: distribui os 6 pontos iniciais nos atributos de cena. */
export function applyInitialSocialChange(entity, attrKey, newValue) {
  const value = Math.max(0, Math.min(getInitialSocialMax(), Number(newValue) || 0))
  const current = entity.socialAttributes?.[attrKey] ?? 0
  const delta = value - current
  const pool = entity.unspentSocialPoints ?? 0
  if (delta > 0 && pool < delta) return null
  return {
    socialAttributes: { ...entity.socialAttributes, [attrKey]: value },
    unspentSocialPoints: pool - delta,
  }
}

/** Gasta 1 ponto social pendente de nível num atributo de cena. */
export function applyPendingSocialPoint(entity, attrKey) {
  const pending = entity.pendingSocialPoints ?? 0
  if (pending <= 0) return null
  const current = entity.socialAttributes?.[attrKey] ?? 0
  const max = getSocialAttributeMax(attrKey)
  if (current >= max) return null
  return {
    socialAttributes: { ...entity.socialAttributes, [attrKey]: current + 1 },
    pendingSocialPoints: pending - 1,
  }
}

/**
 * Fora da criação: só aumenta com pontos pendentes de nível.
 * Os 10 pts de criação ficam fixos (creationAttributeFloors) — não dá para diminuir.
 */
export function applyAttributePointSpend(entity, attrKey, newValue) {
  if (attrKey === 'ruptura' && !entityHasEcoPowers(entity)) return null
  const floor = getCreationAttributeFloor(entity, attrKey)
  const value = Math.max(floor, Math.min(getAttributeMax(attrKey), Number(newValue) || 0))
  const current = entity.attributes?.[attrKey] ?? 0
  const delta = value - current

  if (delta === 0) return { attributes: { ...entity.attributes, [attrKey]: value } }

  if (delta < 0) return null

  const pending = entity.pendingAttributePoints ?? 0
  if (delta > pending) return null

  return {
    attributes: { ...entity.attributes, [attrKey]: value },
    pendingAttributePoints: pending - delta,
  }
}

export function isCreationPhase(entity) {
  return isInCreationPhase(entity)
}

/**
 * Congela a distribuição atual dos atributos ao salvar personagem.
 * Os valores definidos na criação não podem ser reduzidos depois.
 */
export function finalizeCreationAttributes(entity, { isNew = false } = {}) {
  const attrs = { ...defaultAttributes(), ...(entity.attributes || {}) }
  const pool = entity.unspentAttributePoints ?? 0
  const hasFloors = entity.creationAttributeFloors
    && typeof entity.creationAttributeFloors === 'object'
    && getTotalAttributePoints(entity.creationAttributeFloors) > 0

  const socialAttrs = { ...defaultSocialAttributes(), ...(entity.socialAttributes || {}) }
  const socialPool = entity.unspentSocialPoints ?? 0
  const hasSocialFloors = entity.creationSocialFloors
    && typeof entity.creationSocialFloors === 'object'

  const patch = {}

  if (isNew || pool > 0 || !hasFloors) {
    patch.creationAttributeFloors = attrs
    patch.unspentAttributePoints = 0
  } else {
    patch.unspentAttributePoints = 0
  }

  if (isNew || socialPool > 0 || !hasSocialFloors) {
    patch.creationSocialFloors = socialAttrs
    patch.unspentSocialPoints = 0
  } else {
    patch.unspentSocialPoints = 0
  }

  return patch
}

/**
 * Modo mestre: altera atributo respeitando orçamento do nível e consumindo/devolvendo pools.
 */
export function applyMasterAttributeChange(entity, attrKey, newValue) {
  if (attrKey === 'ruptura' && !entityHasEcoPowers(entity)) return { patch: null, error: { message: 'NPC sem poderes de Eco não possui Ruptura.' } }
  const max = getAttributeMax(attrKey)
  const floor = getCreationAttributeFloor(entity, attrKey)
  const value = Math.max(floor, Math.min(max, Number(newValue) || 0))
  const current = entity.attributes?.[attrKey] ?? 0
  const delta = value - current

  if (value < floor) {
    return {
      patch: null,
      error: {
        code: 'CREATION_FLOOR',
        message: `Os ${STARTING_ATTRIBUTE_POINTS} pontos de criação não podem ficar abaixo de ${floor} neste atributo.`,
      },
    }
  }

  if (delta === 0) {
    return { patch: { attributes: { ...entity.attributes, [attrKey]: value } } }
  }

  const spent = getTotalAttributePoints(entity.attributes, entity)
  const budget = getAttributeBudget(entity.level ?? 1, entity)
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
    patch.pendingAttributePoints = (entity.pendingAttributePoints ?? 0) + returned
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

  const levelChanged = level !== (entity.level ?? 1)
  if (levelChanged) {
    const spent = getTotalAttributePoints(entity.attributes, entity)
    const newBudget = getAttributeBudget(level, entity)
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

  const explicitPools = data.pendingAttributePoints !== undefined
    || data.unspentAttributePoints !== undefined
    || data.ecoPoints !== undefined

  let draft
  if (levelChanged && !explicitPools) {
    const synced = syncProgressionToLevel({ ...entity, level, xp: xpVal })
    if (synced.error) return { patch: null, error: synced.error }
    draft = {
      ...entity,
      level,
      xp: xpVal,
      ...synced.patch,
    }
  } else {
    draft = {
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
  }

  const { patch: capped, error: capError } = enforceProgressionCaps(draft)
  if (capError) return { patch: null, error: capError }

  const validation = validateProgression({ ...draft, ...capped })
  if (!validation.valid) {
    return { patch: null, error: validation.errors[0] }
  }

  const ecoBudget = getEcoPointsFromLevel(level, entity)
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
