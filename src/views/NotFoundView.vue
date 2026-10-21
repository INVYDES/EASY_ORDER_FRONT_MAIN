<template>
  <main class="min-h-screen bg-gray-50 dark:bg-[#0b1220] flex items-center justify-center px-6 py-16 transition-colors">
    <div class="w-full max-w-2xl text-center">
      <div class="flex items-center justify-between mb-10">
        <router-link to="/" class="inline-flex items-center gap-2 no-underline" aria-label="eOrder — Ir al inicio">
          <span class="text-2xl font-black tracking-tighter text-gray-900 dark:text-slate-100"><i class="not-italic text-[#245C4F]">e</i>Order</span>
          <small class="text-[10px] uppercase tracking-[0.3em] text-gray-400">Easy Order</small>
        </router-link>
        <PreferenciasControl />
      </div>

      <p class="mt-10 text-[110px] sm:text-[150px] leading-none font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#245C4F] via-[#1D4A3F] to-[#26734D] animate-float">
        404
      </p>

      <h1 class="mt-2 text-2xl sm:text-3xl font-black text-gray-900 dark:text-slate-100">No encontramos esta página</h1>
      <p class="mt-3 text-gray-500 dark:text-slate-400">
        Puede que el enlace esté roto, que la página se haya movido o que nunca haya existido.
        Tu operación sigue intacta — elige por dónde continuar.
      </p>

      <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <router-link to="/"
          class="px-6 py-3 rounded-2xl bg-[#245C4F] text-white text-sm font-black hover:bg-[#1D4A3F] hover:-translate-y-0.5 active:translate-y-0 transition shadow-lg shadow-emerald-900/10 cursor-pointer">
          Volver al inicio
        </router-link>
        <router-link to="/planes"
          class="px-6 py-3 rounded-2xl bg-white dark:bg-white/10 text-gray-700 dark:text-slate-200 text-sm font-bold border border-gray-200 dark:border-white/15 hover:bg-gray-50 dark:hover:bg-white/20 transition cursor-pointer">
          Ver planes
        </router-link>
        <button type="button" @click="regresar"
          class="px-6 py-3 rounded-2xl bg-white dark:bg-white/10 text-gray-700 dark:text-slate-200 text-sm font-bold border border-gray-200 dark:border-white/15 hover:bg-gray-50 dark:hover:bg-white/20 transition cursor-pointer">
          Regresar
        </button>
      </div>

      <div class="mt-12 pt-8 border-t border-gray-100 dark:border-white/10">
        <p class="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-3">Enlaces frecuentes</p>
        <nav class="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
          <router-link to="/login" class="text-[#245C4F] hover:text-[#1D4A3F] hover:underline font-semibold">Iniciar sesión</router-link>
          <router-link to="/registro/dueno" class="text-[#245C4F] hover:text-[#1D4A3F] hover:underline font-semibold">Crear cuenta</router-link>
          <router-link to="/terminos-y-condiciones" class="text-[#245C4F] hover:text-[#1D4A3F] hover:underline font-semibold">Términos y condiciones</router-link>
          <router-link to="/politica-de-seguridad" class="text-[#245C4F] hover:text-[#1D4A3F] hover:underline font-semibold">Política de seguridad</router-link>
        </nav>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useSeo } from '@/composables/useSeo'
import { ROUTE_SEO } from '@/config/seo'
import PreferenciasControl from '@/components/PreferenciasControl.vue'

useSeo(ROUTE_SEO['/404'])

const router = useRouter()
/** Regresa a la página anterior si hay historial; si no, al inicio. */
const regresar = () => {
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-14px); }
}
.animate-float { animation: float 5s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .animate-float { animation: none; }
}
</style>
