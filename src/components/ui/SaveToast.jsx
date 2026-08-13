import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useSaveStore } from '../../store/useSaveStore'
import GlassSurface from '../react-bits/GlassSurface'

export function SaveToast() {
  const { toast, isSaving } = useSaveStore()
  const visible = Boolean(toast || isSaving)
  const type = toast?.type || 'success'
  const isError = type === 'error'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            bottom: '1.25rem',
            right: '1.25rem',
            zIndex: 9999,
            maxWidth: '360px',
          }}
        >
          <GlassSurface borderRadius={12} padding="0.75rem 1rem">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              {isSaving ? (
                <Loader2 size={16} style={{ color: '#d97706', flexShrink: 0, animation: 'spin 1s linear infinite' }} />
              ) : isError ? (
                <AlertCircle size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
              ) : (
                <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
              )}
              <span style={{ fontSize: '0.8rem', color: '#e5e5e5', lineHeight: 1.4 }}>
                {isSaving ? 'Salvando...' : toast?.message}
              </span>
            </div>
          </GlassSurface>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
