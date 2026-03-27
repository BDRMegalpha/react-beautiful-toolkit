import { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import { searchPlayer, getPlayerIconURL } from '../api/gd'

// ─── Global drag state shared between shapes and the drag plane ───
const dragState = {
  active: false,
  meshRef: null,
  offset: new THREE.Vector3(),
  velocity: new THREE.Vector3(),
  prevPoint: new THREE.Vector3(),
}

// ─── Invisible plane that catches pointer events during drag ───
function DragPlane() {
  const { camera } = useThree()
  const planeRef = useRef()

  useFrame(() => {
    if (planeRef.current) {
      // Always face the camera
      planeRef.current.quaternion.copy(camera.quaternion)
    }
  })

  const onMove = useCallback((e) => {
    if (!dragState.active || !dragState.meshRef?.current) return
    e.stopPropagation()
    const point = e.point.clone()
    const delta = point.clone().sub(dragState.prevPoint)
    dragState.velocity.copy(delta)
    dragState.meshRef.current.position.add(delta)
    dragState.prevPoint.copy(point)
  }, [])

  const onUp = useCallback((e) => {
    if (!dragState.active) return
    e.stopPropagation()
    dragState.active = false
    dragState.meshRef = null
    document.body.style.cursor = 'default'
  }, [])

  return (
    <mesh ref={planeRef} visible={false} onPointerMove={onMove} onPointerUp={onUp}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
    </mesh>
  )
}

// ─── Interactive shape with hover jiggle + drag/throw ───
function InteractiveShape({ position, color, children }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)
  const isDragging = useRef(false)
  const basePos = useRef(new THREE.Vector3(...position))
  const localVelocity = useRef(new THREE.Vector3())
  const throwTimer = useRef(0)

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime

    // While being dragged by the global drag system
    if (dragState.active && dragState.meshRef?.current === ref.current) {
      isDragging.current = true
      ref.current.scale.setScalar(1.25)
      localVelocity.current.copy(dragState.velocity)
      return
    }

    // Just released — apply throw velocity
    if (isDragging.current) {
      isDragging.current = false
      throwTimer.current = 3 // seconds of throw physics
    }

    // Throw physics
    if (throwTimer.current > 0) {
      throwTimer.current -= 0.016
      ref.current.position.add(localVelocity.current)
      localVelocity.current.multiplyScalar(0.94)
      ref.current.rotation.x += localVelocity.current.x * 2
      ref.current.rotation.y += localVelocity.current.y * 2
      // Drift back to base
      const drift = basePos.current.clone().sub(ref.current.position).multiplyScalar(0.005)
      ref.current.position.add(drift)
      ref.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.05)
      return
    }

    // Hover jiggle
    if (hovered) {
      ref.current.rotation.x += Math.sin(t * 15) * 0.03
      ref.current.rotation.y += Math.cos(t * 12) * 0.03
      ref.current.scale.setScalar(1.2 + Math.sin(t * 10) * 0.08)
    } else {
      ref.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.05)
    }

    // Gentle idle float
    ref.current.position.y = basePos.current.y + Math.sin(t * 0.5 + basePos.current.x) * 0.3
    ref.current.rotation.y += 0.004
  })

  const onPointerDown = useCallback((e) => {
    e.stopPropagation()
    dragState.active = true
    dragState.meshRef = ref
    dragState.prevPoint.copy(e.point)
    dragState.velocity.set(0, 0, 0)
    localVelocity.current.set(0, 0, 0)
    throwTimer.current = 0
    document.body.style.cursor = 'grabbing'
  }, [])

  return (
    <mesh
      ref={ref}
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); if (!dragState.active) document.body.style.cursor = 'grab' }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); if (!dragState.active) document.body.style.cursor = 'default' }}
      onPointerDown={onPointerDown}
    >
      {children}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hovered || isDragging.current ? 1.4 : 0.6}
        transparent
        opacity={hovered ? 0.95 : 0.8}
      />
    </mesh>
  )
}

// ─── Player icon cube ───
function PlayerIconCube({ position }) {
  return (
    <InteractiveShape position={position} color="#ffffff">
      <boxGeometry args={[1.2, 1.2, 1.2]} />
    </InteractiveShape>
  )
}

// ─── Actual GD shapes ───

// Cube mode icon - the classic square player
function GDCube(props) { return <InteractiveShape {...props}><boxGeometry args={[1, 1, 1]} /></InteractiveShape> }

// Ship mode - triangular wedge (like the GD ship)
function GDShip(props) {
  return (
    <InteractiveShape {...props}>
      <coneGeometry args={[0.7, 1.4, 3]} />
    </InteractiveShape>
  )
}

// Ball mode - sphere that rolls
function GDBall(props) { return <InteractiveShape {...props}><sphereGeometry args={[0.55, 32, 32]} /></InteractiveShape> }

// UFO mode - flat disc/saucer
function GDUFO(props) {
  return (
    <InteractiveShape {...props}>
      <cylinderGeometry args={[0.7, 0.7, 0.2, 32]} />
    </InteractiveShape>
  )
}

// Wave mode - thin dart/diamond shape
function GDWave(props) {
  return (
    <InteractiveShape {...props}>
      <octahedronGeometry args={[0.5, 0]} />
    </InteractiveShape>
  )
}

// Spike - the classic triangle obstacle
function GDSpike(props) {
  return (
    <InteractiveShape {...props}>
      <coneGeometry args={[0.5, 1.2, 4]} />
    </InteractiveShape>
  )
}

// Jump Orb - the ring you tap to jump
function GDOrb(props) { return <InteractiveShape {...props}><torusGeometry args={[0.5, 0.18, 16, 48]} /></InteractiveShape> }

// Diamond pickup
function GDDiamond(props) { return <InteractiveShape {...props}><octahedronGeometry args={[0.45, 0]} /></InteractiveShape> }

function FloatingParticles() {
  const count = 200
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 30
    return pos
  }, [])
  const ref = useRef()
  useFrame((state) => { ref.current.rotation.y = state.clock.elapsedTime * 0.02 })
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial size={0.05} color="#00ffff" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

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

function ShapeRenderer({ shape }) {
  if (shape.type === 'player') return <PlayerIconCube position={shape.position} />
  const C = SHAPE_MAP[shape.type] || GDCube
  return <C position={shape.position} color={shape.color} />
}

function SceneContent({ shapes }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[5, 5, 5]} color="#00ffff" intensity={2} />
      <pointLight position={[-5, -3, 3]} color="#ff00ff" intensity={1.5} />
      <pointLight position={[0, 3, -5]} color="#ffff00" intensity={1} />
      <DragPlane />
      {shapes.map((s, i) => <ShapeRenderer key={`${s.type}-${i}-${s.username || ''}`} shape={s} />)}
      <FloatingParticles />
      <Stars radius={50} depth={50} count={1000} factor={4} saturation={1} fade speed={1.5} />
    </>
  )
}

// ─── Secret Menu (Arrow pattern: Up Left Down Right) ───
function SecretMenu({ shapes, setShapes, open, setOpen }) {
  const [username, setUsername] = useState(() => localStorage.getItem('dr-username') || '')
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState(null)

  const handleLookup = async () => {
    if (!username.trim()) return
    setProfileLoading(true); setProfileError(null)
    localStorage.setItem('dr-username', username.trim())
    try {
      const data = await searchPlayer(username.trim())
      setProfile(data)
    } catch { setProfileError('Player not found'); setProfile(null) }
    finally { setProfileLoading(false) }
  }

  const addPlayerCube = () => {
    if (!username.trim()) return
    setShapes(prev => [...prev, {
      type: 'player',
      username: username.trim(),
      position: [(Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3, -2],
      color: '#ffffff',
    }])
  }

  useEffect(() => {
    if (open && username && !profile && !profileLoading) handleLookup()
  }, [open])

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

      {/* Profile */}
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
            {[
              { v: profile.stars, l: '★', c: '#ffff00' },
              { v: profile.demons, l: '👿', c: '#ff4444' },
              { v: profile.cp, l: 'Cr.Pts', c: '#00ff88' },
              { v: profile.diamonds, l: '💎', c: '#00ccff' },
            ].map(s => (
              <div key={s.l} className="text-xs">
                <div className="font-bold" style={{ color: s.c }}>{Number(s.v || 0).toLocaleString()}</div>
                <div style={{ color: '#6b7280', fontSize: '9px' }}>{s.l}</div>
              </div>
            ))}
          </div>
          <button onClick={addPlayerCube} className="w-full mt-2 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #00ffff22, #ff00ff22)', border: '1px solid #00ffff33', color: '#00ffff' }}>
            Add My Icon to Scene
          </button>
        </div>
      )}

      {/* Username */}
      <div className="mb-4">
        <label className="text-xs block mb-1" style={{ color: '#9ca3af' }}>Your GD Username</label>
        <div className="flex gap-2">
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()} placeholder="Enter username..."
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,255,255,0.2)', color: '#fff' }} />
          <button onClick={handleLookup} disabled={profileLoading} className="px-3 py-2 rounded-lg text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #00ffff, #ff00ff)', color: '#000' }}>
            {profileLoading ? '...' : 'Go'}
          </button>
        </div>
        {profileError && <div className="text-xs mt-1" style={{ color: '#ff4444' }}>{profileError}</div>}
      </div>

      {/* Add Shapes */}
      <div className="mb-4">
        <label className="text-xs block mb-2" style={{ color: '#9ca3af' }}>Add GD Objects</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { type: 'cube', label: 'Cube', color: '#00ffff' },
            { type: 'ship', label: 'Ship', color: '#00ff88' },
            { type: 'ball', label: 'Ball', color: '#ffff00' },
            { type: 'ufo', label: 'UFO', color: '#cc44ff' },
            { type: 'wave', label: 'Wave', color: '#00ccff' },
            { type: 'spike', label: 'Spike', color: '#ff4444' },
            { type: 'orb', label: 'Orb', color: '#ff00ff' },
            { type: 'diamond', label: 'Diamond', color: '#ffcc00' },
          ].map(s => (
            <button key={s.type} onClick={() => addShape(s.type, s.color)}
              className="px-2 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105"
              style={{ background: `${s.color}15`, border: `1px solid ${s.color}33`, color: s.color }}>{s.label}</button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs" style={{ color: '#6b7280' }}>Objects: <span style={{ color: '#00ffff' }}>{shapes.length}</span></span>
        <button onClick={() => setShapes(DEFAULT_SHAPES)} className="px-3 py-1 rounded-lg text-xs font-bold"
          style={{ background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444' }}>Reset</button>
      </div>
      <div className="text-center text-xs" style={{ color: '#4b5563' }}>↑ ← ↓ → to toggle</div>
    </div>
  )
}

// ─── Main Export ───
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
        if (buffer.length >= PATTERN.length) {
          const last4 = buffer.slice(-PATTERN.length)
          if (last4.every((k, i) => k === PATTERN[i])) { e.preventDefault(); setMenuOpen(prev => !prev); buffer = [] }
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => { window.removeEventListener('keydown', handler); clearTimeout(timer) }
  }, [])

  return (
    <>
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} style={{ position: 'absolute', inset: 0 }}>
        <SceneContent shapes={shapes} />
      </Canvas>
      <SecretMenu shapes={shapes} setShapes={setShapes} open={menuOpen} setOpen={setMenuOpen} />
    </>
  )
}
