import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(() => ({
  // base './' para que los assets carguen de forma relativa (útil si está en /eorder/)
  base: './',

  plugins: [
    vue(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      host: '192.168.1.71', // ← tu IP local
      protocol: 'ws',       // ws en dev, no wss
      port: 5173,
    },
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
}))