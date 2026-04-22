<template>
  <div class="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50 hover:border-gray-600 transition-all">
    <!-- Header con folio y tiempo -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <span class="text-xs font-mono bg-gray-700 px-2 py-0.5 rounded text-gray-300">
          {{ order.folio || '#' + order.id }}
        </span>
        <span class="text-[10px] text-gray-500">
          {{ order.created_at_humano }}
        </span>
      </div>
      <div class="flex items-center gap-1">
        <span class="text-xs text-gray-400">
          {{ detallesComida.length }} productos
        </span>
      </div>
    </div>

    <!-- Lista de productos (SOLO comida) -->
    <div class="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
      <div 
        v-for="detalle in detallesComida" 
        :key="detalle.id"
        class="flex items-start gap-2 text-sm"
      >
        <span class="text-orange-400 font-bold text-xs mt-0.5">•</span>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <span class="font-medium text-gray-200 text-sm">
              {{ detalle.cantidad }}x {{ detalle.producto_nombre }}
            </span>
            <span class="text-xs text-gray-500">
              {{ '$' + detalle.subtotal_formateado }}
            </span>
          </div>
          <p v-if="detalle.notas" class="text-[10px] text-amber-500/70 mt-0.5 italic">
            📝 {{ detalle.notas }}
          </p>
          <p class="text-[10px] text-gray-600">
            {{ detalle.categoria }}
          </p>
        </div>
      </div>
    </div>

    <!-- Nota general de la orden -->
    <div v-if="order.notas" class="mb-3 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
      <span class="text-amber-400/80">📝 Nota general:</span>
      <p class="text-gray-300 text-xs mt-0.5">{{ order.notas }}</p>
    </div>

    <!-- Botón de acción -->
    <button
      @click="$emit('accion')"
      :disabled="procesando"
      :class="[accionClass, 'w-full py-2 rounded-lg text-xs font-semibold transition disabled:opacity-50']"
    >
      <span v-if="procesando" class="inline-block animate-spin mr-2">⏳</span>
      {{ accionLabel }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  order: { type: Object, required: true },
  accionLabel: { type: String, required: true },
  accionClass: { type: String, required: true },
  procesando: { type: Boolean, default: false }
})

defineEmits(['accion'])

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORÍAS Y FILTRO DE BEBIDAS (copiado del padre para mantener consistencia)
// ═══════════════════════════════════════════════════════════════════════════════
const CATEGORIAS_BEBIDA = [
  'Bebidas', 'Bebidas alcoholicas', 'Refrescos', 'Jugos', 'Cervezas',
  'Vinos', 'Cocteles', 'Aguas', 'Licores', 'Bebidas calientes',
  'Cafes', 'Tés', 'Bebidas Preparadas', 'Bebidas Naturales', 'Bebidas Especiales'
]

const CATEGORIAS_COMIDA = [
  'Comida del dia', 'Platillos', 'Entradas', 'Sopas', 'Ensaladas', 'Postres',
  'Antojitos', 'Tacos', 'Tortas', 'Hamburguesas', 'Pizzas', 'Pastas',
  'Carnes', 'Pescados', 'Mariscos', 'Desayunos', 'Cena', 'Comida corrida', 'Especialidades'
]

const esProductoComida = (detalle) => {
  if (!detalle) return false
  
  const categoria = detalle.categoria || ''
  const categoriaLower = categoria.toLowerCase()
  const productoNombre = (detalle.producto_nombre || '').toLowerCase()
  
  // Excluir si está en categorías de bebida
  for (const catBebida of CATEGORIAS_BEBIDA) {
    if (categoriaLower.includes(catBebida.toLowerCase()) || categoria === catBebida) {
      return false
    }
  }
  
  // Excluir palabras clave de bebidas en el nombre
  const palabrasBebida = ['cerveza', 'vino', 'tequila', 'whisky', 'whiskey', 'ron', 'vodka', 
                          'gin', 'copa', 'cocktail', 'coctel', 'refresco', 'soda', 'agua', 
                          'jugo', 'licor', 'brandy', 'champagne', 'sidra', 'pulque', 'mezcal',
                          'margarita', 'mojito', 'piña colada', 'daiquiri']
  
  for (const palabra of palabrasBebida) {
    if (productoNombre.includes(palabra)) {
      return false
    }
  }
  
  // Si tiene categoría de comida, incluir
  for (const catComida of CATEGORIAS_COMIDA) {
    if (categoriaLower.includes(catComida.toLowerCase()) || categoria === catComida) {
      return true
    }
  }
  
  return true
}

// Filtrar SOLO productos de comida
const detallesComida = computed(() => {
  if (!props.order.detalles) return []
  return props.order.detalles.filter(d => esProductoComida(d))
})
</script>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>