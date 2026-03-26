import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'client',
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:5001',
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
})
