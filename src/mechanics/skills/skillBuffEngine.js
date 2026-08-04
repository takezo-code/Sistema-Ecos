/**
 * Buffs temporários de skills (marcas, etc.).
 * Aplicados nos cards dos beneficiados e contam no limiar/vida.
 */

import { genId } from '../../utils/id'

export const BUFF_KINDS = Object.freeze({
  MARK_BONUS: 'mark_bonus',
})

export const BUFF_TARGETS = Object.freeze({
  SELF: 'self',
  PARTY: 'party',
})

/** Resolve o valor do buff pelo nível da skill (1–3). */
export function resolveBuffValue(buffDef, skillTier = 1) {
  if (!buffDef) return 0
  const tier = Math.min(3, Math.max(1, Math.floor(Number(skillTier) || 1)))
  if (Array.isArray(buffDef.values)) {
    return Math.max(0, Number(buffDef.values[tier - 1]) || 0)
  }
  return Math.max(0, Number(buffDef.value) || 0)
}

/** Monta o buff a partir da def do catálogo + nível da skill. */
export function buildSkillBuff(catalogDef, skillTier = 1) {
  const buffDef = catalogDef?.buff
  if (!buffDef?.kind) return null
  const value = resolveBuffValue(buffDef, skillTier)
  if (value <= 0) return null
  return {
    id: genId(),
    kind: buffDef.kind,
    value,
    turnsRemaining: Math.max(1, Number(buffDef.durationTurns) || 1),
    sourceName: catalogDef.name || 'Skill',
    sourceTemplateId: catalogDef.templateId,
    target: buffDef.target || BUFF_TARGETS.SELF,
  }
}

export function listActiveBuffs(entity = {}) {
  return Array.isArray(entity.activeBuffs) ? entity.activeBuffs.filter(Boolean) : []
}

/** Soma bônus de limiar de marcas vindos de buffs ativos. */
export function sumMarkBuffBonus(entity = {}) {
  return listActiveBuffs(entity).reduce((sum, b) => {
    if (b.kind !== BUFF_KINDS.MARK_BONUS) return sum
    return sum + Math.max(0, Number(b.value) || 0)
  }, 0)
}

/**
 * Aplica/atualiza um buff (mesmo sourceTemplateId substitui).
 * @returns {{ patch, applied }}
 */
export function applyBuffToEntity(entity = {}, buff) {
  if (!buff) return { patch: {}, applied: false }
  const current = listActiveBuffs(entity).filter(
    b => b.sourceTemplateId !== buff.sourceTemplateId
  )
  return {
    patch: { activeBuffs: [...current, buff] },
    applied: true,
  }
}

/** Reduz 1 turno em todos; remove expirados. */
export function tickActiveBuffs(entity = {}) {
  const next = listActiveBuffs(entity)
    .map(b => ({
      ...b,
      turnsRemaining: Math.max(0, (Number(b.turnsRemaining) || 0) - 1),
    }))
    .filter(b => b.turnsRemaining > 0)
  return { patch: { activeBuffs: next } }
}

export function formatBuff(buff) {
  if (!buff) return ''
  if (buff.kind === BUFF_KINDS.MARK_BONUS) {
    return `+${buff.value} marcas (${buff.turnsRemaining}t) · ${buff.sourceName}`
  }
  return buff.sourceName || 'Buff'
}
