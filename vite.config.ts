import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: env.VITE_BASE_PATH || '/cws/eorder_b/',
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
      proxy: {
        '/cws/eorder/api': {
          target: 'http://192.168.1.71:8000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
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
  }
})
