<template>
  <div class="space-y-6">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button v-for="p in kpiPeriodos" :key="p.key" @click="setKpiPeriodo(p.key)"
            :class="['px-4 py-1.5 text-sm font-medium rounded-lg transition-all',
              kpiPeriodo === p.key ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:bg-gray-200']">
            {{ p.label }}
          </button>
        </div>

        <div class="flex items-center gap-2">
          <input v-model="kpiFechaInicio" type="date" @change="kpiPeriodo = 'custom'"
            class="px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          <span class="text-gray-400">→</span>
          <input v-model="kpiFechaFin" type="date" @change="kpiPeriodo = 'custom'"
            class="px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>

        <div class="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button v-for="g in grupos" :key="g.value" @click="kpiGrupo = g.value; loadKpis()"
            :class="['px-3 py-1.5 text-xs font-medium rounded-lg transition',
              kpiGrupo === g.value ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:bg-gray-200']">
            {{ g.label }}
          </button>
        </div>

        <button @click="loadKpis" :disabled="loading"
          class="px-5 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2">
          <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ loading ? 'Actualizando...' : 'Aplicar Filtros' }}
        </button>

        <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer ml-auto">
          <input type="checkbox" v-model="mostrarComparacion" class="rounded text-indigo-600 focus:ring-indigo-500" @change="loadKpis" />
          Comparar vs período anterior
        </label>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="card in kpiCards" :key="card.label"
        class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-bold text-gray-400 uppercase">{{ card.label }}</p>
            <p class="text-2xl font-black text-gray-900 mt-1">{{ card.value }}</p>
          </div>
          <div class="p-2 bg-indigo-50 rounded-lg text-xl">{{ card.icon }}</div>
        </div>
        
        <div v-if="mostrarComparacion && card.rawAnterior" class="mt-3 flex items-center gap-1 text-xs">
          <span :class="dc(card.raw, card.rawAnterior)" class="px-1.5 py-0.5 rounded-md flex items-center">
            {{ di(card.raw, card.rawAnterior) }} {{ dp(card.raw, card.rawAnterior) }}%
          </span>
          <span class="text-gray-400">vs anterior</span>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="font-bold text-gray-800 text-lg">Evolución de Ventas</h3>
          <p class="text-sm text-gray-400">Desglose por {{ kpiGrupoLabel }}</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-gray-400 uppercase font-bold">Total del Período</p>
          <p class="text-xl font-black text-indigo-600">${{ fm(kpiData.totales?.total_ventas) }}</p>
        </div>
      </div>
      <div class="relative h-80">
        <canvas ref="chartKpiVentas"></canvas>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>🏆</span> Productos Más Vendidos
        </h3>
        <div class="flex flex-col md:flex-row gap-6 items-center">
          <div class="w-full md:w-1/2 h-52">
            <canvas ref="chartTopProductos"></canvas>
          </div>
          <div class="w-full md:w-1/2 space-y-3">
            <div v-for="(p, i) in topProductos.slice(0, 4)" :key="p.id" class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="w-2 h-2 rounded-full" :style="{backgroundColor: barColors[i]}"></span>
                <span class="text-sm font-medium text-gray-700 truncate max-w-[120px]">{{ p.nombre }}</span>
              </div>
              <span class="text-sm font-bold text-gray-900">{{ p.total_vendido }} <small class="text-gray-400">uds</small></span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 class="font-bold text-gray-800 mb-4">📈 Rendimiento vs Período Anterior</h3>
        <div v-if="!mostrarComparacion" class="h-60 flex flex-col items-center justify-center text-center">
           <p class="text-gray-400 text-sm mb-4">Activa la comparación para analizar el crecimiento</p>
           <button @click="mostrarComparacion=true; loadKpis()" class="text-indigo-600 font-bold text-sm hover:underline">Activar ahora</button>
        </div>
        <div v-else class="h-60">
          <canvas ref="chartComparacion"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

const props = defineProps({
  apiUrl: { type: String, default: '/api' },
  getHeaders: { type: Function, required: true },
})

// --- ESTADO ---
const loading = ref(false)
const kpiPeriodo = ref('semana')
const kpiFechaInicio = ref('')
const kpiFechaFin = ref('')
const kpiGrupo = ref('dia')
const mostrarComparacion = ref(false)
const kpiData = ref({ ventas: [], totales: null })
const kpiAnterior = ref({ ventas: [], totales: null })
const topProductos = ref([])

// --- CANVAS & CHART.JS ---
const chartKpiVentas = ref(null)
const chartTopProductos = ref(null)
const chartComparacion = ref(null)
let iKpiVentas = null, iTopProd = null, iCompar = null

const barColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6']
const kpiPeriodos = [
  { key: 'hoy', label: 'Hoy' },
  { key: 'semana', label: 'Semana' },
  { key: 'mes', label: 'Mes' },
  { key: 'total', label: 'Todo' }
]
const grupos = [{ label: 'Día', value: 'dia' }, { label: 'Semana', value: 'semana' }, { label: 'Mes', value: 'mes' }]

// --- HELPERS ---
const fm = (v) => v ? Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
const dp = (a, b) => b ? Math.abs(((a - b) / b) * 100).toFixed(1) : '0'
const di = (a, b) => a >= b ? '↑' : '↓'
const dc = (a, b) => a >= b ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
const fmtDate = (d) => d.toISOString().split('T')[0]

// --- LÓGICA DE PERIODOS ---
const setKpiPeriodo = (key) => {
  kpiPeriodo.value = key
  const hoy = new Date()
  if (key === 'hoy') {
    kpiFechaInicio.value = fmtDate(hoy); kpiFechaFin.value = fmtDate(hoy); kpiGrupo.value = 'dia'
  } else if (key === 'semana') {
    const inicio = new Date(); inicio.setDate(hoy.getDate() - 6);
    kpiFechaInicio.value = fmtDate(inicio); kpiFechaFin.value = fmtDate(hoy); kpiGrupo.value = 'dia'
  } else if (key === 'mes') {
    const inicio = new Date(); inicio.setDate(hoy.getDate() - 29);
    kpiFechaInicio.value = fmtDate(inicio); kpiFechaFin.value = fmtDate(hoy); kpiGrupo.value = 'semana'
  } else if (key === 'total') {
    kpiFechaInicio.value = ''; kpiFechaFin.value = ''; kpiGrupo.value = 'mes'
  }
  loadKpis()
}

// --- KPI CARDS COMPUTED ---
const kpiCards = computed(() => [
  { label: 'Ingresos', value: '$' + fm(kpiData.value.totales?.total_ventas), icon: '💰', raw: kpiData.value.totales?.total_ventas, rawAnterior: kpiAnterior.value.totales?.total_ventas },
  { label: 'Órdenes', value: kpiData.value.totales?.total_ordenes || 0, icon: '🧾', raw: kpiData.value.totales?.total_ordenes, rawAnterior: kpiAnterior.value.totales?.total_ordenes },
  { label: 'Ticket Prom.', value: '$' + fm(kpiData.value.totales?.promedio_por_orden), icon: '📈', raw: kpiData.value.totales?.promedio_por_orden, rawAnterior: kpiAnterior.value.totales?.promedio_por_orden },
  { label: 'Top Ventas', value: topProductos.value[0]?.nombre || '—', icon: '🏆' }
])

// --- API FETCH ---
const loadKpis = async () => {
  loading.value = true
  try {
    const headers = props.getHeaders()
    const params = `?fecha_inicio=${kpiFechaInicio.value}&fecha_fin=${kpiFechaFin.value}&grupo=${kpiGrupo.value}`
    
    const [vRes, pRes] = await Promise.all([
      fetch(`${props.apiUrl}/reportes/ventas${params}`, { headers }),
      fetch(`${props.apiUrl}/reportes/productos-mas-vendidos${params}&limite=5`, { headers })
    ])

    const vData = await vRes.json()
    const pData = await pRes.json()

    if (vData.success) kpiData.value = vData.data
    if (pData.success) topProductos.value = pData.data

    if (mostrarComparacion.value && kpiFechaInicio.value) {
        // Lógica simple para periodo anterior: restamos la misma cantidad de días
        const d1 = new Date(kpiFechaInicio.value); const d2 = new Date(kpiFechaFin.value)
        const diff = d2 - d1; const antFin = new Date(d1 - 1); const antIni = new Date(antFin - diff)
        const aRes = await fetch(`${props.apiUrl}/reportes/ventas?fecha_inicio=${fmtDate(antIni)}&fecha_fin=${fmtDate(antFin)}&grupo=${kpiGrupo.value}`, { headers })
        const aData = await aRes.json()
        kpiAnterior.value = aData.success ? aData.data : { totales: null, ventas: [] }
    }

    await nextTick()
    buildCharts()
  } catch (e) {
    console.error("Error cargando Dashboard:", e)
  } finally {
    loading.value = false
  }
}

// --- CHART BUILDER ---
const buildCharts = async () => {
  if (!window.Chart) {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js'
    script.onload = () => buildCharts()
    document.head.appendChild(script)
    return
  }

  const C = window.Chart
  
  // 1. Chart Ventas (Lineal)
  iKpiVentas?.destroy()
  if (chartKpiVentas.value) {
    iKpiVentas = new C(chartKpiVentas.value, {
      type: 'line',
      data: {
        labels: kpiData.value.ventas.map(v => v.fecha || `Sem ${v.semana}`),
        datasets: [{
          label: 'Ventas Actuales',
          data: kpiData.value.ventas.map(v => v.total_ventas),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    })
  }

  // 2. Chart Top Productos (Dona)
  iTopProd?.destroy()
  if (chartTopProductos.value) {
    iTopProd = new C(chartTopProductos.value, {
      type: 'doughnut',
      data: {
        labels: topProductos.value.map(p => p.nombre),
        datasets: [{ data: topProductos.value.map(p => p.total_vendido), backgroundColor: barColors }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } } }
    })
  }

  // 3. Chart Comparación (Barras)
  iCompar?.destroy()
  if (chartComparacion.value && mostrarComparacion.value) {
    iCompar = new C(chartComparacion.value, {
      type: 'bar',
      data: {
        labels: ['Ventas', 'Ticket Prom.'],
        datasets: [
          { label: 'Actual', data: [kpiData.value.totales?.total_ventas, kpiData.value.totales?.promedio_por_orden], backgroundColor: '#6366f1' },
          { label: 'Anterior', data: [kpiAnterior.value.totales?.total_ventas, kpiAnterior.value.totales?.promedio_por_orden], backgroundColor: '#e2e8f0' }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    })
  }
}

onMounted(() => setKpiPeriodo('semana'))
</script>