<template>
  <div class="space-y-6">

    <!-- ══ FILTROS (AL INICIO) ══ -->
    <div class="bg-white rounded-xl shadow-xs border border-[#DDE3DE] p-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div class="flex-1">
          <h3 class="text-base font-semibold text-[#202723]">Reporte de Ventas Detallado</h3>
          <p class="text-xs text-[#68736C] mt-1">
            Visualiza el flujo de ingresos de tu restaurante. Puedes comparar periodos y filtrar por meseros específicos.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-4">
          <!-- Rango de Fechas -->
          <div class="flex items-center gap-2 bg-[#F6F7F5] p-1.5 rounded-lg border border-[#DDE3DE]">
            <div class="flex flex-col gap-0.5 px-2">
              <span class="text-[10px] font-semibold text-[#68736C] uppercase tracking-wider">Inicio</span>
              <input v-model="kpiFechaInicio" type="date" @change="kpiPeriodo = 'custom'"
                class="bg-transparent text-xs font-medium text-[#202723] focus:outline-none cursor-pointer" />
            </div>
            <div class="w-px h-7 bg-[#DDE3DE]"></div>
            <div class="flex flex-col gap-0.5 px-2">
              <span class="text-[10px] font-semibold text-[#68736C] uppercase tracking-wider">Fin</span>
              <input v-model="kpiFechaFin" type="date" @change="kpiPeriodo = 'custom'"
                class="bg-transparent text-xs font-medium text-[#202723] focus:outline-none cursor-pointer" />
            </div>
          </div>

          <!-- Selector de Empleado -->
          <div class="flex flex-col gap-1">
            <span class="text-[10px] font-semibold text-[#68736C] uppercase tracking-wider ml-1">Ventas de:</span>
            <select v-model="kpiMeseroId" @change="loadKpis"
              class="px-3 py-2 text-xs border border-[#DDE3DE] rounded-lg focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] outline-none bg-white cursor-pointer min-w-[160px] text-[#202723] transition-colors">
              <option value="">Todo el equipo</option>
              <option v-for="emp in empleados" :key="emp.id" :value="emp.id">
                {{ emp.nombre || emp.name || emp.username }}
              </option>
            </select>
          </div>

          <!-- Botón Actualizar -->
          <button @click="loadKpis" :disabled="loading"
            class="h-[38px] px-5 bg-[#245C4F] hover:bg-[#19483D] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer self-end">
            <i class="fa-solid fa-arrows-rotate" :class="{ 'animate-spin': loading }"></i>
            {{ loading ? 'Actualizando...' : 'Ver Reporte' }}
          </button>
        </div>
      </div>

      <div class="mt-5 flex flex-wrap items-center gap-4 border-t border-[#DDE3DE] pt-4">
        <!-- Atajos de Periodo -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-[#68736C]">Período:</span>
          <div class="flex gap-1 bg-[#F0F2EF] border border-[#DDE3DE] rounded-lg p-1">
            <button v-for="p in kpiPeriodos" :key="p.key" @click="setKpiPeriodo(p.key)"
              :class="['px-3 py-1 text-xs font-medium rounded-md transition-colors',
                kpiPeriodo === p.key ? 'bg-white shadow-xs text-[#245C4F] font-semibold' : 'text-[#68736C] hover:text-[#202723]']">
              {{ p.label }}
            </button>
          </div>
        </div>

        <!-- Agrupación -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-[#68736C]">Agrupar:</span>
          <div class="flex gap-1 bg-[#F0F2EF] border border-[#DDE3DE] rounded-lg p-1">
            <button v-for="g in grupos" :key="g.value" @click="kpiGrupo = g.value; loadKpis()"
              :class="['px-3 py-1 text-xs font-medium rounded-md transition-colors',
                kpiGrupo === g.value ? 'bg-white shadow-xs text-[#202723] font-semibold' : 'text-[#68736C] hover:text-[#202723]']">
              {{ g.label }}
            </button>
          </div>
        </div>

        <!-- Comparación -->
        <label class="flex items-center gap-2 text-xs font-medium text-[#68736C] cursor-pointer ml-auto bg-[#F6F7F5] px-3.5 py-1.5 rounded-lg border border-[#DDE3DE] hover:text-[#202723] transition-colors">
          <input type="checkbox" v-model="mostrarComparacion" class="w-3.5 h-3.5 rounded text-[#245C4F] focus:ring-[#245C4F] cursor-pointer" @change="loadKpis" />
          Comparar vs período anterior
        </label>
      </div>
    </div>

    <!-- ══ TIEMPOS DE PREPARACIÓN ══ -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl border border-[#DDE3DE] p-5 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-1.5">
            <p class="text-xs font-semibold text-[#68736C] uppercase tracking-wider">Tiempo Cocina</p>
            <MetricInfoTip titulo="Tiempo Cocina" paraQue="Rapidez con la que la cocina despacha cada pedido."
              comoSeMide="Tiempo promedio en minutos desde que se envía la orden a cocina hasta que queda lista." />
          </div>
          <div class="w-7 h-7 rounded-lg bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-xs">
            <i class="fa-solid fa-fire-burner"></i>
          </div>
        </div>
        <p class="text-2xl font-bold text-[#202723] font-mono tabular-nums">{{ tiempos.cocina ?? '—' }}</p>
        <p class="text-xs text-[#68736C] mt-1">minutos promedio hoy</p>
      </div>

      <div class="bg-white rounded-xl border border-[#DDE3DE] p-5 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-1.5">
            <p class="text-xs font-semibold text-[#68736C] uppercase tracking-wider">Tiempo Barra</p>
            <MetricInfoTip titulo="Tiempo Barra" paraQue="Cuánto tarda en salir cada bebida."
              comoSeMide="Tiempo promedio en minutos desde que se envía la orden a barra hasta que queda lista." />
          </div>
          <div class="w-7 h-7 rounded-lg bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-xs">
            <i class="fa-solid fa-wine-glass"></i>
          </div>
        </div>
        <p class="text-2xl font-bold text-[#202723] font-mono tabular-nums">{{ tiempos.barra ?? '—' }}</p>
        <p class="text-xs text-[#68736C] mt-1">minutos promedio hoy</p>
      </div>

      <div class="bg-white rounded-xl border border-[#DDE3DE] p-5 shadow-xs">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-1.5">
            <p class="text-xs font-semibold text-[#68736C] uppercase tracking-wider">Tiempo Postres</p>
            <MetricInfoTip titulo="Tiempo Postres" paraQue="Cuánto tarda la preparación de postres."
              comoSeMide="Tiempo promedio en minutos desde que se envía la orden a postres hasta que queda lista." />
          </div>
          <div class="w-7 h-7 rounded-lg bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-xs">
            <i class="fa-solid fa-cake-candles"></i>
          </div>
        </div>
        <p class="text-2xl font-bold text-[#202723] font-mono tabular-nums">{{ tiempos.postres ?? '—' }}</p>
        <p class="text-xs text-[#68736C] mt-1">minutos promedio hoy</p>
      </div>
    </div>

    <!-- ══ KPI CARDS ══ -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div v-for="card in kpiCards" :key="card.label"
        class="bg-white rounded-xl border border-[#DDE3DE] p-5 shadow-xs">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-semibold text-[#68736C] uppercase tracking-wider flex items-center gap-1.5">
              {{ card.label }}
              <MetricInfoTip :titulo="card.label" :paraQue="card.paraQue" :comoSeMide="card.comoSeMide" />
            </p>
            <p class="text-2xl font-bold text-[#202723] font-mono tabular-nums mt-1">{{ card.value }}</p>
          </div>
          <div class="w-8 h-8 rounded-lg bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-sm shrink-0">
            <i :class="card.iconClass || 'fa-solid fa-chart-simple'"></i>
          </div>
        </div>

        <div v-if="mostrarComparacion && card.rawAnterior" class="mt-3 flex items-center gap-1.5 text-xs">
          <span :class="dc(card.raw, card.rawAnterior)" class="px-2 py-0.5 rounded font-mono font-medium flex items-center gap-1">
            {{ di(card.raw, card.rawAnterior) }} {{ dp(card.raw, card.rawAnterior) }}%
          </span>
          <span class="text-[#68736C]">vs anterior</span>
        </div>
      </div>
    </div>

    <!-- ══ INVERSIÓN / UTILIDAD + PROPINAS ══ -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl border border-[#DDE3DE] p-5 shadow-xs">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-1.5">
            <p class="text-xs font-semibold text-[#68736C] uppercase tracking-wider">Inversión Producto</p>
            <MetricInfoTip titulo="Inversión Producto" paraQue="Costo de producción de los platillos vendidos (insumos + tiempo de preparación + indirectos)."
              comoSeMide="Suma del costo integral de los platillos vendidos en el período (recetas + minutos de cocina + 5% indirectos)." />
          </div>
          <div class="w-7 h-7 rounded-lg bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-xs">
            <i class="fa-solid fa-box"></i>
          </div>
        </div>
        <p class="text-2xl font-bold text-[#202723] font-mono tabular-nums mt-1">${{ fm(finanzasDia.inversionProducto) }}</p>
        <p class="text-xs text-[#68736C] mt-1">Costo de producción (insumos + tiempo)</p>
      </div>

      <div class="bg-white rounded-xl border border-[#DDE3DE] p-5 shadow-xs">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-1.5">
            <p class="text-xs font-semibold text-[#68736C] uppercase tracking-wider">
              Utilidad Neta del Día
            </p>
            <MetricInfoTip titulo="Utilidad Neta del Día" paraQue="Ganancia real generada tras cubrir insumos, nómina y costos operativos."
              comoSeMide="Ventas - insumos de lo vendido - nómina activa diaria - costos fijos diarios - gastos/retiros. Coincide con Resumen General." />
          </div>
          <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
            :class="(finanzasDia.utilidadTotal || 0) < 0 ? 'bg-[#FBEBEB] text-[#B93838]' : 'bg-[#EBF5EE] text-[#26734D]'">
            <i class="fa-solid fa-chart-pie"></i>
          </div>
        </div>
        <p :class="['text-2xl font-bold font-mono tabular-nums mt-1', (finanzasDia.utilidadTotal || 0) < 0 ? 'text-[#B93838]' : 'text-[#26734D]']">
          {{ (finanzasDia.utilidadTotal || 0) < 0 ? '-$' + fm(Math.abs(finanzasDia.utilidadTotal)) : '$' + fm(finanzasDia.utilidadTotal) }}
        </p>
        <p :class="['text-xs mt-1 font-medium', (finanzasDia.utilidadTotal || 0) < 0 ? 'text-[#B93838]' : 'text-[#26734D]']">
          {{ (finanzasDia.utilidadTotal || 0) < 0 ? 'En recuperación (nómina y gastos operativos)' : 'Ganancia limpia del día' }}
        </p>
      </div>

      <div class="bg-white rounded-xl border border-[#DDE3DE] p-5 shadow-xs">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-1.5">
            <p class="text-xs font-semibold text-[#68736C] uppercase tracking-wider">Propinas</p>
            <MetricInfoTip titulo="Propinas" paraQue="Propinas que recibió el equipo en el período."
              comoSeMide="Suma de propinas en efectivo + terminal + transferencia." />
          </div>
          <div class="w-7 h-7 rounded-lg bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-xs">
            <i class="fa-solid fa-hand-holding-dollar"></i>
          </div>
        </div>
        <p class="text-2xl font-bold text-[#202723] font-mono tabular-nums mt-1">${{ fm(finanzasDia.propinasDigitales) }}</p>
        <p class="text-xs text-[#68736C] mt-1">Efectivo + Terminal + Transferencia</p>
      </div>
    </div>

    <!-- ══ GRÁFICA EVOLUCIÓN DE VENTAS ══ -->
    <div class="bg-white rounded-xl shadow-xs border border-[#DDE3DE] p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="font-semibold text-[#202723] text-base">Evolución de Ventas</h3>
          <p class="text-xs text-[#68736C] mt-0.5">Desglose por {{ kpiGrupoLabel }}</p>
        </div>
        <div class="text-right">
          <p class="text-[10px] text-[#68736C] uppercase font-semibold tracking-wider">Total del Período</p>
          <p class="text-lg font-bold text-[#245C4F] font-mono tabular-nums">${{ fm(kpiData.totales?.total_ventas) }}</p>
        </div>
      </div>
      <div class="relative h-80">
        <canvas ref="chartKpiVentas"></canvas>
      </div>
    </div>

    <!-- ══ SEGUNDA FILA: CANAL DE VENTAS + MARGEN FUERA DE TOP 5 ══ -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">

      <!-- DONUT Canal de Ventas -->
      <CanalVentasChart :api-url="apiUrl" :get-headers="getHeaders" :refresh-key="refreshKey" :server-date="serverDate" />

      <!-- Productos mayor margen FUERA del Top 5 -->
      <div class="bg-white rounded-xl shadow-xs border border-[#DDE3DE] p-6">
        <h3 class="font-semibold text-[#202723] text-base mb-1">
          Mayor Margen (fuera del Top 5 ventas)
        </h3>
        <p class="text-xs text-[#68736C] mb-4">Productos con alta utilidad y bajo volumen — oportunidad de impulso</p>
        <div class="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          <div v-if="productosMargenFueraTop.length === 0" class="text-center py-8 text-[#68736C] text-xs italic">
            Sin datos disponibles
          </div>
          <div v-for="(p, i) in productosMargenFueraTop" :key="p.id || i"
            class="flex items-center justify-between p-3 rounded-lg border border-[#DDE3DE] bg-[#F6F7F5]">
            <div class="flex items-center gap-2.5">
              <span class="text-xs font-semibold text-[#68736C] w-4 text-center">{{ i+1 }}</span>
              <span class="text-xs font-semibold text-[#202723]">{{ p.nombre }}</span>
            </div>
            <div class="text-right">
              <p class="text-xs font-bold text-[#26734D] font-mono tabular-nums">{{ fm(p.margen_pct) }}%</p>
              <p class="text-[10px] text-[#68736C]">{{ p.ventas }} uds</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ RENDIMIENTO VS ANTERIOR ══ -->
    <div class="bg-white rounded-xl shadow-xs border border-[#DDE3DE] p-6">
      <h3 class="font-semibold text-[#202723] text-base mb-4">Rendimiento vs Período Anterior</h3>
      <div v-if="!mostrarComparacion" class="h-60 flex flex-col items-center justify-center text-center">
        <p class="text-[#68736C] text-xs mb-3">Activa la comparación para analizar el crecimiento</p>
        <button @click="mostrarComparacion=true; loadKpis()" class="text-[#245C4F] font-semibold text-xs hover:underline cursor-pointer">Activar ahora</button>
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
import CanalVentasChart from './CanalVentasChart.vue'
import MetricInfoTip from './MetricInfoTip.vue'

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
const dc = (a, b) => Number(a||0) >= Number(b||0) ? 'bg-[#EBF5EE] text-[#26734D]' : 'bg-[#FBEBEB] text-[#B93838]'
const fmtDate = (d) => d.toLocaleDateString('en-CA')
const getServerToday = () => props.serverDate || new Date().toLocaleDateString('en-CA')

const kpiGrupoLabel = computed(() => ({ dia: 'día', semana: 'semana', mes: 'mes' }[kpiGrupo.value]))

const totalPedidosCanal = computed(() =>
  (canalVentas.value.Local || 0) + (canalVentas.value.Pickup || 0) + (canalVentas.value.Delivery || 0)
)

const canalLeyenda = computed(() => [
  { label: 'Local',    color: '#245C4F', valor: canalVentas.value.Local || 0 },
  { label: 'Pickup',   color: '#A96517', valor: canalVentas.value.Pickup || 0 },
  { label: 'Delivery', color: '#26734D', valor: canalVentas.value.Delivery || 0 },
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
  { label: 'Ingresos', value: '$' + fm(kpiData.value.totales?.total_ventas), iconClass: 'fa-solid fa-dollar-sign', raw: kpiData.value.totales?.total_ventas, rawAnterior: kpiAnterior.value.totales?.total_ventas,
    paraQue: 'Total facturado en el período seleccionado.',
    comoSeMide: 'Suma del total de todas las ventas cerradas en el rango de fechas elegido.' },
  { label: 'Órdenes', value: kpiData.value.totales?.total_ordenes || 0, iconClass: 'fa-solid fa-receipt', raw: kpiData.value.totales?.total_ordenes, rawAnterior: kpiAnterior.value.totales?.total_ordenes,
    paraQue: 'Número de órdenes cerradas durante el período.',
    comoSeMide: 'Conteo de todas las órdenes con estado cerrado en el rango de fechas.' },
  { label: 'Ticket Prom.', value: '$' + fm(kpiData.value.totales?.promedio_por_orden), iconClass: 'fa-solid fa-chart-line', raw: kpiData.value.totales?.promedio_por_orden, rawAnterior: kpiAnterior.value.totales?.promedio_por_orden,
    paraQue: 'Cuánto gasta en promedio cada comanda.',
    comoSeMide: 'Ingresos del período ÷ número de órdenes del período.' },
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

    const [vRes, pRes, mRes] = await Promise.all([
      fetch(`${props.apiUrl}/reportes/ventas${params}`, { headers }),
      fetch(`${props.apiUrl}/reportes/productos-mas-vendidos${params}&limite=20`, { headers }),
      fetch(`${props.apiUrl}/reportes/productos-mayor-margen${params}&limite=10`, { headers })
    ])

    const vData = await vRes.json()
    const pData = await pRes.json()
    const mData = await mRes.json()

    if (vData.success) kpiData.value = vData.data
    if (pData.success) topProductos.value = pData.data || []

    // Calcular productos con mayor margen fuera del Top 5
    if (mData.success && mData.data && Array.isArray(mData.data.productos) && mData.data.productos.length > 0) {
      productosMargenFueraTop.value = mData.data.productos.map(p => ({
        ...p,
        margen: parseFloat(p.utilidad_unitaria ?? (p.precio - (p.costo || 0))),
        margen_pct: parseFloat(p.margen_pct ?? (p.precio > 0 ? ((p.precio - (p.costo || 0)) / p.precio) * 100 : 0)),
        ventas: parseInt(p.total_vendido ?? 0)
      })).slice(0, 5)
    } else if (topProductos.value.length > 0) {
      // Fallback local robusto
      const top5ids = new Set(topProductos.value.slice(0, 5).map(p => p.id))
      productosMargenFueraTop.value = topProductos.value
        .map(p => {
          const precio = parseFloat(p.precio || 0);
          const costo = parseFloat(p.costo || 0);
          const margen = parseFloat(p.margen ?? (precio - costo));
          const margen_pct = parseFloat(p.margen_pct ?? (precio > 0 ? (margen / precio) * 100 : 0));
          return {
            ...p,
            margen,
            margen_pct,
            ventas: parseInt(p.ventas ?? p.total_vendido ?? 0)
          }
        })
        .filter(p => !top5ids.has(p.id) && p.margen > 0)
        .sort((a, b) => (b.margen_pct || 0) - (a.margen_pct || 0))
        .slice(0, 5)
    } else {
      productosMargenFueraTop.value = []
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
        finanzasDia.value.utilidadTotal     = fData.data.utilidad_neta ?? fData.data.utilidad_operativa ?? fData.data.utilidad_bruta ?? 0
      }
    } catch { /* fallback */ }

    // Fallback: calcular inversión mano de obra desde salarios de empleados
    if (!finanzasDia.value.inversionManoObra) {
      try {
        const eRes = await fetch(`${props.apiUrl}/empleados`, { headers })
        const eData = await eRes.json()
        if (eData.success && Array.isArray(eData.data)) {
          const nominaMensual = eData.data
            .filter(e => e.activo !== false)
            .reduce((s, e) => s + parseFloat(e.salario_base || 0), 0)
          finanzasDia.value.inversionManoObra = nominaMensual / 30
        }
      } catch { /* fallback */ }
    }

    // Fallback: calcular utilidad total desde ventas - costos
    if ((finanzasDia.value.utilidadTotal === undefined || finanzasDia.value.utilidadTotal === null) && kpiData.value.totales?.total_ventas) {
      const ventas = Number(kpiData.value.totales.total_ventas) || 0
      finanzasDia.value.utilidadTotal = ventas - (finanzasDia.value.inversionProducto || 0) - (finanzasDia.value.inversionManoObra || 0)
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
          backgroundColor: '#245C4F',
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
          backgroundColor: ['#245C4F', '#A96517', '#26734D'],
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
          { label: 'Actual', data: [kpiData.value.totales?.total_ventas, kpiData.value.totales?.promedio_por_orden], backgroundColor: '#245C4F', borderRadius: 4 },
          { label: 'Anterior', data: [kpiAnterior.value.totales?.total_ventas, kpiAnterior.value.totales?.promedio_por_orden], backgroundColor: '#DDE3DE', borderRadius: 4 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    })
  }
}

watch(() => props.refreshKey, () => loadKpis())
onMounted(() => setKpiPeriodo('semana'))
</script>