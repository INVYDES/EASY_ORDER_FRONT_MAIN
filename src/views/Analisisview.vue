<template>
  <div class="space-y-6">

    <SucursalBadge />

    <!-- Encabezado -->
    <div>
      <h2 class="text-2xl font-bold text-gray-900">Análisis y Métricas</h2>
      <p class="text-gray-500 text-sm mt-1">Inteligencia de negocio y rendimiento en tiempo real</p>
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
      <button v-for="t in tabs" :key="t.key" @click="activeTab = t.key"
        :class="['px-5 py-2 text-sm font-medium rounded-lg transition',
          activeTab === t.key ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:bg-gray-200']">
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
          <MetodoPagoChart    :ordenes-cerradas="ordenesCerradasHoy" />
        </div>

        <!-- Gráficas de Rendimiento -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <VentasSemanaChart :api-url="API_URL" :get-headers="getHeaders" />
          <TopProductosChart :api-url="API_URL" :get-headers="getHeaders" />
        </div>

        <!-- Gráficas de Operación -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PedidosEstadoChart :ordenes-por-estado="dashData.ordenes_por_estado" />
          <!-- Radar Chart de Distribución de Fuerza de Trabajo (PDF Page 2) -->
          <div class="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h3 class="font-bold text-gray-800 mb-4">Distribución de la Fuerza de Trabajo</h3>
            <div class="h-64 flex items-center justify-center text-gray-300 italic">
              <p>Radar Chart — Cocina, Barra, Postres, Caja, Meseros</p>
            </div>
          </div>
        </div>
      </template>
    </template>

    <!-- ══ TAB ANÁLISIS FINANCIERO ══ -->
    <template v-if="activeTab === 'financiero'">
      <div class="space-y-8">
        <FinancialMetricsGrid :metrics="financialData" />

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CanalVentasChart :data="salesChannels" />
          <TopMarginList :products="financialProducts" />
        </div>

        <BundleStrategyCard :products="financialProducts" />
      </div>
    </template>

    <!-- ══ TAB KPIs VENTAS ══ -->
    <template v-if="activeTab === 'kpis'">
      <KpiVentas :api-url="API_URL" :get-headers="getHeaders" />
    </template>

    <!-- ══ TAB KPIs PRODUCTOS ══ -->
    <template v-if="activeTab === 'productos'">
      <KpiProductos :api-url="API_URL" :get-headers="getHeaders" />
    </template>

    <!-- ══ TAB ROI ══ -->
    <template v-if="activeTab === 'roi'">
      <RoiChart :api-url="API_URL" :get-headers="getHeaders" />
    </template>

    <!-- ══ TAB MÉTRICAS MESEROS ══ -->
    <template v-if="activeTab === 'meseros'">
      <!-- Distribución de Equipo — estrella del tab -->
      <div class="mb-6">
        <EmpleadosRolChart :empleados="empleados" />
      </div>
      <MetricasMeseros :api-url="API_URL" :get-headers="getHeaders" />
    </template>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import SucursalBadge       from '../components/SucursalBadge.vue'
import DashboardKpis       from '../components/administraccion/DashboardKpis.vue'
import VentasPorHoraChart  from '../components/administraccion/Ventasxhorachart.vue'
import MetodoPagoChart     from '../components/administraccion/MetodoPagoChart.vue'
import VentasSemanaChart   from '../components/administraccion/VentasSemanaChart.vue'
import TopProductosChart   from '../components/administraccion/TopProductosChart.vue'
import PedidosEstadoChart  from '../components/administraccion/PedidosEstadoChart.vue'
import EmpleadosRolChart   from '../components/administraccion/EmpleadosRolChart.vue'
import KpiVentas           from '../components/administraccion/KpiVentas.vue'
import KpiProductos        from '../components/administraccion/KpiProductos.vue'
import RoiChart            from '../components/RoiChart.vue'
import MetricasMeseros     from '../components/administraccion/MetricasMeseros.vue'
import FinancialMetricsGrid from '../components/administraccion/FinancialMetricsGrid.vue'
import CanalVentasChart     from '../components/administraccion/CanalVentasChart.vue'
import TopMarginList       from '../components/administraccion/TopMarginList.vue'
import BundleStrategyCard  from '../components/administraccion/BundleStrategyCard.vue'
import { API_URL } from '@/config/api'

// ── Estado ─────────────────────────────────────────────────────────────────────
const activeTab = ref('resumen')
const loading   = ref(true)
const empleados    = ref([])
const restaurantes = ref([])
const ordenesCerradasHoy = ref([])
const dashData = reactive({ ventas_hoy: 0, ordenes_hoy: 0, utilidad_hoy: 0, ordenes_por_estado: [] })

const financialData = reactive({
  utilidadObjetivo: 5000,
  utilidadReal: 4200,
  inversionInicial: 25000,
  ventasMensuales: 15000,
  gastosVariables: 4000,
  gastosOperativos: 3000,
  gananciaNeta: 8000,
  puntoEquilibrio: 7000,
  roiGeneral: 32,
  roiProducto: 15,
  margenContribucion: 11000,
  porcentajeUtilidad: 53.3,
  kpiEmpleados: 88
})

const salesChannels = reactive({
  Local: 120,
  Pickup: 45,
  Delivery: 85
})

const financialProducts = ref([
  { id: 1, nombre: 'Hamburguesa Gourmet', precio: 15, costo: 5, ventas: 100, margen: 10, categoria: 'Cocina' },
  { id: 2, nombre: 'Taco Especial', precio: 10, costo: 3, ventas: 150, margen: 7, categoria: 'Cocina' },
  { id: 3, nombre: 'Ensalada César', precio: 12, costo: 4, ventas: 30, margen: 8, categoria: 'Cocina' },
  { id: 4, nombre: 'Sopa del Día', precio: 8, costo: 2, ventas: 20, margen: 6, categoria: 'Cocina' },
  { id: 5, nombre: 'Pizza Margarita', precio: 14, costo: 6, ventas: 80, margen: 8, categoria: 'Cocina' },
  { id: 6, nombre: 'Refresco Cola', precio: 3, costo: 1, ventas: 300, margen: 2, categoria: 'Bebida' },
  { id: 7, nombre: 'Jugo Natural', precio: 5, costo: 2, ventas: 120, margen: 3, categoria: 'Bebida' },
  { id: 8, nombre: 'Café Latte', precio: 4, costo: 1, ventas: 200, margen: 3, categoria: 'Bebida' },
  { id: 9, nombre: 'Cheesecake', precio: 7, costo: 3, ventas: 10, margen: 4, categoria: 'Postre' },
  { id: 10, nombre: 'Tiramisú', precio: 8, costo: 4, ventas: 15, margen: 4, categoria: 'Postre' },
  { id: 11, nombre: 'Brownie', precio: 6, costo: 2, ventas: 5, margen: 4, categoria: 'Postre' },
])

const tabs = [
  { key: 'resumen',   label: '📋 Resumen General'  },
  { key: 'financiero', label: '💰 Análisis Financiero' },
  { key: 'kpis',      label: '📊 KPIs Ventas'    },
  { key: 'productos', label: '📦 KPIs Productos'  },
  { key: 'roi',       label: '📈 ROI'              },
  { key: 'meseros',   label: '👥 Métricas Meseros' },
]

const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return { 'Content-Type':'application/json', Accept:'application/json', Authorization: token ? `Bearer ${token}` : '' }
}

const loadData = async () => {
  loading.value = true
  try {
    const today = new Date().toISOString().split('T')[0]
    const [uRes, rRes, dRes, cRes] = await Promise.all([
      fetch(`${API_URL}/me`,                  { headers: getHeaders() }),
      fetch(`${API_URL}/restaurantes`,        { headers: getHeaders() }),
      fetch(`${API_URL}/reportes/dashboard`,  { headers: getHeaders() }),
      fetch(`${API_URL}/ordenes?estado=CERRADA&fecha_desde=${today}&fecha_hasta=${today}&per_page=100`, { headers: getHeaders() }),
    ])

    const [uData, rData, dData, cData] = await Promise.all([uRes.json(), rRes.json(), dRes.json(), cRes.json()])

    if (rData.success) restaurantes.value = rData.data?.restaurantes || []
    if (cData.success) ordenesCerradasHoy.value = Array.isArray(cData.data) ? cData.data : []

    if (dData.success) {
      dashData.ventas_hoy         = dData.data?.ventas_hoy         || 0
      dashData.ordenes_por_estado = dData.data?.ordenes_por_estado || []
      dashData.ordenes_hoy        = dData.data?.ordenes_hoy ?? dashData.ordenes_por_estado.reduce((s, x) => s + Number(x.total || 0), 0)

      // Actualizar Canales de Venta desde el dashboard si existen
      if (dData.data?.canales_ventas) {
        Object.assign(salesChannels, dData.data.canales_ventas)
      }
      
      // Intentar obtener utilidad hoy del endpoint específico o del dashboard
      try {
        const uRes = await fetch(`${API_URL}/reportes/utilidad-dia`, { headers: getHeaders() })
        const uData = await uRes.json()
        if (uData.success) {
          dashData.utilidad_hoy = uData.data?.utilidad_acumulada || 0
        } else {
          dashData.utilidad_hoy = dData.data?.utilidad_hoy || 0
        }
      } catch {
        dashData.utilidad_hoy = dData.data?.utilidad_hoy || 0
      }
    }

    // Cargar datos financieros adicionales
    try {
      const fRes = await fetch(`${API_URL}/reportes/financiero`, { headers: getHeaders() })
      const fData = await fRes.json()
      if (fData.success && fData.data) {
        Object.assign(financialData, fData.data)
      }
    } catch (e) {
      console.error('Error al cargar datos financieros:', e)
    }

    // Cargar productos reales para márgenes y bundles
    try {
      const pRes = await fetch(`${API_URL}/productos`, { headers: getHeaders() })
      const pData = await pRes.json()
      if (pData.success && Array.isArray(pData.data)) {
        financialProducts.value = pData.data.map(p => ({
          ...p,
          margen: p.precio - (p.costo || 0),
          ventas: p.ventas_totales || 0 // Asumiendo que el API provee ventas totales
        }))
      }
    } catch (e) {
      console.error('Error al cargar productos:', e)
    }

    // Cargar empleados si tenemos propietario_id
    const user = uData.data || uData
    if (user?.propietario_id) {
      const eRes  = await fetch(`${API_URL}/propietarios/${user.propietario_id}`, { headers: getHeaders() })
      const eData = await eRes.json()
      if (eData.success) {
        empleados.value = (eData.data?.usuarios || eData.data?.users || []).filter(u => u.id !== user.id)
      }
    }
  } catch(e) {
    console.error('Error al cargar métricas:', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>