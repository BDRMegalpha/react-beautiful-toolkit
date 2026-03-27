import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiUsers, FiMessageCircle, FiGlobe, FiExternalLink } from 'react-icons/fi'

const COMMUNITIES = [
  { name: 'r/geometrydash', desc: 'The main GD subreddit with 300K+ members', url: 'https://reddit.com/r/geometrydash', color: '#ff4500', icon: <FiGlobe /> },
  { name: 'GD Discord', desc: 'Official Geometry Dash Discord server', url: 'https://discord.gg/geometrydash', color: '#5865f2', icon: <FiMessageCircle /> },
  { name: 'Demonlist Discord', desc: 'Pointercrate Demon List community', url: 'https://discord.gg/demonlist', color: '#ff4444', icon: <FiMessageCircle /> },
  { name: 'GD Creator School', desc: 'Learn level creation and editor tricks', url: 'https://discord.gg/gdcreatorschool', color: '#00ff88', icon: <FiMessageCircle /> },
  { name: 'GD Forum', desc: 'Community forums for discussion', url: 'https://geometrydashforum.com', color: '#00ccff', icon: <FiGlobe /> },
  { name: 'GD Newgrounds', desc: 'Music community powering GD songs', url: 'https://www.newgrounds.com/audio', color: '#ffcc00', icon: <FiGlobe /> },
]

export default function CrewFinder() {
  return (
    <div className="min-h-screen px-4 sm:px-8 py-20" style={{ background: '#050514', color: '#fff' }}>
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-sm" style={{ color: '#00ffff', textDecoration: 'none' }}>
          <FiArrowLeft /> Back to DashRadar
        </Link>

        <h1 className="text-3xl sm:text-4xl font-black mb-2" style={{ color: '#00ff88' }}>Crew Finder</h1>
        <p className="mb-8" style={{ color: '#9ca3af' }}>Find GD communities, crews, and friends to play with.</p>

        {/* Coming Soon Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl mb-8 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,255,255,0.08))', border: '1px solid rgba(0,255,136,0.2)' }}>
          <FiUsers size={40} className="mx-auto mb-3" style={{ color: '#00ff88' }} />
          <h2 className="text-xl font-bold text-white mb-2">Crew Matching Coming Soon</h2>
          <p className="text-sm" style={{ color: '#9ca3af' }}>We're building a system to match you with players at your skill level. In the meantime, join these communities!</p>
        </motion.div>

        {/* Community Links */}
        <h3 className="text-lg font-bold mb-4 text-white">GD Communities</h3>
        <div className="space-y-3">
          {COMMUNITIES.map((c, i) => (
            <motion.a key={c.name} href={c.url} target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              whileHover={{ x: 6, backgroundColor: `${c.color}08` }}
              className="flex items-center gap-4 p-4 rounded-xl cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${c.color}15`, textDecoration: 'none' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${c.color}15`, color: c.color }}>
                {c.icon}
              </div>
              <div className="flex-1">
                <div className="font-bold text-white text-sm">{c.name}</div>
                <div className="text-xs" style={{ color: '#9ca3af' }}>{c.desc}</div>
              </div>
              <FiExternalLink size={16} style={{ color: '#4b5563' }} />
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  )
}
