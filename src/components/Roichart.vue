<template>
  <div class="space-y-6 pb-10">
    <!-- Controles de período -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button v-for="p in periodos" :key="p.value" @click="setPeriodo(p.value)"
            :class="['px-5 py-2 text-xs font-bold rounded-lg transition-all',
              periodo === p.value ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:bg-gray-200']">
            {{ p.label }}
          </button>
        </div>
        
        <div class="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
          <input v-model="fechaInicio" type="date" class="bg-transparent text-xs font-medium focus:outline-none" />
          <span class="text-gray-300">→</span>
          <input v-model="fechaFin" type="date" class="bg-transparent text-xs font-medium focus:outline-none" />
        </div>
      </div>
      
      <button @click="fetchAll" :disabled="loading"
        class="px-6 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2">
        <span v-if="loading" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
        {{ loading ? 'Cargando...' : 'Aplicar Filtros' }}
      </button>
    </div>

    <!-- Spinner -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100">
      <div class="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p class="text-gray-400 text-sm">Procesando datos financieros...</p>
    </div>

    <template v-else>
      <!-- Tarjeta de Utilidad + Gráfica de Gastos -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div :class="['rounded-3xl p-8 text-white shadow-xl lg:col-span-1 transition-colors', 
          gastoResumen.utilidad_bruta >= 0 ? 'bg-indigo-600 shadow-indigo-100' : 'bg-rose-600 shadow-rose-100']">
          <p class="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">Utilidad del Período</p>
          <h2 class="text-4xl font-black mb-6">${{ fm(gastoResumen.utilidad_bruta) }}</h2>
          
          <div class="space-y-3 border-t border-white/20 pt-6">
            <div class="flex justify-between text-sm">
              <span class="opacity-80">Ventas</span>
              <span class="font-bold">${{ fm(gastoResumen.ventas) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="opacity-80">Gastos Totales</span>
              <span class="font-bold">-${{ fm(gastoResumen.total_gastos) }}</span>
            </div>
            <div class="flex justify-between text-sm mt-4 pt-4 border-t border-white/10">
              <span class="opacity-80">Retorno (ROI)</span>
              <span class="font-black text-lg">{{ gastoResumen.roi_pct }}%</span>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div class="relative w-56 h-56 shrink-0">
            <canvas ref="chartGastosRef"></canvas>
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span class="text-[10px] font-black text-gray-400 uppercase">Gastos</span>
              <span class="text-lg font-black text-gray-800">${{ fm(gastoResumen.total_gastos) }}</span>
            </div>
          </div>
          
          <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <div v-for="(monto, cat) in gastoResumen.por_categoria" :key="cat" 
              class="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <span class="w-3 h-3 rounded-full" :style="{ background: colorCategoria(cat) }"></span>
              <div class="flex-1">
                <p class="text-[10px] font-bold text-gray-400 uppercase">{{ cat }}</p>
                <p class="text-sm font-black text-gray-700">${{ fm(monto) }}</p>
              </div>
              <span class="text-[10px] font-black text-indigo-500">
                {{ Math.round((Number(monto) / (gastoResumen.total_gastos || 1)) * 100) }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráfica de Productos -->
      <div class="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h3 class="font-black text-gray-800 text-lg">Rendimiento de Productos</h3>
            <p class="text-xs text-gray-400">Unidades vendidas por producto en el período seleccionado</p>
          </div>
          <div class="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase">
            {{ productosList.length }} Productos analizados
          </div>
        </div>
        
        <div class="h-80 w-full">
          <canvas ref="chartIngRef"></canvas>
        </div>
      </div>
    </template>

    <!-- Modal Registrar Gasto -->
    <div v-if="showModalGasto" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showModalGasto = false">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div class="bg-indigo-600 p-6 text-white flex justify-between items-center">
          <h3 class="text-xl font-black">Nuevo Gasto</h3>
          <button @click="showModalGasto = false" class="text-white/50 hover:text-white text-2xl">✕</button>
        </div>
        <div class="p-8 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[10px] font-black text-gray-400 uppercase ml-2">Monto</label>
              <input v-model="gastoForm.monto" type="number" step="0.01" class="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label class="text-[10px] font-black text-gray-400 uppercase ml-2">Categoría</label>
              <select v-model="gastoForm.categoria" class="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500">
                <option v-for="c in categoriasGasto" :key="c" :value="c">{{ c.toUpperCase() }}</option>
              </select>
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-gray-400 uppercase ml-2">Concepto</label>
            <input v-model="gastoForm.concepto" type="text" placeholder="Ej: Recibo de Luz" class="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="text-[10px] font-black text-gray-400 uppercase ml-2">Fecha</label>
            <input v-model="gastoForm.fecha" type="date" class="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button @click="guardarGasto" :disabled="guardandoGasto" class="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 mt-4">
            {{ guardandoGasto ? 'PROCESANDO...' : 'GUARDAR GASTO' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  apiUrl:     { type: String,   required: true },
  getHeaders: { type: Function, required: true },
})

// --- ESTADO ---
const loading = ref(false)
const periodo = ref(30)
const fechaInicio = ref('')
const fechaFin = ref('')

const productosList = ref([])
const gastoResumen = ref({ 
  ventas: 0, 
  total_gastos: 0, 
  utilidad_bruta: 0, 
  roi_pct: 0, 
  por_categoria: {} 
})

const showModalGasto = ref(false)
const guardandoGasto = ref(false)
const gastoForm = ref({ 
  concepto: '', 
  categoria: 'general', 
  monto: '', 
  fecha: new Date().toISOString().split('T')[0] 
})

const categoriasGasto = ['renta', 'nomina', 'servicios', 'insumos', 'marketing', 'mantenimiento', 'general']

const chartIngRef = ref(null)
const chartGastosRef = ref(null)
let chartIng = null
let chartGastos = null

const COLORES_CATEGORIA = { 
  renta: '#6366f1', 
  nomina: '#f59e0b', 
  servicios: '#3b82f6', 
  insumos: '#10b981', 
  marketing: '#8b5cf6', 
  mantenimiento: '#ef4444', 
  general: '#94a3b8' 
}

const periodos = [
  { label: '7D', value: 7 }, 
  { label: '30D', value: 30 }, 
  { label: '90D', value: 90 }
]

// --- MÉTODOS ---
const fm = (v) => v ? Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'

const colorCategoria = (cat) => COLORES_CATEGORIA[cat] || '#94a3b8'

const buildCharts = async () => {
  if (!window.Chart) {
    await new Promise(r => {
      const s = document.createElement('script')
      s.src = 'https://cdn.jsdelivr.net/npm/chart.js'
      s.onload = r
      document.head.appendChild(s)
    })
  }
  const C = window.Chart
  await nextTick()

  // Gráfica de Gastos (Dona)
  if (chartGastosRef.value) {
    chartGastos?.destroy()
    const entries = Object.entries(gastoResumen.value.por_categoria)
    if (entries.length) {
      chartGastos = new C(chartGastosRef.value, {
        type: 'doughnut',
        data: {
          labels: entries.map(([k]) => k.toUpperCase()),
          datasets: [{
            data: entries.map(([, v]) => Number(v)),
            backgroundColor: entries.map(([k]) => colorCategoria(k)),
            borderWidth: 0,
            hoverOffset: 10
          }]
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false, 
          cutout: '85%', 
          plugins: { legend: { display: false } } 
        }
      })
    }
  }

  // Gráfica de Productos (Barras)
  if (chartIngRef.value && productosList.value.length) {
    chartIng?.destroy()
    chartIng = new C(chartIngRef.value, {
      type: 'bar',
      data: {
        labels: productosList.value.slice(0, 8).map(p => p.nombre.length > 20 ? p.nombre.substring(0, 18) + '…' : p.nombre),
        datasets: [{
          label: 'Unidades Vendidas',
          data: productosList.value.map(p => p.vendido),
          backgroundColor: '#6366f1',
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false, 
        plugins: { legend: { display: false } },
        scales: { 
          y: { beginAtZero: true, grid: { color: '#f3f4f6' } }, 
          x: { grid: { display: false } } 
        }
      }
    })
  }
}

const fetchAll = async () => {
  if (!fechaInicio.value || !fechaFin.value) return
  
  loading.value = true
  try {
    const params = `?fecha_inicio=${fechaInicio.value}&fecha_fin=${fechaFin.value}`
    
    const [resProd, resGastos] = await Promise.all([
      fetch(`${props.apiUrl}/reportes/reporte-productos${params}`, { headers: props.getHeaders() }),
      fetch(`${props.apiUrl}/gastos/resumen${params}`, { headers: props.getHeaders() })
    ])
    
    const dProd = await resProd.json()
    const dGastos = await resGastos.json()

    if (dProd.success && dProd.data) {
      const raw = dProd.data.top_vendidos?.length > 0 ? dProd.data.top_vendidos : (dProd.data.menos_vendidos || [])
      productosList.value = raw.map(p => ({
        id: p.id,
        nombre: p.nombre,
        vendido: parseInt(p.total_vendido || 0),
        ingreso: parseFloat(p.total_ingresos || 0)
      }))
    }

    if (dGastos.success && dGastos.data) {
      gastoResumen.value = {
        ventas: Number(dGastos.data.ventas || 0),
        total_gastos: Number(dGastos.data.total_gastos || 0),
        utilidad_bruta: Number(dGastos.data.utilidad_bruta || 0),
        roi_pct: Number(dGastos.data.roi_pct || 0),
        por_categoria: dGastos.data.por_categoria || {}
      }
    }

    await nextTick()
    buildCharts()
  } catch (err) {
    console.error("Error al cargar datos:", err)
  } finally {
    loading.value = false
  }
}

const guardarGasto = async () => {
  if (!gastoForm.value.monto || !gastoForm.value.concepto) {
    alert('Por favor completa todos los campos')
    return
  }
  
  guardandoGasto.value = true
  try {
    const res = await fetch(`${props.apiUrl}/gastos`, {
      method: 'POST',
      headers: { ...props.getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...gastoForm.value,
        monto: parseFloat(gastoForm.value.monto)
      })
    })
    
    if (res.ok) {
      showModalGasto.value = false
      gastoForm.value = { concepto: '', categoria: 'general', monto: '', fecha: new Date().toISOString().split('T')[0] }
      fetchAll()
    } else {
      const err = await res.json()
      alert('Error: ' + (err.message || 'No se pudo guardar el gasto'))
    }
  } catch (err) {
    console.error('Error guardando gasto:', err)
    alert('Error al guardar el gasto')
  } finally {
    guardandoGasto.value = false
  }
}

const setPeriodo = (dias) => {
  periodo.value = dias
  const hoy = new Date()
  const inicio = new Date()
  inicio.setDate(hoy.getDate() - dias)
  fechaFin.value = hoy.toISOString().split('T')[0]
  fechaInicio.value = inicio.toISOString().split('T')[0]
  fetchAll()
}

// --- LIFECYCLE ---
onMounted(() => setPeriodo(30))
</script>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>