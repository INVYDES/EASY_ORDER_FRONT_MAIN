<template>
  <div
    class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#202723]/50"
    @click.self="close"
  >
    <div class="bg-white rounded-xl shadow-xl border border-[#DDE3DE] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="px-6 py-5 border-b border-[#DDE3DE] bg-[#F6F7F5] flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-lg shrink-0">
            <i class="fa-solid fa-circle-question"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-[#202723] leading-tight">Dudas y Ayuda</h3>
            <p class="text-xs text-[#68736C] mt-0.5">
              Estás en: <span class="text-[#202723] font-semibold">{{ titulo }}</span> · lectura rápida 1–2 min
            </p>
          </div>
        </div>
        <button @click="close" class="w-8 h-8 rounded-lg hover:bg-[#F0F2EF] text-[#68736C] hover:text-[#202723] flex items-center justify-center text-sm transition shrink-0 cursor-pointer">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-4 overflow-y-auto">
        <div
          v-for="(sec, i) in secciones"
          :key="i"
          class="rounded-xl border border-[#DDE3DE] bg-[#F6F7F5] p-5 space-y-2.5"
        >
          <div class="flex items-center gap-2.5">
            <span class="w-8 h-8 rounded-lg bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-sm font-bold shrink-0">
              {{ sec.icon || 'i' }}
            </span>
            <p class="text-sm font-bold text-[#202723]">{{ sec.titulo }}</p>
          </div>

          <p class="text-sm leading-relaxed text-[#202723]">{{ sec.texto }}</p>

          <ul v-if="sec.lista && sec.lista.length" class="space-y-1.5 pt-1">
            <li v-for="(item, j) in sec.lista" :key="j"
              class="flex gap-2 bg-white border border-[#DDE3DE] rounded-lg px-3.5 py-2 text-xs leading-relaxed text-[#202723]">
              <span class="text-[#245C4F] font-bold shrink-0">•</span>
              <span>{{ item }}</span>
            </li>
          </ul>

          <div v-if="sec.formula" class="inline-block bg-white border border-[#DDE3DE] rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-[#245C4F]">
            {{ sec.formula }}
          </div>

          <p v-if="sec.nota" class="text-xs leading-relaxed text-[#A96517] bg-[#FEF7EC] border border-[#A96517]/20 rounded-lg px-3.5 py-2">
            {{ sec.nota }}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-[#F6F7F5] border-t border-[#DDE3DE] flex items-center justify-between gap-3 shrink-0">
        <p class="text-xs text-[#68736C] font-medium">{{ secciones.length }} conceptos clave</p>
        <button @click="close" class="px-6 py-2 bg-[#245C4F] hover:bg-[#19483D] text-white text-xs font-semibold rounded-lg transition cursor-pointer">
          Entendido
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  titulo:      { type: String, required: true },
  secciones:   { type: Array,  default: () => [] },
})

const emit = defineEmits(['close'])
const close = () => emit('close')
</script>