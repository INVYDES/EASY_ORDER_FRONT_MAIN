<template>
  <div class="space-y-6">


    <!-- ══ TIEMPOS DE PREPARACIÓN ══ -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-5 relative overflow-hidden">
        <span class="absolute right-4 top-3 text-4xl opacity-15">🍳</span>
        <p class="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">⏱ Cocina</p>
        <p class="text-3xl font-black text-orange-700">{{ tiempos.cocina ?? '—' }}</p>
        <p class="text-xs text-orange-400 mt-1">min promedio hoy</p>
      </div>
      <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 p-5 relative overflow-hidden">
        <span class="absolute right-4 top-3 text-4xl opacity-15">🍹</span>
        <p class="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">⏱ Barra</p>
        <p class="text-3xl font-black text-blue-700">{{ tiempos.barra ?? '—' }}</p>
        <p class="text-xs text-blue-400 mt-1">min promedio hoy</p>
      </div>
      <div class="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-100 p-5 relative overflow-hidden">
        <span class="absolute right-4 top-3 text-4xl opacity-15">🍰</span>
        <p class="text-xs font-bold text-pink-500 uppercase tracking-wider mb-1">⏱ Postres</p>
        <p class="text-3xl font-black text-pink-700">{{ tiempos.postres ?? '—' }}</p>
        <p class="text-xs text-pink-400 mt-1">min promedio hoy</p>
      </div>
    </div>

    <!-- ══ KPI CARDS ══ -->
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

    <!-- ══ INVERSIÓN / MANO DE OBRA / UTILIDAD + PROPINAS ══ -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-2xl border border-red-100 shadow-sm p-5 relative overflow-hidden">
        <span class="absolute right-3 top-2 text-4xl opacity-10">📦</span>
        <p class="text-xs font-bold text-red-400 uppercase tracking-wider">Inversión Producto</p>
        <p class="text-2xl font-black text-red-600 mt-1">${{ fm(finanzasDia.inversionProducto) }}</p>
        <p class="text-xs text-gray-400 mt-1">costo de insumos vendidos</p>
      </div>
      <div class="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 relative overflow-hidden">
        <span class="absolute right-3 top-2 text-4xl opacity-10">👷</span>
        <p class="text-xs font-bold text-amber-500 uppercase tracking-wider">Inversión Mano de Obra</p>
        <p class="text-2xl font-black text-amber-600 mt-1">${{ fm(finanzasDia.inversionManoObra) }}</p>
        <p class="text-xs text-gray-400 mt-1">nómina proporcional del día</p>
      </div>
      <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 shadow-sm p-5 relative overflow-hidden">
        <span class="absolute right-3 top-2 text-4xl opacity-10">💵</span>
        <p class="text-xs font-bold text-emerald-600 uppercase tracking-wider">Utilidad Total del Día</p>
        <p class="text-2xl font-black text-emerald-700 mt-1">${{ fm(finanzasDia.utilidadTotal) }}</p>
        <p class="text-xs text-emerald-500 mt-1">ventas − costos − MO</p>
      </div>
      <div class="bg-white rounded-2xl border border-violet-100 shadow-sm p-5 relative overflow-hidden">
        <span class="absolute right-3 top-2 text-4xl opacity-10">💳</span>
        <p class="text-xs font-bold text-violet-500 uppercase tracking-wider">Propinas Digitales</p>
        <p class="text-2xl font-black text-violet-700 mt-1">${{ fm(finanzasDia.propinasDigitales) }}</p>
        <p class="text-xs text-gray-400 mt-1">Terminal + Transferencia</p>
      </div>
    </div>

    <!-- ══ FILTROS ══ -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div class="flex-1">
          <h3 class="text-lg font-bold text-gray-800">Reporte de Ventas Detallado</h3>
          <p class="text-sm text-gray-500 mt-1">
            Visualiza el flujo de ingresos de tu restaurante. Puedes comparar periodos y filtrar por meseros específicos.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-4">
          <!-- Rango de Fechas -->
          <div class="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            <div class="flex flex-col gap-0.5 px-2">
              <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Inicio</span>
              <input v-model="kpiFechaInicio" type="date" @change="kpiPeriodo = 'custom'"
                class="bg-transparent text-sm font-semibold text-gray-700 focus:outline-none" />
            </div>
            <div class="w-px h-8 bg-gray-200"></div>
            <div class="flex flex-col gap-0.5 px-2">
              <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Fin</span>
              <input v-model="kpiFechaFin" type="date" @change="kpiPeriodo = 'custom'"
                class="bg-transparent text-sm font-semibold text-gray-700 focus:outline-none" />
            </div>
          </div>

          <!-- Selector de Empleado -->
          <div class="flex flex-col gap-1">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Ventas de:</span>
            <select v-model="kpiMeseroId" @change="loadKpis"
              class="px-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer min-w-[160px] transition-all hover:border-indigo-300">
              <option value="">Todo el equipo</option>
              <option v-for="emp in empleados" :key="emp.id" :value="emp.id">
                {{ emp.nombre || emp.name || emp.username }}
              </option>
            </select>
          </div>

          <!-- Botón Actualizar -->
          <button @click="loadKpis" :disabled="loading"
            class="h-[42px] px-6 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50">
            <i class="fa-solid fa-arrows-rotate" :class="{ 'animate-spin': loading }"></i>
            {{ loading ? 'Actualizando...' : 'Ver Reporte' }}
          </button>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap items-center gap-6 border-t border-gray-50 pt-4">
        <!-- Atajos de Periodo -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-gray-400 uppercase">Período rápido:</span>
          <div class="flex gap-1 bg-gray-100 rounded-xl p-1">
            <button v-for="p in kpiPeriodos" :key="p.key" @click="setKpiPeriodo(p.key)"
              :class="['px-3 py-1 text-xs font-bold rounded-lg transition-all',
                kpiPeriodo === p.key ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700']">
              {{ p.label }}
            </button>
          </div>
        </div>

        <!-- Agrupación -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-gray-400 uppercase">Ver por:</span>
          <div class="flex gap-1 bg-gray-100 rounded-xl p-1">
            <button v-for="g in grupos" :key="g.value" @click="kpiGrupo = g.value; loadKpis()"
              :class="['px-3 py-1 text-xs font-bold rounded-lg transition-all',
                kpiGrupo === g.value ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700']">
              {{ g.label }}
            </button>
          </div>
        </div>

        <!-- Comparación -->
        <label class="flex items-center gap-3 text-sm font-medium text-gray-600 cursor-pointer ml-auto bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
          <input type="checkbox" v-model="mostrarComparacion" class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer" @change="loadKpis" />
          Comparar vs período anterior
        </label>
      </div>
    </div>

    <!-- ══ GRÁFICA EVOLUCIÓN DE VENTAS ══ -->
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

    <!-- ══ SEGUNDA FILA: CANAL DE VENTAS + MARGEN FUERA DE TOP 5 ══ -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">

      <!-- DONUT Canal de Ventas -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 class="font-bold text-gray-800 mb-1 flex items-center gap-2">
          <span>🛵</span> Canal de Ventas
        </h3>
        <p class="text-xs text-gray-400 mb-4">Local · Pickup · Delivery</p>
        <div class="relative h-52 flex items-center justify-center">
          <canvas ref="chartCanal"></canvas>
          <!-- Total central -->
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span class="text-3xl font-black text-gray-800">{{ totalPedidosCanal }}</span>
            <span class="text-xs text-gray-400 font-medium">pedidos</span>
          </div>
        </div>
        <div class="flex justify-center gap-6 mt-4">
          <div v-for="c in canalLeyenda" :key="c.label" class="flex items-center gap-1.5">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: c.color }"></div>
            <span class="text-xs text-gray-500 font-medium">{{ c.label }}: <strong>{{ c.valor }}</strong></span>
          </div>
        </div>
      </div>

      <!-- Productos mayor margen FUERA del Top 5 -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 class="font-bold text-gray-800 mb-1 flex items-center gap-2">
          <span>💎</span> Mayor Margen (fuera del Top 5 ventas)
        </h3>
        <p class="text-xs text-gray-400 mb-4">Productos con alta utilidad y bajo volumen — oportunidad de impulso</p>
        <div class="space-y-3 max-h-52 overflow-y-auto pr-1">
          <div v-if="productosMargenFueraTop.length === 0" class="text-center py-8 text-gray-400 text-sm italic">
            Sin datos disponibles
          </div>
          <div v-for="(p, i) in productosMargenFueraTop" :key="p.id || i"
            class="flex items-center justify-between p-3 rounded-xl border"
            :class="i === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'">
            <div class="flex items-center gap-2">
              <span class="text-xs font-black text-gray-400 w-4">{{ i+1 }}</span>
              <span class="text-sm font-semibold text-gray-700">{{ p.nombre }}</span>
            </div>
            <div class="text-right">
              <p class="text-sm font-black text-emerald-600">${{ fm(p.margen) }}</p>
              <p class="text-[10px] text-gray-400">{{ p.ventas }} uds</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ RENDIMIENTO VS ANTERIOR ══ -->
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
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { apiClient } from '@/utils/apiClient'
import Chart from 'chart.js/auto'

const props = defineProps({
  apiUrl: { type: String, default: '/api' },
  getHeaders: { type: Function, required: true },
  empleados: { type: Array, default: () => [] },
  refreshKey: { type: Number, default: 0 },
  serverDate: { type: String, default: '' },
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
const kpiMeseroId = ref('')

// Datos nuevos
const tiempos = ref({ cocina: null, barra: null, postres: null })
const canalVentas = ref({ Local: 0, Pickup: 0, Delivery: 0 })
const finanzasDia = ref({
  inversionProducto: 0,
  inversionManoObra: 0,
  utilidadTotal: 0,
  propinasDigitales: 0
})
const productosMargenFueraTop = ref([])

// --- CANVAS ---
const chartKpiVentas = ref(null)
const chartCanal = ref(null)
const chartComparacion = ref(null)
let iKpiVentas = null, iCanal = null, iCompar = null

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
const fmtDate = (d) => d.toLocaleDateString('en-CA')
const getServerToday = () => props.serverDate || new Date().toLocaleDateString('en-CA')

const kpiGrupoLabel = computed(() => ({ dia: 'día', semana: 'semana', mes: 'mes' }[kpiGrupo.value]))

const totalPedidosCanal = computed(() =>
  (canalVentas.value.Local || 0) + (canalVentas.value.Pickup || 0) + (canalVentas.value.Delivery || 0)
)

const canalLeyenda = computed(() => [
  { label: 'Local',    color: '#4f46e5', valor: canalVentas.value.Local || 0 },
  { label: 'Pickup',   color: '#f59e0b', valor: canalVentas.value.Pickup || 0 },
  { label: 'Delivery', color: '#10b981', valor: canalVentas.value.Delivery || 0 },
])

// --- LÓGICA DE PERIODOS ---
const setKpiPeriodo = (key) => {
  kpiPeriodo.value = key
  const hoyStr = getServerToday()
  const hoy = new Date(hoyStr + 'T00:00:00')
  if (key === 'hoy') {
    kpiFechaInicio.value = hoyStr; kpiFechaFin.value = hoyStr; kpiGrupo.value = 'dia'
  } else if (key === 'semana') {
    const inicio = new Date(hoy); inicio.setDate(hoy.getDate() - 6);
    kpiFechaInicio.value = fmtDate(inicio); kpiFechaFin.value = hoyStr; kpiGrupo.value = 'dia'
  } else if (key === 'mes') {
    const inicio = new Date(hoy); inicio.setDate(hoy.getDate() - 29);
    kpiFechaInicio.value = fmtDate(inicio); kpiFechaFin.value = hoyStr; kpiGrupo.value = 'semana'
  } else if (key === 'total') {
    kpiFechaInicio.value = ''; kpiFechaFin.value = ''; kpiGrupo.value = 'mes'
  }
  loadKpis()
}

// --- KPI CARDS ---
const kpiCards = computed(() => [
  { label: 'Ingresos', value: '$' + fm(kpiData.value.totales?.total_ventas), icon: '💰', raw: kpiData.value.totales?.total_ventas, rawAnterior: kpiAnterior.value.totales?.total_ventas },
  { label: 'Órdenes', value: kpiData.value.totales?.total_ordenes || 0, icon: '🧾', raw: kpiData.value.totales?.total_ordenes, rawAnterior: kpiAnterior.value.totales?.total_ordenes },
  { label: 'Ticket Prom.', value: '$' + fm(kpiData.value.totales?.promedio_por_orden), icon: '📈', raw: kpiData.value.totales?.promedio_por_orden, rawAnterior: kpiAnterior.value.totales?.promedio_por_orden },
])

// --- API FETCH ---
const loadKpis = async () => {
  loading.value = true
  try {
    const headers = props.getHeaders()
    const fIni = kpiFechaInicio.value ? `&fecha_inicio=${kpiFechaInicio.value}` : ''
    const fFin = kpiFechaFin.value ? `&fecha_fin=${kpiFechaFin.value}` : ''
    const uId  = kpiMeseroId.value ? `&user_id=${kpiMeseroId.value}` : ''
    const params = `?grupo=${kpiGrupo.value}${fIni}${fFin}${uId}`

    const [vRes, pRes] = await Promise.all([
      fetch(`${props.apiUrl}/reportes/ventas${params}`, { headers }),
      fetch(`${props.apiUrl}/reportes/productos-mas-vendidos${params}&limite=20`, { headers })
    ])

    const vData = await vRes.json()
    const pData = await pRes.json()

    if (vData.success) kpiData.value = vData.data
    if (pData.success) topProductos.value = pData.data || []

    // Calcular productos con mayor margen fuera del Top 5
    if (topProductos.value.length > 0) {
      const top5ids = new Set(topProductos.value.slice(0, 5).map(p => p.id))
      productosMargenFueraTop.value = topProductos.value
        .filter(p => !top5ids.has(p.id) && p.margen > 0)
        .sort((a, b) => (b.margen || 0) - (a.margen || 0))
        .slice(0, 8)
    }

    // Cargar tiempos de preparación
    try {
      const tRes = await fetch(`${props.apiUrl}/reportes/tiempos-preparacion${params}`, { headers })
      const tData = await tRes.json()
      if (tData.success && Array.isArray(tData.data)) {
        let c = 0, b = 0, p = 0;
        let cCount = 0, bCount = 0, pCount = 0;
        tData.data.forEach(item => {
           const est = (item.estacion || '').toLowerCase();
           if(est.includes('cocina')) { c += parseFloat(item.promedio_minutos); cCount++; }
           if(est.includes('barra') || est.includes('bebida')) { b += parseFloat(item.promedio_minutos); bCount++; }
           if(est.includes('postre')) { p += parseFloat(item.promedio_minutos); pCount++; }
        });
        tiempos.value.cocina  = cCount > 0 ? (c / cCount).toFixed(1) : null;
        tiempos.value.barra   = bCount > 0 ? (b / bCount).toFixed(1) : null;
        tiempos.value.postres = pCount > 0 ? (p / pCount).toFixed(1) : null;
      }
    } catch { /* endpoint no disponible aún */ }

    // Cargar canal de ventas
    try {
      const cRes = await fetch(`${props.apiUrl}/reportes/ventas-por-canal-tipo${params}`, { headers })
      const cData = await cRes.json()
      if (cData.success && cData.data) {
        canalVentas.value = { ...canalVentas.value, ...cData.data }
      }
    } catch { /* fallback desde dashboard */ }

    // Cargar finanzas (inversión, utilidad)
    try {
      const fRes = await fetch(`${props.apiUrl}/reportes/inversion-utilidad${params}`, { headers })
      const fData = await fRes.json()
      if (fData.success && fData.data) {
        finanzasDia.value.inversionProducto = fData.data.inversion_producto || 0
        finanzasDia.value.inversionManoObra = fData.data.inversion_mano_obra || 0
        finanzasDia.value.utilidadTotal     = fData.data.utilidad_neta ?? fData.data.utilidad_bruta ?? 0
      }
    } catch { /* fallback */ }

    // Fallback: calcular inversión mano de obra desde salarios de empleados
    if (!finanzasDia.value.inversionManoObra) {
      try {
        const eRes = await fetch(`${props.apiUrl}/empleados`, { headers })
        const eData = await eRes.json()
        if (eData.success && Array.isArray(eData.data)) {
          const nominaMensual = eData.data
            .filter(e => e.activo !== false && !e.roles?.some(r => r.id === 7 || r.nombre === 'MENU'))
            .reduce((s, e) => s + parseFloat(e.salario_base || 0), 0)
          finanzasDia.value.inversionManoObra = nominaMensual / 30
        }
      } catch { /* fallback */ }
    }

    // Fallback: calcular utilidad total desde ventas - costos
    if (!finanzasDia.value.utilidadTotal && kpiData.value.totales?.total_ventas) {
      const ventas = Number(kpiData.value.totales.total_ventas) || 0
      finanzasDia.value.utilidadTotal = Math.max(0,
        ventas - finanzasDia.value.inversionProducto - finanzasDia.value.inversionManoObra
      )
    }

    // Cargar propinas
    try {
      const pTipRes = await fetch(`${props.apiUrl}/reportes/propinas${params}`, { headers })
      const pTipData = await pTipRes.json()
      if (pTipData.success) {
        finanzasDia.value.propinasDigitales = pTipData.data?.total_propinas || 0
      }
    } catch { /* fallback */ }

    // Fallback: calcular propinas desde órdenes cerradas con propina
    if (!finanzasDia.value.propinasDigitales && kpiData.value.ventas?.length) {
      const totalTips = kpiData.value.ventas.reduce((s, v) => s + Number(v.total_propinas || v.propina || 0), 0)
      finanzasDia.value.propinasDigitales = totalTips
    }

    if (mostrarComparacion.value && kpiFechaInicio.value) {
      const d1 = new Date(kpiFechaInicio.value); const d2 = new Date(kpiFechaFin.value)
      const diff = d2 - d1; const antFin = new Date(d1 - 1); const antIni = new Date(antFin - diff)
      const aRes = await fetch(`${props.apiUrl}/reportes/ventas?grupo=${kpiGrupo.value}&fecha_inicio=${fmtDate(antIni)}&fecha_fin=${fmtDate(antFin)}`, { headers })
      const aData = await aRes.json()
      kpiAnterior.value = aData.success ? aData.data : { totales: null, ventas: [] }
    }

    await nextTick()
    buildCharts()
  } catch (e) {
    console.error('Error cargando KPIs Ventas:', e)
  } finally {
    loading.value = false
  }
}

// --- CHART BUILDER ---
const buildCharts = async () => {
  const C = Chart

  // 1. Gráfica de ventas (Barras)
  iKpiVentas?.destroy()
  if (chartKpiVentas.value) {
    iKpiVentas = new C(chartKpiVentas.value, {
      type: 'bar',
      data: {
        labels: kpiData.value.ventas.map(v => v.fecha || `Sem ${v.semana}`),
        datasets: [{
          label: 'Ventas',
          data: kpiData.value.ventas.map(v => v.total_ventas),
          backgroundColor: '#10b981',
          borderRadius: 4
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false, 
        plugins: { 
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` $${Number(ctx.raw).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: (v) => '$' + Number(v).toLocaleString('es-MX') }
          }
        }
      }
    })
  }

  // 2. Donut Canal de Ventas
  iCanal?.destroy()
  if (chartCanal.value) {
    const vals = [canalVentas.value.Local || 0, canalVentas.value.Pickup || 0, canalVentas.value.Delivery || 0]
    iCanal = new C(chartCanal.value, {
      type: 'doughnut',
      data: {
        labels: ['Local', 'Pickup', 'Delivery'],
        datasets: [{
          data: vals,
          backgroundColor: ['#4f46e5', '#f59e0b', '#10b981'],
          borderWidth: 0,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: { legend: { display: false }, tooltip: { callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.raw} pedidos`
        }}}
      }
    })
  }

  // 3. Comparación barras
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

watch(() => props.refreshKey, () => loadKpis())
onMounted(() => setKpiPeriodo('semana'))
</script>