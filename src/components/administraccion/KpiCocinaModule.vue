<template>
  <div class="space-y-6">
    <!-- Header con Selector de Cocinero -->
    <div class="bg-white rounded-xl p-6 shadow-xs border border-[#DDE3DE] flex flex-col md:flex-row justify-between items-center gap-6">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-xl shrink-0">
          <i class="fa-solid fa-fire-burner"></i>
        </div>
        <div>
          <h2 class="text-base font-semibold text-[#202723]">Rendimiento de Cocina {{ filtros.cocinero_id ? 'Particular' : 'General' }}</h2>
          <p class="text-xs text-[#68736C] mt-0.5">Análisis de tiempos de respuesta por estación y personal.</p>
        </div>
      </div>

      <div class="flex items-center gap-3 bg-[#F6F7F5] p-1.5 rounded-lg border border-[#DDE3DE]">
        <select v-model="filtros.cocinero_id" @change="loadKpis" 
          class="bg-transparent border-none focus:ring-0 text-xs font-semibold text-[#202723] min-w-[180px] cursor-pointer">
          <option value="">Toda la Cocina</option>
          <option v-for="c in listaCocineros" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>
        <div class="w-px h-6 bg-[#DDE3DE]"></div>
        <button @click="showConfig = true" class="p-1.5 text-[#68736C] hover:text-[#202723] transition-colors cursor-pointer" title="Ajustar Tiempos">
          <i class="fa-solid fa-cog text-xs"></i>
        </button>
        <div class="w-px h-6 bg-[#DDE3DE]"></div>
        <input type="date" v-model="filtros.fecha_desde" @change="loadKpis" class="bg-transparent border-none focus:ring-0 text-xs font-medium text-[#202723] cursor-pointer">
        <input type="date" v-model="filtros.fecha_hasta" @change="loadKpis" class="bg-transparent border-none focus:ring-0 text-xs font-medium text-[#202723] cursor-pointer">
      </div>
    </div>

    <!-- Cards de Métricas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white p-5 rounded-xl shadow-xs border border-[#DDE3DE]">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-semibold text-[#68736C] uppercase tracking-wider">Tasa de Retraso</span>
          <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
            :class="kpis.pct_retraso > 20 ? 'bg-[#FBEBEB] text-[#B93838]' : 'bg-[#EBF5EE] text-[#26734D]'">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
        </div>
        <p class="text-3xl font-bold font-mono tabular-nums mb-1" :class="kpis.pct_retraso > 20 ? 'text-[#B93838]' : 'text-[#26734D]'">
          {{ kpis.pct_retraso }}%
        </p>
        <p class="text-xs text-[#68736C] mb-3">Órdenes fuera de tiempo límite</p>
        <div class="h-1.5 w-full bg-[#F0F2EF] rounded-full overflow-hidden">
          <div class="h-full transition-all duration-700" :class="kpis.pct_retraso > 20 ? 'bg-[#B93838]' : 'bg-[#26734D]'" :style="{ width: kpis.pct_retraso + '%' }"></div>
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl shadow-xs border border-[#DDE3DE]">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-semibold text-[#68736C] uppercase tracking-wider">Items Preparados</span>
          <div class="w-7 h-7 rounded-lg bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-xs">
            <i class="fa-solid fa-utensils"></i>
          </div>
        </div>
        <p class="text-3xl font-bold font-mono tabular-nums text-[#202723] mb-1">{{ kpis.total_items }}</p>
        <p class="text-xs text-[#68736C]">Volumen total de producción</p>
      </div>

      <div class="bg-white p-5 rounded-xl shadow-xs border border-[#DDE3DE]">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-semibold text-[#68736C] uppercase tracking-wider">Platillo Crítico</span>
          <div class="w-7 h-7 rounded-lg bg-[#FEF7EC] text-[#A96517] flex items-center justify-center text-xs">
            <i class="fa-solid fa-clock-rotate-left"></i>
          </div>
        </div>
        <p class="text-base font-bold text-[#202723] truncate mb-2">{{ slowDish.nombre || 'N/A' }}</p>
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold font-mono text-[#A96517] bg-[#FEF7EC] border border-[#A96517]/20">
          {{ Math.round(slowDish.tiempo_avg_min || 0) }} min promedio
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow-xs border border-[#DDE3DE] p-6">
        <h3 class="font-semibold text-[#202723] text-base mb-6">
          Top 10 Tiempos por Platillo
        </h3>
        <div class="h-[380px]">
          <canvas id="barCocina"></canvas>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-xs border border-[#DDE3DE] p-6">
        <h3 class="font-semibold text-[#202723] text-base mb-6">
          Tolerancia por Carga
        </h3>
        <div class="space-y-2.5">
          <div v-for="(range, idx) in kpis.config_actual" :key="idx" class="flex items-center justify-between p-3.5 bg-[#F6F7F5] rounded-lg border border-[#DDE3DE]">
             <div class="flex items-center gap-3">
               <div class="w-8 h-8 rounded-md bg-white border border-[#DDE3DE] flex items-center justify-center font-bold text-[#202723] text-xs font-mono">
                 {{ range.min }}-{{ range.max }}
               </div>
               <span class="text-xs font-semibold text-[#202723]">Órdenes en espera</span>
             </div>
             <p class="text-sm font-bold font-mono tabular-nums text-[#245C4F]">{{ range.wait }} min</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Configuración -->
    <div v-if="showConfig" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202723]/50">
      <div class="bg-white rounded-xl shadow-xl border border-[#DDE3DE] w-full max-w-md overflow-hidden">
        <div class="p-6 border-b border-[#DDE3DE] flex justify-between items-center bg-[#F6F7F5]">
          <div>
            <h3 class="text-base font-semibold text-[#202723]">Ajustar Tiempos de Tolerancia</h3>
            <p class="text-xs text-[#68736C] mt-0.5">Minutos aceptables según saturación.</p>
          </div>
          <button @click="showConfig = false" class="text-[#68736C] hover:text-[#202723] cursor-pointer"><i class="fa-solid fa-times"></i></button>
        </div>
        <div class="p-6 space-y-3 max-h-[360px] overflow-y-auto">
          <div v-for="(range, idx) in tempConfig" :key="idx" class="grid grid-cols-3 gap-2.5 items-end bg-[#F6F7F5] p-3 rounded-lg border border-[#DDE3DE]">
            <div>
              <span class="text-[10px] text-[#68736C] font-semibold block mb-0.5">Mín</span>
              <input type="number" v-model="range.min" class="w-full border border-[#DDE3DE] bg-white rounded-md text-xs font-medium px-2 py-1.5" placeholder="Mín">
            </div>
            <div>
              <span class="text-[10px] text-[#68736C] font-semibold block mb-0.5">Máx</span>
              <input type="number" v-model="range.max" class="w-full border border-[#DDE3DE] bg-white rounded-md text-xs font-medium px-2 py-1.5" placeholder="Máx">
            </div>
            <div>
              <span class="text-[10px] text-[#68736C] font-semibold block mb-0.5">Minutos</span>
              <input type="number" v-model="range.wait" class="w-full border border-[#DDE3DE] bg-white rounded-md text-xs font-bold text-[#245C4F] px-2 py-1.5" placeholder="Min">
            </div>
          </div>
          <button @click="addRange" class="w-full py-2.5 border border-dashed border-[#DDE3DE] rounded-lg text-[#68736C] hover:text-[#202723] hover:bg-[#F6F7F5] text-xs font-semibold cursor-pointer transition-colors">+ Agregar Rango</button>
        </div>
        <div class="p-4 bg-[#F6F7F5] border-t border-[#DDE3DE] flex justify-end gap-3">
          <button @click="showConfig = false" class="px-4 py-2 text-xs font-semibold text-[#68736C] hover:text-[#202723] cursor-pointer">Cancelar</button>
          <button @click="saveConfig" class="px-5 py-2 bg-[#245C4F] hover:bg-[#19483D] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer">Guardar</button>
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
  getHeaders: Function,
  serverDate: { type: String, default: '' },
})

const getServerToday = () => props.serverDate || new Date().toLocaleDateString('en-CA')

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
  fecha_desde: (() => {
    const d = new Date(getServerToday() + 'T00:00:00')
    return new Date(d.getFullYear(), d.getMonth(), 1).toLocaleDateString('en-CA')
  })(),
  fecha_hasta: getServerToday()
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
        backgroundColor: data.map(v => v > 20 ? '#B93838' : '#245C4F'),
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: '#F0F2EF' }, border: { display: false } },
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
