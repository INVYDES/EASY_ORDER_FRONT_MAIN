<template>
  <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-bold text-gray-800">Canal de Ventas</h3>
      <div class="flex gap-3">
        <div v-for="canal in legend" :key="canal.label" class="flex items-center gap-1.5">
          <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: canal.color }"></div>
          <span class="text-xs text-gray-500 font-medium">{{ canal.label }}</span>
        </div>
      </div>
    </div>

    <div class="relative h-64 flex items-center justify-center">
      <canvas ref="canvasEl"></canvas>
      <!-- Total central -->
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span class="text-3xl font-black text-gray-800">{{ totalPedidos }}</span>
        <span class="text-xs text-gray-400 font-medium">pedidos</span>
      </div>
    </div>

    <!-- Detalle por canal -->
    <div class="mt-4 grid grid-cols-3 gap-3 text-center">
      <div v-for="canal in legend" :key="canal.label" class="rounded-xl p-2" :style="{ backgroundColor: canal.color + '15' }">
        <p class="text-xs font-bold" :style="{ color: canal.color }">{{ canal.label }}</p>
        <p class="text-lg font-black text-gray-800">{{ data[canal.label] || 0 }}</p>
        <p class="text-[10px] text-gray-400">{{ totalPedidos ? Math.round((data[canal.label] || 0) / totalPedidos * 100) : 0 }}%</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({ Local: 0, Pickup: 0, Delivery: 0 })
  }
})

const canvasEl = ref(null)

const legend = [
  { label: 'Local',    color: '#4f46e5' },
  { label: 'Pickup',   color: '#f59e0b' },
  { label: 'Delivery', color: '#10b981' },
]

const totalPedidos = computed(() =>
  (props.data.Local || 0) + (props.data.Pickup || 0) + (props.data.Delivery || 0)
)

let chartInstance = null

const initChart = () => {
  if (!canvasEl.value) return
  if (chartInstance) chartInstance.destroy()

  chartInstance = new Chart(canvasEl.value, {
    type: 'doughnut',
    data: {
      labels: legend.map(l => l.label),
      datasets: [{
        data: [props.data.Local || 0, props.data.Pickup || 0, props.data.Delivery || 0],
        backgroundColor: legend.map(l => l.color),
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            label: (context) => ` ${context.label}: ${context.raw} pedidos`
          }
        }
      },
      cutout: '70%'
    }
  })
}

onMounted(initChart)
watch(() => props.data, () => initChart(), { deep: true })
</script>
