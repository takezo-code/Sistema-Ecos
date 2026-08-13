import React from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { clearAllCooldowns } from '../../mechanics/skills/cooldownEngine'
import { Button } from '../../components/ui/Button'

export function CharacterSettings({ character, onUpdate, onAdvanceTurn, onRestEco, onRemoveSkill }) {
  return (
    <div style={{ padding: '1rem 1.5rem', overflowY: 'auto', height: '100%', maxWidth: '560px' }}>
      <PageHeader title="Configurações" subtitle="Ferramentas da ficha de Eco" />
      <section style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.7rem', color: '#444', fontFamily: 'monospace', marginBottom: '0.75rem' }}>TURNO E SOBRECARGA</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Button type="button" variant="secondary" size="xs" onClick={onAdvanceTurn}>
            Avançar turno (reduz cooldowns)
          </Button>
          <button type="button" className="btn-ghost" style={{ fontSize: '0.75rem' }} onClick={onRestEco}>
            Descansar Eco (zerar sobrecarga)
          </button>
          <button
            type="button"
            className="btn-ghost"
            style={{ fontSize: '0.75rem' }}
            onClick={() => onUpdate?.({ skillCooldowns: clearAllCooldowns(), currentTurn: 0 })}
          >
            Resetar cooldowns e contador de turno
          </button>
        </div>
      </section>
      <section>
        <h3 style={{ fontSize: '0.7rem', color: '#444', fontFamily: 'monospace', marginBottom: '0.75rem' }}>REMOVER HABILIDADE</h3>
        {(character.skills || []).length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: '#444' }}>Nenhuma habilidade na ficha.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {(character.skills || []).map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: '#111', borderRadius: '3px' }}>
                <span style={{ fontSize: '0.8rem', color: '#ccc' }}>{s.name}</span>
                <button type="button" className="btn-ghost" style={{ fontSize: '0.65rem', color: '#dc2626' }} onClick={() => onRemoveSkill?.(s.id)}>
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
