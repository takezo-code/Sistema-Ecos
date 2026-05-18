import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export function Modal({ open, onClose, title, children, maxWidth = '560px' }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-content" style={{ maxWidth, width: '90vw' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e5e5e5', letterSpacing: '-0.01em' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#444', cursor: 'pointer', padding: '2px', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#999'}
            onMouseLeave={e => e.currentTarget.style.color = '#444'}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
