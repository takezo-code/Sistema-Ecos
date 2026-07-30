import { ATTRIBUTES, SOCIAL_ATTRIBUTES } from './attributes'

/**
 * Classes de personagem.
 *
 * Cada classe define 2 atributos-chave (1 físico + 1 de cena). Esses atributos
 * rendem bônus extra nas rolagens — ver mechanics/classes/classBonusEngine.
 */
export const CHARACTER_CLASSES = [
  {
    id: 'atirador',
    label: 'Atirador',
    description: 'Precisão à distância e leitura do alvo.',
    color: '#06b6d4',
    attributes: ['destreza', 'carisma'],
    weapons: ['arma_distancia'],
  },
  {
    id: 'tank',
    label: 'Tank',
    description: 'Segura a linha de frente e absorve o castigo.',
    color: '#16a34a',
    attributes: ['vitalidade', 'vontade'],
    weapons: ['escudo_medio', 'escudo_grande', 'arma_duas_maos', 'arma_uma_mao'],
  },
  {
    id: 'porradeiro',
    label: 'Porradeiro',
    description: 'Dano bruto no corpo a corpo, na base da insistência.',
    color: '#dc2626',
    attributes: ['forca', 'vontade'],
    weapons: ['arma_duas_maos', 'manoplas'],
  },
  {
    id: 'magica',
    label: 'Mágica',
    description: 'Manipulação do Eco e do tempo.',
    color: '#a855f7',
    attributes: ['ruptura', 'sabedoria'],
    weapons: ['orbe', 'varinha', 'cajado', 'livro'],
  },
  {
    id: 'suporte',
    label: 'Suporte',
    description: 'Sustenta o grupo com leitura de campo e informação.',
    color: '#fbbf24',
    attributes: ['inteligencia', 'percepcao'],
    weapons: ['orbe', 'varinha', 'cajado', 'livro'],
  },
]

const CLASS_BY_ID = new Map(CHARACTER_CLASSES.map(c => [c.id, c]))

// ATTRIBUTES/SOCIAL_ATTRIBUTES só podem ser lidos dentro de funções: attributes.js
// importa este módulo de volta, então no topo eles ainda não foram inicializados.
let socialKeysCache = null
function socialAttributeKeys() {
  if (!socialKeysCache) socialKeysCache = new Set(SOCIAL_ATTRIBUTES.map(a => a.key))
  return socialKeysCache
}

let attributeLabelCache = null
function attributeLabels() {
  if (!attributeLabelCache) {
    attributeLabelCache = new Map(
      [...ATTRIBUTES, ...SOCIAL_ATTRIBUTES].map(a => [a.key, a.label])
    )
  }
  return attributeLabelCache
}

/** `null` = personagem sem classe definida. */
export function normalizeClassId(value) {
  if (!value) return null
  const key = String(value).toLowerCase().trim()
  return CLASS_BY_ID.has(key) ? key : null
}

/** Aceita o id da classe ou a própria entidade. */
export function getCharacterClass(classIdOrEntity) {
  const id = typeof classIdOrEntity === 'object' && classIdOrEntity !== null
    ? classIdOrEntity.classId
    : classIdOrEntity
  return CLASS_BY_ID.get(normalizeClassId(id)) ?? null
}

export function getClassLabel(classIdOrEntity) {
  return getCharacterClass(classIdOrEntity)?.label ?? null
}

/** Os 2 atributos-chave da classe (vazio se não houver classe). */
export function getClassAttributeKeys(classIdOrEntity) {
  return getCharacterClass(classIdOrEntity)?.attributes ?? []
}

export function isClassAttribute(classIdOrEntity, attrKey) {
  return getClassAttributeKeys(classIdOrEntity).includes(attrKey)
}

export function isSocialAttributeKey(attrKey) {
  return socialAttributeKeys().has(attrKey)
}

/** Valor **base** do atributo (físico ou de cena), sem penalidade de estado. */
export function getBaseAttributeValue(entity = {}, attrKey) {
  const source = isSocialAttributeKey(attrKey)
    ? entity.socialAttributes
    : entity.attributes
  return Math.max(0, Number(source?.[attrKey]) || 0)
}

export function getAttributeLabel(attrKey) {
  return attributeLabels().get(attrKey) ?? attrKey
}

export function getClassAttributeLabels(classIdOrEntity) {
  return getClassAttributeKeys(classIdOrEntity).map(getAttributeLabel)
}
