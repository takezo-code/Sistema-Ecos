import React from 'react'
import { THEME_ACCENT } from '../../constants/theme'

export function WelcomeResourceLink({ href, icon: Icon, children, onClick, disabled = false }) {
  const Tag = href ? 'a' : 'button'
  const linkProps = href
    ? { href: disabled ? undefined : href, target: '_blank', rel: 'noreferrer' }
    : { type: 'button', onClick: disabled ? undefined : onClick, disabled }

  return (
    <Tag
      {...linkProps}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.5rem 0.75rem',
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.04)',
        color: disabled ? '#6b7280' : '#c4b5fd',
        fontSize: '0.72rem',
        textDecoration: 'none',
        fontWeight: 600,
        cursor: disabled ? 'default' : 'pointer',
        fontFamily: 'inherit',
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {Icon ? <Icon size={13} style={{ color: THEME_ACCENT }} /> : null}
      {children}
    </Tag>
  )
}
