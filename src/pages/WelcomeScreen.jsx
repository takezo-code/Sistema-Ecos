import React, { useRef, useState } from 'react'
import { Plus, Upload, Hexagon } from 'lucide-react'
import { initializeNewCampaign, importCampaign } from '../services/saveService'
import { useSaveStore } from '../store/useSaveStore'

export function WelcomeScreen({ onEnter }) {
  const fileRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const { showToast } = useSaveStore()

  const handleNew = () => {
    setLoading(true)
    try {
      initializeNewCampaign('Nova Campanha')
      showToast('Nova campanha criada.', 'success')
      onEnter?.()
    } catch (e) {
      showToast(e.message || 'Erro ao criar campanha.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleImportClick = () => fileRef.current?.click()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setLoading(true)
    const result = await importCampaign(file)
    setLoading(false)
    if (result.ok) onEnter?.()
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#050505',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      zIndex: 100,
    }}>
      {/* Grid background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(220,38,38,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(220,38,38,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 100%)',
      }} />

      {/* Scan line */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, transparent 0%, rgba(220,38,38,0.02) 50%, transparent 100%)',
        backgroundSize: '100% 4px',
        pointerEvents: 'none',
        opacity: 0.6,
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        maxWidth: '520px',
        padding: '2rem',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '56px',
          height: '56px',
          border: '1px solid rgba(220,38,38,0.3)',
          borderRadius: '4px',
          marginBottom: '1.5rem',
          background: 'rgba(220,38,38,0.05)',
        }}>
          <Hexagon size={28} style={{ color: '#dc2626' }} strokeWidth={1.5} />
        </div>

        <h1 style={{
          fontSize: 'clamp(1.75rem, 5vw, 2.25rem)',
          fontWeight: 800,
          letterSpacing: '0.2em',
          color: '#e5e5e5',
          fontFamily: 'monospace',
          marginBottom: '0.5rem',
        }}>
          RPG MASTER PANEL
        </h1>

        <p style={{
          fontSize: '0.75rem',
          color: '#555',
          fontFamily: 'monospace',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '3rem',
          lineHeight: 1.6,
        }}>
          Sistema de gerenciamento narrativo temporal
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          width: '100%',
        }}>
          <button
            type="button"
            disabled={loading}
            onClick={handleNew}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.625rem',
              padding: '1rem 1.5rem',
              background: 'linear-gradient(135deg, rgba(220,38,38,0.2) 0%, rgba(220,38,38,0.05) 100%)',
              border: '1px solid rgba(220,38,38,0.4)',
              borderRadius: '4px',
              color: '#e5e5e5',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              letterSpacing: '0.15em',
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.borderColor = 'rgba(220,38,38,0.7)'
                e.currentTarget.style.background = 'rgba(220,38,38,0.15)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(220,38,38,0.4)'
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(220,38,38,0.2) 0%, rgba(220,38,38,0.05) 100%)'
            }}
          >
            <Plus size={16} />
            NOVA CAMPANHA
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleImportClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.625rem',
              padding: '1rem 1.5rem',
              background: 'transparent',
              border: '1px solid #2a2a2a',
              borderRadius: '4px',
              color: '#888',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              letterSpacing: '0.15em',
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.borderColor = '#444'
                e.currentTarget.style.color = '#e5e5e5'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#2a2a2a'
              e.currentTarget.style.color = '#888'
            }}
          >
            <Upload size={16} />
            IMPORTAR CAMPANHA
          </button>
        </div>

        <p style={{
          marginTop: '2.5rem',
          fontSize: '0.65rem',
          color: '#333',
          fontFamily: 'monospace',
          letterSpacing: '0.08em',
        }}>
          SAVE COMPLETO · JSON · IMAGENS BASE64 · PORTÁTIL
        </p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  )
}
