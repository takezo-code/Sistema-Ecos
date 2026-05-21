import { useMemo, useCallback } from 'react'
import { useCharacterStore } from '../store/useCharacterStore'

/** Personagem sempre lido do store (reativo a alterações em Gerenciamento). */
export function useCharacterEntity(characterId) {
  const characters = useCharacterStore(s => s.characters)
  return useMemo(
    () => (characterId ? characters.find(c => c.id === characterId) ?? null : null),
    [characters, characterId],
  )
}

/**
 * Handlers e estado compartilhados entre Gerenciamento → Personagens e Em jogo → Ficha.
 * Garante paridade de ações e entidade sempre atualizada via Zustand.
 */
export function useCharacterManagementPanel(characterId, { adminMode = false } = {}) {
  const entity = useCharacterEntity(characterId)

  const updateCharacter = useCharacterStore(s => s.updateCharacter)
  const addXp = useCharacterStore(s => s.addXp)
  const changeAttribute = useCharacterStore(s => s.changeAttribute)
  const setMasterAttribute = useCharacterStore(s => s.setMasterAttribute)
  const changeSocialAttribute = useCharacterStore(s => s.changeSocialAttribute)
  const spendPendingAttribute = useCharacterStore(s => s.spendPendingAttribute)
  const spendPendingSocialAttribute = useCharacterStore(s => s.spendPendingSocialAttribute)
  const setMasterProgression = useCharacterStore(s => s.setMasterProgression)
  const syncMasterProgression = useCharacterStore(s => s.syncMasterProgression)
  const clampMasterAuxiliary = useCharacterStore(s => s.clampMasterAuxiliary)
  const scaleMasterAttributesToBudget = useCharacterStore(s => s.scaleMasterAttributesToBudget)
  const lastMasterError = useCharacterStore(s => s.lastMasterError)
  const unlockSkill = useCharacterStore(s => s.unlockSkill)
  const useEcoSkill = useCharacterStore(s => s.useEcoSkill)
  const learnCatalogSkill = useCharacterStore(s => s.learnCatalogSkill)
  const removeSkill = useCharacterStore(s => s.removeSkill)
  const restEcoOverload = useCharacterStore(s => s.restEcoOverload)
  const setEcoOverloadLevel = useCharacterStore(s => s.setEcoOverloadLevel)
  const lastOverloadEvents = useCharacterStore(s => s.lastOverloadEvents)
  const lastLevelUps = useCharacterStore(s => s.lastLevelUps)
  const clearLevelUps = useCharacterStore(s => s.clearLevelUps)
  const clearOverloadEvents = useCharacterStore(s => s.clearOverloadEvents)
  const clearMasterError = useCharacterStore(s => s.clearMasterError)

  const clearPanelSession = useCallback(() => {
    clearLevelUps()
    clearOverloadEvents()
    clearMasterError()
  }, [clearLevelUps, clearOverloadEvents, clearMasterError])

  const panelProps = useMemo(() => {
    if (!characterId) return null
    const id = characterId
    return {
      showProgression: true,
      adminMode,
      levelUps: lastLevelUps,
      onUpdate: data => updateCharacter(id, data),
      onAddXp: amount => addXp(id, amount),
      onChangeAttribute: (key, val, opts) => {
        if (opts?.admin) return setMasterAttribute(id, key, val)
        return changeAttribute(id, key, val, opts)
      },
      onChangeSocialAttribute: (key, val) => changeSocialAttribute(id, key, val),
      onSpendPendingSocialAttribute: key => spendPendingSocialAttribute(id, key),
      onMasterProgression: patch => setMasterProgression(id, patch),
      onSyncProgression: () => syncMasterProgression(id),
      onClampAuxiliary: () => clampMasterAuxiliary(id),
      onScaleAttributes: () => scaleMasterAttributesToBudget(id),
      masterError: lastMasterError,
      onSpendPendingAttribute: key => spendPendingAttribute(id, key),
      onUnlockSkill: () => unlockSkill(id),
      onUseSkill: (skillId, opts) => useEcoSkill(id, skillId, opts),
      onLearnCatalogSkill: templateId => learnCatalogSkill(id, templateId),
      onRemoveSkill: skillId => removeSkill(id, skillId),
      onRestOverload: () => restEcoOverload(id),
      onSetOverload: level => setEcoOverloadLevel(id, level),
      lastOverloadEvents,
      onClearOverloadEvents: clearOverloadEvents,
    }
  }, [
    characterId,
    adminMode,
    lastLevelUps,
    lastMasterError,
    lastOverloadEvents,
    updateCharacter,
    addXp,
    changeAttribute,
    setMasterAttribute,
    changeSocialAttribute,
    spendPendingSocialAttribute,
    setMasterProgression,
    syncMasterProgression,
    clampMasterAuxiliary,
    scaleMasterAttributesToBudget,
    spendPendingAttribute,
    unlockSkill,
    useEcoSkill,
    learnCatalogSkill,
    removeSkill,
    restEcoOverload,
    setEcoOverloadLevel,
    clearOverloadEvents,
  ])

  return { entity, panelProps, clearPanelSession }
}
