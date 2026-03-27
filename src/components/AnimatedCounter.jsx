import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

export default function AnimatedCounter({ end, duration = 2, suffix = '', prefix = '', label, color = '#00ffff' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = end / (duration * 60)
    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [inView, end, duration])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div
        style={{
          fontSize: '3rem',
          fontWeight: 900,
          color: '#fff',
          textShadow: `0 0 10px ${color}, 0 0 30px ${color}, 0 0 60px ${color}`,
          fontFamily: 'monospace',
        }}
      >
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
        {label}
      </div>
    </motion.div>
  )
}
