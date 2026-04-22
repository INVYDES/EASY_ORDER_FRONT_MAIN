<template>
  <div class="bg-white rounded-xl shadow-sm p-5">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="font-semibold text-gray-800">Tendencia de ventas</h3>
        <p class="text-xs text-gray-400 mt-0.5">Solo órdenes cerradas</p>
      </div>
      <div class="flex gap-1">
        <button v-for="p in periodos" :key="p.value" @click="cambiarPeriodo(p.value)"
          :class="['px-3 py-1 text-xs rounded-full font-medium transition',
            periodoActivo===p.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">
          {{ p.label }}
        </button>
      </div>
    </div>
    <div class="relative h-52">
      <div v-if="loading"
        class="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-10">
        <div class="flex items-center gap-2 text-gray-400 text-sm">
          <div class="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
          Cargando...
        </div>
      </div>
      <div v-if="!loading && sinDatos"
        class="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
        <span class="text-3xl mb-1">📈</span>
        <span class="text-sm">Sin ventas en el período</span>
      </div>
      <canvas ref="chartRef"></canvas>
    </div>
    <!-- Resumen período -->
    <div v-if="!sinDatos" class="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
      <div class="text-center">
        <p class="text-xs text-gray-400">Total período</p>
        <p class="text-sm font-bold text-gray-800">${{ fm(totales.total_ventas) }}</p>
      </div>
      <div class="text-center border-x border-gray-100">
        <p class="text-xs text-gray-400">Órdenes</p>
        <p class="text-sm font-bold text-gray-800">{{ totales.total_ordenes }}</p>
      </div>
      <div class="text-center">
        <p class="text-xs text-gray-400">Ticket prom.</p>
        <p class="text-sm font-bold text-gray-800">${{ fm(totales.promedio_por_orden) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  apiUrl:     { type: String,   required: true },
  getHeaders: { type: Function, required: true },
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

const fetchYDraw = async (dias) => {
  loading.value = true
  try {
    const hoy = new Date()
    const fin  = hoy.toISOString().split('T')[0]
    const ini  = new Date(hoy); ini.setDate(ini.getDate() - dias + 1)
    const iniStr = ini.toISOString().split('T')[0]

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
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.1)',
            borderWidth: 2.5,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#6366f1',
            pointRadius: 4,
            pointHoverRadius: 6,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { callback: v => '$' + v.toLocaleString() } },
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

onMounted(() => fetchYDraw(periodoActivo.value))
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>