import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiStar, FiAward, FiZap, FiTrendingUp } from 'react-icons/fi'

export default function PlayerSearch() {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    // Simulated player data — will be replaced with real GD API calls
    setTimeout(() => {
      setResult({
        name: query,
        stars: Math.floor(Math.random() * 50000) + 1000,
        diamonds: Math.floor(Math.random() * 30000) + 500,
        demons: Math.floor(Math.random() * 500) + 10,
        cp: Math.floor(Math.random() * 200),
        rank: Math.floor(Math.random() * 10000) + 1,
        coins: Math.floor(Math.random() * 150) + 10,
        userCoins: Math.floor(Math.random() * 5000) + 100,
      })
      setSearching(false)
    }, 800)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <motion.div
          className="relative"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any GD player..."
            className="w-full px-6 py-4 pr-14 rounded-2xl text-lg outline-none transition-all duration-300"
            style={{
              background: 'rgba(10, 10, 30, 0.8)',
              border: '2px solid rgba(0, 255, 255, 0.3)',
              color: '#fff',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.1)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(0, 255, 255, 0.8)'
              e.target.style.boxShadow = '0 0 40px rgba(0, 255, 255, 0.2)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(0, 255, 255, 0.3)'
              e.target.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.1)'
            }}
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all"
            style={{
              background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
              color: '#000',
            }}
          >
            <FiSearch size={22} />
          </button>
        </motion.div>
      </form>

      <AnimatePresence>
        {searching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="inline-block w-8 h-8 rounded-lg"
              style={{ border: '3px solid transparent', borderTop: '3px solid #00ffff', borderRight: '3px solid #ff00ff' }}
            />
          </motion.div>
        )}

        {result && !searching && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mt-6 rounded-2xl p-6"
            style={{
              background: 'rgba(10, 10, 30, 0.85)',
              border: '1px solid rgba(0, 255, 255, 0.2)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 30px rgba(0, 255, 255, 0.1), inset 0 0 30px rgba(0, 255, 255, 0.02)',
            }}
          >
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-black"
                style={{
                  background: 'linear-gradient(135deg, #00ffff22, #ff00ff22)',
                  border: '2px solid #00ffff44',
                  color: '#00ffff',
                  textShadow: '0 0 10px #00ffff',
                }}
                animate={{ boxShadow: ['0 0 15px #00ffff33', '0 0 25px #ff00ff33', '0 0 15px #00ffff33'] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {result.name[0]?.toUpperCase()}
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-white">{result.name}</h3>
                <p className="text-sm" style={{ color: '#00ffff' }}>Global Rank #{result.rank.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <FiStar />, label: 'Stars', value: result.stars, color: '#ffff00' },
                { icon: <FiZap />, label: 'Demons', value: result.demons, color: '#ff4444' },
                { icon: <FiAward />, label: 'Creator Pts', value: result.cp, color: '#00ff88' },
                { icon: <FiTrendingUp />, label: 'Diamonds', value: result.diamonds, color: '#00ccff' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="text-center p-3 rounded-xl"
                  style={{
                    background: `${stat.color}08`,
                    border: `1px solid ${stat.color}22`,
                  }}
                >
                  <div className="flex justify-center mb-1" style={{ color: stat.color }}>{stat.icon}</div>
                  <div className="font-bold text-white text-lg">{stat.value.toLocaleString()}</div>
                  <div className="text-xs" style={{ color: '#9ca3af' }}>{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
