import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function VantaFogBackground() {
  const vantaRef = useRef(null)
  const effectRef = useRef(null)

  useEffect(() => {
    if (!vantaRef.current || effectRef.current) return
    let mounted = true

    const initVanta = async () => {
      try {
        const fogModule = await import('vanta/dist/vanta.fog.min')
        const FOG = fogModule.default

        if (!mounted || !vantaRef.current || effectRef.current) return

        effectRef.current = FOG({
          el: vantaRef.current,
          THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          highlightColor: 0x6d28d9,
          midtoneColor: 0x0f172a,
          lowlightColor: 0x030712,
          baseColor: 0x030712,
          blurFactor: 0.75,
          speed: 1.2,
          zoom: 1.0,
        })
      } catch {
        // Keep a plain background if Vanta fails.
      }
    }

    initVanta()

    return () => {
      mounted = false
      if (effectRef.current) {
        effectRef.current.destroy()
        effectRef.current = null
      }
    }
  }, [])

  return <div ref={vantaRef} className="landing-vanta-bg" aria-hidden="true" />
}
