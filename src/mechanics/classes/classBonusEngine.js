/**
 * Bônus de Classe nas rolagens.
 *
 * Os 2 atributos-chave da classe rendem bônus extra conforme os pontos
 * investidos neles:
 *   5 pontos  → +1 na rolagem
 *   10 pontos → +2 na rolagem
 *
 * Exemplo: Porradeiro com Força 5 rola d20 → 12 do dado + 5 de Força + 1 de
 * classe = 18.
 *
 * O bônus usa os pontos **base** do atributo. Ficar Ferido reduz o valor
 * efetivo nas rolagens, mas não tira o bônus de classe já conquistado.
 */
import {
  getBaseAttributeValue,
  getCharacterClass,
  isClassAttribute,
} from '../../constants/classes'

/** Ordem decrescente — o primeiro limiar atingido define o bônus. */
export const CLASS_BONUS_TIERS = [
  { points: 10, bonus: 2 },
  { points: 5, bonus: 1 },
]

export const MAX_CLASS_BONUS = CLASS_BONUS_TIERS[0].bonus

/** Bônus para um total de pontos, ignorando classe (0, +1 ou +2). */
export function getClassBonusForPoints(points) {
  const n = Math.max(0, Number(points) || 0)
  return CLASS_BONUS_TIERS.find(tier => n >= tier.points)?.bonus ?? 0
}

/** Pontos que ainda faltam para o próximo degrau, ou `null` no topo. */
export function getPointsToNextClassBonus(points) {
  const n = Math.max(0, Number(points) || 0)
  const next = [...CLASS_BONUS_TIERS].reverse().find(tier => n < tier.points)
  return next ? { points: next.points - n, bonus: next.bonus } : null
}

/** Bônus de classe da entidade para um atributo (0 se não for atributo da classe). */
export function getClassAttributeBonus(entity = {}, attrKey) {
  if (!isClassAttribute(entity.classId, attrKey)) return 0
  return getClassBonusForPoints(getBaseAttributeValue(entity, attrKey))
}

/**
 * Composição completa de uma rolagem de atributo.
 *
 * @param entity          - personagem (usa `classId` e os atributos base)
 * @param attrKey         - atributo rolado
 * @param effectiveValue  - valor efetivo do atributo (já com penalidade de estado)
 */
export function getRollBonusBreakdown(entity = {}, attrKey, effectiveValue) {
  const basePoints = getBaseAttributeValue(entity, attrKey)
  const attrBonus = effectiveValue == null
    ? basePoints
    : Math.max(0, Number(effectiveValue) || 0)
  const classBonus = getClassAttributeBonus(entity, attrKey)

  return {
    attrBonus,
    classBonus,
    basePoints,
    total: attrBonus + classBonus,
    isClassAttribute: isClassAttribute(entity.classId, attrKey),
    classLabel: getCharacterClass(entity)?.label ?? null,
  }
}

/** Ex.: "+1" · `null` quando não há bônus. */
export function formatClassBonus(bonus) {
  const n = Math.max(0, Number(bonus) || 0)
  return n > 0 ? `+${n}` : null
}

/** Resumo dos 2 atributos-chave da classe, para exibição na ficha. */
export function getClassBonusSummary(entity = {}) {
  const characterClass = getCharacterClass(entity)
  if (!characterClass) return null

  return {
    ...characterClass,
    bonuses: characterClass.attributes.map(key => {
      const points = getBaseAttributeValue(entity, key)
      return {
        attrKey: key,
        points,
        bonus: getClassBonusForPoints(points),
        next: getPointsToNextClassBonus(points),
      }
    }),
  }
}
