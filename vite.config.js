import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // VITE_BASE lets different deployment targets set their own sub-path.
  // GitHub Pages workflow sets VITE_BASE=/AI_Catchup/; Docker and local dev leave it unset (→ /).
  base: process.env.VITE_BASE ?? '/',
  build: {
    // Lesson prose dominates the bundle: ~600kB for the 16 GenAI modules plus
    // ~400kB for the 14 interview-prep modules. Each track gets its own chunk,
    // separate from React and from the app shell, so editing content in one
    // track invalidates neither the vendor chunk nor the other track's cache.
    // Both are still loaded eagerly — the app is designed to run locally and
    // offline, so that is the right tradeoff against lazy-loading 30 files.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor'
          if (id.includes('/src/data/modules/')) return 'curriculum'
          if (id.includes('/src/data/prep/')) return 'prep'
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
})
