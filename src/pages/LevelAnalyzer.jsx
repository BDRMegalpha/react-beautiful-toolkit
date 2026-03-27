import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiSearch, FiArrowLeft, FiDownload, FiHeart, FiMusic, FiLayers, FiClock, FiStar, FiExternalLink } from 'react-icons/fi'
import { getLevel, getDifficultyColor } from '../api/gd'

export default function LevelAnalyzer() {
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true); setError(null); setLevel(null)
    try {
      const data = await getLevel(query.trim())
      setLevel(data)
    } catch { setError('Level not found. Try a level ID (e.g., 128) or name.') }
    finally { setLoading(false) }
  }

  const diffColor = level ? getDifficultyColor(level.difficulty) : '#9ca3af'

  return (
    <div className="min-h-screen px-4 sm:px-8 py-20" style={{ background: '#050514', color: '#fff' }}>
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-sm" style={{ color: '#00ffff', textDecoration: 'none' }}>
          <FiArrowLeft /> Back to DashRadar
        </Link>

        <h1 className="text-3xl sm:text-4xl font-black mb-2" style={{ color: '#ff00ff' }}>Level Analyzer</h1>
        <p className="mb-8" style={{ color: '#9ca3af' }}>Enter a level ID or name to analyze its stats, difficulty, and metadata.</p>

        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Level ID (e.g., 128) or search..."
            className="flex-1 px-5 py-3 rounded-xl text-base outline-none"
            style={{ background: 'rgba(10,10,30,0.8)', border: '2px solid rgba(255,0,255,0.3)', color: '#fff' }} />
          <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl font-bold"
            style={{ background: 'linear-gradient(135deg, #ff00ff, #cc44ff)', color: '#000' }}>
            <FiSearch />
          </button>
        </form>

        {loading && <div className="text-center py-8" style={{ color: '#9ca3af' }}>Analyzing level...</div>}
        {error && <div className="text-center py-6 rounded-xl" style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.2)', color: '#ff6666' }}>{error}</div>}

        <AnimatePresence>
          {level && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6"
              style={{ background: 'rgba(10,10,30,0.85)', border: `1px solid ${diffColor}22`, backdropFilter: 'blur(20px)' }}>

              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white">{level.name}</h2>
                  <p className="text-sm" style={{ color: '#9ca3af' }}>by <span style={{ color: diffColor }}>{level.author}</span> · ID: {level.levelID}</p>
                </div>
                <a href={`https://gdbrowser.com/${level.levelID}`} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg" style={{ background: `${diffColor}22`, color: diffColor }}>
                  <FiExternalLink size={18} />
                </a>
              </div>

              {/* Difficulty + Stars */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-4 py-2 rounded-xl font-bold" style={{ background: `${diffColor}22`, color: diffColor }}>{level.difficulty || 'Unrated'}</span>
                {level.stars > 0 && <span className="px-4 py-2 rounded-xl font-bold" style={{ background: '#ffff0015', color: '#ffff00' }}>{level.stars}★</span>}
                {level.length && <span className="px-4 py-2 rounded-xl font-bold" style={{ background: '#ffffff08', color: '#ccc' }}>{level.length}</span>}
                {level.coins > 0 && <span className="px-4 py-2 rounded-xl font-bold" style={{ background: '#ffcc0015', color: '#ffcc00' }}>{level.coins} coin{level.coins > 1 ? 's' : ''} {level.verifiedCoins ? '✓' : ''}</span>}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { icon: <FiDownload />, label: 'Downloads', value: Number(level.downloads || 0).toLocaleString(), color: '#00ffff' },
                  { icon: <FiHeart />, label: 'Likes', value: Number(level.likes || 0).toLocaleString(), color: '#ff4488' },
                  { icon: <FiLayers />, label: 'Objects', value: level.objects ? Number(level.objects).toLocaleString() : 'N/A', color: '#ff00ff' },
                  { icon: <FiClock />, label: 'Version', value: level.gameVersion || 'N/A', color: '#00ff88' },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: `${s.color}08`, border: `1px solid ${s.color}15` }}>
                    <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
                    <div className="font-bold text-white">{s.value}</div>
                    <div className="text-xs" style={{ color: '#6b7280' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Song Info */}
              {level.songName && (
                <div className="p-4 rounded-xl mb-6" style={{ background: 'rgba(255,255,0,0.05)', border: '1px solid rgba(255,255,0,0.1)' }}>
                  <div className="flex items-center gap-2 mb-1"><FiMusic style={{ color: '#ffff00' }} /><span className="font-bold text-white text-sm">{level.songName}</span></div>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>by {level.songAuthor || 'Unknown'}{level.songID ? ` · Song ID: ${level.songID}` : ''}</p>
                  {level.songLink && <a href={level.songLink} target="_blank" rel="noopener noreferrer" className="text-xs mt-2 inline-block" style={{ color: '#ffff00' }}>Listen on Newgrounds →</a>}
                </div>
              )}

              {/* Description */}
              {level.description && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#6b7280' }}>Description</div>
                  <p className="text-sm" style={{ color: '#9ca3af' }}>{level.description}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
