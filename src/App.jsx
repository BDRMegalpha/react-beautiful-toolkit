import { useEffect, useState, useRef } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import Scene3D from './components/Scene3D'
import NeonText from './components/NeonText'
import GlowCard from './components/GlowCard'
import AnimatedCounter from './components/AnimatedCounter'
import PlayerSearch from './components/PlayerSearch'
import Leaderboard from './components/Leaderboard'
import DailyLevel from './components/DailyLevel'
import DemonList from './components/DemonList'
import PlayerCompare from './components/PlayerCompare'
import PointercrateRankings from './components/PointercrateRankings'
import LevelAnalyzer from './pages/LevelAnalyzer'
import SongExplorer from './pages/SongExplorer'
import DemonTracker from './pages/DemonTracker'
import CrewFinder from './pages/CrewFinder'
import FullDemonList from './pages/FullDemonList'
import { FiZap, FiUsers, FiTrendingUp, FiGlobe, FiArrowRight, FiGithub, FiTarget, FiMusic, FiCompass, FiShield } from 'react-icons/fi'
import { Toaster, toast } from 'sonner'
import './index.css'

function PulsingOrb({ color, size, top, left, delay = 0 }) {
  return (
    <motion.div className="absolute rounded-full pointer-events-none"
      animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.35, 0.15] }}
      transition={{ repeat: Infinity, duration: 4, delay }}
      style={{ width: size, height: size, top, left, background: `radial-gradient(circle, ${color}44, transparent 70%)`, filter: 'blur(40px)' }} />
  )
}

function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 100 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 transition-all duration-300"
      style={{ background: scrolled ? 'rgba(5,5,20,0.9)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid rgba(0,255,255,0.1)' : 'none' }}>
      <Link to="/" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg"
          style={{ background: 'linear-gradient(135deg, #00ffff, #ff00ff)', color: '#000', boxShadow: '0 0 20px rgba(0,255,255,0.3)' }}>DR</div>
        <span className="font-bold text-xl text-white hidden sm:block">Dash<span style={{ color: '#00ffff' }}>Radar</span></span>
      </Link>
      <div className="flex items-center gap-3 sm:gap-6">
        {['Players', 'Levels', 'Leaderboards', 'Tools'].map(item => (
          <motion.a key={item} href={`/#${item.toLowerCase()}`}
            onClick={(e) => { e.preventDefault(); document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' }) }}
            className="text-sm font-medium hidden md:block cursor-pointer" style={{ color: '#9ca3af', textDecoration: 'none' }}
            whileHover={{ color: '#00ffff', y: -2 }}>{item}</motion.a>
        ))}
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #00ffff, #ff00ff)', color: '#000', boxShadow: '0 0 15px rgba(0,255,255,0.3)' }}
          onClick={() => toast.success('Sign up coming soon!')}>Join Now</motion.button>
      </div>
    </motion.nav>
  )
}

function HomePage() {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9])
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -100])

  const tools = [
    { icon: <FiTarget size={28} />, title: 'Level Analyzer', desc: "Deep-dive into any level's difficulty, objects, and structure.", color: '#ff00ff', path: '/tools/level-analyzer' },
    { icon: <FiTrendingUp size={28} />, title: 'Stat Tracker', desc: 'Track your progress over time with beautiful charts and insights.', color: '#00ffff', action: () => { document.getElementById('players')?.scrollIntoView({ behavior: 'smooth' }) }, label: 'Click to go →' },
    { icon: <FiUsers size={28} />, title: 'Crew Finder', desc: 'Find and join GD crews, challenge friends, and build your community.', color: '#00ff88', path: '/tools/crew-finder' },
    { icon: <FiMusic size={28} />, title: 'Song Explorer', desc: 'Browse and preview every Newgrounds and custom song used in GD.', color: '#ffff00', path: '/tools/song-explorer' },
    { icon: <FiCompass size={28} />, title: 'Level Explorer', desc: 'Discover hidden gems with smart filters for difficulty, length, and style.', color: '#ff8800', action: () => { document.getElementById('levels')?.scrollIntoView({ behavior: 'smooth' }) }, label: 'Click to go →' },
    { icon: <FiShield size={28} />, title: 'Demon Tracker', desc: "Track every demon you've beaten and compare with the Pointercrate list.", color: '#ff4444', path: '/tools/demon-tracker' },
  ]

  return (
    <>
      <PulsingOrb color="#00ffff" size="600px" top="-200px" left="-200px" />
      <PulsingOrb color="#ff00ff" size="500px" top="300px" left="70%" delay={1} />
      <PulsingOrb color="#ffff00" size="400px" top="800px" left="10%" delay={2} />
      <PulsingOrb color="#00ff88" size="450px" top="1500px" left="60%" delay={1.5} />
      <PulsingOrb color="#ff00ff" size="500px" top="2200px" left="20%" delay={0.5} />

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <Scene3D />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050514]" style={{ zIndex: 1, pointerEvents: 'none' }} />
        <motion.div style={{ opacity: heroOpacity, scale: heroScale, y: heroY, pointerEvents: 'none' }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="inline-block px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
            style={{ background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.3)', color: '#00ffff' }}>
            The Ultimate Geometry Dash Hub
          </motion.div>
          <div className="mb-6">
            <NeonText color="#00ffff" size="clamp(2.5rem, 6vw, 5rem)" delay={0.5}>Dash</NeonText>
            <NeonText color="#ff00ff" size="clamp(2.5rem, 6vw, 5rem)" delay={0.7}>Radar</NeonText>
          </div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: '#9ca3af', lineHeight: 1.7 }}>
            Compare players head-to-head. Track stats with radar charts. The only GD platform with visual skill analysis and live data.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="flex flex-col sm:flex-row gap-4 justify-center" style={{ pointerEvents: 'auto' }}>
            <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0,255,255,0.4)' }} whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-2 justify-center"
              style={{ background: 'linear-gradient(135deg, #00ffff, #00ff88)', color: '#000', boxShadow: '0 0 25px rgba(0,255,255,0.3)' }}
              onClick={() => document.getElementById('players')?.scrollIntoView({ behavior: 'smooth' })}>
              <FiZap /> Explore Now
            </motion.button>
            <motion.a href="https://github.com/BDRMegalpha/react-beautiful-toolkit" target="_blank" rel="noopener noreferrer"
              whileHover={{ scale: 1.05, borderColor: '#ff00ff' }} whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-2 justify-center"
              style={{ background: 'transparent', border: '2px solid rgba(255,0,255,0.5)', color: '#ff00ff', textDecoration: 'none' }}>
              <FiGithub /> View on GitHub
            </motion.a>
          </motion.div>
          <motion.div className="mt-16" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <div className="w-6 h-10 rounded-full border-2 mx-auto flex justify-center pt-2" style={{ borderColor: '#00ffff44' }}>
              <motion.div className="w-1.5 h-3 rounded-full" style={{ background: '#00ffff' }} animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* STATS */}
      <section className="relative z-10 py-10 sm:py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <AnimatedCounter end={530} suffix="M+" label="Lifetime Downloads" color="#00ffff" />
          <AnimatedCounter end={130} suffix="M+" label="Levels Created" color="#ff00ff" />
          <AnimatedCounter end={10000} suffix="+" label="Demon Levels" color="#ff4444" />
          <AnimatedCounter end={13} suffix="" label="Years Running" color="#00ff88" />
        </div>
      </section>

      {/* PLAYERS */}
      <section id="players" className="relative z-10 py-12 sm:py-20 px-4 sm:px-8">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4" style={{ background: 'linear-gradient(135deg, #00ffff, #ff00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Players</h2>
          <p style={{ color: '#9ca3af' }} className="text-lg">Look up any player or compare two head-to-head</p>
        </motion.div>
        <div className="mb-16" id="search"><h3 className="text-xl sm:text-2xl font-bold text-center mb-6" style={{ color: '#00ffff' }}>Player Lookup</h3><PlayerSearch /></div>
        <div id="compare"><h3 className="text-xl sm:text-2xl font-bold text-center mb-6" style={{ color: '#ff00ff' }}>Player vs Player</h3><PlayerCompare /></div>
      </section>

      {/* LEVELS */}
      <section id="levels" className="relative z-10 py-12 sm:py-20 px-4 sm:px-8">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4" style={{ background: 'linear-gradient(135deg, #ff0044, #ff00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Featured Levels</h2>
          <p style={{ color: '#9ca3af' }} className="text-lg">Today's daily and weekly challenges</p>
        </motion.div>
        <DailyLevel />
      </section>

      {/* LEADERBOARD */}
      <section id="leaderboards" className="relative z-10 py-12 sm:py-20 px-4 sm:px-8">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4" style={{ background: 'linear-gradient(135deg, #ffff00, #ff8800)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Global Leaderboard</h2>
          <p style={{ color: '#9ca3af' }} className="text-lg">Top players ranked by stars and demons beaten</p>
        </motion.div>
        <Leaderboard />
      </section>

      {/* DEMONS + POINTERCRATE RANKINGS */}
      <section className="relative z-10 py-12 sm:py-20 px-4 sm:px-8">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4" style={{ background: 'linear-gradient(135deg, #ff0044, #ff4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pointercrate</h2>
          <p style={{ color: '#9ca3af' }} className="text-lg">Hardest demons and top-ranked players with list points</p>
        </motion.div>
        <div className="mb-16">
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-6" style={{ color: '#ff4444' }}>Hardest Demons</h3>
          <DemonList />
          <div className="text-center mt-6">
            <Link to="/tools/full-demon-list" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
              style={{ background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444', textDecoration: 'none' }}>
              View Full Demon List (Pointercrate + AREDL) →
            </Link>
          </div>
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-6" style={{ color: '#ff8888' }}>Player Rankings (List Points)</h3>
          <PointercrateRankings />
        </div>
      </section>

      {/* TOOLS */}
      <section id="tools" className="relative z-10 py-12 sm:py-20 px-4 sm:px-8">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4" style={{ background: 'linear-gradient(135deg, #00ff88, #00ffff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Powerful Tools</h2>
          <p style={{ color: '#9ca3af' }} className="text-lg">Everything you need to dominate Geometry Dash</p>
        </motion.div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((t, i) => (
            <div key={t.title} onClick={() => t.path ? navigate(t.path) : t.action?.()}>
              <GlowCard color={t.color} delay={i * 0.1}>
                <div className="mb-4" style={{ color: t.color }}>{t.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{t.title}</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.6 }}>{t.desc}</p>
                <div className="mt-3 text-xs font-bold uppercase tracking-wider" style={{ color: t.color, opacity: 0.6 }}>
                  {t.label || (t.path ? 'Open Tool →' : 'Coming Soon')}
                </div>
              </GlowCard>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center rounded-3xl p-12 relative overflow-hidden"
          style={{ background: 'rgba(10,10,30,0.8)', border: '1px solid rgba(0,255,255,0.2)', backdropFilter: 'blur(20px)' }}>
          <motion.div className="absolute inset-0 opacity-20"
            animate={{ background: ['radial-gradient(circle at 20% 50%, #00ffff33, transparent 50%)', 'radial-gradient(circle at 80% 50%, #ff00ff33, transparent 50%)', 'radial-gradient(circle at 50% 20%, #00ff8833, transparent 50%)', 'radial-gradient(circle at 20% 50%, #00ffff33, transparent 50%)'] }}
            transition={{ repeat: Infinity, duration: 6 }} />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">Ready to Dash?</h2>
            <p className="text-lg mb-8" style={{ color: '#9ca3af' }}>Join thousands of players already using DashRadar to level up their game.</p>
            <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(0,255,255,0.5)' }} whileTap={{ scale: 0.95 }}
              className="px-10 py-4 rounded-2xl font-bold text-lg inline-flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #00ffff, #ff00ff)', color: '#000', boxShadow: '0 0 30px rgba(0,255,255,0.3)' }}
              onClick={() => document.getElementById('players')?.scrollIntoView({ behavior: 'smooth' })}>
              Get Started <FiArrowRight />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-8 sm:py-12 px-4 sm:px-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm" style={{ background: 'linear-gradient(135deg, #00ffff, #ff00ff)', color: '#000' }}>DR</div>
            <span className="font-bold text-white">DashRadar</span>
          </div>
          <p style={{ color: '#4b5563', fontSize: '0.85rem' }}>DashRadar — Not affiliated with RobTop Games.</p>
          <div className="flex gap-4">
            <motion.a href="https://github.com/BDRMegalpha/react-beautiful-toolkit" target="_blank" rel="noopener noreferrer" whileHover={{ color: '#00ffff', y: -2 }} style={{ color: '#6b7280' }}><FiGithub size={20} /></motion.a>
            <motion.a href="https://dashradar-app.web.app" whileHover={{ color: '#00ffff', y: -2 }} style={{ color: '#6b7280' }}><FiGlobe size={20} /></motion.a>
          </div>
        </div>
      </footer>
    </>
  )
}

function App() {
  return (
    <div className="min-h-screen" style={{ background: '#050514', color: '#fff', overflowX: 'hidden' }}>
      <Toaster richColors position="top-right" theme="dark" />
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tools/level-analyzer" element={<LevelAnalyzer />} />
        <Route path="/tools/song-explorer" element={<SongExplorer />} />
        <Route path="/tools/demon-tracker" element={<DemonTracker />} />
        <Route path="/tools/crew-finder" element={<CrewFinder />} />
        <Route path="/tools/full-demon-list" element={<FullDemonList />} />
      </Routes>
    </div>
  )
}

export default App
