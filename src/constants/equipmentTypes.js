/**
 * Tipos de equipamento do sistema.
 * Armas → 8 tipos  |  Armaduras → 3 tipos
 * Cada tipo define: label, ícone textual, cor, atributo principal de uso,
 * bônus padrão e descrição mecânica.
 */

// ─────────────────────────────────────────────
// Armas
// ─────────────────────────────────────────────
export const WEAPON_TYPES = [
  {
    id: 'armas_de_fogo',
    label: 'Arma de Fogo',
    icon: '🔫',
    color: '#dc2626',
    mainAttr: 'destreza',
    mainAttrLabel: 'DES',
    tags: ['distância', 'preciso'],
    mechDesc: 'Alta precisão à distância. Usa Destreza nas rolagens de ataque.',
    defaultBonusAtaque: 2,
    slots: 1,
  },
  {
    id: 'arco_e_flecha',
    label: 'Arco e Flecha',
    icon: '🏹',
    color: '#d97706',
    mainAttr: 'destreza',
    mainAttrLabel: 'DES',
    tags: ['distância', 'silencioso'],
    mechDesc: 'Ataques silenciosos à distância. Usa Destreza. Pode ignorar cobertura leve.',
    defaultBonusAtaque: 1,
    slots: 2,
  },
  {
    id: 'arma_duas_maos',
    label: 'Arma de Duas Mãos',
    icon: '⚔️',
    color: '#ef4444',
    mainAttr: 'forca',
    mainAttrLabel: 'FOR',
    tags: ['corpo a corpo', 'pesada'],
    mechDesc: 'Dano máximo corpo a corpo. Usa Força. Requer as duas mãos — sem escudo.',
    defaultBonusAtaque: 3,
    slots: 2,
  },
  {
    id: 'arma_uma_mao',
    label: 'Arma de Uma Mão',
    icon: '🗡️',
    color: '#f97316',
    mainAttr: 'forca',
    mainAttrLabel: 'FOR',
    tags: ['corpo a corpo', 'versátil'],
    mechDesc: 'Versátil. Pode ser usada com escudo. Usa Força ou Destreza.',
    defaultBonusAtaque: 2,
    slots: 1,
  },
  {
    id: 'escudo',
    label: 'Escudo',
    icon: '🛡️',
    color: '#6b7280',
    mainAttr: 'vitalidade',
    mainAttrLabel: 'VIT',
    tags: ['defesa', 'corpo a corpo'],
    mechDesc: '+1 resistência física. Pode ser usado com arma de uma mão. Usa Vitalidade.',
    defaultBonusAtaque: 0,
    defaultBonusResistencia: 1,
    slots: 1,
  },
  {
    id: 'orbe_maligna',
    label: 'Orbe Maligna',
    icon: '🔮',
    color: '#a855f7',
    mainAttr: 'ruptura',
    mainAttrLabel: 'RUP',
    tags: ['eco', 'arcano'],
    mechDesc: 'Amplifica poderes de Eco. Usa Ruptura. +1 sobrecarga ao usar skills ativas.',
    defaultBonusAtaque: 1,
    slots: 1,
  },
  {
    id: 'livro',
    label: 'Livro',
    icon: '📖',
    color: '#06b6d4',
    mainAttr: 'inteligencia',
    mainAttrLabel: 'INT',
    tags: ['eco', 'suporte'],
    mechDesc: 'Repositório de conhecimento. Usa Inteligência. Reduz custo de sobrecarga de skills passivas.',
    defaultBonusAtaque: 0,
    slots: 1,
  },
  {
    id: 'cajado',
    label: 'Cajado',
    icon: '🪄',
    color: '#8b5cf6',
    mainAttr: 'inteligencia',
    mainAttrLabel: 'INT',
    tags: ['eco', 'distância'],
    mechDesc: 'Canal de Eco à distância. Usa Inteligência ou Ruptura. +1 bônus em skills de Ruptura.',
    defaultBonusAtaque: 1,
    slots: 2,
  },
]

// ─────────────────────────────────────────────
// Armaduras
// ─────────────────────────────────────────────
export const ARMOR_TYPES = [
  {
    id: 'leve',
    label: 'Armadura Leve',
    icon: '🥋',
    color: '#16a34a',
    resistenciaFisica: 1,
    penaltyDestreza: 0,
    mechDesc: 'Mobilidade total. +1 resistência física. Sem penalidade de Destreza.',
  },
  {
    id: 'media',
    label: 'Armadura Média',
    icon: '🔰',
    color: '#d97706',
    resistenciaFisica: 2,
    penaltyDestreza: 1,
    mechDesc: 'Equilíbrio entre proteção e agilidade. +2 resistência física. −1 Destreza efetiva.',
  },
  {
    id: 'pesada',
    label: 'Armadura Pesada',
    icon: '🛡',
    color: '#dc2626',
    resistenciaFisica: 3,
    penaltyDestreza: 2,
    mechDesc: 'Proteção máxima. +3 resistência física. −2 Destreza efetiva. Proibido usar Eco.',
  },
]

// ─────────────────────────────────────────────
// Lookups
// ─────────────────────────────────────────────
export const WEAPON_TYPE_MAP = Object.fromEntries(WEAPON_TYPES.map(t => [t.id, t]))
export const ARMOR_TYPE_MAP  = Object.fromEntries(ARMOR_TYPES.map(t => [t.id, t]))

export function getWeaponType(id)  { return WEAPON_TYPE_MAP[id] ?? null }
export function getArmorType(id)   { return ARMOR_TYPE_MAP[id] ?? null }
export function getEquipmentType(category, id) {
  return category === 'arma' ? getWeaponType(id) : getArmorType(id)
}

// Raridade
export const RARITY_META = {
  comum:    { label: 'Comum',    color: '#6b7280' },
  incomum:  { label: 'Incomum',  color: '#16a34a' },
  raro:     { label: 'Raro',     color: '#06b6d4' },
  lendario: { label: 'Lendário', color: '#a855f7' },
}

export const RARITY_OPTIONS = Object.entries(RARITY_META).map(([id, m]) => ({ id, ...m }))
