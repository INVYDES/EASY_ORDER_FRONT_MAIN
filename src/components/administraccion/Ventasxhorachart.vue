<template>
  <div class="bg-white rounded-xl shadow-xs border border-[#DDE3DE] p-5">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="font-semibold text-[#202723] text-sm">Ventas por hora</h3>
        <p class="text-xs text-[#68736C] mt-0.5">Ingresos del día de hoy</p>
      </div>
      <span class="text-xs bg-[#E8F1ED] text-[#245C4F] font-semibold font-mono tabular-nums px-2.5 py-1 rounded-md">
        Hoy: ${{ fm(totalHoy) }}
      </span>
    </div>
    <div class="relative h-52">
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-10">
        <div class="w-5 h-5 border-2 border-[#E8F1ED] border-t-[#245C4F] rounded-full animate-spin"></div>
      </div>
      <div v-if="!loading && totalHoy === 0"
        class="absolute inset-0 flex flex-col items-center justify-center text-[#68736C]">
        <i class="fa-solid fa-chart-simple text-xl mb-1 text-[#DDE3DE]"></i>
        <span class="text-xs">Sin ventas registradas hoy</span>
      </div>
      <canvas ref="chartRef"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'

const props = defineProps({
  ordenesCerradas: { type: Array, default: () => [] },
})

const chartRef    = ref(null)
const loading     = ref(false)
let   chartInst   = null

const fm = (v) => v ? Number(v).toLocaleString('es-MX', { minimumFractionDigits:2, maximumFractionDigits:2 }) : '0.00'

const getVentaNeta = (o) => Math.max(0, (Number(o.total) || 0) - (Number(o.propina) || 0))

// Agrupar órdenes cerradas por hora
const datosPorHora = computed(() => {
  const hours  = Array.from({length:16}, (_, i) => `${String(i+8).padStart(2,'0')}:00`)
  const totals = Array(16).fill(0)
  props.ordenesCerradas.forEach(o => {
    if (!o.created_at) return
    const h = new Date(o.created_at).getHours()
    if (h >= 8 && h <= 23) totals[h - 8] += getVentaNeta(o)
  })
  return { hours, totals }
})

const totalHoy = computed(() =>
  props.ordenesCerradas.reduce((s, o) => s + getVentaNeta(o), 0)
)

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
  const { hours, totals } = datosPorHora.value
  chartInst = new window.Chart(chartRef.value, {
    type: 'bar',
    data: {
      labels: hours,
      datasets: [{
        data: totals,
        backgroundColor: totals.map(v => v > 0 ? '#245C4F' : '#F0F2EF'),
        borderRadius: 4,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#F0F2EF' }, ticks: { callback: v => '$' + v.toLocaleString() } },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      },
    },
  })
}

watch(() => props.ordenesCerradas, buildChart, { deep: true })
onMounted(buildChart)
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>