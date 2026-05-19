import React, { useState, useEffect } from 'react'
import { Field, Input, Textarea, Select } from '../ui/Field'
import { ECO_SKILL_TYPES } from '../../constants/skillTypes'
import { SKILL_CATEGORIES, SKILL_CATEGORY_META } from '../../constants/skillCategories'
import { createEmptySkillDraft } from '../../services/skillsCatalogService'

export function SkillForm({ initial, onSubmit, onCancel, submitLabel = 'Salvar' }) {
  const [form, setForm] = useState(() => ({ ...createEmptySkillDraft(), ...initial }))

  useEffect(() => {
    if (initial) setForm({ ...createEmptySkillDraft(), ...initial })
  }, [initial])

  const isPassiva = form.skillType === ECO_SKILL_TYPES.PASSIVA
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit?.(form)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Field label="Nome" required>
        <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex.: Foco Fragmentado" required />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Field label="Tipo">
          <Select value={form.skillType} onChange={e => set('skillType', e.target.value)}>
            <option value={ECO_SKILL_TYPES.ATIVA}>Ativa</option>
            <option value={ECO_SKILL_TYPES.PASSIVA}>Passiva</option>
          </Select>
        </Field>
        <Field label="Categoria">
          <Select value={form.category} onChange={e => set('category', e.target.value)}>
            {Object.entries(SKILL_CATEGORY_META).map(([key, meta]) => (
              <option key={key} value={key}>{meta.label}</option>
            ))}
          </Select>
        </Field>
      </div>

      {!isPassiva && (
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
      )}

      {isPassiva && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#888', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={form.passiveOverloadRisk}
            onChange={e => set('passiveOverloadRisk', e.target.checked)}
          />
          Risco passivo de sobrecarga (+1 por turno em cenas longas)
        </label>
      )}

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

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary">{submitLabel}</button>
      </div>
    </form>
  )
}
