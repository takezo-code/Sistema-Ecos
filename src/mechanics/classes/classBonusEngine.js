/**
 * Bônus de Classe nas rolagens.
 *
 * Os 2 atributos-chave da classe rendem bônus extra conforme os pontos
 * investidos neles na ficha (distribuição do personagem):
 *   3 pontos  → +1 na rolagem
 *   6 pontos  → +2 na rolagem
 *   9 pontos  → +3 na rolagem
 *
 * Equipamento NÃO conta para esse degrau — só soma na rolagem à parte.
 *
 * Exemplo: Atirador com Destreza 6 rola d20 → 12 do dado + 6 de Destreza + 2 de
 * classe = 20. Os +4 de uma arma somam depois, mas não viram degrau de classe.
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
  { points: 9, bonus: 3 },
  { points: 6, bonus: 2 },
  { points: 3, bonus: 1 },
]

export const MAX_CLASS_BONUS = CLASS_BONUS_TIERS[0].bonus

/** Bônus para um total de pontos, ignorando classe (0, +1, +2 ou +3). */
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
