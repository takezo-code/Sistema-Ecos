/**
 * Tipos de equipamento do sistema.
 * Armas → tipos com mãos + atributo principal
 * Armaduras → leve / média / pesada
 *
 * Armas NÃO concedem skills nem bônus de ataque/resistência.
 * Passivas (slots pela raridade) serão preenchidas depois.
 */

import { CHARACTER_CLASSES } from './classes'

// ─────────────────────────────────────────────
// Armas
// ─────────────────────────────────────────────
export const WEAPON_TYPES = [
  {
    id: 'arma_distancia',
    label: 'Arma à Distância',
    icon: '🏹',
    color: '#06b6d4',
    hands: 2,
    handsLabel: 'duas mãos',
    mainAttr: 'destreza',
    mainAttrLabel: 'DES',
    tags: ['distância'],
    mechDesc: 'Armas de longa distância (arco, rifle, etc.). Ocupa as duas mãos. Usa Destreza.',
  },
  {
    id: 'orbe',
    label: 'Orbe',
    icon: '🔮',
    color: '#a855f7',
    hands: 1,
    handsLabel: 'uma mão',
    mainAttr: 'ruptura',
    mainAttrLabel: 'RUP',
    tags: ['mágica', 'eco'],
    mechDesc: 'Foco arcano de uma mão. Preferido por Mágica e Suporte. Usa Ruptura.',
  },
  {
    id: 'varinha',
    label: 'Varinha',
    icon: '✨',
    color: '#c084fc',
    hands: 1,
    handsLabel: 'uma mão',
    mainAttr: 'ruptura',
    mainAttrLabel: 'RUP',
    tags: ['mágica', 'eco'],
    mechDesc: 'Canal fino de Eco. Uma mão. Preferido por Mágica e Suporte. Usa Ruptura.',
  },
  {
    id: 'cajado',
    label: 'Cajado',
    icon: '🪄',
    color: '#8b5cf6',
    hands: 2,
    handsLabel: 'duas mãos',
    mainAttr: 'inteligencia',
    mainAttrLabel: 'INT',
    tags: ['mágica', 'eco'],
    mechDesc: 'Canal de Eco de duas mãos. Preferido por Mágica e Suporte. Usa Inteligência ou Ruptura.',
  },
  {
    id: 'livro',
    label: 'Livro',
    icon: '📖',
    color: '#06b6d4',
    hands: 1,
    handsLabel: 'uma mão',
    mainAttr: 'inteligencia',
    mainAttrLabel: 'INT',
    tags: ['mágica', 'suporte'],
    mechDesc: 'Grimório ou tomo. Uma mão. Preferido por Mágica e Suporte. Usa Inteligência.',
  },
  {
    id: 'escudo_medio',
    label: 'Escudo Médio',
    icon: '🛡️',
    color: '#6b7280',
    hands: 1,
    handsLabel: 'uma mão',
    mainAttr: 'vitalidade',
    mainAttrLabel: 'VIT',
    tags: ['defesa'],
    mechDesc: 'Escudo de uma mão. Combina com arma de uma mão. Preferido por Tank. Usa Vitalidade.',
  },
  {
    id: 'escudo_grande',
    label: 'Escudo Grande',
    icon: '🛡',
    color: '#9ca3af',
    hands: 2,
    handsLabel: 'duas mãos',
    mainAttr: 'vitalidade',
    mainAttrLabel: 'VIT',
    tags: ['defesa', 'pesada'],
    mechDesc: 'Escudo de torre / grande. Ocupa as duas mãos. Preferido por Tank. Usa Vitalidade.',
  },
  {
    id: 'arma_duas_maos',
    label: 'Arma de Duas Mãos',
    icon: '⚔️',
    color: '#ef4444',
    hands: 2,
    handsLabel: 'duas mãos',
    mainAttr: 'forca',
    mainAttrLabel: 'FOR',
    tags: ['corpo a corpo', 'pesada'],
    mechDesc: 'Espadas grandes, porretes, machados. Ocupa as duas mãos. Preferido por Tank e Porradeiro. Usa Força.',
  },
  {
    id: 'arma_uma_mao',
    label: 'Arma de Uma Mão',
    icon: '🗡️',
    color: '#f97316',
    hands: 1,
    handsLabel: 'uma mão',
    mainAttr: 'forca',
    mainAttrLabel: 'FOR',
    tags: ['corpo a corpo'],
    mechDesc: 'Espada, maça ou similar de uma mão. Combina com escudo. Preferido por Tank. Usa Força.',
  },
  {
    id: 'manoplas',
    label: 'Manoplas',
    icon: '🥊',
    color: '#dc2626',
    hands: 1,
    handsLabel: 'uma mão',
    mainAttr: 'forca',
    mainAttrLabel: 'FOR',
    tags: ['corpo a corpo', 'impacto'],
    mechDesc: 'Luvas blindadas, soqueira, pedaço de ferro. Preferido por Porradeiro. Usa Força.',
  },
]

/** Mapeia tipos legados do catálogo antigo → novos ids. */
export const LEGACY_WEAPON_TYPE_MAP = {
  armas_de_fogo: 'arma_distancia',
  arco_e_flecha: 'arma_distancia',
  orbe_maligna: 'orbe',
  escudo: 'escudo_medio',
}

// ─────────────────────────────────────────────
// Armaduras
// ─────────────────────────────────────────────
export const ARMOR_TYPES = [
  {
    id: 'leve',
    label: 'Armadura Leve',
    icon: '🥋',
    color: '#16a34a',
    penaltyDestreza: 1,
    markBonus: 1,
    mechDesc: '−1 Destreza · +1 limiar de marcas (aguenta mais antes de Ferido).',
  },
  {
    id: 'media',
    label: 'Armadura Média',
    icon: '🔰',
    color: '#d97706',
    penaltyDestreza: 2,
    markBonus: 2,
    mechDesc: '−2 Destreza · +2 limiar de marcas.',
  },
  {
    id: 'pesada',
    label: 'Armadura Pesada',
    icon: '🛡',
    color: '#dc2626',
    penaltyDestreza: 3,
    markBonus: 3,
    mechDesc: '−3 Destreza · +3 limiar de marcas. Proteção máxima, mobilidade mínima.',
  },
]

// ─────────────────────────────────────────────
// Lookups
// ─────────────────────────────────────────────
export const WEAPON_TYPE_MAP = Object.fromEntries(WEAPON_TYPES.map(t => [t.id, t]))
export const ARMOR_TYPE_MAP = Object.fromEntries(ARMOR_TYPES.map(t => [t.id, t]))

export function normalizeWeaponTypeId(id) {
  if (!id) return null
  const key = String(id)
  if (WEAPON_TYPE_MAP[key]) return key
  const mapped = LEGACY_WEAPON_TYPE_MAP[key]
  return mapped && WEAPON_TYPE_MAP[mapped] ? mapped : null
}

export function getWeaponType(id) {
  return WEAPON_TYPE_MAP[normalizeWeaponTypeId(id)] ?? null
}

export function getArmorType(id) {
  return ARMOR_TYPE_MAP[id] ?? null
}

export function getEquipmentType(category, id) {
  return category === 'arma' ? getWeaponType(id) : getArmorType(id)
}

// ─────────────────────────────────────────────
// Raridade → slots de passivas (armas)
// ─────────────────────────────────────────────
export const RARITY_META = {
  comum:    { label: 'Comum',    color: '#6b7280', passiveSlots: 1 },
  incomum:  { label: 'Incomum',  color: '#16a34a', passiveSlots: 2 },
  raro:     { label: 'Raro',     color: '#06b6d4', passiveSlots: 3 },
  lendario: { label: 'Lendário', color: '#a855f7', passiveSlots: 4 },
}

export const RARITY_OPTIONS = Object.entries(RARITY_META).map(([id, m]) => ({ id, ...m }))

export function getRarityMeta(rarity) {
  return RARITY_META[rarity] ?? RARITY_META.comum
}

/** Quantidade de slots de passiva pela raridade (armas). */
export function getPassiveSlotsForRarity(rarity) {
  return getRarityMeta(rarity).passiveSlots
}

/**
 * Tipos de arma que a classe usa sem penalidade.
 * Fonte: CHARACTER_CLASSES[].weapons
 * Fora disso → −3 nas rolagens (ver weaponProficiencyEngine).
 */
export function getClassWeaponTypes(classId) {
  const cls = CHARACTER_CLASSES.find(c => c.id === classId)
  return cls?.weapons ?? []
}

export function isWeaponProficientForClass(classId, weaponTypeId) {
  const type = normalizeWeaponTypeId(weaponTypeId)
  if (!type || !classId) return false
  return getClassWeaponTypes(classId).includes(type)
}
