import { motion, useSpring, useTransform } from 'motion/react'
import { useEffect } from 'react'
import './Counter.css'

function Number({ mv, number, height }) {
  const y = useTransform(mv, (latest) => {
    const placeValue = latest % 10
    const offset = (10 + number - placeValue) % 10
    let memo = offset * height
    if (offset > 5) {
      memo -= 10 * height
    }
    return memo
  })

  return (
    <motion.span className="counter-number" style={{ y }}>
      {number}
    </motion.span>
  )
}

function normalizeNearInteger(num) {
  const nearest = Math.round(num)
  const tolerance = 1e-9 * Math.max(1, Math.abs(num))
  return Math.abs(num - nearest) < tolerance ? nearest : num
}

function getValueRoundedToPlace(value, place) {
  const scaled = value / place
  return Math.floor(normalizeNearInteger(scaled))
}

function defaultPlaces(value) {
  const str = String(value)
  return [...str].map((ch, i, a) => {
    if (ch === '.') return '.'
    const dotIndex = a.indexOf('.')
    if (dotIndex === -1) {
      return 10 ** (a.length - i - 1)
    }
    if (i < dotIndex) {
      return 10 ** (dotIndex - i - 1)
    }
    return 10 ** -(i - dotIndex)
  })
}

function Digit({ place, value, height, digitStyle }) {
  const isDecimal = place === '.'
  const valueRoundedToPlace = isDecimal ? 0 : getValueRoundedToPlace(value, place)
  const animatedValue = useSpring(valueRoundedToPlace)

  useEffect(() => {
    if (!isDecimal) {
      animatedValue.set(valueRoundedToPlace)
    }
  }, [animatedValue, valueRoundedToPlace, isDecimal])

  if (isDecimal) {
    return (
      <span className="counter-digit" style={{ height, ...digitStyle, width: 'fit-content' }}>
        .
      </span>
    )
  }

  return (
    <span className="counter-digit" style={{ height, ...digitStyle }}>
      {Array.from({ length: 10 }, (_, i) => (
        <Number key={i} mv={animatedValue} number={i} height={height} />
      ))}
    </span>
  )
}

export default function Counter({
  value,
  fontSize = 18,
  padding = 0,
  places,
  gap = 2,
  borderRadius = 4,
  horizontalPadding = 0,
  textColor = '#e5e5e5',
  fontWeight = 700,
  containerStyle,
  counterStyle,
  digitStyle,
  gradientHeight = 8,
  gradientFrom = 'transparent',
  gradientTo = 'transparent',
  topGradientStyle,
  bottomGradientStyle,
}) {
  const resolvedPlaces = places ?? defaultPlaces(value)
  const height = fontSize + padding
  const hideGradients = gradientFrom === 'transparent' && !topGradientStyle && !bottomGradientStyle

  const defaultCounterStyle = {
    fontSize,
    gap,
    borderRadius,
    paddingLeft: horizontalPadding,
    paddingRight: horizontalPadding,
    color: textColor,
    fontWeight,
    direction: 'ltr',
  }

  const defaultTopGradientStyle = {
    height: gradientHeight,
    background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})`,
  }

  const defaultBottomGradientStyle = {
    height: gradientHeight,
    background: `linear-gradient(to top, ${gradientFrom}, ${gradientTo})`,
  }

  return (
    <span className="counter-container" style={containerStyle}>
      <span className="counter-counter" style={{ ...defaultCounterStyle, ...counterStyle }}>
        {resolvedPlaces.map((place, index) => (
          <Digit
            key={`${place}-${index}`}
            place={place}
            value={value}
            height={height}
            digitStyle={digitStyle}
          />
        ))}
      </span>
      {!hideGradients && (
        <span className="gradient-container">
          <span
            className="top-gradient"
            style={topGradientStyle ? topGradientStyle : defaultTopGradientStyle}
          />
          <span
            className="bottom-gradient"
            style={bottomGradientStyle ? bottomGradientStyle : defaultBottomGradientStyle}
          />
        </span>
      )}
    </span>
  )
}
