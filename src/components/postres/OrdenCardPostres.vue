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

    <!-- Footer de Info -->
    <div class="px-3 pb-2 flex items-center justify-between text-[10px] text-gray-600 font-medium">
      <span v-if="order.user?.name || order.usuario?.name">
        👤 {{ order.user?.name || order.usuario?.name }}
      </span>
      <span v-else class="opacity-0">—</span>
      <div class="flex items-center gap-2">
        <span v-if="tiempoEstimadoTotal > 0" class="text-indigo-400 font-bold">⏱️ Est: {{ tiempoEstimadoTotal }} min</span>
        <span>
          {{ postresFiltrados.length }} postre{{ postresFiltrados.length !== 1 ? 's' : '' }}
        </span>
      </div>
    </div>

    <!-- Botones de acción -->
    <div class="px-3 pb-3 flex flex-col gap-2">
      <!-- Botón de Receta (siempre interactivo para admin/owner, o secundario para todos) -->
      <button
        v-if="esAdminOPropietario || secondaryActionLabel"
        @click="$emit('secondary-action')"
        class="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-black/20 flex items-center justify-center gap-1.5"
      >
        <span>👁️</span> {{ secondaryActionLabel || 'Receta' }}
      </button>

      <!-- Botón Principal de Estado (bloqueado para admin/owner) -->
      <button
        @click="$emit('accion')"
        :disabled="procesando || esAdminOPropietario"
        :class="[
          esAdminOPropietario ? 'bg-gray-700 text-gray-500 cursor-not-allowed shadow-none' : accionClass,
          'w-full py-2.5 rounded-lg text-xs font-bold transition disabled:opacity-50 shadow-lg shadow-black/20'
        ]"
      >
        <span v-if="procesando" class="inline-block animate-spin mr-2">⏳</span>
        {{ esAdminOPropietario ? '🚫 Bloqueado' : (procesando ? 'Actualizando...' : accionLabel) }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  order:       { type: Object,  required: true },
  accionLabel: { type: String,  default: '' },
  accionClass: { type: String,  default: '' },
  procesando:  { type: Boolean, default: false },
  esAdminOPropietario: { type: Boolean, default: false },
  secondaryActionLabel: { type: String, default: '' }
})
defineEmits(['accion', 'secondary-action'])

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

const tiempoEstimadoTotal = computed(() => {
  return postresFiltrados.value.reduce((sum, d) => sum + ((parseFloat(d.minutos_produccion) || 0) * d.cantidad), 0)
})

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
