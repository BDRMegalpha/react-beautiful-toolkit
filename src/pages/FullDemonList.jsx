import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiLoader, FiExternalLink, FiSearch, FiFilter } from 'react-icons/fi'
import { getTopDemons, getAREDLList, getAREDLDemon } from '../api/gd'

const TABS = [
  { key: 'pointercrate', label: 'Pointercrate', desc: 'Top 100 hardest demons (verified records)', color: '#ff4444' },
  { key: 'aredl', label: 'AREDL', desc: 'Every rated Extreme Demon ranked by difficulty', color: '#cc44ff' },
]

function PointercrateList() {
  const [demons, setDemons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try { setDemons(await getTopDemons(100)) } catch {}
      finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <LoadingSpinner color="#ff4444" text="Loading Pointercrate demons..." />

  return (
    <div className="space-y-1">
      {demons.map((d, i) => (
        <motion.div key={d.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.01 }}
          whileHover={{ backgroundColor: 'rgba(255,68,68,0.05)', x: 4 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}
          onClick={() => d.video && window.open(d.video, '_blank')}>
          <div className="w-10 text-center font-black shrink-0" style={{
            color: i === 0 ? '#ff0044' : i < 3 ? '#ff4444' : i < 10 ? '#ff6666' : '#6b7280',
            textShadow: i < 3 ? '0 0 10px #ff444466' : 'none',
            fontSize: i < 3 ? '1.1rem' : '0.85rem',
          }}>#{d.position}</div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white text-sm truncate">{d.name}</div>
            <div className="text-xs" style={{ color: '#9ca3af' }}>
              by {d.publisher?.name || 'Unknown'}
              {d.verifier?.name && d.publisher?.name !== d.verifier?.name && <> · verified by <span style={{ color: '#ff8888' }}>{d.verifier.name}</span></>}
            </div>
          </div>
          {d.level_id && <span className="text-xs font-mono shrink-0 hidden sm:block" style={{ color: '#4b5563' }}>ID: {d.level_id}</span>}
          {d.video && <FiExternalLink size={14} style={{ color: '#ff444488', flexShrink: 0 }} />}
        </motion.div>
      ))}
    </div>
  )
}

function AREDLList() {
  const [slugs, setSlugs] = useState([])
  const [demons, setDemons] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadedCount, setLoadedCount] = useState(0)
  const [filter, setFilter] = useState('')
  const PAGE = 50
  const [page, setPage] = useState(1)

  useEffect(() => {
    (async () => {
      try {
        const list = await getAREDLList()
        setSlugs(list)
        // Load first batch of names for display
        const batch = list.slice(0, PAGE)
        const results = await Promise.allSettled(batch.map(s => getAREDLDemon(s)))
        const loaded = results.filter(r => r.status === 'fulfilled').map(r => r.value)
        setDemons(loaded)
        setLoadedCount(PAGE)
      } catch {}
      finally { setLoading(false) }
    })()
  }, [])

  const loadMore = async () => {
    const nextBatch = slugs.slice(loadedCount, loadedCount + PAGE)
    if (nextBatch.length === 0) return
    const results = await Promise.allSettled(nextBatch.map(s => getAREDLDemon(s)))
    const loaded = results.filter(r => r.status === 'fulfilled').map(r => r.value)
    setDemons(prev => [...prev, ...loaded])
    setLoadedCount(prev => prev + PAGE)
    setPage(prev => prev + 1)
  }

  if (loading) return <LoadingSpinner color="#cc44ff" text={`Loading AREDL list...`} />

  const filtered = filter
    ? demons.filter(d => d.name?.toLowerCase().includes(filter.toLowerCase()))
    : demons

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6b7280' }} size={14} />
          <input type="text" value={filter} onChange={(e) => setFilter(e.target.value)}
            placeholder={`Search ${slugs.length} extreme demons...`}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(204,68,255,0.2)', color: '#fff' }} />
        </div>
        <span className="text-xs shrink-0" style={{ color: '#6b7280' }}>{slugs.length} total</span>
      </div>

      <div className="space-y-1">
        {filtered.map((d, i) => {
          const rank = demons.indexOf(d) + 1
          return (
            <motion.div key={d.id || d.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.005, 0.5) }}
              whileHover={{ backgroundColor: 'rgba(204,68,255,0.05)', x: 4 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div className="w-10 text-center font-black text-sm shrink-0" style={{
                color: rank <= 3 ? '#cc44ff' : rank <= 10 ? '#aa66ff' : '#6b7280',
                textShadow: rank <= 3 ? '0 0 10px #cc44ff66' : 'none',
              }}>#{rank}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-sm truncate">{d.name}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {d.tags?.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: 'rgba(204,68,255,0.1)', color: '#cc88ff' }}>{t}</span>
                  ))}
                </div>
              </div>
              {d.id && <span className="text-xs font-mono shrink-0 hidden sm:block" style={{ color: '#4b5563' }}>{d.id}</span>}
              {d.verification && (
                <a href={d.verification} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: '#cc44ff88' }}>
                  <FiExternalLink size={14} />
                </a>
              )}
            </motion.div>
          )
        })}
      </div>

      {!filter && loadedCount < slugs.length && (
        <div className="text-center mt-6">
          <button onClick={loadMore} className="px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: 'rgba(204,68,255,0.15)', border: '1px solid rgba(204,68,255,0.3)', color: '#cc44ff' }}>
            Load More ({loadedCount} / {slugs.length})
          </button>
        </div>
      )}
    </div>
  )
}

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

export default function FullDemonList() {
  const [activeTab, setActiveTab] = useState('pointercrate')

  return (
    <div className="min-h-screen px-4 sm:px-8 py-20" style={{ background: '#050514', color: '#fff' }}>
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-sm" style={{ color: '#00ffff', textDecoration: 'none' }}>
          <FiArrowLeft /> Back to DashRadar
        </Link>

        <h1 className="text-3xl sm:text-4xl font-black mb-2" style={{ color: '#ff4444' }}>Full Demon List</h1>
        <p className="mb-8" style={{ color: '#9ca3af' }}>Every extreme demon ranked by difficulty — Pointercrate + AREDL</p>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all"
              style={{
                background: activeTab === tab.key ? `${tab.color}22` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeTab === tab.key ? `${tab.color}66` : 'rgba(255,255,255,0.06)'}`,
                color: activeTab === tab.key ? tab.color : '#6b7280',
                boxShadow: activeTab === tab.key ? `0 0 15px ${tab.color}22` : 'none',
              }}>
              {tab.label}
              <div className="text-xs font-normal mt-0.5 opacity-70">{tab.desc}</div>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(10,10,30,0.85)', border: `1px solid ${TABS.find(t => t.key === activeTab).color}15`, backdropFilter: 'blur(20px)' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'pointercrate' && <motion.div key="pc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><PointercrateList /></motion.div>}
            {activeTab === 'aredl' && <motion.div key="ar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><AREDLList /></motion.div>}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
