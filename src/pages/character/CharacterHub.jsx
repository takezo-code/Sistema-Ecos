import React, { useEffect, useMemo } from 'react'
import { User } from 'lucide-react'
import { CharacterSidebar } from '../../components/character/CharacterSidebar'
import { useCharacterPanelStore, CHARACTER_PANEL_TABS } from '../../store/useCharacterPanelStore'
import { useCharacterStore } from '../../store/useCharacterStore'
import { useCampaignStore } from '../../store/useCampaignStore'
import { filterByActiveCampaign } from '../../utils/campaignScope'
import { Select } from '../../components/ui/Field'
import { EmptyState } from '../../components/ui/EmptyState'
import { ActiveCampaignBanner } from '../../components/ui/ActiveCampaignBanner'
import { CharacterSkills } from './CharacterSkills'
import { CharacterProfile } from './CharacterProfile'
import { CharacterInventory } from './CharacterInventory'
import { CharacterStatus } from './CharacterStatus'
import { CharacterEcos } from './CharacterEcos'
import { CharacterHistory } from './CharacterHistory'
import { CharacterSettings } from './CharacterSettings'

export function CharacterHub() {
  const { activeCampaignId } = useCampaignStore()
  const characters = useCharacterStore(s => s.characters)
  const updateCharacter = useCharacterStore(s => s.updateCharacter)
  const activateSkill = useCharacterStore(s => s.activateSkill)
  const advanceTurn = useCharacterStore(s => s.advanceTurn)
  const restEcoOverload = useCharacterStore(s => s.restEcoOverload)
  const investSkillPoint = useCharacterStore(s => s.investSkillPoint)
  const upgradeSkillGrade = useCharacterStore(s => s.upgradeSkillGrade)
  const removeSkill = useCharacterStore(s => s.removeSkill)
  const lastSkillError = useCharacterStore(s => s.lastSkillError)
  const clearSkillError = useCharacterStore(s => s.clearSkillError)
  const lastOverloadEvents = useCharacterStore(s => s.lastOverloadEvents)
  const clearOverloadEvents = useCharacterStore(s => s.clearOverloadEvents)
  const setEcoOverloadLevel = useCharacterStore(s => s.setEcoOverloadLevel)
  const changeAttribute = useCharacterStore(s => s.changeAttribute)
  const spendPendingAttribute = useCharacterStore(s => s.spendPendingAttribute)
  const addInventoryItem = useCharacterStore(s => s.addInventoryItem)
  const updateInventoryItem = useCharacterStore(s => s.updateInventoryItem)
  const removeInventoryItem = useCharacterStore(s => s.removeInventoryItem)
  const addEquippedItem = useCharacterStore(s => s.addEquippedItem)
  const removeEquippedItem = useCharacterStore(s => s.removeEquippedItem)
  const { selectedCharacterId, activeTab, selectCharacter, setActiveTab } = useCharacterPanelStore()

  const filtered = useMemo(
    () => filterByActiveCampaign(characters, activeCampaignId),
    [characters, activeCampaignId]
  )

  const character = filtered.find(c => c.id === selectedCharacterId) || filtered[0] || null

  useEffect(() => {
    if (filtered.length === 0) return
    const valid = filtered.some(c => c.id === selectedCharacterId)
    if (!valid) selectCharacter(filtered[0].id)
  }, [filtered.length, selectedCharacterId, selectCharacter])

  const renderTab = () => {
    if (!character) return null
    const id = character.id
  const props = {
      character,
      onUpdate: data => updateCharacter(id, data),
    }

    switch (activeTab) {
      case CHARACTER_PANEL_TABS.PROFILE:
        return <CharacterProfile {...props} />
      case CHARACTER_PANEL_TABS.INVENTORY:
        return (
          <CharacterInventory
            {...props}
            onAddItem={item => addInventoryItem(id, item)}
            onUpdateItem={(itemId, data) => updateInventoryItem(id, itemId, data)}
            onRemoveItem={itemId => removeInventoryItem(id, itemId)}
            onAddEquipped={item => addEquippedItem(id, item)}
            onRemoveEquipped={itemId => removeEquippedItem(id, itemId)}
          />
        )
      case CHARACTER_PANEL_TABS.STATUS:
        return (
          <CharacterStatus
            {...props}
            onChangeAttribute={(key, val, opts) => changeAttribute(id, key, val, opts)}
            onSpendPending={key => spendPendingAttribute(id, key)}
          />
        )
      case CHARACTER_PANEL_TABS.SKILLS:
        return (
          <CharacterSkills
            character={character}
            onActivate={skillId => activateSkill(id, skillId)}
            onAdvanceTurn={() => advanceTurn(id)}
            onRestEco={() => restEcoOverload(id)}
            onInvestSkillPoint={templateId => investSkillPoint(id, templateId)}
            onUpgradeSkillGrade={templateId => upgradeSkillGrade(id, templateId)}
            lastSkillError={lastSkillError}
            onClearSkillError={clearSkillError}
            lastOverloadEvents={lastOverloadEvents}
          />
        )
      case CHARACTER_PANEL_TABS.ECOS:
        return (
          <CharacterEcos
            {...props}
            onRestOverload={() => restEcoOverload(id)}
            onSetOverload={level => setEcoOverloadLevel(id, level)}
            lastOverloadEvents={lastOverloadEvents}
            onClearOverloadEvents={clearOverloadEvents}
          />
        )
      case CHARACTER_PANEL_TABS.HISTORY:
        return <CharacterHistory character={character} />
      case CHARACTER_PANEL_TABS.SETTINGS:
        return (
          <CharacterSettings
            character={character}
            onUpdate={data => updateCharacter(id, data)}
            onAdvanceTurn={() => advanceTurn(id)}
            onRestEco={() => restEcoOverload(id)}
            onRemoveSkill={skillId => removeSkill(id, skillId)}
          />
        )
      default:
        return <CharacterSkills character={character} />
    }
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {character ? (
        <CharacterSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          characterName={character.name}
        />
      ) : null}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <ActiveCampaignBanner />
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace' }}>PERSONAGEM ATIVO</span>
          {filtered.length > 0 ? (
            <Select
              value={character?.id || ''}
              onChange={e => selectCharacter(e.target.value)}
              style={{ minWidth: '200px', fontSize: '0.8rem' }}
            >
              {filtered.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          ) : (
            <span style={{ fontSize: '0.8rem', color: '#555' }}>Nenhum personagem na campanha</span>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={User}
            title="Sem personagem"
            description="Crie um personagem na campanha ativa para abrir a ficha."
          />
        ) : (
          <div style={{ flex: 1, overflow: 'hidden' }}>{renderTab()}</div>
        )}
      </div>
    </div>
  )
}
