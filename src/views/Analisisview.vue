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

    <!-- ══ TAB RESUMEN (Movido de Gestión) ══ -->
    <template v-if="activeTab === 'resumen'">
      <div v-if="loading" class="flex items-center justify-center py-20 gap-3">
        <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p class="text-gray-400">Cargando métricas...</p>
      </div>

      <template v-else>
        <!-- KPIs -->
        <DashboardKpis
          :empleados="empleados"
          :restaurantes="restaurantes"
          :ordenes-hoy="dashData.ordenes_hoy"
          :ventas-hoy="dashData.ventas_hoy"
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
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <PedidosEstadoChart :ordenes-por-estado="dashData.ordenes_por_estado" />
          <EmpleadosRolChart  :empleados="empleados" />
        </div>
      </template>
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
import { API_URL } from '@/config/api'

// ── Estado ─────────────────────────────────────────────────────────────────────
const activeTab = ref('resumen')
const loading   = ref(true)
const empleados    = ref([])
const restaurantes = ref([])
const ordenesCerradasHoy = ref([])
const dashData = reactive({ ventas_hoy: 0, ordenes_hoy: 0, ordenes_por_estado: [] })

const tabs = [
  { key: 'resumen',   label: '📋 Resumen General'  },
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