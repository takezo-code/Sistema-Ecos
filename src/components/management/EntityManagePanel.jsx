import React, { useState } from 'react'
import { Pencil, Sparkles, BookOpen, Sword } from 'lucide-react'
import { NarrativeProfileModal } from './NarrativeProfileModal'
import { EntityThumb } from '../ui/EntityThumb'
import { Modal } from '../ui/Modal'
import { AttributeGrid } from './AttributeGrid'
import { ProgressionSection } from './ProgressionSection'
import { StatesSection } from './StatesSection'
import { EntitySkillsPanel } from './EntitySkillsPanel'
import { CharacterGearPanel } from '../equipment/CharacterGearPanel'
import { isInCreationPhase } from '../../constants/attributes'
import { entityHasEcoPowers, isNpcEntity } from '../../constants/entityProgression'

export function EntityManagePanel({
  entity,
  onUpdate,
  onChangeAttribute,
  onChangeSocialAttribute,
  onSpendPendingAttribute,
  onSpendPendingSocialAttribute,
  onMasterProgression,
  onSyncProgression,
  onClampAuxiliary,
  onScaleAttributes,
  onEditProfile,
  onForgeGear,
  onSetGearPassive,
  onSetWeaponSkill,
  onInvestSkillPoint,
  onUpgradeSkillGrade,
  onLearnCatalogSkill,
  onAddInlineSkill,
  onUpdateInlineSkill,
  onRemoveSkill,
  onUseSkill,
  onRestOverload,
  onSetOverload,
  lastOverloadEvents,
  onClearOverloadEvents,
  masterError,
  showProgression = true,
  adminMode = false,
}) {
  const [skillsOpen, setSkillsOpen] = useState(false)
  const [narrativeOpen, setNarrativeOpen] = useState(false)
  const [gearOpen, setGearOpen] = useState(false)
  const showGear = typeof onForgeGear === 'function'
  const isCreation = isInCreationPhase(entity)
  const hasEco = entityHasEcoPowers(entity)

  const physicalState = entity.physicalState ?? 'bem'
  const mentalState = entity.mentalState ?? 'estavel'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <EntityThumb src={entity.image} alt={entity.name} size={48} borderRadius="4px" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0, flexWrap: 'wrap' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e5e5e5' }}>{entity.name}</div>
            {onEditProfile && (
              <button
                type="button"
                className="btn-ghost"
                onClick={onEditProfile}
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', padding: '0.2rem 0.45rem' }}
              >
                <Pencil size={11} /> Editar ficha
              </button>
            )}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', marginTop: '2px' }}>
            NVL {entity.level || 1}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setNarrativeOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem' }}
          >
            <BookOpen size={12} style={{ color: '#06b6d4' }} />
            Perfil narrativo
          </button>
          {hasEco && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setSkillsOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem' }}
            >
              <Sparkles size={12} style={{ color: '#a855f7' }} />
              Skills
            </button>
          )}
          {showGear && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setGearOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem' }}
            >
              <Sword size={12} style={{ color: '#f97316' }} />
              Equipamento
            </button>
          )}
        </div>
      </div>

      <StatesSection
        entity={entity}
        physicalState={physicalState}
        mentalState={mentalState}
        onPhysicalChange={v => onUpdate?.({ physicalState: v })}
        onMentalChange={v => onUpdate?.({ mentalState: v })}
      />

      {showProgression && (
        <>
          <hr className="divide-line" />
          <ProgressionSection
            entity={entity}
            adminMode={adminMode}
            onMasterProgression={onMasterProgression}
            onSyncProgression={onSyncProgression}
            onClampAuxiliary={onClampAuxiliary}
            onScaleAttributes={onScaleAttributes}
            masterError={masterError}
          />
        </>
      )}

      <hr className="divide-line" />

      <AttributeGrid
        entity={entity}
        isCreation={isCreation && !adminMode}
        adminMode={adminMode}
        onChange={(key, val, opts) => onChangeAttribute?.(key, val, opts)}
        onChangeSocial={(key, val, opts) => onChangeSocialAttribute?.(key, val, opts)}
        onSpendPending={adminMode ? undefined : onSpendPendingAttribute}
        onSpendPendingSocial={adminMode ? undefined : onSpendPendingSocialAttribute}
      />

      <NarrativeProfileModal
        open={narrativeOpen}
        onClose={() => setNarrativeOpen(false)}
        entity={entity}
      />

      <Modal open={hasEco && skillsOpen} onClose={() => setSkillsOpen(false)} title={`Skills — ${entity.name}`} maxWidth="720px">
        <EntitySkillsPanel
          entity={entity}
          adminMode={adminMode}
          manualSkillPick={isNpcEntity(entity)}
          onInvestSkillPoint={isNpcEntity(entity) ? undefined : onInvestSkillPoint}
          onUpgradeSkillGrade={isNpcEntity(entity) ? undefined : onUpgradeSkillGrade}
          onLearnCatalogSkill={isNpcEntity(entity) ? undefined : onLearnCatalogSkill}
          onAddInlineSkill={isNpcEntity(entity) ? onAddInlineSkill : undefined}
          onUpdateInlineSkill={isNpcEntity(entity) ? onUpdateInlineSkill : undefined}
          onRemoveSkill={onRemoveSkill}
          onRestOverload={onRestOverload}
          onSetOverload={onSetOverload}
          lastOverloadEvents={lastOverloadEvents}
          onClearOverloadEvents={onClearOverloadEvents}
        />
      </Modal>

      <Modal
        open={showGear && gearOpen}
        onClose={() => setGearOpen(false)}
        title={`Equipamento — ${entity.name}`}
        maxWidth="520px"
      >
        <CharacterGearPanel
          character={entity}
          onForge={onForgeGear}
          onSetPassive={onSetGearPassive}
          onSetWeaponSkill={onSetWeaponSkill}
        />
      </Modal>
    </div>
  )
}
