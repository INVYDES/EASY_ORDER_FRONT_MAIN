import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ command }) => ({
  // base '/' para que los assets carguen en la raíz del dominio
  base: '/',

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