<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Header con Selector de Cocinero -->
    <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
      <div class="flex items-center gap-6">
        <div class="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center text-white text-3xl shadow-lg shadow-orange-100">
          <i class="fa-solid fa-fire-burner"></i>
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-800">Rendimiento de Cocina {{ filtros.cocinero_id ? 'Particular' : 'General' }}</h2>
          <p class="text-gray-400 font-medium">Análisis de tiempos de respuesta por estación y personal.</p>
        </div>
      </div>

      <div class="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
        <select v-model="filtros.cocinero_id" @change="loadKpis" 
          class="bg-transparent border-none focus:ring-0 font-black text-gray-700 min-w-[200px] cursor-pointer">
          <option value="">👨‍🍳 Toda la Cocina</option>
          <option v-for="c in listaCocineros" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>
        <div class="w-px h-8 bg-gray-200"></div>
        <button @click="showConfig = true" class="p-2 text-gray-400 hover:text-orange-500 transition-colors">
          <i class="fa-solid fa-cog"></i>
        </button>
        <div class="w-px h-8 bg-gray-200"></div>
        <input type="date" v-model="filtros.fecha_desde" @change="loadKpis" class="bg-transparent border-none focus:ring-0 text-xs font-bold text-gray-500 w-28">
        <input type="date" v-model="filtros.fecha_hasta" @change="loadKpis" class="bg-transparent border-none focus:ring-0 text-xs font-bold text-gray-500 w-28">
      </div>
    </div>

    <!-- Cards de Métricas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
        <div class="relative z-10">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tasa de Retraso</p>
          <p class="text-5xl font-black" :class="kpis.pct_retraso > 20 ? 'text-rose-600' : 'text-emerald-600'">
            {{ kpis.pct_retraso }}%
          </p>
          <p class="text-xs text-gray-400 mt-2 font-medium">Órdenes fuera de tiempo límite</p>
          <div class="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
             <div class="h-full transition-all duration-1000" :class="kpis.pct_retraso > 20 ? 'bg-rose-500' : 'bg-emerald-500'" :style="{ width: kpis.pct_retraso + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 group">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Items Preparados</p>
        <p class="text-5xl font-black text-indigo-600 tracking-tighter">{{ kpis.total_items }}</p>
        <p class="text-xs text-gray-400 mt-2 font-medium">Volumen total de producción</p>
      </div>

      <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 group">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Platillo Crítico</p>
        <p class="text-2xl font-black text-gray-800 truncate mb-1">{{ slowDish.nombre || 'N/A' }}</p>
        <div class="flex items-center gap-2">
           <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
           <p class="text-sm font-black text-amber-600">{{ Math.round(slowDish.tiempo_avg_min) }} min prom.</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h3 class="font-black text-gray-800 text-lg mb-8 flex items-center gap-3">
          <div class="w-2 h-8 bg-orange-500 rounded-full"></div>
          Top 10 Tiempos por Platillo
        </h3>
        <div class="h-[400px]">
          <canvas id="barCocina"></canvas>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h3 class="font-black text-gray-800 text-lg mb-6 flex items-center gap-3">
          <div class="w-2 h-8 bg-gray-200 rounded-full"></div>
          Tolerancia por Carga
        </h3>
        <div class="space-y-3">
          <div v-for="(range, idx) in kpis.config_actual" :key="idx" class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
             <div class="flex items-center gap-3">
               <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-gray-400 text-xs">
                 {{ range.min }}-{{ range.max }}
               </div>
               <span class="text-xs font-bold text-gray-600">Órdenes en espera</span>
             </div>
             <p class="text-lg font-black text-orange-600">{{ range.wait }}'</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Configuración -->
    <div v-if="showConfig" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
        <div class="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 class="text-xl font-black text-gray-800">Ajustar Tiempos</h3>
            <p class="text-sm text-gray-500">Minutos aceptables según saturación.</p>
          </div>
          <button @click="showConfig = false" class="text-gray-400 hover:text-gray-600"><i class="fa-solid fa-times"></i></button>
        </div>
        <div class="p-8 space-y-4 max-h-[400px] overflow-y-auto">
          <div v-for="(range, idx) in tempConfig" :key="idx" class="grid grid-cols-3 gap-3 items-end bg-gray-50 p-4 rounded-2xl">
            <input type="number" v-model="range.min" class="border-gray-200 rounded-xl text-xs font-bold" placeholder="Min">
            <input type="number" v-model="range.max" class="border-gray-200 rounded-xl text-xs font-bold" placeholder="Max">
            <input type="number" v-model="range.wait" class="border-gray-200 rounded-xl text-xs font-bold text-orange-600" placeholder="Minutos">
          </div>
          <button @click="addRange" class="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-xs font-bold">+ Agregar</button>
        </div>
        <div class="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
          <button @click="showConfig = false" class="flex-1 py-4 text-xs font-bold text-gray-500">Cancelar</button>
          <button @click="saveConfig" class="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-100">Guardar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { apiClient } from '@/utils/apiClient'
import Chart from 'chart.js/auto'

const props = defineProps({
  apiUrl: String,
  getHeaders: Function
})

const kpis = ref({
  tiempos_platillos: [],
  pct_retraso: 0,
  total_items: 0,
  retrasadas: 0,
  config_actual: []
})

const listaCocineros = ref([])
const slowDish = ref({})
const showConfig = ref(false)
const tempConfig = ref([])

const filtros = reactive({
  cocinero_id: '',
  fecha_desde: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-CA'),
  fecha_hasta: new Date().toLocaleDateString('en-CA')
})

let barChart = null

const loadCocineros = async () => {
  try {
    const res = await apiClient.get('/empleados?puesto=cocina')
    if (res.success) listaCocineros.value = res.data
  } catch (e) { console.error(e) }
}

const loadKpis = async () => {
  try {
    const params = { ...filtros }
    if (filtros.cocinero_id) params.user_id = filtros.cocinero_id

    const res = await apiClient.get('/kpis/cocina', { params })
    if (res.success) {
      kpis.value = res.data
      slowDish.value = [...res.data.tiempos_platillos].sort((a,b) => b.tiempo_avg_min - a.tiempo_avg_min)[0] || {}
      tempConfig.value = JSON.parse(JSON.stringify(kpis.value.config_actual))
      initBarChart()
    }
  } catch (e) {
    console.error(e)
  }
}

const addRange = () => {
  tempConfig.value.push({ min: 0, max: 0, wait: 0 })
}

const saveConfig = async () => {
  try {
    const res = await apiClient.post('/kpis/cocina/config', { wait_times: tempConfig.value })
    if (res.success) {
      showConfig.value = false
      loadKpis()
    }
  } catch (e) { console.error(e) }
}

const initBarChart = () => {
  const ctx = document.getElementById('barCocina')
  if (!ctx) return
  if (barChart) barChart.destroy()

  const labels = kpis.value.tiempos_platillos.map(p => p.nombre)
  const data = kpis.value.tiempos_platillos.map(p => p.tiempo_avg_min)

  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Minutos Promedio',
        data,
        backgroundColor: data.map(v => v > 20 ? 'rgba(244, 63, 94, 0.8)' : 'rgba(99, 102, 241, 0.8)'),
        borderRadius: 12,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { grid: { display: false }, border: { display: false } }
      }
    }
  })
}

onMounted(() => {
  loadCocineros()
  loadKpis()
})
</script>
