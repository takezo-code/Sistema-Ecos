import './GlassSurface.css'

/**
 * Simplified dark-theme glass panel (CSS fallback — no SVG filter).
 */
export default function GlassSurface({
  children,
  className = '',
  style,
  borderRadius = 16,
  padding,
  width = '100%',
  height = 'auto',
}) {
  const mergedStyle = {
    width,
    height,
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
    ...(padding != null
      ? { padding: typeof padding === 'number' ? `${padding}px` : padding }
      : {}),
    ...style,
  }

  return (
    <div
      className={`glass-surface${className ? ` ${className}` : ''}`}
      style={mergedStyle}
    >
      <div className="glass-surface-content">{children}</div>
    </div>
  )
}
