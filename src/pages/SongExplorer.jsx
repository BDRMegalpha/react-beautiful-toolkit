import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiSearch, FiMusic, FiExternalLink, FiPlay } from 'react-icons/fi'
import { getSong } from '../api/gd'

const POPULAR_SONGS = [
  { id: 467339, name: 'At the Speed of Light' },
  { id: 223469, name: 'Deadlocked' },
  { id: 44580, name: 'Jumper' },
  { id: 539514, name: 'Electrodynamix' },
  { id: 245060, name: 'Fingerbang' },
  { id: 700329, name: 'Viking Arena' },
]

export default function SongExplorer() {
  const [query, setQuery] = useState('')
  const [song, setSong] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (id) => {
    const songId = id || query.trim()
    if (!songId) return
    setLoading(true); setError(null); setSong(null)
    try {
      const data = await getSong(songId)
      setSong(data)
    } catch { setError('Song not found. Try a Newgrounds song ID.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen px-4 sm:px-8 py-20" style={{ background: '#050514', color: '#fff' }}>
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-sm" style={{ color: '#00ffff', textDecoration: 'none' }}>
          <FiArrowLeft /> Back to DashRadar
        </Link>

        <h1 className="text-3xl sm:text-4xl font-black mb-2" style={{ color: '#ffff00' }}>Song Explorer</h1>
        <p className="mb-8" style={{ color: '#9ca3af' }}>Search any Newgrounds song used in Geometry Dash by its ID.</p>

        <form onSubmit={(e) => { e.preventDefault(); handleSearch() }} className="flex gap-3 mb-8">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Newgrounds Song ID..."
            className="flex-1 px-5 py-3 rounded-xl text-base outline-none"
            style={{ background: 'rgba(10,10,30,0.8)', border: '2px solid rgba(255,255,0,0.3)', color: '#fff' }} />
          <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl font-bold"
            style={{ background: 'linear-gradient(135deg, #ffff00, #ff8800)', color: '#000' }}>
            <FiSearch />
          </button>
        </form>

        {/* Popular Songs */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: '#6b7280' }}>Popular Songs</h3>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SONGS.map(s => (
              <motion.button key={s.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setQuery(String(s.id)); handleSearch(s.id) }}
                className="px-3 py-2 rounded-lg text-xs font-bold"
                style={{ background: 'rgba(255,255,0,0.08)', border: '1px solid rgba(255,255,0,0.2)', color: '#ffff00' }}>
                <FiMusic className="inline mr-1" size={10} />{s.name}
              </motion.button>
            ))}
          </div>
        </div>

        {loading && <div className="text-center py-8" style={{ color: '#9ca3af' }}>Fetching song...</div>}
        {error && <div className="text-center py-6 rounded-xl" style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.2)', color: '#ff6666' }}>{error}</div>}

        <AnimatePresence>
          {song && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-6" style={{ background: 'rgba(10,10,30,0.85)', border: '1px solid rgba(255,255,0,0.15)', backdropFilter: 'blur(20px)' }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,0,0.1)' }}>
                  <FiMusic size={28} style={{ color: '#ffff00' }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{song.name || 'Unknown'}</h2>
                  <p className="text-sm" style={{ color: '#9ca3af' }}>by {song.author || song.artistName || 'Unknown'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {song.size && <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,0,0.05)' }}>
                  <div className="font-bold text-white">{song.size}</div><div className="text-xs" style={{ color: '#6b7280' }}>Size</div>
                </div>}
                {(song.songID || song.id) && <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,0,0.05)' }}>
                  <div className="font-bold text-white">{song.songID || song.id}</div><div className="text-xs" style={{ color: '#6b7280' }}>Song ID</div>
                </div>}
              </div>
              {song.link && (
                <a href={song.link} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm"
                  style={{ background: 'linear-gradient(135deg, #ffff00, #ff8800)', color: '#000', textDecoration: 'none' }}>
                  <FiPlay /> Listen on Newgrounds <FiExternalLink size={14} />
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
