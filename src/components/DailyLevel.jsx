import { motion } from 'framer-motion'
import { FiClock, FiPlay, FiHeart, FiDownload } from 'react-icons/fi'

const dailyLevels = [
  {
    title: 'Abyss of Darkness',
    creator: 'Exen',
    difficulty: 'Extreme Demon',
    diffColor: '#ff0044',
    downloads: 842301,
    likes: 56200,
    length: 'XL',
    type: 'Daily',
    accent: '#ff0044',
  },
  {
    title: 'Neon Odyssey',
    creator: 'Serponge',
    difficulty: 'Insane',
    diffColor: '#ff00ff',
    downloads: 1203400,
    likes: 89100,
    length: 'Long',
    type: 'Weekly',
    accent: '#00ffff',
  },
]

export default function DailyLevel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {dailyLevels.map((level, i) => (
        <motion.div
          key={level.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.2 }}
          whileHover={{ scale: 1.03, y: -5 }}
          className="relative rounded-2xl overflow-hidden cursor-pointer group"
          style={{
            background: 'rgba(10, 10, 30, 0.9)',
            border: `1px solid ${level.accent}33`,
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Animated glow border */}
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              boxShadow: `inset 0 0 30px ${level.accent}22, 0 0 30px ${level.accent}15`,
            }}
          />

          {/* Type badge */}
          <div className="px-6 pt-5 pb-0 flex items-center gap-2">
            <motion.span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{
                background: `${level.accent}22`,
                color: level.accent,
                border: `1px solid ${level.accent}44`,
                textShadow: `0 0 8px ${level.accent}`,
              }}
              animate={{ boxShadow: [`0 0 8px ${level.accent}33`, `0 0 16px ${level.accent}55`, `0 0 8px ${level.accent}33`] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <FiClock className="inline mr-1" size={10} />
              {level.type} Level
            </motion.span>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-2xl font-black text-white mb-1">{level.title}</h3>
            <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>
              by <span style={{ color: level.accent }}>{level.creator}</span>
            </p>

            {/* Difficulty + Length */}
            <div className="flex gap-3 mb-4">
              <span
                className="px-3 py-1 rounded-lg text-xs font-bold"
                style={{ background: `${level.diffColor}22`, color: level.diffColor }}
              >
                {level.difficulty}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-bold" style={{ background: '#ffffff11', color: '#ccc' }}>
                {level.length}
              </span>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm" style={{ color: '#9ca3af' }}>
              <div className="flex items-center gap-1">
                <FiDownload size={14} style={{ color: level.accent }} />
                {(level.downloads / 1000).toFixed(0)}K
              </div>
              <div className="flex items-center gap-1">
                <FiHeart size={14} style={{ color: '#ff4488' }} />
                {(level.likes / 1000).toFixed(0)}K
              </div>
            </div>
          </div>

          {/* Play button overlay */}
          <motion.div
            className="absolute top-4 right-4 w-12 h-12 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background: `linear-gradient(135deg, ${level.accent}, ${level.accent}88)`,
              boxShadow: `0 0 20px ${level.accent}44`,
            }}
            whileHover={{ scale: 1.1 }}
          >
            <FiPlay size={20} color="#000" />
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}
