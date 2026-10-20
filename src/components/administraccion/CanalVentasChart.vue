<template>
  <div class="bg-white p-5 rounded-xl border border-[#DDE3DE] shadow-xs relative">
    <!-- Spinner de carga -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-10">
      <div class="flex items-center gap-2 text-[#68736C] text-xs">
        <div class="w-4 h-4 border-2 border-[#E8F1ED] border-t-[#245C4F] rounded-full animate-spin"></div>
        Cargando...
      </div>
    </div>

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <div>
        <h3 class="text-sm font-semibold text-[#202723]">Canal de Ventas</h3>
      </div>
      <div class="flex items-center gap-3">
        <!-- Legend inline -->
        <div class="hidden md:flex gap-2">
          <div v-for="canal in legend" :key="canal.label" class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: canal.color }"></div>
            <span class="text-[10px] text-[#68736C] font-semibold uppercase tracking-wider">{{ canal.label }}</span>
          </div>
        </div>
        <!-- Botones de Período -->
        <div class="flex gap-1 bg-[#F0F2EF] border border-[#DDE3DE] p-1 rounded-lg">
          <button v-for="p in periodos" :key="p.value" @click="cambiarPeriodo(p.value)"
            :class="['px-2.5 py-0.5 text-xs rounded-md font-medium transition-colors cursor-pointer',
              periodoActivo === p.value ? 'bg-white text-[#245C4F] font-semibold shadow-xs' : 'text-[#68736C] hover:text-[#202723]']">
            {{ p.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="relative h-56 flex items-center justify-center">
      <canvas ref="canvasEl"></canvas>
      <!-- Total central -->
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span class="text-2xl font-bold font-mono tabular-nums text-[#202723]">{{ totalPedidos }}</span>
        <span class="text-[10px] text-[#68736C] uppercase tracking-wider font-semibold">pedidos</span>
      </div>
    </div>

    <!-- Detalle por canal -->
    <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
      <div v-for="canal in legend" :key="canal.label" class="rounded-lg p-2.5 border border-[#DDE3DE] bg-[#F6F7F5]">
        <p class="text-[10px] font-semibold uppercase tracking-wider mb-1" :style="{ color: canal.color }">{{ canal.label }}</p>
        <p class="text-lg font-bold font-mono tabular-nums text-[#202723] leading-none">{{ localData[canal.label] || 0 }}</p>
        <p class="text-[10px] text-[#68736C] mt-1">{{ totalPedidos ? Math.round((localData[canal.label] || 0) / totalPedidos * 100) : 0 }}%</p>
      </div>
    </div>
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
  Delivery: 0,
  Kiosko: 0
})

const legend = [
  { label: 'Local',    color: '#245C4F' },
  { label: 'Pickup',   color: '#A96517' },
  { label: 'Delivery', color: '#26734D' },
  { label: 'Kiosko',   color: '#315F8C' },
]

const periodos = [
  { label: 'Hoy', value: 1  },
  { label: '7d',  value: 7  },
  { label: '14d', value: 14 },
  { label: '30d', value: 30 },
]

const totalPedidos = computed(() =>
  (localData.Local || 0) + (localData.Pickup || 0) + (localData.Delivery || 0) + (localData.Kiosko || 0)
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
      localData.Kiosko = data.data.Kiosko || 0
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
        data: [localData.Local || 0, localData.Pickup || 0, localData.Delivery || 0, localData.Kiosko || 0],
        backgroundColor: legend.map(l => l.color),
        borderWidth: 0,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => ` ${context.label}: ${context.raw} pedidos`
          }
        }
      },
      cutout: '72%'
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
