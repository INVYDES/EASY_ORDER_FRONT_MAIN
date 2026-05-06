<template>
  <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h3 class="text-lg font-bold text-gray-800">⚠️ Menor a Mayor Rentabilidad</h3>
        <p class="text-xs text-gray-400 mt-0.5">Los productos con margen crítico aparecen primero</p>
      </div>
      <div class="flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        <button v-for="filter in filters" :key="filter.value" @click="activeFilter = filter.value; $emit('filter-change', filter.value)"
          :class="['px-3 py-1.5 text-xs font-medium rounded-lg transition',
            activeFilter === filter.value ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:bg-gray-200']">
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Bottom 5 Críticos -->
    <div class="mb-4">
      <div class="flex items-center gap-2 mb-3 text-red-600">
        <span class="text-lg">⚠️</span>
        <span class="text-sm font-bold uppercase tracking-wider">Margen Crítico (Bottom 5)</span>
      </div>
      <div class="space-y-2">
        <div v-for="(prod, i) in bottom5" :key="prod.id"
          class="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-200">
          <div class="flex items-center gap-3">
            <span class="text-base">⚠️</span>
            <span class="text-sm font-semibold text-gray-700">{{ prod.nombre }}</span>
          </div>
          <span class="text-sm font-bold" :class="(prod.margen || 0) < 0 ? 'text-red-600' : 'text-red-500'">
            ${{ prod.margen || 0 }}
          </span>
        </div>
        <div v-if="bottom5.length === 0" class="text-center py-4 text-gray-400 text-sm italic">Sin datos</div>
      </div>
    </div>

    <!-- Resto de productos -->
    <div>
      <div class="flex items-center gap-2 mb-3 text-gray-500">
        <span class="text-lg">📋</span>
        <span class="text-sm font-bold uppercase tracking-wider">Otros Productos</span>
      </div>
      <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
        <div v-for="(prod, i) in others" :key="prod.id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
          <span class="text-sm text-gray-600">{{ prod.nombre }}</span>
          <span class="text-sm font-medium text-gray-500">${{ prod.margen || 0 }}</span>
        </div>
        <div v-if="others.length === 0" class="text-center py-4 text-gray-400 text-sm italic">Sin otros productos</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  products: { type: Array, required: true, default: () => [] }
})

defineEmits(['filter-change'])

const activeFilter = ref('mes')

const filters = [
  { label: 'Día',    value: 'dia' },
  { label: 'Semana', value: 'sem' },
  { label: 'Mes',    value: 'mes' },
  { label: 'Año',    value: 'ano' },
]

// Orden: MENOR → MAYOR margen
const sortedProducts = computed(() =>
  [...props.products].sort((a, b) => (a.margen || 0) - (b.margen || 0))
)

const bottom5 = computed(() => sortedProducts.value.slice(0, 5))
const others  = computed(() => sortedProducts.value.slice(5))
</script>
