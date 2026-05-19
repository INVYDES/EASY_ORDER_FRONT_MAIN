<template>
  <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative">
    <!-- Spinner de carga -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl z-10">
      <div class="flex items-center gap-2 text-gray-400 text-sm">
        <div class="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
        Cargando...
      </div>
    </div>

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h3 class="text-lg font-bold text-gray-800">Pedidos por estado</h3>
      </div>
      <div class="flex items-center gap-3">
        <!-- Legend inline -->
        <div class="hidden md:flex gap-2">
          <div v-for="(item, i) in items" :key="item.label" class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: colors[i] }"></div>
            <span class="text-[9px] text-gray-400 font-black uppercase tracking-wider">{{ item.label }}</span>
          </div>
        </div>
        <!-- Botones de Período -->
        <div class="flex gap-1 bg-gray-100 p-0.5 rounded-full">
          <button v-for="p in periodos" :key="p.value" @click="cambiarPeriodo(p.value)"
            :class="['px-2.5 py-0.5 text-[10px] rounded-full font-bold transition',
              periodoActivo === p.value ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200']">
            {{ p.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="relative h-64 flex items-center justify-center">
      <canvas ref="chartRef"></canvas>
      <!-- Total central -->
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span class="text-3xl font-black text-gray-800">{{ totalOrdenes }}</span>
        <span class="text-xs text-gray-400 font-medium uppercase tracking-widest">órdenes</span>
      </div>
    </div>

    <!-- Detalle por estado -->
    <div class="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
      <div v-for="(item, i) in items" :key="item.label" class="rounded-xl p-2.5 transition-transform hover:scale-105" :style="{ backgroundColor: colors[i] + '15' }">
        <p class="text-[10px] font-black uppercase tracking-wider mb-1" :style="{ color: colors[i] }">{{ item.label }}</p>
        <p class="text-xl font-black text-gray-800 leading-none">{{ item.value }}</p>
        <p class="text-[10px] font-bold text-gray-400 mt-1">{{ totalOrdenes ? Math.round((Number(item.value) || 0) / totalOrdenes * 100) : 0 }}%</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  apiUrl:     { type: String,   required: true },
  getHeaders: { type: Function, required: true },
  refreshKey: { type: Number,   default: 0 },
  serverDate: { type: String,   default: '' },
})

const chartRef = ref(null)
let   chartInst = null

const loading = ref(false)
const periodoActivo = ref(1)
const localOrdenesPorEstado = ref([])

const colors = ['#6366f1', '#f59e0b', '#10b981', '#6b7280']

const periodos = [
  { label: 'Hoy', value: 1  },
  { label: '7d',  value: 7  },
  { label: '14d', value: 14 },
  { label: '30d', value: 30 },
]

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

const fetchYDraw = async (dias) => {
  loading.value = true
  try {
    const { iniStr, finStr } = getRange(dias)
    const res = await fetch(
      `${props.apiUrl}/reportes/dashboard?fecha_inicio=${iniStr}&fecha_fin=${finStr}`,
      { headers: props.getHeaders() }
    )
    const data = await res.json()
    if (data.success && data.data) {
      localOrdenesPorEstado.value = data.data.ordenes_por_estado || []
    }
    await buildChart()
  } catch (e) {
    console.error('Error al cargar pedidos por estado:', e)
  } finally {
    loading.value = false
  }
}

const cambiarPeriodo = (dias) => {
  periodoActivo.value = dias
  fetchYDraw(dias)
}

const g = (s) => localOrdenesPorEstado.value.find(x => x.estado === s)?.total || 0

const items = computed(() => [
  { label: 'Abierta',       value: g('ABIERTA')         },
  { label: 'En prep.',      value: g('EN_PREPARACION')  },
  { label: 'Lista',         value: g('LISTA')           },
  { label: 'Cerrada',       value: g('CERRADA')         },
])

const totalOrdenes = computed(() => items.value.reduce((s, i) => s + Number(i.value), 0))

const loadChartJS = () => new Promise(resolve => {
  if (window.Chart) { resolve(); return }
  const s = document.createElement('script')
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
  s.onload = resolve; document.head.appendChild(s)
})

const buildChart = async () => {
  await loadChartJS()
  if (!chartRef.value) return
  chartInst?.destroy()
  const vals  = items.value.map(i => i.value || 0)
  const total = vals.reduce((a, b) => a + b, 0)
  
  chartInst = new window.Chart(chartRef.value, {
    type: 'doughnut',
    data: {
      labels: items.value.map(i => i.label),
      datasets: [{
        data: total > 0 ? vals : [1, 1, 1, 1],
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 12,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.85)',
          cornerRadius: 12,
          padding: 12,
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 13 },
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${ctx.raw} órdenes`
          }
        }
      },
      cutout: '75%',
    },
  })
}

watch(() => props.refreshKey, () => fetchYDraw(periodoActivo.value))
onMounted(() => fetchYDraw(periodoActivo.value))
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>