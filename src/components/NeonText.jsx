import { motion } from 'framer-motion'

export default function NeonText({ children, color = '#00ffff', size = '4rem', className = '', delay = 0 }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className={className}
      style={{
        fontSize: size,
        fontWeight: 900,
        color: '#fff',
        textShadow: `
          0 0 7px ${color},
          0 0 10px ${color},
          0 0 21px ${color},
          0 0 42px ${color},
          0 0 82px ${color},
          0 0 92px ${color}
        `,
        letterSpacing: '0.05em',
      }}
    >
      {children}
    </motion.span>
  )
}
