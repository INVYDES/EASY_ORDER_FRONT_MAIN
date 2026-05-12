<template>
  <div class="space-y-6">

    <!-- FILTROS -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex gap-1 bg-slate-100 rounded-xl p-1">
          <button v-for="p in kpiPeriodos" :key="p.key" @click="setKpiPeriodo(p.key)"
            :class="['px-4 py-1.5 text-xs font-bold rounded-lg transition-all',
              kpiPeriodo === p.key ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700']">
            {{ p.label }}
          </button>
        </div>
        <div class="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
          <input v-model="kpiFechaInicio" type="date" class="bg-transparent px-2 py-1 text-xs font-medium focus:outline-none text-slate-600" />
          <span class="text-slate-300 text-xs">→</span>
          <input v-model="kpiFechaFin" type="date" class="bg-transparent px-2 py-1 text-xs font-medium focus:outline-none text-slate-600" />
        </div>
        <button @click="loadKpis" :disabled="loading"
          class="px-6 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 shadow-md shadow-indigo-100">
          {{ loading ? '...' : 'APLICAR' }}
        </button>
        <div class="flex gap-2 ml-2 border-l pl-4 border-slate-200">
          <button @click="exportarReporte('pdf')"
            class="flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition border border-rose-100">
            <span class="text-[10px] font-black uppercase">PDF</span>
          </button>
          <button @click="exportarReporte('excel')"
            class="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition border border-emerald-100">
            <span class="text-[10px] font-black uppercase">XLS</span>
          </button>
        </div>
      </div>
    </div>

    <!-- KPI CARDS -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="card in kpiCards" :key="card.label"
        class="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 relative overflow-hidden group hover:border-indigo-100 transition-colors">
        <div v-if="loading" class="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-20">
          <div class="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
        <div class="flex items-start justify-between relative z-10">
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ card.label }}</p>
            <p class="text-2xl font-black text-slate-800 mt-1">{{ card.value }}</p>
          </div>
          <div class="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-xl group-hover:rotate-12 transition-transform">
            {{ card.icon }}
          </div>
        </div>
      </div>
    </div>

    <!-- TODOS LOS PRODUCTOS — Gráfica de barras filtrable -->
    <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="font-bold text-slate-800 text-lg">🏆 Todos los Productos del Menú</h3>
          <p class="text-xs text-slate-400 font-medium">Filtrado por período seleccionado · ordenado por unidades vendidas</p>
        </div>
      </div>
      <template v-if="topProductos.length">
        <div class="space-y-3 max-h-96 overflow-y-auto pr-2">
          <div v-for="(p, i) in topProductos" :key="p.id" class="flex items-center gap-4">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0" :class="rankClass(i)">
              {{ i + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between mb-1">
                <p class="text-sm font-bold text-slate-700 truncate">{{ p.nombre }}</p>
                <span class="text-xs font-black text-slate-400">{{ Number(p.total_vendido) }} uds</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div class="h-full rounded-full bg-indigo-500 transition-all duration-1000"
                  :style="{ width: pct(p.total_vendido, topProductos[0]?.total_vendido) + '%' }"></div>
              </div>
            </div>
            <div class="text-right shrink-0 min-w-[80px]">
              <p class="text-sm font-black text-slate-800">${{ fm(p.total_ventas) }}</p>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="h-40 flex flex-col items-center justify-center text-slate-300">
        <p class="text-sm italic">Sin datos disponibles</p>
      </div>
    </div>

    <!-- RENTABILIDAD — Menor a Mayor (con alertas Top 5 inferior) -->
    <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="font-bold text-slate-800 text-lg">⚠️ Rentabilidad de Menor a Mayor</h3>
          <p class="text-xs text-slate-400">Los productos con margen más crítico aparecen primero. Se actualiza con costos de ingredientes y nómina.</p>
        </div>
      </div>
      <div class="space-y-2 max-h-80 overflow-y-auto pr-2">
        <div v-if="productosRentabilidad.length === 0" class="text-center py-8 text-slate-400 text-sm italic">Sin datos de rentabilidad</div>
        <div v-for="(p, i) in productosRentabilidad" :key="p.id || i"
          class="flex items-center justify-between p-3 rounded-xl border transition-colors"
          :class="i < 5 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'">
          <div class="flex items-center gap-2">
            <span v-if="i < 5" class="text-base">⚠️</span>
            <span v-else class="text-xs font-bold text-slate-400 w-5">{{ i+1 }}</span>
            <span class="text-sm font-semibold text-slate-700">{{ p.nombre }}</span>
            <span v-if="p.categoria" class="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">{{ p.categoria }}</span>
          </div>
          <div class="text-right">
            <p class="text-sm font-black" :class="(p.margen || 0) < 0 ? 'text-red-600' : 'text-slate-700'">${{ fm(p.margen) }}</p>
            <p class="text-[10px] text-slate-400">margen unit.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- TOP 5 QUE REBASAN TIEMPO ESTIMADO -->
    <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="font-bold text-slate-800 text-lg">🔴 Top 5 — Rebasan Tiempo de Preparación</h3>
          <p class="text-xs text-slate-400">Productos que superaron el tiempo estimado en receta</p>
        </div>
        <div class="flex gap-1 bg-slate-100 rounded-xl p-1">
          <button v-for="t in tiempoFiltros" :key="t.key" @click="tiempoPeriodo = t.key; loadTiemposRebase()"
            :class="['px-3 py-1.5 text-xs font-bold rounded-lg transition',
              tiempoPeriodo === t.key ? 'bg-white shadow-sm text-rose-600' : 'text-slate-500 hover:text-slate-700']">
            {{ t.label }}
          </button>
        </div>
      </div>
      <div class="space-y-3">
        <div v-if="productosRebase.length === 0" class="text-center py-8 text-slate-300 text-sm italic">Sin incidencias en el período</div>
        <div v-for="(p, i) in productosRebase" :key="i"
          class="flex items-center justify-between p-4 rounded-xl bg-rose-50 border border-rose-200">
          <div class="flex items-center gap-3">
            <span class="text-lg">🔴</span>
            <div>
              <p class="text-sm font-bold text-slate-800">{{ p.nombre }}</p>
              <p class="text-xs text-rose-500">Estimado: {{ p.tiempo_estimado }} min · Real: <strong>{{ p.tiempo_real }} min</strong></p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-base font-black text-rose-600">+{{ p.exceso }} min</p>
            <p class="text-[10px] text-slate-400">{{ p.veces }} veces</p>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

const props = defineProps({
  apiUrl:     { type: String,   default: () => import.meta.env.VITE_API_URL || 'http://localhost:8000/api' },
  getHeaders: { type: Function, required: true },
})

const loading = ref(false)
const kpiPeriodo = ref('total')
const kpiFechaInicio = ref('')
const kpiFechaFin = ref('')
const kpiGrupo = ref('mes')
const kpiData = ref({ ventas: [], totales: null })
const kpiAnterior = ref({ ventas: [], totales: null })
const topProductos = ref([])
const productosRentabilidad = ref([])
const productosRebase = ref([])
const tiempoPeriodo = ref('hoy')

const kpiPeriodos = [
  { key: 'total', label: 'Todo' },
  { key: 'hoy',   label: 'Hoy' },
  { key: 'semana', label: '7D' },
  { key: 'mes',   label: '30D' },
]
const tiempoFiltros = [
  { key: 'hoy',   label: 'Hoy' },
  { key: '7dias', label: '7 Días' },
  { key: 'mes',   label: 'Mes' },
]

const fm = (v) => v ? Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'
const pct = (v, max) => { const mx = Number(max || 0); if (mx === 0) return 0; return Math.round((Number(v) / mx) * 100) }
const kpiGrupoLabel = computed(() => ({ dia: 'día', semana: 'semana', mes: 'mes' }[kpiGrupo.value]))
const dc = (a, b) => Number(a||0) >= Number(b||0) ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
const di = (a, b) => Number(a||0) >= Number(b||0) ? '↑' : '↓'
const dp = (a, b) => { const bVal = Number(b||0); if(!bVal) return '0'; return Math.abs(((Number(a||0)-bVal)/bVal)*100).toFixed(1) }

const rankClass = (i) => [
  'bg-amber-400 text-white shadow-md shadow-amber-100',
  'bg-slate-300 text-slate-700',
  'bg-orange-300 text-white',
  'bg-indigo-50 text-indigo-500',
  'bg-slate-50 text-slate-400'
][i] || 'bg-slate-50 text-slate-400'

// Bundle estratégico — Top 10 excluido
const bundle = computed(() => {
  const all = topProductos.value
  if (!all.length) return { kitchen: null, drink: null, dessert: null }

  const top10ids = new Set(all.slice(0, 10).map(p => p.id))

  const kitchen = all
    .filter(p => p.categoria === 'Cocina' && !top10ids.has(p.id))
    .sort((a, b) => (b.margen || 0) - (a.margen || 0))[0]

  const drink = all
    .filter(p => p.categoria === 'Bebida')
    .sort((a, b) => b.total_vendido - a.total_vendido)[0]

  const dessert = all
    .filter(p => p.categoria === 'Postre' && (p.margen || 0) > 0)
    .sort((a, b) => a.total_vendido - b.total_vendido)[0]

  return {
    kitchen: kitchen?.nombre || 'N/A',
    kitchenMargen: kitchen?.margen,
    drink: drink?.nombre || 'N/A',
    drinkVentas: drink?.total_vendido,
    dessert: dessert?.nombre || 'N/A',
    dessertVentas: dessert?.total_vendido,
  }
})

const setKpiPeriodo = (key) => {
  kpiPeriodo.value = key
  const hoy = new Date()
  const fmt = (d) => d.toISOString().split('T')[0]
  if (key === 'total') {
    kpiFechaInicio.value = ''; kpiFechaFin.value = ''; kpiGrupo.value = 'mes'
  } else if (key === 'hoy') {
    kpiFechaInicio.value = fmt(hoy); kpiFechaFin.value = fmt(hoy); kpiGrupo.value = 'dia'
  } else if (key === 'semana') {
    const d = new Date(); d.setDate(d.getDate() - 6)
    kpiFechaInicio.value = fmt(d); kpiFechaFin.value = fmt(hoy); kpiGrupo.value = 'dia'
  } else if (key === 'mes') {
    const d = new Date(); d.setDate(d.getDate() - 29)
    kpiFechaInicio.value = fmt(d); kpiFechaFin.value = fmt(hoy); kpiGrupo.value = 'semana'
  }
  loadKpis()
}

const loadTiemposRebase = async () => {
  try {
    const headers = props.getHeaders()
    const res = await fetch(`${props.apiUrl}/reportes/tiempos-rebase?periodo=${tiempoPeriodo.value}&limite=5`, { headers })
    const data = await res.json()
    if (data.success) productosRebase.value = data.data || []
  } catch { productosRebase.value = [] }
}

const loadKpis = async () => {
  loading.value = true
  try {
    const fIni = kpiFechaInicio.value ? `&fecha_inicio=${kpiFechaInicio.value}` : ''
    const fFin = kpiFechaFin.value ? `&fecha_fin=${kpiFechaFin.value}` : ''

    const [vRes, pRes, rentRes] = await Promise.all([
      fetch(`${props.apiUrl}/reportes/ventas?grupo=${kpiGrupo.value}${fIni}${fFin}`, { headers: props.getHeaders() }),
      fetch(`${props.apiUrl}/reportes/productos-mas-vendidos?limite=200${fIni}${fFin}`, { headers: props.getHeaders() }),
      fetch(`${props.apiUrl}/reportes/rentabilidad-productos${fIni}${fFin}`, { headers: props.getHeaders() }).catch(() => null),
    ])

    const vData = await vRes.json()
    const pData = await pRes.json()

    if (vData.success) kpiData.value = vData.data
    if (pData.success) topProductos.value = pData.data || []

    // Rentabilidad de menor a mayor
    if (rentRes) {
      const rentData = await rentRes.json()
      if (rentData.success && rentData.data) {
        productosRentabilidad.value = [...rentData.data].sort((a, b) => (a.margen || 0) - (b.margen || 0))
      }
    } else if (topProductos.value.length) {
      // Fallback: calcular desde productos
      productosRentabilidad.value = [...topProductos.value]
        .sort((a, b) => (a.margen || a.precio - a.costo || 0) - (b.margen || b.precio - b.costo || 0))
    }

    await loadTiemposRebase()
  } catch (e) { console.error(e) } finally { loading.value = false }
}

const exportarReporte = async (formato) => {
  try {
    const res = await fetch(`${props.apiUrl}/reportes/exportar`, {
      method: 'POST',
      headers: { ...props.getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: 'ventas', formato, fecha_inicio: kpiFechaInicio.value || null, fecha_fin: kpiFechaFin.value || null })
    })
    const data = await res.json()
    if (data.success) window.open(data.data.url, '_blank')
  } catch (e) { console.error(e) }
}

const kpiCards = computed(() => [
  { label: 'Ingresos', value: '$' + fm(kpiData.value.totales?.total_ventas), icon: '💰' },
  { label: 'Órdenes',  value: String(kpiData.value.totales?.total_ordenes || 0), icon: '🧾' },
  { label: 'Ticket Prom', value: '$' + fm(kpiData.value.totales?.promedio_por_orden), icon: '📈' },
  { label: 'Top Plato', value: topProductos.value[0]?.nombre || '—', icon: '🏆' },
])

onMounted(() => setKpiPeriodo('total'))
</script>