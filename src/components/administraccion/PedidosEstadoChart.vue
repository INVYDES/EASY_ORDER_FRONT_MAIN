<template>
  <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-bold text-gray-800">Pedidos por estado</h3>
      <div class="flex gap-3">
        <div v-for="(item, i) in items" :key="item.label" class="flex items-center gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: colors[i] }"></div>
          <span class="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <div class="relative h-64 flex items-center justify-center">
      <div v-if="loading"
        class="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-10">
        <div class="flex items-center gap-2 text-gray-400 text-sm">
          <div class="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
          Cargando...
        </div>
      </div>
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

    <!-- Botones de búsqueda rápida (abajo) -->
    <div class="flex justify-center gap-2 mt-6 pt-4 border-t border-gray-100">
      <button v-for="p in periodos" :key="p.value" @click="cambiarPeriodo(p.value)"
        :class="['px-5 py-2 text-xs rounded-xl font-bold transition shadow-sm border',
          periodoActivo===p.value ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200']">
        {{ p.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'

const props = defineProps({
  apiUrl:           { type: String,   required: true },
  getHeaders:       { type: Function, required: true },
  ordenesPorEstado: { type: Array,    default: () => [] },
  serverDate:       { type: String,   default: '' },
})

const chartRef = ref(null)
let   chartInst = null
const loading   = ref(false)
const localData = ref([...props.ordenesPorEstado])

const colors = ['#6366f1', '#f59e0b', '#10b981', '#6b7280']

const g = (s) => localData.value.find(x => x.estado === s)?.total || 0

const items = computed(() => [
  { label: 'Abierta',       value: g('ABIERTA')         },
  { label: 'En prep.',      value: g('EN_PREPARACION')  },
  { label: 'Lista',         value: g('LISTA')           },
  { label: 'Cerrada',       value: g('CERRADA')         },
])

const totalOrdenes = computed(() => items.value.reduce((s, i) => s + Number(i.value), 0))

const periodoActivo = ref('hoy')
const periodos = [
  { label: 'Hoy', value: 'hoy' },
  { label: '7d',  value: 7 },
  { label: '15d', value: 15 },
  { label: '30d', value: 30 },
]

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

const cambiarPeriodo = async (dias) => {
  periodoActivo.value = dias
  if (dias === 'hoy') {
    localData.value = [...props.ordenesPorEstado]
    buildChart()
    return
  }
  loading.value = true
  try {
    const hoyStr = props.serverDate || new Date().toLocaleDateString('en-CA')
    const fin = hoyStr
    const iniDate = new Date(hoyStr + 'T00:00:00'); iniDate.setDate(iniDate.getDate() - dias + 1)
    const iniStr = iniDate.toLocaleDateString('en-CA')

    const res = await fetch(
      `${props.apiUrl}/reportes/dashboard?fecha_inicio=${iniStr}&fecha_fin=${fin}`,
      { headers: props.getHeaders() }
    )
    const resJson = await res.json()
    if (resJson.success && resJson.data) {
      localData.value = resJson.data.ordenes_por_estado || []
    }
  } catch (e) {
    console.error('Error fetching PedidosEstadoChart:', e)
  } finally {
    loading.value = false
    buildChart()
  }
}

watch(() => props.ordenesPorEstado, (newVal) => {
  if (periodoActivo.value === 'hoy') {
    localData.value = [...newVal]
    buildChart()
  }
}, { deep: true })

onMounted(buildChart)
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>