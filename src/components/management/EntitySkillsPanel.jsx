import React, { useState } from 'react'
import { Zap, Plus } from 'lucide-react'
import { ECO_UNLOCK_SKILL_COST } from '../../constants/progression'
import { Modal } from '../ui/Modal'
import { EcoOverloadSection } from './EcoOverloadSection'
import { EcoSkillsSection } from './EcoSkillsSection'
import { SkillGrimoirePicker } from './SkillGrimoirePicker'
import { getCatalogAudienceForEntity } from '../../services/skillsCatalogService'

/** Conteúdo de habilidades + sobrecarga de Eco (uso de skills) */
export function EntitySkillsPanel({
  entity,
  onUnlockSkill,
  onUpgradeSkill,
  onLearnCatalogSkill,
  onRemoveSkill,
  onRestOverload,
  onSetOverload,
  lastOverloadEvents,
  onClearOverloadEvents,
  adminMode = false,
  manualSkillPick = false,
}) {
  const [grimoireOpen, setGrimoireOpen] = useState(false)
  const catalogAudience = getCatalogAudienceForEntity(entity)
  const eco = entity.ecoPoints ?? 0
  const hasEcoToSpend = eco >= ECO_UNLOCK_SKILL_COST

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '0.625rem 0.75rem',
        background: hasEcoToSpend ? 'rgba(168,85,247,0.1)' : '#0d0d0d',
        border: `1px solid ${hasEcoToSpend ? 'rgba(168,85,247,0.35)' : '#1a1a1a'}`,
        borderRadius: '4px',
        boxShadow: hasEcoToSpend ? '0 0 16px rgba(168,85,247,0.15)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={18} style={{ color: hasEcoToSpend ? '#a855f7' : '#444' }} />
          <div>
            <div style={{ fontSize: '0.55rem', color: '#666', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
              PONTOS DE ECO DISPONÍVEIS
            </div>
            <div style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: hasEcoToSpend ? '#a855f7' : '#555',
              lineHeight: 1,
              fontFamily: 'monospace',
            }}>
              {eco}
            </div>
          </div>
        </div>
        <span style={{
          fontSize: '0.65rem',
          color: hasEcoToSpend ? '#a855f7' : '#444',
          fontFamily: 'monospace',
          fontWeight: hasEcoToSpend ? 600 : 400,
          textAlign: 'right',
        }}>
          {manualSkillPick
            ? (hasEcoToSpend ? 'Pode evoluir skills' : 'Ganhe Eco em níveis ímpares')
            : (hasEcoToSpend ? 'Pode descobrir ou evoluir' : 'Ganhe em níveis ímpares')}
        </span>
      </div>

      <EcoOverloadSection
        entity={entity}
        onRestOverload={onRestOverload}
        onSetOverload={adminMode ? onSetOverload : undefined}
        lastOverloadEvents={lastOverloadEvents}
        onClearEvents={onClearOverloadEvents}
      />

      {adminMode && onLearnCatalogSkill && (
        <>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setGrimoireOpen(true)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', fontSize: '0.75rem' }}
          >
            <Plus size={14} style={{ color: '#a855f7' }} />
            Adicionar skill
          </button>
          <Modal open={grimoireOpen} onClose={() => setGrimoireOpen(false)} title="Grimório de skills" maxWidth="560px">
            <SkillGrimoirePicker
              selectedSkills={entity.skills || []}
              onAdd={instance => onLearnCatalogSkill(instance.templateId)}
              onRemove={onRemoveSkill}
              freePick
              compact
              audience={catalogAudience}
            />
          </Modal>
        </>
      )}

      <hr className="divide-line" />

      <EcoSkillsSection
        entity={entity}
        onUnlockSkill={manualSkillPick ? undefined : onUnlockSkill}
        onUpgradeSkill={onUpgradeSkill}
        manualSkillPick={manualSkillPick}
      />
    </div>
  )
}
