import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useVelocity,
  useTransform,
} from 'motion/react'

const TooltipContext = createContext(null)

const SIZE_STYLES = {
  md: {
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
  },
  lg: {
    borderRadius: 12,
    padding: '14px 18px',
    fontSize: 15,
  },
}

const VARIANT_STYLES = {
  default: {
    background: 'rgba(18, 15, 23, 0.92)',
    color: '#f5f5f5',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow:
      'inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 12px 32px rgba(0, 0, 0, 0.45)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  outline: {
    background: 'rgba(17, 17, 17, 0.95)',
    color: '#e5e5e5',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 10px 28px rgba(0, 0, 0, 0.4)',
  },
}

const EDGE_PAD = 12
const CURSOR_GAP = 16
const EST_WIDTH = 120
const EST_HEIGHT = 44

function getZoom() {
  if (typeof window === 'undefined') return 1
  const computedZoom = window.getComputedStyle(document.documentElement).zoom
  return computedZoom ? parseFloat(computedZoom) : 1
}

function computePlacement(clientX, clientY, size) {
  const zoom = getZoom()
  const px = clientX / zoom
  const py = clientY / zoom
  const vw = window.innerWidth / zoom
  const vh = window.innerHeight / zoom
  const w = size?.w || EST_WIDTH
  const h = size?.h || EST_HEIGHT

  return {
    flipX: px + CURSOR_GAP + w > vw - EDGE_PAD,
    flipY: py + CURSOR_GAP + h > vh - EDGE_PAD,
  }
}

function FloatingTooltipProvider({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  style,
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const pointerRef = useRef({ x: 0, y: 0 })
  const sizeRef = useRef({ w: EST_WIDTH, h: EST_HEIGHT })

  const springConfig = { damping: 45, stiffness: 750 }
  const smoothX = useSpring(x, springConfig)
  const smoothY = useSpring(y, springConfig)

  const velocityX = useVelocity(smoothX)
  const velocityY = useVelocity(smoothY)

  const scaleX = useTransform(velocityX, [-1000, 0, 1000], [0.9, 1, 1.15])
  const scaleY = useTransform(velocityY, [-1000, 0, 1000], [1.15, 1, 0.9])
  const skewX = useTransform(velocityX, [-1000, 0, 1000], [-3, 0, 3])
  const skewY = useTransform(velocityY, [-1000, 0, 1000], [-3, 0, 3])

  const [isActive, setIsActive] = useState(false)
  const [content, setContent] = useState('')
  const [description, setDescription] = useState('')
  const [contentClassName, setContentClassName] = useState('')
  const [descriptionClassName, setDescriptionClassName] = useState('')
  const [mounted, setMounted] = useState(false)
  const [placement, setPlacement] = useState({ flipX: false, flipY: false })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleMouseMove = (e) => {
      const zoom = getZoom()
      pointerRef.current = { x: e.clientX, y: e.clientY }
      x.set(e.clientX / zoom)
      y.set(e.clientY / zoom)
      if (isActive) {
        setPlacement(computePlacement(e.clientX, e.clientY, sizeRef.current))
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [x, y, isActive])

  const activate = () => {
    const { x: cx, y: cy } = pointerRef.current
    setPlacement(computePlacement(cx, cy, sizeRef.current))
    setIsActive(true)
  }

  const handleSetContent = (
    newContent,
    newDescription,
    newContentClassName,
    newDescriptionClassName
  ) => {
    setContent(newContent)
    setDescription(newDescription || '')
    setContentClassName(newContentClassName || '')
    setDescriptionClassName(newDescriptionClassName || '')
  }

  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.md
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.default

  return (
    <TooltipContext.Provider
      value={{ setContent: handleSetContent, setIsActive, activate }}
    >
      {children}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isActive && content && (
              <motion.div
                className="floating-tooltip-root"
                ref={(node) => {
                  if (!node) return
                  const rect = node.getBoundingClientRect()
                  const next = { w: rect.width, h: rect.height }
                  if (
                    Math.abs(next.w - sizeRef.current.w) > 1 ||
                    Math.abs(next.h - sizeRef.current.h) > 1
                  ) {
                    sizeRef.current = next
                    const { x: cx, y: cy } = pointerRef.current
                    setPlacement(computePlacement(cx, cy, next))
                  }
                }}
                style={{
                  position: 'fixed',
                  top: smoothY,
                  left: smoothX,
                  x: placement.flipX ? '-100%' : '0%',
                  y: placement.flipY ? '-100%' : '0%',
                  marginLeft: placement.flipX ? -CURSOR_GAP : CURSOR_GAP,
                  marginTop: placement.flipY ? -CURSOR_GAP : CURSOR_GAP,
                  pointerEvents: 'none',
                  zIndex: 9999,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                <motion.div
                  layout
                  className={className}
                  style={{
                    ...sizeStyle,
                    ...variantStyle,
                    fontWeight: 500,
                    ...style,
                    scaleX,
                    scaleY,
                    skewX,
                    skewY,
                  }}
                  transition={{
                    layout: { type: 'spring', damping: 25, stiffness: 400 },
                  }}
                >
                  <motion.div
                    key={content}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                  >
                    <span
                      className={contentClassName}
                      style={{ whiteSpace: 'nowrap', fontWeight: 600 }}
                    >
                      {content}
                    </span>
                    {description ? (
                      <span
                        className={descriptionClassName}
                        style={{
                          maxWidth: '28ch',
                          whiteSpace: 'normal',
                          fontSize: '0.85em',
                          lineHeight: 1.35,
                          fontWeight: 400,
                          opacity: 0.7,
                        }}
                      >
                        {description}
                      </span>
                    ) : null}
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </TooltipContext.Provider>
  )
}

function FloatingTooltipTrigger({
  children,
  content,
  description,
  contentClassName,
  descriptionClassName,
  style,
  className = '',
}) {
  const context = useContext(TooltipContext)

  if (!context) {
    throw new Error('FloatingTooltip.Trigger must be used within FloatingTooltip.Provider')
  }

  const { setContent, setIsActive, activate } = context

  useEffect(() => {
    return () => {
      setIsActive(false)
    }
  }, [setIsActive])

  return (
    <div
      className={className}
      style={{ display: 'inline-flex', ...style }}
      onMouseEnter={() => {
        setContent(content, description, contentClassName, descriptionClassName)
        activate()
      }}
      onMouseLeave={() => setIsActive(false)}
      onClick={() => setIsActive(false)}
    >
      {children}
    </div>
  )
}

const FloatingTooltip = {
  Provider: FloatingTooltipProvider,
  Trigger: FloatingTooltipTrigger,
}

export { FloatingTooltip, FloatingTooltipProvider, FloatingTooltipTrigger }
export default FloatingTooltip
