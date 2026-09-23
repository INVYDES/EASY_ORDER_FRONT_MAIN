<template>
  <div class="route-progress" :class="{ 'route-progress--activo': cargando }" aria-hidden="true">
    <span :style="{ width: progreso + '%' }"></span>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const cargando = ref(false)
const progreso = ref(0)
let avance: number | undefined
let cierre: number | undefined

const iniciar = () => {
  if (cierre) window.clearTimeout(cierre)
  cargando.value = true
  progreso.value = progreso.value > 0 ? progreso.value : 10

  window.clearInterval(avance)
  // Avanza rápido al principio y se va frenando cerca del final
  avance = window.setInterval(() => {
    progreso.value = Math.min(progreso.value + Math.max(1, (92 - progreso.value) * 0.14), 92)
  }, 160)
}

const terminar = () => {
  window.clearInterval(avance)
  progreso.value = 100
  cierre = window.setTimeout(() => {
    cargando.value = false
    progreso.value = 0
  }, 280)
}

const quitarInicio = router.beforeEach(() => { iniciar() })
const quitarFin = router.afterEach(() => { terminar() })
const quitarError = router.onError(() => { terminar() })

onUnmounted(() => {
  quitarInicio()
  quitarFin()
  quitarError()
  window.clearInterval(avance)
  if (cierre) window.clearTimeout(cierre)
})
</script>

<style scoped>
.route-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 2000;
  pointer-events: none;
  opacity: 0;
  transition: opacity .2s ease;
}

.route-progress--activo {
  opacity: 1;
}

.route-progress span {
  display: block;
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, #4f46e5, #7c3aed, #db2777);
  border-radius: 0 3px 3px 0;
  box-shadow: 0 0 10px rgba(79, 70, 229, .55);
  transition: width .2s ease;
}

@media (prefers-reduced-motion: reduce) {
  .route-progress span { transition: none; }
}
</style>
