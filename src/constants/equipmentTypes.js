/**
 * Tipos de equipamento do sistema.
 * Armas → tipos + atributo principal (neutros quanto a mãos)
 * Armaduras → leve / média / pesada
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
    mainAttr: 'destreza',
    mainAttrLabel: 'DES',
    tags: ['distância'],
    mechDesc: 'Armas de longa distância (arco, rifle, etc.). Usa Destreza.',
  },
  {
    id: 'orbe',
    label: 'Orbe',
    icon: '🔮',
    color: '#a855f7',
    mainAttr: 'ruptura',
    mainAttrLabel: 'RUP',
    tags: ['mágica', 'eco'],
    mechDesc: 'Foco arcano. Preferido por Fenda e Sutura. Usa Ruptura.',
  },
  {
    id: 'varinha',
    label: 'Varinha',
    icon: '✨',
    color: '#c084fc',
    mainAttr: 'ruptura',
    mainAttrLabel: 'RUP',
    tags: ['mágica', 'eco'],
    mechDesc: 'Canal fino de Eco. Preferido por Fenda e Sutura. Usa Ruptura.',
  },
  {
    id: 'cajado',
    label: 'Cajado',
    icon: '🪄',
    color: '#8b5cf6',
    mainAttr: 'inteligencia',
    mainAttrLabel: 'INT',
    tags: ['mágica', 'eco'],
    mechDesc: 'Canal de Eco. Preferido por Fenda e Sutura. Usa Inteligência ou Ruptura.',
  },
  {
    id: 'livro',
    label: 'Livro',
    icon: '📖',
    color: '#06b6d4',
    mainAttr: 'inteligencia',
    mainAttrLabel: 'INT',
    tags: ['mágica', 'suporte'],
    mechDesc: 'Grimório ou tomo. Preferido por Fenda e Sutura. Usa Inteligência.',
  },
  {
    id: 'escudo_medio',
    label: 'Escudo Médio',
    icon: '🛡️',
    color: '#6b7280',
    mainAttr: 'vitalidade',
    mainAttrLabel: 'VIT',
    tags: ['defesa'],
    mechDesc: 'Escudo médio. Preferido por Baluarte. Usa Vitalidade.',
  },
  {
    id: 'escudo_grande',
    label: 'Escudo Grande',
    icon: '🛡',
    color: '#9ca3af',
    mainAttr: 'vitalidade',
    mainAttrLabel: 'VIT',
    tags: ['defesa', 'pesada'],
    mechDesc: 'Escudo de torre / grande. Preferido por Baluarte. Usa Vitalidade.',
  },
  {
    id: 'arma_duas_maos',
    label: 'Arma Pesada',
    icon: '⚔️',
    color: '#ef4444',
    mainAttr: 'forca',
    mainAttrLabel: 'FOR',
    tags: ['corpo a corpo', 'pesada'],
    mechDesc: 'Espadas grandes, porretes, machados. Preferido por Baluarte e Fratura. Usa Força.',
  },
  {
    id: 'arma_uma_mao',
    label: 'Arma',
    icon: '🗡️',
    color: '#f97316',
    mainAttr: 'forca',
    mainAttrLabel: 'FOR',
    tags: ['corpo a corpo'],
    mechDesc: 'Espada, maça ou similar. Preferido por Baluarte. Usa Força.',
  },
  {
    id: 'manoplas',
    label: 'Manoplas',
    icon: '🥊',
    color: '#dc2626',
    mainAttr: 'forca',
    mainAttrLabel: 'FOR',
    tags: ['corpo a corpo', 'impacto'],
    mechDesc: 'Luvas blindadas, soqueira, pedaço de ferro. Preferido por Fratura. Usa Força.',
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
// Raridade — só armadura (nível do personagem)
// ─────────────────────────────────────────────
export const RARITY_META = {
  comum:    { label: 'Latente',     color: '#6b7280' },
  incomum:  { label: 'Ressonante',  color: '#16a34a' },
  raro:     { label: 'Fendida',     color: '#06b6d4' },
  lendario: { label: 'Atemporal',   color: '#a855f7' },
}

export const RARITY_OPTIONS = Object.entries(RARITY_META).map(([id, m]) => ({ id, ...m }))

export function getRarityMeta(rarity) {
  return RARITY_META[rarity] ?? RARITY_META.comum
}

/**
 * Tipos de arma sugeridos da classe (forja / flavor).
 * Fonte: CHARACTER_CLASSES[].weapons
 * Não há penalidade por usar outro tipo.
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
