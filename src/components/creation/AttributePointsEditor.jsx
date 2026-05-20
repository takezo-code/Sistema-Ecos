import React from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import {
  INITIAL_ATTRIBUTE_MAX,
  SOCIAL_ATTRIBUTES,
  STARTING_SOCIAL_POINTS,
  INITIAL_SOCIAL_MAX,
} from '../../constants/attributes'
import { getAttributesForEntity } from '../../constants/entityProgression'
import { applyInitialAttributeChange, applyInitialSocialChange } from '../../services/progressionService'

function AttributeInput({ attr, value, onChange, canIncrease, canDecrease = true }) {
  return (
    <div style={{
      background: '#0d0d0d',
      border: '1px solid #1a1a1a',
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
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e5e5e5', lineHeight: 1 }}>{value}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <button
          type="button"
          disabled={!canIncrease}
          onClick={() => onChange(value + 1)}
          style={{
            background: '#1a1a1a', border: 'none',
            color: canIncrease ? '#666' : '#222',
            cursor: canIncrease ? 'pointer' : 'not-allowed',
            padding: '3px 6px', borderRadius: '2px', display: 'flex',
          }}
        >
          <ChevronUp size={12} />
        </button>
        <button
          type="button"
          disabled={!canDecrease}
          onClick={() => onChange(Math.max(0, value - 1))}
          style={{
            background: '#1a1a1a', border: 'none',
            color: canDecrease ? '#666' : '#222',
            cursor: canDecrease ? 'pointer' : 'not-allowed',
            padding: '3px 6px', borderRadius: '2px', display: 'flex',
          }}
        >
          <ChevronDown size={12} />
        </button>
      </div>
    </div>
  )
}

/** Editor de 10 pts de atributo (criação / ficha nova) */
export function AttributePointsEditor({ form, onFormChange, showRuptureHint = false }) {
  const pool = form.unspentAttributePoints ?? 0
  const attrs = form.attributes || {}
  const attrList = getAttributesForEntity(form)
  const colCount = attrList.length

  const socialPool = form.unspentSocialPoints ?? 0
  const socialAttrs = form.socialAttributes || {}

  const setAttr = (key, val) => {
    const patch = applyInitialAttributeChange(form, key, val)
    if (patch) onFormChange({ ...form, ...patch })
  }

  const setSocialAttr = (key, val) => {
    const patch = applyInitialSocialChange(form, key, val)
    if (patch) onFormChange({ ...form, ...patch })
  }

  return (
    <>
      <hr className="divide-line" />
      <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
        PONTOS DE STATUS · <span style={{ color: '#16a34a' }}>{pool}</span> disponíveis · máx {INITIAL_ATTRIBUTE_MAX}/atributo
      </div>
      {showRuptureHint && (
        <p style={{ fontSize: '0.7rem', color: '#555', marginBottom: '0.75rem', lineHeight: 1.5 }}>
          Inclua pontos em <strong style={{ color: '#d97706' }}>Ruptura</strong> se o NPC tiver poderes de Eco.
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colCount}, 1fr)`, gap: '0.5rem' }}>
        {attrList.map(attr => {
          const v = attrs[attr.key] || 0
          return (
            <AttributeInput
              key={attr.key}
              attr={attr}
              value={v}
              canIncrease={pool > 0 && v < INITIAL_ATTRIBUTE_MAX}
              onChange={val => setAttr(attr.key, val)}
            />
          )
        })}
      </div>

      <hr className="divide-line" />
      <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
        PONTOS DE CENA (SOCIAL) · <span style={{ color: socialPool > 0 ? '#e879f9' : '#16a34a' }}>{socialPool}</span> disponíveis · máx {INITIAL_SOCIAL_MAX}/atributo
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
        {SOCIAL_ATTRIBUTES.map(attr => {
          const v = socialAttrs[attr.key] || 0
          return (
            <AttributeInput
              key={attr.key}
              attr={attr}
              value={v}
              canIncrease={socialPool > 0 && v < INITIAL_SOCIAL_MAX}
              onChange={val => setSocialAttr(attr.key, val)}
            />
          )
        })}
      </div>
    </>
  )
}
