/**
 * Botão padrão do sistema (CSS — sem WebGL).
 * SpecularButton WebGL conflita com fundos como Evil Eye e vira “quadrado branco”.
 * variant: primary | secondary | danger | ghost
 */
export function Button({
  variant = 'primary',
  size = 'sm',
  children,
  className = '',
  style,
  type = 'button',
  disabled = false,
  onClick,
  block = false,
  autoAnimate: _autoAnimate,
  tintOpacity: _tintOpacity,
  blur: _blur,
  radius: _radius,
  intensity: _intensity,
  ...rest
}) {
  if (variant === 'ghost') {
    return (
      <button
        type={type}
        className={['btn-ghost', className].filter(Boolean).join(' ')}
        style={style}
        disabled={disabled}
        onClick={onClick}
        {...rest}
      >
        {children}
      </button>
    )
  }

  const sizeStyle = {
    xs: { fontSize: '0.7rem', padding: '0.4rem 0.75rem' },
    sm: { fontSize: '0.875rem', padding: '0.5rem 1rem' },
    md: { fontSize: '0.9rem', padding: '0.85rem 1.35rem' },
    lg: { fontSize: '1rem', padding: '1rem 1.6rem' },
  }[size] || {}

  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
  }[variant] || 'btn-primary'

  return (
    <button
      type={type}
      className={[variantClass, className].filter(Boolean).join(' ')}
      style={{
        ...sizeStyle,
        display: block ? 'flex' : undefined,
        width: block ? '100%' : undefined,
        alignItems: block ? 'center' : undefined,
        justifyContent: block ? 'center' : undefined,
        gap: block ? '0.55rem' : undefined,
        ...style,
      }}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  )
}
