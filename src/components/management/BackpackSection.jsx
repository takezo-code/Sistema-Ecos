import React, { useState } from 'react'
import { Package, Trash2, Backpack } from 'lucide-react'
import { Input } from '../ui/Field'
import { Button } from '../ui/Button'

export function BackpackSection({ entity, onAddItem, onUpdateItem, onRemoveItem }) {
  const [newItem, setNewItem] = useState('')
  const inventory = entity.inventory || []
  const capacity = entity.backpackCapacity
  const atCapacity = capacity != null && inventory.length >= capacity

  const handleAdd = () => {
    if (!newItem.trim() || atCapacity) return
    onAddItem({ name: newItem.trim(), qty: 1 })
    setNewItem('')
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Backpack size={14} style={{ color: '#06b6d4' }} />
          <span style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em' }}>MOCHILA</span>
        </div>
        <span style={{ fontSize: '0.65rem', color: '#333', fontFamily: 'monospace' }}>
          {inventory.length} {inventory.length === 1 ? 'item' : 'itens'}
          {capacity != null ? ` / ${capacity}` : ' · limite a definir'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Input
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          placeholder={atCapacity ? 'Mochila cheia' : 'Nome do item...'}
          disabled={atCapacity}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          style={{ flex: 1 }}
        />
        <Button type="button" size="xs" onClick={handleAdd} disabled={atCapacity} style={{ whiteSpace: 'nowrap' }}>
          Adicionar
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '240px', overflowY: 'auto' }}>
        {inventory.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#333', fontSize: '0.775rem', padding: '1.5rem', border: '1px dashed #1a1a1a', borderRadius: '4px' }}>
            Mochila vazia
          </div>
        ) : (
          inventory.map(item => (
            <div key={item.id}
              style={{
                background: '#0d0d0d',
                border: '1px solid #1a1a1a',
                borderRadius: '3px',
                padding: '0.5rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <Package size={12} style={{ color: '#444', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', color: '#ccc', flex: 1 }}>{item.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <button type="button" onClick={() => onUpdateItem(item.id, { qty: Math.max(1, (item.qty || 1) - 1) })}
                  style={{ background: '#1a1a1a', border: 'none', color: '#666', cursor: 'pointer', padding: '2px 6px', borderRadius: '2px', fontSize: '0.7rem' }}>−</button>
                <span style={{ fontSize: '0.75rem', color: '#888', minWidth: '1.5rem', textAlign: 'center' }}>{item.qty || 1}</span>
                <button type="button" onClick={() => onUpdateItem(item.id, { qty: (item.qty || 1) + 1 })}
                  style={{ background: '#1a1a1a', border: 'none', color: '#666', cursor: 'pointer', padding: '2px 6px', borderRadius: '2px', fontSize: '0.7rem' }}>+</button>
              </div>
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
