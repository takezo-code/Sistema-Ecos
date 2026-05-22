/** NPC criado na aba NPC (não é Boss). */
export function isNarrativeNpc(npc) {
  return npc?.papelCombate !== 'boss'
}

/** Boss — ficha de combate completa na aba Boss. */
export function isCombatNpc(npc) {
  return npc?.papelCombate === 'boss'
}

/** Pode ser usado como inimigo contra jogadores (todos os NPCs por padrão). */
export function canEnterCombat(npc) {
  return npc?.papelCombate !== 'nenhum' || !!npc?.podeCombater
}
