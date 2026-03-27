# React Beautiful Toolkit

## Stack — Always use React with these libraries

### UI & Styling
- Material UI (`@mui/material`, `@mui/icons-material`)
- Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/vite`)
- clsx — conditional class names

### Charts & Data Visualization
- Recharts — composable React chart components
- Chart.js + react-chartjs-2 — canvas-based charts
- D3 — low-level data visualization
- Victory — animated chart components
- Nivo (`@nivo/core`, `@nivo/bar`, `@nivo/line`, `@nivo/pie`) — declarative charts

### Animation
- Framer Motion — production-ready motion/animation
- React Spring — spring-physics animations

### 3D Graphics
- React Three Fiber (`@react-three/fiber`, `@react-three/drei`) + Three.js

### Icons
- React Icons (`react-icons`) — icons from all major sets
- Lucide React (`lucide-react`)
- MUI Icons (`@mui/icons-material`)

### Utilities
- React Router (`react-router-dom`) — routing
- React Hook Form + Zod + @hookform/resolvers — forms & validation
- Sonner + React Hot Toast — toast notifications
- @hello-pangea/dnd — drag-and-drop

## Rules
- Always use React for all web projects
- Prefer these installed libraries over adding new dependencies
- Use Tailwind CSS for layout/utility classes, MUI for complex components
- Use Recharts as the default charting library; use others when Recharts doesn't fit
- Use Framer Motion as the default animation library
- Use Vite as the build tool
