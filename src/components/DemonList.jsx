import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FiLoader, FiExternalLink, FiAlertTriangle } from 'react-icons/fi'
import { getTopDemons } from '../api/gd'

export default function DemonList() {
  const [demons, setDemons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = useCallback(async () => {
    try {
      const data = await getTopDemons(20)
      setDemons(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load demon list from Pointercrate')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [loadData])

  if (loading) {
    return (
      <div className="text-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="inline-block"
        >
          <FiLoader size={32} style={{ color: '#ff4444' }} />
        </motion.div>
        <p className="mt-3 text-sm" style={{ color: '#9ca3af' }}>Loading hardest demons from Pointercrate...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 rounded-2xl" style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.2)', color: '#ff6666' }}>
        {error}
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(10, 10, 30, 0.85)',
          border: '1px solid rgba(255, 68, 68, 0.15)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 40px rgba(255, 68, 68, 0.08)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255, 68, 68, 0.1)' }}
        >
          <FiAlertTriangle style={{ color: '#ff4444' }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#ff444488' }}>
            Pointercrate Demon List — Top 20 Hardest Levels
          </span>
        </div>

        {demons.map((demon, i) => (
          <motion.div
            key={demon.id || i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
            whileHover={{ backgroundColor: 'rgba(255, 68, 68, 0.05)', x: 4 }}
            className="flex items-center gap-4 px-6 py-3 cursor-pointer"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
          >
            {/* Rank */}
            <div
              className="w-10 text-center font-black text-lg shrink-0"
              style={{
                color: i === 0 ? '#ff0044' : i < 3 ? '#ff4444' : i < 10 ? '#ff6666' : '#9ca3af',
                textShadow: i < 3 ? '0 0 10px #ff444466' : 'none',
              }}
            >
              #{demon.position || i + 1}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white truncate">{demon.name || 'Unknown'}</div>
              <div className="text-xs" style={{ color: '#9ca3af' }}>
                by <span style={{ color: '#ff6666' }}>{demon.publisher?.name || demon.verifier?.name || 'Unknown'}</span>
                {demon.verifier?.name && demon.publisher?.name !== demon.verifier?.name && (
                  <span> — verified by <span style={{ color: '#ff8888' }}>{demon.verifier.name}</span></span>
                )}
              </div>
            </div>

            {/* Level ID */}
            {demon.level_id && (
              <div className="text-xs font-mono shrink-0" style={{ color: '#6b7280' }}>
                ID: {demon.level_id}
              </div>
            )}

            {/* Link */}
            {demon.video && (
              <motion.a
                href={demon.video}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                className="shrink-0"
                style={{ color: '#ff4444' }}
                onClick={(e) => e.stopPropagation()}
              >
                <FiExternalLink size={16} />
              </motion.a>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
