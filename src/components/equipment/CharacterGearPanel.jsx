import React, { useState } from 'react'
import { Dices, Plus, Shirt, Sword, User } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Field, Input, Select, Textarea } from '../ui/Field'
import { GearForgeForm } from './GearForgeForm'
import {
  GEAR_CATEGORIES,
  GEAR_SLOTS,
  getGearItem,
  getWeaponKindLabel,
} from '../../mechanics/equipment/characterGear'
import {
  formatPassive,
  getItemPassivesAligned,
  getPassiveSlotsForCategory,
  getRupturaUsesMax,
  getRupturaUsesRemaining,
  PASSIVE_KINDS,
  rollPassive,
} from '../../mechanics/equipment/gearPassiveEngine'
import {
  getArmorTier,
} from '../../mechanics/equipment/armorProgressionEngine'
import { getWeaponSkill } from '../../mechanics/equipment/weaponProgressionEngine'
import { getArmorType } from '../../constants/equipmentTypes'
import { ATTRIBUTES, SOCIAL_ATTRIBUTES } from '../../constants/attributes'

const ACCENT = '#a855f7'

function SlotFrame({ children, onClick, borderColor = '#1e1e1e', title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        aspectRatio: '1',
        width: '100%',
        background: '#0d0d0d',
        border: `1px solid ${borderColor}`,
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        padding: '4px',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      {children}
    </button>
  )
}

function GearSlot({ item, label, icon: Icon, color, onClick }) {
  return (
    <SlotFrame onClick={onClick} borderColor={item ? `${color}55` : '#1e1e1e'} title={item ? `Editar ${label.toLowerCase()}` : `Forjar ${label.toLowerCase()}`}>
      {item?.image ? (
        <img
          src={item.image}
          alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '3px' }}
        />
      ) : item ? (
        <>
          <Icon size={16} style={{ color }} />
          <span style={{
            fontSize: '0.42rem',
            color: '#888',
            fontFamily: 'monospace',
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {item.name}
          </span>
        </>
      ) : (
        <>
          <Plus size={12} style={{ color: '#333' }} />
          <span style={{ fontSize: '0.4rem', color: '#333', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
            {label.toUpperCase()}
          </span>
        </>
      )}
    </SlotFrame>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={handleRollAll}
          title="Rola todos os slots de uma vez"
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', padding: '4px 10px' }}
        >
          <Dices size={12} />
          Rolagem
        </button>
        {hasDrafts && (
          <button
            type="button"
            className="btn-primary"
            onClick={handleKeepAll}
            style={{ fontSize: '0.65rem', padding: '4px 10px' }}
          >
            Manter tudo
          </button>
        )}
      </div>

      {slots.map((def, i) => {
        const kept = aligned[i]
        const draft = hasDrafts ? drafts[def.slot] : null
        const shown = draft || (!hasDrafts ? kept : null)
        return (
          <div
            key={def.slot}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.5rem',
              border: `1px solid ${shown ? `${color}44` : '#1e1e1e'}`,
              borderRadius: '3px',
              background: draft ? 'rgba(168,85,247,0.06)' : '#0a0a0a',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.7rem', color: shown ? '#ccc' : '#333', fontFamily: 'monospace' }}>
                {shown ? formatPassive(shown) : (hasDrafts ? '—' : 'não rolado')}
              </div>
            </div>
          </div>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {slots.map((def, index) => {
          const kept = aligned[index]
          return (
            <div
              key={def.slot}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.5rem',
                border: `1px solid ${kept ? `${color}44` : '#1e1e1e'}`,
                borderRadius: '3px',
                background: '#0a0a0a',
              }}
            >
              <div style={{ fontSize: '0.7rem', color: kept ? '#ccc' : '#333', fontFamily: 'monospace' }}>
                {kept ? formatPassive(kept) : 'sem valor'}
              </div>
            </div>
          )
        })}
        <button
          type="button"
          className="btn-secondary"
          onClick={openEditor}
          style={{ alignSelf: 'flex-end', fontSize: '0.65rem', padding: '4px 10px' }}
        >
          Editar valores
        </button>
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
        <button type="button" className="btn-primary" onClick={handleSave} style={{ fontSize: '0.7rem' }}>
          Salvar valores
        </button>
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
        <Field label="Custo sobrecarga">
          <Input type="number" min={0} value={form.overloadCost} onChange={e => set('overloadCost', e.target.value)} />
        </Field>
      </div>
      <button type="submit" className="btn-primary" disabled={!form.name.trim()} style={{ alignSelf: 'flex-end', fontSize: '0.7rem' }}>
        Salvar skill
      </button>
    </form>
  )
}

function WeaponDetails({ character, weapon, onSetPassive, onSetWeaponSkill, manualValues = false }) {
  const kindLabel = getWeaponKindLabel(weapon)
  const weaponSkill = getWeaponSkill(weapon)
  const [editingSkill, setEditingSkill] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e5e5e5' }}>{weapon.name}</span>
      </div>

      {kindLabel && (
        <div style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#f97316' }}>
          {kindLabel}
        </div>
      )}

      <div style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: '#444' }}>ATRIBUTOS DE ITEM</div>
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
        marginTop: '0.25rem',
        padding: '0.5rem 0.55rem',
        border: '1px solid #1e1e1e',
        borderRadius: '3px',
        background: '#0a0a0a',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: '#444' }}>SKILL DA ARMA (4ª)</span>
          <button type="button" className="btn-ghost" onClick={() => setEditingSkill(v => !v)} style={{ fontSize: '0.55rem' }}>
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
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e5e5e5' }}>{weaponSkill.name}</div>
            {weaponSkill.mechanicalEffect && (
              <p style={{ fontSize: '0.65rem', color: '#888', margin: '0.25rem 0 0', lineHeight: 1.45 }}>
                {weaponSkill.mechanicalEffect}
              </p>
            )}
          </div>
        ) : (
          <div style={{ fontSize: '0.65rem', color: '#444' }}>Player + mestre definem a skill aqui.</div>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e5e5e5' }}>{armor.name}</span>
        <span style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: tier.color }}>
          {tier.label.toUpperCase()} · NV {tier.level}
        </span>
      </div>

      {typeMeta && (
        <div style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: typeMeta.color }}>
          {typeMeta.icon} {typeMeta.label}
        </div>
      )}

      <div style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: '#444' }}>ATRIBUTOS DE ITEM</div>
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
  const armorTier = getArmorTier(character)
  const rupturaMax = getRupturaUsesMax(character)
  const rupturaLeft = getRupturaUsesRemaining(character)

  const handleSave = (data) => {
    onForge?.(forging.category, data)
    setForging(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sword size={14} style={{ color: ACCENT }} />
          <span style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
            EQUIPAMENTO
          </span>
        </div>
        {rupturaMax > 0 && (
          <span style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#d97706' }}>
            RUPTURA {rupturaLeft}/{rupturaMax}
          </span>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '72px 1fr',
        gap: '0.5rem',
        maxWidth: '320px',
        alignItems: 'stretch',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {GEAR_SLOTS.map(slot => {
            const isWeapon = slot.category === GEAR_CATEGORIES.WEAPON
            const item = isWeapon ? weapon : armor
            return (
              <GearSlot
                key={slot.id}
                item={item}
                label={slot.label}
                icon={isWeapon ? Sword : Shirt}
                color={isWeapon ? '#f97316' : armorTier.color}
                onClick={() => setForging({ category: slot.category, item })}
              />
            )
          })}
        </div>

        <div style={{
          background: '#0b0b0b',
          border: '1px solid #1a1a1a',
          borderRadius: '6px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          padding: '0.75rem',
          minHeight: '148px',
        }}>
          {character.image ? (
            <img
              src={character.image}
              alt={character.name}
              style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', borderRadius: '4px', opacity: 0.9 }}
            />
          ) : (
            <User size={56} style={{ color: '#1e1e1e' }} />
          )}
          <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#555', textAlign: 'center' }}>
            {character.name}
          </div>
          <div style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: '#333' }}>
            NV {character.level ?? 1}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{
          background: '#0d0d0d',
          border: `1px solid ${weapon ? 'rgba(249,115,22,0.25)' : '#1a1a1a'}`,
          borderRadius: '4px',
          padding: '0.65rem 0.75rem',
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
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setForging({ category: GEAR_CATEGORIES.WEAPON, item: null })}
              style={{ fontSize: '0.7rem' }}
            >
              Forjar arma
            </button>
          )}
        </div>

        <div style={{
          background: '#0d0d0d',
          border: `1px solid ${armor ? 'rgba(22,163,74,0.25)' : '#1a1a1a'}`,
          borderRadius: '4px',
          padding: '0.65rem 0.75rem',
        }}>
          {armor ? (
            <ArmorDetails character={character} armor={armor} onSetPassive={onSetPassive} manualValues={manualValues} />
          ) : (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setForging({ category: GEAR_CATEGORIES.ARMOR, item: null })}
              style={{ fontSize: '0.7rem' }}
            >
              Forjar armadura
            </button>
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
