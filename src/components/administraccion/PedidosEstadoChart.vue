<template>
  <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-bold text-gray-800">Pedidos por estado</h3>
      <div class="flex gap-3">
        <div v-for="(item, i) in items" :key="item.label" class="flex items-center gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: colors[i] }"></div>
          <span class="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <div class="relative h-64 flex items-center justify-center">
      <canvas ref="chartRef"></canvas>
      <!-- Total central -->
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span class="text-3xl font-black text-gray-800">{{ totalOrdenes }}</span>
        <span class="text-xs text-gray-400 font-medium uppercase tracking-widest">órdenes</span>
      </div>
    </div>

    <!-- Detalle por estado -->
    <div class="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
      <div v-for="(item, i) in items" :key="item.label" class="rounded-xl p-2.5 transition-transform hover:scale-105" :style="{ backgroundColor: colors[i] + '15' }">
        <p class="text-[10px] font-black uppercase tracking-wider mb-1" :style="{ color: colors[i] }">{{ item.label }}</p>
        <p class="text-xl font-black text-gray-800 leading-none">{{ item.value }}</p>
        <p class="text-[10px] font-bold text-gray-400 mt-1">{{ totalOrdenes ? Math.round((Number(item.value) || 0) / totalOrdenes * 100) : 0 }}%</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'

const props = defineProps({
  ordenesPorEstado: { type: Array, default: () => [] },
})

const chartRef = ref(null)
let   chartInst = null

const colors = ['#6366f1', '#f59e0b', '#10b981', '#6b7280']

const g = (s) => props.ordenesPorEstado.find(x => x.estado === s)?.total || 0

const items = computed(() => [
  { label: 'Abierta',       value: g('ABIERTA')         },
  { label: 'En prep.',      value: g('EN_PREPARACION')  },
  { label: 'Lista',         value: g('LISTA')           },
  { label: 'Cerrada',       value: g('CERRADA')         },
])

const totalOrdenes = computed(() => items.value.reduce((s, i) => s + Number(i.value), 0))

const loadChartJS = () => new Promise(resolve => {
  if (window.Chart) { resolve(); return }
  const s = document.createElement('script')
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
  s.onload = resolve; document.head.appendChild(s)
})

const buildChart = async () => {
  await loadChartJS()
  if (!chartRef.value) return
  chartInst?.destroy()
  const vals  = items.value.map(i => i.value || 0)
  const total = vals.reduce((a, b) => a + b, 0)
  
  chartInst = new window.Chart(chartRef.value, {
    type: 'doughnut',
    data: {
      labels: items.value.map(i => i.label),
      datasets: [{
        data: total > 0 ? vals : [1, 1, 1, 1],
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 12,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.85)',
          cornerRadius: 12,
          padding: 12,
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 13 },
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${ctx.raw} órdenes`
          }
        }
      },
      cutout: '75%',
    },
  })
}

watch(() => props.ordenesPorEstado, buildChart, { deep: true })
onMounted(buildChart)
</script>