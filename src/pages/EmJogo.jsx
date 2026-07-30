import React, { useEffect, useState } from 'react'
import { Swords, UsersRound, Clapperboard, Store } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { ManageGroups } from './ManageGroups'
import { ManageScene } from './ManageScene'
import { ManageCombat } from './ManageCombat'
import { Merchant } from './Merchant'

const VIEW_META = {
  ficha: { title: 'Ficha', icon: UsersRound },
  cena: { title: 'Cena', icon: Clapperboard },
  combat: { title: 'Combate', icon: Swords },
  mercador: { title: 'Mercador', icon: Store },
}

const SUBTITLES = {
  ficha: 'PARTY · NÍVEIS · CONDIÇÃO · XP EM GRUPO',
  cena: 'AÇÕES · ROLAGENS · SKILLS · NOTAS DA CENA',
  combat: 'INIMIGOS · TURNO · DANO · BOSS',
  mercador: 'CATALISADOR DE GRAU · ITENS ESPECIAIS',
}

export function EmJogo({ initialView = 'ficha', onViewChange }) {
  const [activeView, setActiveView] = useState(initialView)

  useEffect(() => {
    if (initialView) setActiveView(initialView)
  }, [initialView])

  const meta = VIEW_META[activeView] || VIEW_META.ficha
  const HeaderIcon = meta.icon

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        icon={HeaderIcon}
        title={meta.title}
        subtitle={SUBTITLES[activeView] || ''}
      />

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeView === 'ficha' && <ManageGroups />}
        {activeView === 'cena' && <ManageScene />}
        {activeView === 'combat' && <ManageCombat />}
        {activeView === 'mercador' && <Merchant />}
      </div>
    </div>
  )
}
