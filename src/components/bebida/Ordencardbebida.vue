<template>
  <div class="rounded-xl overflow-hidden border transition-all"
    :class="urgente ? 'bg-blue-950/30 border-blue-700/50' : 'bg-gray-800 border-gray-700/50 hover:border-gray-600'">

    <!-- Header -->
    <div class="px-3 py-2.5 flex items-center justify-between border-b"
      :class="urgente ? 'border-blue-700/40' : 'border-gray-700/50'">
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-sm font-black text-white shrink-0">
          {{ order.folio || ('#' + order.id) }}
        </span>
        <span v-if="order.mesa"
          class="text-xs text-gray-400 bg-gray-700/70 px-2 py-0.5 rounded-full shrink-0">
          🪑 Mesa {{ order.mesa }}
        </span>
        <!-- Badge si la orden tiene también comida (orden mixta) -->
        <span v-if="tieneComida"
          class="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full shrink-0">
          🍽️ + comida
        </span>
        <span v-if="urgente"
          class="text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full shrink-0 animate-pulse">
          ⚠️ URGENTE
        </span>
      </div>
      <span :class="['text-xs shrink-0 ml-2', tiempoClass]">⏱ {{ tiempoTexto }}</span>
    </div>

    <!-- Solo las bebidas -->
    <div class="px-3 py-3 space-y-2">
      <div v-if="bebidasFiltradas.length === 0"
        class="text-xs text-gray-600 italic text-center py-2">
        Sin bebidas en esta orden
      </div>
      <div v-for="item in bebidasFiltradas" :key="item.id" class="flex items-baseline gap-2">
        <span class="text-base font-black leading-none shrink-0"
          :class="urgente ? 'text-blue-300' : 'text-white'">
          {{ item.cantidad }}×
        </span>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-200 leading-snug">{{ item.producto_nombre }}</p>
          <p v-if="item.notas" class="text-[10px] text-amber-400 mt-0.5 italic">
            📝 {{ item.notas }}
          </p>
        </div>
        <span class="text-xs text-gray-500 shrink-0">{{ item.subtotal_formateado }}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="px-3 pb-2 flex items-center justify-between text-xs text-gray-600">
      <span v-if="order.user?.name || order.usuario?.name">
        👤 {{ order.user?.name || order.usuario?.name }}
      </span>
      <span v-else class="opacity-0">—</span>
      <span class="text-[10px] text-gray-600">
        {{ bebidasFiltradas.length }} bebida{{ bebidasFiltradas.length !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Acción -->
    <div class="px-3 pb-3">
      <button @click="$emit('accion')" :disabled="procesando"
        :class="['w-full py-2.5 text-xs font-bold rounded-lg transition disabled:opacity-50', accionClass]">
        {{ procesando ? 'Actualizando...' : accionLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// IDs de categorías que se consideran bebidas
const BEBIDA_CATEGORIA_IDS = [7] // ← tu categoria_id de bebidas

const props = defineProps({
  order:       { type: Object,  required: true },
  accionLabel: { type: String,  default: '' },
  accionClass: { type: String,  default: '' },
  procesando:  { type: Boolean, default: false },
})
defineEmits(['accion'])

// ✅ Lógica de filtrado: categoria_id === 7 OR nombre contiene "bebida"
const esBebida = (detalle) => {
  if (BEBIDA_CATEGORIA_IDS.includes(detalle.categoria_id)) return true
  const cat = (detalle.categoria || '').toLowerCase()
  const nom = (detalle.producto_nombre || '').toLowerCase()
  return cat.includes('bebida') || cat.includes('refresc') || cat.includes('coctel') ||
         cat.includes('jugo')   || cat.includes('agua')    || cat.includes('café')   ||
         nom.includes('bebida') || nom.includes('refresc') || nom.includes('coctel') ||
         nom.includes('jugo')   || nom.includes('agua')
}

const bebidasFiltradas = computed(() =>
  (props.order.detalles || []).filter(esBebida)
)

// ¿La orden tiene también productos de otras categorías? (orden mixta)
const tieneComida = computed(() =>
  (props.order.detalles || []).some(d => !esBebida(d))
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
  if (m > 8)  return 'text-amber-400 font-semibold'
  return 'text-gray-600'
})
const urgente = computed(() => minutosTranscurridos.value > 15)
</script>