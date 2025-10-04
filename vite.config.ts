import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'carbon': ['@carbon/react', '@carbon/icons-react'],
          'charts': ['@carbon/charts', '@carbon/charts-react', 'd3'],
          'router': ['react-router-dom']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true,
  },
  optimizeDeps: {
    include: ['@carbon/react', '@carbon/charts-react']
  }
})
