import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // VITE_BASE lets different deployment targets set their own sub-path.
  // GitHub Pages workflow sets VITE_BASE=/AI_Catchup/; Docker and local dev leave it unset (→ /).
  base: process.env.VITE_BASE ?? '/',
  build: {
    // The curriculum is ~600kB of lesson prose. Splitting it from React and
    // from the app shell means editing content doesn't invalidate the vendor
    // chunk, and vice versa. It is still loaded eagerly — the app is designed
    // to run locally/offline, so one 280kB gzipped payload is the right
    // tradeoff against the complexity of lazy-loading 16 module files.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor'
          if (id.includes('/src/data/modules/')) return 'curriculum'
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
})
