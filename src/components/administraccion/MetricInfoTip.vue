<template>
  <span class="relative inline-flex align-middle">
    <span class="group/tip inline-flex">
      <span
        class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 text-[9px] font-black leading-none cursor-help select-none"
        aria-label="Información de la métrica"
      >i</span>

      <!-- Cuadro informativo que aparece arriba al pasar el mouse -->
      <span
        class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 z-[60] pointer-events-none invisible opacity-0 group-hover/tip:visible group-hover/tip:opacity-100 group-hover/tip:scale-100 scale-95 transition-all duration-150 origin-bottom"
      >
        <span class="block bg-gray-900 text-white text-[11px] leading-relaxed rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden">
          <span class="block px-3 py-2 bg-indigo-600/20 border-b border-gray-700/50 font-black uppercase tracking-wider text-[10px] text-indigo-100">
            {{ titulo }}
          </span>
          <span class="block px-3 py-2.5">
            <span v-if="paraQue" class="block mb-1.5">
              <span class="font-black text-indigo-300">Para qué sirve:</span> {{ paraQue }}
            </span>
            <span v-if="comoSeMide" class="block">
              <span class="font-black text-emerald-300">Cómo se mide:</span> {{ comoSeMide }}
            </span>
          </span>
        </span>
        <span class="block w-0 h-0 mx-auto border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-900"></span>
      </span>
    </span>
  </span>
</template>

<script setup>
defineProps({
  titulo:      { type: String, required: true },
  paraQue:     { type: String, default: '' },
  comoSeMide:  { type: String, default: '' },
})
</script>