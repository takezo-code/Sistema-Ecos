import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import GlassSurface from '../react-bits/GlassSurface'

export function Modal({ open, onClose, title, children, maxWidth = '560px' }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (open) {
      window.addEventListener('keydown', handler)
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        window.removeEventListener('keydown', handler)
        document.body.style.overflow = prev
      }
    }
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <GlassSurface
        borderRadius={16}
        padding={0}
        style={{ maxWidth, width: '90vw', maxHeight: '90vh' }}
        className="modal-glass-shell"
      >
        <div className="modal-content" style={{ maxWidth: 'none', width: '100%', border: 'none', background: 'transparent', boxShadow: 'none', backdropFilter: 'none', WebkitBackdropFilter: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e5e5e5', letterSpacing: '-0.01em' }}>{title}</h2>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#444', cursor: 'pointer', padding: '2px', transition: 'color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#999' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#444' }}
            >
              <X size={16} />
            </button>
          </div>
          {children}
        </div>
      </GlassSurface>
    </div>,
    document.body,
  )
}
