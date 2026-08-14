import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import GlassSurface from '../react-bits/GlassSurface'

/** Pilha de modais abertos — só o do topo responde a Escape / clique no overlay. */
const modalStack = []

export function Modal({ open, onClose, title, children, maxWidth = '560px' }) {
  const onCloseRef = useRef(onClose)
  const entryRef = useRef(null)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined

    const entry = {
      close: () => onCloseRef.current?.(),
    }
    entryRef.current = entry
    modalStack.push(entry)

    const handler = (e) => {
      if (e.key !== 'Escape') return
      if (modalStack[modalStack.length - 1] !== entry) return
      e.preventDefault()
      e.stopPropagation()
      entry.close()
    }

    window.addEventListener('keydown', handler)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      const idx = modalStack.indexOf(entry)
      if (idx >= 0) modalStack.splice(idx, 1)
      if (entryRef.current === entry) entryRef.current = null
      window.removeEventListener('keydown', handler)
      if (modalStack.length === 0) {
        document.body.style.overflow = prevOverflow
      }
    }
  }, [open])

  if (!open) return null

  const handleOverlayClick = (e) => {
    if (e.target !== e.currentTarget) return
    if (modalStack[modalStack.length - 1] !== entryRef.current) return
    onCloseRef.current?.()
  }

  return createPortal(
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
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
              onClick={() => onCloseRef.current?.()}
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
