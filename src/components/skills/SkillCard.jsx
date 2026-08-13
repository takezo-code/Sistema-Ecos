import React from 'react'
import { Play, Clock, Zap } from 'lucide-react'
import { getSkillTypeMeta } from '../../constants/skillTypes'
import { Button } from '../ui/Button'

export function SkillCard({ runtime, onActivate }) {
  const { catalog, visualMeta, cooldownRemaining, cooldownTotal, canActivate, blockReason, isPassive, overloadCost } = runtime
  if (!catalog) return null

  const typeMeta = getSkillTypeMeta(catalog.skillType)

  return (
    <article
      style={{
        background: visualMeta.glow || '#0d0d0d',
        border: `1px solid ${visualMeta.border}`,
        borderRadius: '4px',
        padding: '1rem 1.125rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        opacity: runtime.visualState === 'bloqueada' ? 0.65 : 1,
        transition: 'border-color 0.2s, opacity 0.2s',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#e5e5e5' }}>{catalog.name}</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '6px', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.55rem',
              fontFamily: 'monospace',
              color: typeMeta.color,
              letterSpacing: '0.08em',
            }}>
              {typeMeta.label.toUpperCase()}
            </span>
            {runtime.classMeta && (
              <span style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: runtime.classMeta.color }}>
                · {runtime.classMeta.label.toUpperCase()}
              </span>
            )}
            <span style={{
              fontSize: '0.55rem',
              fontFamily: 'monospace',
              color: visualMeta.color,
              border: `1px solid ${visualMeta.border}`,
              padding: '1px 6px',
              borderRadius: '2px',
            }}>
              {visualMeta.label.toUpperCase()}
            </span>
          </div>
        </div>
        {!isPassive && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#555', fontSize: '0.6rem', fontFamily: 'monospace' }}>
              <Clock size={11} />
              CD {cooldownTotal}T
            </div>
            {cooldownRemaining > 0 && (
              <div style={{ fontSize: '0.7rem', color: '#eab308', fontFamily: 'monospace', marginTop: '2px' }}>
                {cooldownRemaining} turno(s)
              </div>
            )}
          </div>
        )}
      </header>

      <p style={{ margin: 0, fontSize: '0.75rem', color: '#777', lineHeight: 1.55 }}>{catalog.description}</p>

      <section style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '3px', padding: '0.5rem 0.625rem' }}>
        <div style={{ fontSize: '0.5rem', color: '#06b6d4', fontFamily: 'monospace', marginBottom: '3px' }}>EFEITO</div>
        <p style={{ margin: 0, fontSize: '0.7rem', color: '#999', lineHeight: 1.5 }}>{catalog.mechanicalEffect}</p>
      </section>

      <section style={{ background: 'rgba(234,179,8,0.04)', border: '1px solid rgba(234,179,8,0.15)', borderRadius: '3px', padding: '0.5rem 0.625rem' }}>
        <div style={{ fontSize: '0.5rem', color: '#eab308', fontFamily: 'monospace', marginBottom: '3px' }}>CONSEQUÊNCIA</div>
        <p style={{ margin: 0, fontSize: '0.7rem', color: '#666', lineHeight: 1.5 }}>{catalog.narrativeConsequence}</p>
      </section>

      <footer style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#444', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Zap size={10} style={{ color: '#a855f7' }} />
          {isPassive
            ? (catalog.passiveOverloadRisk ? 'Risco passivo de sobrecarga' : 'Sem custo de ativação')
            : `Usos +${overloadCost}`}
        </span>
        {!isPassive && onActivate && (
          <Button
            type="button"
            variant={canActivate ? 'secondary' : 'ghost'}
            size="xs"
            disabled={!canActivate}
            onClick={() => onActivate(runtime.instance.id)}
            title={blockReason || ''}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              opacity: canActivate ? 1 : 0.45,
            }}
          >
            <Play size={11} /> Ativar
          </Button>
        )}
      </footer>
    </article>
  )
}
