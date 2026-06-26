'use client'

/**
 * 3D command-center globe: glowing dotted Earth, data arcs from Tokyo to each
 * platform node, starfield, Bloom. Orange × deep-navy. Background layer for the
 * 司令塔 HUD. react-three-fiber + drei + postprocessing (proven in ThreeScene.tsx).
 */

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Line } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const ORANGE = '#E8845C'
const CYAN = '#38E1D8'

function llToVec(lat: number, lon: number, r = 1): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180
  const theta = ((lon + 180) * Math.PI) / 180
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  )
}

// Dotted globe (fibonacci sphere of points)
function DotGlobe() {
  const geo = useMemo(() => {
    const N = 2600
    const pos = new Float32Array(N * 3)
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2
      const radius = Math.sqrt(1 - y * y)
      const theta = golden * i
      pos[i * 3] = Math.cos(theta) * radius
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = Math.sin(theta) * radius
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])
  return (
    <points geometry={geo}>
      <pointsMaterial size={0.012} color={CYAN} transparent opacity={0.55} sizeAttenuation />
    </points>
  )
}

// One glowing arc Tokyo→node + a traveling pulse
function Arc({ from, to, delay }: { from: THREE.Vector3; to: THREE.Vector3; delay: number }) {
  const mid = from.clone().add(to).multiplyScalar(0.5).normalize().multiplyScalar(1.45)
  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(from, mid, to), [from, to, mid])
  const pts = useMemo(() => curve.getPoints(50), [curve])
  const pulse = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!pulse.current) return
    const t = ((clock.elapsedTime * 0.35 + delay) % 1)
    const p = curve.getPoint(t)
    pulse.current.position.copy(p)
    const s = 0.5 + Math.sin(t * Math.PI) * 0.5
    pulse.current.scale.setScalar(0.02 + s * 0.03)
  })
  return (
    <group>
      <Line points={pts} color={ORANGE} lineWidth={1.4} transparent opacity={0.5} />
      <mesh ref={pulse}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color={ORANGE} />
      </mesh>
      <mesh position={to}>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshBasicMaterial color={ORANGE} />
      </mesh>
    </group>
  )
}

function World() {
  const group = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.06
  })
  // Tokyo + platform nodes (spread around globe; positions are illustrative)
  const tokyo = useMemo(() => llToVec(35.6, 139.7, 1), [])
  const nodes = useMemo(
    () => [
      llToVec(37, -122, 1), // X (SF-ish)
      llToVec(51, 0, 1), // Threads (EU)
      llToVec(1, 103, 1), // Zenn (SEA)
      llToVec(-33, 151, 1), // Qiita (AU)
      llToVec(40, -74, 1), // note (NY)
      llToVec(19, 77, 1), // Blog (IN)
    ],
    [],
  )
  return (
    <group ref={group} rotation={[0.35, 0, 0.1]}>
      {/* faint wireframe core */}
      <mesh>
        <icosahedronGeometry args={[0.99, 3]} />
        <meshBasicMaterial color={'#0e2740'} wireframe transparent opacity={0.18} />
      </mesh>
      <DotGlobe />
      {/* Tokyo origin */}
      <mesh position={tokyo}>
        <sphereGeometry args={[0.03, 18, 18]} />
        <meshBasicMaterial color={CYAN} />
      </mesh>
      {nodes.map((n, i) => (
        <Arc key={i} from={tokyo} to={n} delay={i / nodes.length} />
      ))}
    </group>
  )
}

export default function GlobeScene() {
  return (
    <Canvas camera={{ position: [0, 0, 3.05], fov: 42 }} gl={{ antialias: true }} dpr={[1, 2]}>
      <color attach="background" args={['#05070d']} />
      <ambientLight intensity={0.6} />
      <Stars radius={120} depth={60} count={3500} factor={4} saturation={0} fade speed={0.6} />
      <World />
      <EffectComposer>
        <Bloom intensity={1.3} luminanceThreshold={0.15} luminanceSmoothing={0.9} mipmapBlur radius={0.7} />
      </EffectComposer>
    </Canvas>
  )
}
