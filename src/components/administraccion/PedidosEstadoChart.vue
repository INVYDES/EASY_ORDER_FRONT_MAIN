<template>
  <div class="bg-white rounded-xl shadow-sm p-5">
    <h3 class="font-semibold text-gray-800 mb-4">Pedidos por estado</h3>
    <div class="flex items-center justify-center gap-6 flex-wrap">
      <div class="relative h-44 w-44 shrink-0">
        <canvas ref="chartRef"></canvas>
        <!-- Total en centro -->
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p class="text-2xl font-black text-gray-800">{{ totalOrdenes }}</p>
          <p class="text-[10px] text-gray-400">órdenes</p>
        </div>
      </div>
      <div class="space-y-2.5 text-sm min-w-32">
        <div v-for="(item, i) in items" :key="i" class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full shrink-0" :style="{ background: colors[i] }"></span>
          <span class="text-gray-600 flex-1">{{ item.label }}</span>
          <span class="font-bold text-gray-900 ml-2">{{ item.value }}</span>
        </div>
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
        hoverOffset: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      cutout: '72%',
    },
  })
}

watch(() => props.ordenesPorEstado, buildChart, { deep: true })
onMounted(buildChart)
</script>