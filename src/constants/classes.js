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
    label: 'Traçado',
    description: 'Desenha a trajetória no Eco. A precisão vem cedo; o olhar já mede o campo quando os outros ainda se posicionam.',
    color: '#06b6d4',
    attributes: ['destreza', 'carisma'],
    weapons: ['arma_distancia'],
    passive: {
      name: 'Olho do Traçado',
      description: 'A mira nasce pronta. A precisão vem por natureza, e a percepção acompanha o olhar — o Traçado vê mais, e vê antes.',
      narrative: true,
    },
  },
  {
    id: 'tank',
    label: 'Baluarte',
    description: 'Segura a linha no Eco. O corpo entra na frente; o impacto encontra ele antes de encontrar o grupo.',
    color: '#16a34a',
    attributes: ['vitalidade', 'vontade'],
    weapons: ['escudo_medio', 'escudo_grande', 'arma_duas_maos', 'arma_uma_mao'],
    passive: {
      name: 'Muralha Viva',
      description: 'Onde o Baluarte pisa, a linha para de ceder. O impacto o escolhe primeiro e o grupo respira atrás da muralha.',
      narrative: true,
    },
  },
  {
    id: 'porradeiro',
    label: 'Fratura',
    description: 'Força bruta que parte o corpo e o instante. Quando a vida aperta, o golpe pesa mais.',
    color: '#dc2626',
    attributes: ['forca', 'vontade'],
    weapons: ['arma_duas_maos', 'manoplas'],
    passive: {
      name: 'Fúria da Queda',
      description: 'Quando restam 5 marcas de vida ou menos, Fúria Cega ganha +2 de Força extra — em qualquer nível. O recuo da skill continua só o do nível.',
      narrative: false,
    },
  },
  {
    id: 'magica',
    label: 'Fenda',
    description: 'Abre rachaduras no Eco. Dobra o que se vê, prende a mente e amplia o canal da Ruptura.',
    color: '#a855f7',
    attributes: ['ruptura', 'sabedoria'],
    weapons: ['orbe', 'varinha', 'cajado', 'livro'],
  },
  {
    id: 'suporte',
    label: 'Sutura',
    description: 'Cose o Eco no corpo e na mente. A Sutura lê o que está partido e puxa de volta ao lugar.',
    color: '#fbbf24',
    attributes: ['inteligencia', 'sabedoria'],
    weapons: ['orbe', 'varinha', 'cajado', 'livro'],
    passive: {
      name: 'Descanso no Void',
      description: 'Quando a Sutura descansa no Void, os usos de Eco resetam completamente. O corpo volta limpo.',
      narrative: true,
    },
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
