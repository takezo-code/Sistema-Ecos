import React, { useState } from 'react'
import { Pencil } from 'lucide-react'
import { EntityThumb } from '../ui/EntityThumb'
import { AttributeGrid } from './AttributeGrid'
import { ProgressionSection } from './ProgressionSection'
import { StatesSection } from './StatesSection'
import { STARTING_ATTRIBUTE_POINTS, getTotalAttributePoints } from '../../constants/attributes'
import { getPhysicalStateOption, getMentalStateOption } from '../../constants/states'

export function EntityManagePanel({
  entity,
  onUpdate,
  onAddXp,
  onChangeAttribute,
  onSpendPendingAttribute,
  onMasterProgression,
  onSyncProgression,
  onClampAuxiliary,
  onScaleAttributes,
  onEditProfile,
  masterError,
  showProgression = true,
  adminMode = false,
  levelUps = [],
}) {
  const [localLevelUps, setLocalLevelUps] = useState(levelUps)
  const isCreation = (entity.unspentAttributePoints ?? 0) > 0 && getTotalAttributePoints(entity.attributes) < STARTING_ATTRIBUTE_POINTS

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
            {showProgression && ` · ${entity.ecoPoints ?? 0} Ecos`}
            <span style={{ color: physicalOpt.color }}> · {physicalOpt.label.toUpperCase()}</span>
            <span style={{ color: mentalOpt.color }}> · {mentalOpt.label.toUpperCase()}</span>
          </div>
        </div>
        {onEditProfile && (
          <button type="button" className="btn-ghost" onClick={onEditProfile}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', flexShrink: 0 }}>
            <Pencil size={12} /> Editar ficha
          </button>
        )}
      </div>

      <StatesSection
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
        onSpendPending={adminMode ? undefined : onSpendPendingAttribute}
      />
    </div>
  )
}
