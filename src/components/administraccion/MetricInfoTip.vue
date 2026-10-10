<template>
  <span class="relative inline-flex align-middle">
    <span
      ref="triggerEl"
      tabindex="0"
      class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 text-[9px] font-black leading-none cursor-help select-none outline-none"
      aria-label="Información de la métrica"
      @mouseenter="show"
      @mouseleave="hide"
      @focusin="show"
      @focusout="hide"
    >i</span>

    <!-- Cuadro informativo. Se monta en <body> con posición fija para que no lo
         recorte el overflow-hidden de las tarjetas ni lo tape otro elemento. -->
    <Teleport to="body">
      <div
        v-if="visible"
        class="fixed z-[9999] pointer-events-none w-64 -translate-x-1/2 -translate-y-full transition-opacity duration-150"
        :style="{ left: pos.x + 'px', top: pos.y + 'px' }"
      >
        <div class="bg-gray-900 text-white text-[11px] leading-relaxed rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden">
          <div class="px-3 py-2 bg-indigo-600/20 border-b border-gray-700/50 font-black uppercase tracking-wider text-[10px] text-indigo-100">
            {{ titulo }}
          </div>
          <div class="px-3 py-2.5">
            <div v-if="paraQue" class="mb-1.5">
              <span class="font-black text-indigo-300">Para qué sirve:</span> {{ paraQue }}
            </div>
            <div v-if="comoSeMide">
              <span class="font-black text-emerald-300">Cómo se mide:</span> {{ comoSeMide }}
            </div>
          </div>
        </div>
        <div class="w-0 h-0 mx-auto border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-900"></div>
      </div>
    </Teleport>
  </span>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  titulo:      { type: String, required: true },
  paraQue:     { type: String, default: '' },
  comoSeMide:  { type: String, default: '' },
})

const triggerEl = ref(null)
const visible = ref(false)
const pos = ref({ x: 0, y: 0 })

const show = () => {
  const el = triggerEl.value
  if (el) {
    const r = el.getBoundingClientRect()
    pos.value = { x: r.left + r.width / 2, y: r.top - 8 }
  }
  visible.value = true
}

const hide = () => { visible.value = false }
</script>
