<template>
  <div
    class="fixed inset-0 bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all no-print"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
      
      <!-- Modal Header -->
      <div class="px-6 py-5 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between bg-slate-50/50 dark:bg-gray-800/50">
        <div>
          <h3 class="text-xl font-bold text-slate-800 dark:text-gray-200 flex items-center gap-2">
            📦 Lista de Compras de Ingredientes
          </h3>
          <p class="text-xs text-slate-500 dark:text-gray-400 mt-1 font-medium">
            Genera y exporta la lista de insumos que necesitas adquirir según el stock mínimo requerido.
          </p>
        </div>
        <button @click="$emit('close')" class="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-full text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition-colors shadow-sm border border-transparent hover:border-slate-100 dark:hover:border-gray-600">
          <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
        
        <!-- Summary KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-slate-50 dark:bg-gray-800/50 border border-slate-200/60 dark:border-gray-700 rounded-xl p-4 flex flex-col">
            <span class="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider">Insumos en lista</span>
            <span class="text-2xl font-black text-slate-800 dark:text-gray-200 mt-1">{{ ingredientesFiltrados.length }}</span>
            <span class="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5 font-medium">Filtrados de {{ totalIngredientes }} en catálogo</span>
          </div>
          <div class="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4 flex flex-col">
            <span class="text-[10px] text-indigo-600 dark:text-indigo-300 font-bold uppercase tracking-wider">Items por comprar</span>
            <span class="text-2xl font-black text-indigo-700 dark:text-indigo-200 mt-1">{{ itemsAComprar.length }}</span>
            <span class="text-[10px] text-indigo-400 dark:text-indigo-400 mt-0.5 font-medium">Ingredientes por debajo de su stock mínimo</span>
          </div>
          <div class="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-xl p-4 flex flex-col">
            <span class="text-[10px] text-emerald-600 dark:text-emerald-300 font-bold uppercase tracking-wider">Presupuesto estimado</span>
            <span class="text-2xl font-black text-emerald-700 dark:text-emerald-200 mt-1">${{ fm(presupuestoTotal) }}</span>
            <span class="text-[10px] text-emerald-400 dark:text-emerald-400 mt-0.5 font-medium">Costo estimado total de adquisición</span>
          </div>
        </div>

        <!-- Filters Section -->
        <div class="bg-slate-50/50 dark:bg-gray-800/30 rounded-2xl p-5 border border-slate-200/50 dark:border-gray-700 space-y-4">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <!-- State Multi-select Filters -->
            <div class="space-y-2">
              <label class="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Filtrar por Estado de Stock</label>
              <div class="flex flex-wrap items-center gap-2">
                <button
                  v-for="state in states"
                  :key="state.value"
                  @click="toggleState(state.value)"
                  class="px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  :class="[
                    isStateActive(state.value)
                      ? state.activeClass
                      : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-400 hover:border-slate-300 dark:hover:border-gray-600'
                  ]"
                >
                  <span class="text-sm leading-none">{{ state.emoji }}</span>
                  <span>{{ state.label }}</span>
                  <span
                    class="ml-1 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-black"
                    :class="[isStateActive(state.value) ? state.badgeActive : 'bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-400']"
                  >
                    {{ getCountByState(state.value) }}
                  </span>
                </button>
              </div>
            </div>

            <!-- Search Field -->
            <div class="space-y-2 flex-1 md:max-w-xs">
              <label class="block text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Buscar por nombre / proveedor</label>
              <div class="relative">
                <input
                  v-model="search"
                  type="text"
                  placeholder="Ej. Verduras, Café..."
                  class="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-gray-200"
                />
                <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 text-sm pointer-events-none">🔍</span>
              </div>
            </div>

          </div>
        </div>

        <!-- Ingredients List Table -->
        <div class="border border-slate-200/80 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
          <div class="max-h-[35vh] overflow-y-auto custom-scrollbar">
            <table class="min-w-full divide-y divide-slate-100 dark:divide-gray-700">
              <thead class="bg-slate-50 dark:bg-gray-800 sticky top-0 z-10">
                <tr>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Ingrediente</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Proveedor</th>
                  <th class="px-5 py-3 text-right text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Precio Unit.</th>
                  <th class="px-5 py-3 text-right text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Stock Actual</th>
                  <th class="px-5 py-3 text-right text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Stock Mínimo</th>
                  <th class="px-5 py-3 text-right text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">A comprar</th>
                  <th class="px-5 py-3 text-right text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Costo Aprox.</th>
                  <th class="px-5 py-3 text-center text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-gray-700">
                <tr v-if="ingredientesFiltrados.length === 0">
                  <td colspan="8" class="text-center py-12 text-slate-400 dark:text-gray-500 italic text-sm">
                    No se encontraron ingredientes con los filtros seleccionados.
                  </td>
                </tr>
                <tr
                  v-for="ing in ingredientesFiltrados"
                  :key="ing.id"
                  class="hover:bg-slate-50/50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <!-- Name -->
                  <td class="px-5 py-3.5 text-sm">
                    <div class="font-semibold text-slate-800 dark:text-gray-200">{{ ing.nombre }}</div>
                    <div class="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider">{{ ing.unidad }}</div>
                  </td>
                  
                  <!-- Provider -->
                  <td class="px-5 py-3.5 text-sm text-slate-500 dark:text-gray-400">
                    {{ ing.proveedor || 'Sin Proveedor' }}
                  </td>

                  <!-- Precio Unitario -->
                  <td class="px-5 py-3.5 text-sm text-right font-medium text-slate-700 dark:text-gray-300">
                    ${{ fm(ing.costo_unitario) }}
                  </td>

                  <!-- Stock Actual -->
                  <td class="px-5 py-3.5 text-sm text-right font-medium text-slate-700 dark:text-gray-300">
                    {{ fmQty(ing.stock_actual) }} {{ ing.unidad }}
                  </td>

                  <!-- Stock Mínimo -->
                  <td class="px-5 py-3.5 text-sm text-right text-slate-400 dark:text-gray-500 font-medium">
                    {{ fmQty(ing.stock_minimo) }} {{ ing.unidad }}
                  </td>

                  <!-- Quantity to Buy -->
                  <td class="px-5 py-3.5 text-sm text-right font-black">
                    <span
                      v-if="qtyToBuy(ing) > 0"
                      class="text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800"
                    >
                      +{{ fmQty(qtyToBuy(ing)) }} {{ ing.unidad }}
                    </span>
                    <span v-else class="text-slate-400 dark:text-gray-500">-</span>
                  </td>

                  <!-- Estimated Cost -->
                  <td class="px-5 py-3.5 text-sm text-right font-bold text-slate-700 dark:text-gray-300">
                    <span v-if="costToBuy(ing) > 0" class="text-emerald-600 dark:text-emerald-400">
                      ${{ fm(costToBuy(ing)) }}
                    </span>
                    <span v-else class="text-slate-400 dark:text-gray-500">$0.00</span>
                  </td>

                  <!-- Badge Status -->
                  <td class="px-5 py-3.5 text-center">
                    <span
                      class="px-2.5 py-1 text-[10px] font-bold rounded-full tracking-wider uppercase inline-block border"
                      :class="[
                        getStateInfo(ing).class
                      ]"
                    >
                      {{ getStateInfo(ing).label }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-5 bg-slate-50/50 dark:bg-gray-800/50 border-t border-slate-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
        <button
          @click="$emit('close')"
          class="w-full sm:w-auto px-6 py-3 text-sm font-bold text-slate-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-600 hover:text-slate-700 dark:hover:text-gray-300 transition shadow-sm active:scale-95"
        >
          Cerrar
        </button>
        <div class="flex-1"></div>
        <div class="flex gap-3 w-full sm:w-auto">
          <!-- Print Button -->
          <button
            @click="imprimirLista"
            class="flex-1 sm:flex-initial px-5 py-3 text-sm font-bold text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-600 hover:border-slate-300 dark:hover:border-gray-500 transition shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            🖨️ Imprimir
          </button>
          
          <!-- CSV Export Button -->
          <button
            @click="exportarCSV"
            class="flex-1 sm:flex-initial px-6 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            📥 Exportar CSV
          </button>
        </div>
      </div>

    </div>
  </div>

  <!-- PRINT-ONLY HIDDEN LAYOUT -->
  <div class="print-only hidden p-8 space-y-6">
    <div class="flex items-center justify-between border-b-2 border-slate-800 pb-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900">📦 Lista de Compras de Ingredientes</h1>
        <p class="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Generado el {{ fechaActual }}</p>
      </div>
      <div class="text-right">
        <p class="text-xs text-slate-500 font-bold uppercase">Presupuesto Estimado</p>
        <p class="text-xl font-black text-emerald-700">${{ fm(presupuestoTotal) }}</p>
      </div>
    </div>

    <!-- Summary Metrics for print -->
    <div class="grid grid-cols-3 gap-4 py-4 border-b border-slate-200">
      <div class="text-center">
        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Insumos en lista</p>
        <p class="text-lg font-black text-slate-800">{{ ingredientesFiltrados.length }}</p>
      </div>
      <div class="text-center border-x border-slate-200">
        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Items por comprar</p>
        <p class="text-lg font-black text-indigo-700">{{ itemsAComprar.length }}</p>
      </div>
      <div class="text-center">
        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Costo aprox.</p>
        <p class="text-lg font-black text-emerald-700">${{ fm(presupuestoTotal) }}</p>
      </div>
    </div>

    <!-- Print Table -->
    <table class="min-w-full divide-y divide-slate-300 mt-6 border border-slate-200 rounded-xl overflow-hidden">
      <thead class="bg-slate-50">
        <tr>
          <th class="px-4 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Ingrediente</th>
          <th class="px-4 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Proveedor</th>
          <th class="px-4 py-3.5 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">Precio Unit.</th>
          <th class="px-4 py-3.5 text-right text-xs font-bold text-slate-700 tracking-wider uppercase">Stock Actual</th>
          <th class="px-4 py-3.5 text-right text-xs font-bold text-slate-700 tracking-wider uppercase">Stock Mínimo</th>
          <th class="px-4 py-3.5 text-right text-xs font-bold text-slate-700 tracking-wider uppercase">A comprar</th>
          <th class="px-4 py-3.5 text-right text-xs font-bold text-slate-700 tracking-wider uppercase">Costo Aprox.</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200 bg-white">
        <tr v-if="ingredientesFiltrados.length === 0">
          <td colspan="7" class="text-center py-10 text-slate-400 italic text-xs">
            No hay ingredientes seleccionados en esta lista de compras.
          </td>
        </tr>
        <tr v-for="ing in ingredientesFiltrados" :key="ing.id" class="page-break-avoid">
          <td class="px-4 py-3 text-xs font-black text-slate-800">
            {{ ing.nombre }} <span class="text-[9px] text-indigo-500 font-bold uppercase">({{ ing.unidad }})</span>
          </td>
          <td class="px-4 py-3 text-xs text-slate-600">
            {{ ing.proveedor || 'Sin Proveedor' }}
          </td>
          <td class="px-4 py-3 text-xs text-right text-slate-700 font-medium">
            ${{ fm(ing.costo_unitario) }}
          </td>
          <td class="px-4 py-3 text-xs text-right text-slate-700 font-medium">
            {{ fmQty(ing.stock_actual) }}
          </td>
          <td class="px-4 py-3 text-xs text-right text-slate-400 font-medium">
            {{ fmQty(ing.stock_minimo) }}
          </td>
          <td class="px-4 py-3 text-xs text-right font-black text-indigo-700">
            {{ qtyToBuy(ing) > 0 ? `+${fmQty(qtyToBuy(ing))}` : '-' }}
          </td>
          <td class="px-4 py-3 text-xs text-right font-bold text-emerald-700">
            {{ costToBuy(ing) > 0 ? `$${fm(costToBuy(ing))}` : '$0.00' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  ingredientes: {
    type: Array,
    required: true
  }
})

defineEmits(['close'])

// Component State
const search = ref('')
const selectedStates = ref(['sin_stock', 'bajo_stock']) // Intelligent Default: check Bajo stock and Sin stock

const states = [
  {
    value: 'sin_stock',
    emoji: '🚨',
    label: 'Sin Stock',
    activeClass: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100/50 dark:hover:bg-red-900/50',
    badgeActive: 'bg-red-500 text-white',
  },
  {
    value: 'bajo_stock',
    emoji: '⚠️',
    label: 'Bajo Stock',
    activeClass: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/50',
    badgeActive: 'bg-amber-500 text-white',
  },
  {
    value: 'ok',
    emoji: '✅',
    label: 'Estado OK',
    activeClass: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/50',
    badgeActive: 'bg-emerald-500 text-white',
  }
]

// Date Format helper for print
const fechaActual = computed(() => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  return new Date().toLocaleDateString('es-MX', options)
})

// Number/currency formatting helpers
const fm = (v) => v ? Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
const fmQty = (v) => {
  const n = parseFloat(v)
  if (isNaN(n)) return '0'
  return n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)
}

// Helpers for ingredient state and purchase calculations
const getEstado = (ing) => {
  const stock = Number(ing.stock_actual) || 0
  const min = Number(ing.stock_minimo) || 0
  if (stock <= 0) return 'sin_stock'
  if (stock <= min) return 'bajo_stock'
  return 'ok'
}

const getStateInfo = (ing) => {
  const state = getEstado(ing)
  if (state === 'sin_stock') return { label: 'Sin Stock', class: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' }
  if (state === 'bajo_stock') return { label: 'Bajo Stock', class: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300' }
  return { label: 'OK', class: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' }
}

const qtyToBuy = (ing) => {
  const stock = Number(ing.stock_actual) || 0
  const min = Number(ing.stock_minimo) || 0
  return Math.max(0, min - stock)
}

const costToBuy = (ing) => {
  const qty = qtyToBuy(ing)
  const cost = Number(ing.costo_unitario) || 0
  return qty * cost
}

// Stats metrics
const totalIngredientes = computed(() => props.ingredientes.length)

const getCountByState = (stateValue) => {
  return props.ingredientes.filter(i => getEstado(i) === stateValue).length
}

// Active filters check
const isStateActive = (stateValue) => selectedStates.value.includes(stateValue)

const toggleState = (stateValue) => {
  if (selectedStates.value.includes(stateValue)) {
    // Keep at least one filter selected
    if (selectedStates.value.length > 1) {
      selectedStates.value = selectedStates.value.filter(s => s !== stateValue)
    }
  } else {
    selectedStates.value.push(stateValue)
  }
}

// Filtering calculation
const ingredientesFiltrados = computed(() => {
  let list = props.ingredientes

  // State Filter
  list = list.filter(i => selectedStates.value.includes(getEstado(i)))

  // Search Filter
  if (search.value.trim()) {
    const q = search.value.toLowerCase().trim()
    list = list.filter(i => 
      i.nombre.toLowerCase().includes(q) || 
      (i.proveedor || '').toLowerCase().includes(q)
    )
  }

  return list
})

// Items to buy (quantity to buy > 0)
const itemsAComprar = computed(() => {
  return ingredientesFiltrados.value.filter(i => qtyToBuy(i) > 0)
})

// Estimated Budget cost sum
const presupuestoTotal = computed(() => {
  return ingredientesFiltrados.value.reduce((sum, i) => sum + costToBuy(i), 0)
})

// PRINTING ACTION
const imprimirLista = () => {
  window.print()
}

// CSV EXPORT ACTION
const exportarCSV = () => {
  let csvContent = '\uFEFF' // UTF-8 BOM for Spanish characters (accent marks/ñ)
  
  // Headers
  csvContent += 'Ingrediente,Proveedor,Stock Actual,Stock Mínimo,Cantidad a Comprar,Costo Unitario,Costo Aproximado,Estado\n'
  
  // Rows
  ingredientesFiltrados.value.forEach(ing => {
    const qty = qtyToBuy(ing)
    const state = getEstado(ing) === 'sin_stock' ? 'Sin Stock' : getEstado(ing) === 'bajo_stock' ? 'Bajo Stock' : 'OK'
    
    const row = [
      `"${ing.nombre.replace(/"/g, '""')}"`,
      `"${(ing.proveedor || 'Sin Proveedor').replace(/"/g, '""')}"`,
      `${ing.stock_actual} ${ing.unidad}`,
      `${ing.stock_minimo} ${ing.unidad}`,
      `${qty > 0 ? qty : 0} ${ing.unidad}`,
      `$${ing.costo_unitario}`,
      `$${costToBuy(ing).toFixed(2)}`,
      `"${state}"`
    ]
    csvContent += row.join(',') + '\n'
  })
  
  // Summary Row
  csvContent += `\n"Total Items a Adquirir:",${itemsAComprar.value.length}\n`
  csvContent += `"Presupuesto Estimado Total:",$${presupuestoTotal.value.toFixed(2)}\n`

  // Download logic
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `lista_compras_${new Date().toISOString().slice(0,10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
:is(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
:is(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

@keyframes slideIn {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.animate-in {
  animation: slideIn 0.2s ease-out forwards;
}
</style>

<style>
/* Print stylesheet injected to support elegant modal-only printing */
@media print {
  body * {
    visibility: hidden;
  }
  .print-only, .print-only * {
    visibility: visible;
  }
  .print-only {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    display: block !important;
  }
  .no-print {
    display: none !important;
  }
  /* Avoid table row page cut-off */
  .page-break-avoid {
    page-break-inside: avoid;
  }
}
</style>
