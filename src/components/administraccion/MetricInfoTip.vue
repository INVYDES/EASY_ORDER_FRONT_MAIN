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
        class="fixed z-[9999] pointer-events-none transition-opacity duration-150"
        :style="{
          left: pos.x + 'px',
          top: pos.y + 'px',
          width: tipWidth + 'px',
          maxWidth: 'calc(100vw - 24px)',
          transform: isFlipped ? 'translateX(-50%)' : 'translateX(-50%) translateY(-100%)'
        }"
      >
        <!-- Flecha arriba si el tooltip está ubicado debajo del trigger -->
        <div
          v-if="isFlipped"
          class="w-0 h-0 mb-[-1px]"
          :style="{
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: '6px solid #19483D',
            marginLeft: 'calc(50% + ' + arrowOffset + 'px - 6px)'
          }"
        ></div>

        <div class="bg-[#202723] text-white text-[12px] leading-relaxed rounded-lg shadow-xl border border-[#3A453F] overflow-hidden">
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

        <!-- Flecha abajo si el tooltip está ubicado arriba del trigger -->
        <div
          v-if="!isFlipped"
          class="w-0 h-0 mt-[-1px]"
          :style="{
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #202723',
            marginLeft: 'calc(50% + ' + arrowOffset + 'px - 6px)'
          }"
        ></div>
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
const isFlipped = ref(false)
const arrowOffset = ref(0)
const tipWidth = ref(320)
const pos = ref({ x: 0, y: 0 })

const show = () => {
  const el = triggerEl.value
  if (!el) return

  const r = el.getBoundingClientRect()
  const triggerCenterX = r.left + r.width / 2

  // Ancho deseado ajustado a pantallas móviles o de escritorio
  const desiredWidth = Math.min(320, window.innerWidth - 32)
  tipWidth.value = desiredWidth
  const halfWidth = desiredWidth / 2
  const pad = 16

  // Asegura que el cuadro no se salga por la derecha ni por la izquierda
  const clampedX = Math.max(halfWidth + pad, Math.min(window.innerWidth - halfWidth - pad, triggerCenterX))

  // Alinea la flecha con el botón (i)
  const offset = triggerCenterX - clampedX
  arrowOffset.value = Math.max(-halfWidth + 20, Math.min(halfWidth - 20, offset))

  // Si no hay suficiente espacio arriba (menos de 230px), mostrar hacia abajo
  const placeBelow = r.top < 230
  isFlipped.value = placeBelow

  pos.value = {
    x: clampedX,
    y: placeBelow ? r.bottom + 8 : r.top - 8
  }

  visible.value = true
}

const hide = () => {
  visible.value = false
}
</script>
