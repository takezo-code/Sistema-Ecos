import React, { useState } from 'react'
import { Pencil, Sparkles, BookOpen, Sword, Building2 } from 'lucide-react'
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
import { EntityQuickActionTile } from './EntityQuickActionTile'

export function EntityManagePanel({
  entity,
  onUpdate: _onUpdate,
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
  onUseSkill: _onUseSkill,
  onRestOverload,
  onSetOverload,
  lastOverloadEvents,
  onClearOverloadEvents,
  masterError,
  showProgression = true,
  adminMode = false,
  compact = false,
}) {
  const [skillsOpen, setSkillsOpen] = useState(false)
  const [narrativeOpen, setNarrativeOpen] = useState(false)
  const [gearOpen, setGearOpen] = useState(false)
  const showGear = typeof onForgeGear === 'function'
  const isCreation = isInCreationPhase(entity)
  const hasEco = entityHasEcoPowers(entity)
  const isNpc = isNpcEntity(entity)
  const organization = String(entity.organization || '').trim()
  const showOrganization = (isNpc || entity.papelCombate === 'boss') && organization

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: compact ? '0.65rem' : '0.75rem',
      background: 'rgba(10, 10, 14, 0.94)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: compact ? 12 : 14,
      padding: compact ? '0.85rem 0.95rem' : '1rem 1.05rem',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      boxShadow: compact ? '0 8px 28px rgba(0,0,0,0.35)' : '0 12px 40px rgba(0,0,0,0.45)',
    }}>
      <header style={{
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? '0.6rem' : '0.85rem',
        padding: compact ? '0 0 0.65rem' : '0.15rem 0 0.85rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: compact ? '0.65rem' : '0.85rem', minWidth: 0 }}>
          <EntityThumb src={entity.image} alt={entity.name} size={compact ? 44 : 54} borderRadius={compact ? '10px' : '12px'} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flexWrap: 'wrap' }}>
              <span style={{ fontSize: compact ? '0.95rem' : '1.1rem', fontWeight: 750, color: '#f5f5f5', letterSpacing: '-0.02em' }}>
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
              {showOrganization && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.58rem',
                  fontFamily: 'monospace',
                  color: '#d97706',
                  background: 'rgba(217,119,6,0.1)',
                  border: '1px solid rgba(217,119,6,0.28)',
                  borderRadius: 999,
                  padding: '0.18rem 0.5rem',
                  letterSpacing: '0.04em',
                  maxWidth: '100%',
                }}>
                  <Building2 size={10} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {organization}
                  </span>
                </span>
              )}
            </div>
          </div>
          {onEditProfile && (
            <button
              type="button"
              onClick={onEditProfile}
              style={{
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.68rem',
                fontWeight: 600,
                color: '#aaa',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '0.4rem 0.65rem',
                cursor: 'pointer',
                transition: 'color 0.15s, border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#f0f0f0'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#aaa'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              }}
            >
              <Pencil size={12} />
              Editar ficha
            </button>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: compact ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(148px, 1fr))',
          gap: '0.4rem',
        }}>
          <ExportFichaButton
            entity={entity}
            kind={entity.papelCombate === 'boss' ? 'boss' : isNpcEntity(entity) ? 'npc' : 'character'}
            variant="tile"
          />
          <EntityQuickActionTile
            icon={BookOpen}
            label="Perfil narrativo"
            color="#06b6d4"
            onClick={() => setNarrativeOpen(true)}
          />
          {hasEco && (
            <EntityQuickActionTile
              icon={Sparkles}
              label="Skills"
              color="#a855f7"
              onClick={() => setSkillsOpen(true)}
            />
          )}
          {showGear && (
            <EntityQuickActionTile
              icon={Sword}
              label="Equipamento"
              color="#f97316"
              onClick={() => setGearOpen(true)}
            />
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
          manualValues
        />
      </Modal>
    </div>
  )
}
