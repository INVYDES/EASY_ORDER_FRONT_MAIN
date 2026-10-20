<template>
  <div class="bg-white rounded-xl p-6 shadow-xs border border-[#DDE3DE]">
    
    <div class="flex flex-col md:flex-row items-center gap-8">
      
      <!-- Lado Izquierdo: Texto e Información -->
      <div class="flex-1 space-y-5 text-center md:text-left">
        <div>
          <h3 class="text-base font-semibold text-[#202723]">Distribución de Fuerza Operativa</h3>
          <p class="text-xs text-[#68736C] mt-0.5">Análisis de personal por roles para balance operativo.</p>
        </div>
        
        <div class="bg-[#F6F7F5] rounded-lg p-4 border border-[#DDE3DE] max-w-sm mx-auto md:mx-0">
          <p class="text-[10px] font-semibold text-[#68736C] uppercase tracking-wider mb-3">Estado del Equipo</p>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center">
              <span class="block text-2xl font-bold font-mono tabular-nums text-[#202723] leading-none">{{ empleadosFiltrados.length }}</span>
              <span class="text-[10px] font-semibold text-[#68736C] uppercase tracking-wider mt-1 block">Total</span>
            </div>
            <div class="text-center border-l border-[#DDE3DE]">
              <span class="block text-2xl font-bold font-mono tabular-nums text-[#26734D] leading-none">{{ activosCount }}</span>
              <span class="text-[10px] font-semibold text-[#68736C] uppercase tracking-wider mt-1 block">Activos</span>
            </div>
          </div>
        </div>

        <p class="text-xs text-[#68736C] leading-relaxed max-w-sm mx-auto md:mx-0">
          Monitorea el balance de los pilares clave del servicio en cocina, barra, caja y salón.
        </p>
      </div>

      <!-- Lado Derecho: Radar Chart -->
      <div class="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
        <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
          <div class="w-6 h-6 border-2 border-[#E8F1ED] border-t-[#245C4F] rounded-full animate-spin"></div>
        </div>
        
        <canvas ref="canvasEl" class="relative z-10"></canvas>
      </div>

    </div>

    <!-- Leyenda Inferior -->
    <div class="mt-6 pt-5 border-t border-[#DDE3DE] grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div v-for="cat in PENTAGONO_LABELS" :key="cat" class="flex flex-col items-center">
        <div class="w-2 h-2 rounded-full bg-[#245C4F] mb-1.5"></div>
        <span class="text-[11px] font-semibold text-[#68736C] uppercase tracking-wider">{{ cat }}</span>
        <span class="text-base font-bold font-mono tabular-nums text-[#202723] mt-0.5">{{ rolesCount[cat] || 0 }}</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  empleados: { type: Array, default: () => [] },
})

const canvasEl = ref(null)
const loading = ref(false)
let chartInstance = null

// Los 4 ejes solicitados en el indicador
const PENTAGONO_LABELS = ['COCINA', 'CAJA', 'MESEROS', 'ADMINISTRADOR']

const isActivo = (e) => e.activo === true || e.activo === 1

const getRolNombre = (emp) => {
  const ROLES_MAP = { 1:'Admin', 2:'Admin', 3:'Mesero', 4:'Cocina', 5:'Caja', 6:'Barra' }
  if (emp.roles?.length) {
    const r = emp.roles[0]
    if (typeof r === 'string') return r
    return r?.nombre || r?.name || (typeof r === 'number' ? ROLES_MAP[r] : 'Otro')
  }
  return ROLES_MAP[emp.rol_id] || emp.rol || 'Otro'
}

const empleadosFiltrados = computed(() => {
  return props.empleados.filter(e => {
    const rol = getRolNombre(e).toUpperCase()
    const esPropietario = rol.includes('PROPIETARIO') || rol.includes('DUEÑO') || rol.includes('OWNER')
    const esMenuKiosk = rol.includes('MENU') || rol.includes('KIOSK') || rol.includes('KIOSKO')
    return !(esPropietario || esMenuKiosk)
  })
})

const activosCount = computed(() =>
  empleadosFiltrados.value.filter(e => isActivo(e)).length
)

// Mapeo de roles a los 4 ejes
const rolesCount = computed(() => {
  const counts = { 'COCINA': 0, 'CAJA': 0, 'MESEROS': 0, 'ADMINISTRADOR': 0 }
  
  empleadosFiltrados.value.forEach(e => {
    const rol = getRolNombre(e).toUpperCase()
    
    if (rol.includes('COCINA')) counts['COCINA']++
    else if (rol.includes('CAJA')) counts['CAJA']++
    else if (rol.includes('MESERO')) counts['MESEROS']++
    else if (rol.includes('ADMIN')) counts['ADMINISTRADOR']++
  })
  
  return counts
})

const initChart = async () => {
  if (!canvasEl.value) return
  if (chartInstance) chartInstance.destroy()

  const dataValues = PENTAGONO_LABELS.map(label => rolesCount.value[label] || 0)
  const maxVal = Math.max(...dataValues, 5)

  chartInstance = new Chart(canvasEl.value, {
    type: 'radar',
    data: {
      labels: PENTAGONO_LABELS,
      datasets: [{
        label: 'Fuerza de Trabajo',
        data: dataValues,
        fill: true,
        backgroundColor: 'rgba(36, 92, 79, 0.15)',
        borderColor: '#245C4F',
        borderWidth: 2,
        pointBackgroundColor: '#245C4F',
        pointBorderColor: '#FFFFFF',
        pointHoverBackgroundColor: '#19483D',
        pointHoverBorderColor: '#245C4F',
        pointRadius: 4,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        r: {
          angleLines: { 
            display: true,
            color: '#DDE3DE' 
          },
          grid: { 
            color: '#DDE3DE',
            circular: false
          },
          pointLabels: {
            color: '#68736C',
            font: { 
              size: 11, 
              weight: '600'
            },
            padding: 12
          },
          ticks: {
            display: false,
            stepSize: Math.ceil(maxVal / 4)
          },
          suggestedMin: 0,
          suggestedMax: maxVal + 1
        }
      }
    }
  })
}

onMounted(async () => {
  loading.value = true
  await nextTick()
  initChart()
  loading.value = false
})

watch(() => empleadosFiltrados.value, () => {
  initChart()
}, { deep: true })
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>