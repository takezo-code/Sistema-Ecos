import React, { useState } from 'react'
import { Shield, Trash2 } from 'lucide-react'
import { Input } from '../ui/Field'

export function EquippedSection({ entity, onAddItem, onRemoveItem }) {
  const [newItem, setNewItem] = useState('')
  const equipped = entity.equipped || []

  const handleAdd = () => {
    if (!newItem.trim()) return
    onAddItem({ name: newItem.trim() })
    setNewItem('')
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Shield size={14} style={{ color: '#a855f7' }} />
        <span style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em' }}>ITENS EM USO</span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Input
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          placeholder="Item equipado..."
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          style={{ flex: 1 }}
        />
        <button type="button" className="btn-secondary" onClick={handleAdd} style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
          Equipar
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {equipped.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#333', fontSize: '0.775rem', padding: '1rem', border: '1px dashed #1a1a1a', borderRadius: '4px' }}>
            Nenhum item equipado
          </div>
        ) : (
          equipped.map(item => (
            <div key={item.id} style={{
              background: '#0d0d0d',
              border: '1px solid rgba(168,85,247,0.15)',
              borderRadius: '3px',
              padding: '0.5rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '0.8rem', color: '#ccc' }}>{item.name}</span>
              <button type="button" onClick={() => onRemoveItem(item.id)}
                style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', padding: '2px', display: 'flex' }}
                onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                onMouseLeave={e => e.currentTarget.style.color = '#333'}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
