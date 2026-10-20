<template>
  <div class="bg-white rounded-xl shadow-xs border border-[#DDE3DE] p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-[#202723] text-sm">Métodos de pago</h3>
      <span class="text-xs text-[#68736C]">Órdenes cerradas hoy</span>
    </div>

    <div v-if="sinDatos" class="flex flex-col items-center justify-center py-8 text-[#68736C]">
      <i class="fa-solid fa-credit-card text-xl mb-1 text-[#DDE3DE]"></i>
      <span class="text-xs">Sin ventas registradas</span>
    </div>

    <div v-else class="flex items-center gap-6">
      <!-- Donut -->
      <div class="relative w-36 h-36 shrink-0">
        <canvas ref="chartRef"></canvas>
        <!-- Total en centro -->
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p class="text-base font-bold font-mono tabular-nums text-[#202723]">${{ fm(total) }}</p>
          <p class="text-[10px] text-[#68736C] uppercase font-semibold">total</p>
        </div>
      </div>
      <!-- Leyenda detallada -->
      <div class="flex-1 space-y-2.5">
        <div v-for="item in breakdown" :key="item.label" class="space-y-1">
          <div class="flex justify-between text-xs">
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: item.color }"></span>
              <span class="font-semibold text-[#202723]">{{ item.label }}</span>
            </div>
            <div class="flex gap-2 text-right">
              <span class="font-bold font-mono tabular-nums text-[#202723]">${{ fm(item.monto) }}</span>
              <span class="text-[#68736C] w-10 text-right font-mono tabular-nums">{{ item.pct }}%</span>
            </div>
          </div>
          <div class="w-full bg-[#F0F2EF] rounded-full h-1.5">
            <div class="h-1.5 rounded-full transition-all" :style="{ width: item.pct + '%', background: item.color }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'

const props = defineProps({
  ordenesCerradas: { type: Array, default: () => [] },
})

const chartRef = ref(null)
let chartInst  = null

const fm = (v) => v ? Number(v).toLocaleString('es-MX', { minimumFractionDigits:2, maximumFractionDigits:2 }) : '0.00'

const COLORS = {
  efectivo:      '#26734D',
  tarjeta:       '#245C4F',
  transferencia: '#A96517',
  otro:          '#68736C',
}

const agrupar = (metodo) => {
  if (!metodo) return 'efectivo'
  const m = metodo.toLowerCase()
  if (m.includes('tarjet') || m.includes('card')) return 'tarjeta'
  if (m.includes('transfer')) return 'transferencia'
  if (m.includes('efectivo') || m.includes('cash')) return 'efectivo'
  return 'otro'
}

const getVentaNeta = (o) => Math.max(0, (Number(o.total) || 0) - (Number(o.propina) || 0))

const total = computed(() =>
  props.ordenesCerradas.reduce((s, o) => s + getVentaNeta(o), 0)
)

const sinDatos = computed(() => total.value === 0)

const breakdown = computed(() => {
  const map = { efectivo: 0, tarjeta: 0, transferencia: 0, otro: 0 }
  props.ordenesCerradas.forEach(o => {
    const g = agrupar(o.metodo_pago)
    map[g] += getVentaNeta(o)
  })
  const t = total.value || 1
  return [
    { label:'Efectivo',      monto: map.efectivo,      color: COLORS.efectivo,      pct: Math.round((map.efectivo/t)*100) },
    { label:'Tarjeta',       monto: map.tarjeta,       color: COLORS.tarjeta,       pct: Math.round((map.tarjeta/t)*100) },
    { label:'Transferencia', monto: map.transferencia, color: COLORS.transferencia, pct: Math.round((map.transferencia/t)*100) },
  ].filter(i => i.monto > 0)
})

const loadChartJS = () => new Promise(resolve => {
  if (window.Chart) { resolve(); return }
  const s = document.createElement('script')
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
  s.onload = resolve; document.head.appendChild(s)
})

const buildChart = async () => {
  if (sinDatos.value) return
  await loadChartJS()
  if (!chartRef.value) return
  chartInst?.destroy()
  chartInst = new window.Chart(chartRef.value, {
    type: 'doughnut',
    data: {
      labels: breakdown.value.map(b => b.label),
      datasets: [{
        data: breakdown.value.map(b => b.monto),
        backgroundColor: breakdown.value.map(b => b.color),
        borderWidth: 0,
        hoverOffset: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      cutout: '70%',
    },
  })
}

watch(() => props.ordenesCerradas, buildChart, { deep: true })
onMounted(buildChart)
</script>