import DarkVeil from './DarkVeil'

/** Fundo WebGL fixo atrás de toda a UI. */
export function DarkVeilLayer() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <DarkVeil
        hueShift={18}
        noiseIntensity={0.04}
        scanlineIntensity={0.06}
        scanlineFrequency={2.2}
        speed={0.35}
        warpAmount={0.25}
      />
    </div>
  )
}
