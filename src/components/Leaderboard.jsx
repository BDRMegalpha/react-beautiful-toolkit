import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronRight, FiLoader, FiRefreshCw, FiStar, FiZap, FiAward, FiHexagon, FiDisc } from 'react-icons/fi'
import { getTopPlayers, getCreatorLeaderboard } from '../api/gd'

const rankColors = ['#ffdd00', '#c0c0c0', '#cd7f32']

const TABS = [
  { key: 'stars', label: 'Stars', icon: <FiStar size={14} />, color: '#ffff00', sortField: 'stars', fetch: 'top' },
  { key: 'demons', label: 'Demons', icon: <FiZap size={14} />, color: '#ff4444', sortField: 'demons', fetch: 'top' },
  { key: 'moons', label: 'Moons', icon: <FiDisc size={14} />, color: '#cc88ff', sortField: 'moons', fetch: 'top' },
  { key: 'userCoins', label: 'User Coins', icon: <FiHexagon size={14} />, color: '#c0c0c0', sortField: 'userCoins', fetch: 'top' },
  { key: 'diamonds', label: 'Diamonds', icon: <FiHexagon size={14} />, color: '#00ccff', sortField: 'diamonds', fetch: 'top' },
  { key: 'cp', label: 'Creators', icon: <FiAward size={14} />, color: '#00ff88', sortField: 'cp', fetch: 'creator' },
]

const REFRESH_INTERVAL = 60 * 60 * 1000 // 1 hour

export default function Leaderboard() {
  const [topData, setTopData] = useState([])
  const [creatorData, setCreatorData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('stars')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const [top, creators] = await Promise.allSettled([
        getTopPlayers(200),
        getCreatorLeaderboard(200),
      ])
      if (top.status === 'fulfilled') setTopData(Array.isArray(top.value) ? top.value : [])
      if (creators.status === 'fulfilled') setCreatorData(Array.isArray(creators.value) ? creators.value : [])
      setLastUpdated(new Date())
    } catch (err) {
      setError('Failed to load leaderboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(() => loadData(true), REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [loadData])

  const currentTab = TABS.find(t => t.key === activeTab)
  const sourceData = currentTab?.fetch === 'creator' ? creatorData : topData

  const sortedPlayers = [...sourceData].sort((a, b) => {
    const field = currentTab?.sortField || 'stars'
    return (Number(b[field]) || 0) - (Number(a[field]) || 0)
  }).slice(0, 50)

  if (loading) {
    return (
      <div className="text-center py-12">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="inline-block">
          <FiLoader size={32} style={{ color: '#00ffff' }} />
        </motion.div>
        <p className="mt-3 text-sm" style={{ color: '#9ca3af' }}>Loading leaderboard from GD servers...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 rounded-2xl" style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.2)', color: '#ff6666' }}>
        {error}
        <button onClick={() => loadData()} className="block mx-auto mt-3 px-4 py-2 rounded-lg text-sm" style={{ background: '#ff444422', color: '#ff6666' }}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {TABS.map(tab => (
          <motion.button
            key={tab.key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all"
            style={{
              background: activeTab === tab.key ? `${tab.color}22` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${activeTab === tab.key ? `${tab.color}66` : 'rgba(255,255,255,0.06)'}`,
              color: activeTab === tab.key ? tab.color : '#6b7280',
              boxShadow: activeTab === tab.key ? `0 0 15px ${tab.color}22` : 'none',
            }}
          >
            {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Last updated + refresh */}
      <div className="flex items-center justify-between mb-3 px-2">
        <span className="text-xs" style={{ color: '#4b5563' }}>
          {lastUpdated && `Updated ${lastUpdated.toLocaleTimeString()}`}
          {' · Auto-refreshes hourly'}
        </span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="p-1.5 rounded-lg"
          style={{ color: refreshing ? '#4b5563' : '#00ffff', background: 'rgba(0,255,255,0.05)' }}
        >
          <motion.div animate={refreshing ? { rotate: 360 } : {}} transition={{ repeat: refreshing ? Infinity : 0, duration: 1 }}>
            <FiRefreshCw size={14} />
          </motion.div>
        </motion.button>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(10, 10, 30, 0.85)',
          border: `1px solid ${currentTab?.color || '#00ffff'}15`,
          backdropFilter: 'blur(20px)',
          boxShadow: `0 0 40px ${currentTab?.color || '#00ffff'}08`,
        }}
      >
        {/* Header */}
        <div
          className="grid grid-cols-12 gap-1 sm:gap-2 px-3 sm:px-6 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest"
          style={{ color: `${currentTab?.color || '#00ffff'}88`, borderBottom: `1px solid ${currentTab?.color || '#00ffff'}10` }}
        >
          <div className="col-span-1">#</div>
          <div className="col-span-5 sm:col-span-4">Player</div>
          <div className="col-span-3 sm:col-span-2 text-right">{currentTab?.label}</div>
          <div className="col-span-3 sm:col-span-2 text-right hidden sm:block">Stars</div>
          <div className="col-span-3 sm:col-span-2 text-right">Demons</div>
          <div className="col-span-1 hidden sm:block"></div>
        </div>

        <AnimatePresence mode="popLayout">
          {sortedPlayers.map((player, i) => (
            <motion.div
              key={`${activeTab}-${player.playerID || player.username || i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: i * 0.015 }}
              whileHover={{ backgroundColor: `${currentTab?.color || '#00ffff'}08`, x: 4 }}
              className="grid grid-cols-12 gap-1 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 items-center cursor-pointer"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
            >
              <div
                className="col-span-1 font-black text-sm sm:text-lg"
                style={{
                  color: rankColors[i] || '#9ca3af',
                  textShadow: i < 3 ? `0 0 10px ${rankColors[i]}` : 'none',
                }}
              >
                {i + 1}
              </div>
              <div className="col-span-5 sm:col-span-4 flex items-center gap-2 sm:gap-3 min-w-0">
                <motion.div
                  className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${rankColors[i] || '#6366f1'}22, ${rankColors[i] || '#6366f1'}11)`,
                    border: `1px solid ${rankColors[i] || '#6366f1'}33`,
                    color: rankColors[i] || '#c4b5fd',
                  }}
                  whileHover={{ scale: 1.15, rotate: 5 }}
                >
                  {(player.username || '?')[0].toUpperCase()}
                </motion.div>
                <span className="font-semibold text-white text-xs sm:text-sm truncate">{player.username || `Player ${player.playerID}`}</span>
              </div>
              <div className="col-span-3 sm:col-span-2 text-right font-mono font-bold text-xs sm:text-sm" style={{ color: currentTab?.color || '#ffff00' }}>
                {Number(player[currentTab?.sortField] || 0).toLocaleString()}
              </div>
              <div className="col-span-3 sm:col-span-2 text-right font-mono font-bold text-xs sm:text-sm hidden sm:block" style={{ color: '#ffff00' }}>
                {Number(player.stars || 0).toLocaleString()}
              </div>
              <div className="col-span-3 sm:col-span-2 text-right font-mono font-bold text-xs sm:text-sm" style={{ color: '#ff4444' }}>
                {Number(player.demons || 0).toLocaleString()}
              </div>
              <div className="col-span-1 text-right hidden sm:block">
                <FiChevronRight style={{ color: '#4b5563' }} size={14} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
