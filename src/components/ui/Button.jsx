import SpecularButton from '../react-bits/SpecularButton'

const VARIANTS = {
  primary: {
    tint: '#2563eb',
    tintOpacity: 0.28,
    blur: 10,
    textColor: '#f8fafc',
    lineColor: '#bfdbfe',
    baseColor: '#1d4ed8',
    intensity: 1.2,
    radius: 8,
    autoAnimate: false,
  },
  secondary: {
    tint: '#ffffff',
    tintOpacity: 0.05,
    blur: 8,
    textColor: '#e5e5e5',
    lineColor: '#d4d4d8',
    baseColor: '#52525b',
    intensity: 0.95,
    radius: 8,
    autoAnimate: false,
  },
  danger: {
    tint: '#dc2626',
    tintOpacity: 0.22,
    blur: 8,
    textColor: '#fef2f2',
    lineColor: '#fecaca',
    baseColor: '#991b1b',
    intensity: 1.1,
    radius: 8,
    autoAnimate: false,
  },
}

/**
 * Botão padrão do sistema (Specular Button).
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
  autoAnimate,
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

  const preset = VARIANTS[variant] || VARIANTS.primary

  return (
    <SpecularButton
      type={type}
      size={size}
      disabled={disabled}
      onClick={onClick}
      className={className}
      style={style}
      block={block}
      autoAnimate={autoAnimate ?? preset.autoAnimate}
      tint={preset.tint}
      tintOpacity={preset.tintOpacity}
      blur={preset.blur}
      textColor={preset.textColor}
      lineColor={preset.lineColor}
      baseColor={preset.baseColor}
      intensity={preset.intensity}
      radius={preset.radius}
      {...rest}
    >
      {children}
    </SpecularButton>
  )
}
