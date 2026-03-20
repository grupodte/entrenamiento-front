import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['@tanstack/react-router'],
          'gsap': ['gsap'],
          'supabase': ['@supabase/supabase-js'],
          'mux': ['@mux/mux-player-react'],
          'i18n': ['i18next', 'react-i18next'],
        }
      }
    }
  }
})
