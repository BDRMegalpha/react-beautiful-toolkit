import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiCheck, FiX, FiDownload, FiUpload, FiFilter, FiLoader, FiExternalLink } from 'react-icons/fi'
import { getTopDemons } from '../api/gd'

const STORAGE_KEY = 'dr-demon-tracker'

export default function DemonTracker() {
  const [demons, setDemons] = useState([])
  const [beaten, setBeaten] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} }
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | beaten | unbeaten

  useEffect(() => {
    (async () => {
      try {
        const data = await getTopDemons(100)
        setDemons(Array.isArray(data) ? data : [])
      } catch { }
      finally { setLoading(false) }
    })()
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(beaten))
  }, [beaten])

  const toggle = (id) => {
    setBeaten(prev => {
      const next = { ...prev }
      if (next[id]) delete next[id]
      else next[id] = new Date().toISOString()
      return next
    })
  }

  const beatenCount = Object.keys(beaten).length
  const total = demons.length
  const pct = total > 0 ? Math.round((beatenCount / total) * 100) : 0

  const filtered = demons.filter(d => {
    const id = d.id || d.position
    if (filter === 'beaten') return beaten[id]
    if (filter === 'unbeaten') return !beaten[id]
    return true
  })

  const exportData = () => {
    const blob = new Blob([JSON.stringify(beaten, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'dashradar-demon-tracker.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const importData = () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json'
    input.onchange = async (e) => {
      try {
        const text = await e.target.files[0].text()
        setBeaten(JSON.parse(text))
      } catch { }
    }
    input.click()
  }

  return (
    <div className="min-h-screen px-4 sm:px-8 py-20" style={{ background: '#050514', color: '#fff' }}>
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-sm" style={{ color: '#00ffff', textDecoration: 'none' }}>
          <FiArrowLeft /> Back to DashRadar
        </Link>

        <h1 className="text-3xl sm:text-4xl font-black mb-2" style={{ color: '#ff4444' }}>Demon Tracker</h1>
        <p className="mb-6" style={{ color: '#9ca3af' }}>Track your progress on the Pointercrate Demon List. Data saves locally.</p>

        {/* Progress Bar */}
        <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(255,68,68,0.05)', border: '1px solid rgba(255,68,68,0.15)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-white">{beatenCount} / {total} beaten</span>
            <span className="text-sm font-bold" style={{ color: '#ff4444' }}>{pct}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <motion.div className="h-full rounded-full" animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }}
              style={{ background: 'linear-gradient(90deg, #ff4444, #ff00ff)' }} />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          {['all', 'beaten', 'unbeaten'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-2 rounded-lg text-xs font-bold uppercase"
              style={{ background: filter === f ? 'rgba(255,68,68,0.2)' : 'rgba(255,255,255,0.03)', border: `1px solid ${filter === f ? '#ff444466' : '#ffffff08'}`, color: filter === f ? '#ff4444' : '#6b7280' }}>
              {f}
            </button>
          ))}
          <button onClick={exportData} className="px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1"
            style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', color: '#00ff88' }}>
            <FiDownload size={12} /> Export
          </button>
          <button onClick={importData} className="px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1"
            style={{ background: 'rgba(0,204,255,0.08)', border: '1px solid rgba(0,204,255,0.2)', color: '#00ccff' }}>
            <FiUpload size={12} /> Import
          </button>
        </div>

        {loading && <div className="text-center py-12"><FiLoader size={32} style={{ color: '#ff4444' }} className="animate-spin inline-block" /></div>}

        {/* Demon List */}
        <div className="space-y-2">
          {filtered.map((d, i) => {
            const id = d.id || d.position
            const done = !!beaten[id]
            return (
              <motion.div key={id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.01 }}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer group"
                style={{ background: done ? 'rgba(0,255,136,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${done ? '#00ff8822' : '#ffffff06'}` }}
                onClick={() => toggle(id)}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                  style={{ background: done ? '#00ff8822' : '#ffffff08', color: done ? '#00ff88' : '#4b5563' }}>
                  {done ? <FiCheck size={16} /> : <span className="text-xs font-bold">#{d.position}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate" style={{ color: done ? '#00ff88' : '#fff', textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.7 : 1 }}>{d.name}</div>
                  <div className="text-xs" style={{ color: '#6b7280' }}>
                    by {d.publisher?.name || 'Unknown'}{d.verifier?.name && d.publisher?.name !== d.verifier?.name ? ` · verified ${d.verifier.name}` : ''}
                  </div>
                </div>
                <span className="text-xs font-bold shrink-0" style={{ color: done ? '#00ff88' : '#ff4444' }}>#{d.position}</span>
                {d.video && <a href={d.video} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: '#6b7280' }}><FiExternalLink size={14} /></a>}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
