<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
  ordenesPorEstado: { type: Array, default: () => [] },
})

const fm = (v) => v ? Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'

const enCurso = computed(() => {
  const estados = ['ABIERTA','EN_PREPARACION','LISTA']
  return props.ordenesPorEstado
    .filter(x => estados.includes(x.estado))
    .reduce((s, x) => s + Number(x.total || 0), 0)
})

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
    label:  'Pedidos hoy',
    value:  String(props.ordenesHoy),
    icon:   '🧾',
    border: 'border-amber-500',
    sub:    enCurso.value > 0 ? `${enCurso.value} en curso` : 'Sin pedidos activos',
    subColor: enCurso.value > 0 ? 'text-amber-500 font-medium' : 'text-gray-400',
  },
  {
    label:  'Empleados',
    value:  String(props.empleados.length),
    icon:   '👥',
    border: 'border-emerald-500',
    sub:    props.empleados.length > 0 ? `${props.empleados.length} registrados` : 'Sin empleados',
    subColor: 'text-emerald-500 font-medium',
  },
  {
    label:  'Restaurantes',
    value:  String(props.restaurantes.filter(r => r.es_activo !== false).length) + ' / ' + props.restaurantes.length,
    icon:   '🏪',
    border: 'border-rose-500',
    sub:    'activos / total',
    subColor: 'text-gray-400',
  },
])
</script>