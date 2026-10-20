<template>
  <div class="space-y-6">
    <!-- Header con Selector de Cajero -->
    <div class="bg-white rounded-xl p-6 shadow-xs border border-[#DDE3DE] flex flex-col md:flex-row justify-between items-center gap-6">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-xl shrink-0">
          <i class="fa-solid fa-cash-register"></i>
        </div>
        <div>
          <h2 class="text-base font-semibold text-[#202723]">Rendimiento de Caja {{ filtros.cajero_id ? 'Particular' : 'General' }}</h2>
          <p class="text-xs text-[#68736C] mt-0.5">Seguimiento de tiempos de cobro y precisión en arqueos.</p>
        </div>
      </div>

      <div class="flex items-center gap-3 bg-[#F6F7F5] p-1.5 rounded-lg border border-[#DDE3DE]">
        <select v-model="filtros.cajero_id" @change="loadKpis" 
          class="bg-transparent border-none focus:ring-0 text-xs font-semibold text-[#202723] min-w-[180px] cursor-pointer">
          <option value="">Todos los Cajeros</option>
          <option v-for="c in listaCajeros" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>
        <div class="w-px h-6 bg-[#DDE3DE]"></div>
        <input type="date" v-model="filtros.fecha_desde" @change="loadKpis" class="bg-transparent border-none focus:ring-0 text-xs font-medium text-[#202723] cursor-pointer">
        <input type="date" v-model="filtros.fecha_hasta" @change="loadKpis" class="bg-transparent border-none focus:ring-0 text-xs font-medium text-[#202723] cursor-pointer">
      </div>
    </div>

    <!-- Cards de Métricas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white p-5 rounded-xl shadow-xs border border-[#DDE3DE]">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-semibold text-[#68736C] uppercase tracking-wider">Diferencia Acumulada</span>
          <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
            :class="kpis.diferencia_acumulada < 0 ? 'bg-[#FBEBEB] text-[#B93838]' : 'bg-[#EBF5EE] text-[#26734D]'">
            <i class="fa-solid fa-scale-balanced"></i>
          </div>
        </div>
        <p class="text-2xl font-bold font-mono tabular-nums mb-1" :class="kpis.diferencia_acumulada < 0 ? 'text-[#B93838]' : 'text-[#26734D]'">
          {{ kpis.diferencia_acumulada < 0 ? '-$' + fm(Math.abs(kpis.diferencia_acumulada)) : '$' + fm(kpis.diferencia_acumulada) }}
        </p>
        <p class="text-xs text-[#68736C]">Balance total de cierres de caja</p>
      </div>

      <div class="bg-white p-5 rounded-xl shadow-xs border border-[#DDE3DE]">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-semibold text-[#68736C] uppercase tracking-wider">Tiempo de Cobro</span>
          <div class="w-7 h-7 rounded-lg bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-xs">
            <i class="fa-solid fa-clock"></i>
          </div>
        </div>
        <p class="text-2xl font-bold font-mono tabular-nums text-[#202723] mb-1">{{ avgPaymentTime }} min</p>
        <p class="text-xs text-[#68736C]">Promedio desde solicitud a cierre</p>
      </div>

      <div class="bg-white p-5 rounded-xl shadow-xs border border-[#DDE3DE]">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-semibold text-[#68736C] uppercase tracking-wider">Merma real en caja</span>
          <div class="w-7 h-7 rounded-lg bg-[#FBEBEB] text-[#B93838] flex items-center justify-center text-xs">
            <i class="fa-solid fa-ban"></i>
          </div>
        </div>
        <p class="text-2xl font-bold font-mono tabular-nums text-[#B93838] mb-1">${{ fm(mermasCaja) }}</p>
        <p class="text-xs text-[#68736C] flex flex-wrap gap-x-2">
          <span v-if="costoProductosCaja > 0">Costo prod: <strong class="text-[#202723]">${{ fm(costoProductosCaja) }}</strong></span>
          <span>Cancelado mesero: <strong class="text-[#202723]">${{ fm(cancelacionesMesero) }}</strong></span>
        </p>
      </div>
    </div>

    <!-- Desglose por Cajero -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div class="xl:col-span-1 bg-white rounded-xl shadow-xs border border-[#DDE3DE] p-6">
        <h3 class="font-semibold text-[#202723] text-base mb-4">Eficiencia Individual</h3>
        <div class="space-y-2.5">
          <div v-for="c in kpis.tiempos_cobro" :key="c.cajero" class="p-3 bg-[#F6F7F5] rounded-lg border border-[#DDE3DE] flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center font-bold text-xs shrink-0">
                {{ c.cajero.charAt(0) }}
              </div>
              <div>
                <p class="font-semibold text-[#202723] text-xs">{{ c.cajero }}</p>
                <p class="text-[10px] text-[#68736C]">{{ c.total_cobros }} tickets procesados</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold font-mono tabular-nums text-[#202723]">{{ Math.round(c.tiempo_avg_min * 10) / 10 }} min</p>
            </div>
          </div>
        </div>
      </div>

      <div class="xl:col-span-2 bg-white rounded-xl shadow-xs border border-[#DDE3DE] p-6">
        <h3 class="font-semibold text-[#202723] text-base mb-6">Volumen de Operación</h3>
        <div class="h-[320px]">
          <canvas id="barCaja"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, nextTick } from 'vue'
import { apiClient } from '@/utils/apiClient'
import Chart from 'chart.js/auto'

const props = defineProps({
  apiUrl: String,
  getHeaders: Function,
  serverDate: { type: String, default: '' },
})

const getServerToday = () => props.serverDate || new Date().toLocaleDateString('en-CA')

const kpis = ref({
  tiempos_cobro: [],
  diferencia_acumulada: 0
})

const listaCajeros = ref([])
const mermasCaja = ref(0)
const costoProductosCaja = ref(0)
const cancelacionesMesero = ref(0)

const filtros = reactive({
  cajero_id: '',
  fecha_desde: (() => {
    const d = new Date(getServerToday() + 'T00:00:00')
    return new Date(d.getFullYear(), d.getMonth(), 1).toLocaleDateString('en-CA')
  })(),
  fecha_hasta: getServerToday()
})

const avgPaymentTime = computed(() => {
  if (!kpis.value.tiempos_cobro.length) return 0
  const sum = kpis.value.tiempos_cobro.reduce((s, c) => s + c.tiempo_avg_min, 0)
  return Math.round((sum / kpis.value.tiempos_cobro.length) * 10) / 10
})

const fm = (v) => v ? Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'

let barChart = null

const loadCajeros = async () => {
  try {
    const res = await apiClient.get('/empleados?puesto=caja')
    if (res.success) listaCajeros.value = res.data
  } catch (e) { console.error(e) }
}

const loadKpis = async () => {
  try {
    const params = { ...filtros }
    if (filtros.cajero_id) params.user_id = filtros.cajero_id

    const res = await apiClient.get('/kpis/caja', { params })
    if (res.success) {
      kpis.value = res.data
      initBarChart()
    }

    // Merme real vs cancelaciones: misma fuente que KPIs Productos.
    const devueltos = await apiClient.get('/reportes/platillos-devueltos', {
      params: { fecha_inicio: filtros.fecha_desde, fecha_fin: filtros.fecha_hasta }
    })
    if (devueltos?.success) {
      mermasCaja.value = devueltos.costo_real_mermas ?? devueltos.total_mermas ?? 0
      costoProductosCaja.value = devueltos.total_mermas || 0
      cancelacionesMesero.value = devueltos.total_cancelaciones_sin_merma || 0
    }
  } catch (e) {
    console.error(e)
  }
}

const initBarChart = () => {
  const ctx = document.getElementById('barCaja')
  if (!ctx) return
  if (barChart) barChart.destroy()

  const labels = kpis.value.tiempos_cobro.map(c => c.cajero)
  const data = kpis.value.tiempos_cobro.map(c => c.total_cobros)

  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Volumen de Cobros',
        data,
        backgroundColor: '#245C4F',
        borderRadius: 4
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
  loadCajeros()
  loadKpis()
})
</script>
