import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/gd-api': {
        target: 'https://gdbrowser.com/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gd-api/, ''),
      },
      '/aredl-api': {
        target: 'https://api.aredl.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/aredl-api/, ''),
      },
    },
  },
})
