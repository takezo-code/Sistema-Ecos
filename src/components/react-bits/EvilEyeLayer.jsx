import EvilEye from './EvilEye'

/** Fundo WebGL Evil Eye (React Bits) — configs do Background Studio. */
export function EvilEyeLayer() {
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
      <EvilEye
        eyeColor="#5654a9"
        pupilSize={0.7}
        glowIntensity={0.4}
        pupilFollow={1.7}
        noiseScale={1.9}
        irisWidth={0.2}
        flameSpeed={0.7}
        scale={0.7}
        backgroundColor="#080a12"
        intensity={1}
      />
    </div>
  )
}
