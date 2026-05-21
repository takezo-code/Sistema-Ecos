/** NPC de narrativa (não entra na aba Boss / combate). */
export function isNarrativeNpc(npc) {
  return !npc?.podeCombater
}

/** Inimigo de combate (Boss, elite, capanga). */
export function isCombatNpc(npc) {
  return !!npc?.podeCombater
}
