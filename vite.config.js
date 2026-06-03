import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_URL || '/',
  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
  server: {
    port: 5173,
    fs: {
      strict: false,
    },
  },
  // Removemos o optimizeDeps problemático e o cacheDir customizado
})