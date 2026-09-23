<template>
  <Transition name="fade">
    <button v-if="visible" type="button" @click="subir" aria-label="Volver arriba" title="Volver arriba"
      class="back-to-top group">
      <svg class="w-5 h-5 transition-transform group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

// Se muestra cuando el usuario ya recorrió buena parte de la página.
const UMBRAL = 420

const visible = ref(false)

const alScroll = () => {
  visible.value = window.scrollY > UMBRAL
}

const subir = () => {
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reducido ? 'auto' : 'smooth' })
}

onMounted(() => {
  alScroll()
  window.addEventListener('scroll', alScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', alScroll)
})
</script>

<style scoped>
/* Por encima del botón del chatbot (que está en bottom:24px, right:24px) */
.back-to-top {
  position: fixed;
  bottom: 104px;
  right: 24px;
  z-index: 900;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: #ffffff;
  color: #4f46e5;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.back-to-top:hover {
  background: #4f46e5;
  color: #ffffff;
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(79, 70, 229, 0.35);
}

.back-to-top:active {
  transform: translateY(0);
}

.back-to-top:focus-visible {
  outline: 3px solid rgba(79, 70, 229, 0.45);
  outline-offset: 2px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 640px) {
  .back-to-top {
    bottom: 96px;
    right: 16px;
    width: 40px;
    height: 40px;
  }
}

@media print {
  .back-to-top { display: none; }
}
</style>
