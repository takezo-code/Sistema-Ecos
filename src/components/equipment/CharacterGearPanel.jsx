import React, { useState } from 'react'
import { Dices, Sword, Shield, Sparkles } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Field, Input, Select, Textarea } from '../ui/Field'
import { GearForgeForm } from './GearForgeForm'
import {
  GEAR_CATEGORIES,
  getGearItem,
  getWeaponKindLabel,
} from '../../mechanics/equipment/characterGear'
import {
  formatPassive,
  getItemPassivesAligned,
  getPassiveSlotsForCategory,
  PASSIVE_KINDS,
  rollPassive,
} from '../../mechanics/equipment/gearPassiveEngine'
import {
  getArmorTier,
} from '../../mechanics/equipment/armorProgressionEngine'
import { getWeaponSkill } from '../../mechanics/equipment/weaponProgressionEngine'
import { getArmorType } from '../../constants/equipmentTypes'
import { ATTRIBUTES, SOCIAL_ATTRIBUTES } from '../../constants/attributes'
import { Button } from '../ui/Button'

function GearHeader({ icon: Icon, name, color, tags = [] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
      <span style={{
        width: 26,
        height: 26,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        background: `${color}1a`,
        border: `1px solid ${color}44`,
        color,
      }}>
        <Icon size={13} strokeWidth={2.2} />
      </span>
      <span style={{ fontSize: '0.9rem', fontWeight: 750, color: '#f0f0f0', letterSpacing: '-0.01em' }}>
        {name}
      </span>
      {tags.filter(Boolean).map(tag => (
        <span
          key={tag.label}
          style={{
            fontSize: '0.55rem',
            fontFamily: 'monospace',
            letterSpacing: '0.06em',
            color: tag.color,
            background: `${tag.color}12`,
            border: `1px solid ${tag.color}30`,
            borderRadius: 999,
            padding: '0.15rem 0.45rem',
            whiteSpace: 'nowrap',
          }}
        >
          {tag.label}
        </span>
      ))}
    </div>
  )
}

function PassiveRow({ text, color, empty = false, highlight = false }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '0.45rem 0.6rem',
      borderRadius: 8,
      border: `1px solid ${empty ? 'rgba(255,255,255,0.06)' : `${color}3a`}`,
      background: highlight ? 'rgba(168,85,247,0.07)' : 'rgba(255,255,255,0.02)',
      fontSize: '0.7rem',
      fontFamily: 'monospace',
      color: empty ? '#4a4a4a' : '#d4d4d4',
    }}>
      {text}
    </div>
  )
}

function ItemAttributesRow({ category, item, color, onKeepAll }) {
  const slots = getPassiveSlotsForCategory(category)
  const aligned = getItemPassivesAligned(category, item)
  const [drafts, setDrafts] = useState(null)

  const hasDrafts = drafts != null

  const handleRollAll = () => {
    const next = {}
    for (const def of slots) {
      const rolled = rollPassive(category, def.slot)
      if (rolled) next[def.slot] = rolled
    }
    setDrafts(next)
  }

  const handleKeepAll = () => {
    if (!drafts) return
    const list = slots.map(def => drafts[def.slot]).filter(Boolean)
    onKeepAll?.(list)
    setDrafts(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <Button
          type="button"
          variant="secondary"
          size="xs"
          onClick={handleRollAll}
          title="Rola todos os slots de uma vez"
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '4px 10px' }}
        >
          <Dices size={12} />
          Rolagem
        </Button>
        {hasDrafts && (
          <Button
            type="button"
            size="xs"
            onClick={handleKeepAll}
            style={{ padding: '4px 10px' }}
          >
            Manter tudo
          </Button>
        )}
      </div>

      {slots.map((def, i) => {
        const kept = aligned[i]
        const draft = hasDrafts ? drafts[def.slot] : null
        const shown = draft || (!hasDrafts ? kept : null)
        return (
          <PassiveRow
            key={def.slot}
            color={color}
            empty={!shown}
            highlight={!!draft}
            text={shown ? formatPassive(shown) : (hasDrafts ? '—' : 'não rolado')}
          />
        )
      })}
    </div>
  )
}

const ATTRIBUTE_OPTIONS = [...ATTRIBUTES, ...SOCIAL_ATTRIBUTES]

function ManualItemAttributesRow({ category, item, color, onSave }) {
  const slots = getPassiveSlotsForCategory(category)
  const aligned = getItemPassivesAligned(category, item)
  const [drafts, setDrafts] = useState(null)

  const editing = drafts != null

  const openEditor = () => {
    setDrafts(slots.map((def, index) => ({
      slot: def.slot,
      kind: def.kind,
      attrKey: aligned[index]?.attrKey || ATTRIBUTE_OPTIONS[0].key,
      value: aligned[index]?.value ?? 0,
    })))
  }

  const setDraft = (index, patch) => {
    setDrafts(current => current.map((draft, i) => i === index ? { ...draft, ...patch } : draft))
  }

  const handleSave = () => {
    onSave?.(drafts
      .map(draft => ({ ...draft, value: Number(draft.value) || 0 }))
      .filter(draft => draft.value !== 0))
    setDrafts(null)
  }

  if (!editing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {slots.map((def, index) => {
          const kept = aligned[index]
          return (
            <PassiveRow
              key={def.slot}
              color={color}
              empty={!kept}
              text={kept ? formatPassive(kept) : 'sem valor'}
            />
          )
        })}
        <Button
          type="button"
          variant="secondary"
          size="xs"
          onClick={openEditor}
          style={{ alignSelf: 'flex-end', padding: '4px 10px' }}
        >
          Editar valores
        </Button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
      {slots.map((def, index) => {
        const draft = drafts[index]
        const needsAttribute = def.kind === PASSIVE_KINDS.ATTR || def.kind === PASSIVE_KINDS.ROLL_BONUS
        return (
          <div
            key={def.slot}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 90px',
              gap: '0.4rem',
              alignItems: 'end',
              padding: '0.5rem',
              border: `1px solid ${color}33`,
              borderRadius: '3px',
              background: '#0a0a0a',
            }}
          >
            {needsAttribute ? (
              <Field label={def.label}>
                <Select
                  value={draft.attrKey}
                  onChange={event => setDraft(index, { attrKey: event.target.value })}
                >
                  {ATTRIBUTE_OPTIONS.map(attribute => (
                    <option key={attribute.key} value={attribute.key}>{attribute.label}</option>
                  ))}
                </Select>
              </Field>
            ) : (
              <div style={{ fontSize: '0.7rem', color: '#888', paddingBottom: '0.55rem' }}>{def.label}</div>
            )}
            <Field label="Valor">
              <Input
                type="number"
                value={draft.value}
                onChange={event => setDraft(index, { value: event.target.value })}
              />
            </Field>
          </div>
        )
      })}
      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
        <button type="button" className="btn-ghost" onClick={() => setDrafts(null)} style={{ fontSize: '0.7rem' }}>
          Cancelar
        </button>
        <Button type="button" size="xs" onClick={handleSave}>
          Salvar valores
        </Button>
      </div>
    </div>
  )
}

function WeaponSkillEditor({ skill, onSave }) {
  const [form, setForm] = useState({
    name: skill?.name ?? '',
    description: skill?.description ?? '',
    mechanicalEffect: skill?.mechanicalEffect ?? '',
    narrativeConsequence: skill?.narrativeConsequence ?? '',
    cooldownTurns: skill?.cooldownTurns ?? 2,
    overloadCost: skill?.overloadCost ?? 1,
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        if (!form.name.trim()) return
        onSave?.(form)
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}
    >
      <Field label="Nome da skill" required>
        <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex.: Disparo Resonante" />
      </Field>
      <Field label="Descrição">
        <Textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)} />
      </Field>
      <Field label="Efeito mecânico">
        <Textarea rows={2} value={form.mechanicalEffect} onChange={e => set('mechanicalEffect', e.target.value)} placeholder="O que a skill faz na mesa..." />
      </Field>
      <Field label="Consequência narrativa">
        <Textarea rows={2} value={form.narrativeConsequence} onChange={e => set('narrativeConsequence', e.target.value)} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <Field label="Cooldown (turnos)">
          <Input type="number" min={0} value={form.cooldownTurns} onChange={e => set('cooldownTurns', e.target.value)} />
        </Field>
        <Field label="Custo (usos de Ruptura)">
          <Input type="number" min={0} value={form.overloadCost} onChange={e => set('overloadCost', e.target.value)} />
        </Field>
      </div>
      <Button type="submit" size="xs" disabled={!form.name.trim()} style={{ alignSelf: 'flex-end' }}>
        Salvar skill
      </Button>
    </form>
  )
}

function WeaponDetails({ character: _character, weapon, onSetPassive, onSetWeaponSkill, manualValues = false }) {
  const kindLabel = getWeaponKindLabel(weapon)
  const weaponSkill = getWeaponSkill(weapon)
  const [editingSkill, setEditingSkill] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <GearHeader
        icon={Sword}
        name={weapon.name}
        color="#f97316"
        tags={[kindLabel ? { label: kindLabel, color: '#f97316' } : null]}
      />

      {manualValues ? (
        <ManualItemAttributesRow
          category={GEAR_CATEGORIES.WEAPON}
          item={weapon}
          color="#f97316"
          onSave={list => onSetPassive?.(GEAR_CATEGORIES.WEAPON, list)}
        />
      ) : (
        <ItemAttributesRow
          category={GEAR_CATEGORIES.WEAPON}
          item={weapon}
          color="#f97316"
          onKeepAll={list => onSetPassive?.(GEAR_CATEGORIES.WEAPON, list)}
        />
      )}

      <div style={{
        marginTop: '0.1rem',
        padding: '0.6rem 0.7rem',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10,
        background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: '0.55rem',
            fontFamily: 'monospace',
            letterSpacing: '0.1em',
            color: '#7a7a7a',
          }}>
            <Sparkles size={10} style={{ color: '#a855f7' }} />
            SKILL DA ARMA
          </span>
          <button type="button" className="btn-ghost" onClick={() => setEditingSkill(v => !v)} style={{ fontSize: '0.6rem' }}>
            {editingSkill ? 'Fechar' : (weaponSkill ? 'Editar' : 'Criar')}
          </button>
        </div>
        {editingSkill ? (
          <WeaponSkillEditor
            skill={weaponSkill}
            onSave={data => {
              onSetWeaponSkill?.(data)
              setEditingSkill(false)
            }}
          />
        ) : weaponSkill ? (
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e5e5e5' }}>{weaponSkill.name}</div>
            {weaponSkill.mechanicalEffect && (
              <p style={{ fontSize: '0.66rem', color: '#888', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
                {weaponSkill.mechanicalEffect}
              </p>
            )}
          </div>
        ) : (
          <div style={{ fontSize: '0.66rem', color: '#555' }}>Player + mestre definem a skill aqui.</div>
        )}
      </div>

      {weapon.description && (
        <p style={{ fontSize: '0.65rem', color: '#666', lineHeight: 1.5, margin: 0 }}>{weapon.description}</p>
      )}
    </div>
  )
}

function ArmorDetails({ character, armor, onSetPassive, manualValues = false }) {
  const typeMeta = getArmorType(armor.type)
  const tier = getArmorTier(character)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <GearHeader
        icon={Shield}
        name={armor.name}
        color="#16a34a"
        tags={[
          { label: `${tier.label.toUpperCase()} · NV ${tier.level}`, color: tier.color },
          typeMeta ? { label: typeMeta.label, color: typeMeta.color } : null,
        ]}
      />

      {manualValues ? (
        <ManualItemAttributesRow
          category={GEAR_CATEGORIES.ARMOR}
          item={armor}
          color="#16a34a"
          onSave={list => onSetPassive?.(GEAR_CATEGORIES.ARMOR, list)}
        />
      ) : (
        <ItemAttributesRow
          category={GEAR_CATEGORIES.ARMOR}
          item={armor}
          color="#16a34a"
          onKeepAll={list => onSetPassive?.(GEAR_CATEGORIES.ARMOR, list)}
        />
      )}

      {armor.description && (
        <p style={{ fontSize: '0.65rem', color: '#666', lineHeight: 1.5, margin: 0 }}>{armor.description}</p>
      )}
    </div>
  )
}

/**
 * Equipamento pessoal: arma (3 atributos de item + skill) e armadura (4 atributos; raridade por nível).
 */
export function CharacterGearPanel({ character, onForge, onSetPassive, onSetWeaponSkill, manualValues = false }) {
  const [forging, setForging] = useState(null)

  if (!character) return null

  const weapon = getGearItem(character, GEAR_CATEGORIES.WEAPON)
  const armor = getGearItem(character, GEAR_CATEGORIES.ARMOR)

  const handleSave = (data) => {
    onForge?.(forging.category, data)
    setForging(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{
          background: 'rgba(255,255,255,0.018)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderLeft: `3px solid ${weapon ? '#f97316' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 12,
          padding: '0.8rem 0.9rem',
        }}>
          {weapon ? (
            <WeaponDetails
              character={character}
              weapon={weapon}
              onSetPassive={onSetPassive}
              onSetWeaponSkill={onSetWeaponSkill}
              manualValues={manualValues}
            />
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="xs"
              onClick={() => setForging({ category: GEAR_CATEGORIES.WEAPON, item: null })}
            >
              Forjar arma
            </Button>
          )}
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.018)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderLeft: `3px solid ${armor ? '#16a34a' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 12,
          padding: '0.8rem 0.9rem',
        }}>
          {armor ? (
            <ArmorDetails character={character} armor={armor} onSetPassive={onSetPassive} manualValues={manualValues} />
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="xs"
              onClick={() => setForging({ category: GEAR_CATEGORIES.ARMOR, item: null })}
            >
              Forjar armadura
            </Button>
          )}
        </div>
      </div>

      <Modal
        open={!!forging}
        onClose={() => setForging(null)}
        title={forging?.category === GEAR_CATEGORIES.ARMOR
          ? (forging?.item ? 'Editar armadura' : 'Forjar armadura')
          : (forging?.item ? 'Editar arma' : 'Forjar arma')}
        maxWidth="480px"
      >
        {forging && (
          <GearForgeForm
            category={forging.category}
            initial={forging.item}
            onSave={handleSave}
            onCancel={() => setForging(null)}
          />
        )}
      </Modal>
    </div>
  )
}
