<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <h1 class="text-xl lg:text-2xl font-bold text-[#202723] tracking-tight">Gestión de Productos</h1>
    <div class="flex items-center gap-2 flex-wrap">

      <!-- Buscador -->
      <div class="relative">
        <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-[#68736C] text-xs"></i>
        <input
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          placeholder="Buscar producto..."
          class="w-64 pl-8 pr-4 py-2 bg-white border border-[#DDE3DE] rounded-xl text-sm text-[#202723] placeholder-[#68736C] focus:outline-none focus:ring-2 focus:ring-[#245C4F]"
        />
      </div>

      <!-- Importar -->
      <button
        @click="$emit('import')"
        class="flex items-center gap-2 px-3.5 py-2 bg-[#245C4F] text-white text-sm font-semibold rounded-xl hover:bg-[#1D4A3F] transition shadow-xs"
      >
        <i class="fa-solid fa-file-import text-xs"></i>
        Importar
      </button>

      <!-- Exportar -->
      <ExportMenu :exporting="exporting" @export="emit('export', $event)" />

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