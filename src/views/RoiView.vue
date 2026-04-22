<template>
  <div class="space-y-5">

    <!-- ── Selector de período ────────────────────────────────────────────── -->
    <div class="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-3">
      <div class="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button 
          v-for="p in periodos" 
          :key="p.value" 
          @click="setPeriodo(p.value)"
          :class="[
            'px-3 py-1.5 text-xs font-semibold rounded-lg transition',
            periodo === p.value 
              ? 'bg-white shadow-sm text-gray-800' 
              : 'text-gray-500 hover:bg-gray-200'
          ]"
        >
          {{ p.label }}
        </button>
      </div>
      
      <div class="flex items-center gap-2 text-xs text-gray-500">
        <input 
          v-model="fechaInicio" 
          type="date"
          class="px-3 py-1.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
        />
        <span>→</span>
        <input 
          v-model="fechaFin" 
          type="date"
          class="px-3 py-1.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
        />
      </div>
      
      <button 
        @click="fetchAll" 
        :disabled="loading"
        class="px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
      >
        <i v-if="loading" class="fa-solid fa-spinner fa-spin mr-1"></i>
        {{ loading ? 'Calculando...' : 'Aplicar' }}
      </button>
      
      <button 
        @click="exportarReporte" 
        class="px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition"
      >
        <i class="fa-solid fa-download mr-1"></i>
        Exportar
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-16 gap-3">
      <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p class="text-gray-400 text-sm">Calculando ROI...</p>
    </div>

    <template v-else>

      <!-- ── ROI 1: Ventas vs Costo Ingredientes ────────────────────────── -->
      <div class="bg-white rounded-xl shadow-sm p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-semibold text-gray-800">📊 ROI por ingredientes</h3>
            <p class="text-xs text-gray-400 mt-0.5">Margen real = Ventas − Costo de recetas</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs px-3 py-1 rounded-full font-bold" :class="roiIngredientes.pctClass">
              {{ roiIngredientes.pct }}% margen
            </span>
            <button 
              @click="verDetalleIngredientes" 
              class="text-indigo-600 hover:text-indigo-700 text-xs font-semibold"
            >
              <i class="fa-solid fa-chart-line mr-1"></i>
              Ver detalle
            </button>
          </div>
        </div>

        <!-- KPIs fila -->
        <div class="grid grid-cols-3 gap-3 mb-5">
          <div class="bg-indigo-50 rounded-xl p-4 text-center">
            <p class="text-xs text-indigo-600 font-semibold uppercase">Ventas</p>
            <p class="text-xl font-black text-indigo-700">${{ fm(roiIngredientes.ventas) }}</p>
            <p class="text-[10px] text-indigo-500 mt-1">{{ productosRoi.length }} productos vendidos</p>
          </div>
          <div class="bg-red-50 rounded-xl p-4 text-center">
            <p class="text-xs text-red-600 font-semibold uppercase">Costo recetas</p>
            <p class="text-xl font-black text-red-700">${{ fm(roiIngredientes.costo) }}</p>
            <p v-if="!roiIngredientes.costo" class="text-[10px] text-gray-400 mt-1">Sin ingredientes asignados</p>
            <p v-else class="text-[10px] text-red-500 mt-1">{{ roiIngredientes.costoPorcentaje }}% del total</p>
          </div>
          <div class="rounded-xl p-4 text-center" :class="roiIngredientes.margenClass">
            <p class="text-xs font-semibold uppercase" :class="roiIngredientes.margenTextClass">Ganancia</p>
            <p class="text-xl font-black" :class="roiIngredientes.margenTextClass">
              ${{ fm(roiIngredientes.margen) }}
            </p>
            <p class="text-[10px mt-1" :class="roiIngredientes.margenTextClass">
              {{ roiIngredientes.margen > 0 ? '✅ Rentable' : '⚠️ Pérdida' }}
            </p>
          </div>
        </div>

        <!-- Gráfica barras venta vs costo por producto -->
        <div class="relative h-56">
          <div v-if="!productosRoi.length" class="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <span class="text-3xl mb-2">🧮</span>
            <span class="text-sm text-center">Asigna ingredientes a tus productos<br>para ver el margen por platillo</span>
          </div>
          <canvas ref="chartIngRef"></canvas>
        </div>

        <!-- Tabla detalle -->
        <div v-if="productosRoi.length" class="mt-4 space-y-1.5 max-h-52 overflow-y-auto">
          <div v-for="p in productosRoi" :key="p.nombre" class="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50">
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-gray-800 truncate">{{ p.nombre }}</p>
              <p class="text-[10px] text-gray-400">{{ p.total_vendido }} uds · Venta ${{ fm(p.venta_total) }} · Costo ${{ fm(p.costo_total) }}</p>
            </div>
            <div class="text-right shrink-0 w-20">
              <p class="text-xs font-bold" :class="p.margenColor">
                {{ p.margen_pct }}%
              </p>
              <div class="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                <div class="h-1.5 rounded-full transition-all" :class="p.margenBarColor" :style="{ width: Math.min(p.margen_pct, 100) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── ROI 2: Ventas vs Gastos manuales ───────────────────────────── -->
      <div class="bg-white rounded-xl shadow-sm p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-semibold text-gray-800">💼 ROI operativo</h3>
            <p class="text-xs text-gray-400 mt-0.5">Ventas vs gastos registrados (renta, nómina, servicios...)</p>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="gastoResumen.roi_pct !== null" class="text-xs px-3 py-1 rounded-full font-bold" :class="roiOperativoClass">
              ROI {{ gastoResumen.roi_pct }}%
            </span>
            <button @click="showModalGasto = true" class="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
              <i class="fa-solid fa-plus mr-1"></i>
              Nuevo Gasto
            </button>
          </div>
        </div>

        <div v-if="!gastoResumen.total_gastos" class="text-center py-8 text-gray-400 text-sm">
          <span class="text-3xl block mb-2">📋</span>
          Sin gastos registrados en este período.
          <button @click="showModalGasto = true" class="block mx-auto mt-2 text-indigo-600 font-semibold hover:underline text-xs">
            Registrar primer gasto
          </button>
        </div>
        
        <template v-else>
          <div class="grid grid-cols-3 gap-3 mb-4">
            <div class="bg-indigo-50 rounded-xl p-4 text-center">
              <p class="text-xs text-indigo-600 font-semibold uppercase">Ventas</p>
              <p class="text-xl font-black text-indigo-700">${{ fm(gastoResumen.ventas) }}</p>
              <p class="text-[10px] text-indigo-500 mt-1">Total período</p>
            </div>
            <div class="bg-red-50 rounded-xl p-4 text-center">
              <p class="text-xs text-red-600 font-semibold uppercase">Gastos</p>
              <p class="text-xl font-black text-red-700">${{ fm(gastoResumen.total_gastos) }}</p>
              <p class="text-[10px] text-red-500 mt-1">{{ gastoResumen.por_categoria ? Object.keys(gastoResumen.por_categoria).length : 0 }} categorías</p>
            </div>
            <div class="rounded-xl p-4 text-center" :class="gastoResumen.utilidad_bruta >= 0 ? 'bg-emerald-50' : 'bg-rose-50'">
              <p class="text-xs font-semibold uppercase" :class="gastoResumen.utilidad_bruta >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                Utilidad
              </p>
              <p class="text-xl font-black" :class="gastoResumen.utilidad_bruta >= 0 ? 'text-emerald-700' : 'text-rose-700'">
                ${{ fm(gastoResumen.utilidad_bruta) }}
              </p>
              <p class="text-[10px] mt-1" :class="gastoResumen.utilidad_bruta >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                {{ gastoResumen.utilidad_bruta >= 0 ? '✅ Utilidad positiva' : '⚠️ Pérdida operativa' }}
              </p>
            </div>
          </div>
          
          <!-- Donut por categoría -->
          <div class="flex items-center gap-6 flex-wrap">
            <div class="relative h-40 w-40 shrink-0">
              <canvas ref="chartGastosRef"></canvas>
              <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p class="text-sm font-black text-gray-800">${{ fm(gastoResumen.total_gastos) }}</p>
                <p class="text-[10px] text-gray-400">total</p>
              </div>
            </div>
            <div class="flex-1 space-y-2">
              <div v-for="(monto, cat) in gastoResumen.por_categoria" :key="cat" class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: colorCategoria(cat) }"></span>
                <span class="text-xs text-gray-600 flex-1 capitalize font-medium">{{ cat }}</span>
                <span class="text-xs font-bold text-gray-800">${{ fm(monto) }}</span>
                <span class="text-[10px] text-gray-400 w-10 text-right">
                  {{ gastoResumen.total_gastos > 0 ? Math.round((monto / gastoResumen.total_gastos) * 100) : 0 }}%
                </span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- ── ROI 3: Comparación períodos ────────────────────────────────── -->
      <div class="bg-white rounded-xl shadow-sm p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-semibold text-gray-800">📅 Comparación vs período anterior</h3>
            <p class="text-xs text-gray-400 mt-0.5">Ventas, pedidos y ticket promedio</p>
          </div>
          <div class="text-xs text-gray-400">
            {{ formatDateRange() }}
          </div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div v-for="item in comparacion" :key="item.label" class="bg-gray-50 rounded-xl p-4">
            <p class="text-xs text-gray-500 font-semibold uppercase mb-2">{{ item.label }}</p>
            <p class="text-xl font-black text-gray-900">{{ item.actual }}</p>
            <div class="flex items-center gap-1.5 mt-1.5">
              <span class="text-lg">{{ item.tendenciaIcon }}</span>
              <span class="text-xs font-semibold" :class="item.tendenciaClass">
                {{ item.diff }}
              </span>
              <span class="text-xs text-gray-400">vs anterior</span>
            </div>
            <p class="text-[10px] text-gray-400 mt-1">Anterior: {{ item.anterior }}</p>
            <!-- Mini barra comparativa -->
            <div class="flex gap-1 h-2 mt-3">
              <div class="bg-indigo-500 rounded-full transition-all" :style="{ width: item.pctActual + '%' }"></div>
              <div class="bg-gray-200 rounded-full transition-all" :style="{ width: item.pctAnterior + '%' }"></div>
            </div>
          </div>
        </div>
        
        <div class="relative h-52 mt-5">
          <canvas ref="chartComparRef"></canvas>
        </div>
      </div>

      <!-- ── Recomendaciones ──────────────────────────────────────────────── -->
      <div v-if="recomendaciones.length > 0" class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
        <h3 class="font-semibold text-amber-800 mb-3 flex items-center gap-2">
          <i class="fa-solid fa-lightbulb"></i>
          Recomendaciones para mejorar tu ROI
        </h3>
        <div class="space-y-2">
          <div v-for="(rec, idx) in recomendaciones" :key="idx" class="flex items-start gap-2 text-sm text-amber-700">
            <i class="fa-solid fa-circle-info text-xs mt-0.5"></i>
            <span>{{ rec }}</span>
          </div>
        </div>
      </div>

    </template>

    <!-- ── MODAL GASTO ────────────────────────────────────────────────────── -->
    <div v-if="showModalGasto" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 animate-fade-in" @click.self="showModalGasto = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-slide-up">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-semibold text-gray-800">
            <i class="fa-solid fa-receipt text-indigo-600 mr-2"></i>
            Registrar gasto
          </h3>
          <button @click="showModalGasto = false" class="text-gray-400 hover:text-gray-600 text-xl transition">✕</button>
        </div>
        
        <div v-if="gastoError" class="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <i class="fa-solid fa-exclamation-triangle text-red-500 mt-0.5"></i>
          <span>{{ gastoError }}</span>
        </div>
        
        <form @submit.prevent="guardarGasto">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Concepto *</label>
              <input 
                v-model="gastoForm.concepto" 
                type="text" 
                placeholder="Ej. Pago de renta, Compra de insumos..."
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                required
              />
            </div>
            
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                <select 
                  v-model="gastoForm.categoria"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none bg-white"
                  required
                >
                  <option v-for="c in categoriasGasto" :key="c" :value="c" class="capitalize">
                    {{ getCategoriaLabel(c) }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                <div class="relative">
                  <span class="absolute left-3 top-3 text-gray-400 text-sm">$</span>
                  <input 
                    v-model="gastoForm.monto" 
                    type="number" 
                    min="0.01" 
                    step="0.01"
                    placeholder="0.00"
                    class="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
              <input 
                v-model="gastoForm.fecha" 
                type="date"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea 
                v-model="gastoForm.notas" 
                rows="2" 
                placeholder="Información adicional (opcional)"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none resize-none"
              ></textarea>
            </div>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button 
              type="button"
              @click="showModalGasto = false"
              class="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition font-medium"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              :disabled="guardandoGasto"
              class="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i v-if="guardandoGasto" class="fa-solid fa-spinner fa-spin mr-2"></i>
              {{ guardandoGasto ? 'Guardando...' : 'Registrar gasto' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de detalle de ingredientes -->
    <div v-if="showDetalleIngredientes" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 animate-fade-in" @click.self="showDetalleIngredientes = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div class="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800">
            <i class="fa-solid fa-chart-line text-indigo-600 mr-2"></i>
            Detalle de ROI por producto
          </h3>
          <button @click="showDetalleIngredientes = false" class="text-gray-400 hover:text-gray-600 transition text-xl">✕</button>
        </div>
        <div class="p-5">
          <div class="space-y-3">
            <div v-for="p in productosRoi" :key="p.nombre" class="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-bold text-gray-800">{{ p.nombre }}</h4>
                <span class="text-xs font-bold px-2 py-1 rounded-full" :class="p.margenColor">
                  {{ p.margen_pct }}% margen
                </span>
              </div>
              <div class="grid grid-cols-3 gap-3 text-center text-xs">
                <div>
                  <p class="text-gray-500">Vendidos</p>
                  <p class="font-bold text-gray-800">{{ p.total_vendido }} uds</p>
                </div>
                <div>
                  <p class="text-gray-500">Venta total</p>
                  <p class="font-bold text-indigo-600">${{ fm(p.venta_total) }}</p>
                </div>
                <div>
                  <p class="text-gray-500">Costo total</p>
                  <p class="font-bold text-red-600">${{ fm(p.costo_total) }}</p>
                </div>
              </div>
              <div class="mt-3">
                <div class="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>Margen</span>
                  <span>{{ p.margen_pct }}%</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2">
                  <div class="h-2 rounded-full transition-all" :class="p.margenBarColor" :style="{ width: Math.min(p.margen_pct, 100) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  apiUrl: { type: String, required: true },
  getHeaders: { type: Function, required: true },
})

// ── Estado ─────────────────────────────────────────────────────────────────────
const loading = ref(false)
const periodo = ref(30)
const fechaInicio = ref('')
const fechaFin = ref('')
const showDetalleIngredientes = ref(false)

const productosRoi = ref([])
const gastoResumen = ref({ 
  ventas: 0, 
  total_gastos: 0, 
  utilidad_bruta: 0, 
  roi_pct: null, 
  por_categoria: {},
  gastos_detalle: []
})
const ventasActual = ref({ total_ventas: 0, total_ordenes: 0, promedio_por_orden: 0 })
const ventasAnterior = ref({ total_ventas: 0, total_ordenes: 0, promedio_por_orden: 0 })

const showModalGasto = ref(false)
const guardandoGasto = ref(false)
const gastoError = ref('')
const gastoForm = ref({
  concepto: '',
  categoria: 'general',
  monto: '',
  fecha: new Date().toISOString().split('T')[0],
  notas: ''
})

const categoriasGasto = ['renta', 'nomina', 'servicios', 'insumos', 'marketing', 'mantenimiento', 'general']

// Chart refs
const chartIngRef = ref(null)
const chartGastosRef = ref(null)
const chartComparRef = ref(null)
let chartIng = null
let chartGastos = null
let chartCompar = null

// Constantes
const periodos = [
  { label: '7 días', value: 7 },
  { label: '30 días', value: 30 },
  { label: '90 días', value: 90 },
  { label: 'Año', value: 365 },
]

const COLORES_CATEGORIA = {
  renta: '#6366f1',
  nomina: '#f59e0b',
  servicios: '#3b82f6',
  insumos: '#10b981',
  marketing: '#8b5cf6',
  mantenimiento: '#ef4444',
  general: '#94a3b8',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const getCategoriaLabel = (cat) => {
  const labels = {
    renta: '🏢 Renta',
    nomina: '👥 Nómina',
    servicios: '💡 Servicios',
    insumos: '🥩 Insumos',
    marketing: '📢 Marketing',
    mantenimiento: '🔧 Mantenimiento',
    general: '📦 General'
  }
  return labels[cat] || cat
}

const colorCategoria = (cat) => COLORES_CATEGORIA[cat] || '#94a3b8'
const fm = (v) => v ? Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
const fmtDate = (d) => d.toISOString().split('T')[0]
const subDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() - n); return x }

// Helper para headers seguros
const safeGetHeaders = () => {
  if (typeof props.getHeaders === 'function') {
    return props.getHeaders()
  }
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
}

// ── Computed ──────────────────────────────────────────────────────────────────
const roiIngredientes = computed(() => {
  const ventas = productosRoi.value.reduce((s, p) => s + (p.venta_total || 0), 0)
  const costo = productosRoi.value.reduce((s, p) => s + (p.costo_total || 0), 0)
  const margen = ventas - costo
  const pct = ventas > 0 ? Math.round((margen / ventas) * 100) : 0
  
  return {
    ventas,
    costo,
    margen,
    pct,
    costoPorcentaje: ventas > 0 ? Math.round((costo / ventas) * 100) : 0,
    pctClass: pct >= 50 ? 'bg-emerald-100 text-emerald-700' : pct >= 20 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600',
    margenClass: margen >= 0 ? 'bg-emerald-50' : 'bg-rose-50',
    margenTextClass: margen >= 0 ? 'text-emerald-700' : 'text-rose-700'
  }
})

const roiOperativoClass = computed(() => {
  const roi = gastoResumen.value.roi_pct
  if (roi === null) return ''
  if (roi >= 50) return 'bg-emerald-100 text-emerald-700'
  if (roi >= 0) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-600'
})

const comparacion = computed(() => {
  const a = ventasActual.value
  const b = ventasAnterior.value
  
  const items = [
    {
      label: 'Ventas totales',
      actual: '$' + fm(a.total_ventas),
      anterior: '$' + fm(b.total_ventas),
      rawA: a.total_ventas || 0,
      rawB: b.total_ventas || 0,
    },
    {
      label: 'Órdenes',
      actual: String(a.total_ordenes || 0),
      anterior: String(b.total_ordenes || 0),
      rawA: a.total_ordenes || 0,
      rawB: b.total_ordenes || 0,
    },
    {
      label: 'Ticket promedio',
      actual: '$' + fm(a.promedio_por_orden),
      anterior: '$' + fm(b.promedio_por_orden),
      rawA: a.promedio_por_orden || 0,
      rawB: b.promedio_por_orden || 0,
    },
  ]
  
  return items.map(i => {
    const diff = i.rawA - i.rawB
    const diffPct = i.rawB > 0 ? Math.round((diff / i.rawB) * 100) : (i.rawA > 0 ? 100 : 0)
    const max = Math.max(i.rawA, i.rawB, 1)
    
    return {
      ...i,
      tendenciaIcon: diff > 0 ? '📈' : diff < 0 ? '📉' : '➡️',
      tendenciaClass: diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-red-500' : 'text-gray-500',
      diff: diffPct !== 0 ? (diff > 0 ? '+' : '') + diffPct + '%' : '0%',
      pctActual: Math.round((i.rawA / max) * 45),
      pctAnterior: Math.round((i.rawB / max) * 45),
    }
  })
})

const recomendaciones = computed(() => {
  const recs = []
  const roiIng = roiIngredientes.value
  const roiOp = gastoResumen.value.roi_pct
  
  if (roiIng.pct < 30 && roiIng.pct > 0) {
    recs.push('💰 Tus márgenes por producto son bajos. Revisa los costos de tus ingredientes o ajusta los precios de venta.')
  }
  if (roiIng.pct < 0) {
    recs.push('⚠️ Estás perdiendo dinero en productos. Revisa urgentemente la receta de tus platillos y los precios.')
  }
  if (roiOp !== null && roiOp < 20 && roiOp >= 0) {
    recs.push('📊 Tu ROI operativo es bajo. Analiza tus gastos fijos y busca áreas de optimización.')
  }
  if (roiOp !== null && roiOp < 0) {
    recs.push('🚨 Tus gastos operativos superan las ventas. Toma acciones inmediatas para reducir costos.')
  }
  if (productosRoi.value.length === 0) {
    recs.push('📝 No tienes productos con recetas configuradas. Asigna ingredientes a tus productos para calcular el ROI real.')
  }
  if (Object.keys(gastoResumen.value.por_categoria || {}).length === 0) {
    recs.push('📋 Registra tus gastos para tener una visión completa de la rentabilidad del negocio.')
  }
  
  return recs
})

// ── Charts ────────────────────────────────────────────────────────────────────
const loadChartJS = () => new Promise(resolve => {
  if (window.Chart) { resolve(); return }
  const script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
  script.onload = resolve
  document.head.appendChild(script)
})

const buildCharts = async () => {
  await loadChartJS()

  // Chart 1: Venta vs Costo por producto
  if (chartIng) chartIng.destroy()
  if (chartIngRef.value && productosRoi.value.length) {
    const top = productosRoi.value.slice(0, 8)
    chartIng = new window.Chart(chartIngRef.value, {
      type: 'bar',
      data: {
        labels: top.map(p => p.nombre.length > 14 ? p.nombre.slice(0, 14) + '…' : p.nombre),
        datasets: [
          { 
            label: 'Venta total', 
            data: top.map(p => p.venta_total), 
            backgroundColor: 'rgba(99,102,241,0.85)', 
            borderRadius: 6,
            borderSkipped: false
          },
          { 
            label: 'Costo total', 
            data: top.map(p => p.costo_total), 
            backgroundColor: 'rgba(239,68,68,0.75)', 
            borderRadius: 6,
            borderSkipped: false
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: $${fm(ctx.raw)}` } }
        },
        scales: { 
          y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { callback: v => '$' + v.toLocaleString() } }, 
          x: { grid: { display: false } } 
        }
      },
    })
  }

  // Chart 2: Donut gastos por categoría
  if (chartGastos) chartGastos.destroy()
  const catData = Object.entries(gastoResumen.value.por_categoria || {})
  if (chartGastosRef.value && catData.length) {
    chartGastos = new window.Chart(chartGastosRef.value, {
      type: 'doughnut',
      data: {
        labels: catData.map(([k]) => getCategoriaLabel(k)),
        datasets: [{ 
          data: catData.map(([, v]) => v), 
          backgroundColor: catData.map(([k]) => colorCategoria(k)), 
          borderWidth: 0, 
          hoverOffset: 8,
          borderRadius: 4
        }],
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false, 
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.label}: $${fm(ctx.raw)} (${ctx.percentage}%)` } } }, 
        cutout: '65%' 
      },
    })
  }

  // Chart 3: Comparación barras
  if (chartCompar) chartCompar.destroy()
  if (chartComparRef.value) {
    const maxVal = Math.max(
      ventasActual.value.total_ventas || 0,
      ventasAnterior.value.total_ventas || 0,
      (ventasActual.value.promedio_por_orden || 0) * 10,
      (ventasAnterior.value.promedio_por_orden || 0) * 10
    )
    
    chartCompar = new window.Chart(chartComparRef.value, {
      type: 'bar',
      data: {
        labels: ['Ventas ($)', 'Órdenes', 'Ticket prom. ($)'],
        datasets: [
          { 
            label: 'Período actual', 
            data: [
              ventasActual.value.total_ventas || 0, 
              ventasActual.value.total_ordenes || 0, 
              ventasActual.value.promedio_por_orden || 0
            ], 
            backgroundColor: 'rgba(99,102,241,0.85)', 
            borderRadius: 8, 
            borderSkipped: false 
          },
          { 
            label: 'Período anterior', 
            data: [
              ventasAnterior.value.total_ventas || 0, 
              ventasAnterior.value.total_ordenes || 0, 
              ventasAnterior.value.promedio_por_orden || 0
            ], 
            backgroundColor: 'rgba(209,213,219,0.8)', 
            borderRadius: 8, 
            borderSkipped: false 
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { position: 'top', labels: { boxWidth: 12, usePointStyle: true } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toLocaleString()}` } }
        },
        scales: { 
          y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { callback: v => v.toLocaleString() } }, 
          x: { grid: { display: false } } 
        }
      },
    })
  }
}

// ── API Calls ─────────────────────────────────────────────────────────────────
const fetchAll = async () => {
  loading.value = true
  try {
    await Promise.all([fetchProductosRoi(), fetchGastos(), fetchComparacion()])
    await new Promise(r => setTimeout(r, 100))
    await buildCharts()
  } catch (error) {
    console.error('Error fetching ROI data:', error)
  } finally {
    loading.value = false
  }
}

const fetchProductosRoi = async () => {
  try {
    const response = await fetch(
      `${props.apiUrl}/reportes/reporte-productos?fecha_inicio=${fechaInicio.value}&fecha_fin=${fechaFin.value}&limite=20`,
      { headers: safeGetHeaders() }
    )
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    
    const data = await response.json()
    if (data.success) {
      productosRoi.value = (data.data || []).map(p => {
        const venta_total = Number(p.total_ventas || 0)
        const costo_total = Number(p.costo_total || (p.costo_unitario || 0) * (p.total_vendido || 0))
        const margen = venta_total - costo_total
        const margen_pct = venta_total > 0 ? Math.round((margen / venta_total) * 100) : 0
        
        return {
          ...p,
          venta_total,
          costo_total,
          margen,
          margen_pct,
          margenColor: margen_pct >= 50 ? 'text-emerald-600' : margen_pct >= 20 ? 'text-amber-600' : 'text-red-500',
          margenBarColor: margen_pct >= 50 ? 'bg-emerald-500' : margen_pct >= 20 ? 'bg-amber-500' : 'bg-red-500'
        }
      }).sort((a, b) => b.margen_pct - a.margen_pct)
    }
  } catch (error) {
    console.error('Error fetchProductosRoi:', error)
    productosRoi.value = []
  }
}

const fetchGastos = async () => {
  try {
    const response = await fetch(
      `${props.apiUrl}/gastos/resumen?fecha_inicio=${fechaInicio.value}&fecha_fin=${fechaFin.value}`,
      { headers: safeGetHeaders() }
    )
    const data = await response.json()
    if (data.success) {
      gastoResumen.value = {
        ...data.data,
        roi_pct: data.data.roi_pct !== null ? Math.round(data.data.roi_pct) : null
      }
    }
  } catch (error) {
    console.error('Error fetchGastos:', error)
  }
}

const fetchComparacion = async () => {
  try {
    // Período actual
    const responseA = await fetch(
      `${props.apiUrl}/reportes/ventas?fecha_inicio=${fechaInicio.value}&fecha_fin=${fechaFin.value}&grupo=dia`,
      { headers: safeGetHeaders() }
    )
    const dataA = await responseA.json()
    if (dataA.success) {
      ventasActual.value = dataA.data?.totales || { total_ventas: 0, total_ordenes: 0, promedio_por_orden: 0 }
    }

    // Período anterior (misma duración, hacia atrás)
    const startDate = new Date(fechaInicio.value + 'T00:00:00')
    const endDate = new Date(fechaFin.value + 'T00:00:00')
    const diffDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
    
    const prevEnd = new Date(startDate)
    prevEnd.setDate(prevEnd.getDate() - 1)
    const prevStart = new Date(prevEnd)
    prevStart.setDate(prevStart.getDate() - diffDays + 1)

    const responseB = await fetch(
      `${props.apiUrl}/reportes/ventas?fecha_inicio=${fmtDate(prevStart)}&fecha_fin=${fmtDate(prevEnd)}&grupo=dia`,
      { headers: safeGetHeaders() }
    )
    const dataB = await responseB.json()
    if (dataB.success) {
      ventasAnterior.value = dataB.data?.totales || { total_ventas: 0, total_ordenes: 0, promedio_por_orden: 0 }
    }
  } catch (error) {
    console.error('Error fetchComparacion:', error)
  }
}

const guardarGasto = async () => {
  gastoError.value = ''
  
  if (!gastoForm.value.concepto || !gastoForm.value.monto || !gastoForm.value.fecha) {
    gastoError.value = 'Concepto, monto y fecha son obligatorios'
    return
  }
  
  if (gastoForm.value.monto <= 0) {
    gastoError.value = 'El monto debe ser mayor a 0'
    return
  }
  
  guardandoGasto.value = true
  
  try {
    const response = await fetch(`${props.apiUrl}/gastos`, {
      method: 'POST',
      headers: safeGetHeaders(),
      body: JSON.stringify({
        ...gastoForm.value,
        monto: parseFloat(gastoForm.value.monto)
      })
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      showModalGasto.value = false
      gastoForm.value = { 
        concepto: '', 
        categoria: 'general', 
        monto: '', 
        fecha: new Date().toISOString().split('T')[0], 
        notas: '' 
      }
      await fetchGastos()
      await buildCharts()
      
      // Mostrar notificación de éxito
      if (window.showToast) {
        window.showToast('Gasto registrado correctamente', 'success')
      }
    } else {
      gastoError.value = data.message || 'Error al guardar el gasto'
    }
  } catch (error) {
    console.error('Error guardando gasto:', error)
    gastoError.value = 'Error de conexión al servidor'
  } finally {
    guardandoGasto.value = false
  }
}

// ── UI Actions ────────────────────────────────────────────────────────────────
const setPeriodo = (dias) => {
  periodo.value = dias
  const hoy = new Date()
  fechaFin.value = fmtDate(hoy)
  fechaInicio.value = fmtDate(subDays(hoy, dias - 1))
  fetchAll()
}

const formatDateRange = () => {
  if (!fechaInicio.value || !fechaFin.value) return ''
  return `${formatDate(fechaInicio.value)} - ${formatDate(fechaFin.value)}`
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

const verDetalleIngredientes = () => {
  if (productosRoi.value.length > 0) {
    showDetalleIngredientes.value = true
  }
}

const exportarReporte = () => {
  const reporte = {
    periodo: { inicio: fechaInicio.value, fin: fechaFin.value },
    roi_ingredientes: {
      ventas: roiIngredientes.value.ventas,
      costo: roiIngredientes.value.costo,
      margen: roiIngredientes.value.margen,
      porcentaje: roiIngredientes.value.pct
    },
    roi_operativo: {
      ventas: gastoResumen.value.ventas,
      gastos: gastoResumen.value.total_gastos,
      utilidad: gastoResumen.value.utilidad_bruta,
      roi: gastoResumen.value.roi_pct
    },
    productos: productosRoi.value,
    gastos_por_categoria: gastoResumen.value.por_categoria,
    comparacion: comparacion.value
  }
  
  const dataStr = JSON.stringify(reporte, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reporte_roi_${fechaInicio.value}_${fechaFin.value}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Watchers ──────────────────────────────────────────────────────────────────
watch([fechaInicio, fechaFin], () => {
  if (fechaInicio.value && fechaFin.value) {
    fetchAll()
  }
})

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onUnmounted(() => {
  if (chartIng) chartIng.destroy()
  if (chartGastos) chartGastos.destroy()
  if (chartCompar) chartCompar.destroy()
})

onMounted(() => {
  setPeriodo(30)
})
</script>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

/* Scrollbar personalizado */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #c7d2fe;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #818cf8;
}
</style>