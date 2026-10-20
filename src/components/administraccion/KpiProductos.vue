<template>
  <div class="space-y-6">

    <!-- ══ FILTROS ══ -->
    <div class="bg-white rounded-xl shadow-xs border border-[#DDE3DE] p-6 mb-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div class="flex-1">
          <h3 class="text-base font-semibold text-[#202723]">Análisis de Popularidad de Productos</h3>
          <p class="text-xs text-[#68736C] mt-1">
            Descubre qué productos prefieren tus clientes. Filtra por periodo o por el mesero que tomó la orden.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-4">
          <!-- Rango de Fechas -->
          <div class="flex items-center gap-2 bg-[#F6F7F5] p-1.5 rounded-lg border border-[#DDE3DE]">
            <div class="flex flex-col gap-0.5 px-2">
              <span class="text-[10px] font-semibold text-[#68736C] uppercase tracking-wider">Inicio</span>
              <input v-model="kpiFechaInicio" type="date"
                class="bg-transparent text-xs font-medium text-[#202723] focus:outline-none cursor-pointer" />
            </div>
            <div class="w-px h-7 bg-[#DDE3DE]"></div>
            <div class="flex flex-col gap-0.5 px-2">
              <span class="text-[10px] font-semibold text-[#68736C] uppercase tracking-wider">Fin</span>
              <input v-model="kpiFechaFin" type="date"
                class="bg-transparent text-xs font-medium text-[#202723] focus:outline-none cursor-pointer" />
            </div>
          </div>

          <!-- Selector de Empleado -->
          <div class="flex flex-col gap-1">
            <span class="text-[10px] font-semibold text-[#68736C] uppercase tracking-wider ml-1">Vendido por:</span>
            <select v-model="kpiMeseroId" @change="loadKpis"
              class="px-3 py-2 text-xs border border-[#DDE3DE] rounded-lg focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] outline-none bg-white cursor-pointer min-w-[160px] text-[#202723] transition-colors">
              <option value="">Todo el personal</option>
              <option v-for="emp in empleados" :key="emp.id" :value="emp.id">
                {{ emp.nombre || emp.name || emp.username }}
              </option>
            </select>
          </div>

          <!-- Botón Actualizar -->
          <button @click="loadKpis" :disabled="loading"
            class="h-[38px] px-5 bg-[#245C4F] hover:bg-[#19483D] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer self-end">
            <i class="fa-solid fa-arrows-rotate" :class="{ 'animate-spin': loading }"></i>
            {{ loading ? 'Actualizando...' : 'Actualizar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- TODOS LOS PRODUCTOS — Gráfica de barras filtrable -->
    <div class="bg-white rounded-xl shadow-xs border border-[#DDE3DE] p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="font-semibold text-[#202723] text-base flex items-center gap-2">
            Todos los Productos del Menú
            <MetricInfoTip titulo="Popularidad de Productos" paraQue="Ranking de qué productos se venden más en tu menú."
              comoSeMide="Los productos se ordenan de mayor a menor según las unidades vendidas en el período seleccionado." />
          </h3>
          <p class="text-xs text-[#68736C]">Filtrado por período seleccionado · ordenado por unidades vendidas</p>
        </div>
      </div>
      <template v-if="topProductos.length">
        <div class="space-y-3 max-h-96 overflow-y-auto pr-2">
          <div v-for="(p, i) in topProductos" :key="p.id" class="flex items-center gap-4">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" :class="rankClass(i)">
              {{ i + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between mb-1">
                <p class="text-xs font-semibold text-[#202723] truncate">{{ p.nombre }}</p>
                <span class="text-xs font-semibold text-[#68736C] font-mono tabular-nums">{{ Number(p.total_vendido) }} uds</span>
              </div>
              <div class="w-full bg-[#F0F2EF] rounded-full h-1.5 overflow-hidden">
                <div class="h-full rounded-full bg-[#245C4F] transition-all duration-700"
                  :style="{ width: pct(p.total_vendido, topProductos[0]?.total_vendido) + '%' }"></div>
              </div>
            </div>
            <div class="text-right shrink-0 min-w-[80px]">
              <p class="text-xs font-bold text-[#202723] font-mono tabular-nums">${{ fm(p.total_ventas) }}</p>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="h-40 flex flex-col items-center justify-center text-[#68736C]">
        <p class="text-xs italic">Sin datos disponibles</p>
      </div>
    </div>

    <!-- RENTABILIDAD — Mayor a Menor -->
    <div class="bg-white rounded-xl shadow-xs border border-[#DDE3DE] p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="font-semibold text-[#202723] text-base flex items-center gap-2">
            Rentabilidad de Mayor a Menor
            <MetricInfoTip titulo="Rentabilidad por Producto" paraQue="Compara el margen real de cada platillo para saber cuáles dejan más dinero."
              comoSeMide="(Precio de venta - costo de insumos, mano de obra e indirectos) ÷ precio × 100. A mayor %, más rentable." />
          </h3>
          <p class="text-xs text-[#68736C]">Margen real por unidad (Precio - Costos de Insumos y MO)</p>
        </div>
      </div>
      <div class="space-y-2 max-h-80 overflow-y-auto pr-2">
        <div v-if="productosRentabilidad.length === 0" class="text-center py-8 text-[#68736C] text-xs italic">Sin datos de rentabilidad</div>
        <div v-for="(p, i) in productosRentabilidad" :key="p.id || i"
          class="flex items-center justify-between p-3 rounded-lg border border-[#DDE3DE] bg-[#F6F7F5] transition-colors hover:border-[#245C4F]/40 group">
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold bg-white text-[#202723] border border-[#DDE3DE]">
              {{ i + 1 }}
            </div>
            <span class="text-xs font-semibold text-[#202723] group-hover:text-[#245C4F] transition-colors">{{ p.nombre }}</span>
          </div>
          <div class="text-right">
            <p class="text-xs font-bold font-mono tabular-nums" :class="(p.margen_real || 0) < 0 ? 'text-[#B93838]' : 'text-[#26734D]'">{{ (p.margen_real || 0).toFixed(1) }}%</p>
            <p class="text-[9px] font-semibold text-[#68736C] uppercase tracking-wider">Margen %</p>
          </div>
        </div>
      </div>
    </div>

    <!-- PLATILLOS QUE REBASAN TIEMPO ESTIMADO -->
    <div class="bg-white rounded-xl shadow-xs border border-[#DDE3DE] p-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 class="font-semibold text-[#202723] text-base flex items-center gap-2">
            Platillos con Retraso en Preparación
            <MetricInfoTip titulo="Retrasos en Preparación" paraQue="Identifica los platillos que están tardando más de lo que deberían."
              comoSeMide="Se comparan los minutos de preparación a tiempo real contra el tiempo estimado de la receta: exceso = real - estimado." />
          </h3>
          <p class="text-xs text-[#68736C]">Productos que superaron el tiempo estimado en receta</p>
        </div>
        <div class="flex gap-1 bg-[#F0F2EF] border border-[#DDE3DE] rounded-lg p-1">
          <button v-for="t in tiempoFiltros" :key="t.key" @click="tiempoPeriodo = t.key; loadTiemposRebase()"
            :class="['px-3 py-1 text-xs font-medium rounded-md transition-colors',
              tiempoPeriodo === t.key ? 'bg-white shadow-xs text-[#202723] font-semibold' : 'text-[#68736C] hover:text-[#202723]']">
            {{ t.label }}
          </button>
        </div>
      </div>
      <div class="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        <div v-if="productosRebase.length === 0" class="text-center py-8 text-[#68736C] text-xs italic">Sin incidencias en el período</div>
        <div v-for="(p, i) in productosRebase" :key="i"
          class="flex items-center justify-between p-3 rounded-lg bg-[#F6F7F5] border border-[#DDE3DE]">
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-lg bg-[#FBEBEB] text-[#B93838] flex items-center justify-center text-xs shrink-0">
              <i class="fa-solid fa-clock"></i>
            </div>
            <div>
              <p class="text-xs font-semibold text-[#202723]">{{ p.nombre }}</p>
              <p class="text-[11px] text-[#68736C]">Estimado: {{ p.tiempo_estimado }} min · Real: <strong class="text-[#202723] font-semibold">{{ p.tiempo_real }} min</strong></p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-xs font-bold text-[#B93838] font-mono tabular-nums">+{{ p.exceso }} min</p>
            <p class="text-[10px] text-[#68736C]">{{ p.orden_id ? 'Orden #' + p.orden_id : p.veces + ' veces' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ SECCIÓN: PLATILLOS DEVUELTOS / CANCELADOS ══ -->
    <div class="bg-white rounded-xl shadow-xs border border-[#DDE3DE] p-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 class="font-semibold text-[#202723] text-base flex items-center gap-2">
            Platillos Devueltos y Cancelaciones
            <MetricInfoTip titulo="Devoluciones y Merma" paraQue="Muestra el dinero perdido por platillos que fueron eliminados del ticket."
              comoSeMide="Suma del subtotal de los items cancelados. Se clasifica como merma cuando el producto no puede reutilizarse." />
          </h3>
          <p class="text-xs text-[#68736C]">Historial de productos eliminados con motivo de cancelación</p>
        </div>
        <div class="flex flex-wrap items-center gap-3 ml-auto sm:ml-0">
          <div class="flex gap-1 bg-[#F0F2EF] border border-[#DDE3DE] rounded-lg p-1">
            <button v-for="t in tiempoFiltros" :key="t.key" @click="devueltosPeriodo = t.key; loadDevueltos()"
              :class="['px-3 py-1 text-xs font-medium rounded-md transition-colors',
                devueltosPeriodo === t.key ? 'bg-white shadow-xs text-[#202723] font-semibold' : 'text-[#68736C] hover:text-[#202723]']">
              {{ t.label }}
            </button>
          </div>
          <div class="flex items-center gap-2">
            <div class="px-3.5 py-1.5 bg-[#FBEBEB] text-[#B93838] rounded-lg text-xs font-bold border border-[#B93838]/20">
              Merma Real: ${{ fm(costoRealMermas || totalMermas) }}
              <span v-if="totalMermas > 0" class="block text-[10px] text-[#B93838]/80 font-normal">
                (costo productos: ${{ fm(totalMermas) }})
              </span>
            </div>
            <div v-if="totalCancelacionesSinMerma > 0" class="px-3.5 py-1.5 bg-[#F0F2EF] text-[#68736C] rounded-lg text-xs font-semibold border border-[#DDE3DE]">
              Cancelaciones: ${{ fm(totalCancelacionesSinMerma) }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="overflow-x-auto border border-[#DDE3DE] rounded-lg">
        <table class="w-full text-left border-collapse">
          <thead class="bg-[#F0F2EF]">
            <tr class="text-[11px] font-semibold text-[#68736C] uppercase tracking-wider border-b border-[#DDE3DE]">
              <th class="py-2.5 px-3">Fecha/Hora</th>
              <th class="py-2.5 px-3">Producto</th>
              <th class="py-2.5 px-3">Cant</th>
              <th class="py-2.5 px-3">Subtotal</th>
              <th class="py-2.5 px-3">Motivo</th>
              <th class="py-2.5 px-3">Tipo</th>
              <th class="py-2.5 px-3">Autorizó</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#DDE3DE]">
            <tr v-if="productosDevueltos.length === 0">
              <td colspan="7" class="py-8 text-center text-[#68736C] italic text-xs">No hay devoluciones registradas en este periodo</td>
            </tr>
            <tr v-for="d in productosDevueltos" :key="d.id" class="text-xs hover:bg-[#F6F7F5] transition-colors"
              :class="d.es_merma ? 'bg-[#FBEBEB]/30' : ''">
              <td class="py-3 px-3 font-medium text-[#68736C]">
                {{ d.fecha ? new Date(d.fecha.replace(' ', 'T')).toLocaleString('es-MX', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit', hour12: true }) : '—' }}
              </td>
              <td class="py-3 px-3 font-semibold text-[#202723]">{{ d.producto || d.producto_nombre || d.nombre || 'Producto' }}</td>
              <td class="py-3 px-3 font-mono font-medium text-[#202723]">{{ d.cantidad }}</td>
              <td class="py-3 px-3 font-mono font-bold" :class="d.es_merma ? 'text-[#B93838]' : 'text-[#68736C]'">${{ fm(d.subtotal) }}</td>
              <td class="py-3 px-3">
                <span class="px-2.5 py-0.5 bg-[#F6F7F5] text-[#202723] rounded border border-[#DDE3DE] text-[11px]">
                  {{ d.motivo || d.motivo_cancelacion || 'Sin motivo' }}
                </span>
              </td>
              <td class="py-3 px-3">
                <span v-if="d.es_merma" class="px-2 py-0.5 bg-[#FBEBEB] text-[#B93838] rounded font-semibold text-[10px] border border-[#B93838]/20 uppercase">Merma</span>
                <span v-else class="px-2 py-0.5 bg-[#F0F2EF] text-[#68736C] rounded font-medium text-[10px] border border-[#DDE3DE] uppercase">Cancelado</span>
              </td>
              <td class="py-3 px-3">
                <div class="flex items-center gap-2">
                  <div class="w-5 h-5 rounded-full bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-[10px] font-bold uppercase">
                    {{ (d.usuario || 'U').substring(0,1) }}
                  </div>
                  <span class="font-medium text-[#202723]">{{ d.usuario || 'Sistema' }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { apiClient } from '@/utils/apiClient'
import { STORAGE_URL } from '@/config/api'
import MetricInfoTip from './MetricInfoTip.vue'

defineProps({
  apiUrl:     { type: String,   default: () => import.meta.env.VITE_API_URL || 'http://localhost:8000/api' },
  getHeaders: { type: Function, required: true },
  empleados: { type: Array, default: () => [] }
})

const loading = ref(false)
const kpiPeriodo = ref('hoy')
const kpiFechaInicio = ref('')
const kpiFechaFin = ref('')
const kpiGrupo = ref('dia')
const kpiData = ref({ ventas: [], totales: null })
const kpiAnterior = ref({ ventas: [], totales: null })
const topProductos = ref([])
const productosRentabilidad = ref([])
const productosRebase = ref([])
const productosDevueltos = ref([])
const tiempoPeriodo = ref('hoy')
const devueltosPeriodo = ref('hoy')
const kpiMeseroId = ref('')

// Datos para cálculos de rentabilidad
const todosLosProductos = ref([])
const ingredientesGlobales = ref([])
const nominaMensual = ref(0)

const kpiPeriodos = [
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

const totalMermas = ref(0)
const costoRealMermas = ref(0)
const totalCancelacionesSinMerma = ref(0)

const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${STORAGE_URL}${path}`
}

const rankClass = (i) => [
  'bg-[#E8F1ED] text-[#245C4F] border border-[#245C4F]/20',
  'bg-[#F0F2EF] text-[#202723] border border-[#DDE3DE]',
  'bg-[#F0F2EF] text-[#202723] border border-[#DDE3DE]',
][i] || 'bg-white text-[#68736C] border border-[#DDE3DE]'

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
  const fmt = (d) => d.toLocaleDateString('en-CA')
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
    const data = await apiClient.get(`/reportes/tiempos-rebase?periodo=${tiempoPeriodo.value}&limite=100`)
    if (data.success && data.data) {
      const periodoKey = tiempoPeriodo.value === '7dias' ? 'semana' : tiempoPeriodo.value
      if (data.data.hoy !== undefined || data.data.semana !== undefined || data.data.mes !== undefined) {
        productosRebase.value = data.data[periodoKey] || []
      } else {
        productosRebase.value = Array.isArray(data.data) ? data.data : []
      }
    } else {
      productosRebase.value = []
    }
  } catch { productosRebase.value = [] }
}

const loadKpis = async () => {
  loading.value = true
  try {
    const params = {
      fecha_inicio: kpiFechaInicio.value || null,
      fecha_fin:    kpiFechaFin.value || null,
      user_id:      kpiMeseroId.value || null
    }

    const [vData, pData, pmData, iData, nData] = await Promise.all([
      apiClient.get(`/reportes/ventas`, { params: { ...params, grupo: kpiGrupo.value } }),
      apiClient.get(`/reportes/productos-mas-vendidos`, { params: { ...params, limite: 200 } }),
      apiClient.get(`/productos`, { params: { per_page: 1000 } }),
      apiClient.get(`/ingredientes`),
      apiClient.get(`/empleados`),
    ])

    if (vData.success) kpiData.value = vData.data
    if (pData.success) topProductos.value = pData.data || []
    
    // Cargar datos para cálculos
    if (iData.success || iData.data) ingredientesGlobales.value = iData.data || iData || []
    
    // Calcular nómina mensual (Solo Personal Activo)
    if (nData.success || nData.data) {
        const emps = Array.isArray(nData.data) ? nData.data : (nData.data?.data || nData || [])
        nominaMensual.value = emps
            .filter(e => !!e.activo || e.activo === 1)
            .reduce((s, e) => s + parseFloat(e.salario_base || 0), 0)
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
            const costoMO = (nominaMensual.value / 14400) * 1.36 * minProd

            // 3. Indirectos (5%)
            const costoIndirecto = (costoInsumos + costoMO) * 0.05

            const costoTotal = costoInsumos + costoMO + costoIndirecto
            const precio = parseFloat(p.precio || 0)
            const margenReal = precio > 0 ? ((precio - costoTotal) / precio) * 100 : 0

            return {
                ...p,
                margen_real: margenReal
            }
        })

        productosRentabilidad.value = calculados.sort((a, b) => b.margen_real - a.margen_real)
    }

    await loadDevueltos()
    await loadTiemposRebase()
  } catch (e) { console.error(e) } finally { loading.value = false }
}

const loadDevueltos = async () => {
  try {
    const hoy = new Date()
    const fmt = (d) => d.toLocaleDateString('en-CA')
    let inicio = ''
    let fin = fmt(hoy)
    
    if (devueltosPeriodo.value === 'hoy') {
      inicio = fmt(hoy)
    } else if (devueltosPeriodo.value === '7dias') {
      const d = new Date()
      d.setDate(d.getDate() - 6)
      inicio = fmt(d)
    } else if (devueltosPeriodo.value === 'mes') {
      const d = new Date()
      d.setDate(d.getDate() - 29)
      inicio = fmt(d)
    }

    const params = {
      fecha_inicio: inicio || null,
      fecha_fin:    fin || null,
      user_id:      kpiMeseroId.value || null
    }

    const res = await apiClient.get(`/reportes/platillos-devueltos`, { params })
    if (res.success) {
      productosDevueltos.value = res.data || []
      totalMermas.value = res.total_mermas || 0
      costoRealMermas.value = res.costo_real_mermas || 0
      totalCancelacionesSinMerma.value = res.total_cancelaciones_sin_merma || 0
    }
  } catch (e) {
    console.error(e)
    productosDevueltos.value = []
  }
}

onMounted(() => setKpiPeriodo('hoy'))
</script>