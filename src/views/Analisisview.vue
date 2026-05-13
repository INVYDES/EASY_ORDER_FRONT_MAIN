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
          :ordenes-por-estado="dashData.ordenes_por_estado"
        />

        <!-- Gráficas de Hoy -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <VentasPorHoraChart :ordenes-cerradas="ordenesCerradasHoy" />
          <VentasSemanaChart  :api-url="API_URL" :get-headers="getHeaders" />
        </div>

        <!-- Gráficas de Rendimiento -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <MetodoPagoChart    :ordenes-cerradas="ordenesCerradasHoy" />
          <TopProductosChart  :api-url="API_URL" :get-headers="getHeaders" />
        </div>

        <!-- Gráficas de Operación -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PedidosEstadoChart :ordenes-por-estado="dashData.ordenes_por_estado" />
          <!-- Radar Chart de Distribución de Fuerza de Trabajo (PDF Page 2) -->
          <CanalVentasChart :data="salesChannels" />
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

        <!-- Secciones de rentabilidad, paquetes y canales eliminadas por petición del usuario -->

      </div>
    </template>

    <!-- ══ TAB KPIs VENTAS ══ -->
    <template v-if="activeTab === 'kpis'">
      <KpiVentas :api-url="API_URL" :get-headers="getHeaders" :empleados="empleados" />
    </template>

    <!-- ══ TAB KPIs PRODUCTOS ══ -->
    <template v-if="activeTab === 'productos'">
      <KpiProductos :api-url="API_URL" :get-headers="getHeaders" :empleados="empleados" />
    </template>


    <!-- ══ TAB KPIs EMPLEADOS ══ -->
    <template v-if="activeTab === 'meseros'">
      <!-- Distribución de Equipo — estrella del tab -->
      <div class="mb-6">
        <EmpleadosRolChart :empleados="empleados" />
      </div>
      <MetricasMeseros :api-url="API_URL" :get-headers="getHeaders" :empleados="empleados" />
    </template>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
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
import RoiChart             from '../components/RoiChart.vue'
import MetricasMeseros      from '../components/administraccion/MetricasMeseros.vue'
import FinancialMetricsGrid from '../components/administraccion/FinancialMetricsGrid.vue'
import CanalVentasChart     from '../components/administraccion/CanalVentasChart.vue'
import TopMarginList        from '../components/administraccion/TopMarginList.vue'
import BundleStrategyCard   from '../components/administraccion/BundleStrategyCard.vue'
import { API_URL }          from '@/config/api'
import { apiClient }        from '@/utils/apiClient'

// ── Estado ────────────────────────────────────────────────────────────────────
const activeTab          = ref('resumen')
const loading            = ref(true)
const empleados          = ref([])
const restaurantes       = ref([])
const ordenesCerradasHoy = ref([])
const allProducts        = ref([])  // ✅ declarado

const propietarioData = reactive({})  // ✅ declarado

const dashData = reactive({
  ventas_hoy: 0,
  ordenes_hoy: 0,
  utilidad_hoy: 0,
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

const financialProducts = ref([])

const tabs = [
  { key: 'resumen',    label: '📋 Resumen General'     },
  { key: 'financiero', label: '💰 Análisis Financiero'  },
  { key: 'kpis',       label: '📊 KPIs Ventas'         },
  { key: 'productos',  label: '📦 KPIs Productos'       },
  { key: 'meseros',    label: '👥 KPIs Empleados'      },
]

const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: token ? `Bearer ${token}` : ''
  }
}

// ── Carga de datos ─────────────────────────────────────────────────────────────
const loadData = async () => {
  loading.value = true
  try {
    const today = new Date().toISOString().split('T')[0]

    const [uData, rData, dData, cData] = await Promise.all([
      apiClient.get('/me'),
      apiClient.get('/restaurantes'),
      apiClient.get('/reportes/dashboard'),
      apiClient.get(`/ordenes?estado=CERRADA&fecha_desde=${today}&fecha_hasta=${today}&per_page=100`),
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
        dashData.utilidad_hoy = uData2.success
          ? (uData2.data?.utilidad_neta_dia || uData2.data?.utilidad_bruta_dia || 0)
          : (dData.data?.utilidad_hoy || 0)
      } catch {
        dashData.utilidad_hoy = dData.data?.utilidad_hoy || 0
      }
    }

    // Canal de Ventas (Local, Pickup, Delivery)
    try {
      const cTipoRes = await apiClient.get('/reportes/ventas-por-canal-tipo')
      if (cTipoRes.success && cTipoRes.data) {
        salesChannels.Local = cTipoRes.data.Local || 0
        salesChannels.Pickup = cTipoRes.data.Pickup || 0
        salesChannels.Delivery = cTipoRes.data.Delivery || 0
      }
    } catch (e) {
      console.error('Error al cargar canales:', e)
    }

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

    // Empleados del propietario
    const user = uData.data || uData
    if (user?.propietario_id) {
      try {
        const eData = await apiClient.get(`/propietarios/${user.propietario_id}`)
        if (eData.success) {
          empleados.value = (eData.data?.usuarios || eData.data?.users || [])
            .filter(u => u.id !== user.id)
          Object.assign(propietarioData, eData.data || {})
        }
      } catch (e) {
        console.error('Error al cargar propietario:', e)
      }
    }

  } catch (e) {
    console.error('Error al cargar métricas:', e)
  } finally {
    loading.value = false
  }
}

// ✅ onMounted para iniciar la carga
onMounted(() => {
  loadData()
})
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>