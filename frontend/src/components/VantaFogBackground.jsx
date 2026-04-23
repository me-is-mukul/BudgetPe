import { useEffect, useRef } from 'react'

export default function VantaFogBackground() {
  const fogRef = useRef(null)

  useEffect(() => {
    let effect
    let active = true

    async function initFog() {
      const fogModule = await import('vanta/dist/vanta.fog.min')
      const FOG = fogModule.default
      if (!active || !fogRef.current) return

      effect = FOG({
        el: fogRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        highlightColor: 0xa78bfa,
        midtoneColor: 0x4338ca,
        lowlightColor: 0x111827,
        baseColor: 0x060913,
        blurFactor: 0.58,
        speed: 1.35,
        zoom: 0.82,
      })
    }

    initFog()

    return () => {
      active = false
      if (effect) effect.destroy()
    }
  }, [])

  return (
    <div
      ref={fogRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        opacity: 0.62,
        filter: 'saturate(1.08) contrast(1.04)',
        pointerEvents: 'none',
      }}
    />
  )
}
