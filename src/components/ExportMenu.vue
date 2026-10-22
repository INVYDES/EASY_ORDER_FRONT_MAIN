<template>
  <div ref="menuRef" class="relative">
    <button
      type="button"
      @click="abierto = !abierto"
      :disabled="exporting"
      class="flex items-center gap-1.5 px-3.5 py-2 bg-[#245C4F] text-white text-sm font-semibold rounded-xl hover:bg-[#1D4A3F] transition shadow-xs disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
    >
      <svg v-if="exporting" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <i v-else class="fa-solid fa-file-export text-xs"></i>
      {{ exporting ? 'Exportando...' : label }}
      <i class="fa-solid fa-chevron-down text-[10px] ml-0.5" :class="{ 'rotate-180': abierto }"></i>
    </button>

    <div
      v-if="abierto && !exporting"
      class="absolute right-0 mt-2 w-48 bg-white border border-[#DDE3DE] rounded-xl shadow-lg py-1 z-30"
    >
      <button
        type="button"
        @click="elegir('xlsx')"
        class="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-[#E8F1ED] transition text-left cursor-pointer"
      >
        <i class="fa-solid fa-file-excel text-emerald-600 text-sm w-4"></i> Excel (.xlsx)
      </button>
      <button
        type="button"
        @click="elegir('csv')"
        class="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-[#E8F1ED] transition text-left cursor-pointer"
      >
        <i class="fa-solid fa-file-csv text-blue-600 text-sm w-4"></i> CSV (.csv)
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
