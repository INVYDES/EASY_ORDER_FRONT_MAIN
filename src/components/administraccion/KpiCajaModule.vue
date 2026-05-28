<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Header con Selector de Cajero -->
    <div class="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-6">
      <div class="flex items-center gap-6">
        <div class="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-3xl shadow-lg shadow-emerald-100">
          <i class="fa-solid fa-cash-register"></i>
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-800 dark:text-gray-200">Rendimiento de Caja {{ filtros.cajero_id ? 'Particular' : 'General' }}</h2>
          <p class="text-gray-400 dark:text-gray-500 font-medium">Seguimiento de tiempos de cobro y precisión en arqueos.</p>
        </div>
      </div>

      <div class="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-700">
        <select v-model="filtros.cajero_id" @change="loadKpis" 
          class="bg-transparent border-none focus:ring-0 font-black text-gray-700 dark:text-gray-300 min-w-[200px] cursor-pointer">
          <option value="">💵 Todos los Cajeros</option>
          <option v-for="c in listaCajeros" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>
        <div class="w-px h-8 bg-gray-200 dark:bg-gray-600"></div>
        <input type="date" v-model="filtros.fecha_desde" @change="loadKpis" class="bg-transparent border-none focus:ring-0 text-xs font-bold text-gray-500 dark:text-gray-400 dark:text-gray-500 w-28">
        <input type="date" v-model="filtros.fecha_hasta" @change="loadKpis" class="bg-transparent border-none focus:ring-0 text-xs font-bold text-gray-500 dark:text-gray-400 dark:text-gray-500 w-28">
      </div>
    </div>

    <!-- Cards de Métricas -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-8 group hover:shadow-lg transition-all">
        <div class="w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl shadow-inner">
          <i class="fa-solid fa-scale-balanced"></i>
        </div>
        <div>
          <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Diferencia Acumulada</p>
          <p class="text-5xl font-black tracking-tighter" :class="kpis.diferencia_acumulada < 0 ? 'text-rose-600' : 'text-emerald-600'">
            ${{ fm(kpis.diferencia_acumulada) }}
          </p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium">Balance total de cierres</p>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-8 group hover:shadow-lg transition-all">
        <div class="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-4xl shadow-inner">
          <i class="fa-solid fa-clock"></i>
        </div>
        <div>
          <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Tiempo de Cobro</p>
          <p class="text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">{{ avgPaymentTime }} min</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium">Promedio desde solicitud a cierre</p>
        </div>
      </div>
    </div>

    <!-- Desglose por Cajero -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div class="xl:col-span-1 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <h3 class="font-black text-gray-800 dark:text-gray-200 text-lg mb-6">Eficiencia Individual</h3>
        <div class="space-y-4">
          <div v-for="c in kpis.tiempos_cobro" :key="c.cajero" class="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 flex justify-between items-center hover:bg-white dark:bg-gray-800 hover:shadow-md transition-all">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                {{ c.cajero.charAt(0) }}
              </div>
              <div>
                <p class="font-black text-gray-800 dark:text-gray-200">{{ c.cajero }}</p>
                <p class="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black">{{ c.total_cobros }} tickets</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xl font-black text-gray-900 dark:text-gray-100">{{ Math.round(c.tiempo_avg_min * 10) / 10 }}'</p>
            </div>
          </div>
        </div>
      </div>

      <div class="xl:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <h3 class="font-black text-gray-800 dark:text-gray-200 text-lg mb-8">Volumen de Operación</h3>
        <div class="h-[350px]">
          <canvas id="barCaja"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { apiClient } from '@/utils/apiClient'
import Chart from 'chart.js/auto'

const props = defineProps({
  apiUrl: String,
  getHeaders: Function,
  serverDate: { type: String, default: '' },
})

const getServerToday = () => props.serverDate || new Date().toLocaleDateString('en-CA')

const kpis = ref({
  tiempos_cobro: [],
  diferencia_acumulada: 0
})

const listaCajeros = ref([])

const filtros = reactive({
  cajero_id: '',
  fecha_desde: (() => {
    const d = new Date(getServerToday() + 'T00:00:00')
    return new Date(d.getFullYear(), d.getMonth(), 1).toLocaleDateString('en-CA')
  })(),
  fecha_hasta: getServerToday()
})

const avgPaymentTime = computed(() => {
  if (!kpis.value.tiempos_cobro.length) return 0
  const sum = kpis.value.tiempos_cobro.reduce((s, c) => s + c.tiempo_avg_min, 0)
  return Math.round((sum / kpis.value.tiempos_cobro.length) * 10) / 10
})

const fm = (v) => v ? Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'

let barChart = null

const loadCajeros = async () => {
  try {
    const res = await apiClient.get('/empleados?puesto=caja')
    if (res.success) listaCajeros.value = res.data
  } catch (e) { console.error(e) }
}

const loadKpis = async () => {
  try {
    const params = { ...filtros }
    if (filtros.cajero_id) params.user_id = filtros.cajero_id

    const res = await apiClient.get('/kpis/caja', { params })
    if (res.success) {
      kpis.value = res.data
      initBarChart()
    }
  } catch (e) {
    console.error(e)
  }
}

const initBarChart = () => {
  const ctx = document.getElementById('barCaja')
  if (!ctx) return
  if (barChart) barChart.destroy()

  const labels = kpis.value.tiempos_cobro.map(c => c.cajero)
  const data = kpis.value.tiempos_cobro.map(c => c.total_cobros)

  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Volumen de Cobros',
        data,
        backgroundColor: '#3b82f6',
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } }
    }
  })
}

onMounted(() => {
  loadCajeros()
  loadKpis()
})
</script>
