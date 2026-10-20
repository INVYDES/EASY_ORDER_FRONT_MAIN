<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div v-for="card in cards" :key="card.label"
      class="bg-white rounded-xl shadow-sm p-5 border-l-4 relative"
      :class="card.border">
      <!-- Icono fondo decorativo -->
      <span class="absolute right-3 top-2 text-4xl opacity-10 select-none">{{ card.icon }}</span>
      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
        {{ card.label }}
        <MetricInfoTip :titulo="card.label" :paraQue="card.paraQue" :comoSeMide="card.comoSeMide" />
      </p>
      <p class="text-3xl font-black text-gray-900 mt-1 leading-none">{{ card.value }}</p>
      <div v-if="card.sub" class="flex items-center gap-1 mt-2">
        <span class="text-xs" :class="card.subColor || 'text-gray-400'">{{ card.sub }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MetricInfoTip from './MetricInfoTip.vue'

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
    paraQue: 'Ingresos del día de todas las órdenes ya cerradas.',
    comoSeMide: 'Suma del total de cada orden cerrada durante el día de hoy.',
  },
  {
    label:  'Ticket promedio',
    value:  '$' + fm(props.ventasHoy / (props.ordenesHoy || 1)),
    icon:   '📈',
    border: 'border-emerald-500',
    sub:    'Promedio por orden hoy',
    subColor: 'text-emerald-500 font-medium',
    paraQue: 'Muestra cuánto gasta en promedio cada comensal por orden.',
    comoSeMide: 'Ventas del día ÷ número de órdenes cerradas del día.',
  },
  {
    label:  'Utilidad bruta del día',
    value:  props.utilidadBrutaHoy < 0 ? '-$' + fm(Math.abs(props.utilidadBrutaHoy)) : '$' + fm(props.utilidadBrutaHoy),
    icon:   '⭐',
    border: 'border-violet-500',
    sub:    'Ventas - Costo de Producción de Platillos',
    subColor: 'text-violet-500 font-medium',
    paraQue: 'Margen comercial generado tras cubrir insumos, tiempo de preparación e indirectos de los platillos.',
    comoSeMide: 'Ventas del día - costo integral de producción de los platillos vendidos.',
  },
  {
    label:  'Utilidad neta del día',
    value:  props.utilidadHoy < 0 ? '-$' + fm(Math.abs(props.utilidadHoy)) : '$' + fm(props.utilidadHoy),
    icon:   props.utilidadHoy < 0 ? '📉' : '🏆',
    border: props.utilidadHoy < 0 ? 'border-red-500' : 'border-teal-500',
    sub:    props.utilidadHoy < 0 ? 'En recuperación (cubre nómina y costos fijos)' : 'Ganancia limpia del negocio hoy',
    subColor: props.utilidadHoy < 0 ? 'text-red-500 font-bold' : 'text-teal-600 font-medium',
    paraQue: 'Dinero real que le queda al negocio hoy tras cubrir producción de platillos, nómina activa, gastos fijos y retiros.',
    comoSeMide: 'Utilidad bruta - nómina activa diaria - costo fijo diario - gastos - retiros de caja.',
  },
])
</script>