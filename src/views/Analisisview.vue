<template>
  <div class="space-y-6">

    <SucursalBadge />

    <div class="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 mb-8 relative overflow-hidden">
      <div class="relative z-10">
        <h2 class="text-3xl font-black tracking-tight">Centro de Inteligencia</h2>
        <p class="text-indigo-100 mt-2 max-w-xl text-lg leading-relaxed font-medium">
          Bienvenido al panel de control. Aquí puedes ver cómo va tu negocio hoy, analizar tus productos más vendidos y revisar el desempeño de tu equipo.
        </p>
        <div class="flex gap-4 mt-6">
          <div class="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
            <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span class="text-xs font-bold uppercase tracking-wider">Datos en vivo</span>
          </div>
          <div class="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
            <i class="fa-solid fa-shield-check text-indigo-200"></i>
            <span class="text-xs font-bold uppercase tracking-wider">Reporte Seguro</span>
          </div>
        </div>
      </div>
      <!-- Decoración fondo -->
      <div class="absolute -right-20 -bottom-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div class="absolute right-10 top-10 text-white/10 text-9xl">
        <i class="fa-solid fa-chart-line"></i>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex flex-wrap items-center gap-2 bg-gray-100 rounded-2xl p-1.5 w-fit">
      <button v-for="t in tabs" :key="t.key" @click="activeTab = t.key"
        :class="['px-6 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2',
          activeTab === t.key ? 'bg-white shadow-md text-indigo-600 scale-105' : 'text-gray-500 hover:bg-gray-200']">
        <i :class="[
          t.key === 'resumen' ? 'fa-solid fa-house' : '',
          t.key === 'financiero' ? 'fa-solid fa-money-bill-trend-up' : '',
          t.key === 'kpis' ? 'fa-solid fa-chart-bar' : '',
          t.key === 'productos' ? 'fa-solid fa-box' : '',
          t.key === 'meseros' ? 'fa-solid fa-users' : ''
        ]"></i>
        {{ t.label }}
      </button>
    </div>

    <!-- ══ TAB RESUMEN ══ -->
    <template v-if="activeTab === 'resumen'">
      <div v-if="loading" class="flex items-center justify-center py-20 gap-3">
        <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p class="text-gray-400">Cargando métricas...</p>
      </div>

      <template v-else>
        <!-- KPIs -->
        <DashboardKpis
          :ordenes-hoy="dashData.ordenes_hoy"
          :ventas-hoy="dashData.ventas_hoy"
          :utilidad-hoy="dashData.utilidad_hoy"
          :utilidad-bruta-hoy="dashData.utilidad_bruta_hoy"
          :ordenes-por-estado="dashData.ordenes_por_estado"
        />

        <!-- Fila 1: Ventas por Hora + Métodos de Pago -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <VentasPorHoraChart :ordenes-cerradas="ordenesCerradasHoy" />
          <MetodoPagoChart    :ordenes-cerradas="ordenesCerradasHoy" />
        </div>

        <!-- Fila 2: Platos Estrella (Top Ventas) -->
        <div class="grid grid-cols-1 gap-6 mb-6">
          <TopProductosChart  :api-url="API_URL" :get-headers="getHeaders" :refresh-key="refreshCounter" :server-date="serverDate" />
        </div>

        <!-- Fila 3: Gráficas de Análisis con Filtros Individuales (Movidas al fondo) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <VentasSemanaChart  :api-url="API_URL" :get-headers="getHeaders" :refresh-key="refreshCounter" :server-date="serverDate" />
          <PedidosEstadoChart
            :api-url="API_URL"
            :get-headers="getHeaders"
            :ordenes-por-estado="dashData.ordenes_por_estado"
            :server-date="serverDate"
          />
          <CanalVentasChart
            :api-url="API_URL"
            :get-headers="getHeaders"
            :data="salesChannels"
            :server-date="serverDate"
          />
        </div>
      </template>
    </template>

    <!-- ══ TAB ANÁLISIS FINANCIERO ══ -->
    <template v-if="activeTab === 'financiero'">
      <div v-if="loading" class="flex items-center justify-center py-20 gap-3">
        <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p class="text-gray-400">Cargando datos financieros...</p>
      </div>
      <div v-else class="space-y-8">
        <FinancialMetricsGrid :metrics="financialData" />



      </div>
    </template>

    <!-- ══ TAB KPIs VENTAS ══ -->
    <template v-if="activeTab === 'kpis'">
      <KpiVentas :api-url="API_URL" :get-headers="getHeaders" :empleados="empleados" :refresh-key="refreshCounter" :server-date="serverDate" />
    </template>

    <!-- ══ TAB KPIs PRODUCTOS ══ -->
    <template v-if="activeTab === 'productos'">
      <KpiProductos :api-url="API_URL" :get-headers="getHeaders" :empleados="empleados" />
    </template>


    <!-- ══ TAB KPIs EMPLEADOS ══ -->
    <template v-if="activeTab === 'meseros'">
      <div class="space-y-6">
        <!-- Distribución de Equipo (Fuerza Operativa) -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Distribución de Fuerza Operativa</h3>
           <EmpleadosRolChart :empleados="empleados" />
        </div>

        <!-- Sub-tabs para Empleados -->
        <div class="flex border-b border-gray-200">
          <button v-for="st in subTabs" :key="st.key"
            @click="activeSubTab = st.key"
            :class="['px-6 py-3 text-sm font-bold transition-all border-b-2',
              activeSubTab === st.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700']">
            {{ st.label }}
          </button>
        </div>

        <!-- Vista de Meseros -->
        <div v-if="activeSubTab === 'meseros_sub'">
           <KpiMeserosModule :api-url="API_URL" :get-headers="getHeaders" :server-date="serverDate" />
        </div>

        <!-- Vista de Cocina -->
        <div v-if="activeSubTab === 'cocina_sub'">
           <KpiCocinaModule :api-url="API_URL" :get-headers="getHeaders" :server-date="serverDate" />
        </div>

        <!-- Vista de Caja -->
        <div v-if="activeSubTab === 'caja_sub'">
           <KpiCajaModule :api-url="API_URL" :get-headers="getHeaders" :server-date="serverDate" />
        </div>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import SucursalBadge        from '../components/SucursalBadge.vue'
import DashboardKpis        from '../components/administraccion/DashboardKpis.vue'
import VentasPorHoraChart   from '../components/administraccion/Ventasxhorachart.vue'
import MetodoPagoChart      from '../components/administraccion/MetodoPagoChart.vue'
import VentasSemanaChart    from '../components/administraccion/VentasSemanaChart.vue'
import TopProductosChart    from '../components/administraccion/TopProductosChart.vue'
import PedidosEstadoChart   from '../components/administraccion/PedidosEstadoChart.vue'
import EmpleadosRolChart    from '../components/administraccion/EmpleadosRolChart.vue'
import KpiVentas            from '../components/administraccion/KpiVentas.vue'
import KpiProductos         from '../components/administraccion/KpiProductos.vue'
import MetricasMeseros      from '../components/administraccion/MetricasMeseros.vue'
import KpiMeserosModule    from '../components/administraccion/KpiMeserosModule.vue'
import KpiCocinaModule     from '../components/administraccion/KpiCocinaModule.vue'
import KpiCajaModule       from '../components/administraccion/KpiCajaModule.vue'
import FinancialMetricsGrid from '../components/administraccion/FinancialMetricsGrid.vue'
import CanalVentasChart     from '../components/administraccion/CanalVentasChart.vue'
import { API_URL }          from '@/config/api'
import { apiClient }        from '@/utils/apiClient'

// ── Estado ────────────────────────────────────────────────────────────────────
const activeTab          = ref('resumen')
const activeSubTab       = ref('meseros_sub')
const loading            = ref(true)
const empleados          = ref([])
const restaurantes       = ref([])
const ordenesCerradasHoy = ref([])
const allProducts        = ref([])
const refreshCounter     = ref(0)
const serverDate         = ref('')

const propietarioData = reactive({})  // ✅ declarado

const dashData = reactive({
  ventas_hoy: 0,
  ordenes_hoy: 0,
  utilidad_hoy: 0,
  utilidad_bruta_hoy: 0,
  ordenes_por_estado: []
})

const financialData = reactive({
  utilidadObjetivo:    0,
  utilidadReal:        0,
  inversionInicial:    0,
  ventasMensuales:     0,
  gastosVariables:     0,
  gastosOperativos:    0,
  gananciaNeta:        0,
  puntoEquilibrio:     0,
  roiGeneral:          0,
  roiProducto:         0,
  margenContribucion:  0,
  porcentajeUtilidad:  0,
  kpiEmpleados:        0
})

const salesChannels = reactive({
  Local:    0,
  Pickup:   0,
  Delivery: 0
})

const fechaDesde = ref('')
const fechaHasta = ref('')
const filteredOrdenesPorEstado = ref([])
const filteredSalesChannels = reactive({
  Local:    0,
  Pickup:   0,
  Delivery: 0
})

const financialProducts = ref([])

const tabs = [
  { key: 'resumen',    label: '📋 Resumen General'     },
  { key: 'financiero', label: '💰 Análisis Financiero'  },
  { key: 'kpis',       label: '📊 KPIs Ventas'         },
  { key: 'productos',  label: '📦 KPIs Productos'       },
  { key: 'meseros',    label: '👥 KPIs Empleados'      },
]

const subTabs = [
  { key: 'meseros_sub', label: '🚶 Meseros' },
  { key: 'cocina_sub',  label: '👨‍🍳 Cocina' },
  { key: 'caja_sub',    label: '💵 Caja' },
]

const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  const restauranteId = localStorage.getItem('restaurante_id')
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
    ...(restauranteId && { 'X-Restaurante-Id': restauranteId })
  }
}

// ── Carga de datos ─────────────────────────────────────────────────────────────
const loadData = async () => {
  loading.value = true
  try {
  // Helper to get server date
  const fetchServerDate = async () => {
    try {
      const res = await apiClient.get('/server-time');
      if (res.success && res.data?.current_time) {
        // current_time format: 'YYYY-MM-DD HH:MM:SS'
        return res.data.current_time.split(' ')[0];
      }
    } catch (e) {
      console.error('Error fetching server time', e);
    }
    // Fallback to client date if server fails
    return new Date().toISOString().split('T')[0];
  };

  const today = await fetchServerDate();
  serverDate.value = today;

    const [uData, rData, dData, cData] = await Promise.all([
      apiClient.get('/me'),
      apiClient.get('/restaurantes'),
      apiClient.get('/reportes/dashboard'),
      apiClient.get(`/ordenes?estado=CERRADA,ENTREGADA&fecha_desde=${today}&fecha_hasta=${today}&per_page=100`),
    ])

    if (rData.success)  restaurantes.value       = rData.data?.restaurantes || []
    if (cData.success)  ordenesCerradasHoy.value = Array.isArray(cData.data) ? cData.data : []

    if (dData.success) {
      dashData.ventas_hoy         = dData.data?.ventas_hoy         || 0
      dashData.ordenes_por_estado = dData.data?.ordenes_por_estado || []
      dashData.ordenes_hoy        = dData.data?.ordenes_hoy
        ?? dashData.ordenes_por_estado.reduce((s, x) => s + Number(x.total || 0), 0)

      // Utilidad del día
      try {
        const uData2 = await apiClient.get('/reportes/utilidad-dia')
        dashData.utilidad_bruta_hoy = uData2.success ? (uData2.data?.utilidad_bruta_dia ?? 0) : 0
        dashData.utilidad_hoy = uData2.success
          ? (uData2.data?.utilidad_neta_dia ?? uData2.data?.utilidad_bruta_dia ?? 0)
          : (dData.data?.utilidad_neta_hoy ?? 0)
      } catch {
        dashData.utilidad_bruta_hoy = 0
        dashData.utilidad_hoy = dData.data?.utilidad_neta_hoy ?? 0
      }
    }

    // Inicializar filtro de fechas con hoy
    fechaDesde.value = today
    fechaHasta.value = today

    // Canal de Ventas (Local, Pickup, Delivery)
    try {
      const cTipoRes = await apiClient.get(`/reportes/ventas-por-canal-tipo?fecha_inicio=${today}&fecha_fin=${today}`)
      if (cTipoRes.success && cTipoRes.data) {
        salesChannels.Local = cTipoRes.data.Local || 0
        salesChannels.Pickup = cTipoRes.data.Pickup || 0
        salesChannels.Delivery = cTipoRes.data.Delivery || 0
      }
    } catch (e) {
      console.error('Error al cargar canales:', e)
    }
    // Sincronizar datos filtrados con los iniciales
    filteredOrdenesPorEstado.value = [...(dashData.ordenes_por_estado || [])]
    filteredSalesChannels.Local = salesChannels.Local
    filteredSalesChannels.Pickup = salesChannels.Pickup
    filteredSalesChannels.Delivery = salesChannels.Delivery

    // Datos financieros (ROI)
    try {
      const roiRes = await apiClient.get('/reportes/roi')
      if (roiRes.success && roiRes.data) {
        financialData.utilidadObjetivo = roiRes.data.kpis?.utilidad_objetivo || 0
        financialData.utilidadReal = roiRes.data.kpis?.utilidad_real || 0
        financialData.inversionInicial = roiRes.data.config?.inversion_inicial || 0
        financialData.ventasMensuales = roiRes.data.financiero?.venta_mes || 0
        financialData.gastosVariables = roiRes.data.financiero?.gastos_variables || 0
        financialData.gastosOperativos = roiRes.data.financiero?.gastos_operativos || 0
        financialData.gananciaNeta = roiRes.data.financiero?.ganancia_neta || 0
        financialData.puntoEquilibrio = roiRes.data.kpis?.punto_equilibrio || 0
        financialData.roiGeneral = roiRes.data.kpis?.roi_general || 0
        financialData.roiProducto = roiRes.data.kpis?.roi_producto || 0
        financialData.margenContribucion = roiRes.data.kpis?.margen_contribucion || 0
        financialData.porcentajeUtilidad = roiRes.data.kpis?.pct_utilidad || 0
        financialData.kpiEmpleados = roiRes.data.kpis?.kpi_empleados || 0
      }
    } catch (e) {
      console.error('Error al cargar datos financieros:', e)
    }

    // Productos
    try {
      const pData = await apiClient.get('/productos')
      if (pData.success) {
        allProducts.value       = pData.data || []
        financialProducts.value = pData.data.map(p => ({
          ...p,
          margen: p.precio - (p.costo || 0),
          ventas: p.ventas_totales || 0
        }))
      }
    } catch (e) {
      console.error('Error al cargar productos:', e)
    }

    // Empleados para gráficas (desde /empleados que tiene estructura completa con roles)
    try {
      const eData = await apiClient.get('/empleados')
      if (eData.success) {
        const raw = eData.data
        const lista = Array.isArray(raw) ? raw : (raw?.data || [])
        empleados.value = lista.filter(emp => {
          const userRoles = emp.roles || []
          return !userRoles.some(r => r.id === 7 || r.nombre?.toUpperCase() === 'MENU')
        })
      }
    } catch (e) {
      console.error('Error al cargar empleados:', e)
    }

    // Datos del propietario
    const user = uData.data || uData
    if (user?.propietario_id) {
      try {
        const pData = await apiClient.get(`/propietarios/${user.propietario_id}`)
        if (pData.success) {
          Object.assign(propietarioData, pData.data || {})
        }
      } catch (e) {
        console.error('Error al cargar propietario:', e)
      }
    }

  } catch (e) {
    console.error('Error al cargar métricas:', e)
  } finally {
    loading.value = false
    refreshCounter.value++
  }
}

// ── Carga filtrada por fechas ──────────────────────────────────────────────────
const loadFilteredData = async () => {
  try {
    const [dData, cData] = await Promise.all([
      apiClient.get(`/reportes/dashboard?fecha_inicio=${fechaDesde.value}&fecha_fin=${fechaHasta.value}`),
      apiClient.get(`/reportes/ventas-por-canal-tipo?fecha_inicio=${fechaDesde.value}&fecha_fin=${fechaHasta.value}`)
    ])
    if (dData.success) {
      filteredOrdenesPorEstado.value = dData.data?.ordenes_por_estado || []
    }
    if (cData.success && cData.data) {
      filteredSalesChannels.Local = cData.data.Local || 0
      filteredSalesChannels.Pickup = cData.data.Pickup || 0
      filteredSalesChannels.Delivery = cData.data.Delivery || 0
    }
  } catch (e) {
    console.error('Error al cargar datos filtrados:', e)
  }
}

const resetFilter = () => {
  fechaDesde.value = serverDate.value
  fechaHasta.value = serverDate.value
  filteredOrdenesPorEstado.value = [...(dashData.ordenes_por_estado || [])]
  filteredSalesChannels.Local = salesChannels.Local
  filteredSalesChannels.Pickup = salesChannels.Pickup
  filteredSalesChannels.Delivery = salesChannels.Delivery
}

let metricsInterval = null;
// ✅ onMounted para iniciar la carga
onMounted(() => {
  loadData()
  // Refresh metrics every minute to keep data up-to-date with server
  metricsInterval = setInterval(loadData, 60_000) // 60 seconds
})
// Cleanup interval on component unmount
onBeforeUnmount(() => {
  if (metricsInterval) clearInterval(metricsInterval)
})
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>