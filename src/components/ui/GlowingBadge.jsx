import { motion } from 'motion/react'
import './GlowingBadge.css'

const VARIANT_STYLES = {
  default: {
    badge: {
      background: 'rgba(229, 229, 229, 0.12)',
      color: '#e5e5e5',
      border: '1px solid rgba(229, 229, 229, 0.25)',
    },
    glow: { background: 'rgba(229, 229, 229, 0.2)' },
    dot: { background: '#e5e5e5' },
  },
  success: {
    badge: {
      background: 'rgba(22, 163, 74, 0.15)',
      color: '#4ade80',
      border: '1px solid rgba(22, 163, 74, 0.35)',
    },
    glow: { background: 'rgba(22, 163, 74, 0.35)' },
    dot: { background: '#4ade80' },
  },
  warning: {
    badge: {
      background: 'rgba(217, 119, 6, 0.15)',
      color: '#fbbf24',
      border: '1px solid rgba(217, 119, 6, 0.35)',
    },
    glow: { background: 'rgba(217, 119, 6, 0.35)' },
    dot: { background: '#fbbf24' },
  },
  error: {
    badge: {
      background: 'rgba(220, 38, 38, 0.15)',
      color: '#f87171',
      border: '1px solid rgba(220, 38, 38, 0.35)',
    },
    glow: { background: 'rgba(220, 38, 38, 0.35)' },
    dot: { background: '#f87171' },
  },
  info: {
    badge: {
      background: 'rgba(37, 99, 235, 0.15)',
      color: '#60a5fa',
      border: '1px solid rgba(37, 99, 235, 0.35)',
    },
    glow: { background: 'rgba(37, 99, 235, 0.35)' },
    dot: { background: '#60a5fa' },
  },
  cyan: {
    badge: {
      background: 'rgba(6, 182, 212, 0.15)',
      color: '#67e8f9',
      border: '1px solid rgba(6, 182, 212, 0.35)',
    },
    glow: { background: 'rgba(6, 182, 212, 0.35)' },
    dot: { background: '#67e8f9' },
  },
  gray: {
    badge: {
      background: 'rgba(100, 100, 100, 0.15)',
      color: '#9ca3af',
      border: '1px solid rgba(100, 100, 100, 0.3)',
    },
    glow: { background: 'rgba(160, 160, 160, 0.2)' },
    dot: { background: '#9ca3af' },
  },
}

export default function GlowingBadge({
  children,
  variant = 'default',
  pulse = true,
  dot = true,
  className = '',
  style,
  ...props
}) {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.default

  return (
    <span className={`glowing-badge-wrap${className ? ` ${className}` : ''}`} style={style} {...props}>
      <span className="glowing-badge-glow" style={styles.glow} aria-hidden />
      <span className="glowing-badge" style={styles.badge}>
        {dot && (
          <span className="glowing-badge-dot-wrap">
            {pulse && (
              <motion.span
                className="glowing-badge-dot-pulse"
                style={styles.dot}
                animate={{ scale: [1, 2.5, 1], opacity: [0.75, 0, 0.75] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <span className="glowing-badge-dot" style={styles.dot} />
          </span>
        )}
        {children}
      </span>
    </span>
  )
}
