import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiLoader, FiExternalLink, FiSearch } from 'react-icons/fi'
import { getTopDemons, getAREDLLevels } from '../api/gd'

const TABS = [
  { key: 'pointercrate', label: 'Pointercrate', desc: 'Top 100 hardest demons (verified)', color: '#ff4444' },
  { key: 'aredl', label: 'AREDL', desc: 'All rated extreme demons (live)', color: '#cc44ff' },
]

function LoadingSpinner({ color, text }) {
  return (
    <div className="text-center py-12">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="inline-block">
        <FiLoader size={32} style={{ color }} />
      </motion.div>
      <p className="mt-3 text-sm" style={{ color: '#9ca3af' }}>{text}</p>
    </div>
  )
}

function PointercrateList() {
  const [demons, setDemons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    (async () => {
      try { setDemons(await getTopDemons(100)) }
      catch { setError('Failed to load') }
      finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <LoadingSpinner color="#ff4444" text="Loading Pointercrate demons..." />
  if (error) return <div className="text-center py-8" style={{ color: '#ff6666' }}>{error}</div>

  return (
    <div className="space-y-1">
      {demons.map((d, i) => (
        <motion.div key={d.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.01, 0.5) }}
          whileHover={{ backgroundColor: 'rgba(255,68,68,0.05)', x: 4 }}
          className="flex items-center gap-3 px-3 sm:px-4 py-2.5 rounded-xl"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <div className="w-8 sm:w-10 text-center font-black text-sm shrink-0" style={{
            color: i < 1 ? '#ff0044' : i < 3 ? '#ff4444' : i < 10 ? '#ff6666' : '#6b7280',
            textShadow: i < 3 ? '0 0 8px #ff444455' : 'none',
          }}>#{d.position}</div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white text-sm truncate">{d.name}</div>
            <div className="text-xs truncate" style={{ color: '#6b7280' }}>
              {d.publisher?.name || 'Unknown'}{d.verifier?.name && d.publisher?.name !== d.verifier?.name ? ` · verified by ${d.verifier.name}` : ''}
            </div>
          </div>
          {d.video && (
            <a href={d.video} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg shrink-0" style={{ color: '#ff444488' }}>
              <FiExternalLink size={14} />
            </a>
          )}
        </motion.div>
      ))}
    </div>
  )
}

function AREDLList() {
  const [demons, setDemons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const data = await getAREDLLevels()
        setDemons(Array.isArray(data) ? data : [])
      } catch { setError('Failed to load AREDL') }
      finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <LoadingSpinner color="#cc44ff" text="Loading AREDL (live data)..." />
  if (error) return <div className="text-center py-8" style={{ color: '#ff6666' }}>{error}</div>

  const filtered = filter
    ? demons.filter(d => d.name?.toLowerCase().includes(filter.toLowerCase()))
    : demons

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6b7280' }} size={14} />
          <input type="text" value={filter} onChange={(e) => setFilter(e.target.value)}
            placeholder={`Search ${demons.length} extreme demons...`}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(204,68,255,0.2)', color: '#fff' }} />
        </div>
        <span className="text-xs font-bold shrink-0 px-2 py-1 rounded-lg" style={{ background: 'rgba(204,68,255,0.1)', color: '#cc88ff' }}>
          {demons.length} demons
        </span>
      </div>

      <div className="space-y-0.5">
        {filtered.map((d, i) => {
          const isExpanded = expanded === d.id
          return (
            <div key={d.id || `${d.name}-${d.position}`}>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.002, 0.3) }}
                whileHover={{ backgroundColor: 'rgba(204,68,255,0.04)' }}
                onClick={() => setExpanded(isExpanded ? null : d.id)}
                className="flex items-center gap-3 px-3 sm:px-4 py-2.5 rounded-xl cursor-pointer"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div className="w-8 sm:w-10 text-center font-black text-sm shrink-0" style={{
                  color: d.position <= 1 ? '#ff0044' : d.position <= 3 ? '#cc44ff' : d.position <= 10 ? '#aa66ff' : d.position <= 50 ? '#8888cc' : '#6b7280',
                  textShadow: d.position <= 3 ? '0 0 8px #cc44ff55' : 'none',
                }}>#{d.position}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm truncate">{d.name}</div>
                </div>
                {d.points > 0 && <span className="text-xs font-mono shrink-0 hidden sm:block" style={{ color: '#cc88ff' }}>{d.points.toFixed(0)} pts</span>}
                <div className="text-xs shrink-0" style={{ color: '#4b5563' }}>{isExpanded ? '▲' : '▼'}</div>
              </motion.div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <div className="px-4 py-3 ml-8 sm:ml-10 rounded-xl mb-1" style={{ background: 'rgba(204,68,255,0.05)', border: '1px solid rgba(204,68,255,0.1)' }}>
                      <div className="text-sm font-bold text-white mb-1">{d.name}</div>

                      {d.description && <p className="text-xs mb-2" style={{ color: '#9ca3af' }}>{d.description}</p>}

                      {d.tags && d.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {d.tags.map(t => (
                            <span key={t} className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: 'rgba(204,68,255,0.1)', color: '#cc88ff' }}>{t}</span>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 text-xs">
                        {d.points > 0 && <span style={{ color: '#ffcc00' }}>{d.points.toFixed(2)} list points</span>}
                        {d.gddl_tier && <span style={{ color: '#6b7280' }}>GDDL Tier: {d.gddl_tier}</span>}
                      </div>

                      <div className="flex gap-3 mt-2">
                        {d.level_id && (
                          <a href={`https://gdbrowser.com/${d.level_id}`} target="_blank" rel="noopener noreferrer"
                            className="text-xs flex items-center gap-1" style={{ color: '#cc44ff', textDecoration: 'none' }}>
                            GDBrowser <FiExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function FullDemonList() {
  const [activeTab, setActiveTab] = useState('pointercrate')

  return (
    <div className="min-h-screen px-4 sm:px-8 py-20" style={{ background: '#050514', color: '#fff' }}>
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-sm" style={{ color: '#00ffff', textDecoration: 'none' }}>
          <FiArrowLeft /> Back to DashRadar
        </Link>

        <h1 className="text-3xl sm:text-4xl font-black mb-2" style={{ color: '#ff4444' }}>Full Demon List</h1>
        <p className="mb-8" style={{ color: '#9ca3af' }}>Every extreme demon ranked by difficulty — live data, updates immediately</p>

        <div className="flex gap-3 mb-6">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left"
              style={{
                background: activeTab === tab.key ? `${tab.color}22` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeTab === tab.key ? `${tab.color}66` : 'rgba(255,255,255,0.06)'}`,
                color: activeTab === tab.key ? tab.color : '#6b7280',
              }}>
              {tab.label}
              <div className="text-xs font-normal mt-0.5 opacity-60">{tab.desc}</div>
            </button>
          ))}
        </div>

        <div className="rounded-2xl p-3 sm:p-4" style={{ background: 'rgba(10,10,30,0.85)', border: `1px solid ${TABS.find(t => t.key === activeTab).color}15`, backdropFilter: 'blur(20px)' }}>
          {activeTab === 'pointercrate' && <PointercrateList />}
          {activeTab === 'aredl' && <AREDLList />}
        </div>
      </div>
    </div>
  )
}
