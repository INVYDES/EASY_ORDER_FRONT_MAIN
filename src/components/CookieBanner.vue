<template>
  <div v-if="visible" role="dialog" aria-live="polite" aria-label="Aviso de cookies"
    class="fixed bottom-0 left-0 right-0 z-[100] p-3 sm:p-4 pointer-events-none">
    <div class="mx-auto max-w-4xl bg-white/95 backdrop-blur border border-gray-200 rounded-2xl shadow-2xl p-4 sm:p-5 pointer-events-auto
                animate-slide-up">
      <div class="flex flex-col sm:flex-row sm:items-center gap-4">
        <span class="text-2xl shrink-0" aria-hidden="true">🍪</span>

        <p class="flex-1 text-xs sm:text-sm text-gray-600 leading-relaxed">
          Usamos almacenamiento propio para mantener tu sesión activa y, si lo autorizas, analítica para entender qué
          partes del sistema se usan más. Puedes cambiar de opinión cuando quieras desde
          <router-link to="/politica-de-seguridad" class="font-bold text-indigo-600 hover:underline">la política de seguridad</router-link>.
        </p>

        <div class="flex gap-2 shrink-0">
          <button type="button" @click="decidir('rechazado')"
            class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-white border border-gray-200
                   hover:bg-gray-50 hover:border-gray-300 transition-colors">
            Solo lo necesario
          </button>
          <button type="button" @click="decidir('aceptado')"
            class="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gray-900
                   hover:bg-gray-800 hover:-translate-y-0.5 active:translate-y-0 transition shadow-lg shadow-gray-200">
            Aceptar todo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

// Preferencia de cookies. No es una clave de sesión: se guarda en localStorage
// porque la decisión aplica a todo el navegador, no a una pestaña.
const CLAVE = 'eo_cookies_consent'

const visible = ref(false)

onMounted(() => {
  let guardado: string | null = null
  try { guardado = localStorage.getItem(CLAVE) } catch { /* modo privado */ }
  visible.value = !guardado
})

const decidir = (valor: 'aceptado' | 'rechazado') => {
  try { localStorage.setItem(CLAVE, valor) } catch { /* modo privado */ }
  window.dispatchEvent(new CustomEvent('eo:cookies-consent', { detail: valor }))
  visible.value = false
}
</script>

<style scoped>
@keyframes slide-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-slide-up { animation: slide-up 0.35s ease-out both; }

@media (prefers-reduced-motion: reduce) {
  .animate-slide-up { animation: none; }
}
</style>
