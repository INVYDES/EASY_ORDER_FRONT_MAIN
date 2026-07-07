<template>
  <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-gray-800 dark:text-slate-200">Mapa de Mesas</h3>
      <div class="flex items-center gap-3 text-xs flex-wrap">
        <span class="flex items-center gap-1 text-gray-500 dark:text-slate-400"><span class="w-3 h-3 rounded-full bg-emerald-100 dark:bg-emerald-800/60 border border-emerald-300 dark:border-emerald-600 inline-block"></span> Libre</span>
        <span class="flex items-center gap-1 text-gray-500 dark:text-slate-400"><span class="w-3 h-3 rounded-full bg-amber-100 dark:bg-amber-800/60 border border-amber-300 dark:border-amber-600 inline-block"></span> Ocupada</span>
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
        <span v-if="mesa.ocupada && mesa.sinMesero" class="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-0.5 flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
          Sin mesero
        </span>
        <span v-else-if="mesa.ocupada" class="text-[10px] font-medium text-amber-700 dark:text-amber-400 mt-0.5">Ocupada</span>
        <span v-else class="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Disponible</span>
      </button>
    </div>

    <div v-if="mesas.length === 0" class="text-center py-8 text-gray-400 dark:text-slate-500">
      <p class="text-lg mb-1">🍽️</p>
      <p class="text-sm font-medium">No tienes mesas asignadas</p>
      <p class="text-xs mt-1">Contacta al administrador para que te asigne mesas.</p>
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

const props = defineProps({
  modelValue: { type: Number, default: null },
  ordenes: { type: Array, default: () => [] },
  totalMesas: { type: Number, default: 24 },
  mesasAsignadas: { type: Array, default: () => [] },
  esMesero: { type: Boolean, default: false },
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
  return 'ocupada'
}

const mesas = computed(() => {
  const soloAsignadas = props.esMesero && props.mesasAsignadas.length > 0
  const numeros = soloAsignadas
    ? props.mesasAsignadas
    : !props.esMesero
      ? Array.from({ length: props.totalMesas }, (_, i) => i + 1)
      : []
  return numeros.map(num => {
    const estado = estadoMesa(num)
    const ordenMesa = props.ordenes.find(o =>
      Number(o.mesa) === num &&
      !['CERRADA', 'CANCELADA', 'PAGADA'].includes(o.estado)
    )
    return {
      numero: num,
      ocupada: estado === 'ocupada',
      sinMesero: (() => {
        // Determine if the current table number is part of the assigned tables.
        // `mesasAsignadas` may contain plain numbers or objects (e.g., { id: 5 }).
        const asignada = props.mesasAsignadas.some(m => {
          // Direct match for primitive numbers/strings
          if (typeof m === 'number' || typeof m === 'string') {
            return Number(m) === Number(num)
          }
          // Objects with an `id` or `numero` field
          if (typeof m === 'object' && m !== null) {
            return Number(m.id ?? m.numero) === Number(num)
          }
          return false
        })
        if (asignada) return false
        // If there is an order for this table, check if a mesero (usuario) is assigned.
        return ordenMesa ? !ordenMesa.usuario_id : false
      })(),
    }
  })
})

const estiloMesa = (mesa) => {
  if (mesa.ocupada && mesa.sinMesero) return 'bg-rose-50 dark:bg-rose-900/30 border-rose-300 dark:border-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:border-rose-400 animate-pulse'
  if (mesa.ocupada) return 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:border-amber-400'
  return 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 hover:border-emerald-400 dark:hover:border-emerald-500'
}

const textoMesa = (mesa) => {
  if (mesa.ocupada && mesa.sinMesero) return 'text-rose-700 dark:text-rose-400'
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