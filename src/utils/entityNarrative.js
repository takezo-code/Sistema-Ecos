/** Campos narrativos de personagem (sem segredos). */
export function resolveCharacterNarrative(entity) {
  const legacyDesc =
    entity?.description?.trim() &&
    !entity?.appearance?.trim() &&
    !entity?.personality?.trim() &&
    !entity?.history?.trim()
  const legacyStatus =
    entity?.narrativeStatus?.trim() &&
    !entity?.motivation?.trim()
  return {
    appearance: entity?.appearance ?? '',
    personality: entity?.personality ?? '',
    history: entity?.history ?? (legacyDesc ? entity.description : ''),
    motivation: entity?.motivation ?? (legacyStatus ? entity.narrativeStatus : ''),
  }
}

/** Campos narrativos de NPC (inclui segredos). */
export function resolveNpcNarrative(entity) {
  const legacy =
    entity?.description?.trim() &&
    !entity?.appearance?.trim() &&
    !entity?.personality?.trim() &&
    !entity?.history?.trim()
  return {
    appearance: entity?.appearance ?? '',
    personality: entity?.personality ?? '',
    history: entity?.history ?? (legacy ? entity.description : ''),
    motivation: entity?.motivation ?? '',
    secret: entity?.secret ?? '',
  }
}

export function hasAnyNarrativeText(fields) {
  return Object.values(fields).some(v => v?.trim())
}
