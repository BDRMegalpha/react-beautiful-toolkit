import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Stars, Text } from '@react-three/drei'
import * as THREE from 'three'

// ─── Draggable shape with hover jiggle + throw physics ───
function InteractiveShape({ position, color, children, shape = 'box' }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const velocity = useRef(new THREE.Vector3())
  const prevMouse = useRef(new THREE.Vector3())
  const basePos = useRef(new THREE.Vector3(...position))
  const { camera, gl } = useThree()

  // Jiggle on hover
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime

    if (hovered && !dragging) {
      ref.current.rotation.x += Math.sin(t * 12) * 0.02
      ref.current.rotation.y += Math.cos(t * 10) * 0.02
      ref.current.scale.setScalar(1.15 + Math.sin(t * 8) * 0.05)
    } else if (!dragging) {
      ref.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.05)
    }

    // Apply velocity when thrown
    if (!dragging && velocity.current.length() > 0.001) {
      ref.current.position.add(velocity.current)
      velocity.current.multiplyScalar(0.96) // friction
      ref.current.rotation.x += velocity.current.x * 0.5
      ref.current.rotation.y += velocity.current.y * 0.5

      // Slowly drift back to base position
      const drift = basePos.current.clone().sub(ref.current.position).multiplyScalar(0.002)
      ref.current.position.add(drift)
    }

    // Gentle float when idle
    if (!dragging && velocity.current.length() < 0.001) {
      ref.current.position.y = basePos.current.y + Math.sin(t * 0.5 + basePos.current.x) * 0.3
      ref.current.rotation.y += 0.003
    }
  })

  const getWorldPos = useCallback((e) => {
    const ndc = new THREE.Vector2(
      (e.clientX / gl.domElement.clientWidth) * 2 - 1,
      -(e.clientY / gl.domElement.clientHeight) * 2 + 1,
    )
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(ndc, camera)
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -ref.current.position.z)
    const target = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, target)
    return target
  }, [camera, gl])

  const onPointerDown = useCallback((e) => {
    e.stopPropagation()
    setDragging(true)
    velocity.current.set(0, 0, 0)
    prevMouse.current.copy(getWorldPos(e))
    gl.domElement.style.cursor = 'grabbing'
    gl.domElement.setPointerCapture(e.pointerId)
  }, [getWorldPos, gl])

  const onPointerMove = useCallback((e) => {
    if (!dragging || !ref.current) return
    const worldPos = getWorldPos(e)
    const delta = worldPos.clone().sub(prevMouse.current)
    ref.current.position.add(delta)
    velocity.current.copy(delta.multiplyScalar(0.8))
    prevMouse.current.copy(worldPos)
  }, [dragging, getWorldPos])

  const onPointerUp = useCallback((e) => {
    setDragging(false)
    gl.domElement.style.cursor = hovered ? 'grab' : 'default'
    gl.domElement.releasePointerCapture(e.pointerId)
  }, [gl, hovered])

  useEffect(() => {
    const el = gl.domElement
    const move = (e) => onPointerMove(e)
    const up = (e) => onPointerUp(e)
    if (dragging) {
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerup', up)
    }
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
    }
  }, [dragging, gl, onPointerMove, onPointerUp])

  return (
    <mesh
      ref={ref}
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); gl.domElement.style.cursor = 'grab' }}
      onPointerOut={() => { setHovered(false); if (!dragging) gl.domElement.style.cursor = 'default' }}
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
function GDCube(props) {
  return (
    <InteractiveShape {...props} shape="box">
      <boxGeometry args={[1, 1, 1]} />
    </InteractiveShape>
  )
}

function GDDiamond({ position, color }) {
  return (
    <InteractiveShape position={position} color={color}>
      <octahedronGeometry args={[0.6, 0]} />
    </InteractiveShape>
  )
}

function GDOrb({ position, color }) {
  return (
    <InteractiveShape position={position} color={color}>
      <sphereGeometry args={[0.5, 32, 32]} />
    </InteractiveShape>
  )
}

function GDSpike({ position, color }) {
  return (
    <InteractiveShape position={position} color={color}>
      <coneGeometry args={[0.6, 1.2, 4]} />
    </InteractiveShape>
  )
}

function GDRing({ position, color }) {
  return (
    <InteractiveShape position={position} color={color}>
      <torusGeometry args={[0.6, 0.15, 16, 48]} />
    </InteractiveShape>
  )
}

function GDStar({ position, color }) {
  return (
    <InteractiveShape position={position} color={color}>
      <dodecahedronGeometry args={[0.5, 0]} />
    </InteractiveShape>
  )
}

function GDPortal({ position, color }) {
  return (
    <InteractiveShape position={position} color={color}>
      <torusGeometry args={[0.7, 0.1, 8, 6]} />
    </InteractiveShape>
  )
}

// ─── Floating particles ───
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

// ─── Default scene shapes ───
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
  { type: 'star', position: [-4, -1.5, -3], color: '#00ffff' },
  { type: 'portal', position: [2.5, 3.5, -5], color: '#cc44ff' },
]

function ShapeRenderer({ shape }) {
  const Component = {
    cube: GDCube, diamond: GDDiamond, orb: GDOrb,
    spike: GDSpike, ring: GDRing, star: GDStar, portal: GDPortal,
  }[shape.type] || GDCube
  return <Component position={shape.position} color={shape.color} />
}

function SceneContent({ shapes }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[5, 5, 5]} color="#00ffff" intensity={2} />
      <pointLight position={[-5, -3, 3]} color="#ff00ff" intensity={1.5} />
      <pointLight position={[0, 3, -5]} color="#ffff00" intensity={1} />
      {shapes.map((s, i) => <ShapeRenderer key={i} shape={s} />)}
      <FloatingParticles />
      <Stars radius={50} depth={50} count={1000} factor={4} saturation={1} fade speed={1.5} />
    </>
  )
}

// ─── Secret Menu (Ctrl+Shift+D) ───
function SecretMenu({ shapes, setShapes, open, setOpen }) {
  const [username, setUsername] = useState('')

  const addShape = (type, color) => {
    setShapes(prev => [...prev, {
      type,
      position: [(Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4, -2 - Math.random() * 3],
      color,
    }])
  }

  const resetShapes = () => setShapes(DEFAULT_SHAPES)

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
        <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#00ffff' }}>
          Secret Menu
        </h3>
        <button onClick={() => setOpen(false)} className="text-xs" style={{ color: '#6b7280' }}>ESC to close</button>
      </div>

      {/* Username */}
      <div className="mb-4">
        <label className="text-xs block mb-1" style={{ color: '#9ca3af' }}>Your GD Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username..."
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,255,255,0.2)', color: '#fff' }}
        />
      </div>

      {/* Add shapes */}
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

      {/* Color picker for custom shapes */}
      <div className="mb-4">
        <label className="text-xs block mb-2" style={{ color: '#9ca3af' }}>Custom Color Shape</label>
        <div className="flex gap-2">
          {['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#ff8800', '#8800ff'].map(c => (
            <button
              key={c}
              onClick={() => addShape('cube', c)}
              className="w-8 h-8 rounded-lg border-2 hover:scale-110 transition-transform"
              style={{ background: c, borderColor: `${c}88` }}
            />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 text-xs" style={{ color: '#6b7280' }}>
        Objects in scene: <span style={{ color: '#00ffff' }}>{shapes.length}</span>
      </div>

      {/* Reset */}
      <button
        onClick={resetShapes}
        className="w-full px-3 py-2 rounded-lg text-xs font-bold"
        style={{ background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444' }}
      >
        Reset to Default
      </button>

      <div className="mt-3 text-center text-xs" style={{ color: '#4b5563' }}>
        Ctrl+Shift+D to toggle
      </div>
    </div>
  )
}

// ─── Main Export ───
export default function Scene3D() {
  const [shapes, setShapes] = useState(DEFAULT_SHAPES)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        setMenuOpen(prev => !prev)
      }
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
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
