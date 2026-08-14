import React from 'react'

/** Rótulo padrão das seções do painel de gerenciamento. */
export function SectionLabel({ icon: Icon, children, accent = '#666' }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: '0.58rem',
      fontFamily: 'monospace',
      letterSpacing: '0.12em',
      color: '#7a7a7a',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {Icon && <Icon size={11} style={{ color: accent }} />}
      {children}
    </span>
  )
}

/** Card de seção — mesma moldura de vidro em todo o painel. */
export function PanelSection({
  icon,
  title,
  accent = '#a855f7',
  meta = null,
  children,
  style,
}) {
  return (
    <section style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.7rem',
      padding: '0.85rem 0.95rem',
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(255,255,255,0.018)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
      ...style,
    }}>
      {(title || meta) && (
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}>
          <SectionLabel icon={icon} accent={accent}>{title}</SectionLabel>
          {meta}
        </header>
      )}
      {children}
    </section>
  )
}

/** Chip de valor curto (pontos, contadores, penalidades). */
export function MetaChip({ children, color = '#8a8a8a', tone = 'ghost' }) {
  const solid = tone === 'solid'
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: '0.6rem',
      fontFamily: 'monospace',
      color,
      background: solid ? `${color}14` : 'rgba(255,255,255,0.04)',
      border: `1px solid ${solid ? `${color}33` : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 999,
      padding: '0.2rem 0.5rem',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}
