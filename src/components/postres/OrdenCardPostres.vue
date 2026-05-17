<template>
  <div class="rounded-xl overflow-hidden border transition-all"
    :class="urgente ? 'bg-purple-950/30 border-purple-700/50' : 'bg-gray-800 border-gray-700/50 hover:border-gray-600'">

    <!-- Header -->
    <div class="px-3 py-2.5 flex items-center justify-between border-b"
      :class="urgente ? 'border-purple-700/40' : 'border-gray-700/50'">
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-sm font-black text-white shrink-0">
          {{ order.folio || ('#' + order.id) }}
        </span>
        <span v-if="order.mesa"
          class="text-xs text-gray-400 bg-gray-700/70 px-2 py-0.5 rounded-full shrink-0">
          🪑 Mesa {{ order.mesa }}
        </span>
      </div>
      <span :class="['text-xs shrink-0 ml-2', tiempoClass]">⏱ {{ tiempoTexto }}</span>
    </div>

    <!-- Solo los postres -->
    <div class="px-3 py-3 space-y-2">
      <div v-for="item in postresFiltrados" :key="item.id" class="flex items-baseline gap-2">
        <span class="text-base font-black leading-none shrink-0"
          :class="urgente ? 'text-purple-300' : 'text-white'">
          {{ item.cantidad }}×
        </span>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-200 leading-snug">{{ getNombreProducto(item) }}</p>
          <p v-if="item.notas" class="text-[10px] text-amber-400 mt-0.5 italic">
            📝 {{ item.notas }}
          </p>
        </div>
      </div>
    </div>

    <!-- Acción -->
    <div class="px-3 pb-3 space-y-2">
      <button
        v-if="secondaryActionLabel"
        @click="$emit('secondaryAction')"
        class="w-full py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 text-[10px] font-bold rounded-lg transition border border-gray-600/50"
      >
        📖 {{ secondaryActionLabel }}
      </button>

      <button @click="$emit('accion')" :disabled="procesando"
        :class="['w-full py-2.5 text-xs font-bold rounded-lg transition disabled:opacity-50', accionClass]">
        {{ procesando ? 'Actualizando...' : accionLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  order:                { type: Object,  required: true },
  accionLabel:          { type: String,  default: '' },
  accionClass:          { type: String,  default: '' },
  secondaryActionLabel: { type: String,  default: '' },
  procesando:           { type: Boolean, default: false },
})
defineEmits(['accion', 'secondaryAction'])

// ✅ Lógica de filtrado estricta: busca la categoría en el producto
const esProductoPostre = (detalle) => {
  const prodRaw = detalle.producto
  const cat = (prodRaw?.categoria?.nombre || detalle.categoria || '').toLowerCase()
  return cat.includes('postres') || cat.includes('reposteria') || cat.includes('pastel')
}

const getNombreProducto = (detalle) => {
  const prodRaw = detalle.producto
  return detalle.producto_nombre || (typeof prodRaw === 'string' ? prodRaw : prodRaw?.nombre) || 'Producto'
}

const postresFiltrados = computed(() =>
  (props.order.detalles || []).filter(esProductoPostre)
)

const minutosTranscurridos = computed(() => {
  if (!props.order.created_at) return 0
  return Math.floor((Date.now() - new Date(props.order.created_at)) / 60000)
})
const tiempoTexto = computed(() => {
  const m = minutosTranscurridos.value
  if (m < 1)  return 'Ahora'
  if (m < 60) return `${m} min`
  return `${Math.floor(m/60)}h ${m%60}m`
})
const tiempoClass = computed(() => {
  const m = minutosTranscurridos.value
  if (m > 15) return 'text-red-400 font-bold animate-pulse'
  return 'text-gray-600'
})
const urgente = computed(() => minutosTranscurridos.value > 15)
</script>
