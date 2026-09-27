<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <h1 class="text-xl font-semibold text-gray-800">Gestión de Productos</h1>
    <div class="flex items-center gap-2 flex-wrap">

      <!-- Buscador -->
      <div class="relative">
        <svg class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          placeholder="Buscar producto..."
          class="w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- Importar -->
      <button
        @click="$emit('import')"
        class="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Importar
      </button>

      <!-- Exportar -->
      <ExportMenu :exporting="exporting" @export="emit('export', $event)" />

      <!-- Nuevo producto -->
      <button
        @click="$emit('new')"
        class="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nuevo Producto
      </button>

    </div>
  </div>
</template>

<script setup>
import ExportMenu from '@/components/ExportMenu.vue'

defineProps({
  modelValue: { type: String, default: '' },
  exporting: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'new', 'import', 'export'])
</script>