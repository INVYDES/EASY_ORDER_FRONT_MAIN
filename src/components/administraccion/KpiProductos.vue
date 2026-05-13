<template>
  <div class="space-y-6">

    <!-- ══ FILTROS ══ -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div class="flex-1">
          <h3 class="text-lg font-bold text-slate-800">Análisis de Popularidad de Productos</h3>
          <p class="text-sm text-slate-500 mt-1">
            Descubre qué productos prefieren tus clientes. Filtra por periodo o por el mesero que tomó la orden.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-4">
          <!-- Rango de Fechas -->
          <div class="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <div class="flex flex-col gap-0.5 px-2">
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Inicio</span>
              <input v-model="kpiFechaInicio" type="date"
                class="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none" />
            </div>
            <div class="w-px h-8 bg-slate-200"></div>
            <div class="flex flex-col gap-0.5 px-2">
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fin</span>
              <input v-model="kpiFechaFin" type="date"
                class="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none" />
            </div>
          </div>

          <!-- Selector de Empleado -->
          <div class="flex flex-col gap-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Vendido por:</span>
            <select v-model="kpiMeseroId" @change="loadKpis"
              class="px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer min-w-[160px] transition-all hover:border-indigo-300">
              <option value="">Todo el personal</option>
              <option v-for="emp in empleados" :key="emp.id" :value="emp.id">
                {{ emp.nombre || emp.name || emp.username }}
              </option>
            </select>
          </div>

          <!-- Botón Actualizar -->
          <button @click="loadKpis" :disabled="loading"
            class="h-[42px] px-6 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50">
            <i class="fa-solid fa-arrows-rotate" :class="{ 'animate-spin': loading }"></i>
            {{ loading ? 'Actualizando...' : 'Actualizar' }}
          </button>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap items-center gap-6 border-t border-slate-50 pt-4">
        <!-- Atajos de Periodo -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-400 uppercase">Periodo:</span>
          <div class="flex gap-1 bg-slate-100 rounded-xl p-1">
            <button v-for="p in kpiPeriodos" :key="p.key" @click="setKpiPeriodo(p.key)"
              :class="['px-3 py-1 text-xs font-bold rounded-lg transition-all',
                kpiPeriodo === p.key ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700']">
              {{ p.label }}
            </button>
          </div>
        </div>

        <!-- Botones de Exportación -->
        <div class="flex gap-2 ml-auto">
          <button @click="exportarReporte('pdf')"
            class="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100 group">
            <i class="fa-solid fa-file-pdf"></i>
            <span class="text-xs font-bold uppercase">Exportar PDF</span>
          </button>
          <button @click="exportarReporte('excel')"
            class="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 group">
            <i class="fa-solid fa-file-excel"></i>
            <span class="text-xs font-bold uppercase">Descargar Excel</span>
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

    <!-- RENTABILIDAD — Menor a Mayor -->
    <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="font-bold text-slate-800 text-lg">📊 Rentabilidad de Menor a Mayor</h3>
          <p class="text-xs text-slate-400 font-medium">Margen real por unidad (Precio - Costos de Insumos y MO)</p>
        </div>
      </div>
      <div class="space-y-2 max-h-80 overflow-y-auto pr-2">
        <div v-if="productosRentabilidad.length === 0" class="text-center py-8 text-slate-400 text-sm italic">Sin datos de rentabilidad</div>
        <div v-for="(p, i) in productosRentabilidad" :key="p.id || i"
          class="flex items-center justify-between p-3.5 rounded-2xl border transition-all hover:border-indigo-200 group"
          :class="i < 5 ? 'bg-red-50/50 border-red-100' : 'bg-slate-50/50 border-slate-100'">
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shadow-sm"
              :class="i < 5 ? 'bg-red-500 text-white' : 'bg-white text-slate-400 border border-slate-200'">
              {{ i + 1 }}
            </div>
            <span class="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{{ p.nombre }}</span>
          </div>
          <div class="text-right">
            <p class="text-sm font-black" :class="(p.margen_real || 0) < 0 ? 'text-red-600' : 'text-emerald-600'">${{ fm(p.margen_real) }}</p>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Margen Neto</p>
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
  empleados: { type: Array, default: () => [] }
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
const kpiMeseroId = ref('')

// Datos para cálculos de rentabilidad
const todosLosProductos = ref([])
const ingredientesGlobales = ref([])
const nominaMensual = ref(0)

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
    const uId  = kpiMeseroId.value ? `&user_id=${kpiMeseroId.value}` : ''

    const [vRes, pRes, prodMaster, ingRes, nomRes] = await Promise.all([
      fetch(`${props.apiUrl}/reportes/ventas?grupo=${kpiGrupo.value}${fIni}${fFin}${uId}`, { headers: props.getHeaders() }),
      fetch(`${props.apiUrl}/reportes/productos-mas-vendidos?limite=200${fIni}${fFin}${uId}`, { headers: props.getHeaders() }),
      fetch(`${props.apiUrl}/productos?per_page=1000`, { headers: props.getHeaders() }),
      fetch(`${props.apiUrl}/ingredientes`, { headers: props.getHeaders() }),
      fetch(`${props.apiUrl}/empleados`, { headers: props.getHeaders() }),
    ])

    const vData = await vRes.json()
    const pData = await pRes.json()
    const pmData = await prodMaster.json()
    const iData = await ingRes.json()
    const nData = await nomRes.json()

    if (vData.success) kpiData.value = vData.data
    if (pData.success) topProductos.value = pData.data || []
    
    // Cargar datos para cálculos
    if (iData.success || iData.data) ingredientesGlobales.value = iData.data || iData || []
    
    // Calcular nómina mensual (Compromiso Mensual)
    if (nData.success || nData.data) {
        const emps = nData.data || nData || []
        nominaMensual.value = emps.reduce((s, e) => s + parseFloat(e.salario_base || 0), 0)
    }

    // Calcular Rentabilidad Real
    if (pmData.success || pmData.data) {
        const listaMaster = pmData.data || pmData || []
        
        const calculados = listaMaster.map(p => {
            // 1. Insumos
            const costoInsumos = (p.ingredientes || []).reduce((sum, ing) => {
                const maestro = ingredientesGlobales.value.find(i => i.id === (ing.id || ing.ingrediente_id))
                const costoU = parseFloat(maestro?.costo_unitario || 0)
                const cant = parseFloat(ing.cantidad_necesaria || ing.cantidad || 0)
                return sum + (costoU * cant)
            }, 0)

            // 2. Mano de Obra (MO)
            const minProd = parseFloat(p.minutos_produccion || 0)
            const costoMO = (nominaMensual.value / 14400) * 1.66 * minProd

            // 3. Indirectos (5%)
            const costoIndirecto = (costoInsumos + costoMO) * 0.05

            const costoTotal = costoInsumos + costoMO + costoIndirecto
            const margenReal = parseFloat(p.precio || 0) - costoTotal

            return {
                ...p,
                margen_real: margenReal
            }
        })

        productosRentabilidad.value = calculados.sort((a, b) => a.margen_real - b.margen_real)
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