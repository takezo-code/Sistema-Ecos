import { useRef } from 'react'
import './SpotlightCard.css'

const SpotlightCard = ({
  children,
  className = '',
  style,
  spotlightColor = 'rgba(37, 99, 235, 0.18)',
  onClick,
}) => {
  const divRef = useRef(null)

  const handleMouseMove = (e) => {
    const el = divRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    el.style.setProperty('--mouse-x', `${x}px`)
    el.style.setProperty('--mouse-y', `${y}px`)
    el.style.setProperty('--spotlight-color', spotlightColor)
  }

  return (
    <div
      ref={divRef}
      className={`card-spotlight${className ? ` ${className}` : ''}`}
      style={style}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick(e)
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}

export default SpotlightCard
