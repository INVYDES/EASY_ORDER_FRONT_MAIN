<template>
  <div
    class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
    @click.self="close"
  >
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in duration-200 max-h-[92vh] flex flex-col">
      <!-- Header -->
      <div class="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-violet-700 text-white flex items-center justify-between shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-3xl shrink-0">
            <i class="fa-solid fa-circle-question"></i>
          </div>
          <div>
            <h3 class="text-2xl font-black leading-tight">Dudas y Ayuda</h3>
            <p class="text-sm text-indigo-100 font-bold mt-1">
              Estás en: <span class="text-white font-black">{{ titulo }}</span> · lectura rápida 1–2 min
            </p>
          </div>
        </div>
        <button @click="close" class="w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl transition shrink-0 cursor-pointer">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="p-8 space-y-4 overflow-y-auto">
        <div
          v-for="(sec, i) in secciones"
          :key="i"
          class="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6 space-y-2.5 hover:border-indigo-300 transition"
        >
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl shrink-0">
              {{ sec.icon || '❓' }}
            </span>
            <p class="text-lg font-black text-gray-800">{{ sec.titulo }}</p>
          </div>

          <p class="text-base leading-relaxed text-gray-700">{{ sec.texto }}</p>

              <ul v-if="sec.lista && sec.lista.length" class="space-y-2">
                <li v-for="(item, j) in sec.lista" :key="j"
                  class="flex gap-2.5 bg-white/80 border border-indigo-100 rounded-xl px-4 py-2.5 text-base leading-relaxed text-gray-700">
                  <span class="text-indigo-500 font-black shrink-0 mt-0.5">•</span>
                  <span>{{ item }}</span>
                </li>
              </ul>

              <div v-if="sec.formula" class="inline-block bg-white border-2 border-indigo-200 rounded-xl px-4 py-2 text-base font-bold text-indigo-700">
                {{ sec.formula }}
              </div>

          <p v-if="sec.nota" class="text-base leading-relaxed text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
            💡 {{ sec.nota }}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
        <p class="text-sm text-gray-400 font-medium">{{ secciones.length }} conceptos clave</p>
        <button @click="close" class="px-8 py-3 bg-indigo-600 text-white text-base font-bold rounded-xl hover:bg-indigo-700 active:scale-95 transition cursor-pointer">
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