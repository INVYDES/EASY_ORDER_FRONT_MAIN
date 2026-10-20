<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div v-for="card in cards" :key="card.label"
      class="bg-white p-5 rounded-xl border border-[#DDE3DE]">
      <div class="flex items-center gap-1.5 mb-2">
        <p class="text-xs font-semibold text-[#68736C] uppercase tracking-wider">
          {{ card.label }}
        </p>
        <MetricInfoTip :titulo="card.label" :paraQue="card.paraQue" :comoSeMide="card.comoSeMide" />
      </div>
      <p class="text-2xl font-semibold tracking-tight tabular-nums" :class="card.valColor || 'text-[#202723]'">
        {{ card.value }}
      </p>
      <p v-if="card.sub" class="text-xs text-[#68736C] mt-1">{{ card.sub }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MetricInfoTip from './MetricInfoTip.vue'

const props = defineProps({
  empleados:        { type: Array,  default: () => [] },
  restaurantes:     { type: Array,  default: () => [] },
  ordenesHoy:       { type: Number, default: 0 },
  ventasHoy:        { type: Number, default: 0 },
  utilidadHoy:      { type: Number, default: 0 },
  utilidadBrutaHoy: { type: Number, default: 0 },
  ordenesPorEstado: { type: Array,  default: () => [] },
})

const formatMoney = (val) => {
  const num = Number(val || 0)
  const isNeg = num < 0
  const absFormatted = Math.abs(num).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return isNeg ? `-$${absFormatted}` : `$${absFormatted}`
}

const cards = computed(() => [
  {
    label:      'Ventas hoy',
    value:      formatMoney(props.ventasHoy),
    valColor:   'text-[#245C4F]',
    sub:        props.ventasHoy === 0 ? 'Solo órdenes cerradas' : `${props.ordenesHoy} órdenes cerradas`,
    paraQue:    'Ingresos del día de todas las órdenes ya cobradas.',
    comoSeMide: 'Suma del total de cada orden cerrada durante el día de hoy.',
  },
  {
    label:      'Ticket promedio',
    value:      formatMoney(props.ventasHoy / (props.ordenesHoy || 1)),
    valColor:   'text-[#202723]',
    sub:        'Promedio por orden cobrada hoy',
    paraQue:    'Muestra cuánto gasta en promedio cada comensal por orden.',
    comoSeMide: 'Ventas del día ÷ número de órdenes cerradas del día.',
  },
  {
    label:      'Utilidad bruta del día',
    value:      formatMoney(props.utilidadBrutaHoy),
    valColor:   props.utilidadBrutaHoy < 0 ? 'text-[#B93838]' : 'text-[#202723]',
    sub:        'Ventas − Costo de producción e insumos',
    paraQue:    'Margen comercial generado tras cubrir insumos, tiempo de preparación e indirectos de los platillos.',
    comoSeMide: 'Ventas del día - costo integral de producción de los platillos vendidos.',
  },
  {
    label:      'Utilidad neta del día',
    value:      formatMoney(props.utilidadHoy),
    valColor:   props.utilidadHoy < 0 ? 'text-[#B93838]' : 'text-[#26734D]',
    sub:        props.utilidadHoy < 0 ? 'En recuperación (nómina y gastos fijos)' : 'Ganancia limpia del negocio hoy',
    paraQue:    'Dinero real que le queda al negocio hoy tras cubrir producción de platillos, nómina activa, gastos fijos y retiros.',
    comoSeMide: 'Utilidad bruta - nómina activa diaria - costo fijo diario - gastos - retiros de caja.',
  },
])
</script>