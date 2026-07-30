import React, { useState, useEffect } from 'react'
import { Field, Input, Textarea } from '../ui/Field'
import { ECO_SKILL_TYPES } from '../../constants/skillTypes'
import { createEmptySkillDraft } from '../../services/skillsCatalogService'
import {
  SKILL_AUDIENCE,
  SKILL_AUDIENCE_META,
  CREATABLE_SKILL_AUDIENCES,
  normalizeCreatableAudience,
} from '../../constants/skillAudience'

export function SkillForm({
  initial,
  defaultAudience = SKILL_AUDIENCE.NPC,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
  lockAudience = false,
}) {
  const [form, setForm] = useState(() => ({
    ...createEmptySkillDraft(normalizeCreatableAudience(defaultAudience)),
    ...initial,
    audience: normalizeCreatableAudience(initial?.audience ?? defaultAudience),
    skillType: ECO_SKILL_TYPES.ATIVA,
    classId: null,
  }))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (initial) {
      setForm({
        ...createEmptySkillDraft(normalizeCreatableAudience(initial.audience)),
        ...initial,
        audience: normalizeCreatableAudience(initial.audience),
        skillType: ECO_SKILL_TYPES.ATIVA,
        classId: null,
      })
    }
  }, [initial])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const setAudience = (audience) => {
    setForm(f => ({
      ...f,
      audience: normalizeCreatableAudience(audience),
      classId: null,
    }))
    setError(null)
  }

  const handleSubmit = e => {
    e.preventDefault()
    setError(null)
    onSubmit?.({
      ...form,
      skillType: ECO_SKILL_TYPES.ATIVA,
      audience: normalizeCreatableAudience(form.audience),
      classId: null,
    })
  }

  const currentAudience = normalizeCreatableAudience(form.audience)

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Field label="Nome" required>
        <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex.: Foco Fragmentado" required />
      </Field>

      {!lockAudience && (
        <div>
          <div style={{ fontSize: '0.7rem', color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.35rem' }}>
            Para quem
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            {CREATABLE_SKILL_AUDIENCES.map(key => {
              const meta = SKILL_AUDIENCE_META[key]
              const selected = currentAudience === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAudience(key)}
                  title={meta.description}
                  style={{
                    padding: '0.55rem 0.4rem',
                    background: selected ? `${meta.color}14` : '#0d0d0d',
                    border: `1px solid ${selected ? meta.color : '#1a1a1a'}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: selected ? meta.color : '#aaa' }}>
                    {meta.label}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Field label="Cooldown (turnos)">
          <Input type="number" min={0} max={20} value={form.cooldownTurns}
            onChange={e => set('cooldownTurns', Number(e.target.value))} />
        </Field>
        <Field label="Custo de sobrecarga">
          <Input type="number" min={0} max={5} value={form.overloadCost}
            onChange={e => set('overloadCost', Number(e.target.value))} />
        </Field>
      </div>

      <Field label="Descrição">
        <Textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
          placeholder="O que o poder faz, em tom humano e limitado." />
      </Field>

      <Field label="Efeito mecânico">
        <Textarea rows={2} value={form.mechanicalEffect} onChange={e => set('mechanicalEffect', e.target.value)}
          placeholder="Bônus, vantagem narrativa, duração…" />
      </Field>

      <Field label="Consequência narrativa">
        <Textarea rows={2} value={form.narrativeConsequence} onChange={e => set('narrativeConsequence', e.target.value)}
          placeholder="Tremor, dor de cabeça, irritabilidade…" />
      </Field>

      {error && (
        <p style={{
          margin: 0,
          fontSize: '0.72rem',
          color: '#f87171',
          padding: '0.5rem 0.65rem',
          background: 'rgba(220,38,38,0.08)',
          border: '1px solid rgba(220,38,38,0.2)',
          borderRadius: '3px',
        }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
        {onCancel && (
          <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        )}
        <button type="submit" className="btn-primary">{submitLabel}</button>
      </div>
    </form>
  )
}
