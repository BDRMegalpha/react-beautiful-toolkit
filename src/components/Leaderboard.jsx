import { motion } from 'framer-motion'
import { FiChevronUp, FiChevronDown, FiMinus } from 'react-icons/fi'

const mockLeaderboard = [
  { rank: 1, name: 'SrGuillester', stars: 98432, demons: 1203, trend: 'up' },
  { rank: 2, name: 'Zoink', stars: 94211, demons: 1187, trend: 'up' },
  { rank: 3, name: 'Stormfly', stars: 91005, demons: 1156, trend: 'same' },
  { rank: 4, name: 'Demon5layer', stars: 88321, demons: 1098, trend: 'down' },
  { rank: 5, name: 'AeonAir', stars: 85412, demons: 1052, trend: 'up' },
  { rank: 6, name: 'Doggie', stars: 83100, demons: 1031, trend: 'same' },
  { rank: 7, name: 'Wulzy', stars: 81245, demons: 998, trend: 'up' },
  { rank: 8, name: 'Technical', stars: 79821, demons: 967, trend: 'down' },
]

const rankColors = ['#ffdd00', '#c0c0c0', '#cd7f32']

export default function Leaderboard() {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(10, 10, 30, 0.85)',
          border: '1px solid rgba(0, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 40px rgba(0, 255, 255, 0.08)',
        }}
      >
        {/* Header */}
        <div
          className="grid grid-cols-12 gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest"
          style={{ color: '#00ffff88', borderBottom: '1px solid rgba(0, 255, 255, 0.1)' }}
        >
          <div className="col-span-1">#</div>
          <div className="col-span-5">Player</div>
          <div className="col-span-2 text-right">Stars</div>
          <div className="col-span-2 text-right">Demons</div>
          <div className="col-span-2 text-right">Trend</div>
        </div>

        {/* Rows */}
        {mockLeaderboard.map((player, i) => (
          <motion.div
            key={player.name}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            whileHover={{
              backgroundColor: 'rgba(0, 255, 255, 0.05)',
              x: 4,
            }}
            className="grid grid-cols-12 gap-2 px-6 py-4 items-center transition-colors cursor-pointer"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
          >
            <div className="col-span-1 font-black text-lg" style={{
              color: rankColors[i] || '#9ca3af',
              textShadow: i < 3 ? `0 0 10px ${rankColors[i]}` : 'none',
            }}>
              {player.rank}
            </div>
            <div className="col-span-5 flex items-center gap-3">
              <motion.div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                style={{
                  background: `linear-gradient(135deg, ${rankColors[i] || '#6366f1'}22, ${rankColors[i] || '#6366f1'}11)`,
                  border: `1px solid ${rankColors[i] || '#6366f1'}33`,
                  color: rankColors[i] || '#c4b5fd',
                }}
                whileHover={{ scale: 1.15, rotate: 5 }}
              >
                {player.name[0]}
              </motion.div>
              <span className="font-semibold text-white">{player.name}</span>
            </div>
            <div className="col-span-2 text-right font-mono font-bold" style={{ color: '#ffff00' }}>
              {player.stars.toLocaleString()}
            </div>
            <div className="col-span-2 text-right font-mono font-bold" style={{ color: '#ff4444' }}>
              {player.demons.toLocaleString()}
            </div>
            <div className="col-span-2 text-right">
              {player.trend === 'up' && <FiChevronUp className="inline" style={{ color: '#00ff88' }} />}
              {player.trend === 'down' && <FiChevronDown className="inline" style={{ color: '#ff4444' }} />}
              {player.trend === 'same' && <FiMinus className="inline" style={{ color: '#6b7280' }} />}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
