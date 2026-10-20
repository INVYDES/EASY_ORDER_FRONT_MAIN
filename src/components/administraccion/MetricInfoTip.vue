<template>
  <span class="relative inline-flex align-middle">
    <span
      ref="triggerEl"
      tabindex="0"
      class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#E8F1ED] text-[#245C4F] text-[10px] font-semibold leading-none cursor-help select-none outline-none hover:bg-[#245C4F] hover:text-white transition-colors"
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
        class="fixed z-[9999] pointer-events-none w-72 sm:w-80 max-w-[92vw] -translate-x-1/2 -translate-y-full transition-opacity duration-150"
        :style="{ left: pos.x + 'px', top: pos.y + 'px' }"
      >
        <div class="bg-[#202723] text-white text-[12px] leading-relaxed rounded-lg shadow-md border border-[#3A453F] overflow-hidden">
          <div class="px-3 py-2 bg-[#19483D] border-b border-[#3A453F] font-semibold uppercase tracking-wider text-[10px] text-[#E8F1ED]">
            {{ titulo }}
          </div>
          <div class="px-3 py-2.5 space-y-2">
            <div v-if="paraQue">
              <span class="font-medium text-[#E8F1ED]">Para qué sirve:</span> <span class="text-[#F6F7F5]">{{ paraQue }}</span>
            </div>
            <div v-if="comoSeMide">
              <span class="font-medium text-[#98C2B3]">Cómo se mide:</span> <span class="text-[#DDE3DE]">{{ comoSeMide }}</span>
            </div>
          </div>
        </div>
        <div class="w-0 h-0 mx-auto border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-[#202723]"></div>
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
    const targetX = Math.max(160, Math.min(window.innerWidth - 160, r.left + r.width / 2))
    pos.value = { x: targetX, y: r.top - 8 }
  }
  visible.value = true
}

const hide = () => { visible.value = false }
</script>
