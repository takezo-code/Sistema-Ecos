import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { SKILL_AUDIENCE } from '../../constants/skillAudience'
import { Modal } from '../ui/Modal'
import { SkillForm } from '../skills/SkillForm'
import { EcoOverloadSection } from './EcoOverloadSection'
import { EcoSkillsSection } from './EcoSkillsSection'
import { getCatalogAudienceForEntity } from '../../services/skillsCatalogService'
import { Button } from '../ui/Button'

/** Conteúdo de habilidades + sobrecarga de Eco (uso de skills) */
export function EntitySkillsPanel({
  entity,
  onInvestSkillPoint,
  onUpgradeSkillGrade,
  onLearnCatalogSkill: _onLearnCatalogSkill,
  onAddInlineSkill,
  onUpdateInlineSkill,
  onRemoveSkill,
  onRestOverload: _onRestOverload,
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
        <EcoOverloadSection
          entity={entity}
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
