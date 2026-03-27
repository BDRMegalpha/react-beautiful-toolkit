import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiZap, FiAlertCircle, FiUsers } from 'react-icons/fi'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell
} from 'recharts'
import { searchPlayer } from '../api/gd'

function normalizeStats(player) {
  return {
    stars: Number(player.stars || 0),
    demons: Number(player.demons || 0),
    cp: Number(player.cp || 0),
    diamonds: Number(player.diamonds || 0),
    userCoins: Number(player.userCoins || 0),
    coins: Number(player.coins || 0),
    moons: Number(player.moons || 0),
  }
}

function buildRadarData(a, b) {
  const sa = normalizeStats(a)
  const sb = normalizeStats(b)

  const categories = [
    { key: 'stars', label: 'Stars', maxGuess: 400000 },
    { key: 'demons', label: 'Demons', maxGuess: 10000 },
    { key: 'cp', label: 'Creator Pts', maxGuess: 500 },
    { key: 'diamonds', label: 'Diamonds', maxGuess: 100000 },
    { key: 'userCoins', label: 'User Coins', maxGuess: 20000 },
    { key: 'moons', label: 'Moons', maxGuess: 5000 },
  ]

  return categories.map(c => {
    const max = Math.max(sa[c.key], sb[c.key], c.maxGuess * 0.01)
    return {
      stat: c.label,
      [a.username]: Math.round((sa[c.key] / max) * 100),
      [b.username]: Math.round((sb[c.key] / max) * 100),
      rawA: sa[c.key],
      rawB: sb[c.key],
    }
  })
}

function buildBarData(a, b) {
  const sa = normalizeStats(a)
  const sb = normalizeStats(b)
  return [
    { stat: 'Stars', A: sa.stars, B: sb.stars },
    { stat: 'Demons', A: sa.demons, B: sb.demons },
    { stat: 'Creator Pts', A: sa.cp, B: sb.cp },
    { stat: 'Diamonds', A: sa.diamonds, B: sb.diamonds },
    { stat: 'User Coins', A: sa.userCoins, B: sb.userCoins },
    { stat: 'Moons', A: sa.moons, B: sb.moons },
  ]
}

function WinnerBadge({ a, b }) {
  const sa = normalizeStats(a)
  const sb = normalizeStats(b)
  const fields = ['stars', 'demons', 'cp', 'diamonds', 'userCoins', 'moons']
  let winsA = 0, winsB = 0
  fields.forEach(f => {
    if (sa[f] > sb[f]) winsA++
    else if (sb[f] > sa[f]) winsB++
  })
  const winner = winsA > winsB ? a.username : winsB > winsA ? b.username : null
  const color = winsA > winsB ? '#00ffff' : '#ff00ff'

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring' }}
      className="text-center my-6"
    >
      {winner ? (
        <div>
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: '#9ca3af' }}>Overall Leader</div>
          <div
            className="text-3xl sm:text-4xl font-black"
            style={{ color, textShadow: `0 0 20px ${color}, 0 0 40px ${color}55` }}
          >
            {winner}
          </div>
          <div className="text-sm mt-1" style={{ color: '#9ca3af' }}>{winsA > winsB ? winsA : winsB} of 6 categories won</div>
        </div>
      ) : (
        <div className="text-2xl font-black" style={{ color: '#ffff00', textShadow: '0 0 20px #ffff00' }}>
          It's a Tie!
        </div>
      )}
    </motion.div>
  )
}

export default function PlayerCompare() {
  const [nameA, setNameA] = useState('')
  const [nameB, setNameB] = useState('')
  const [playerA, setPlayerA] = useState(null)
  const [playerB, setPlayerB] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCompare = async (e) => {
    e.preventDefault()
    if (!nameA.trim() || !nameB.trim()) return
    setLoading(true)
    setError(null)
    setPlayerA(null)
    setPlayerB(null)

    try {
      const [a, b] = await Promise.all([
        searchPlayer(nameA.trim()),
        searchPlayer(nameB.trim()),
      ])
      setPlayerA(a)
      setPlayerB(b)
    } catch (err) {
      setError('One or both players not found. Check the usernames.')
    } finally {
      setLoading(false)
    }
  }

  const hasResults = playerA && playerB && !loading

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
          style={{ background: 'rgba(0, 255, 255, 0.1)', border: '1px solid rgba(0, 255, 255, 0.3)', color: '#00ffff' }}
          animate={{ boxShadow: ['0 0 10px #00ffff22', '0 0 20px #ff00ff22', '0 0 10px #00ffff22'] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <FiUsers size={12} /> Exclusive to DashRadar
        </motion.div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleCompare} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center mb-8">
        <input
          type="text"
          value={nameA}
          onChange={(e) => setNameA(e.target.value)}
          placeholder="Player 1"
          className="w-full px-5 py-3 rounded-xl text-base outline-none"
          style={{
            background: 'rgba(10, 10, 30, 0.8)',
            border: '2px solid rgba(0, 255, 255, 0.3)',
            color: '#fff',
          }}
        />
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="px-5 py-3 rounded-xl font-bold text-sm mx-auto"
          style={{
            background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
            color: '#000',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
          }}
        >
          <FiZap className="inline mr-1" /> VS
        </motion.button>
        <input
          type="text"
          value={nameB}
          onChange={(e) => setNameB(e.target.value)}
          placeholder="Player 2"
          className="w-full px-5 py-3 rounded-xl text-base outline-none"
          style={{
            background: 'rgba(10, 10, 30, 0.8)',
            border: '2px solid rgba(255, 0, 255, 0.3)',
            color: '#fff',
          }}
        />
      </form>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="inline-block w-8 h-8 rounded-lg"
            style={{ border: '3px solid transparent', borderTop: '3px solid #00ffff', borderRight: '3px solid #ff00ff' }}
          />
          <p className="mt-3 text-sm" style={{ color: '#9ca3af' }}>Analyzing players...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-6 rounded-2xl flex items-center justify-center gap-2"
          style={{ background: 'rgba(255, 50, 50, 0.1)', border: '1px solid rgba(255, 50, 50, 0.2)', color: '#ff6666' }}>
          <FiAlertCircle /> {error}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {hasResults && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl p-4 sm:p-8"
            style={{
              background: 'rgba(10, 10, 30, 0.85)',
              border: '1px solid rgba(0, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 40px rgba(0, 255, 255, 0.08)',
            }}
          >
            {/* Player names */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-center flex-1">
                <div className="text-lg sm:text-2xl font-black" style={{ color: '#00ffff', textShadow: '0 0 10px #00ffff55' }}>
                  {playerA.username}
                </div>
                {playerA.rank > 0 && <div className="text-xs" style={{ color: '#9ca3af' }}>Rank #{playerA.rank}</div>}
              </div>
              <div className="text-xl sm:text-3xl font-black px-4" style={{ color: '#ffff00', textShadow: '0 0 10px #ffff0055' }}>VS</div>
              <div className="text-center flex-1">
                <div className="text-lg sm:text-2xl font-black" style={{ color: '#ff00ff', textShadow: '0 0 10px #ff00ff55' }}>
                  {playerB.username}
                </div>
                {playerB.rank > 0 && <div className="text-xs" style={{ color: '#9ca3af' }}>Rank #{playerB.rank}</div>}
              </div>
            </div>

            {/* Winner Badge */}
            <WinnerBadge a={playerA} b={playerB} />

            {/* Radar Chart */}
            <div className="mb-8">
              <h4 className="text-center text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#9ca3af' }}>
                Skill Radar
              </h4>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={buildRadarData(playerA, playerB)} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#ffffff15" />
                  <PolarAngleAxis dataKey="stat" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <PolarRadiusAxis tick={false} axisLine={false} />
                  <Radar
                    name={playerA.username}
                    dataKey={playerA.username}
                    stroke="#00ffff"
                    fill="#00ffff"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Radar
                    name={playerB.username}
                    dataKey={playerB.username}
                    stroke="#ff00ff"
                    fill="#ff00ff"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff15', borderRadius: 8, fontSize: 12 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Comparison */}
            <div className="mb-6">
              <h4 className="text-center text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#9ca3af' }}>
                Stat-by-Stat Breakdown
              </h4>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={buildBarData(playerA, playerB)} layout="vertical" margin={{ left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <YAxis type="category" dataKey="stat" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff15', borderRadius: 8, fontSize: 12 }}
                    formatter={(val) => Number(val).toLocaleString()}
                  />
                  <Bar dataKey="A" name={playerA.username} fill="#00ffff" radius={[0, 6, 6, 0]} />
                  <Bar dataKey="B" name={playerB.username} fill="#ff00ff" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Stat Table */}
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="font-bold" style={{ color: '#00ffff' }}>{playerA.username}</div>
              <div className="font-bold" style={{ color: '#9ca3af' }}>Stat</div>
              <div className="font-bold" style={{ color: '#ff00ff' }}>{playerB.username}</div>
              {[
                { label: 'Stars', key: 'stars' },
                { label: 'Demons', key: 'demons' },
                { label: 'Creator Pts', key: 'cp' },
                { label: 'Diamonds', key: 'diamonds' },
                { label: 'User Coins', key: 'userCoins' },
                { label: 'Moons', key: 'moons' },
                { label: 'Coins', key: 'coins' },
              ].map(s => {
                const va = Number(playerA[s.key] || 0)
                const vb = Number(playerB[s.key] || 0)
                const winA = va > vb
                const winB = vb > va
                return [
                  <div key={`a-${s.key}`} className="py-1.5" style={{
                    color: winA ? '#00ffff' : '#6b7280',
                    fontWeight: winA ? 700 : 400,
                    textShadow: winA ? '0 0 8px #00ffff55' : 'none',
                  }}>{va.toLocaleString()}</div>,
                  <div key={`l-${s.key}`} className="py-1.5" style={{ color: '#4b5563' }}>{s.label}</div>,
                  <div key={`b-${s.key}`} className="py-1.5" style={{
                    color: winB ? '#ff00ff' : '#6b7280',
                    fontWeight: winB ? 700 : 400,
                    textShadow: winB ? '0 0 8px #ff00ff55' : 'none',
                  }}>{vb.toLocaleString()}</div>,
                ]
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
