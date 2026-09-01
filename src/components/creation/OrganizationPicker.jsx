import React, { useState } from 'react'
import { Building2, ChevronRight, X } from 'lucide-react'
import { Modal } from '../ui/Modal'

const ORG_ACCENT = '#d97706'

function OrgOption({ org, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.7rem 0.8rem',
        borderRadius: 10,
        border: `1px solid ${selected ? `${ORG_ACCENT}55` : 'rgba(255,255,255,0.08)'}`,
        background: selected ? 'rgba(217,119,6,0.08)' : 'rgba(255,255,255,0.02)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => {
        if (selected) return
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = selected ? `${ORG_ACCENT}55` : 'rgba(255,255,255,0.08)'
        e.currentTarget.style.background = selected ? 'rgba(217,119,6,0.08)' : 'rgba(255,255,255,0.02)'
      }}
    >
      <span style={{
        width: 36,
        height: 36,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        background: `${ORG_ACCENT}14`,
        border: `1px solid ${ORG_ACCENT}33`,
        color: ORG_ACCENT,
        fontSize: org.symbol ? '1.1rem' : undefined,
        overflow: 'hidden',
      }}>
        {org.image ? (
          <img
            src={org.image}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
        ) : org.symbol ? (
          org.symbol
        ) : (
          <Building2 size={16} />
        )}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: 650, color: '#ececec' }}>
          {org.name}
        </span>
        {(org.description || org.ideology) && (
          <span style={{
            display: 'block',
            fontSize: '0.65rem',
            color: '#666',
            marginTop: 2,
            lineHeight: 1.35,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {org.description || org.ideology}
          </span>
        )}
      </span>
      <ChevronRight size={14} style={{ color: '#555', flexShrink: 0 }} />
    </button>
  )
}

export function OrganizationPicker({ organizations = [], value = '', onChange }) {
  const [open, setOpen] = useState(false)
  const selected = organizations.find(org => org.name === value) ?? null

  if (!organizations.length) {
    return (
      <div style={{
        padding: '0.85rem',
        border: '1px dashed #1a1a1a',
        borderRadius: '6px',
        color: '#555',
        fontSize: '0.72rem',
        lineHeight: 1.45,
        textAlign: 'center',
      }}>
        Nenhuma organização na campanha. Crie uma em Gerenciamento → Organizações.
      </div>
    )
  }

  const handleSelect = (org) => {
    onChange(org.name)
    setOpen(false)
  }

  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.55rem 0.65rem',
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span style={{
            width: 30,
            height: 30,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 7,
            background: `${ORG_ACCENT}14`,
            border: `1px solid ${ORG_ACCENT}33`,
            color: ORG_ACCENT,
            fontSize: selected?.symbol ? '1rem' : undefined,
            overflow: 'hidden',
          }}>
            {selected?.image ? (
              <img
                src={selected.image}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : selected?.symbol ? (
              selected.symbol
            ) : (
              <Building2 size={14} />
            )}
          </span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: selected ? '#ececec' : '#888' }}>
              {selected ? selected.name : 'Escolher organização'}
            </span>
            {!selected && (
              <span style={{ display: 'block', fontSize: '0.62rem', color: '#555', marginTop: 1 }}>
                Clique para ver as disponíveis
              </span>
            )}
          </span>
        </button>

        {selected && (
          <button
            type="button"
            onClick={() => onChange('')}
            title="Remover organização"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#555',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#555' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Escolher organização" maxWidth="480px">
        <p style={{ fontSize: '0.75rem', color: '#777', margin: '0 0 0.85rem', lineHeight: 1.45 }}>
          Selecione uma organização da campanha para vincular a este NPC.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '360px', overflowY: 'auto' }}>
          {organizations.map(org => (
            <OrgOption
              key={org.id}
              org={org}
              selected={selected?.id === org.id}
              onSelect={() => handleSelect(org)}
            />
          ))}
        </div>
      </Modal>
    </>
  )
}
