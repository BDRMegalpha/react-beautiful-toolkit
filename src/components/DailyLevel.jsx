import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FiClock, FiPlay, FiHeart, FiDownload, FiLoader, FiMusic } from 'react-icons/fi'
import { getDailyLevel, getWeeklyLevel, getDifficultyColor } from '../api/gd'

function LevelCard({ level, type, accent, delay = 0 }) {
  if (!level) return null

  const diffColor = getDifficultyColor(level.difficulty)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ scale: 1.03, y: -5 }}
      onClick={() => (level.id || level.levelID) && window.open(`https://gdbrowser.com/${(level.id || level.levelID)}`, '_blank')}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        background: 'rgba(10, 10, 30, 0.9)',
        border: `1px solid ${accent}33`,
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Animated glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ boxShadow: `inset 0 0 30px ${accent}22, 0 0 30px ${accent}15` }}
      />

      {/* Type badge */}
      <div className="px-6 pt-5 pb-0 flex items-center gap-2">
        <motion.span
          className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
          style={{
            background: `${accent}22`,
            color: accent,
            border: `1px solid ${accent}44`,
            textShadow: `0 0 8px ${accent}`,
          }}
          animate={{ boxShadow: [`0 0 8px ${accent}33`, `0 0 16px ${accent}55`, `0 0 8px ${accent}33`] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <FiClock className="inline mr-1" size={10} />
          {type} Level
        </motion.span>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-2xl font-black text-white mb-1">{level.name || 'Unknown Level'}</h3>
        <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>
          by <span style={{ color: accent }}>{level.author || 'Unknown'}</span>
          {(level.id || level.levelID) && <span className="ml-2" style={{ color: '#6b7280' }}>#{(level.id || level.levelID)}</span>}
        </p>

        {/* Difficulty + Length */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <span
            className="px-3 py-1 rounded-lg text-xs font-bold"
            style={{ background: `${diffColor}22`, color: diffColor }}
          >
            {level.difficulty || 'Unrated'}
          </span>
          {level.length && (
            <span className="px-3 py-1 rounded-lg text-xs font-bold" style={{ background: '#ffffff11', color: '#ccc' }}>
              {level.length}
            </span>
          )}
          {level.stars > 0 && (
            <span className="px-3 py-1 rounded-lg text-xs font-bold" style={{ background: '#ffff0011', color: '#ffff00' }}>
              {level.stars}★
            </span>
          )}
        </div>

        {/* Song info */}
        {level.songName && (
          <div className="flex items-center gap-2 mb-4 text-xs" style={{ color: '#9ca3af' }}>
            <FiMusic size={12} style={{ color: accent }} />
            <span>{level.songName} {level.songAuthor ? `by ${level.songAuthor}` : ''}</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-6 text-sm" style={{ color: '#9ca3af' }}>
          {level.downloads != null && (
            <div className="flex items-center gap-1">
              <FiDownload size={14} style={{ color: accent }} />
              {Number(level.downloads).toLocaleString()}
            </div>
          )}
          {level.likes != null && (
            <div className="flex items-center gap-1">
              <FiHeart size={14} style={{ color: '#ff4488' }} />
              {Number(level.likes).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Play button overlay — opens level on GDBrowser */}
      {(level.id || level.levelID) && (
        <motion.a
          href={`https://gdbrowser.com/${(level.id || level.levelID)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 w-12 h-12 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
            boxShadow: `0 0 20px ${accent}44`,
            textDecoration: 'none',
          }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          <FiPlay size={20} color="#000" />
        </motion.a>
      )}
    </motion.div>
  )
}

export default function DailyLevel() {
  const [daily, setDaily] = useState(null)
  const [weekly, setWeekly] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = useCallback(async () => {
    try {
      const [d, w] = await Promise.allSettled([getDailyLevel(), getWeeklyLevel()])
      if (d.status === 'fulfilled') setDaily(d.value)
      if (w.status === 'fulfilled') setWeekly(w.value)
    } catch (err) {
      setError('Failed to load featured levels')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 60 * 60 * 1000) // refresh hourly
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
          <FiLoader size={32} style={{ color: '#ff00ff' }} />
        </motion.div>
        <p className="mt-3 text-sm" style={{ color: '#9ca3af' }}>Fetching today's featured levels...</p>
      </div>
    )
  }

  if (error && !daily && !weekly) {
    return (
      <div className="text-center py-12 rounded-2xl" style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.2)', color: '#ff6666' }}>
        {error}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <LevelCard level={daily} type="Daily" accent="#ff0044" delay={0} />
      <LevelCard level={weekly} type="Weekly" accent="#00ffff" delay={0.2} />
    </div>
  )
}
