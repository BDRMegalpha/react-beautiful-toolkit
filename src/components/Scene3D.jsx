import { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import { searchPlayer, getPlayerIconURL } from '../api/gd'

/*
  3D Drag: Each shape uses R3F's onPointerDown. A full-screen transparent
  plane is rendered in front of everything. When dragging starts on a shape,
  the plane becomes active and captures onPointerMove/onPointerUp events,
  computing the drag position via ray-plane intersection.
*/

// ─── Shared drag state ───
const useDragStore = () => {
  const state = useMemo(() => ({
    active: false,
    target: null,
    plane: new THREE.Plane(),
    offset: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    lastPos: new THREE.Vector3(),
  }), [])
  return state
}

// ─── Catch-all transparent plane for drag ───
function DragCatcher({ drag }) {
  const meshRef = useRef()
  const { camera } = useThree()

  // Keep plane facing camera
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.quaternion.copy(camera.quaternion)
      meshRef.current.position.set(0, 0, 0)
    }
  })

  const onMove = useCallback((e) => {
    if (!drag.active || !drag.target) return
    e.stopPropagation()
    const newPos = e.point.clone().add(drag.offset)
    drag.velocity.copy(newPos).sub(drag.target.position)
    drag.target.position.copy(newPos)
    drag.lastPos.copy(e.point)
  }, [drag])

  const onUp = useCallback((e) => {
    if (!drag.active || !drag.target) return
    e.stopPropagation()
    // Store throw velocity on the mesh
    drag.target.userData._throwVel = drag.velocity.clone().multiplyScalar(0.8)
    drag.target.userData._throwTime = 3
    drag.target.userData._dragging = false
    drag.active = false
    drag.target = null
    document.body.style.cursor = 'default'
  }, [drag])

  return (
    <mesh
      ref={meshRef}
      onPointerMove={drag.active ? onMove : undefined}
      onPointerUp={drag.active ? onUp : undefined}
      renderOrder={-1}
    >
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

// ─── Interactive shape ───
function InteractiveShape({ position, color, drag, children }) {
  const ref = useRef()
  const basePos = useRef(new THREE.Vector3(...position))
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const ud = ref.current.userData

    // Being dragged
    if (ud._dragging) {
      ref.current.scale.setScalar(1.3)
      return
    }

    // Throw physics
    if (ud._throwTime > 0) {
      ud._throwTime -= 0.016
      const vel = ud._throwVel
      if (vel && vel.length() > 0.0001) {
        ref.current.position.add(vel)
        vel.multiplyScalar(0.93)
        ref.current.rotation.x += vel.x * 2
        ref.current.rotation.y += vel.y * 2
      }
      const drift = basePos.current.clone().sub(ref.current.position).multiplyScalar(0.005)
      ref.current.position.add(drift)
      ref.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.05)
      return
    }

    // Hover jiggle
    if (hovered) {
      ref.current.rotation.x += Math.sin(t * 15) * 0.04
      ref.current.rotation.y += Math.cos(t * 12) * 0.04
      ref.current.scale.setScalar(1.25 + Math.sin(t * 10) * 0.1)
    } else {
      ref.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.08)
    }

    // Idle float
    ref.current.position.y = basePos.current.y + Math.sin(t * 0.5 + basePos.current.x) * 0.3
    ref.current.rotation.y += 0.004
  })

  const onDown = useCallback((e) => {
    e.stopPropagation()
    drag.active = true
    drag.target = ref.current
    drag.offset.copy(ref.current.position).sub(e.point)
    drag.velocity.set(0, 0, 0)
    drag.lastPos.copy(e.point)
    ref.current.userData._dragging = true
    ref.current.userData._throwTime = 0
    ref.current.userData._throwVel = null
    document.body.style.cursor = 'grabbing'
  }, [drag])

  return (
    <mesh
      ref={ref}
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); if (!drag.active) document.body.style.cursor = 'grab' }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); if (!drag.active) document.body.style.cursor = 'default' }}
      onPointerDown={onDown}
    >
      {children}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hovered ? 1.5 : 0.6}
        transparent
        opacity={hovered ? 1 : 0.85}
      />
    </mesh>
  )
}

// ─── Background particles that react to mouse ───
function ReactiveParticles() {
  const count = 150
  const ref = useRef()
  const mouseRef = useRef(new THREE.Vector3())
  const { camera } = useThree()

  const basePositions = useMemo(() => {
    const pos = []
    for (let i = 0; i < count; i++) {
      pos.push(new THREE.Vector3(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10 - 5
      ))
    }
    return pos
  }, [])

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    basePositions.forEach((p, i) => { arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z })
    return arr
  }, [basePositions])

  // Track mouse in world space
  useEffect(() => {
    const onMove = (e) => {
      const rect = document.querySelector('canvas')?.getBoundingClientRect()
      if (!rect) return
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      )
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(ndc, camera)
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 5)
      raycaster.ray.intersectPlane(plane, mouseRef.current)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [camera])

  useFrame((state) => {
    if (!ref.current) return
    const posArray = ref.current.geometry.attributes.position.array
    const t = state.clock.elapsedTime

    for (let i = 0; i < count; i++) {
      const base = basePositions[i]
      const idx = i * 3
      let x = base.x + Math.sin(t * 0.3 + i) * 0.3
      let y = base.y + Math.cos(t * 0.2 + i * 0.7) * 0.3
      let z = base.z

      // Push away from mouse
      const dx = x - mouseRef.current.x
      const dy = y - mouseRef.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 3) {
        const force = (3 - dist) / 3 * 1.5
        x += (dx / dist) * force
        y += (dy / dist) * force
      }

      posArray[idx] = x
      posArray[idx + 1] = y
      posArray[idx + 2] = z
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#00ffff" transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}

// ─── GD shapes ───
function GDCube(p) { return <InteractiveShape {...p}><boxGeometry args={[1, 1, 1]} /></InteractiveShape> }
function GDShip(p) { return <InteractiveShape {...p}><coneGeometry args={[0.7, 1.4, 3]} /></InteractiveShape> }
function GDBall(p) { return <InteractiveShape {...p}><sphereGeometry args={[0.55, 32, 32]} /></InteractiveShape> }
function GDUFO(p) { return <InteractiveShape {...p}><cylinderGeometry args={[0.7, 0.7, 0.2, 32]} /></InteractiveShape> }
function GDWave(p) { return <InteractiveShape {...p}><octahedronGeometry args={[0.5, 0]} /></InteractiveShape> }
function GDSpike(p) { return <InteractiveShape {...p}><coneGeometry args={[0.5, 1.2, 4]} /></InteractiveShape> }
function GDOrb(p) { return <InteractiveShape {...p}><torusGeometry args={[0.5, 0.18, 16, 48]} /></InteractiveShape> }
function GDDiamond(p) { return <InteractiveShape {...p}><octahedronGeometry args={[0.45, 0]} /></InteractiveShape> }

const DEFAULT_SHAPES = [
  { type: 'cube', position: [-3.5, 2, -2], color: '#00ffff' },
  { type: 'cube', position: [4, -1.5, -3], color: '#ff00ff' },
  { type: 'ship', position: [1, 3, -2], color: '#00ff88' },
  { type: 'ship', position: [-2, -2.5, -1], color: '#ff8800' },
  { type: 'ball', position: [3, 2.5, -1], color: '#ffff00' },
  { type: 'ball', position: [-4, 0.5, -2], color: '#ff6600' },
  { type: 'ufo', position: [-1, -2, -3], color: '#cc44ff' },
  { type: 'wave', position: [2, -3, -2], color: '#00ccff' },
  { type: 'spike', position: [0, 0.5, -3], color: '#ff4444' },
  { type: 'spike', position: [-3, 1, -4], color: '#ff0044' },
  { type: 'orb', position: [4, 1, -4], color: '#ffff00' },
  { type: 'diamond', position: [2.5, 3.5, -5], color: '#00ccff' },
]

const SHAPE_MAP = { cube: GDCube, ship: GDShip, ball: GDBall, ufo: GDUFO, wave: GDWave, spike: GDSpike, orb: GDOrb, diamond: GDDiamond }

function ShapeRenderer({ shape, drag }) {
  const C = SHAPE_MAP[shape.type] || GDCube
  return <C position={shape.position} color={shape.color} drag={drag} />
}

function SceneContent({ shapes }) {
  const drag = useDragStore()
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} color="#00ffff" intensity={2} />
      <pointLight position={[-5, -3, 3]} color="#ff00ff" intensity={1.5} />
      <pointLight position={[0, 3, -5]} color="#ffff00" intensity={1} />
      <DragCatcher drag={drag} />
      {shapes.map((s, i) => <ShapeRenderer key={`${s.type}-${i}`} shape={s} drag={drag} />)}
      <ReactiveParticles />
      <Stars radius={50} depth={50} count={800} factor={4} saturation={1} fade speed={1.5} />
    </>
  )
}

// ─── Secret Menu ───
function SecretMenu({ shapes, setShapes, open, setOpen }) {
  const [username, setUsername] = useState(() => localStorage.getItem('dr-username') || '')
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState(null)

  const handleLookup = async () => {
    if (!username.trim()) return
    setProfileLoading(true); setProfileError(null)
    localStorage.setItem('dr-username', username.trim())
    try { setProfile(await searchPlayer(username.trim())) }
    catch { setProfileError('Player not found'); setProfile(null) }
    finally { setProfileLoading(false) }
  }

  const addPlayerCube = () => {
    if (!username.trim()) return
    setShapes(prev => [...prev, { type: 'cube', position: [(Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3, -2], color: '#00ffff' }])
  }

  useEffect(() => { if (open && username && !profile && !profileLoading) handleLookup() }, [open])

  const addShape = (type, color) => {
    setShapes(prev => [...prev, { type, position: [(Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4, -2 - Math.random() * 3], color }])
  }

  if (!open) return null

  return (
    <div className="fixed top-16 right-4 z-[100] rounded-2xl p-5 w-80 max-h-[80vh] overflow-y-auto"
      style={{ background: 'rgba(5,5,20,0.95)', border: '1px solid rgba(0,255,255,0.3)', backdropFilter: 'blur(20px)', boxShadow: '0 0 40px rgba(0,255,255,0.15)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#00ffff' }}>Secret Menu</h3>
        <button onClick={() => setOpen(false)} className="text-xs" style={{ color: '#6b7280' }}>ESC</button>
      </div>
      {profile && (
        <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(0,255,255,0.05)', border: '1px solid rgba(0,255,255,0.15)' }}>
          <div className="flex items-center gap-3 mb-2">
            <img src={getPlayerIconURL(profile.username)} alt="" className="w-12 h-12 rounded-lg" style={{ background: '#111' }} />
            <div>
              <div className="font-bold text-white text-sm">{profile.username}</div>
              <div className="text-xs" style={{ color: '#00ffff' }}>Rank #{profile.rank || '???'}</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1 text-center">
            {[{ v: profile.stars, l: '★', c: '#ffff00' }, { v: profile.demons, l: '👿', c: '#ff4444' }, { v: profile.cp, l: 'Cr.Pts', c: '#00ff88' }, { v: profile.diamonds, l: '💎', c: '#00ccff' }].map(s => (
              <div key={s.l} className="text-xs"><div className="font-bold" style={{ color: s.c }}>{Number(s.v || 0).toLocaleString()}</div><div style={{ color: '#6b7280', fontSize: '9px' }}>{s.l}</div></div>
            ))}
          </div>
          <button onClick={addPlayerCube} className="w-full mt-2 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #00ffff22, #ff00ff22)', border: '1px solid #00ffff33', color: '#00ffff' }}>Add Cube to Scene</button>
        </div>
      )}
      <div className="mb-4">
        <label className="text-xs block mb-1" style={{ color: '#9ca3af' }}>Your GD Username</label>
        <div className="flex gap-2">
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            placeholder="Enter username..." className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,255,255,0.2)', color: '#fff' }} />
          <button onClick={handleLookup} disabled={profileLoading} className="px-3 py-2 rounded-lg text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #00ffff, #ff00ff)', color: '#000' }}>{profileLoading ? '...' : 'Go'}</button>
        </div>
        {profileError && <div className="text-xs mt-1" style={{ color: '#ff4444' }}>{profileError}</div>}
      </div>
      <div className="mb-4">
        <label className="text-xs block mb-2" style={{ color: '#9ca3af' }}>Add GD Objects</label>
        <div className="grid grid-cols-4 gap-1.5">
          {[{ type: 'cube', label: 'Cube', color: '#00ffff' }, { type: 'ship', label: 'Ship', color: '#00ff88' }, { type: 'ball', label: 'Ball', color: '#ffff00' }, { type: 'ufo', label: 'UFO', color: '#cc44ff' }, { type: 'wave', label: 'Wave', color: '#00ccff' }, { type: 'spike', label: 'Spike', color: '#ff4444' }, { type: 'orb', label: 'Orb', color: '#ff00ff' }, { type: 'diamond', label: 'Gem', color: '#ffcc00' }].map(s => (
            <button key={s.type} onClick={() => addShape(s.type, s.color)} className="px-1.5 py-1.5 rounded-lg text-[10px] font-bold hover:scale-105 transition-transform"
              style={{ background: `${s.color}15`, border: `1px solid ${s.color}33`, color: s.color }}>{s.label}</button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs" style={{ color: '#6b7280' }}>Objects: <span style={{ color: '#00ffff' }}>{shapes.length}</span></span>
        <button onClick={() => setShapes(DEFAULT_SHAPES)} className="px-3 py-1 rounded-lg text-xs font-bold"
          style={{ background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444' }}>Reset</button>
      </div>
      <div className="text-center text-[10px]" style={{ color: '#4b5563' }}>↑ ← ↓ → to toggle</div>
    </div>
  )
}

export default function Scene3D() {
  const [shapes, setShapes] = useState(DEFAULT_SHAPES)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const PATTERN = ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight']
    let buffer = []
    let timer = null
    const handler = (e) => {
      if (e.key === 'Escape') { setMenuOpen(false); return }
      if (PATTERN.includes(e.key)) {
        buffer.push(e.key)
        clearTimeout(timer)
        timer = setTimeout(() => { buffer = [] }, 2000)
        if (buffer.length >= PATTERN.length && buffer.slice(-4).every((k, i) => k === PATTERN[i])) {
          e.preventDefault(); setMenuOpen(prev => !prev); buffer = []
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => { window.removeEventListener('keydown', handler); clearTimeout(timer) }
  }, [])

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ position: 'absolute', inset: 0 }}
        raycaster={{ params: { Points: { threshold: 0.5 } } }}
      >
        <SceneContent shapes={shapes} />
      </Canvas>
      <SecretMenu shapes={shapes} setShapes={setShapes} open={menuOpen} setOpen={setMenuOpen} />
    </>
  )
}
