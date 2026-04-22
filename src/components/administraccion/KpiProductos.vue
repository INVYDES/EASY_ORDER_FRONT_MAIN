<template>
  <div class="space-y-6">

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
          <input v-model="kpiFechaInicio" type="date"
            class="bg-transparent px-2 py-1 text-xs font-medium focus:outline-none text-slate-600" />
          <span class="text-slate-300 text-xs">→</span>
          <input v-model="kpiFechaFin" type="date"
            class="bg-transparent px-2 py-1 text-xs font-medium focus:outline-none text-slate-600" />
        </div>

        <button @click="loadKpis" :disabled="loading"
          class="px-6 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 shadow-md shadow-indigo-100">
          {{ loading ? '...' : 'APLICAR' }}
        </button>

        <div class="flex gap-2 ml-2 border-l pl-4 border-slate-200">
          <button @click="exportarReporte('pdf')" 
            class="group flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100">
            <span class="text-[10px] font-black uppercase">PDF</span>
          </button>
          <button @click="exportarReporte('excel')" 
            class="group flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100">
            <span class="text-[10px] font-black uppercase">XLS</span>
          </button>
        </div>

        <label class="flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer ml-auto bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 hover:bg-slate-100 transition">
          <input type="checkbox" v-model="mostrarComparacion" class="accent-indigo-600 w-4 h-4" @change="loadKpis" />
          Comparar anterior
        </label>
      </div>
    </div>

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

        <div v-if="mostrarComparacion && kpiAnterior.totales" class="mt-4 flex items-center gap-1.5 text-[11px]">
          <span :class="['px-2 py-0.5 rounded-lg', dc(card.raw, card.rawAnterior)]">
            {{ di(card.raw, card.rawAnterior) }} {{ dp(card.raw, card.rawAnterior) }}%
          </span>
          <span class="text-slate-400 font-medium">vs anterior</span>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="font-bold text-slate-800 text-lg">Ventas por {{ kpiGrupoLabel }}</h3>
          <p class="text-xs text-slate-400 font-medium">
            {{ kpiFechaInicio && kpiFechaFin ? `${kpiFechaInicio} al ${kpiFechaFin}` : 'Historial acumulado completo' }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-right">Total del periodo</p>
          <span class="bg-indigo-50 text-indigo-600 font-black px-4 py-1.5 rounded-xl text-sm border border-indigo-100">
            ${{ fm(kpiData.totales?.total_ventas) }}
          </span>
        </div>
      </div>
      <div class="relative h-72">
        <canvas ref="chartKpiVentas"></canvas>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <h3 class="font-bold text-slate-800 text-lg mb-6">🏆 Productos más vendidos</h3>
        <template v-if="topProductos.length">
          <div class="relative h-56 mb-6">
            <canvas ref="chartTopProductos"></canvas>
          </div>
          <div class="space-y-4">
            <div v-for="(p, i) in topProductos.slice(0, 5)" :key="p.id" class="flex items-center gap-4">
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
        <div v-else class="h-64 flex flex-col items-center justify-center text-slate-300">
          <p class="text-sm italic">Sin datos disponibles</p>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <h3 class="font-bold text-slate-800 text-lg mb-6">📊 Comparación de Períodos</h3>
        <div v-if="!mostrarComparacion" class="flex flex-col items-center justify-center py-20">
          <button @click="mostrarComparacion = true; loadKpis()" class="px-6 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl shadow-lg">
            ACTIVAR COMPARACIÓN
          </button>
        </div>
        <template v-else>
           <div class="relative h-56 mb-8">
              <canvas ref="chartComparacion"></canvas>
           </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

const props = defineProps({
  apiUrl:     { type: String,   default: 'http://localhost:8000/api' },
  getHeaders: { type: Function, required: true },
})

const loading            = ref(false)
const kpiPeriodo         = ref('total')
const kpiFechaInicio     = ref('')
const kpiFechaFin        = ref('')
const kpiGrupo           = ref('mes')
const mostrarComparacion = ref(false)
const kpiData            = ref({ ventas: [], totales: null })
const kpiAnterior        = ref({ ventas: [], totales: null })
const topProductos       = ref([])

const chartKpiVentas    = ref(null)
const chartTopProductos = ref(null)
const chartComparacion  = ref(null)
let iKpiVentas = null, iTopProd = null, iCompar = null

const kpiPeriodos = [
  { key: 'total',  label: 'Todo' },
  { key: 'hoy',    label: 'Hoy' },
  { key: 'semana', label: '7D' },
  { key: 'mes',    label: '30D' },
]

const grupos = [{ label: 'Día', value: 'dia' }, { label: 'Sem', value: 'semana' }, { label: 'Mes', value: 'mes' }]

// Helpers de formato (Manejando strings del JSON)
const fm = (v) => v ? Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'
const pct = (v, max) => {
  const mx = Number(max || 0); if (mx === 0) return 0
  return Math.round((Number(v) / mx) * 100)
}
const kpiGrupoLabel = computed(() => ({ dia: 'día', semana: 'semana', mes: 'mes' }[kpiGrupo.value]))

const dc = (a, b) => Number(a || 0) >= Number(b || 0) ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
const di = (a, b) => Number(a || 0) >= Number(b || 0) ? '↑' : '↓'
const dp = (a, b) => {
  const bVal = Number(b || 0); if (bVal === 0) return '0'
  return Math.abs(((Number(a || 0) - bVal) / bVal) * 100).toFixed(1)
}

const rankClass = (i) => [
  'bg-amber-400 text-white shadow-md shadow-amber-100',
  'bg-slate-300 text-slate-700',
  'bg-orange-300 text-white',
  'bg-indigo-50 text-indigo-500',
  'bg-slate-50 text-slate-400'
][i] || 'bg-slate-50 text-slate-400'

const setKpiPeriodo = (key) => {
  kpiPeriodo.value = key
  const hoy = new Date()
  const fmt = (d) => d.toISOString().split('T')[0]
  if (key === 'total') {
    kpiFechaInicio.value = ''; kpiFechaFin.value = ''; kpiGrupo.value = 'mes'
  } else if (key === 'hoy') {
    kpiFechaInicio.value = fmt(hoy); kpiFechaFin.value = fmt(hoy); kpiGrupo.value = 'dia'
  } else if (key === 'semana') {
    const d = new Date(); d.setDate(d.getDate() - 6);
    kpiFechaInicio.value = fmt(d); kpiFechaFin.value = fmt(hoy); kpiGrupo.value = 'dia'
  } else if (key === 'mes') {
    const d = new Date(); d.setDate(d.getDate() - 29);
    kpiFechaInicio.value = fmt(d); kpiFechaFin.value = fmt(hoy); kpiGrupo.value = 'semana'
  }
  loadKpis()
}

const loadKpis = async () => {
  loading.value = true
  try {
    // Mandar fechas vacías si es "Todo", Laravel con 'nullable' las aceptará
    const fIni = kpiFechaInicio.value ? `&fecha_inicio=${kpiFechaInicio.value}` : ''
    const fFin = kpiFechaFin.value ? `&fecha_fin=${kpiFechaFin.value}` : ''
    
    const [vRes, pRes] = await Promise.all([
      fetch(`${props.apiUrl}/reportes/ventas?grupo=${kpiGrupo.value}${fIni}${fFin}`, { headers: props.getHeaders() }),
      fetch(`${props.apiUrl}/reportes/productos-mas-vendidos?limite=8${fIni}${fFin}`, { headers: props.getHeaders() })
    ])
    
    const vData = await vRes.json(); const pData = await pRes.json()
    if (vData.success) kpiData.value = vData.data
    if (pData.success) topProductos.value = pData.data || []

    await nextTick(); buildCharts()
  } catch (e) { console.error(e) } finally { loading.value = false }
}

const exportarReporte = async (formato) => {
  try {
    const res = await fetch(`${props.apiUrl}/reportes/exportar`, {
      method: 'POST',
      headers: { ...props.getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'ventas',
        formato,
        fecha_inicio: kpiFechaInicio.value || null,
        fecha_fin: kpiFechaFin.value || null
      })
    })
    const data = await res.json()
    if (data.success) window.open(data.data.url, '_blank')
  } catch (e) { console.error(e) }
}

const buildCharts = async () => {
  if (!window.Chart) {
    await new Promise(r => {
      const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
      s.onload = r; document.head.appendChild(s)
    })
  }
  const C = window.Chart

  iKpiVentas?.destroy()
  if (chartKpiVentas.value && kpiData.value.ventas) {
    iKpiVentas = new C(chartKpiVentas.value, {
      type: 'line',
      data: {
        labels: kpiData.value.ventas.map(v => v.fecha || v.semana || v.mes),
        datasets: [{
          label: 'Ventas', data: kpiData.value.ventas.map(v => Number(v.total_ventas)),
          borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.05)', fill: true, tension: 0.4, borderWidth: 3, pointRadius: 2
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    })
  }

  iTopProd?.destroy()
  if (chartTopProductos.value && topProductos.value.length) {
    const top = topProductos.value.slice(0, 5)
    iTopProd = new C(chartTopProductos.value, {
      type: 'doughnut',
      data: {
        labels: top.map(p => p.nombre),
        datasets: [{ data: top.map(p => Number(p.total_vendido)), backgroundColor: ['#fbbf24', '#cbd5e1', '#fdba74', '#818cf8', '#e2e8f0'], borderWidth: 4 }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'right' } } }
    })
  }
}

const kpiCards = computed(() => [
  { label: 'Ingresos', value: '$' + fm(kpiData.value.totales?.total_ventas), icon: '💰', raw: kpiData.value.totales?.total_ventas, rawAnterior: kpiAnterior.value.totales?.total_ventas },
  { label: 'Órdenes', value: String(kpiData.value.totales?.total_ordenes || 0), icon: '🧾', raw: kpiData.value.totales?.total_ordenes, rawAnterior: kpiAnterior.value.totales?.total_ordenes },
  { label: 'Ticket Prom', value: '$' + fm(kpiData.value.totales?.promedio_por_orden), icon: '📈', raw: kpiData.value.totales?.promedio_por_orden, rawAnterior: kpiAnterior.value.totales?.promedio_por_orden },
  { label: 'Top Plato', value: topProductos.value[0]?.nombre || '—', icon: '🏆', raw: null, rawAnterior: null },
])

onMounted(() => setKpiPeriodo('total'))
</script>