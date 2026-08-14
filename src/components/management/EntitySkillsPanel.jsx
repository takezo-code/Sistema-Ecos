import React, { useState } from 'react'
import { Zap, Plus } from 'lucide-react'
import { ECO_UNLOCK_SKILL_COST } from '../../constants/progression'
import { SKILL_AUDIENCE } from '../../constants/skillAudience'
import { Modal } from '../ui/Modal'
import { SkillForm } from '../skills/SkillForm'
import { EcoOverloadSection } from './EcoOverloadSection'
import { EcoSkillsSection } from './EcoSkillsSection'
import { getCatalogAudienceForEntity } from '../../services/skillsCatalogService'
import { Button } from '../ui/Button'
import SpotlightCard from '../react-bits/SpotlightCard'
import GlowingBadge from '../ui/GlowingBadge'

/** Conteúdo de habilidades + sobrecarga de Eco (uso de skills) */
export function EntitySkillsPanel({
  entity,
  onInvestSkillPoint,
  onUpgradeSkillGrade,
  onLearnCatalogSkill: _onLearnCatalogSkill,
  onAddInlineSkill,
  onUpdateInlineSkill,
  onRemoveSkill,
  onRestOverload,
  onSetOverload,
  lastOverloadEvents,
  onClearOverloadEvents,
  adminMode = false,
  manualSkillPick = false,
}) {
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState(null)
  const catalogAudience = getCatalogAudienceForEntity(entity)
  const isBoss = entity?.papelCombate === 'boss'
  const inlineMode = typeof onAddInlineSkill === 'function'
  const eco = entity.ecoPoints ?? 0
  const hasEcoToSpend = eco >= ECO_UNLOCK_SKILL_COST

  const openCreate = () => {
    setEditingSkill(null)
    setEditorOpen(true)
  }

  const openEdit = (skill) => {
    setEditingSkill(skill)
    setEditorOpen(true)
  }

  const handleInlineSubmit = (draft) => {
    if (editingSkill) {
      onUpdateInlineSkill?.(editingSkill.id, draft)
    } else {
      onAddInlineSkill?.(draft)
    }
    setEditorOpen(false)
    setEditingSkill(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {!isBoss && (
        <SpotlightCard
          spotlightColor={hasEcoToSpend ? 'rgba(168,85,247,0.28)' : 'rgba(255,255,255,0.06)'}
          style={{
            padding: '1rem 1.15rem',
            borderColor: hasEcoToSpend ? 'rgba(168,85,247,0.35)' : undefined,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: hasEcoToSpend ? 'rgba(168,85,247,0.18)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${hasEcoToSpend ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: hasEcoToSpend ? '0 0 20px rgba(168,85,247,0.25)' : 'none',
              }}>
                <Zap size={18} style={{ color: hasEcoToSpend ? '#c084fc' : '#555' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.58rem', color: '#777', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 4 }}>
                  PONTOS DE ECO
                </div>
                <div style={{
                  fontSize: '1.85rem',
                  fontWeight: 800,
                  color: hasEcoToSpend ? '#e9d5ff' : '#666',
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                }}>
                  {eco}
                </div>
              </div>
            </div>
            <GlowingBadge variant={hasEcoToSpend ? 'cyan' : 'gray'} pulse={hasEcoToSpend} dot>
              {hasEcoToSpend ? 'Disponível' : 'Sem Eco'}
            </GlowingBadge>
          </div>
        </SpotlightCard>
      )}

      {!isBoss && (
        <EcoOverloadSection
          entity={entity}
          onRestOverload={onRestOverload}
          onSetOverload={adminMode ? onSetOverload : undefined}
          lastOverloadEvents={lastOverloadEvents}
          onClearEvents={onClearOverloadEvents}
        />
      )}

      {adminMode && inlineMode && (
        <Button
          type="button"
          variant="secondary"
          size="xs"
          onClick={openCreate}
          block
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <Plus size={14} style={{ color: '#a855f7' }} />
          Criar skill
        </Button>
      )}

      {inlineMode && (
        <Modal
          open={editorOpen}
          onClose={() => { setEditorOpen(false); setEditingSkill(null) }}
          title={editingSkill ? 'Editar skill' : 'Criar skill'}
          maxWidth="520px"
        >
          <SkillForm
            key={editingSkill?.id || 'new'}
            initial={editingSkill || undefined}
            defaultAudience={isBoss ? SKILL_AUDIENCE.BOSS : (catalogAudience || SKILL_AUDIENCE.NPC)}
            lockAudience
            submitLabel={editingSkill ? 'Salvar' : 'Criar'}
            onCancel={() => { setEditorOpen(false); setEditingSkill(null) }}
            onSubmit={handleInlineSubmit}
          />
        </Modal>
      )}

      <EcoSkillsSection
        entity={entity}
        onInvestSkillPoint={manualSkillPick ? undefined : onInvestSkillPoint}
        onUpgradeSkillGrade={manualSkillPick ? undefined : onUpgradeSkillGrade}
        manualSkillPick={manualSkillPick}
        inlineOwned={inlineMode}
        onEditSkill={inlineMode ? openEdit : undefined}
        onRemoveSkill={inlineMode ? onRemoveSkill : undefined}
      />
    </div>
  )
}
