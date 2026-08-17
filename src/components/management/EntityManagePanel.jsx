import React, { useState } from 'react'
import { Pencil, Sparkles, BookOpen, Sword } from 'lucide-react'
import { ExportFichaButton } from '../character/ExportFichaButton'
import { NarrativeProfileModal } from './NarrativeProfileModal'
import { EntityThumb } from '../ui/EntityThumb'
import { Modal } from '../ui/Modal'
import { AttributeGrid } from './AttributeGrid'
import { ProgressionSection } from './ProgressionSection'
import { EntitySkillsPanel } from './EntitySkillsPanel'
import { CharacterGearPanel } from '../equipment/CharacterGearPanel'
import { isInCreationPhase } from '../../constants/attributes'
import { entityHasEcoPowers, isNpcEntity } from '../../constants/entityProgression'
import { Button } from '../ui/Button'

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

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      background: 'rgba(10, 10, 14, 0.94)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      padding: '1rem 1.05rem',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
    }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        flexWrap: 'wrap',
        padding: '0.15rem 0 0.85rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <EntityThumb src={entity.image} alt={entity.name} size={54} borderRadius="12px" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 750, color: '#f5f5f5', letterSpacing: '-0.02em' }}>
              {entity.name}
            </span>
            <span style={{
              fontSize: '0.58rem',
              fontFamily: 'monospace',
              color: '#c084fc',
              background: 'rgba(168,85,247,0.12)',
              border: '1px solid rgba(168,85,247,0.28)',
              borderRadius: 999,
              padding: '0.18rem 0.5rem',
              letterSpacing: '0.06em',
            }}>
              NVL {entity.level || 1}
            </span>
          </div>
          {onEditProfile && (
            <button
              type="button"
              onClick={onEditProfile}
              style={{
                marginTop: 6,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.65rem',
                background: 'transparent',
                border: 'none',
                padding: 0,
                color: '#777',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#c9c9c9' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#777' }}
            >
              <Pencil size={11} /> Editar ficha
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <ExportFichaButton
            entity={entity}
            kind={entity.papelCombate === 'boss' ? 'boss' : isNpcEntity(entity) ? 'npc' : 'character'}
          />
          <Button
            type="button"
            variant="secondary"
            size="xs"
            onClick={() => setNarrativeOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <BookOpen size={12} style={{ color: '#06b6d4' }} />
            Perfil narrativo
          </Button>
          {hasEco && (
            <Button
              type="button"
              variant="secondary"
              size="xs"
              onClick={() => setSkillsOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Sparkles size={12} style={{ color: '#a855f7' }} />
              Skills
            </Button>
          )}
          {showGear && (
            <Button
              type="button"
              variant="secondary"
              size="xs"
              onClick={() => setGearOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Sword size={12} style={{ color: '#f97316' }} />
              Equipamento
            </Button>
          )}
        </div>
      </header>

      {showProgression && (
        <ProgressionSection
          entity={entity}
          adminMode={adminMode}
          onMasterProgression={onMasterProgression}
          onSyncProgression={onSyncProgression}
          onClampAuxiliary={onClampAuxiliary}
          onScaleAttributes={onScaleAttributes}
          masterError={masterError}
        />
      )}

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
          manualValues={isNpcEntity(entity)}
        />
      </Modal>
    </div>
  )
}
