<template>
  <div class="space-y-6">
    <!-- Header con Selector de Mesero -->
    <div class="bg-white rounded-xl p-6 shadow-xs border border-[#DDE3DE] flex flex-col md:flex-row justify-between items-center gap-6">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-xl shrink-0">
          <i class="fa-solid fa-user-tie"></i>
        </div>
        <div>
          <h2 class="text-base font-semibold text-[#202723]">Perfil de Rendimiento {{ filtros.mesero_id ? 'Particular' : 'General' }}</h2>
          <p class="text-xs text-[#68736C] mt-0.5">Selecciona un mesero para ver su análisis detallado.</p>
        </div>
      </div>

      <div class="flex items-center gap-3 bg-[#F6F7F5] p-1.5 rounded-lg border border-[#DDE3DE]">
        <select v-model="filtros.mesero_id" @change="loadKpis" 
          class="bg-transparent border-none focus:ring-0 text-xs font-semibold text-[#202723] min-w-[180px] cursor-pointer">
          <option value="">Todo el Equipo</option>
          <option v-for="m in listaEmpleados" :key="m.id" :value="m.id">
            {{ m.name }}
          </option>
        </select>
        <div class="w-px h-6 bg-[#DDE3DE]"></div>
        <input type="date" v-model="filtros.fecha_desde" @change="loadKpis" class="bg-transparent border-none focus:ring-0 text-xs font-medium text-[#202723] cursor-pointer">
        <input type="date" v-model="filtros.fecha_hasta" @change="loadKpis" class="bg-transparent border-none focus:ring-0 text-xs font-medium text-[#202723] cursor-pointer">
      </div>
    </div>

    <!-- Métricas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div v-for="card in metricCards" :key="card.label" 
        class="bg-white p-5 rounded-xl shadow-xs border border-[#DDE3DE]">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-semibold text-[#68736C] uppercase tracking-wider">{{ card.label }}</span>
          <div class="w-7 h-7 rounded-lg bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-xs">
            <i :class="card.iconClass || 'fa-solid fa-chart-simple'"></i>
          </div>
        </div>
        <p class="text-2xl font-bold text-[#202723] font-mono tabular-nums mb-1">
          {{ card.prefix }}{{ card.value }}{{ card.suffix }}
        </p>
        <p class="text-xs text-[#68736C]">{{ card.sub }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <!-- Tabla de Ranking / Equipo -->
      <div class="bg-white rounded-xl shadow-xs border border-[#DDE3DE] overflow-hidden">
        <div class="p-5 border-b border-[#DDE3DE] flex justify-between items-center">
          <h3 class="font-semibold text-[#202723] text-base">Ranking de Meseros</h3>
          <span class="text-xs font-semibold text-[#245C4F] flex items-center gap-1.5">
            <i class="fa-solid fa-trophy"></i> Top Desempeño
          </span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-[#F0F2EF]">
              <tr class="text-[11px] uppercase tracking-wider font-semibold text-[#68736C] border-b border-[#DDE3DE]">
                <th class="px-4 py-2.5">Colaborador</th>
                <th class="px-3 py-2.5 text-right">Ventas</th>
                <th class="px-3 py-2.5 text-right">Propinas</th>
                <th class="px-3 py-2.5 text-right">Órdenes</th>
                <th class="px-4 py-2.5 text-right">Eficiencia</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#DDE3DE]">
              <tr v-for="m in meseros" :key="m.id" class="hover:bg-[#F6F7F5] transition-colors cursor-pointer text-xs" @click="filtros.mesero_id = m.id; loadKpis()">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2.5">
                    <div class="w-7 h-7 rounded-lg bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center font-bold text-xs shrink-0">
                      {{ m.nombre.charAt(0) }}
                    </div>
                    <span class="font-semibold text-[#202723] truncate max-w-[110px]" :title="m.nombre">{{ m.nombre }}</span>
                  </div>
                </td>
                <td class="px-3 py-3 text-right font-mono font-bold text-[#202723]">${{ fm(m.ventas_totales) }}</td>
                <td class="px-3 py-3 text-right font-mono font-medium text-[#68736C]">${{ fm(m.propinas) }}</td>
                <td class="px-3 py-3 text-right font-mono font-medium text-[#68736C]">{{ m.ordenes }}</td>
                <td class="px-4 py-3 text-right">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase" :class="getSemaforo(m.ventas_totales)">
                    {{ getEficienciaLabel(m.ventas_totales) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tendencia de Ventas -->
      <div class="bg-white rounded-xl shadow-xs border border-[#DDE3DE] p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-semibold text-[#202723] text-base">Tendencia de Ventas</h3>
          <span class="text-xs text-[#68736C]">Últimos días</span>
        </div>
        <div class="h-[320px]">
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
  { label: 'Ventas Totales', value: fm(resumen.value.total_ventas), prefix: '$', sub: 'Subtotal sin propina', iconClass: 'fa-solid fa-dollar-sign' },
  { label: 'Ticket Promedio', value: fm(resumen.value.promedio_ticket), prefix: '$', sub: 'Gasto medio por orden', iconClass: 'fa-solid fa-receipt' },
  { label: 'Eficiencia de Items', value: resumen.value.items_por_ticket, suffix: ' uds', sub: 'Promedio de productos', iconClass: 'fa-solid fa-box' },
  { label: 'Tiempo de Servicio', value: resumen.value.tiempo_servicio_avg, suffix: ' min', sub: 'Desde lista a entrega', iconClass: 'fa-solid fa-clock' },
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
  if (ventas > 5000) return 'text-[#26734D] bg-[#EBF5EE] border border-[#26734D]/20'
  if (ventas > 2000) return 'text-[#A96517] bg-[#FEF7EC] border border-[#A96517]/20'
  return 'text-[#B93838] bg-[#FBEBEB] border border-[#B93838]/20'
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
        borderColor: '#245C4F',
        backgroundColor: 'rgba(36, 92, 79, 0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#245C4F'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#F0F2EF' } },
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
