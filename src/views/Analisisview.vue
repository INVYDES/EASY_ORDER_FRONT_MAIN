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
      <div class="flex justify-end">
        <BotonDudas @click="abrirAyuda('resumen')" />
      </div>

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

        <!-- Gráficas de Hoy -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <VentasPorHoraChart :ordenes-cerradas="ordenesCerradasHoy" />
          <VentasSemanaChart  :api-url="API_URL" :get-headers="getHeaders" :refresh-key="refreshCounter" :server-date="serverDate" />
        </div>

        <!-- Gráficas de Operación (Con selectores de período independientes) -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <PedidosEstadoChart :api-url="API_URL" :get-headers="getHeaders" :refresh-key="refreshCounter" :server-date="serverDate" />
          <CanalVentasChart   :api-url="API_URL" :get-headers="getHeaders" :refresh-key="refreshCounter" :server-date="serverDate" />
        </div>

        <!-- Gráficas de Rendimiento -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <MetodoPagoChart    :ordenes-cerradas="ordenesCerradasHoy" />
          <TopProductosChart  :api-url="API_URL" :get-headers="getHeaders" :refresh-key="refreshCounter" :server-date="serverDate" />
        </div>
      </template>
    </template>

    <!-- ══ TAB ANÁLISIS FINANCIERO ══ -->
    <template v-if="activeTab === 'financiero'">
      <div class="flex justify-end">
        <BotonDudas @click="abrirAyuda('financiero')" />
      </div>
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
      <div class="flex justify-end">
        <BotonDudas @click="abrirAyuda('kpis')" />
      </div>
      <KpiVentas :api-url="API_URL" :get-headers="getHeaders" :empleados="empleados" :refresh-key="refreshCounter" :server-date="serverDate" />
    </template>

    <!-- ══ TAB KPIs PRODUCTOS ══ -->
    <template v-if="activeTab === 'productos'">
      <div class="flex justify-end">
        <BotonDudas @click="abrirAyuda('productos')" />
      </div>
      <KpiProductos :api-url="API_URL" :get-headers="getHeaders" :empleados="empleados" />
    </template>


    <!-- ══ TAB KPIs EMPLEADOS ══ -->
    <template v-if="activeTab === 'meseros'">
      <div class="flex justify-end">
        <BotonDudas @click="abrirAyuda('meseros')" />
      </div>
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

    <!-- ══ MODAL DE DUDAS ══ -->
    <AyudaModal
      v-if="showAyuda"
      :titulo="ayudaInfo.titulo"
      :secciones="ayudaInfo.secciones"
      @close="showAyuda = false"
    />

  </div>
</template>

<script setup>
import { sessionGet, sessionSet, sessionRemove } from '@/utils/session'
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
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
import BotonDudas           from '../components/administraccion/BotonDudas.vue'
import AyudaModal           from '../components/administraccion/AyudaModal.vue'
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

const filteredDashData = reactive({
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

// ── Botón de Dudas ────────────────────────────────────────────────────────────
const showAyuda = ref(false)
const ayudaTab  = ref('resumen')
const abrirAyuda = (tab) => { ayudaTab.value = tab; showAyuda.value = true }
const ayudaInfo = computed(() => AYUDA[ayudaTab.value] || AYUDA.resumen)

const AYUDA = {
  resumen: {
    titulo: 'Métricas → Resumen General',
    secciones: [
      { icon: '🗓️', titulo: '¿Dónde estoy?', texto: 'Resumen del negocio del día de hoy: cuánto vendiste y cuánto ganaste.', nota: 'Los números se actualizan solos cada minuto.' },
      { icon: '💰', titulo: 'Ventas hoy', texto: 'Todo lo que ingresó por órdenes cerradas de hoy.', formula: 'Suma de todas las órdenes cerradas del día', nota: 'Se llena solo cuando cierras órdenes en Caja.' },
      { icon: '📈', titulo: 'Ticket promedio', texto: 'Cuánto gasta cada comensal por orden.', formula: 'Ventas del día ÷ Órdenes del día' },
      { icon: '⭐', titulo: 'Utilidad bruta', texto: 'Lo que ganaste antes de sacar dinero de caja.', formula: 'Ventas − Costo de producción (ingredientes + mano de obra)', nota: 'Para que sea exacto, registra ingredientes y tiempo de producción en tus productos.' },
      { icon: '🏆', titulo: 'Utilidad neta', texto: 'Lo que de verdad te queda al final del día.', formula: 'Utilidad bruta − Retiros de caja' },
      { icon: '📊', titulo: 'Gráficas', texto: 'Ventas por hora, ventas de la semana, canal (Local/Pickup/Delivery), forma de pago y top productos.', nota: 'Toda la info proviene automático de las órdenes de caja.' },
    ],
  },
  financiero: {
    titulo: 'Métricas → Análisis Financiero',
    secciones: [
      { icon: '🗓️', titulo: '¿Dónde estoy?', texto: 'La salud financiera del mes: cuánto vendes, cuánto gastas y cuánto ganas.' },
      { icon: '💵', titulo: 'Ventas y Gastos del mes', texto: 'Ventas acumuladas del mes. Gastos variables (insumos y empaque) y operativos (renta, nómina, servicios).' },
      { icon: '🏆', titulo: 'Ganancia neta mensual', texto: 'Lo que de verdad queda del mes.', formula: 'Ventas − Gastos variables − Gastos operativos' },
      { icon: '⚖️', titulo: 'Punto de equilibrio', texto: 'Lo mínimo que debes vender para no perder dinero.', formula: 'Gastos fijos ÷ % margen de contribución', nota: 'Si no aparece, registra tus gastos operativos.' },
      { icon: '📈', titulo: 'ROI', texto: 'Qué tan redituable es el negocio sobre lo invertido.', formula: '(Ganancia ÷ Inversión inicial) × 100 · Verde >15% · Amarillo 5-15% · Rojo <5%' },
      { icon: '🧮', titulo: '% Utilidad', texto: 'Lo que ganas por cada peso vendido.', formula: '(Ganancia ÷ Ventas) × 100', nota: 'Menos de 8% = riesgo, revisa precios o costos.' },
      { icon: '⚙️', titulo: '¿Qué configuro y dónde?', texto: 'Inversión inicial y utilidad objetivo se capturan en el módulo Financiero. El resto se calcula solo.' },
    ],
  },
  kpis: {
    titulo: 'Métricas → KPIs Ventas',
    secciones: [
      { icon: '🗓️', titulo: '¿Dónde estoy?', texto: 'Ventas, tiempos de preparación, utilidad del día y propinas de un período que eliges.' },
      { icon: '💰', titulo: 'Ingresos · Órdenes · Ticket', texto: 'Lo que vendiste, cuántas órdenes y el gasto promedio.' },
      { icon: '⏱️', titulo: 'Tiempos de cocina, barra y postres', texto: 'Cuánto tarda cada área en despachar un pedido.', nota: 'A menor tiempo, más rápido el servicio.' },
      { icon: '💵', titulo: 'Utilidad y propinas del día', texto: 'Inversión en producto (insumos + mano de obra), utilidad total y lo que tu equipo recibió de propinas.' },
      { icon: '🎛️', titulo: 'Filtros', texto: 'Elige Hoy/Semana/Mes/Todo, un mesero, agrupa por día/semana/mes y compara contra el período anterior.', nota: 'Todo se llena solo con las ventas de caja.' },
    ],
  },
  productos: {
    titulo: 'Métricas → KPIs Productos',
    secciones: [
      { icon: '🗓️', titulo: '¿Dónde estoy?', texto: 'Qué vendes más, cuánto dejan tus platillos y qué se está tardando o se pierde.' },
      { icon: '🏆', titulo: 'Popularidad', texto: 'Ranking de los productos más vendidos en el período.' },
      { icon: '📊', titulo: 'Rentabilidad', texto: 'El margen real de cada platillo.', formula: '(Precio − Costo de insumos y mano de obra) ÷ Precio × 100', nota: 'Se alimenta de los ingredientes y tiempos que registres en tu menú.' },
      { icon: '🔴', titulo: 'Retrasos', texto: 'Platillos que tardan más de lo estimado en prepararse.' },
      { icon: '📉', titulo: 'Mermas y cancelaciones', texto: 'Platillos que se eliminaron del ticket: 🔥 merma (se pierde todo) o ↩️ cancelación.', nota: 'Usa Exportar PDF / Excel para guardar el reporte.' },
    ],
  },
  meseros: {
    titulo: 'Métricas → KPIs Empleados',
    secciones: [
      { icon: '🗓️', titulo: '¿Dónde estoy?', texto: 'Desempeño de tu equipo por rol: Meseros, Cocina y Caja (usas la subtab de abajo).' },
      { icon: '🚶', titulo: 'Meseros', texto: 'Ventas, ticket promedio, productos por ticket, tiempo de servicio y un ranking con semáforo (verde, amarillo, rojo).', nota: 'Haz clic en un mesero para ver su detalle.' },
      { icon: '👨‍🍳', titulo: 'Cocina', texto: '% de órdenes con retraso, volumen de producción, el platillo más tardado y tolerancia por carga (ajustable con ⚙).' },
      { icon: '💵', titulo: 'Caja', texto: 'Diferencia acumulada de cierres (ideal $0.00) y tiempo promedio de cobro por cajero.' },
      { icon: '🔄', titulo: 'Datos', texto: 'Se llenan solos con los empleados registrados y las operaciones del día.' },
    ],
  },
}

const getHeaders = () => {
  const token = sessionGet('token')
  const restauranteId = sessionGet('restaurante_id')
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
      const timeStr = res.current_time || res.data?.current_time;
      if (res.success && timeStr) {
        // current_time format: 'YYYY-MM-DD HH:MM:SS'
        return timeStr.split(' ')[0];
      }
    } catch (e) {
      console.error('Error fetching server time', e);
    }
    // Fallback to client local date if server fails (avoiding UTC next-day shift)
    return new Date().toLocaleDateString('en-CA');
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
    filteredDashData.ventas_hoy         = dashData.ventas_hoy
    filteredDashData.ordenes_hoy        = dashData.ordenes_hoy
    filteredDashData.utilidad_hoy       = dashData.utilidad_hoy
    filteredDashData.utilidad_bruta_hoy = dashData.utilidad_bruta_hoy
    filteredDashData.ordenes_por_estado = [...(dashData.ordenes_por_estado || [])]

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
        empleados.value = Array.isArray(raw) ? raw : (raw?.data || [])
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
  loading.value = true
  try {
    const [dData, cData] = await Promise.all([
      apiClient.get(`/reportes/dashboard?fecha_inicio=${fechaDesde.value}&fecha_fin=${fechaHasta.value}`),
      apiClient.get(`/reportes/ventas-por-canal-tipo?fecha_inicio=${fechaDesde.value}&fecha_fin=${fechaHasta.value}`)
    ])
    
    if (dData.success && dData.data) {
      filteredDashData.ventas_hoy         = dData.data.ventas_hoy || 0
      filteredDashData.ordenes_por_estado = dData.data.ordenes_por_estado || []
      filteredDashData.ordenes_hoy        = (dData.data.ordenes_hoy 
        ?? dData.data.ordenes_por_estado?.reduce((s, x) => s + Number(x.total || 0), 0)) 
        || 0

      // Cargar utilidad filtrada usando inversion-utilidad (rango)
      try {
        const uRes = await apiClient.get(`/reportes/inversion-utilidad?fecha_inicio=${fechaDesde.value}&fecha_fin=${fechaHasta.value}`)
        if (uRes.success && uRes.data) {
          filteredDashData.utilidad_bruta_hoy = uRes.data.utilidad_bruta || 0
          filteredDashData.utilidad_hoy       = uRes.data.utilidad_neta || uRes.data.utilidad_bruta || 0
        }
      } catch (e) {
        console.error('Error al cargar utilidad filtrada:', e)
        filteredDashData.utilidad_bruta_hoy = 0
        filteredDashData.utilidad_hoy       = dData.data.utilidad_neta_hoy || 0
      }
      
      filteredOrdenesPorEstado.value = dData.data.ordenes_por_estado || []
    }
    
    if (cData.success && cData.data) {
      filteredSalesChannels.Local = cData.data.Local || 0
      filteredSalesChannels.Pickup = cData.data.Pickup || 0
      filteredSalesChannels.Delivery = cData.data.Delivery || 0
    }
  } catch (e) {
    console.error('Error al cargar datos filtrados:', e)
  } finally {
    loading.value = false
  }
}

const resetFilter = () => {
  fechaDesde.value = serverDate.value
  fechaHasta.value = serverDate.value
  
  filteredDashData.ventas_hoy         = dashData.ventas_hoy
  filteredDashData.ordenes_hoy        = dashData.ordenes_hoy
  filteredDashData.utilidad_hoy       = dashData.utilidad_hoy
  filteredDashData.utilidad_bruta_hoy = dashData.utilidad_bruta_hoy
  filteredDashData.ordenes_por_estado = [...(dashData.ordenes_por_estado || [])]
  
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