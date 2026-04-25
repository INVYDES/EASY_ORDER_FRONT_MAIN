<template>
  <div class="rounded-xl overflow-hidden border transition-all"
    :class="urgente ? 'bg-orange-950/30 border-orange-700/50' : 'bg-gray-800 border-gray-700/50 hover:border-gray-600'">

    <!-- Header (Estilo Barra) -->
    <div class="px-3 py-2.5 flex items-center justify-between border-b"
      :class="urgente ? 'border-orange-700/40' : 'border-gray-700/50'">
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-sm font-black text-white shrink-0">
          {{ order.folio || ('#' + order.id) }}
        </span>
        <span v-if="order.mesa"
          class="text-xs text-gray-400 bg-gray-700/70 px-2 py-0.5 rounded-full shrink-0">
          🪑 Mesa {{ order.mesa }}
        </span>

        <span v-if="urgente"
          class="text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full shrink-0 animate-pulse">
          ⚠️ RETRASADO
        </span>
      </div>
      <span :class="['text-xs shrink-0 ml-2', tiempoClass]">⏱ {{ tiempoTexto }}</span>
    </div>

    <!-- Lista de productos (SOLO comida) -->
    <div class="px-3 py-3 space-y-2">
      <div v-if="detallesComida.length === 0"
        class="text-xs text-gray-600 italic text-center py-2">
        Sin platillos en esta orden
      </div>
      <div v-for="detalle in detallesComida" :key="detalle.id" class="flex items-start gap-2">
        <span class="text-base font-black leading-none shrink-0 mt-0.5"
          :class="urgente ? 'text-orange-300' : 'text-white'">
          {{ detalle.cantidad }}×
        </span>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-200 leading-snug font-medium">{{ detalle.producto_nombre || detalle.producto?.nombre }}</p>
          <p v-if="detalle.notas" class="text-[10px] text-amber-400 mt-0.5 italic">
            📝 {{ detalle.notas }}
          </p>
          <p class="text-[9px] text-gray-500 uppercase tracking-tighter mt-0.5">{{ detalle.categoria }}</p>
        </div>
      </div>
    </div>

    <!-- Nota general de la orden -->
    <div v-if="order.notas" class="mx-3 mb-3 text-[10px] bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-gray-300">
      <span class="text-amber-400 font-bold block mb-0.5 uppercase tracking-widest text-[8px]">Nota General:</span>
      {{ order.notas }}
    </div>

    <!-- Footer de Info -->
    <div class="px-3 pb-2 flex items-center justify-between text-[10px] text-gray-600 font-medium">
      <span v-if="order.user?.name || order.usuario?.name">
        👤 {{ order.user?.name || order.usuario?.name }}
      </span>
      <span v-else class="opacity-0">—</span>
      <span>
        {{ detallesComida.length }} producto{{ detallesComida.length !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Botón de acción -->
    <div class="px-3 pb-3">
      <button
        @click="$emit('accion')"
        :disabled="procesando"
        :class="[accionClass, 'w-full py-2.5 rounded-lg text-xs font-bold transition disabled:opacity-50 shadow-lg shadow-black/20']"
      >
        <span v-if="procesando" class="inline-block animate-spin mr-2">⏳</span>
        {{ procesando ? 'Actualizando...' : accionLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  order:       { type: Object,  required: true },
  accionLabel: { type: String,  required: true },
  accionClass: { type: String,  required: true },
  procesando:  { type: Boolean, default: false }
})

defineEmits(['accion'])

// --- Cálculo de Tiempo ---
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
  if (m > 20) return 'text-red-400 font-bold animate-pulse'
  if (m > 10) return 'text-amber-400 font-semibold'
  return 'text-gray-600'
})
const urgente = computed(() => minutosTranscurridos.value > 20)

// --- Lógica de filtrado de cocina ---
const esProductoCocina = (detalle) => {
  return (detalle.categoria || '').toLowerCase() === 'cocina'
}

const detallesComida = computed(() => {
  if (!props.order.detalles) return []
  return props.order.detalles.filter(d => esProductoCocina(d))
})
</script>

<style scoped>
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
</style>