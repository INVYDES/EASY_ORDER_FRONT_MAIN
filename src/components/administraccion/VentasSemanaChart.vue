<template>
  <div class="bg-white rounded-xl shadow-xs border border-[#DDE3DE] p-5">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="font-semibold text-[#202723] text-sm">Tendencia de ventas</h3>
        <p class="text-xs text-[#68736C] mt-0.5">Solo órdenes cerradas</p>
      </div>
      <div class="flex gap-1 bg-[#F0F2EF] border border-[#DDE3DE] rounded-lg p-1">
        <button v-for="p in periodos" :key="p.value" @click="cambiarPeriodo(p.value)"
          :class="['px-2.5 py-0.5 text-xs rounded-md font-medium transition-colors cursor-pointer',
            periodoActivo===p.value ? 'bg-white shadow-xs text-[#245C4F] font-semibold' : 'text-[#68736C] hover:text-[#202723]']">
          {{ p.label }}
        </button>
      </div>
    </div>
    <div class="relative h-52">
      <div v-if="loading"
        class="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-10">
        <div class="flex items-center gap-2 text-[#68736C] text-xs">
          <div class="w-4 h-4 border-2 border-[#E8F1ED] border-t-[#245C4F] rounded-full animate-spin"></div>
          Cargando...
        </div>
      </div>
      <div v-if="!loading && sinDatos"
        class="absolute inset-0 flex flex-col items-center justify-center text-[#68736C]">
        <i class="fa-solid fa-chart-line text-xl mb-1 text-[#DDE3DE]"></i>
        <span class="text-xs">Sin ventas en el período</span>
      </div>
      <canvas ref="chartRef"></canvas>
    </div>
    <!-- Resumen período -->
    <div v-if="!sinDatos" class="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#DDE3DE]">
      <div class="text-center">
        <p class="text-[10px] text-[#68736C] uppercase font-semibold">Total período</p>
        <p class="text-sm font-bold text-[#202723] font-mono tabular-nums">${{ fm(totales.total_ventas) }}</p>
      </div>
      <div class="text-center border-x border-[#DDE3DE]">
        <p class="text-[10px] text-[#68736C] uppercase font-semibold">Órdenes</p>
        <p class="text-sm font-bold text-[#202723] font-mono tabular-nums">{{ totales.total_ordenes }}</p>
      </div>
      <div class="text-center">
        <p class="text-[10px] text-[#68736C] uppercase font-semibold">Ticket prom.</p>
        <p class="text-sm font-bold text-[#202723] font-mono tabular-nums">${{ fm(totales.promedio_por_orden) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  apiUrl:     { type: String,   required: true },
  getHeaders: { type: Function, required: true },
  refreshKey: { type: Number,   default: 0 },
  serverDate: { type: String,   default: '' },
})

const chartRef    = ref(null)
const loading     = ref(false)
const sinDatos    = ref(false)
const periodoActivo = ref(7)
const totales     = ref({ total_ventas: 0, total_ordenes: 0, promedio_por_orden: 0 })
let   chartInst   = null

const periodos = [
  { label: '7d',  value: 7  },
  { label: '14d', value: 14 },
  { label: '30d', value: 30 },
]

const fm = (v) => v ? Number(v).toLocaleString('es-MX', { minimumFractionDigits:2, maximumFractionDigits:2 }) : '0.00'

const loadChartJS = () => new Promise(resolve => {
  if (window.Chart) { resolve(); return }
  const s = document.createElement('script')
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
  s.onload = resolve; document.head.appendChild(s)
})

const getServerToday = () => props.serverDate || new Date().toLocaleDateString('en-CA')

const fetchYDraw = async (dias) => {
  loading.value = true
  try {
    const hoyStr = getServerToday()
    const fin  = hoyStr
    const iniDate = new Date(hoyStr + 'T00:00:00'); iniDate.setDate(iniDate.getDate() - dias + 1)
    const iniStr = iniDate.toLocaleDateString('en-CA')

    const res  = await fetch(
      `${props.apiUrl}/reportes/ventas?fecha_inicio=${iniStr}&fecha_fin=${fin}&grupo=dia`,
      { headers: props.getHeaders() }
    )
    const data = await res.json()

    if (data.success && data.data?.ventas?.length > 0) {
      sinDatos.value = false
      totales.value  = data.data.totales || {}
      const labels  = data.data.ventas.map(v => {
        const d = new Date(v.fecha + 'T00:00:00')
        return d.toLocaleDateString('es-MX', { day:'2-digit', month:'short' })
      })
      const valores = data.data.ventas.map(v => Number(v.total_ventas || 0))
      await loadChartJS()
      if (!chartRef.value) return
      chartInst?.destroy()
      chartInst = new window.Chart(chartRef.value, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            data: valores,
            borderColor: '#245C4F',
            backgroundColor: 'rgba(36, 92, 79, 0.08)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#245C4F',
            pointRadius: 3,
            pointHoverRadius: 5,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#F0F2EF' }, ticks: { callback: v => '$' + v.toLocaleString() } },
            x: { grid: { display: false } },
          },
        },
      })
    } else {
      sinDatos.value = true
      chartInst?.destroy()
    }
  } catch (e) { console.error('Error ventas semana:', e) }
  finally { loading.value = false }
}

const cambiarPeriodo = (dias) => { periodoActivo.value = dias; fetchYDraw(dias) }

watch(() => props.refreshKey, () => fetchYDraw(periodoActivo.value))
onMounted(() => fetchYDraw(periodoActivo.value))
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>