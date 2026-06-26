'use client'

/**
 * 司令塔 3D Earth — layered globe: night-lights texture + glowing country
 * borders (geojson) + dotted shell + fresnel atmosphere + Tron grid floor +
 * data-driven data arcs (volume → count/width/glow/speed) + GSAP intro + Bloom.
 * Robust: if texture/geojson fail, falls back to lines/dots only.
 */

import { useMemo, useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Line, useTexture } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { gsap } from 'gsap'
import * as THREE from 'three'
import { llToVec, geojsonToSegments } from './lib/geo-lines'

const ORANGE = '#E8845C'
const CYAN = '#38E1D8'

interface Posts { total: number; x: number; threads: number; blog: number; crosspost: number }

// ── night-lights textured earth ────────────────────────────
function EarthTextured() {
  const tex = useTexture('/textures/earth-dark.jpg')
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        color={'#0a1830'}
        emissive={'#ffd9a0'}
        emissiveMap={tex}
        emissiveIntensity={1.6}
        roughness={1}
        metalness={0}
      />
    </mesh>
  )
}

function EarthFallback() {
  return (
    <mesh>
      <sphereGeometry args={[1, 48, 48]} />
      <meshBasicMaterial color={'#08111f'} />
    </mesh>
  )
}

// ── country borders (single lineSegments) ──────────────────
function Borders() {
  const [geom, setGeom] = useState<THREE.BufferGeometry | null>(null)
  useEffect(() => {
    let alive = true
    fetch('/data/world-110m.json')
      .then((r) => r.json())
      .then((geo) => {
        if (!alive) return
        const seg = geojsonToSegments(geo, 1.003, 1)
        const g = new THREE.BufferGeometry()
        g.setAttribute('position', new THREE.BufferAttribute(seg, 3))
        setGeom(g)
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])
  if (!geom) return null
  return (
    <lineSegments geometry={geom}>
      <lineBasicMaterial color={CYAN} transparent opacity={0.45} />
    </lineSegments>
  )
}

// ── faint dotted shell ─────────────────────────────────────
function DotShell() {
  const geo = useMemo(() => {
    const N = 1800
    const pos = new Float32Array(N * 3)
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2
      const radius = Math.sqrt(1 - y * y)
      const t = golden * i
      pos[i * 3] = Math.cos(t) * radius * 1.012
      pos[i * 3 + 1] = y * 1.012
      pos[i * 3 + 2] = Math.sin(t) * radius * 1.012
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])
  return (
    <points geometry={geo}>
      <pointsMaterial size={0.008} color={CYAN} transparent opacity={0.25} sizeAttenuation />
    </points>
  )
}

// ── fresnel atmosphere ─────────────────────────────────────
function Atmosphere() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(ORANGE) } },
        vertexShader: `varying vec3 vN; void main(){ vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: `varying vec3 vN; uniform vec3 uColor; void main(){ float i=pow(0.72 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor=vec4(uColor, clamp(i,0.0,1.0)); }`,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    [],
  )
  return (
    <mesh scale={1.18} material={mat}>
      <sphereGeometry args={[1, 48, 48]} />
    </mesh>
  )
}

// ── Tron grid floor ────────────────────────────────────────
function GridFloor() {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uColor: { value: new THREE.Color(CYAN) } }), [])
  useFrame((_, dt) => { if (mat.current) (mat.current.uniforms.uTime.value as number) += dt })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.55, 0]}>
      <planeGeometry args={[24, 24, 1, 1]} />
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`}
        fragmentShader={`
          varying vec2 vUv; uniform float uTime; uniform vec3 uColor;
          void main(){
            vec2 uv=(vUv-0.5)*24.0;
            vec2 g=abs(fract(uv)-0.5)/fwidth(uv);
            float line=1.0-min(min(g.x,g.y),1.0);
            float dist=length(vUv-0.5)*2.0;
            float fade=smoothstep(1.0,0.15,dist);
            float scan=0.6+0.4*sin(uTime*1.2 - dist*8.0);
            gl_FragColor=vec4(uColor, line*fade*0.5*scan);
          }`}
      />
    </mesh>
  )
}

// ── data-driven arc ────────────────────────────────────────
function Arc({ from, to, value, color }: { from: THREE.Vector3; to: THREE.Vector3; value: number; color: string }) {
  const mid = from.clone().add(to).multiplyScalar(0.5).normalize().multiplyScalar(1.4 + Math.min(value, 5) * 0.04)
  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(from, mid, to), [from, to, mid])
  const pts = useMemo(() => curve.getPoints(48), [curve])
  const pulse = useRef<THREE.Mesh>(null)
  const active = value > 0
  const speed = active ? 0.3 + Math.min(value, 6) * 0.08 : 0
  const width = active ? 1 + Math.min(value, 6) * 0.5 : 0.8
  const op = active ? 0.35 + Math.min(value, 6) * 0.1 : 0.12
  useFrame(({ clock }) => {
    if (!pulse.current || !active) return
    const t = (clock.elapsedTime * speed) % 1
    pulse.current.position.copy(curve.getPoint(t))
    pulse.current.scale.setScalar(0.018 + Math.sin(t * Math.PI) * (0.02 + Math.min(value, 6) * 0.006))
  })
  return (
    <group>
      <Line points={pts} color={color} lineWidth={width} transparent opacity={Math.min(op, 0.85)} />
      <mesh position={to}>
        <sphereGeometry args={[0.016 + Math.min(value, 6) * 0.004, 16, 16]} />
        <meshBasicMaterial color={active ? color : '#33405e'} />
      </mesh>
      {active && (
        <mesh ref={pulse}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}
    </group>
  )
}

function World({ posts }: { posts: Posts }) {
  const group = useRef<THREE.Group>(null)
  useEffect(() => {
    if (!group.current) return
    group.current.scale.setScalar(0.82)
    gsap.to(group.current.scale, { x: 1, y: 1, z: 1, duration: 1.8, ease: 'power3.out' })
    gsap.fromTo(group.current.rotation, { x: 0.9 }, { x: 0.32, duration: 2.0, ease: 'power3.out' })
  }, [])
  useFrame((_, dt) => { if (group.current) group.current.rotation.y += dt * 0.05 })

  const tokyo = useMemo(() => llToVec(35.6, 139.7, 1), [])
  const arcs = useMemo(() => {
    const c = posts.crosspost
    return [
      { to: llToVec(37, -122, 1), v: posts.x, color: ORANGE },        // X
      { to: llToVec(51, 0, 1), v: posts.threads, color: ORANGE },     // Threads
      { to: llToVec(19, 77, 1), v: posts.blog, color: CYAN },         // Blog
      { to: llToVec(1, 103, 1), v: Math.ceil(c / 3), color: CYAN },   // Zenn
      { to: llToVec(-33, 151, 1), v: Math.ceil(c / 3), color: CYAN }, // Qiita
      { to: llToVec(40, -74, 1), v: Math.floor(c / 3), color: CYAN }, // note
    ]
  }, [posts])

  return (
    <group ref={group} rotation={[0.32, 0, 0.08]}>
      <Suspense fallback={<EarthFallback />}>
        <EarthTextured />
      </Suspense>
      <Borders />
      <DotShell />
      <Atmosphere />
      <mesh position={tokyo}>
        <sphereGeometry args={[0.026, 18, 18]} />
        <meshBasicMaterial color={CYAN} />
      </mesh>
      {arcs.map((a, i) => (
        <Arc key={i} from={tokyo} to={a.to} value={a.v} color={a.color} />
      ))}
    </group>
  )
}

export default function GlobeScene({ posts }: { posts: Posts }) {
  return (
    <Canvas camera={{ position: [0, 0.3, 3.1], fov: 42 }} gl={{ antialias: true }} dpr={[1, 2]}>
      <color attach="background" args={['#05070d']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={0.6} />
      <Stars radius={130} depth={60} count={4000} factor={4} saturation={0} fade speed={0.5} />
      <GridFloor />
      <World posts={posts} />
      <EffectComposer>
        <Bloom intensity={1.25} luminanceThreshold={0.12} luminanceSmoothing={0.9} mipmapBlur radius={0.75} />
      </EffectComposer>
    </Canvas>
  )
}
