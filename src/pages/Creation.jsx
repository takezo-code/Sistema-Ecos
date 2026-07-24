import React, { useEffect, useState } from 'react'
import {
  ArrowLeft, Sword, Skull, Building2, ShieldAlert, Shield, Sparkles, Package, Users,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { CreationChoiceCard } from '../components/creation/CreationChoiceCard'
import { Characters } from './Characters'
import { NPCs } from './NPCs'
import { Bosses } from './Bosses'
import { Organizations } from './Organizations'
import { EquipmentForm } from '../components/equipment/EquipmentForm'
import { SkillForm } from '../components/skills/SkillForm'
import { useCampaignStore } from '../store/useCampaignStore'
import { useEquipmentStore } from '../store/useEquipmentStore'
import { useSkillsCatalogStore } from '../store/useSkillsCatalogStore'
import { SKILL_AUDIENCE } from '../constants/skillAudience'
import {
  EQUIPMENT_CREATION_ARMA,
  EQUIPMENT_CREATION_ARMADURA,
} from './EquipmentCreationHub'
import { MANAGEMENT_VIEWS, skillAudienceToManagementView } from '../constants/managementViews'

const ENTITY_TYPES = [
  {
    id: 'characters',
    label: 'Personagem',
    description: 'Personagem jogável com atributos, progressão e habilidades de Eco.',
    icon: Sword,
    color: '#9ca3af',
    border: 'rgba(156,163,175,0.2)',
    bg: 'rgba(156,163,175,0.04)',
    group: 'entities',
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
    group: 'entities',
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
    group: 'entities',
    needsCampaign: true,
  },
  {
    id: 'organizations',
    label: 'Organização',
    description: 'Facção, corporação, culto ou grupo organizado da campanha.',
    icon: Building2,
    color: '#d97706',
    border: 'rgba(217,119,6,0.2)',
    bg: 'rgba(217,119,6,0.04)',
    group: 'entities',
    needsCampaign: true,
  },
]

const EQUIPMENT_TYPES = [
  {
    id: EQUIPMENT_CREATION_ARMA,
    label: 'Arma',
    description: 'Armas de fogo, corpo a corpo, escudo, orbe — podem conceder skills.',
    icon: Sword,
    color: '#dc2626',
    border: 'rgba(220,38,38,0.2)',
    bg: 'rgba(220,38,38,0.04)',
    group: 'equipment',
    needsCampaign: false,
  },
  {
    id: EQUIPMENT_CREATION_ARMADURA,
    label: 'Armadura',
    description: 'Proteção leve, média ou pesada — resistência e penalidade de Destreza.',
    icon: Shield,
    color: '#06b6d4',
    border: 'rgba(6,182,212,0.2)',
    bg: 'rgba(6,182,212,0.04)',
    group: 'equipment',
    needsCampaign: false,
  },
]

const SKILL_TYPES = [
  {
    id: SKILL_AUDIENCE.CHARACTER,
    label: 'Skill de Personagem',
    description: 'Poderes que personagens jogadores podem descobrir e aprender.',
    icon: Sword,
    color: '#9ca3af',
    border: 'rgba(156,163,175,0.2)',
    bg: 'rgba(156,163,175,0.04)',
    group: 'skills',
    needsCampaign: false,
  },
  {
    id: SKILL_AUDIENCE.NPC,
    label: 'Skill de NPC',
    description: 'Habilidades exclusivas para NPCs — atribuição manual no Gerenciamento.',
    icon: Skull,
    color: '#06b6d4',
    border: 'rgba(6,182,212,0.2)',
    bg: 'rgba(6,182,212,0.04)',
    group: 'skills',
    needsCampaign: false,
  },
  {
    id: SKILL_AUDIENCE.BOSS,
    label: 'Skill de Boss',
    description: 'Poderes de inimigos poderosos — catálogo separado para bosses.',
    icon: ShieldAlert,
    color: '#dc2626',
    border: 'rgba(220,38,38,0.2)',
    bg: 'rgba(220,38,38,0.04)',
    group: 'skills',
    needsCampaign: false,
  },
]

const ALL_TYPES = [...ENTITY_TYPES, ...EQUIPMENT_TYPES, ...SKILL_TYPES]

const ENTITY_IDS = new Set(ENTITY_TYPES.map(t => t.id))
const EQUIPMENT_IDS = new Set(EQUIPMENT_TYPES.map(t => t.id))
const SKILL_IDS = new Set(SKILL_TYPES.map(t => t.id))

function SectionTitle({ icon: Icon, label, color }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.75rem',
      marginTop: '0.25rem',
    }}>
      <Icon size={14} style={{ color }} />
      <span style={{ fontSize: '0.65rem', color: '#555', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
        {label}
      </span>
    </div>
  )
}

function BackBar({ onBack }) {
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
        Voltar à seleção
      </button>
    </div>
  )
}

export function Creation({
  onNavigate,
  initialCreationType,
  onCreationTypeConsumed,
}) {
  const [selected, setSelected] = useState(initialCreationType || null)
  const { activeCampaignId } = useCampaignStore()
  const addItem = useEquipmentStore(s => s.addItem)
  const addSkill = useSkillsCatalogStore(s => s.addSkill)

  useEffect(() => {
    if (initialCreationType) {
      setSelected(initialCreationType)
      onCreationTypeConsumed?.()
    }
  }, [initialCreationType, onCreationTypeConsumed])

  const handleSelect = (typeId) => {
    const type = ALL_TYPES.find(t => t.id === typeId)
    if (type?.needsCampaign && !activeCampaignId) return
    setSelected(typeId)
  }

  const clearSelection = () => setSelected(null)

  const handleEntitySuccess = (typeId) => {
    clearSelection()
    onNavigate?.('management', typeId)
  }

  const handleEquipmentCreate = (formData) => {
    addItem({ ...formData, category: selected, campaignId: activeCampaignId })
    clearSelection()
    onNavigate?.(
      'management',
      selected === EQUIPMENT_CREATION_ARMADURA ? MANAGEMENT_VIEWS.ARMADURA : MANAGEMENT_VIEWS.ARMAS,
    )
  }

  const handleSkillCreate = (draft) => {
    addSkill(draft)
    clearSelection()
    onNavigate?.('management', skillAudienceToManagementView(draft.audience || selected))
  }

  // ── Fluxo de entidade (personagem / NPC / boss / org) ──────────────
  if (selected && ENTITY_IDS.has(selected)) {
    const flowProps = {
      embedded: true,
      onNavigate,
      autoOpenCreate: true,
      onCreateFlowClose: clearSelection,
      onCreateFlowSuccess: () => handleEntitySuccess(selected),
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <PageHeader icon={Sparkles} title="Criação" subtitle="CAMPANHA" />
        <BackBar onBack={clearSelection} />
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {selected === 'characters' && <Characters {...flowProps} />}
          {selected === 'npcs' && <NPCs {...flowProps} />}
          {selected === 'boss' && <Bosses {...flowProps} />}
          {selected === 'organizations' && <Organizations {...flowProps} />}
        </div>
      </div>
    )
  }

  // ── Fluxo de equipamento ───────────────────────────────────────────
  if (selected && EQUIPMENT_IDS.has(selected)) {
    const categoryLabel = selected === EQUIPMENT_CREATION_ARMADURA ? 'armadura' : 'arma'
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <PageHeader icon={Sparkles} title="Criação" subtitle="EQUIPAMENTO" />
        <BackBar onBack={clearSelection} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <div style={{ maxWidth: '560px', margin: '0 auto' }}>
            <EquipmentForm
              category={categoryLabel}
              onSave={handleEquipmentCreate}
              onCancel={clearSelection}
              submitLabel="Criar equipamento"
            />
          </div>
        </div>
      </div>
    )
  }

  // ── Fluxo de skill ─────────────────────────────────────────────────
  if (selected && SKILL_IDS.has(selected)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <PageHeader icon={Sparkles} title="Criação" subtitle="SKILL" />
        <BackBar onBack={clearSelection} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <div style={{ maxWidth: '520px', margin: '0 auto' }}>
            <SkillForm
              defaultAudience={selected}
              onSubmit={handleSkillCreate}
              onCancel={clearSelection}
              submitLabel="Criar skill"
            />
          </div>
        </div>
      </div>
    )
  }

  // ── Seleção ────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        icon={Sparkles}
        title="Criação"
        subtitle="PERSONAGEM · NPC · BOSS · EQUIPAMENTO · SKILL"
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e5e5e5', marginBottom: '0.35rem' }}>
              O que você quer criar?
            </div>
            <div style={{ fontSize: '0.75rem', color: '#444' }}>
              {activeCampaignId
                ? 'Tudo em um só lugar — campanha, equipamentos e skills.'
                : 'Selecione uma campanha ativa para criar personagens, NPCs, bosses e organizações.'}
            </div>
          </div>

          <SectionTitle icon={Users} label="CAMPANHA" color="#dc2626" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem', marginBottom: '1.75rem' }}>
            {ENTITY_TYPES.map(type => (
              <CreationChoiceCard
                key={type.id}
                type={type}
                disabled={!activeCampaignId}
                onClick={handleSelect}
              />
            ))}
          </div>

          <SectionTitle icon={Package} label="EQUIPAMENTOS" color="#06b6d4" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem', marginBottom: '1.75rem' }}>
            {EQUIPMENT_TYPES.map(type => (
              <CreationChoiceCard
                key={type.id}
                type={type}
                disabled={false}
                onClick={handleSelect}
              />
            ))}
          </div>

          <SectionTitle icon={Sparkles} label="SKILLS" color="#a855f7" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {SKILL_TYPES.map(type => (
              <CreationChoiceCard
                key={type.id}
                type={type}
                disabled={false}
                onClick={handleSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
