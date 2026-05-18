<template>
  <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-bold text-gray-800">Canal de Ventas</h3>
      <div class="flex gap-3">
        <div v-for="canal in legend" :key="canal.label" class="flex items-center gap-1.5">
          <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: canal.color }"></div>
          <span class="text-xs text-gray-500 font-medium">{{ canal.label }}</span>
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
      <canvas ref="canvasEl"></canvas>
      <!-- Total central -->
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span class="text-3xl font-black text-gray-800">{{ totalPedidos }}</span>
        <span class="text-xs text-gray-400 font-medium">pedidos</span>
      </div>
    </div>

    <!-- Detalle por canal -->
    <div class="mt-4 grid grid-cols-3 gap-3 text-center">
      <div v-for="canal in legend" :key="canal.label" class="rounded-xl p-2" :style="{ backgroundColor: canal.color + '15' }">
        <p class="text-xs font-bold" :style="{ color: canal.color }">{{ canal.label }}</p>
        <p class="text-lg font-black text-gray-800">{{ localData[canal.label] || 0 }}</p>
        <p class="text-[10px] text-gray-400">{{ totalPedidos ? Math.round((localData[canal.label] || 0) / totalPedidos * 100) : 0 }}%</p>
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
import { onMounted, ref, computed, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  apiUrl:     { type: String,   required: true },
  getHeaders: { type: Function, required: true },
  data:       { type: Object,   required: true, default: () => ({ Local: 0, Pickup: 0, Delivery: 0 }) },
  serverDate: { type: String,   default: '' },
})

const canvasEl = ref(null)
const loading  = ref(false)
const localData = ref({ ...props.data })

const legend = [
  { label: 'Local',    color: '#4f46e5' },
  { label: 'Pickup',   color: '#f59e0b' },
  { label: 'Delivery', color: '#10b981' },
]

const totalPedidos = computed(() =>
  (localData.value.Local || 0) + (localData.value.Pickup || 0) + (localData.value.Delivery || 0)
)

let chartInstance = null

const initChart = () => {
  if (!canvasEl.value) return
  if (chartInstance) chartInstance.destroy()

  chartInstance = new Chart(canvasEl.value, {
    type: 'doughnut',
    data: {
      labels: legend.map(l => l.label),
      datasets: [{
        data: [localData.value.Local || 0, localData.value.Pickup || 0, localData.value.Delivery || 0],
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

const periodoActivo = ref('hoy')
const periodos = [
  { label: 'Hoy', value: 'hoy' },
  { label: '7d',  value: 7 },
  { label: '15d', value: 15 },
  { label: '30d', value: 30 },
]

const cambiarPeriodo = async (dias) => {
  periodoActivo.value = dias
  if (dias === 'hoy') {
    localData.value = { ...props.data }
    initChart()
    return
  }
  loading.value = true
  try {
    const hoyStr = props.serverDate || new Date().toLocaleDateString('en-CA')
    const fin = hoyStr
    const iniDate = new Date(hoyStr + 'T00:00:00'); iniDate.setDate(iniDate.getDate() - dias + 1)
    const iniStr = iniDate.toLocaleDateString('en-CA')

    const res = await fetch(
      `${props.apiUrl}/reportes/ventas-por-canal-tipo?fecha_inicio=${iniStr}&fecha_fin=${fin}`,
      { headers: props.getHeaders() }
    )
    const resJson = await res.json()
    if (resJson.success && resJson.data) {
      localData.value = {
        Local: resJson.data.Local || 0,
        Pickup: resJson.data.Pickup || 0,
        Delivery: resJson.data.Delivery || 0
      }
    }
  } catch (e) {
    console.error('Error fetching CanalVentasChart:', e)
  } finally {
    loading.value = false
    initChart()
  }
}

watch(() => props.data, (newVal) => {
  if (periodoActivo.value === 'hoy') {
    localData.value = { ...newVal }
    initChart()
  }
}, { deep: true })

onMounted(initChart)
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>
