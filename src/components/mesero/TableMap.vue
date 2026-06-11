<template>
  <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-gray-800 dark:text-slate-200">Mapa de Mesas</h3>
      <div class="flex items-center gap-3 text-xs flex-wrap">
        <span class="flex items-center gap-1 text-gray-500 dark:text-slate-400"><span class="w-3 h-3 rounded-full bg-emerald-100 dark:bg-emerald-800/60 border border-emerald-300 dark:border-emerald-600 inline-block"></span> Libre</span>
        <span class="flex items-center gap-1 text-gray-500 dark:text-slate-400"><span class="w-3 h-3 rounded-full bg-amber-100 dark:bg-amber-800/60 border border-amber-300 dark:border-amber-600 inline-block"></span> Ocupada</span>
        <span class="flex items-center gap-1 text-gray-500 dark:text-slate-400"><span class="w-3 h-3 rounded-full bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-600 inline-block"></span> Pte. pago</span>
        <span class="flex items-center gap-1 text-gray-500 dark:text-slate-400"><span class="w-3 h-3 rounded-full bg-indigo-100 dark:bg-indigo-800/60 border border-indigo-300 dark:border-indigo-600 inline-block"></span> Seleccionada</span>
      </div>
    </div>

    <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
      <button
        v-for="mesa in mesas"
        :key="mesa.numero"
        @click="seleccionarMesa(mesa.numero)"
        class="relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-150 min-h-[80px] cursor-pointer"
        :class="estiloMesa(mesa)"
      >
        <span class="text-lg font-bold" :class="textoMesa(mesa)">{{ mesa.numero }}</span>
        <span v-if="mesa.pendientePago" class="text-[10px] font-medium text-red-700 dark:text-red-400 mt-0.5">Pendiente</span>
        <span v-else-if="mesa.ocupada" class="text-[10px] font-medium text-amber-700 dark:text-amber-400 mt-0.5">Ocupada</span>
        <span v-else-if="mesa.numero === selected" class="text-[10px] font-medium text-indigo-700 dark:text-indigo-400 mt-0.5">Seleccionada</span>
        <span v-else class="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Disponible</span>
      </button>
    </div>

    <div v-if="selected" class="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
      <p class="text-sm text-gray-600 dark:text-slate-400">Mesa seleccionada: <span class="font-bold text-indigo-600 dark:text-indigo-400">#{{ selected }}</span></p>
      <button @click="selected = null; $emit('select', null)"
        class="text-xs text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition">Limpiar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const OCUPADOS = ['ABIERTA', 'POR_PREPARAR', 'EN_PREPARACION', 'LISTA']
const PTE_PAGO = ['ENTREGADA']

const props = defineProps({
  modelValue: { type: Number, default: null },
  restauranteId: { type: Number, default: null },
  ordenes: { type: Array, default: () => [] },
  totalMesas: { type: Number, default: 24 },
})

const emit = defineEmits(['select', 'update:modelValue'])

const selected = ref(props.modelValue)

watch(() => props.modelValue, (v) => { selected.value = v })

const estadoMesa = (num) => {
  const ordenesMesa = props.ordenes.filter(o =>
    Number(o.mesa) === Number(num) &&
    !['CERRADA', 'CANCELADA', 'PAGADA'].includes(o.estado)
  )
  if (!ordenesMesa.length) return 'libre'
  if (ordenesMesa.some(o => PTE_PAGO.includes(o.estado))) return 'pendiente'
  return 'ocupada'
}

const mesas = computed(() =>
  Array.from({ length: props.totalMesas }, (_, i) => {
    const estado = estadoMesa(i + 1)
    return {
      numero: i + 1,
      ocupada: estado === 'ocupada',
      pendientePago: estado === 'pendiente',
    }
  })
)

const estiloMesa = (mesa) => {
  if (mesa.numero === selected) return 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-400 dark:border-indigo-500 shadow-sm'
  if (mesa.pendientePago) return 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 hover:border-red-400'
  if (mesa.ocupada) return 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:border-amber-400'
  return 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 hover:border-emerald-400 dark:hover:border-emerald-500'
}

const textoMesa = (mesa) => {
  if (mesa.numero === selected) return 'text-indigo-700 dark:text-indigo-300'
  if (mesa.pendientePago) return 'text-red-700 dark:text-red-400'
  if (mesa.ocupada) return 'text-amber-700 dark:text-amber-400'
  return 'text-emerald-700 dark:text-emerald-400'
}

const seleccionarMesa = (numero) => {
  const mesa = mesas.value.find(m => m.numero === numero)
  if (!mesa) return
  if (selected.value === numero) {
    selected.value = null
    emit('select', null)
    emit('update:modelValue', null)
    return
  }
  selected.value = numero
  emit('select', numero)
  emit('update:modelValue', numero)
}
</script>