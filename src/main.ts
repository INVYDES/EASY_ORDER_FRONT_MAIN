// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import VueApexCharts from "vue3-apexcharts"
import './index.css'

// 👇 IMPORTACIÓN CORRECTA
import './plugins/echo'

const app = createApp(App)

app.use(router)
app.use(createPinia())
app.use(VueApexCharts)

app.mount('#app')