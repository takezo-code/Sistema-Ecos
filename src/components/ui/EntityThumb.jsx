import React, { useState, useEffect } from 'react'
import { User } from 'lucide-react'

export function EntityThumb({
  src,
  alt = '',
  size = 44,
  fallbackIcon: FallbackIcon = User,
  borderRadius = '3px',
}) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  const boxStyle = {
    width: size,
    height: size,
    flexShrink: 0,
    background: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const showImage = src && !failed

  return (
    <div style={boxStyle}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={() => setFailed(true)}
        />
      ) : (
        <FallbackIcon size={Math.max(14, Math.round(size * 0.42))} style={{ color: '#333' }} />
      )}
    </div>
  )
}
