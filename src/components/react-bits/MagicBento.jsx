import { useRef, useEffect, useCallback } from 'react'
import { gsap } from 'gsap'
import './MagicBento.css'

const DEFAULT_PARTICLE_COUNT = 8
const DEFAULT_SPOTLIGHT_RADIUS = 260
const DEFAULT_GLOW_COLOR = '168, 85, 247'

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '')
  if (!m) return DEFAULT_GLOW_COLOR
  return `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}`
}

function createParticleElement(x, y, color) {
  const el = document.createElement('div')
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `
  return el
}

function ParticleCard({
  children,
  className = '',
  style,
  disableAnimations = false,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  disabled = false,
  onSelect,
}) {
  const cardRef = useRef(null)
  const particlesRef = useRef([])
  const timeoutsRef = useRef([])
  const isHoveredRef = useRef(false)

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    particlesRef.current.forEach(particle => {
      gsap.killTweensOf(particle)
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.25,
        onComplete: () => particle.remove(),
      })
    })
    particlesRef.current = []
  }, [])

  useEffect(() => {
    const element = cardRef.current
    if (!element || disableAnimations) return undefined

    const handleMouseEnter = () => {
      isHoveredRef.current = true
      const { width, height } = element.getBoundingClientRect()
      Array.from({ length: particleCount }).forEach((_, i) => {
        const timeout = setTimeout(() => {
          if (!isHoveredRef.current) return
          const particle = createParticleElement(Math.random() * width, Math.random() * height, glowColor)
          element.appendChild(particle)
          particlesRef.current.push(particle)
          gsap.fromTo(particle, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(1.7)' })
          gsap.to(particle, {
            x: (Math.random() - 0.5) * 60,
            y: (Math.random() - 0.5) * 60,
            duration: 1.6 + Math.random(),
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          })
        }, i * 40)
        timeoutsRef.current.push(timeout)
      })
    }

    const handleMouseLeave = () => {
      isHoveredRef.current = false
      clearAllParticles()
    }

    const handleClick = e => {
      if (disabled) return
      if (clickEffect) {
        const rect = element.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const maxDistance = Math.max(
          Math.hypot(x, y),
          Math.hypot(x - rect.width, y),
          Math.hypot(x, y - rect.height),
          Math.hypot(x - rect.width, y - rect.height),
        )
        const ripple = document.createElement('div')
        ripple.style.cssText = `
          position: absolute;
          width: ${maxDistance * 2}px;
          height: ${maxDistance * 2}px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.15) 30%, transparent 70%);
          left: ${x - maxDistance}px;
          top: ${y - maxDistance}px;
          pointer-events: none;
          z-index: 1000;
        `
        element.appendChild(ripple)
        gsap.fromTo(ripple, { scale: 0, opacity: 1 }, {
          scale: 1,
          opacity: 0,
          duration: 0.7,
          ease: 'power2.out',
          onComplete: () => ripple.remove(),
        })
      }
      onSelect?.()
    }

    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)
    element.addEventListener('click', handleClick)
    return () => {
      isHoveredRef.current = false
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
      element.removeEventListener('click', handleClick)
      clearAllParticles()
    }
  }, [clearAllParticles, clickEffect, disableAnimations, disabled, glowColor, onSelect, particleCount])

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={disabled ? -1 : 0}
      className={`${className} particle-container`}
      style={{ ...style, position: 'relative', overflow: 'hidden' }}
      onKeyDown={e => {
        if (disabled) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect?.()
        }
      }}
    >
      {children}
    </div>
  )
}

function GlobalSpotlight({ gridRef, enabled = true, spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS, glowColor = DEFAULT_GLOW_COLOR }) {
  const spotlightRef = useRef(null)

  useEffect(() => {
    if (!enabled || !gridRef?.current) return undefined

    const section = gridRef.current.closest('.bento-section')
    if (!section) return undefined

    const spotlight = document.createElement('div')
    spotlight.className = 'global-spotlight'
    spotlight.style.cssText = `
      position: absolute;
      width: 520px;
      height: 520px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.16) 0%,
        rgba(${glowColor}, 0.06) 22%,
        transparent 70%
      );
      z-index: 1;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `
    section.appendChild(spotlight)
    spotlightRef.current = spotlight

    const handleMouseMove = e => {
      if (!spotlightRef.current || !gridRef.current) return
      const rect = section.getBoundingClientRect()
      const mouseInside = e.clientX >= rect.left && e.clientX <= rect.right
        && e.clientY >= rect.top && e.clientY <= rect.bottom
      const cards = gridRef.current.querySelectorAll('.magic-bento-card')

      if (!mouseInside) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.25 })
        cards.forEach(card => card.style.setProperty('--glow-intensity', '0'))
        return
      }

      gsap.to(spotlightRef.current, { opacity: 0.75, duration: 0.2 })
      spotlightRef.current.style.left = `${e.clientX - rect.left}px`
      spotlightRef.current.style.top = `${e.clientY - rect.top}px`

      cards.forEach(card => {
        const cardRect = card.getBoundingClientRect()
        const centerX = cardRect.left + cardRect.width / 2
        const centerY = cardRect.top + cardRect.height / 2
        const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY)
          - Math.max(cardRect.width, cardRect.height) / 2
        const fadeDistance = spotlightRadius * 0.75
        const proximity = spotlightRadius * 0.45
        let glow = 0
        if (distance <= proximity) glow = 1
        else if (distance <= fadeDistance) glow = (fadeDistance - distance) / (fadeDistance - proximity)
        const relativeX = ((e.clientX - cardRect.left) / cardRect.width) * 100
        const relativeY = ((e.clientY - cardRect.top) / cardRect.height) * 100
        card.style.setProperty('--glow-x', `${relativeX}%`)
        card.style.setProperty('--glow-y', `${relativeY}%`)
        card.style.setProperty('--glow-intensity', String(Math.max(0, glow)))
        card.style.setProperty('--glow-radius', `${spotlightRadius}px`)
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current)
    }
  }, [enabled, glowColor, gridRef, spotlightRadius])

  return null
}

export default function MagicBento({
  cards = [],
  columns = 2,
  compact = false,
  textAutoHide = false,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  clickEffect = true,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  onCardClick,
}) {
  const gridRef = useRef(null)

  return (
    <div className="bento-section" style={{ '--glow-color': glowColor }}>
      {enableSpotlight && (
        <GlobalSpotlight gridRef={gridRef} spotlightRadius={DEFAULT_SPOTLIGHT_RADIUS} glowColor={glowColor} />
      )}
      <div
        ref={gridRef}
        className="card-grid card-grid--even"
        style={{ '--bento-cols': columns }}
      >
        {cards.map(card => {
          const rgb = card.accent ? hexToRgb(card.accent) : glowColor
          const Icon = card.icon
          const className = [
            'magic-bento-card',
            compact ? 'magic-bento-card--compact' : '',
            textAutoHide ? 'magic-bento-card--text-autohide' : '',
            enableBorderGlow ? 'magic-bento-card--border-glow' : '',
            card.selected ? 'magic-bento-card--selected' : '',
            card.disabled ? 'magic-bento-card--disabled' : '',
          ].filter(Boolean).join(' ')

          const style = {
            backgroundColor: card.color || '#120f17',
            '--glow-color': rgb,
          }

          const body = (
            <>
              <div className="magic-bento-card__header">
                {Icon ? (
                  <div className="magic-bento-card__icon">
                    <Icon size={16} color={`rgb(${rgb})`} />
                  </div>
                ) : <span />}
                {card.label ? <div className="magic-bento-card__label">{card.label}</div> : null}
              </div>
              <div className="magic-bento-card__content">
                <h2 className="magic-bento-card__title">{card.title}</h2>
                {card.description ? (
                  <p className="magic-bento-card__description">{card.description}</p>
                ) : null}
              </div>
            </>
          )

          if (enableStars) {
            return (
              <ParticleCard
                key={card.id || card.title}
                className={className}
                style={style}
                particleCount={compact ? Math.min(particleCount, 6) : particleCount}
                glowColor={rgb}
                clickEffect={clickEffect}
                disabled={Boolean(card.disabled)}
                onSelect={() => { if (!card.disabled) onCardClick?.(card) }}
              >
                {body}
              </ParticleCard>
            )
          }

          return (
            <button
              key={card.id || card.title}
              type="button"
              className={className}
              style={style}
              disabled={card.disabled}
              onClick={() => { if (!card.disabled) onCardClick?.(card) }}
            >
              {body}
            </button>
          )
        })}
      </div>
    </div>
  )
}
