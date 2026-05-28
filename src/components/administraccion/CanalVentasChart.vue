<template>
  <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative">
    <!-- Spinner de carga -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800/80 rounded-2xl z-10">
      <div class="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm">
        <div class="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
        Cargando...
      </div>
    </div>

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">Canal de Ventas</h3>
      </div>
      <div class="flex items-center gap-3">
        <!-- Legend inline -->
        <div class="hidden md:flex gap-2">
          <div v-for="canal in legend" :key="canal.label" class="flex items-center gap-1">
            <div class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: canal.color }"></div>
            <span class="text-[9px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-wider">{{ canal.label }}</span>
          </div>
        </div>
        <!-- Botones de Período -->
        <div class="flex gap-1 bg-gray-100 dark:bg-gray-700 p-0.5 rounded-full">
          <button v-for="p in periodos" :key="p.value" @click="cambiarPeriodo(p.value)"
            :class="['px-2.5 py-0.5 text-[10px] rounded-full font-bold transition',
              periodoActivo === p.value ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:bg-gray-600']">
            {{ p.label }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="!loading && totalPedidos === 0" class="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
      <span class="text-4xl mb-3">📊</span>
      <p class="text-sm font-semibold">Sin ventas en el período</p>
    </div>

    <template v-else>
    <div class="relative h-64 flex items-center justify-center">
      <canvas ref="canvasEl"></canvas>
      <!-- Total central -->
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span class="text-3xl font-black text-gray-800 dark:text-gray-200">{{ totalPedidos }}</span>
        <span class="text-xs text-gray-400 dark:text-gray-500 font-medium">pedidos</span>
      </div>
    </div>

    <!-- Detalle por canal -->
    <div class="mt-4 grid grid-cols-3 gap-3 text-center">
      <div v-for="canal in legend" :key="canal.label" class="rounded-xl p-2" :style="{ backgroundColor: canal.color + '15' }">
        <p class="text-xs font-bold" :style="{ color: canal.color }">{{ canal.label }}</p>
        <p class="text-lg font-black text-gray-800 dark:text-gray-200">{{ localData[canal.label] || 0 }}</p>
        <p class="text-[10px] text-gray-400 dark:text-gray-500">{{ totalPedidos ? Math.round((localData[canal.label] || 0) / totalPedidos * 100) : 0 }}%</p>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, reactive } from 'vue'

const props = defineProps({
  apiUrl:     { type: String,   required: true },
  getHeaders: { type: Function, required: true },
  refreshKey: { type: Number,   default: 0 },
  serverDate: { type: String,   default: '' },
})

const canvasEl = ref(null)
let chartInstance = null

const loading = ref(false)
const periodoActivo = ref(1)

const localData = reactive({
  Local: 0,
  Pickup: 0,
  Delivery: 0
})

const legend = [
  { label: 'Local',    color: '#4f46e5' },
  { label: 'Pickup',   color: '#f59e0b' },
  { label: 'Delivery', color: '#10b981' },
]

const periodos = [
  { label: 'Hoy', value: 1  },
  { label: '7d',  value: 7  },
  { label: '14d', value: 14 },
  { label: '30d', value: 30 },
]

const totalPedidos = computed(() =>
  (localData.Local || 0) + (localData.Pickup || 0) + (localData.Delivery || 0)
)

const getServerToday = () => props.serverDate || new Date().toLocaleDateString('en-CA')

const getRange = (dias) => {
  const hoyStr = getServerToday()
  const finStr = hoyStr
  if (dias === 1) {
    return { iniStr: hoyStr, finStr: hoyStr }
  }
  const iniDate = new Date(hoyStr + 'T00:00:00')
  iniDate.setDate(iniDate.getDate() - dias + 1)
  const iniStr = iniDate.toLocaleDateString('en-CA')
  return { iniStr, finStr }
}

const loadChartJS = () => new Promise(resolve => {
  if (window.Chart) { resolve(); return }
  const s = document.createElement('script')
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
  s.onload = resolve; document.head.appendChild(s)
})

const fetchYDraw = async (dias) => {
  loading.value = true
  try {
    const { iniStr, finStr } = getRange(dias)
    const res = await fetch(
      `${props.apiUrl}/reportes/ventas-por-canal-tipo?fecha_inicio=${iniStr}&fecha_fin=${finStr}`,
      { headers: props.getHeaders() }
    )
    const data = await res.json()
    if (data.success && data.data) {
      localData.Local = data.data.Local || 0
      localData.Pickup = data.data.Pickup || 0
      localData.Delivery = data.data.Delivery || 0
    }
    await initChart()
  } catch (e) {
    console.error('Error al cargar ventas por canal:', e)
  } finally {
    loading.value = false
  }
}

const cambiarPeriodo = (dias) => {
  periodoActivo.value = dias
  fetchYDraw(dias)
}

const initChart = async () => {
  await loadChartJS()
  if (!canvasEl.value) return
  if (chartInstance) chartInstance.destroy()

  chartInstance = new window.Chart(canvasEl.value, {
    type: 'doughnut',
    data: {
      labels: legend.map(l => l.label),
      datasets: [{
        data: [localData.Local || 0, localData.Pickup || 0, localData.Delivery || 0],
        backgroundColor: legend.map(l => l.color),
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            label: (context) => ` ${context.label}: ${context.raw} pedidos`
          }
        }
      },
      cutout: '70%'
    }
  })
}

watch(() => props.refreshKey, () => fetchYDraw(periodoActivo.value))
onMounted(() => fetchYDraw(periodoActivo.value))
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>
