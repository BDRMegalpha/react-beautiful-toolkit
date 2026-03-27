import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Stars } from '@react-three/drei'
import * as THREE from 'three'

function NeonCube({ position, color, speed = 1 }) {
  const ref = useRef()
  useFrame((state) => {
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * speed) * 0.5
    ref.current.rotation.y += 0.01 * speed
  })
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={ref} position={position}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.85} />
      </mesh>
    </Float>
  )
}

function NeonSphere({ position, color }) {
  const ref = useRef()
  useFrame((state) => {
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.5
  })
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.6, 32, 32]} />
      <MeshDistortMaterial color={color} emissive={color} emissiveIntensity={0.6} speed={3} distort={0.4} transparent opacity={0.7} />
    </mesh>
  )
}

function NeonPyramid({ position, color }) {
  const ref = useRef()
  useFrame((state) => {
    ref.current.rotation.y += 0.015
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.3
  })
  return (
    <Float speed={1.5} floatIntensity={1.5}>
      <mesh ref={ref} position={position}>
        <coneGeometry args={[0.8, 1.4, 4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} transparent opacity={0.8} />
      </mesh>
    </Float>
  )
}

function NeonRing({ position, color }) {
  const ref = useRef()
  useFrame((state) => {
    ref.current.rotation.x += 0.02
    ref.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.5) * 0.5
  })
  return (
    <Float speed={1} floatIntensity={2}>
      <mesh ref={ref} position={position}>
        <torusGeometry args={[0.7, 0.15, 16, 48]} />
        <MeshWobbleMaterial color={color} emissive={color} emissiveIntensity={0.9} speed={2} factor={0.3} transparent opacity={0.8} />
      </mesh>
    </Float>
  )
}

function FloatingParticles() {
  const count = 200
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 30
    }
    return pos
  }, [])
  const ref = useRef()
  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.02
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#00ffff" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

export default function Scene3D() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 60 }} style={{ position: 'absolute', inset: 0 }}>
      <ambientLight intensity={0.15} />
      <pointLight position={[5, 5, 5]} color="#00ffff" intensity={2} />
      <pointLight position={[-5, -3, 3]} color="#ff00ff" intensity={1.5} />
      <pointLight position={[0, 3, -5]} color="#ffff00" intensity={1} />

      <NeonCube position={[-3.5, 2, -2]} color="#00ffff" speed={0.8} />
      <NeonCube position={[4, -1.5, -3]} color="#ff00ff" speed={1.2} />
      <NeonCube position={[1, 3, -4]} color="#00ff88" speed={0.6} />

      <NeonSphere position={[3, 2.5, -1]} color="#ffff00" />
      <NeonSphere position={[-2, -2, -2]} color="#ff6600" />

      <NeonPyramid position={[-4, -1, -3]} color="#ff00ff" />
      <NeonPyramid position={[2, -3, -2]} color="#00ffff" />

      <NeonRing position={[0, 0, -3]} color="#ff00ff" />
      <NeonRing position={[-3, 1, -5]} color="#00ff88" />
      <NeonRing position={[4, 1, -4]} color="#ffff00" />

      <FloatingParticles />
      <Stars radius={50} depth={50} count={1000} factor={4} saturation={1} fade speed={1.5} />
    </Canvas>
  )
}
