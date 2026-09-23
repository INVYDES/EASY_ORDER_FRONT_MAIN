import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(() => ({
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
    // ── Code-splitting para mejorar el LCP ──────────────────────────────
    // Los vendors pesados viven en chunks propios y cacheables: cuando el
    // deploy cambia el código de la app, el navegador no vuelve a bajar
    // chart libs ni PDFs si su hash no cambió.
    rollupOptions: {
      output: {
        manualChunks(id) {
          // El helper de preload de Vite vive en node_modules/vite y debe
          // ir con el código base (chunk vue, que el entry importa de forma
          // estática). Si no, Rollup lo coloca junto al primer importador y
          // puede arrastrar un vendor pesado al chunk inicial.
          if (id.includes('vite/preload-helper') || id.includes('modulepreload-polyfill')) {
            return 'vue'
          }
          if (id.includes('node_modules')) {
            // Gráficas (~1.2 MB): solo las carga la vista de análisis
            if (id.includes('apexcharts') || id.includes('vue3-apexcharts') || id.includes('chart.js')) {
              return 'charts'
            }
            // PDF (~400 KB): solo flujo de recibos/tickets
            if (id.includes('jspdf')) {
              return 'pdf'
            }
            // Excel (~430 KB): solo el modal de importación de productos            if (id.includes('xlsx')) {
              return 'excel'
            }
            // Vue + router + pinia van al entry para máxima caché
            if (id.includes('/vue/') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vue'
            }
            // Todo el resto de node_modules al vendor general
            return 'vendor'
          }
        },
      },
    },
  },
}))