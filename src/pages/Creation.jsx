import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, Sword, Skull, Building2, ShieldAlert, Sparkles, Users,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { CreationChoiceCard } from '../components/creation/CreationChoiceCard'
import { Characters } from './Characters'
import { NPCs } from './NPCs'
import { Bosses } from './Bosses'
import { Organizations } from './Organizations'
import { SkillForm } from '../components/skills/SkillForm'
import { useCampaignStore } from '../store/useCampaignStore'
import { useSkillsCatalogStore } from '../store/useSkillsCatalogStore'
import { SKILL_AUDIENCE } from '../constants/skillAudience'
import { skillAudienceToManagementView } from '../constants/managementViews'

// ── Grupos (nível 1) ─────────────────────────────────────────────────
const GROUPS = {
  artefato: {
    id: 'artefato',
    label: 'Artefato',
    description: 'Personagem, NPC, boss ou organização da campanha.',
    icon: Users,
    color: '#dc2626',
    border: 'rgba(220,38,38,0.25)',
    bg: 'rgba(220,38,38,0.04)',
    needsCampaign: true,
  },
  skill: {
    id: 'skill',
    label: 'Criar Skill',
    description: 'Habilidades para NPC ou boss. Skills de personagem são pré-definidas.',
    icon: Sparkles,
    color: '#a855f7',
    border: 'rgba(168,85,247,0.25)',
    bg: 'rgba(168,85,247,0.04)',
    needsCampaign: false,
  },
}

const GROUP_ORDER = ['artefato', 'skill']

// ── Opções por grupo (nível 2) ───────────────────────────────────────
const ARTEFATO_TYPES = [
  {
    id: 'characters',
    label: 'Player',
    description: 'Personagem jogável com atributos, progressão e habilidades de Eco.',
    icon: Sword,
    color: '#9ca3af',
    border: 'rgba(156,163,175,0.2)',
    bg: 'rgba(156,163,175,0.04)',
    needsCampaign: true,
  },
  {
    id: 'npcs',
    label: 'NPC',
    description: 'Figura da narrativa — aliado, informante ou inimigo de cena.',
    icon: Skull,
    color: '#06b6d4',
    border: 'rgba(6,182,212,0.2)',
    bg: 'rgba(6,182,212,0.04)',
    needsCampaign: true,
  },
  {
    id: 'boss',
    label: 'Boss',
    description: 'Inimigo de combate com vida, atributos e XP ao derrotar.',
    icon: ShieldAlert,
    color: '#dc2626',
    border: 'rgba(220,38,38,0.2)',
    bg: 'rgba(220,38,38,0.04)',
    needsCampaign: true,
  },
  {
    id: 'organizations',
    label: 'Org',
    description: 'Facção, corporação, culto ou grupo organizado da campanha.',
    icon: Building2,
    color: '#d97706',
    border: 'rgba(217,119,6,0.2)',
    bg: 'rgba(217,119,6,0.04)',
    needsCampaign: true,
  },
]

const SKILL_TYPES = [
  {
    id: 'skill_npc',
    label: 'NPC',
    description: 'Habilidade exclusiva de NPCs — escolha manual no Gerenciamento.',
    icon: Skull,
    color: '#06b6d4',
    border: 'rgba(6,182,212,0.2)',
    bg: 'rgba(6,182,212,0.04)',
    audience: SKILL_AUDIENCE.NPC,
  },
  {
    id: 'skill_boss',
    label: 'Boss',
    description: 'Habilidade de inimigos poderosos e combatentes de elite.',
    icon: ShieldAlert,
    color: '#dc2626',
    border: 'rgba(220,38,38,0.2)',
    bg: 'rgba(220,38,38,0.04)',
    audience: SKILL_AUDIENCE.BOSS,
  },
]

const GROUP_CHILDREN = {
  artefato: ARTEFATO_TYPES,
  skill: SKILL_TYPES,
}

const ENTITY_IDS = new Set(ARTEFATO_TYPES.map(t => t.id))
const SKILL_IDS = new Set(SKILL_TYPES.map(t => t.id))

function resolveGroupForLeaf(typeId) {
  if (ENTITY_IDS.has(typeId)) return 'artefato'
  if (SKILL_IDS.has(typeId) || typeId === 'skill') return 'skill'
  return null
}

function BackBar({ onBack, label = 'Voltar' }) {
  return (
    <div style={{
      padding: '0.6rem 1.5rem',
      borderBottom: '1px solid #1a1a1a',
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
    }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'transparent',
          border: 'none',
          color: '#555',
          cursor: 'pointer',
          fontSize: '0.7rem',
          padding: '2px 0',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#e5e5e5' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#555' }}
      >
        <ArrowLeft size={13} />
        {label}
      </button>
    </div>
  )
}

function ChoiceGrid({ types, disabled, onClick }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem' }}>
      {types.map(type => (
        <CreationChoiceCard
          key={type.id}
          type={type}
          disabled={disabled?.(type) ?? false}
          onClick={onClick}
        />
      ))}
    </div>
  )
}

export function Creation({
  onNavigate,
  initialCreationType,
  onCreationTypeConsumed,
}) {
  const [group, setGroup] = useState(null)
  const [selected, setSelected] = useState(null)
  const { activeCampaignId } = useCampaignStore()
  const addSkill = useSkillsCatalogStore(s => s.addSkill)

  useEffect(() => {
    if (!initialCreationType) return
    const leafGroup = resolveGroupForLeaf(initialCreationType)
    if (GROUPS[initialCreationType]) {
      setGroup(initialCreationType)
      setSelected(null)
    } else if (leafGroup) {
      setGroup(leafGroup)
      setSelected(initialCreationType === 'skill' ? null : initialCreationType)
    }
    onCreationTypeConsumed?.()
  }, [initialCreationType, onCreationTypeConsumed])

  const skillMeta = useMemo(
    () => SKILL_TYPES.find(t => t.id === selected),
    [selected],
  )

  const openGroup = (groupId) => {
    const g = GROUPS[groupId]
    if (g?.needsCampaign && !activeCampaignId) return
    setGroup(groupId)
    setSelected(null)
  }

  const openLeaf = (typeId) => {
    const children = GROUP_CHILDREN[group] || []
    const type = children.find(t => t.id === typeId)
    if (type?.needsCampaign && !activeCampaignId) return
    setSelected(typeId)
  }

  const backToGroups = () => {
    setGroup(null)
    setSelected(null)
  }

  const backToGroup = () => setSelected(null)

  const handleEntitySuccess = (typeId) => {
    backToGroups()
    onNavigate?.('management', typeId)
  }

  const handleSkillCreate = (draft) => {
    const audience = skillMeta?.audience || draft.audience || SKILL_AUDIENCE.NPC
    addSkill({ ...draft, audience })
    backToGroups()
    onNavigate?.('management', skillAudienceToManagementView(audience))
  }

  // ── Fluxo de entidade ──────────────────────────────────────────────
  if (selected && ENTITY_IDS.has(selected)) {
    const flowProps = {
      embedded: true,
      onNavigate,
      autoOpenCreate: true,
      onCreateFlowClose: backToGroup,
      onCreateFlowSuccess: () => handleEntitySuccess(selected),
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <PageHeader icon={Sparkles} title="Criação" subtitle="ARTEFATO" />
        <BackBar onBack={backToGroup} label="Voltar às opções" />
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {selected === 'characters' && <Characters {...flowProps} />}
          {selected === 'npcs' && <NPCs {...flowProps} />}
          {selected === 'boss' && <Bosses {...flowProps} />}
          {selected === 'organizations' && <Organizations {...flowProps} />}
        </div>
      </div>
    )
  }

  // ── Fluxo de skill ─────────────────────────────────────────────────
  if (selected && SKILL_IDS.has(selected) && skillMeta) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <PageHeader icon={Sparkles} title="Criação" subtitle={`SKILL · ${skillMeta.label.toUpperCase()}`} />
        <BackBar onBack={backToGroup} label="Voltar às opções" />
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <div style={{ maxWidth: '520px', margin: '0 auto' }}>
            <SkillForm
              key={skillMeta.id}
              defaultAudience={skillMeta.audience}
              initial={{ audience: skillMeta.audience }}
              onSubmit={handleSkillCreate}
              onCancel={backToGroup}
              submitLabel="Criar skill"
              lockAudience
            />
          </div>
        </div>
      </div>
    )
  }

  // ── Submenu do grupo ───────────────────────────────────────────────
  if (group && GROUPS[group]) {
    const g = GROUPS[group]
    const children = GROUP_CHILDREN[group]
    const HeaderIcon = g.icon
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <PageHeader icon={HeaderIcon} title="Criação" subtitle={g.label.toUpperCase()} />
        <BackBar onBack={backToGroups} label="Voltar" />
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e5e5e5', marginBottom: '0.35rem' }}>
                {g.label}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#444' }}>
                {g.description}
              </div>
            </div>
            <ChoiceGrid
              types={children}
              disabled={(type) => Boolean(type.needsCampaign && !activeCampaignId)}
              onClick={openLeaf}
            />
          </div>
        </div>
      </div>
    )
  }

  // ── Nível 1: grupos ────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        icon={Sparkles}
        title="Criação"
        subtitle="ARTEFATO · SKILL"
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e5e5e5', marginBottom: '0.35rem' }}>
              O que você quer criar?
            </div>
            <div style={{ fontSize: '0.75rem', color: '#444' }}>
              {activeCampaignId
                ? 'Escolha uma categoria e depois o tipo.'
                : 'Selecione uma campanha ativa para criar artefatos (player, NPC, boss, org).'}
            </div>
          </div>

          <ChoiceGrid
            types={GROUP_ORDER.map(id => GROUPS[id])}
            disabled={(type) => Boolean(type.needsCampaign && !activeCampaignId)}
            onClick={openGroup}
          />
        </div>
      </div>
    </div>
  )
}
