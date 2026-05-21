import React, { useEffect, useState, useMemo } from 'react'
import { Sword, Shield, Sparkles } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { EquipmentCatalogView } from './EquipmentCatalogView'
import { EquipmentCreationHub } from './EquipmentCreationHub'
import { useEquipmentStore } from '../store/useEquipmentStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { WEAPON_TYPES, ARMOR_TYPES } from '../constants/equipmentTypes'

const WEAPON_TYPE_MAP_BY_ID = Object.fromEntries(WEAPON_TYPES.map(t => [t.id, t]))
const ARMOR_TYPE_MAP_BY_ID = Object.fromEntries(ARMOR_TYPES.map(t => [t.id, t]))

const VIEW_META = {
  armas: { title: 'Armas', icon: Sword },
  armadura: { title: 'Armadura', icon: Shield },
  creation: { title: 'Criação', icon: Sparkles },
}

const SUBTITLES = {
  armas: 'CATÁLOGO · ARMAS DE FOGO · CORPO A CORPO · ECO',
  armadura: 'CATÁLOGO · LEVE · MÉDIA · PESADA',
  creation: 'ARMA · ARMADURA',
}

export function Equipment({
  initialView = 'armas',
  initialCreationType,
  onCreationTypeConsumed,
  onViewChange,
}) {
  const [activeView, setActiveView] = useState(initialView)
  const { items } = useEquipmentStore()
  const activeCampaignId = useCampaignStore(s => s.activeCampaignId)

  useEffect(() => {
    if (initialView) setActiveView(initialView)
  }, [initialView])

  const handleViewChange = (view) => {
    setActiveView(view)
    onViewChange?.(view)
    if (view !== 'creation') onCreationTypeConsumed?.()
  }

  const campaignItems = useMemo(
    () => items.filter(i => !i.campaignId || i.campaignId === activeCampaignId),
    [items, activeCampaignId]
  )

  const weaponItems = campaignItems.filter(i => i.category === 'arma')
  const armorItems = campaignItems.filter(i => i.category === 'armadura')

  const meta = VIEW_META[activeView] || VIEW_META.armas
  const HeaderIcon = meta.icon

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        icon={HeaderIcon}
        title={meta.title}
        subtitle={SUBTITLES[activeView] || ''}
      />

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeView === 'armas' && (
          <EquipmentCatalogView
            category="arma"
            items={weaponItems}
            typesMeta={WEAPON_TYPE_MAP_BY_ID}
          />
        )}
        {activeView === 'armadura' && (
          <EquipmentCatalogView
            category="armadura"
            items={armorItems}
            typesMeta={ARMOR_TYPE_MAP_BY_ID}
          />
        )}
        {activeView === 'creation' && (
          <EquipmentCreationHub
            onViewChange={handleViewChange}
            initialCreationType={initialCreationType}
            onCreationTypeConsumed={onCreationTypeConsumed}
          />
        )}
      </div>
    </div>
  )
}
