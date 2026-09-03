import React from 'react'
import { ECOS_LOGO_SRC } from '../../constants/brand'

export function EcosLogo({
  size = 44,
  alt = 'ECOS',
  className,
  style,
  rounded = true,
}) {
  return (
    <img
      src={ECOS_LOGO_SRC}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block',
        borderRadius: rounded ? Math.round(size * 0.22) : 0,
        background: 'transparent',
        ...style,
      }}
    />
  )
}
