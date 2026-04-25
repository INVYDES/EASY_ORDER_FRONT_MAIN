<template>
  <div class="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50 hover:border-gray-600 transition-all">
    <!-- Header con folio y tiempo -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <span class="text-xs font-mono bg-pink-900/50 px-2 py-0.5 rounded text-pink-300">
          {{ order.folio || '#' + order.id }}
        </span>
        <span class="text-[10px] text-gray-500">
          {{ order.created_at_humano }}
        </span>
      </div>
      <div class="flex items-center gap-1">
        <span class="text-xs text-gray-400">
          {{ detallesPostres.length }} productos
        </span>
      </div>
    </div>

    <!-- Lista de productos (SOLO postres) -->
    <div class="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
      <div
        v-for="detalle in detallesPostres"
        :key="detalle.id"
        class="flex items-start gap-2 text-sm"
      >
        <span class="text-pink-400 font-bold text-xs mt-0.5">•</span>
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

// ✅ Lógica de filtrado: solo categoría 'Postres'
const esProductoPostre = (detalle) => {
  return (detalle.categoria || '').toLowerCase() === 'postres'
}

// Filtrar SOLO productos de postres
const detallesPostres = computed(() => {
  if (!props.order.detalles) return []
  return props.order.detalles.filter(d => esProductoPostre(d))
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
