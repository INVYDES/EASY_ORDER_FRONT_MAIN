<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Header con Selector de Mesero -->
    <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
      <div class="flex items-center gap-6">
        <div class="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl shadow-lg shadow-indigo-100">
          <i class="fa-solid fa-user-tie"></i>
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-800">Perfil de Rendimiento {{ filtros.mesero_id ? 'Particular' : 'General' }}</h2>
          <p class="text-gray-400 font-medium">Selecciona un mesero para ver su análisis detallado.</p>
        </div>
      </div>

      <div class="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
        <select v-model="filtros.mesero_id" @change="loadKpis" 
          class="bg-transparent border-none focus:ring-0 font-black text-gray-700 min-w-[200px] cursor-pointer">
          <option value="">📊 Todo el Equipo</option>
          <option v-for="m in listaEmpleados" :key="m.id" :value="m.id">
            {{ m.name }}
          </option>
        </select>
        <div class="w-px h-8 bg-gray-200"></div>
        <input type="date" v-model="filtros.fecha_desde" @change="loadKpis" class="bg-transparent border-none focus:ring-0 text-xs font-bold text-gray-500">
        <input type="date" v-model="filtros.fecha_hasta" @change="loadKpis" class="bg-transparent border-none focus:ring-0 text-xs font-bold text-gray-500">
      </div>
    </div>

    <!-- Métricas Originales Premium -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div v-for="card in metricCards" :key="card.label" 
        class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-indigo-200 transition-all group relative overflow-hidden">
        <div class="absolute -right-4 -top-4 w-20 h-20 bg-gray-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ card.label }}</span>
            <span class="text-lg">{{ card.icon }}</span>
          </div>
          <p class="text-3xl font-black text-gray-900 mb-1">
            {{ card.prefix }}{{ card.value }}{{ card.suffix }}
          </p>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Actualizado</span>
            <span class="text-[10px] text-gray-400 font-medium">{{ card.sub }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <!-- Tabla de Ranking / Equipo -->
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-8 border-b border-gray-50 flex justify-between items-center">
          <h3 class="font-black text-gray-800 text-lg">Ranking de Meseros</h3>
          <div class="flex items-center gap-2 text-xs font-bold text-indigo-600">
            <i class="fa-solid fa-trophy"></i> Top Desempeño
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50/50">
              <tr class="text-[10px] uppercase tracking-widest text-gray-400">
                <th class="px-8 py-4 text-left font-black">Colaborador</th>
                <th class="px-4 py-4 text-right font-black">Ventas</th>
                <th class="px-4 py-4 text-right font-black">Órdenes</th>
                <th class="px-8 py-4 text-right font-black">Eficiencia</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="m in meseros" :key="m.id" class="hover:bg-indigo-50/30 transition-colors cursor-pointer" @click="filtros.mesero_id = m.id; loadKpis()">
                <td class="px-8 py-5">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black">
                      {{ m.nombre.charAt(0) }}
                    </div>
                    <span class="font-black text-gray-700">{{ m.nombre }}</span>
                  </div>
                </td>
                <td class="px-4 py-5 text-right font-black text-gray-900">${{ fm(m.ventas_totales) }}</td>
                <td class="px-4 py-5 text-right font-bold text-gray-500">{{ m.ordenes }}</td>
                <td class="px-8 py-5 text-right">
                  <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase" :class="getSemaforo(m.ventas_totales)">
                    <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {{ getEficienciaLabel(m.ventas_totales) }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tendencia de Ventas -->
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div class="flex justify-between items-center mb-8">
          <h3 class="font-black text-gray-800 text-lg">Tendencia de Ventas</h3>
          <span class="text-xs font-bold text-gray-400">Últimos días</span>
        </div>
        <div class="h-[350px]">
          <canvas id="lineTendencia"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue'
import { apiClient } from '@/utils/apiClient'
import Chart from 'chart.js/auto'

const props = defineProps({
  apiUrl: String,
  getHeaders: Function,
  serverDate: { type: String, default: '' },
})

const getServerToday = () => props.serverDate || new Date().toLocaleDateString('en-CA')

const meseros = ref([])
const listaEmpleados = ref([])
const tendenciaData = ref([])
const resumen = ref({
  total_ventas: 0,
  promedio_ticket: 0,
  items_por_ticket: 0,
  tiempo_servicio_avg: 0
})

const filtros = reactive({
  mesero_id: '',
  fecha_desde: (() => {
    const d = new Date(getServerToday() + 'T00:00:00')
    return new Date(d.getFullYear(), d.getMonth(), 1).toLocaleDateString('en-CA')
  })(),
  fecha_hasta: getServerToday()
})

const fm = (v) => v ? Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'

const metricCards = computed(() => [
  { label: 'Ventas Totales', value: fm(resumen.value.total_ventas), prefix: '$', sub: 'Subtotal sin propina', icon: '💰' },
  { label: 'Ticket Promedio', value: fm(resumen.value.promedio_ticket), prefix: '$', sub: 'Gasto medio por orden', icon: '🎫' },
  { label: 'Eficiencia de Items', value: resumen.value.items_por_ticket, suffix: ' uds', sub: 'Promedio de productos', icon: '📦' },
  { label: 'Tiempo de Servicio', value: resumen.value.tiempo_servicio_avg, suffix: ' min', sub: 'Desde lista a entrega', icon: '⏱️' },
])

let trendChart = null

const loadEmpleados = async () => {
  try {
    const res = await apiClient.get('/empleados?puesto=mesero')
    if (res.success) {
      listaEmpleados.value = res.data
    }
  } catch (e) {
    console.error('Error al cargar empleados:', e)
  }
}

const loadKpis = async () => {
  try {
    const params = { ...filtros }
    if (filtros.mesero_id) params.user_id = filtros.mesero_id

    const res = await apiClient.get('/kpis/meseros', { params })
    if (res.success) {
      // 1. Ordenar de mayor a menor ventas
      const sortedMeseros = [...res.data.meseros].sort((a, b) => (Number(b.ventas_totales) || 0) - (Number(a.ventas_totales) || 0))
      meseros.value = sortedMeseros
      tendenciaData.value = res.data.tendencia

      // 2. Si hay un mesero seleccionado en particular, mostrar sus KPI individuales.
      if (filtros.mesero_id) {
        const sel = sortedMeseros.find(m => m.id === filtros.mesero_id)
        if (sel) {
          resumen.value = {
            total_ventas: sel.ventas_totales,
            promedio_ticket: sel.ticket_promedio,
            items_por_ticket: Number(sel.items_por_ticket || 0).toFixed(1),
            tiempo_servicio_avg: Number(sel.tiempo_servicio_avg || 0).toFixed(1)
          }
        } else {
          resumen.value = {
            total_ventas: 0,
            promedio_ticket: 0,
            items_por_ticket: '0.0',
            tiempo_servicio_avg: '0.0'
          }
        }
      } else {
        // Mostrar resumen general del equipo
        resumen.value = {
          total_ventas: res.data.resumen.total_ventas,
          promedio_ticket: res.data.resumen.promedio_ticket,
          items_por_ticket: (sortedMeseros.reduce((s, m) => s + (Number(m.items_por_ticket) || 0), 0) / (sortedMeseros.length || 1)).toFixed(1),
          tiempo_servicio_avg: (sortedMeseros.reduce((s, m) => s + (Number(m.tiempo_servicio_avg) || 0), 0) / (sortedMeseros.length || 1)).toFixed(1)
        }
      }
      initTrendChart()
    }
  } catch (e) {
    console.error(e)
  }
}

const getSemaforo = (ventas) => {
  if (ventas > 5000) return 'text-emerald-600 bg-emerald-50'
  if (ventas > 2000) return 'text-amber-600 bg-amber-50'
  return 'text-rose-600 bg-rose-50'
}

const getEficienciaLabel = (ventas) => {
  if (ventas > 5000) return 'Excelente'
  if (ventas > 2000) return 'Notable'
  return 'En mejora'
}

const initTrendChart = () => {
  const ctx = document.getElementById('lineTendencia')
  if (!ctx) return
  if (trendChart) trendChart.destroy()

  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: tendenciaData.value.map(t => t.fecha),
      datasets: [{
        label: 'Ventas Diarias',
        data: tendenciaData.value.map(t => t.total),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#6366f1'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { display: false } },
        x: { grid: { display: false } }
      }
    }
  })
}

onMounted(() => {
  loadEmpleados()
  loadKpis()
})
</script>
