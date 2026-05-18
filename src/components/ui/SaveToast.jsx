import React from 'react'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useSaveStore } from '../../store/useSaveStore'

export function SaveToast() {
  const { toast, isSaving } = useSaveStore()

  if (!toast && !isSaving) return null

  const type = toast?.type || 'success'
  const isError = type === 'error'

  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        bottom: '1.25rem',
        right: '1.25rem',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        padding: '0.75rem 1rem',
        background: isError ? 'rgba(220,38,38,0.12)' : 'rgba(22,163,74,0.1)',
        border: `1px solid ${isError ? 'rgba(220,38,38,0.35)' : 'rgba(22,163,74,0.3)'}`,
        borderRadius: '4px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        maxWidth: '360px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
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
  )
}
