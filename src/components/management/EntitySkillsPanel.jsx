import React, { useState } from 'react'
import { Zap, Plus } from 'lucide-react'
import { ECO_UNLOCK_SKILL_COST } from '../../constants/progression'
import { SKILL_AUDIENCE } from '../../constants/skillAudience'
import { Modal } from '../ui/Modal'
import { SkillForm } from '../skills/SkillForm'
import { EcoOverloadSection } from './EcoOverloadSection'
import { EcoSkillsSection } from './EcoSkillsSection'
import { SkillGrimoirePicker } from './SkillGrimoirePicker'
import { getCatalogAudienceForEntity } from '../../services/skillsCatalogService'

/** Conteúdo de habilidades + sobrecarga de Eco (uso de skills) */
export function EntitySkillsPanel({
  entity,
  onInvestSkillPoint,
  onUpgradeSkillGrade,
  onLearnCatalogSkill,
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
  const [grimoireOpen, setGrimoireOpen] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState(null)
  const catalogAudience = getCatalogAudienceForEntity(entity)
  const isBoss = entity?.papelCombate === 'boss'
  const inlineMode = typeof onAddInlineSkill === 'function'
  const eco = entity.ecoPoints ?? 0
  const hasEcoToSpend = eco >= ECO_UNLOCK_SKILL_COST
  const skills = entity.skills || []

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {!isBoss && (
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
        </div>
      )}

      {!isBoss && (
        <EcoOverloadSection
          entity={entity}
          onRestOverload={onRestOverload}
          onSetOverload={adminMode ? onSetOverload : undefined}
          lastOverloadEvents={lastOverloadEvents}
          onClearOverloadEvents={onClearOverloadEvents}
        />
      )}

      {adminMode && inlineMode && (
        <button
          type="button"
          className="btn-secondary"
          onClick={openCreate}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', fontSize: '0.75rem' }}
        >
          <Plus size={14} style={{ color: '#a855f7' }} />
          Criar skill
        </button>
      )}

      {adminMode && !inlineMode && onLearnCatalogSkill && (
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
              selectedSkills={skills}
              onAdd={instance => onLearnCatalogSkill(instance.templateId)}
              onRemove={onRemoveSkill}
              freePick
              compact
              audience={catalogAudience}
            />
          </Modal>
        </>
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

      <hr className="divide-line" />

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
