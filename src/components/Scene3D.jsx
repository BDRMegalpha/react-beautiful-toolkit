import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import { searchPlayer, getPlayerIconURL } from '../api/gd'

// ─── Draggable shape with hover jiggle + throw physics ───
function InteractiveShape({ position, color, children }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)
  const dragging = useRef(false)
  const velocity = useRef(new THREE.Vector3())
  const prevMouse = useRef(new THREE.Vector3())
  const basePos = useRef(new THREE.Vector3(...position))
  const { camera, gl } = useThree()

  const getWorldPos = useCallback((clientX, clientY) => {
    const rect = gl.domElement.getBoundingClientRect()
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    )
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(ndc, camera)
    const z = ref.current ? ref.current.position.z : position[2]
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -z)
    const target = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, target)
    return target
  }, [camera, gl, position])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime

    if (hovered && !dragging.current) {
      ref.current.rotation.x += Math.sin(t * 12) * 0.02
      ref.current.rotation.y += Math.cos(t * 10) * 0.02
      ref.current.scale.setScalar(1.15 + Math.sin(t * 8) * 0.05)
    } else if (!dragging.current) {
      ref.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.05)
    }

    if (dragging.current) {
      ref.current.scale.setScalar(1.2)
    }

    if (!dragging.current && velocity.current.length() > 0.001) {
      ref.current.position.add(velocity.current)
      velocity.current.multiplyScalar(0.95)
      ref.current.rotation.x += velocity.current.x * 0.5
      ref.current.rotation.y += velocity.current.y * 0.5
      const drift = basePos.current.clone().sub(ref.current.position).multiplyScalar(0.003)
      ref.current.position.add(drift)
    }

    if (!dragging.current && velocity.current.length() < 0.001) {
      ref.current.position.y = basePos.current.y + Math.sin(t * 0.5 + basePos.current.x) * 0.3
      ref.current.rotation.y += 0.003
    }
  })

  const onPointerDown = useCallback((e) => {
    e.stopPropagation()
    const ne = e.nativeEvent || e
    dragging.current = true
    velocity.current.set(0, 0, 0)
    prevMouse.current.copy(getWorldPos(ne.clientX, ne.clientY))
    gl.domElement.style.cursor = 'grabbing'
    try { gl.domElement.setPointerCapture(ne.pointerId) } catch (_) {}

    const onMove = (ev) => {
      if (!dragging.current || !ref.current) return
      const worldPos = getWorldPos(ev.clientX, ev.clientY)
      const delta = worldPos.clone().sub(prevMouse.current)
      ref.current.position.add(delta)
      velocity.current.copy(delta.multiplyScalar(0.8))
      prevMouse.current.copy(getWorldPos(ev.clientX, ev.clientY))
    }
    const onUp = (ev) => {
      dragging.current = false
      gl.domElement.style.cursor = 'default'
      try { gl.domElement.releasePointerCapture(ev.pointerId) } catch (_) {}
      gl.domElement.removeEventListener('pointermove', onMove)
      gl.domElement.removeEventListener('pointerup', onUp)
    }
    gl.domElement.addEventListener('pointermove', onMove)
    gl.domElement.addEventListener('pointerup', onUp)
  }, [getWorldPos, gl])

  return (
    <mesh
      ref={ref}
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); gl.domElement.style.cursor = 'grab' }}
      onPointerOut={() => { setHovered(false); if (!dragging.current) gl.domElement.style.cursor = 'default' }}
      onPointerDown={onPointerDown}
    >
      {children}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hovered ? 1.2 : 0.6}
        transparent
        opacity={hovered ? 0.95 : 0.8}
      />
    </mesh>
  )
}

// ─── GD-themed shapes ───
function GDCube(props) { return <InteractiveShape {...props}><boxGeometry args={[1, 1, 1]} /></InteractiveShape> }
function GDDiamond(props) { return <InteractiveShape {...props}><octahedronGeometry args={[0.6, 0]} /></InteractiveShape> }
function GDOrb(props) { return <InteractiveShape {...props}><sphereGeometry args={[0.5, 32, 32]} /></InteractiveShape> }
function GDSpike(props) { return <InteractiveShape {...props}><coneGeometry args={[0.6, 1.2, 4]} /></InteractiveShape> }
function GDRing(props) { return <InteractiveShape {...props}><torusGeometry args={[0.6, 0.15, 16, 48]} /></InteractiveShape> }
function GDStar(props) { return <InteractiveShape {...props}><dodecahedronGeometry args={[0.5, 0]} /></InteractiveShape> }
function GDPortal(props) { return <InteractiveShape {...props}><torusGeometry args={[0.7, 0.1, 8, 6]} /></InteractiveShape> }

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
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#00ffff" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

const DEFAULT_SHAPES = [
  { type: 'cube', position: [-3.5, 2, -2], color: '#00ffff' },
  { type: 'cube', position: [4, -1.5, -3], color: '#ff00ff' },
  { type: 'diamond', position: [1, 3, -2], color: '#00ccff' },
  { type: 'diamond', position: [-2, -2.5, -1], color: '#ffcc00' },
  { type: 'orb', position: [3, 2.5, -1], color: '#ffff00' },
  { type: 'orb', position: [-4, 0.5, -2], color: '#ff6600' },
  { type: 'spike', position: [-1, -2, -3], color: '#ff00ff' },
  { type: 'spike', position: [2, -3, -2], color: '#ff4444' },
  { type: 'ring', position: [0, 0.5, -3], color: '#ff00ff' },
  { type: 'ring', position: [-3, 1, -4], color: '#00ff88' },
  { type: 'star', position: [4, 1, -4], color: '#ffff00' },
  { type: 'portal', position: [2.5, 3.5, -5], color: '#cc44ff' },
]

function ShapeRenderer({ shape }) {
  const C = { cube: GDCube, diamond: GDDiamond, orb: GDOrb, spike: GDSpike, ring: GDRing, star: GDStar, portal: GDPortal }[shape.type] || GDCube
  return <C position={shape.position} color={shape.color} />
}

function SceneContent({ shapes }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[5, 5, 5]} color="#00ffff" intensity={2} />
      <pointLight position={[-5, -3, 3]} color="#ff00ff" intensity={1.5} />
      <pointLight position={[0, 3, -5]} color="#ffff00" intensity={1} />
      {shapes.map((s, i) => <ShapeRenderer key={`${s.type}-${i}`} shape={s} />)}
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
    setProfileLoading(true)
    setProfileError(null)
    localStorage.setItem('dr-username', username.trim())
    try {
      const data = await searchPlayer(username.trim())
      setProfile(data)
    } catch {
      setProfileError('Player not found')
      setProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }

  // Auto-load saved username on open
  useEffect(() => {
    if (open && username && !profile && !profileLoading) {
      handleLookup()
    }
  }, [open])

  const addShape = (type, color) => {
    setShapes(prev => [...prev, {
      type,
      position: [(Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4, -2 - Math.random() * 3],
      color,
    }])
  }

  if (!open) return null

  return (
    <div
      className="fixed top-16 right-4 z-[100] rounded-2xl p-5 w-80 max-h-[80vh] overflow-y-auto"
      style={{
        background: 'rgba(5, 5, 20, 0.95)',
        border: '1px solid rgba(0, 255, 255, 0.3)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 0 40px rgba(0, 255, 255, 0.15)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#00ffff' }}>Secret Menu</h3>
        <button onClick={() => setOpen(false)} className="text-xs" style={{ color: '#6b7280' }}>ESC</button>
      </div>

      {/* Profile Section */}
      {profile && (
        <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(0,255,255,0.05)', border: '1px solid rgba(0,255,255,0.15)' }}>
          <div className="flex items-center gap-3 mb-2">
            <img
              src={getPlayerIconURL(profile.username)}
              alt={profile.username}
              className="w-12 h-12 rounded-lg"
              style={{ background: '#111', imageRendering: 'pixelated' }}
            />
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
        </div>
      )}

      {/* Username Input */}
      <div className="mb-4">
        <label className="text-xs block mb-1" style={{ color: '#9ca3af' }}>Your GD Username</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            placeholder="Enter username..."
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,255,255,0.2)', color: '#fff' }}
          />
          <button
            onClick={handleLookup}
            disabled={profileLoading}
            className="px-3 py-2 rounded-lg text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #00ffff, #ff00ff)', color: '#000' }}
          >
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
            { type: 'diamond', label: 'Diamond', color: '#00ccff' },
            { type: 'orb', label: 'Orb', color: '#ffff00' },
            { type: 'spike', label: 'Spike', color: '#ff4444' },
            { type: 'ring', label: 'Ring', color: '#ff00ff' },
            { type: 'star', label: 'Star', color: '#ffcc00' },
            { type: 'portal', label: 'Portal', color: '#cc44ff' },
          ].map(s => (
            <button
              key={s.type}
              onClick={() => addShape(s.type, s.color)}
              className="px-2 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105"
              style={{ background: `${s.color}15`, border: `1px solid ${s.color}33`, color: s.color }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="mb-4">
        <label className="text-xs block mb-2" style={{ color: '#9ca3af' }}>Custom Color</label>
        <div className="flex gap-2">
          {['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#ff8800', '#8800ff'].map(c => (
            <button
              key={c}
              onClick={() => addShape('cube', c)}
              className="w-7 h-7 rounded-lg border-2 hover:scale-110 transition-transform"
              style={{ background: c, borderColor: `${c}88` }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs" style={{ color: '#6b7280' }}>Objects: <span style={{ color: '#00ffff' }}>{shapes.length}</span></span>
        <button
          onClick={() => setShapes(DEFAULT_SHAPES)}
          className="px-3 py-1 rounded-lg text-xs font-bold"
          style={{ background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444' }}
        >
          Reset
        </button>
      </div>

      <div className="text-center text-xs" style={{ color: '#4b5563' }}>
        ↑ ← ↓ → to toggle
      </div>
    </div>
  )
}

// ─── Main Export ───
export default function Scene3D() {
  const [shapes, setShapes] = useState(DEFAULT_SHAPES)
  const [menuOpen, setMenuOpen] = useState(false)

  // Arrow key pattern: Up, Left, Down, Right
  useEffect(() => {
    const PATTERN = ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight']
    let buffer = []
    let timer = null

    const handler = (e) => {
      if (e.key === 'Escape') { setMenuOpen(false); return }

      if (PATTERN.includes(e.key)) {
        buffer.push(e.key)
        clearTimeout(timer)
        timer = setTimeout(() => { buffer = [] }, 2000) // reset after 2s of inactivity

        if (buffer.length >= PATTERN.length) {
          const last4 = buffer.slice(-PATTERN.length)
          if (last4.every((k, i) => k === PATTERN[i])) {
            e.preventDefault()
            setMenuOpen(prev => !prev)
            buffer = []
          }
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
