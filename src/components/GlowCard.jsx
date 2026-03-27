import { motion } from 'framer-motion'
import { useState } from 'react'

export default function GlowCard({ children, color = '#00ffff', delay = 0, className = '' }) {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.03, y: -8 }}
      onMouseMove={handleMouseMove}
      className={className}
      style={{
        position: 'relative',
        borderRadius: '16px',
        padding: '2px',
        background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, ${color}66, transparent 50%)`,
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          borderRadius: '14px',
          padding: '24px',
          background: 'rgba(10, 10, 30, 0.9)',
          backdropFilter: 'blur(20px)',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
    </motion.div>
  )
}
