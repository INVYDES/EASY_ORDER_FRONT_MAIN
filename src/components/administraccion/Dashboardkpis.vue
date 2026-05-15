<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div v-for="card in cards" :key="card.label"
      class="bg-white rounded-xl shadow-sm p-5 border-l-4 relative overflow-hidden"
      :class="card.border">
      <!-- Icono fondo decorativo -->
      <span class="absolute right-3 top-2 text-4xl opacity-10 select-none">{{ card.icon }}</span>
      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ card.label }}</p>
      <p class="text-3xl font-black text-gray-900 mt-1 leading-none">{{ card.value }}</p>
      <div v-if="card.sub" class="flex items-center gap-1 mt-2">
        <span class="text-xs" :class="card.subColor || 'text-gray-400'">{{ card.sub }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  empleados:     { type: Array,  default: () => [] },
  restaurantes:  { type: Array,  default: () => [] },
  ordenesHoy:    { type: Number, default: 0 },
  ventasHoy:     { type: Number, default: 0 },
  utilidadHoy:   { type: Number, default: 0 },
  utilidadBrutaHoy: { type: Number, default: 0 },
  ordenesPorEstado: { type: Array, default: () => [] },
})

const fm = (v) => v ? Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'

const cards = computed(() => [
  {
    label:  'Ventas hoy',
    value:  '$' + fm(props.ventasHoy),
    icon:   '💰',
    border: 'border-indigo-500',
    sub:    props.ventasHoy === 0 ? 'Solo órdenes cerradas' : `${props.ordenesHoy} órdenes`,
    subColor: props.ventasHoy === 0 ? 'text-gray-400' : 'text-indigo-500 font-medium',
  },
  {
    label:  'Ticket promedio',
    value:  '$' + fm(props.ventasHoy / (props.ordenesHoy || 1)),
    icon:   '📈',
    border: 'border-emerald-500',
    sub:    'Promedio por orden hoy',
    subColor: 'text-emerald-500 font-medium',
  },
  {
    label:  'Utilidad bruta del día',
    value:  '$' + fm(props.utilidadBrutaHoy),
    icon:   '⭐',
    border: 'border-violet-500',
    sub:    'Ventas - Costo de Produccion(Ya incluye mano de obra)',
    subColor: 'text-violet-500 font-medium',
  },
  {
    label:  'Utilidad neta del día',
    value:  '$' + fm(props.utilidadHoy),
    icon:   '🏆',
    border: 'border-teal-500',
    sub:    'Bruta - Retiros de caja',
    subColor: 'text-teal-500 font-medium',
  },
])
</script>