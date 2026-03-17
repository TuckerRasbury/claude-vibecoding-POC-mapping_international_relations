import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/claude-vibecoding-POC-mapping_international_relations/',
  build: {
    // Three.js + react-globe.gl are intentionally large (WebGL/3D engine)
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
  },
})
