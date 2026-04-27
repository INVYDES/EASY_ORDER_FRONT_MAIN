<template>
  <div class="space-y-6">

    <!-- Encabezado + Filtros -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div class="flex flex-col lg:flex-row lg:items-end gap-4">
        <div class="flex-1">
          <h3 class="text-base font-semibold text-gray-800">Rendimiento por mesero</h3>
          <p class="text-xs text-gray-400 mt-0.5">Ventas atribuidas por mesa asignada</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs text-gray-500 font-medium">Desde</label>
            <input v-model="filtros.fecha_desde" type="date"
              class="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-gray-500 font-medium">Hasta</label>
            <input v-model="filtros.fecha_hasta" type="date"
              class="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-gray-500 font-medium">Estado</label>
            <select v-model="filtros.estado"
              class="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
              <option value="">Todos</option>
              <option value="completada">Completada</option>
              <option value="pagada">Pagada</option>
            </select>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-gray-500 font-medium">Mesero</label>
            <select v-model="filtros.mesero_id"
              class="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
              <option value="">Todos los meseros</option>
              <option v-for="mesero in listaMeseros" :key="mesero.id" :value="mesero.id">
                {{ mesero.name }}
              </option>
            </select>
          </div>
          <div class="flex flex-col justify-end">
            <button @click="cargar"
              class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition flex items-center gap-2">
              <i class="fa-solid fa-rotate-right text-xs"></i> Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20 gap-3">
      <div class="w-7 h-7 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <span class="text-gray-400 text-sm">Cargando métricas...</span>
    </div>

    <template v-else-if="metricasMeseros.length === 0">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
        <div class="text-5xl mb-3">📊</div>
        <p class="text-gray-500 font-medium">Sin datos para el período seleccionado</p>
        <p class="text-gray-400 text-sm mt-1">Ajusta los filtros de fecha o verifica que haya órdenes completadas</p>
      </div>
    </template>

    <template v-else>

      <!-- KPI Cards resumen general mejorado -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p class="text-xs font-medium text-gray-400 uppercase tracking-wider">Total ventas</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ formatMoney(resumenGeneral.total_ventas) }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ resumenGeneral.total_ordenes }} órdenes</p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p class="text-xs font-medium text-gray-400 uppercase tracking-wider">Ticket promedio</p>
          <p class="text-2xl font-bold text-emerald-600 mt-1">{{ formatMoney(resumenGeneral.ticket_promedio_general) }}</p>
          <p class="text-xs text-gray-400 mt-1">por orden</p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p class="text-xs font-medium text-gray-400 uppercase tracking-wider">Meseros activos</p>
          <p class="text-2xl font-bold text-indigo-600 mt-1">{{ resumenGeneral.total_meseros_activos || metricasMeseros.length }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ metricasMeseros.length }} con ventas</p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p class="text-xs font-medium text-gray-400 uppercase tracking-wider">Top mesero</p>
          <div v-if="topMesero">
            <p class="text-lg font-bold text-gray-900 mt-1 truncate">{{ topMesero.nombre.split(' ')[0] }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ formatMoney(topMesero.total_ventas) }}</p>
          </div>
          <p v-else class="text-sm text-gray-400 mt-1">—</p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p class="text-xs font-medium text-gray-400 uppercase tracking-wider">Mejor ticket</p>
          <p class="text-2xl font-bold text-amber-600 mt-1">{{ formatMoney(mejorTicketPromedio) }}</p>
          <p class="text-xs text-gray-400 mt-1">promedio más alto</p>
        </div>
      </div>

      <!-- Gráfico de barras simple -->
      <div v-if="datosGrafico.labels.length > 0" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h4 class="text-sm font-semibold text-gray-800 mb-4">📊 Comparativa de ventas</h4>
        <div class="space-y-3">
          <div v-for="(label, idx) in datosGrafico.labels" :key="idx" class="group">
            <div class="flex justify-between text-xs text-gray-500 mb-1">
              <span class="font-medium">{{ label }}</span>
              <span>{{ formatMoney(datosGrafico.ventas[idx]) }}</span>
            </div>
            <div class="bg-gray-100 rounded-full h-8 overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-3 text-xs font-bold text-white"
                :class="getBarColor(idx)"
                :style="{ width: getBarWidth(datosGrafico.ventas[idx]) }">
                <span v-if="getBarWidth(datosGrafico.ventas[idx]) > 20">{{ datosGrafico.participacion[idx] }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de meseros mejorada -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h4 class="text-sm font-semibold text-gray-800">Detalle por mesero</h4>
          <span class="text-xs text-gray-400">Ordenado por ventas</span>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mesero</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Órdenes</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ventas</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ticket prom.</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Mesas</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Clientes</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">Participación</th>
                <th class="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="(m, i) in metricasMeseros" :key="m.mesero_id"
                class="hover:bg-gray-50 transition-colors">

                <!-- Posición -->
                <td class="px-5 py-4">
                  <span :class="[
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                    getPositionClass(i)
                  ]">
                    {{ getPositionIcon(i) }}
                  </span>
                </td>

                <!-- Nombre -->
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {{ getInitials(m.mesero_nombre) }}
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ m.mesero_nombre }}</p>
                      <p class="text-xs text-gray-400">@{{ m.mesero_username }}</p>
                      <p v-if="m.mesero_email" class="text-xs text-gray-300">{{ m.mesero_email }}</p>
                    </div>
                  </div>
                </td>

                <!-- Órdenes -->
                <td class="px-5 py-4 text-right">
                  <span class="text-sm font-semibold text-gray-700">{{ m.total_ordenes }}</span>
                </td>

                <!-- Ventas -->
                <td class="px-5 py-4 text-right">
                  <span class="text-sm font-bold text-gray-900">{{ formatMoney(m.total_ventas) }}</span>
                </td>

                <!-- Ticket promedio -->
                <td class="px-5 py-4 text-right">
                  <span class="text-sm text-emerald-700 font-medium">{{ formatMoney(m.ticket_promedio) }}</span>
                </td>

                <!-- Mesas atendidas -->
                <td class="px-5 py-4 text-right">
                  <span class="text-sm text-gray-600">{{ m.mesas_atendidas }}</span>
                </td>

                <!-- Clientes atendidos -->
                <td class="px-5 py-4 text-right">
                  <span class="text-sm text-gray-600">{{ m.clientes_atendidos || 0 }}</span>
                </td>

                <!-- Barra de participación -->
                <td class="px-5 py-4">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        class="h-2 rounded-full transition-all duration-700"
                        :class="getBarClass(i)"
                        :style="{ width: (m.participacion_ventas || 0) + '%' }"
                      ></div>
                    </div>
                    <span class="text-xs font-semibold text-gray-500 w-9 text-right">{{ m.participacion_ventas || 0 }}%</span>
                  </div>
                </td>

                <!-- Acciones -->
                <td class="px-5 py-4 text-center">
                  <button @click="verDetalleMesero(m)"
                    class="text-indigo-600 hover:text-indigo-800 text-xs font-medium transition">
                    Ver detalles
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Ranking de meseros -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h4 class="text-sm font-semibold text-gray-800 mb-3">🏆 Ranking de ventas</h4>
        <div class="flex flex-col gap-2">
          <div v-for="item in ranking" :key="item.posicion" 
            class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition">
            <div class="flex items-center gap-3">
              <span class="text-lg font-bold" :class="getRankingColor(item.posicion)">
                #{{ item.posicion }}
              </span>
              <span class="font-medium text-gray-700">{{ item.mesero_nombre }}</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-500">{{ item.total_ordenes }} órdenes</span>
              <span class="text-sm font-bold text-indigo-600">{{ formatMoney(item.total_ventas) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de detalles del mesero -->
      <div v-if="modalVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="cerrarModal">
        <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <h3 class="text-lg font-bold text-gray-900">Detalles del mesero</h3>
            <button @click="cerrarModal" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div v-if="meseroSeleccionado" class="p-6 space-y-4">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-2xl font-bold">
                {{ getInitials(meseroSeleccionado.mesero_nombre) }}
              </div>
              <div>
                <h4 class="text-xl font-bold text-gray-900">{{ meseroSeleccionado.mesero_nombre }}</h4>
                <p class="text-gray-500">@{{ meseroSeleccionado.mesero_username }}</p>
                <p class="text-sm text-gray-400">{{ meseroSeleccionado.mesero_email }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500">Total ventas</p>
                <p class="text-2xl font-bold text-gray-900">{{ formatMoney(meseroSeleccionado.total_ventas) }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500">Total órdenes</p>
                <p class="text-2xl font-bold text-gray-900">{{ meseroSeleccionado.total_ordenes }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500">Ticket promedio</p>
                <p class="text-2xl font-bold text-emerald-600">{{ formatMoney(meseroSeleccionado.ticket_promedio) }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500">Mesas atendidas</p>
                <p class="text-2xl font-bold text-indigo-600">{{ meseroSeleccionado.mesas_atendidas }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500">Clientes atendidos</p>
                <p class="text-2xl font-bold text-amber-600">{{ meseroSeleccionado.clientes_atendidos || 0 }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs text-gray-500">Eficiencia</p>
                <p class="text-2xl font-bold text-blue-600">{{ formatMoney(meseroSeleccionado.eficiencia) }} / orden</p>
              </div>
            </div>

            <div v-if="meseroSeleccionado.primera_venta" class="bg-gray-50 rounded-xl p-4">
              <p class="text-xs text-gray-500 mb-2">Período de actividad</p>
              <div class="flex justify-between text-sm">
                <span>📅 Primera venta: {{ formatDate(meseroSeleccionado.primera_venta) }}</span>
                <span>📅 Última venta: {{ formatDate(meseroSeleccionado.ultima_venta) }}</span>
              </div>
            </div>

            <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
              <p class="text-sm font-medium text-gray-700 mb-2">📈 Participación general</p>
              <div class="flex items-center gap-3">
                <div class="flex-1 bg-gray-200 rounded-full h-3">
                  <div class="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    :style="{ width: (meseroSeleccionado.participacion_ventas || 0) + '%' }">
                  </div>
                </div>
                <span class="text-lg font-bold text-indigo-600">{{ meseroSeleccionado.participacion_ventas || 0 }}%</span>
              </div>
              <p class="text-xs text-gray-500 mt-2">del total de ventas del período</p>
            </div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

const props = defineProps({
  apiUrl: { type: String, required: true },
  getHeaders: { type: Function, required: true }
})

// ── Estado ────────────────────────────────────────────────────────────────
const loading = ref(false)
const metricasMeseros = ref([])
const listaMeseros = ref([])
const ranking = ref([])
const topMesero = ref(null)
const resumenGeneral = reactive({
  total_ordenes: 0,
  total_ventas: 0,
  ticket_promedio_general: 0,
  total_meseros_activos: 0
})
const datosGrafico = reactive({
  labels: [],
  ventas: [],
  participacion: []
})

// Modal
const modalVisible = ref(false)
const meseroSeleccionado = ref(null)

const hoy = new Date().toISOString().split('T')[0]
const filtros = reactive({
  fecha_desde: hoy,
  fecha_hasta: hoy,
  estado: '',
  mesero_id: ''
})

// ── Computed ──────────────────────────────────────────────────────────────
const mejorTicketPromedio = computed(() => {
  if (metricasMeseros.value.length === 0) return 0
  return Math.max(...metricasMeseros.value.map(m => m.ticket_promedio || 0))
})

// ── Helpers ───────────────────────────────────────────────────────────────
const formatMoney = (val) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(val || 0)

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-MX')
}

const getInitials = (name) =>
  !name ? 'U' : name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)

const getPositionIcon = (index) => {
  if (index === 0) return '🥇'
  if (index === 1) return '🥈'
  if (index === 2) return '🥉'
  return index + 1
}

const getPositionClass = (index) => {
  if (index === 0) return 'bg-amber-100 text-amber-700'
  if (index === 1) return 'bg-gray-100 text-gray-600'
  if (index === 2) return 'bg-orange-100 text-orange-700'
  return 'bg-gray-50 text-gray-400'
}

const getBarClass = (index) => {
  if (index === 0) return 'bg-indigo-500'
  if (index === 1) return 'bg-indigo-400'
  if (index === 2) return 'bg-indigo-300'
  return 'bg-indigo-200'
}

const getBarColor = (index) => {
  if (index === 0) return 'bg-gradient-to-r from-indigo-500 to-purple-500'
  if (index === 1) return 'bg-gradient-to-r from-indigo-400 to-purple-400'
  return 'bg-gradient-to-r from-indigo-300 to-purple-300'
}

const getBarWidth = (venta) => {
  if (resumenGeneral.total_ventas === 0) return '0%'
  return ((venta / resumenGeneral.total_ventas) * 100) + '%'
}

const getRankingColor = (posicion) => {
  if (posicion === 1) return 'text-amber-500'
  if (posicion === 2) return 'text-gray-500'
  if (posicion === 3) return 'text-orange-500'
  return 'text-gray-400'
}

// ── Acciones ──────────────────────────────────────────────────────────────
const verDetalleMesero = (mesero) => {
  meseroSeleccionado.value = mesero
  modalVisible.value = true
}

const cerrarModal = () => {
  modalVisible.value = false
  meseroSeleccionado.value = null
}

// ── Carga de meseros para filtro ─────────────────────────────────────────
const cargarListaMeseros = async () => {
  try {
    const res = await fetch(`${props.apiUrl}/meseros`, {
      headers: props.getHeaders()
    })
    const data = await res.json()
    if (data.success) {
      listaMeseros.value = data.data.meseros || []
    }
  } catch (e) {
    console.error('Error cargando lista de meseros:', e)
  }
}

// ── Carga de métricas ────────────────────────────────────────────────────
const cargar = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde)
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta)
    if (filtros.estado) params.append('estado', filtros.estado)
    if (filtros.mesero_id) params.append('mesero_id', filtros.mesero_id)

    const res = await fetch(`${props.apiUrl}/meseros/metricas-ventas?${params}`, {
      headers: props.getHeaders()
    })
    const data = await res.json()

    if (data.success) {
      metricasMeseros.value = data.data.metricas_por_mesero || data.data.meseros || []
      
      // Resumen general
      resumenGeneral.total_ordenes = data.data.resumen_general?.total_ordenes || 0
      resumenGeneral.total_ventas = data.data.resumen_general?.total_ventas || 0
      resumenGeneral.ticket_promedio_general = data.data.resumen_general?.ticket_promedio_general || 
        (resumenGeneral.total_ordenes > 0 ? resumenGeneral.total_ventas / resumenGeneral.total_ordenes : 0)
      resumenGeneral.total_meseros_activos = data.data.resumen_general?.total_meseros_activos || metricasMeseros.value.length
      
      // Ranking y top mesero
      ranking.value = data.data.ranking || []
      topMesero.value = data.data.top_mesero || (metricasMeseros.value[0] ? {
        nombre: metricasMeseros.value[0].mesero_nombre,
        total_ventas: metricasMeseros.value[0].total_ventas
      } : null)
      
      // Datos para gráfico
      if (data.data.data_para_grafico) {
        datosGrafico.labels = data.data.data_para_grafico.labels || []
        datosGrafico.ventas = data.data.data_para_grafico.ventas || []
        datosGrafico.participacion = data.data.data_para_grafico.participacion || []
      } else {
        // Fallback si el backend no envía data_para_grafico
        datosGrafico.labels = metricasMeseros.value.map(m => m.mesero_nombre)
        datosGrafico.ventas = metricasMeseros.value.map(m => m.total_ventas)
        datosGrafico.participacion = metricasMeseros.value.map(m => m.participacion_ventas || m.participacion_pct || 0)
      }
    }
  } catch (e) {
    console.error('Error MetricasMeseros:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarListaMeseros()
  cargar()
})
</script>