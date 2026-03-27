import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FiLoader, FiRefreshCw, FiAward } from 'react-icons/fi'
import { getPointercrateRankings } from '../api/gd'

const rankColors = ['#ffdd00', '#c0c0c0', '#cd7f32']

export default function PointercrateRankings() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const data = await getPointercrateRankings(50)
      setPlayers(Array.isArray(data) ? data : [])
    } catch { setError('Failed to load Pointercrate rankings') }
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(() => loadData(true), 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [loadData])

  if (loading) return (
    <div className="text-center py-12">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="inline-block">
        <FiLoader size={32} style={{ color: '#ff4444' }} />
      </motion.div>
      <p className="mt-3 text-sm" style={{ color: '#9ca3af' }}>Loading Pointercrate rankings...</p>
    </div>
  )

  if (error) return <div className="text-center py-12 rounded-2xl" style={{ background: 'rgba(255,50,50,0.1)', color: '#ff6666' }}>{error}</div>

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <FiAward style={{ color: '#ff4444' }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#ff444488' }}>Demonlist Point Rankings</span>
        </div>
        <motion.button whileHover={{ scale: 1.1 }} onClick={() => loadData(true)} disabled={refreshing}
          className="p-1.5 rounded-lg" style={{ color: refreshing ? '#4b5563' : '#ff4444', background: 'rgba(255,68,68,0.05)' }}>
          <FiRefreshCw size={14} />
        </motion.button>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(10,10,30,0.85)', border: '1px solid rgba(255,68,68,0.15)', backdropFilter: 'blur(20px)' }}>
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest"
          style={{ color: '#ff444488', borderBottom: '1px solid rgba(255,68,68,0.1)' }}>
          <div className="col-span-1">#</div>
          <div className="col-span-5 sm:col-span-6">Player</div>
          <div className="col-span-3 sm:col-span-3 text-right">List Points</div>
          <div className="col-span-3 sm:col-span-2 text-right">Country</div>
        </div>

        {players.map((p, i) => (
          <motion.div key={p.id || i}
            initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.02 }}
            whileHover={{ backgroundColor: 'rgba(255,68,68,0.05)', x: 4 }}
            className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-2.5 sm:py-3 items-center"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <div className="col-span-1 font-black text-sm sm:text-lg"
              style={{ color: rankColors[i] || '#9ca3af', textShadow: i < 3 ? `0 0 10px ${rankColors[i]}` : 'none' }}>
              {p.rank || i + 1}
            </div>
            <div className="col-span-5 sm:col-span-6 flex items-center gap-2 sm:gap-3">
              <motion.div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm shrink-0"
                style={{ background: `linear-gradient(135deg, ${rankColors[i] || '#ff4444'}22, ${rankColors[i] || '#ff4444'}11)`, border: `1px solid ${rankColors[i] || '#ff4444'}33`, color: rankColors[i] || '#ff6666' }}
                whileHover={{ scale: 1.15, rotate: 5 }}>
                {(p.name || '?')[0].toUpperCase()}
              </motion.div>
              <span className="font-semibold text-white text-xs sm:text-sm truncate">{p.name}</span>
            </div>
            <div className="col-span-3 sm:col-span-3 text-right font-mono font-bold text-xs sm:text-sm" style={{ color: '#ff4444', textShadow: i < 3 ? '0 0 8px #ff444455' : 'none' }}>
              {typeof p.score === 'number' ? p.score.toFixed(2) : p.score}
            </div>
            <div className="col-span-3 sm:col-span-2 text-right text-xs sm:text-sm">
              {p.nationality ? (
                <span title={p.nationality.nation}>
                  {p.nationality.country_code ? String.fromCodePoint(...[...p.nationality.country_code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)) : '🌍'}
                </span>
              ) : '🌍'}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
