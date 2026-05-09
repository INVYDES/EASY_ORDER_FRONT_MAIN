<template>
  <div class="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-100/50 border border-slate-100 relative overflow-hidden">
    
    <!-- Decoración de fondo -->
    <div class="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full opacity-50 blur-3xl"></div>
    
    <div class="relative z-10 flex flex-col md:flex-row items-center gap-10">
      
      <!-- Lado Izquierdo: Texto e Información -->
      <div class="flex-1 space-y-6 text-center md:text-left">
        <div>
          <h3 class="text-2xl font-black text-slate-800 leading-tight">FUERZA DE TRABAJO</h3>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">Distribución Operativa</p>
        </div>
        
        <div class="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Estado del Equipo</p>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center">
              <span class="block text-3xl font-black text-indigo-600 leading-none">{{ empleados.length }}</span>
              <span class="text-[9px] font-bold text-slate-400 uppercase">Total</span>
            </div>
            <div class="text-center border-l border-slate-200">
              <span class="block text-3xl font-black text-emerald-500 leading-none">{{ activosCount }}</span>
              <span class="text-[9px] font-bold text-slate-400 uppercase">Activos</span>
            </div>
          </div>
        </div>

        <p class="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto md:mx-0">
          Análisis balanceado de los 5 pilares operativos para asegurar la eficiencia del servicio.
        </p>
      </div>

      <!-- Lado Derecho: El Pentágono -->
      <div class="relative w-full max-w-[400px] aspect-square flex items-center justify-center">
        <!-- Overlay de carga o error -->
        <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
          <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
        
        <canvas ref="canvasEl" class="relative z-10"></canvas>
      </div>

    </div>

    <!-- Leyenda Inferior (Bucket) -->
    <div class="mt-10 pt-8 border-t border-slate-50 grid grid-cols-2 sm:grid-cols-5 gap-4">
      <div v-for="cat in PENTAGONO_LABELS" :key="cat" class="flex flex-col items-center group">
        <div class="w-2 h-2 rounded-full bg-indigo-500 mb-2 group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
        <span class="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{{ cat }}</span>
        <span class="text-lg font-black text-slate-300 mt-1">{{ rolesCount[cat] || 0 }}</span>
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

// Los 5 ejes solicitados en el pentágono
const PENTAGONO_LABELS = ['COCINA', 'BARRA', 'POSTRES', 'CAJA', 'MESEROS']

const activosCount = computed(() => 
  props.empleados.filter(e => e.es_activo !== false).length
)

// Mapeo inteligente de roles a los 5 ejes del pentágono
const rolesCount = computed(() => {
  const counts = { 'COCINA': 0, 'BARRA': 0, 'POSTRES': 0, 'CAJA': 0, 'MESEROS': 0 }
  
  props.empleados.forEach(e => {
    const rol = getRolNombre(e).toUpperCase()
    
    if (rol.includes('COCINA')) counts['COCINA']++
    else if (rol.includes('BARRA')) counts['BARRA']++
    else if (rol.includes('POSTRE')) counts['POSTRES']++
    else if (rol.includes('CAJA')) counts['CAJA']++
    else if (rol.includes('MESERO')) counts['MESEROS']++
    // Los administradores se cuentan en CAJA por ser parte operativa admin
    else if (rol.includes('ADMIN')) counts['CAJA']++
  })
  
  return counts
})

const getRolNombre = (emp) => {
  const ROLES_MAP = { 1:'Admin', 2:'Admin', 3:'Mesero', 4:'Cocina', 5:'Caja', 6:'Barra' }
  if (emp.roles?.length) {
    const r = emp.roles[0]
    if (typeof r === 'string') return r
    return r?.nombre || r?.name || (typeof r === 'number' ? ROLES_MAP[r] : 'Otro')
  }
  return ROLES_MAP[emp.rol_id] || emp.rol || 'Otro'
}

const initChart = async () => {
  if (!canvasEl.value) return
  if (chartInstance) chartInstance.destroy()

  const dataValues = PENTAGONO_LABELS.map(label => rolesCount.value[label] || 0)
  
  // Encontrar el valor máximo para escalar la gráfica decentemente
  const maxVal = Math.max(...dataValues, 5)

  chartInstance = new Chart(canvasEl.value, {
    type: 'radar',
    data: {
      labels: PENTAGONO_LABELS,
      datasets: [{
        label: ' Fuerza de Trabajo',
        data: dataValues,
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.15)', // Light blue/indigo fill
        borderColor: '#ef4444', // Red border as in the image
        borderWidth: 3,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#ef4444',
        pointRadius: 4,
        tension: 0.1 // Un poco de suavizado
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
            color: 'rgba(0, 0, 0, 0.05)' 
          },
          grid: { 
            color: 'rgba(0, 0, 0, 0.05)',
            circular: false // Forzado a forma de pentágono
          },
          pointLabels: {
            color: '#64748b',
            font: { 
              size: 11, 
              weight: '900',
              family: 'Inter'
            },
            padding: 15
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

watch(() => props.empleados, () => {
  initChart()
}, { deep: true })
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>