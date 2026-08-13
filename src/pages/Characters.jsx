import React, { useState, useEffect } from 'react'
import { Sword, Plus, Pencil, Trash2, Package, User, ChevronUp, ChevronDown } from 'lucide-react'
import { useCharacterStore } from '../store/useCharacterStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { filterByActiveCampaign, withActiveCampaign } from '../utils/campaignScope'
import { ActiveCampaignBanner } from '../components/ui/ActiveCampaignBanner'
import { PageHeader } from '../components/ui/PageHeader'
import { Modal } from '../components/ui/Modal'
import { Field, Input, Textarea } from '../components/ui/Field'
import { ImageUpload } from '../components/ui/ImageUpload'
import { EntityThumb } from '../components/ui/EntityThumb'
import { EmptyState } from '../components/ui/EmptyState'
import {
  ATTRIBUTES,
  SOCIAL_ATTRIBUTES,
  defaultAttributes,
  defaultSocialAttributes,
  STARTING_ATTRIBUTE_POINTS,
  INITIAL_ATTRIBUTE_MAX,
  STARTING_SOCIAL_POINTS,
  INITIAL_SOCIAL_MAX,
} from '../constants/attributes'
import {
  applyInitialAttributeChange,
  applyInitialSocialChange,
  finalizeCreationAttributes,
  validateStartingAttributesDistributed,
  validateStartingSocialDistributed,
  validateStartingEcoSkillSelected,
} from '../services/progressionService'
import { resolveCharacterNarrative } from '../utils/entityNarrative'
import { getEntityEffectiveAttributes } from '../services/stateModifiers'
import { ClassPicker } from '../components/creation/ClassPicker'
import { Button } from '../components/ui/Button'
import { ClassSkillBook } from '../components/skills/ClassSkillBook'
import { getCharacterClass, normalizeClassId } from '../constants/classes'
import { getClassAttributeBonus } from '../mechanics/classes/classBonusEngine'
import { investSkillPoint } from '../mechanics/skills/classSkillProgressionEngine'
import { buildInitialGear, getForgeableArmorTypes } from '../mechanics/equipment/characterGear'
import { StarterGearSection } from '../components/equipment/StarterGearSection'
import Stepper, { Step } from '../components/react-bits/Stepper'
import Counter from '../components/react-bits/Counter'
import SpotlightCard from '../components/react-bits/SpotlightCard'
import { FloatingTooltip } from '../components/ui/FloatingTooltip'

const EMPTY_FORM = {
  name: '',
  image: '',
  appearance: '',
  personality: '',
  history: '',
  motivation: '',
  classId: null,
  attributes: defaultAttributes(),
  unspentAttributePoints: STARTING_ATTRIBUTE_POINTS,
  socialAttributes: defaultSocialAttributes(),
  unspentSocialPoints: STARTING_SOCIAL_POINTS,
  ecoPoints: 1,
  skills: [],
  starterWeapon: { name: '', kind: '', description: '', image: '', passives: [] },
  starterArmor: { name: '', type: getForgeableArmorTypes()[0].id, image: '', passives: [] },
}

const narrativeSectionLabel = {
  fontSize: '0.65rem',
  color: '#444',
  fontFamily: 'monospace',
  letterSpacing: '0.1em',
  marginBottom: '0.25rem',
}

function AttributeInput({ attr, value, onChange, canIncrease, classBonus = 0, isClassAttr = false }) {
  return (
    <div style={{
      background: '#0d0d0d',
      border: `1px solid ${isClassAttr ? 'rgba(217,119,6,0.35)' : '#1a1a1a'}`,
      borderRadius: '3px',
      padding: '0.625rem 0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div>
        <div style={{ fontSize: '0.6rem', color: attr.color, fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '2px' }}>
          {attr.label.toUpperCase()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', lineHeight: 1 }}>
          <Counter value={value} fontSize={20} textColor="#e5e5e5" fontWeight={700} gradientHeight={0} />
          {classBonus > 0 && (
            <span style={{ fontSize: '0.6rem', color: '#d97706', fontWeight: 700 }}>
              +{classBonus}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <button type="button"
          disabled={!canIncrease}
          onClick={() => onChange(value + 1)}
          style={{ background: '#1a1a1a', border: 'none', color: canIncrease ? '#666' : '#222', cursor: canIncrease ? 'pointer' : 'not-allowed', padding: '3px 6px', borderRadius: '2px', display: 'flex', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#e5e5e5'}
          onMouseLeave={e => e.currentTarget.style.color = '#666'}
        >
          <ChevronUp size={12} />
        </button>
        <button type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          style={{ background: '#1a1a1a', border: 'none', color: '#666', cursor: 'pointer', padding: '3px 6px', borderRadius: '2px', display: 'flex', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#e5e5e5'}
          onMouseLeave={e => e.currentTarget.style.color = '#666'}
        >
          <ChevronDown size={12} />
        </button>
      </div>
    </div>
  )
}

export function CharacterForm({ initial, onSave, onCancel, profileOnly = false }) {
  const isNew = !initial?.id
  const [form, setForm] = useState(() => {
    if (!initial) return { ...EMPTY_FORM }
    return {
      ...initial,
      ...resolveCharacterNarrative(initial),
      classId: normalizeClassId(initial.classId),
      attributes: { ...defaultAttributes(), ...(initial.attributes || {}) },
      unspentAttributePoints: initial.unspentAttributePoints ?? STARTING_ATTRIBUTE_POINTS,
      socialAttributes: { ...defaultSocialAttributes(), ...(initial.socialAttributes || {}) },
      unspentSocialPoints: initial.unspentSocialPoints ?? STARTING_SOCIAL_POINTS,
      ecoPoints: initial.ecoPoints ?? 0,
      skills: initial.skills ?? [],
      starterWeapon: { ...EMPTY_FORM.starterWeapon },
      starterArmor: { ...EMPTY_FORM.starterArmor },
    }
  })
  const [attrError, setAttrError] = useState(null)
  const useWizard = isNew && !profileOnly
  const [step, setStep] = useState(1)
  const totalSteps = 4

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }))
  const setAttr = (key, val) => {
    const patch = applyInitialAttributeChange(form, key, val)
    if (patch) {
      setForm(p => ({ ...p, ...patch }))
      setAttrError(null)
    }
  }
  const setSocialAttr = (key, val) => {
    const patch = applyInitialSocialChange(form, key, val)
    if (patch) {
      setForm(p => ({ ...p, ...patch }))
      setAttrError(null)
    }
  }

  const setClassId = (classId) => {
    setForm(p => ({
      ...p,
      classId,
      ...(isNew ? { skills: [], ecoPoints: 1 } : {}),
    }))
    setAttrError(null)
  }

  const handleInvestStarterSkill = (templateId) => {
    const result = investSkillPoint(form, templateId)
    if (result.error) {
      setAttrError(result.error.message)
      return
    }
    setForm(p => ({ ...p, ...result.patch }))
    setAttrError(null)
  }

  const resetStarterSkill = () => {
    setForm(p => ({ ...p, skills: [], ecoPoints: 1 }))
    setAttrError(null)
  }

  const classAttrKeys = getCharacterClass(form.classId)?.attributes ?? []
  const pool = form.unspentAttributePoints ?? 0
  const socialPool = form.unspentSocialPoints ?? 0
  const ecoCheck = validateStartingEcoSkillSelected(form)
  const creationReady = !isNew || profileOnly
    || (
      validateStartingAttributesDistributed(form).ok
      && validateStartingSocialDistributed(form).ok
      && ecoCheck.ok
    )
  const starterSkillPicked = (form.skills || []).some(s => (Number(s.tier) || 0) > 0)

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (profileOnly) {
      const { description: _d, narrativeStatus: _s, ...profile } = form
      onSave({
        name: profile.name,
        image: profile.image,
        appearance: profile.appearance,
        personality: profile.personality,
        history: profile.history,
        motivation: profile.motivation,
      })
      return
    }
    if (isNew) {
      const checkPhysical = validateStartingAttributesDistributed(form)
      if (!checkPhysical.ok) {
        setAttrError(checkPhysical.message)
        return
      }
      const checkSocial = validateStartingSocialDistributed(form)
      if (!checkSocial.ok) {
        setAttrError(checkSocial.message)
        return
      }
      const checkEco = validateStartingEcoSkillSelected(form)
      if (!checkEco.ok) {
        setAttrError(checkEco.message)
        return
      }
    }
    setAttrError(null)
    const {
      description: _d,
      narrativeStatus: _s,
      starterWeapon,
      starterArmor,
      ...payload
    } = form
    if (isNew) {
      payload.equipped = buildInitialGear({ weapon: starterWeapon, armor: starterArmor })
    }
    onSave(payload)
  }

  const stepTitle = {
    fontSize: '0.65rem',
    color: '#666',
    fontFamily: 'monospace',
    letterSpacing: '0.12em',
    marginBottom: '0.75rem',
  }

  const profileBlock = (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
      <Field label="Nome" required>
        <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nome do personagem" autoFocus={step === 1 || !useWizard} />
      </Field>
      <ImageUpload
        value={form.image}
        onChange={v => set('image', v)}
        label="Foto do personagem"
      />
      <div>
        <div style={narrativeSectionLabel}>PERFIL NARRATIVO</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Field label="História">
            <Textarea
              value={form.history}
              onChange={e => set('history', e.target.value)}
              placeholder="Passado, origem, eventos relevantes..."
              rows={3}
            />
          </Field>
          <Field label="Motivações">
            <Textarea
              value={form.motivation}
              onChange={e => set('motivation', e.target.value)}
              placeholder="Objetivos, medos, o que move este personagem..."
              rows={2}
            />
          </Field>
        </div>
      </div>
    </div>
  )

  const classBlock = (
    <ClassPicker value={form.classId ?? null} onChange={setClassId} />
  )

  const attributesBlock = (
    <>
      <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <Counter value={pool} fontSize={14} textColor={pool > 0 ? '#eab308' : '#16a34a'} fontWeight={700} gradientHeight={0} />
        disponíveis
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
        {ATTRIBUTES.map(attr => {
          const v = form.attributes[attr.key] || 0
          return (
            <AttributeInput
              key={attr.key}
              attr={attr}
              value={v}
              isClassAttr={classAttrKeys.includes(attr.key)}
              classBonus={getClassAttributeBonus(form, attr.key)}
              canIncrease={pool > 0 && v < INITIAL_ATTRIBUTE_MAX}
              onChange={val => setAttr(attr.key, val)}
            />
          )
        })}
      </div>

      <hr className="divide-line" />
      <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <Counter value={socialPool} fontSize={14} textColor={socialPool > 0 ? '#e879f9' : '#16a34a'} fontWeight={700} gradientHeight={0} />
        disponíveis
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
        {SOCIAL_ATTRIBUTES.map(attr => {
          const v = form.socialAttributes?.[attr.key] || 0
          return (
            <AttributeInput
              key={attr.key}
              attr={attr}
              value={v}
              isClassAttr={classAttrKeys.includes(attr.key)}
              classBonus={getClassAttributeBonus(form, attr.key)}
              canIncrease={socialPool > 0 && v < INITIAL_SOCIAL_MAX}
              onChange={val => setSocialAttr(attr.key, val)}
            />
          )
        })}
      </div>
    </>
  )

  const equipmentBlock = (
    <>
      {form.classId && (
        <StarterGearSection
          weapon={form.starterWeapon}
          armor={form.starterArmor}
          onChangeWeapon={v => set('starterWeapon', v)}
          onChangeArmor={v => set('starterArmor', v)}
          subtitle="Esta arma e esta armadura acompanham o personagem pela campanha toda."
        />
      )}

      {starterSkillPicked && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem', marginTop: form.classId ? '0.75rem' : 0 }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={resetStarterSkill}
            style={{ fontSize: '0.65rem' }}
          >
            Trocar skill
          </button>
        </div>
      )}
      {form.classId ? (
        <ClassSkillBook
          entity={form}
          onInvestPoint={handleInvestStarterSkill}
          compact
        />
      ) : (
        <div style={{
          padding: '1rem',
          border: '1px dashed #1a1a1a',
          borderRadius: '4px',
          color: '#555',
          fontSize: '0.75rem',
          textAlign: 'center',
          marginTop: form.classId ? 0 : '0.5rem',
        }}>
          Escolha a classe acima para ver o livro de skills.
        </div>
      )}
    </>
  )

  const errorBlock = attrError && (
    <p style={{
      fontSize: '0.72rem',
      color: '#f87171',
      margin: 0,
      padding: '0.5rem 0.65rem',
      background: 'rgba(220,38,38,0.08)',
      border: '1px solid rgba(220,38,38,0.2)',
      borderRadius: '3px',
    }}>
      {attrError}
    </p>
  )

  const saveButton = (
    <Button
      type="submit"
      disabled={!profileOnly && isNew && !creationReady}
      title={!profileOnly && isNew && !creationReady
        ? (!ecoCheck.ok
          ? ecoCheck.message
          : `Distribua todos os pontos iniciais (${STARTING_ATTRIBUTE_POINTS} físicos e ${STARTING_SOCIAL_POINTS} de cena)`)
        : undefined}
    >
      Salvar
    </Button>
  )

  return (
    <form onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {useWizard ? (
        <>
          <Stepper step={step} onStepChange={setStep} hideDefaultNav>
            <Step>
              <div style={stepTitle}>1 · PERFIL</div>
              {profileBlock}
            </Step>
            <Step>
              <div style={stepTitle}>2 · CLASSE</div>
              {classBlock}
            </Step>
            <Step>
              <div style={stepTitle}>3 · ATRIBUTOS</div>
              {attributesBlock}
            </Step>
            <Step>
              <div style={stepTitle}>4 · EQUIPAMENTO & ECO</div>
              {equipmentBlock}
              {errorBlock}
            </Step>
          </Stepper>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
            {step > 1 && (
              <button type="button" className="btn-ghost" onClick={() => setStep(s => Math.max(1, s - 1))}>
                Voltar
              </button>
            )}
            {step < totalSteps ? (
              <Button type="button" onClick={() => setStep(s => Math.min(totalSteps, s + 1))}>
                Continuar
              </Button>
            ) : (
              <>
                <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
                {saveButton}
              </>
            )}
          </div>
        </>
      ) : (
        <>
          {profileBlock}

          {!profileOnly && (
            <>
              <hr className="divide-line" />
              {classBlock}

              <hr className="divide-line" />
              {attributesBlock}

              {isNew && form.classId && (
                <>
                  <hr className="divide-line" />
                  <StarterGearSection
                    weapon={form.starterWeapon}
                    armor={form.starterArmor}
                    onChangeWeapon={v => set('starterWeapon', v)}
                    onChangeArmor={v => set('starterArmor', v)}
                    subtitle="Esta arma e esta armadura acompanham o personagem pela campanha toda."
                  />
                </>
              )}

              {isNew && (
                <>
                  <hr className="divide-line" />
                  {starterSkillPicked && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={resetStarterSkill}
                        style={{ fontSize: '0.65rem' }}
                      >
                        Trocar skill
                      </button>
                    </div>
                  )}
                  {form.classId ? (
                    <ClassSkillBook
                      entity={form}
                      onInvestPoint={handleInvestStarterSkill}
                      compact
                    />
                  ) : (
                    <div style={{
                      padding: '1rem',
                      border: '1px dashed #1a1a1a',
                      borderRadius: '4px',
                      color: '#555',
                      fontSize: '0.75rem',
                      textAlign: 'center',
                    }}>
                      Escolha a classe acima para ver o livro de skills.
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {errorBlock}

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
            {saveButton}
          </div>
        </>
      )}
    </form>
  )
}

function InventoryPanel({ character, onAddItem, onRemoveItem, onClose }) {
  const [newItem, setNewItem] = useState('')
  const handleAdd = () => {
    if (!newItem.trim()) return
    onAddItem(newItem.trim())
    setNewItem('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <User size={14} style={{ color: '#dc2626' }} />
        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e5e5e5' }}>{character.name}</span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Input
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          placeholder="Nome do item..."
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
        />
        <Button onClick={handleAdd} size="xs" style={{ whiteSpace: 'nowrap' }}>
          Adicionar
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '300px', overflowY: 'auto' }}>
        {character.inventory.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#333', fontSize: '0.775rem', padding: '1.5rem' }}>
            Inventário vazio
          </div>
        ) : (
          character.inventory.map(item => (
            <div key={item.id}
              style={{
                background: '#0d0d0d',
                border: '1px solid #1a1a1a',
                borderRadius: '3px',
                padding: '0.5rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={12} style={{ color: '#444' }} />
                <span style={{ fontSize: '0.8rem', color: '#ccc' }}>{item.name}</span>
              </div>
              <button onClick={() => onRemoveItem(item.id)}
                style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '2px', display: 'flex', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                onMouseLeave={e => e.currentTarget.style.color = '#333'}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-ghost" onClick={onClose}>Fechar</button>
      </div>
    </div>
  )
}

function CharCard({ character, onEdit, onDelete, onInventory }) {
  const { effective: attrs, base } = getEntityEffectiveAttributes(character)
  const charClass = getCharacterClass(character)

  return (
    <SpotlightCard style={{ padding: 0 }}>
      <div style={{ display: 'flex', gap: '0', padding: '1rem 1.25rem', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.875rem', flex: 1, minWidth: 0 }}>
          <EntityThumb src={character.image} alt={character.name} size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e5e5e5', marginBottom: '2px' }}>{character.name}</div>
            <div style={{ fontSize: '0.65rem', color: '#a855f7', fontFamily: 'monospace', marginBottom: '4px' }}>
              NVL {character.level || 1} · {character.ecoPoints ?? 0} Ecos
              {charClass && (
                <span style={{ color: charClass.color }}> · {charClass.label.toUpperCase()}</span>
              )}
            </div>
            {(character.personality || character.motivation || character.history) && (
              <div style={{ fontSize: '0.7rem', color: '#444', lineHeight: 1.5,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {character.personality || character.motivation || character.history}
              </div>
            )}
          </div>
        </div>
        <FloatingTooltip.Provider>
          <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0, marginLeft: '0.75rem' }}>
            <FloatingTooltip.Trigger content="Inventário">
              <button onClick={onInventory}
                style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '4px', transition: 'color 0.15s', display: 'flex' }}
                onMouseEnter={e => e.currentTarget.style.color = '#06b6d4'}
                onMouseLeave={e => e.currentTarget.style.color = '#333'}
              >
                <Package size={13} />
              </button>
            </FloatingTooltip.Trigger>
            <FloatingTooltip.Trigger content="Editar">
              <button onClick={onEdit}
                style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '4px', transition: 'color 0.15s', display: 'flex' }}
                onMouseEnter={e => e.currentTarget.style.color = '#999'}
                onMouseLeave={e => e.currentTarget.style.color = '#333'}
              >
                <Pencil size={13} />
              </button>
            </FloatingTooltip.Trigger>
            <FloatingTooltip.Trigger content="Excluir">
              <button onClick={onDelete}
                style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '4px', transition: 'color 0.15s', display: 'flex' }}
                onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                onMouseLeave={e => e.currentTarget.style.color = '#333'}
              >
                <Trash2 size={13} />
              </button>
            </FloatingTooltip.Trigger>
          </div>
        </FloatingTooltip.Provider>
      </div>

      {/* Attributes bar */}
      <div style={{ padding: '0 1.25rem 0.875rem', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem' }}>
        {ATTRIBUTES.map(attr => {
          const eff = attrs[attr.key] || 0
          const raw = base?.[attr.key] || 0
          const reduced = eff < raw
          return (
            <div key={attr.key} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: eff > 0 ? (reduced ? '#ea580c' : attr.color) : '#222', lineHeight: 1 }}>
                {eff}
              </div>
              <div style={{ fontSize: '0.5rem', color: '#333', fontFamily: 'monospace', marginTop: '2px' }}>
                {attr.label.slice(0, 3).toUpperCase()}
              </div>
            </div>
          )
        })}
      </div>

      {character.inventory.length > 0 && (
        <div style={{ padding: '0.5rem 1.25rem', borderTop: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={11} style={{ color: '#333' }} />
          <span style={{ fontSize: '0.65rem', color: '#333', fontFamily: 'monospace' }}>
            {character.inventory.length} {character.inventory.length === 1 ? 'ITEM' : 'ITENS'}
          </span>
        </div>
      )}
    </SpotlightCard>
  )
}

export function Characters({
  embedded = false,
  onNavigate,
  autoOpenCreate = false,
  onCreateFlowClose,
  onCreateFlowSuccess,
}) {
  const { activeCampaignId } = useCampaignStore()
  const { characters, addCharacter, updateCharacter, deleteCharacter, addInventoryItem, removeInventoryItem } = useCharacterStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [inventoryChar, setInventoryChar] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filtered = filterByActiveCampaign(characters, activeCampaignId)

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (c) => { setEditing(c); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const handleModalClose = () => {
    const wasNewCreate = autoOpenCreate && !editing
    closeModal()
    if (wasNewCreate) onCreateFlowClose?.()
  }

  useEffect(() => {
    if (autoOpenCreate && activeCampaignId) openCreate()
  }, [autoOpenCreate, activeCampaignId])

  const handleSave = (data) => {
    const isNew = !editing
    if (isNew) {
      const check = validateStartingAttributesDistributed(data)
      if (!check.ok) return
      const social = validateStartingSocialDistributed(data)
      if (!social.ok) return
      const eco = validateStartingEcoSkillSelected(data)
      if (!eco.ok) return
    }
    const payload = {
      ...data,
      ...finalizeCreationAttributes(data, { isNew }),
    }
    if (editing) {
      updateCharacter(editing.id, payload)
    } else {
      const created = addCharacter(withActiveCampaign(payload, activeCampaignId))
      if (!created) return
    }
    closeModal()
    if (autoOpenCreate && isNew) onCreateFlowSuccess?.()
  }

  const currentInventoryChar = inventoryChar ? characters.find(c => c.id === inventoryChar.id) : null
  const creationFlowOnly = embedded && autoOpenCreate

  if (creationFlowOnly) {
    return (
      <Modal open={modalOpen} onClose={handleModalClose} title="Novo Personagem" maxWidth="720px">
        <CharacterForm initial={null} onSave={handleSave} onCancel={handleModalClose} />
      </Modal>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {!embedded && (
        <PageHeader
        icon={Sword}
        title="Personagens"
        subtitle={`${filtered.length} PERSONAGENS NA CAMPANHA`}
        action={
          <Button onClick={openCreate} size="xs" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Plus size={13} /> Novo Personagem
          </Button>
        }
      />
      )}

      <ActiveCampaignBanner onNavigate={onNavigate} />
      {embedded && (
        <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={openCreate} disabled={!activeCampaignId} size="xs" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Plus size={13} /> Novo Personagem
          </Button>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Sword}
            title="Nenhum personagem criado"
            description="Adicione os personagens jogáveis da sua campanha."
            action={<Button onClick={openCreate} size="xs">Criar Personagem</Button>}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '0.75rem' }}>
            {filtered.map(c => (
              <CharCard
                key={c.id}
                character={c}
                onEdit={() => openEdit(c)}
                onDelete={() => setDeleteConfirm(c)}
                onInventory={() => setInventoryChar(c)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={handleModalClose} title={editing ? 'Editar Personagem' : 'Novo Personagem'} maxWidth="720px">
        <CharacterForm initial={editing} onSave={handleSave} onCancel={handleModalClose} />
      </Modal>

      <Modal open={!!inventoryChar} onClose={() => setInventoryChar(null)} title="Inventário" maxWidth="480px">
        {currentInventoryChar && (
          <InventoryPanel
            character={currentInventoryChar}
            onAddItem={(item) => addInventoryItem(currentInventoryChar.id, item)}
            onRemoveItem={(itemId) => removeInventoryItem(currentInventoryChar.id, itemId)}
            onClose={() => setInventoryChar(null)}
          />
        )}
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar Exclusão" maxWidth="380px">
        <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1.25rem' }}>
          Enviar o personagem <strong style={{ color: '#e5e5e5' }}>{deleteConfirm?.name}</strong> para a lixeira?
          Você pode restaurá-lo em Lixeira.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
          <Button variant="danger" onClick={() => { deleteCharacter(deleteConfirm.id); setDeleteConfirm(null) }}>Excluir</Button>
        </div>
      </Modal>
    </div>
  )
}
