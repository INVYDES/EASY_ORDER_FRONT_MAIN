<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-gray-800 dark:text-gray-200">Mapa de Mesas</h3>
      <div class="flex items-center gap-3 text-xs">
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-300 inline-block"></span> Libre</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-amber-100 border border-amber-300 inline-block"></span> Ocupada</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-indigo-100 border border-indigo-300 inline-block"></span> Seleccionada</span>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>

    <div v-else class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
      <button
        v-for="mesa in mesas"
        :key="mesa.numero"
        @click="seleccionarMesa(mesa.numero)"
        :disabled="mesa.ocupada && mesa.numero !== selected"
        class="relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-150 min-h-[80px]"
        :class="estiloMesa(mesa)"
      >
        <span class="text-lg font-bold" :class="textoMesa(mesa)">{{ mesa.numero }}</span>
        <span v-if="mesa.ocupada" class="text-[10px] font-medium text-amber-700 dark:text-amber-400 mt-0.5">Ocupada</span>
        <span v-else-if="mesa.numero === selected" class="text-[10px] font-medium text-indigo-700 dark:text-indigo-400 mt-0.5">Seleccionada</span>
        <span v-else class="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Disponible</span>
      </button>
    </div>

    <div v-if="selected" class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Mesa seleccionada: <span class="font-bold text-indigo-600 dark:text-indigo-400">#{{ selected }}</span>
      </p>
      <button @click="selected = null; emit('select', null)"
        class="text-xs text-gray-400 hover:text-red-500 transition">
        Limpiar
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiClient } from '@/utils/apiClient'

const props = defineProps({
  modelValue: { type: Number, default: null },
})

const emit = defineEmits(['select', 'update:modelValue'])

const selected = ref(props.modelValue)
const mesas = ref([])
const loading = ref(true)

const cargarMesas = async () => {
  loading.value = true
  try {
    const totalMesas = 24
    const res = await apiClient.get('/ordenes?estado=ABIERTA,EN_PREPARACION,LISTA&per_page=100')
    const data = res.data?.success ? res.data : res
    const ocupadas = new Set()
    if (data.success) {
      const ordenes = Array.isArray(data.data) ? data.data : []
      ordenes.forEach(o => { if (o.mesa) ocupadas.add(Number(o.mesa)) })
    }
    mesas.value = Array.from({ length: totalMesas }, (_, i) => ({
      numero: i + 1,
      ocupada: ocupadas.has(i + 1),
    }))
  } catch {
    mesas.value = Array.from({ length: 24 }, (_, i) => ({ numero: i + 1, ocupada: false }))
  }
  finally { loading.value = false }
}

const estiloMesa = (mesa) => {
  if (mesa.numero === selected) return 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-400 shadow-sm'
  if (mesa.ocupada) return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 cursor-not-allowed opacity-70'
  return 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-400 cursor-pointer'
}

const textoMesa = (mesa) => {
  if (mesa.numero === selected) return 'text-indigo-700 dark:text-indigo-400'
  if (mesa.ocupada) return 'text-amber-700 dark:text-amber-400'
  return 'text-emerald-700 dark:text-emerald-400'
}

const seleccionarMesa = (numero) => {
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

onMounted(cargarMesas)
</script>
