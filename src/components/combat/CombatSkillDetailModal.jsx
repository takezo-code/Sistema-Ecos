import React from 'react'
import { Play, Clock, Zap, AlertTriangle } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { getSkillTypeMeta } from '../../constants/skillTypes'
import { ECO_SKILL_TYPES } from '../../constants/skillTypes'
import { formatOverloadDisplay } from '../../constants/ecoOverload'

function InfoRow({ label, color, children }) {
  return (
    <div style={{
      background: '#111',
      border: '1px solid #1a1a1a',
      borderRadius: '6px',
      padding: '0.625rem 0.75rem',
    }}>
      <div style={{
        fontSize: '0.5rem',
        fontFamily: 'monospace',
        letterSpacing: '0.1em',
        color: color || '#555',
        marginBottom: '0.35rem',
      }}>
        {label}
      </div>
      <div style={{ fontSize: '0.8rem', color: '#bbb', lineHeight: 1.55, margin: 0 }}>
        {children}
      </div>
    </div>
  )
}

export function CombatSkillDetailModal({
  open,
  character,
  runtime,
  onClose,
  onActivate,
}) {
  if (!runtime?.catalog) return null

  const catalog = runtime.catalog
  const typeMeta = getSkillTypeMeta(catalog.skillType)
  const isPassiva = catalog.skillType === ECO_SKILL_TYPES.PASSIVA
  const classLabel = runtime.classMeta?.label

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={catalog.name}
      maxWidth="420px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {/* Personagem + status */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.35rem',
          alignItems: 'center',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid #1a1a1a',
        }}>
          {character?.name && (
            <span style={{ fontSize: '0.7rem', color: '#888', fontFamily: 'monospace' }}>
              {character.name}
            </span>
          )}
          <span style={{
            fontSize: '0.6rem',
            fontFamily: 'monospace',
            color: typeMeta.color,
            border: `1px solid ${typeMeta.color}44`,
            padding: '2px 8px',
            borderRadius: '3px',
          }}>
            {typeMeta.label.toUpperCase()}
          </span>
          {classLabel && (
            <span style={{
              fontSize: '0.6rem',
              fontFamily: 'monospace',
              color: runtime.classMeta?.color || '#666',
              border: `1px solid ${runtime.classMeta?.color || '#333'}44`,
              padding: '2px 8px',
              borderRadius: '3px',
            }}>
              {classLabel.toUpperCase()}
            </span>
          )}
          <span style={{
            fontSize: '0.6rem',
            fontFamily: 'monospace',
            color: runtime.visualMeta?.color || '#666',
            border: `1px solid ${runtime.visualMeta?.border || '#333'}`,
            padding: '2px 8px',
            borderRadius: '3px',
          }}>
            {runtime.visualMeta?.label}
          </span>
        </div>

        {/* Stats rápidos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          <div style={{
            padding: '0.5rem',
            background: 'rgba(6,182,212,0.06)',
            border: '1px solid rgba(6,182,212,0.15)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <Clock size={14} style={{ color: '#06b6d4', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.45rem', color: '#555', fontFamily: 'monospace' }}>COOLDOWN</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e5e5e5' }}>
                {isPassiva
                  ? '—'
                  : runtime.cooldownTotal > 0
                    ? `${runtime.cooldownRemaining} / ${runtime.cooldownTotal} turnos`
                    : 'Sem CD'}
              </div>
            </div>
          </div>
          <div style={{
            padding: '0.5rem',
            background: 'rgba(168,85,247,0.06)',
            border: '1px solid rgba(168,85,247,0.15)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <Zap size={14} style={{ color: '#a855f7', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.45rem', color: '#555', fontFamily: 'monospace' }}>USOS DE RUPTURA</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a855f7' }}>
                {isPassiva
                  ? (catalog.passiveOverloadRisk ? 'Risco passivo' : '+0')
                  : `+${runtime.overloadCost ?? 1}`}
                {!isPassiva && character && (
                  <span style={{ fontSize: '0.6rem', color: '#666', fontWeight: 400 }}>
                    {' '}→ {formatOverloadDisplay(
                      (character.ecoOverload ?? 0) + (runtime.overloadCost ?? 1),
                      character,
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {character && (
          <div style={{ fontSize: '0.65rem', color: '#666', fontFamily: 'monospace' }}>
            Usos atuais: {formatOverloadDisplay(character.ecoOverload ?? 0, character)}
          </div>
        )}

        <InfoRow label="O QUE FAZ" color="#888">
          {catalog.description || '—'}
        </InfoRow>

        <InfoRow label="EFEITO MECÂNICO" color="#06b6d4">
          {catalog.mechanicalEffect || '—'}
        </InfoRow>

        <InfoRow label="CONSEQUÊNCIA NARRATIVA" color="#eab308">
          {catalog.narrativeConsequence || '—'}
        </InfoRow>

        {catalog.passiveOverloadRisk && (
          <InfoRow label="RISCO PASSIVO" color="#f97316">
            Pode aumentar a sobrecarga de Eco ao final do turno se o ambiente estiver instável.
          </InfoRow>
        )}

        {runtime.blockReason && !runtime.canActivate && (
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-start',
            padding: '0.5rem 0.625rem',
            background: 'rgba(220,38,38,0.08)',
            border: '1px solid rgba(220,38,38,0.2)',
            borderRadius: '4px',
            fontSize: '0.7rem',
            color: '#f87171',
          }}>
            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
            {runtime.blockReason}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
          <button type="button" className="btn-ghost" onClick={onClose} style={{ fontSize: '0.75rem' }}>
            Fechar
          </button>
          {!isPassiva && onActivate && (
            <button
              type="button"
              className="btn-primary"
              disabled={!runtime.canActivate}
              onClick={() => {
                onActivate(character?.id, runtime.instance.id)
                onClose()
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                opacity: runtime.canActivate ? 1 : 0.45,
              }}
            >
              <Play size={12} /> Ativar habilidade
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
