// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import './index.css'

// 👇 IMPORTACIÓN CORRECTA
import './plugins/fetchInterceptor'
import './plugins/echo'

// Analítica opcional: no carga nada si no está configurada en el .env
import { initAnalytics, escucharConsentimiento } from './plugins/analytics'

// Modo oscuro global del sitio público (clase .tema-oscuro en <html>)
import { iniciarTemaGlobal } from './utils/tema'

const app = createApp(App)

app.use(router)
app.use(createPinia())

// ApexCharts NO se registra global: su chunk (~500 KB) solo lo necesita la
// vista de análisis. MetricasMeseros.vue lo importa localmente, así que el
// bundle inicial no lo descarga.

// Requiere Pinia activo: lee la preferencia guardada y la aplica a <html>
iniciarTemaGlobal()

initAnalytics()
escucharConsentimiento()

app.mount('#app')