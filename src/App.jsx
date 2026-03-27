import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Button, Card, CardContent, Typography, Chip, Switch, CssBaseline } from '@mui/material'
import { FiSun, FiMoon, FiBarChart2, FiLayers, FiZap, FiBox } from 'react-icons/fi'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts'
import { Toaster, toast } from 'sonner'
import './App.css'

const chartData = [
  { name: 'Jan', value: 400, sales: 240, growth: 100 },
  { name: 'Feb', value: 300, sales: 139, growth: 200 },
  { name: 'Mar', value: 600, sales: 980, growth: 350 },
  { name: 'Apr', value: 800, sales: 390, growth: 480 },
  { name: 'May', value: 500, sales: 480, growth: 520 },
  { name: 'Jun', value: 900, sales: 380, growth: 610 },
]

const pieData = [
  { name: 'React', value: 40, color: '#6366f1' },
  { name: 'Charts', value: 25, color: '#8b5cf6' },
  { name: 'Design', value: 20, color: '#a78bfa' },
  { name: 'Motion', value: 15, color: '#c4b5fd' },
]

const features = [
  { icon: <FiBarChart2 />, title: 'Recharts + Chart.js + Nivo', desc: 'Multiple charting libraries for any visualization need' },
  { icon: <FiLayers />, title: 'Material UI + Tailwind', desc: 'Beautiful components with utility-first styling' },
  { icon: <FiZap />, title: 'Framer Motion + React Spring', desc: 'Smooth animations and transitions' },
  { icon: <FiBox />, title: 'Three.js (R3F)', desc: '3D graphics and WebGL right in React' },
]

function App() {
  const [darkMode, setDarkMode] = useState(true)

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#6366f1' },
      secondary: { main: '#8b5cf6' },
    },
    shape: { borderRadius: 12 },
    typography: { fontFamily: 'system-ui, -apple-system, sans-serif' },
  })

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster richColors position="top-right" theme={darkMode ? 'dark' : 'light'} />
      <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>

        {/* Header */}
        <motion.header
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto"
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            React Beautiful Toolkit
          </h1>
          <div className="flex items-center gap-2">
            <FiSun className="text-yellow-400" />
            <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} color="secondary" />
            <FiMoon className="text-indigo-400" />
          </div>
        </motion.header>

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center py-16 px-8 max-w-4xl mx-auto"
        >
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Build Beautiful Things
          </h2>
          <p className={`text-xl mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Your React toolkit with charts, UI components, animations, 3D, and more — all pre-configured and ready to go.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            {['Recharts', 'Chart.js', 'D3', 'Victory', 'Nivo', 'MUI', 'Tailwind', 'Framer Motion', 'Three.js', 'React Spring'].map((lib) => (
              <Chip key={lib} label={lib} variant="outlined" color="primary" size="small"
                onClick={() => toast.success(`${lib} is installed and ready!`)} />
            ))}
          </div>
        </motion.section>

        {/* Charts Grid */}
        <section className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Card sx={{ bgcolor: darkMode ? '#1e1b4b22' : '#fff', backdropFilter: 'blur(10px)', border: '1px solid', borderColor: darkMode ? '#6366f133' : '#e5e7eb' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Revenue Overview</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <Tooltip contentStyle={{ background: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: 8 }} />
                    <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="sales" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Area Chart */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Card sx={{ bgcolor: darkMode ? '#1e1b4b22' : '#fff', backdropFilter: 'blur(10px)', border: '1px solid', borderColor: darkMode ? '#6366f133' : '#e5e7eb' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Growth Trend</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <Tooltip contentStyle={{ background: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: 8 }} />
                    <Area type="monotone" dataKey="growth" stroke="#8b5cf6" fill="url(#colorGrowth)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Line Chart */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Card sx={{ bgcolor: darkMode ? '#1e1b4b22' : '#fff', backdropFilter: 'blur(10px)', border: '1px solid', borderColor: darkMode ? '#6366f133' : '#e5e7eb' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <Tooltip contentStyle={{ background: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: 8 }} />
                    <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} />
                    <Line type="monotone" dataKey="sales" stroke="#a78bfa" strokeWidth={3} dot={{ fill: '#a78bfa', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pie Chart */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Card sx={{ bgcolor: darkMode ? '#1e1b4b22' : '#fff', backdropFilter: 'blur(10px)', border: '1px solid', borderColor: darkMode ? '#6366f133' : '#e5e7eb' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Tech Distribution</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-8 py-16">
          <h3 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            What's Included
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <Card sx={{
                  height: '100%',
                  bgcolor: darkMode ? '#1e1b4b22' : '#fff',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: darkMode ? '#6366f133' : '#e5e7eb',
                  transition: 'all 0.3s',
                  '&:hover': { borderColor: '#6366f1' }
                }}>
                  <CardContent className="text-center">
                    <div className="text-3xl text-indigo-500 mb-3 flex justify-center">{f.icon}</div>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>{f.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center py-16 px-8"
        >
          <Button
            variant="contained"
            size="large"
            onClick={() => toast.success('Happy building! All libraries are ready to use.')}
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              px: 4, py: 1.5, fontSize: '1.1rem',
              '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }
            }}
          >
            Start Building
          </Button>
        </motion.section>

        <footer className={`text-center py-8 text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
          React Beautiful Toolkit — Built with React + Vite
        </footer>
      </div>
    </ThemeProvider>
  )
}

export default App
