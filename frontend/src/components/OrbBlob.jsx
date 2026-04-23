import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Sphere } from '@react-three/drei'

function AnimatedBlob() {
  const mesh = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    mesh.current.rotation.y = t * 0.18
    mesh.current.rotation.x = Math.sin(t * 0.4) * 0.25
  })

  return (
    <Sphere ref={mesh} args={[1.6, 128, 128]}>
      <MeshDistortMaterial
        color="#6d28d9"
        emissive="#4c1d95"
        emissiveIntensity={0.4}
        distort={0.45}
        speed={2.2}
        roughness={0.05}
        metalness={0.7}
      />
    </Sphere>
  )
}

export default function OrbBlob({ className = '' }) {
  return (
    <div className={`relative ${className}`} style={{ isolation: 'isolate' }}>
      {/* CSS glow rings */}
      <div style={{
        position: 'absolute', inset: '-10%',
        background: 'radial-gradient(circle at 50% 50%, rgba(109,40,217,0.55) 0%, rgba(6,182,212,0.2) 45%, transparent 70%)',
        filter: 'blur(48px)',
        borderRadius: '50%',
        zIndex: 0,
        animation: 'pulse 4s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', inset: '10%',
        background: 'radial-gradient(circle at 60% 40%, rgba(6,182,212,0.3) 0%, transparent 60%)',
        filter: 'blur(32px)',
        borderRadius: '50%',
        zIndex: 0,
      }} />

      <Canvas
        style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}
        camera={{ position: [0, 0, 5], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.25} />
        <pointLight position={[4, 4, 4]} intensity={3} color="#7c3aed" />
        <pointLight position={[-4, -3, 2]} intensity={2} color="#06b6d4" />
        <pointLight position={[0, 0, 5]} intensity={1.2} color="#ffffff" />
        <AnimatedBlob />
      </Canvas>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '12%',
          zIndex: 2,
          borderRadius: '999px',
          border: '1px solid rgba(255,255,255,0.28)',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.25), rgba(255,255,255,0.04) 35%, rgba(255,255,255,0.12) 100%)',
          boxShadow: 'inset 0 0 22px rgba(255,255,255,0.15), 0 0 38px rgba(124,58,237,0.2)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          pointerEvents: 'none',
          mixBlendMode: 'screen',
        }}
      />
    </div>
  )
}
