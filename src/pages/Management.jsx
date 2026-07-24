import React, { useEffect, useMemo, useState } from 'react'
import { Skull, Sword, Building2, ShieldAlert, Shield } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { ManageCharacters } from './ManageCharacters'
import { ManageNPCs } from './ManageNPCs'
import { ManageBoss } from './ManageBoss'
import { ManageOrganizations } from './ManageOrganizations'
import { EquipmentCatalogView } from './EquipmentCatalogView'
import { SkillsCatalogView } from './SkillsCatalogView'
import { useEquipmentStore } from '../store/useEquipmentStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { WEAPON_TYPES, ARMOR_TYPES } from '../constants/equipmentTypes'
import { SKILL_AUDIENCE } from '../constants/skillAudience'
import {
  MANAGEMENT_VIEWS,
  normalizeManagementView,
} from '../constants/managementViews'

export { MANAGEMENT_VIEWS, skillAudienceToManagementView } from '../constants/managementViews'

const WEAPON_TYPE_MAP_BY_ID = Object.fromEntries(WEAPON_TYPES.map(t => [t.id, t]))
const ARMOR_TYPE_MAP_BY_ID = Object.fromEntries(ARMOR_TYPES.map(t => [t.id, t]))

const VIEW_META = {
  [MANAGEMENT_VIEWS.CHARACTERS]: { title: 'Personagens', icon: Sword },
  [MANAGEMENT_VIEWS.NPCS]: { title: 'NPCs', icon: Skull },
  [MANAGEMENT_VIEWS.BOSS]: { title: 'Boss', icon: ShieldAlert },
  [MANAGEMENT_VIEWS.ORGANIZATIONS]: { title: 'Organizações', icon: Building2 },
  [MANAGEMENT_VIEWS.ARMAS]: { title: 'Armas', icon: Sword },
  [MANAGEMENT_VIEWS.ARMADURA]: { title: 'Armadura', icon: Shield },
  [MANAGEMENT_VIEWS.SKILLS_CHARACTER]: { title: 'Skills Personagem', icon: Sword },
  [MANAGEMENT_VIEWS.SKILLS_NPC]: { title: 'Skills NPC', icon: Skull },
  [MANAGEMENT_VIEWS.SKILLS_BOSS]: { title: 'Skills Boss', icon: ShieldAlert },
}

const SUBTITLES = {
  [MANAGEMENT_VIEWS.CHARACTERS]: 'STATUS · NÍVEL · XP · MOCHILA',
  [MANAGEMENT_VIEWS.NPCS]: 'STATUS · NÍVEL · XP · MOCHILA',
  [MANAGEMENT_VIEWS.BOSS]: 'VIDA · MARCAS · PAPEL DE COMBATE',
  [MANAGEMENT_VIEWS.ORGANIZATIONS]: 'FAÇÕES · ALIADOS · INIMIGOS',
  [MANAGEMENT_VIEWS.ARMAS]: 'CATÁLOGO · ARMAS DE FOGO · CORPO A CORPO · ECO',
  [MANAGEMENT_VIEWS.ARMADURA]: 'CATÁLOGO · LEVE · MÉDIA · PESADA',
  [MANAGEMENT_VIEWS.SKILLS_CHARACTER]: 'CATÁLOGO · PERSONAGENS JOGÁVEIS',
  [MANAGEMENT_VIEWS.SKILLS_NPC]: 'CATÁLOGO · NPCs',
  [MANAGEMENT_VIEWS.SKILLS_BOSS]: 'CATÁLOGO · BOSSES E INIMIGOS',
}

export function Management({
  initialView = MANAGEMENT_VIEWS.CHARACTERS,
  onViewChange,
  onNavigate,
}) {
  const [activeView, setActiveView] = useState(() => normalizeManagementView(initialView))
  const { items } = useEquipmentStore()
  const activeCampaignId = useCampaignStore(s => s.activeCampaignId)

  useEffect(() => {
    if (initialView) setActiveView(normalizeManagementView(initialView))
  }, [initialView])

  const campaignItems = useMemo(
    () => items.filter(i => !i.campaignId || i.campaignId === activeCampaignId),
    [items, activeCampaignId]
  )

  const weaponItems = campaignItems.filter(i => i.category === 'arma')
  const armorItems = campaignItems.filter(i => i.category === 'armadura')

  const meta = VIEW_META[activeView] || VIEW_META[MANAGEMENT_VIEWS.CHARACTERS]
  const HeaderIcon = meta.icon

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        icon={HeaderIcon}
        title={meta.title}
        subtitle={SUBTITLES[activeView] || ''}
      />

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeView === MANAGEMENT_VIEWS.CHARACTERS && <ManageCharacters embedded />}
        {activeView === MANAGEMENT_VIEWS.NPCS && <ManageNPCs embedded />}
        {activeView === MANAGEMENT_VIEWS.BOSS && <ManageBoss embedded />}
        {activeView === MANAGEMENT_VIEWS.ORGANIZATIONS && <ManageOrganizations />}
        {activeView === MANAGEMENT_VIEWS.ARMAS && (
          <EquipmentCatalogView
            category="arma"
            items={weaponItems}
            typesMeta={WEAPON_TYPE_MAP_BY_ID}
          />
        )}
        {activeView === MANAGEMENT_VIEWS.ARMADURA && (
          <EquipmentCatalogView
            category="armadura"
            items={armorItems}
            typesMeta={ARMOR_TYPE_MAP_BY_ID}
          />
        )}
        {activeView === MANAGEMENT_VIEWS.SKILLS_CHARACTER && (
          <SkillsCatalogView audience={SKILL_AUDIENCE.CHARACTER} />
        )}
        {activeView === MANAGEMENT_VIEWS.SKILLS_NPC && (
          <SkillsCatalogView audience={SKILL_AUDIENCE.NPC} />
        )}
        {activeView === MANAGEMENT_VIEWS.SKILLS_BOSS && (
          <SkillsCatalogView audience={SKILL_AUDIENCE.BOSS} />
        )}
      </div>
    </div>
  )
}
