<template>
  <div ref="menuRef" class="relative">
    <button
      type="button"
      @click="abierto = !abierto"
      :disabled="exporting"
      class="flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <svg v-if="exporting" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {{ exporting ? 'Exportando...' : label }}
      <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div
      v-if="abierto && !exporting"
      class="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-30"
    >
      <button
        type="button"
        @click="elegir('xlsx')"
        class="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition text-left"
      >
        <span>📊</span> Excel (.xlsx)
      </button>
      <button
        type="button"
        @click="elegir('csv')"
        class="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition text-left"
      >
        <span>📄</span> CSV
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  exporting: { type: Boolean, default: false },
  label:     { type: String,  default: 'Exportar' },
})

// Emite el formato elegido: 'xlsx' | 'csv'
const emit = defineEmits(['export'])

const abierto = ref(false)
const menuRef = ref(null)

const elegir = (formato) => {
  abierto.value = false
  emit('export', formato)
}

// Cierra el menú al hacer clic fuera de él
const cerrarSiEsFuera = (e) => {
  if (menuRef.value && !menuRef.value.contains(e.target)) abierto.value = false
}

onMounted(() => document.addEventListener('click', cerrarSiEsFuera))
onUnmounted(() => document.removeEventListener('click', cerrarSiEsFuera))
</script>
