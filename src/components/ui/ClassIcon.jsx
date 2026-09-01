import React, { useEffect, useState } from 'react'
import { getCharacterClass } from '../../constants/classes'
import { CLASS_FALLBACK_ICONS } from '../../constants/classIcons'

export function ClassIcon({
  classIdOrEntity,
  size = 32,
  alt,
  className,
  style,
  rounded = false,
  showFallback = true,
}) {
  const classMeta = getCharacterClass(classIdOrEntity)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [classMeta?.id, classMeta?.iconSrc])

  if (!classMeta) return null

  const Fallback = CLASS_FALLBACK_ICONS[classMeta.id]
  const radius = rounded ? Math.round(size * 0.22) : 0
  const fallbackBoxStyle = {
    width: size,
    height: size,
    flexShrink: 0,
    borderRadius: radius,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `${classMeta.color}14`,
    border: `1px solid ${classMeta.color}44`,
    ...style,
  }

  if (classMeta.iconSrc && !failed) {
    return (
      <img
        src={classMeta.iconSrc}
        alt={alt || classMeta.label}
        width={size}
        height={size}
        draggable={false}
        className={className}
        style={{
          width: size,
          height: size,
          flexShrink: 0,
          objectFit: 'contain',
          display: 'block',
          borderRadius: radius,
          filter: `drop-shadow(0 0 6px ${classMeta.color}55)`,
          ...style,
        }}
        onError={() => setFailed(true)}
      />
    )
  }

  if (!showFallback || !Fallback) return null

  return (
    <div className={className} style={fallbackBoxStyle}>
      <Fallback
        size={Math.max(14, Math.round(size * 0.5))}
        color={classMeta.color}
        strokeWidth={2}
      />
    </div>
  )
}
