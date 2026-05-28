import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(() => ({
  base: process.env.VITE_BASE_PATH || '/cws/eorder/',
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
      host: '192.168.1.71',
      protocol: 'ws',
      port: 5173,
    },
    // 👇 Agrega esto
    proxy: {
      '/cws/eorder/api': {
        target: 'http://192.168.1.71:8000', // ← IP y puerto de tu backend Laravel
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // mantiene la ruta tal cual
      }
    }
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          charts: ['apexcharts', 'vue3-apexcharts'],
          echo: ['laravel-echo', 'pusher-js'],
        },
      },
    },
    chunkSizeWarningLimit: 400,
  },
}))