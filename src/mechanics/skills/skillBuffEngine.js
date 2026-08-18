/**
 * Buffs temporários de skills (marcas, atributos).
 * Aplicados nos cards dos beneficiados e entram no limiar/vida e nas rolagens.
 */

import { genId } from '../../utils/id'

export const BUFF_KINDS = Object.freeze({
  MARK_BONUS: 'mark_bonus',
  ATTR_BONUS: 'attr_bonus',
})

export const BUFF_TARGETS = Object.freeze({
  SELF: 'self',
  PARTY: 'party',
})

const ATTR_SHORT = {
  forca: 'FOR',
  destreza: 'DES',
  inteligencia: 'INT',
  vitalidade: 'VIT',
  ruptura: 'RUP',
  carisma: 'CAR',
  percepcao: 'PER',
  vontade: 'VON',
  sabedoria: 'SAB',
}

/** Resolve o valor do buff pelo nível da skill (1–3). Pode ser negativo (ex.: −INT). */
export function resolveBuffValue(buffDef, skillTier = 1) {
  if (!buffDef) return 0
  const tier = Math.min(3, Math.max(1, Math.floor(Number(skillTier) || 1)))
  if (Array.isArray(buffDef.values)) {
    const n = Number(buffDef.values[tier - 1])
    return Number.isFinite(n) ? n : 0
  }
  const n = Number(buffDef.value)
  return Number.isFinite(n) ? n : 0
}

function listBuffDefs(catalogDef) {
  if (Array.isArray(catalogDef?.buffs) && catalogDef.buffs.length) return catalogDef.buffs
  if (catalogDef?.buff?.kind) return [catalogDef.buff]
  return []
}

function attachHangover(buff, buffDef, skillTier) {
  if (!buffDef?.hangover || buff.kind !== BUFF_KINDS.ATTR_BONUS || buff.value <= 0) return buff
  const spec = typeof buffDef.hangover === 'object' ? buffDef.hangover : {}
  const hangoverValue = Array.isArray(spec.values) || spec.value != null
    ? resolveBuffValue(spec, skillTier)
    : -buff.value
  if (!hangoverValue) return buff
  return {
    ...buff,
    hangover: {
      kind: spec.kind || BUFF_KINDS.ATTR_BONUS,
      attrKey: spec.attrKey || buff.attrKey,
      value: hangoverValue,
      durationTurns: Math.max(1, Number(spec.durationTurns) || 1),
    },
  }
}

function buildOneBuff(catalogDef, buffDef, skillTier = 1) {
  if (!buffDef?.kind) return null
  const value = resolveBuffValue(buffDef, skillTier)
  if (buffDef.kind === BUFF_KINDS.MARK_BONUS && value <= 0) return null
  if (buffDef.kind === BUFF_KINDS.ATTR_BONUS && (!buffDef.attrKey || value === 0)) return null
  if (value === 0) return null
  const buff = {
    id: genId(),
    kind: buffDef.kind,
    value,
    attrKey: buffDef.attrKey || null,
    turnsRemaining: Math.max(1, Number(buffDef.durationTurns) || 1),
    delayTurns: Math.max(0, Number(buffDef.delayTurns) || 0),
    sourceName: catalogDef.name || 'Skill',
    sourceTemplateId: catalogDef.templateId,
    target: buffDef.target || BUFF_TARGETS.SELF,
    isHangover: value < 0 || Boolean(buffDef.isHangover),
  }
  return attachHangover(buff, buffDef, skillTier)
}

/** Monta o buff a partir da def do catálogo + nível da skill. */
export function buildSkillBuff(catalogDef, skillTier = 1) {
  return buildOneBuff(catalogDef, catalogDef?.buff, skillTier)
}

export function buildSkillBuffs(catalogDef, skillTier = 1) {
  return listBuffDefs(catalogDef)
    .map(def => buildOneBuff(catalogDef, def, skillTier))
    .filter(Boolean)
}

export function buildSkillAftereffects(catalogDef, skillTier = 1) {
  const def = catalogDef?.aftereffect
  if (!def) return []
  const built = buildOneBuff(catalogDef, def, skillTier)
  return built ? [built] : []
}

export function listActiveBuffs(entity = {}) {
  return Array.isArray(entity.activeBuffs) ? entity.activeBuffs.filter(Boolean) : []
}

/** Soma bônus de limiar de marcas vindos de buffs ativos. */
export function sumMarkBuffBonus(entity = {}) {
  return listActiveBuffs(entity).reduce((sum, b) => {
    if (b.kind !== BUFF_KINDS.MARK_BONUS) return sum
    if ((Number(b.delayTurns) || 0) > 0) return sum
    return sum + Math.max(0, Number(b.value) || 0)
  }, 0)
}

/** Bônus (ou penalidade) de atributo vindo de skills ativas. */
export function sumAttrBuffBonus(entity = {}, attrKey) {
  if (!attrKey) return 0
  return listActiveBuffs(entity).reduce((sum, b) => {
    if (b.kind !== BUFF_KINDS.ATTR_BONUS || b.attrKey !== attrKey) return sum
    if ((Number(b.delayTurns) || 0) > 0) return sum
    return sum + (Number(b.value) || 0)
  }, 0)
}

/**
 * Aplica/atualiza um buff (mesmo sourceTemplateId + attrKey substitui).
 * @returns {{ patch, applied }}
 */
export function applyBuffToEntity(entity = {}, buff) {
  if (!buff) return { patch: {}, applied: false }
  const current = listActiveBuffs(entity).filter(b => {
    if (b.sourceTemplateId !== buff.sourceTemplateId) return true
    if (buff.attrKey) return b.attrKey !== buff.attrKey
    return b.kind !== buff.kind
  })
  return {
    patch: { activeBuffs: [...current, { ...buff, id: buff.id || genId() }] },
    applied: true,
  }
}

export function applyBuffsToEntity(entity = {}, buffs = []) {
  let next = entity
  let applied = false
  for (const buff of buffs) {
    const result = applyBuffToEntity(next, buff)
    if (result.applied) {
      next = { ...next, ...result.patch }
      applied = true
    }
  }
  return { patch: applied ? { activeBuffs: next.activeBuffs } : {}, applied }
}

/** Reduz 1 turno em todos; remove expirados e aplica recuo quando houver. */
export function tickActiveBuffs(entity = {}) {
  const next = []
  for (const buff of listActiveBuffs(entity)) {
    const delay = Math.max(0, Number(buff.delayTurns) || 0)
    if (delay > 0) {
      next.push({ ...buff, delayTurns: delay - 1 })
      continue
    }

    const remaining = Math.max(0, (Number(buff.turnsRemaining) || 0) - 1)
    if (remaining > 0) {
      next.push({ ...buff, turnsRemaining: remaining, delayTurns: 0 })
      continue
    }

    if (buff.hangover && !buff.isHangover) {
      next.push({
        id: genId(),
        kind: buff.hangover.kind || buff.kind,
        value: buff.hangover.value,
        attrKey: buff.hangover.attrKey || buff.attrKey,
        turnsRemaining: Math.max(1, Number(buff.hangover.durationTurns) || 1),
        delayTurns: 0,
        sourceName: `${buff.sourceName} · recuo`,
        sourceTemplateId: buff.sourceTemplateId,
        target: buff.target,
        isHangover: true,
      })
    }
  }
  return { patch: { activeBuffs: next } }
}

export function formatBuff(buff) {
  if (!buff) return ''
  const delay = Math.max(0, Number(buff.delayTurns) || 0)
  const turns = delay > 0 ? `em ${delay}t` : `${buff.turnsRemaining}t`
  if (buff.kind === BUFF_KINDS.MARK_BONUS) {
    return `+${buff.value} marcas (${turns}) · ${buff.sourceName}`
  }
  if (buff.kind === BUFF_KINDS.ATTR_BONUS) {
    const short = ATTR_SHORT[buff.attrKey] || buff.attrKey
    const sign = buff.value > 0 ? '+' : ''
    return `${sign}${buff.value} ${short} (${turns}) · ${buff.sourceName}`
  }
  return buff.sourceName || 'Buff'
}
