<template>
  <main class="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-[#0b1220] dark:to-[#0f1a2e] flex items-center justify-center px-6 py-16 transition-colors">
    <div class="w-full max-w-2xl text-center">
      <div class="flex items-center justify-between mb-6">
        <router-link to="/" class="inline-flex items-center gap-2 no-underline" aria-label="eOrder — Ir al inicio">
          <span class="text-2xl font-black tracking-tighter text-gray-900 dark:text-slate-100"><i class="not-italic text-indigo-600 dark:text-indigo-400">e</i>Order</span>
        </router-link>
        <PreferenciasControl />
      </div>

      <div class="mx-auto w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center animate-pop">
        <svg class="w-10 h-10 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path class="tick" d="M20 6 9 17l-5-5" />
        </svg>
      </div>

      <h1 class="mt-6 text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-slate-100">¡Gracias! Ya recibimos tu solicitud</h1>
      <p class="mt-3 text-gray-500 dark:text-slate-400">
        Un especialista de eOrder revisará tu información y te contactará por el medio que elegiste,
        normalmente en menos de 24 horas hábiles.
      </p>

      <div class="mt-10 text-left bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm p-6 sm:p-8 space-y-5">
        <h2 class="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Qué sigue</h2>

        <div v-for="paso in pasos" :key="paso.n" class="flex gap-4">
          <span class="shrink-0 w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-black text-sm flex items-center justify-center">
            {{ paso.n }}
          </span>
          <div>
            <p class="text-sm font-bold text-gray-800 dark:text-slate-200">{{ paso.titulo }}</p>
            <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{{ paso.detalle }}</p>
          </div>
        </div>

        <p class="pt-4 border-t border-gray-100 dark:border-white/10 text-xs text-gray-400 dark:text-slate-500">
          ¿Urgente? Escríbenos por WhatsApp desde
          <router-link to="/contactanos" class="text-indigo-600 dark:text-indigo-400 hover:underline">la página de contacto</router-link>
          y te atendemos en el momento.
        </p>
      </div>

      <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <router-link to="/planes"
          class="px-6 py-3 rounded-2xl bg-gray-900 dark:bg-indigo-600 text-white text-sm font-black hover:bg-gray-800 dark:hover:bg-indigo-500 hover:-translate-y-0.5 active:translate-y-0 transition shadow-lg shadow-gray-200 dark:shadow-none">
          Ver planes y precios
        </router-link>
        <router-link to="/"
          class="px-6 py-3 rounded-2xl bg-white dark:bg-white/10 text-gray-700 dark:text-slate-200 text-sm font-bold border border-gray-200 dark:border-white/15 hover:bg-gray-50 dark:hover:bg-white/20 transition">
          Volver al inicio
        </router-link>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useSeo } from '@/composables/useSeo'
import { ROUTE_SEO } from '@/config/seo'
import PreferenciasControl from '@/components/PreferenciasControl.vue'

useSeo(ROUTE_SEO['/gracias'])

const pasos = [
  { n: 1, titulo: 'Revisamos tu solicitud', detalle: 'Confirmamos tus datos y el tipo de operación de tu restaurante.' },
  { n: 2, titulo: 'Agendamos tu demo', detalle: 'Te mostramos el sistema con un caso parecido al tuyo, sin costo y sin compromiso.' },
  { n: 3, titulo: 'Arrancas cuando quieras', detalle: 'Configuramos tu menú, mesas y usuarios para que empieces a operar el mismo día.' },
]
</script>

<style scoped>
@keyframes pop {
  0%   { transform: scale(0.6); opacity: 0; }
  60%  { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); }
}
.animate-pop { animation: pop 0.5s ease-out both; }

@keyframes draw { to { stroke-dashoffset: 0; } }
.tick { stroke-dasharray: 24; stroke-dashoffset: 24; animation: draw 0.5s ease-out 0.3s forwards; }

@media (prefers-reduced-motion: reduce) {
  .animate-pop, .tick { animation: none; stroke-dashoffset: 0; }
}
</style>
