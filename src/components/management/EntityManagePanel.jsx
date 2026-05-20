import React, { useState } from 'react'
import { Pencil, Sparkles } from 'lucide-react'
import { EntityThumb } from '../ui/EntityThumb'
import { Modal } from '../ui/Modal'
import { AttributeGrid } from './AttributeGrid'
import { ProgressionSection } from './ProgressionSection'
import { StatesSection } from './StatesSection'
import { EntitySkillsPanel } from './EntitySkillsPanel'
import { isInCreationPhase } from '../../constants/attributes'
import { entityHasEcoPowers, isNpcEntity } from '../../constants/entityProgression'
import { getPhysicalStateOption, getMentalStateOption } from '../../constants/states'

export function EntityManagePanel({
  entity,
  onUpdate,
  onAddXp,
  onChangeAttribute,
  onChangeSocialAttribute,
  onSpendPendingAttribute,
  onSpendPendingSocialAttribute,
  onMasterProgression,
  onSyncProgression,
  onClampAuxiliary,
  onScaleAttributes,
  onEditProfile,
  onUnlockSkill,
  onUpgradeSkill,
  onLearnCatalogSkill,
  onRemoveSkill,
  onUseSkill,
  onRestOverload,
  onSetOverload,
  lastOverloadEvents,
  onClearOverloadEvents,
  masterError,
  showProgression = true,
  adminMode = false,
  levelUps = [],
}) {
  const [localLevelUps, setLocalLevelUps] = useState(levelUps)
  const [skillsOpen, setSkillsOpen] = useState(false)
  const isCreation = isInCreationPhase(entity)
  const hasEco = entityHasEcoPowers(entity)

  const physicalState = entity.physicalState ?? 'bem'
  const mentalState = entity.mentalState ?? 'estavel'
  const physicalOpt = getPhysicalStateOption(physicalState)
  const mentalOpt = getMentalStateOption(mentalState)

  const handleAddXp = (amount) => {
    if (onAddXp) {
      const result = onAddXp(amount)
      if (result?.levelUps) setLocalLevelUps(result.levelUps)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <EntityThumb src={entity.image} alt={entity.name} size={48} borderRadius="4px" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e5e5e5' }}>{entity.name}</div>
          <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', marginTop: '2px' }}>
            NVL {entity.level || 1}
            {showProgression && hasEco && ` · ${entity.ecoPoints ?? 0} Ecos`}
            <span style={{ color: physicalOpt.color }}> · {physicalOpt.label.toUpperCase()}</span>
            <span style={{ color: mentalOpt.color }}> · {mentalOpt.label.toUpperCase()}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
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
          {onEditProfile && (
            <button type="button" className="btn-ghost" onClick={onEditProfile}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem' }}>
              <Pencil size={12} /> Editar ficha
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
            onAddXp={handleAddXp}
            levelUps={localLevelUps.length ? localLevelUps : levelUps}
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

      <Modal open={hasEco && skillsOpen} onClose={() => setSkillsOpen(false)} title={`Skills — ${entity.name}`} maxWidth="720px">
        <EntitySkillsPanel
          entity={entity}
          adminMode={adminMode}
          manualSkillPick={isNpcEntity(entity)}
          onUnlockSkill={isNpcEntity(entity) ? undefined : onUnlockSkill}
          onUpgradeSkill={onUpgradeSkill}
          onLearnCatalogSkill={onLearnCatalogSkill}
          onRemoveSkill={onRemoveSkill}
          onRestOverload={onRestOverload}
          onSetOverload={onSetOverload}
          lastOverloadEvents={lastOverloadEvents}
          onClearOverloadEvents={onClearOverloadEvents}
        />
      </Modal>
    </div>
  )
}
