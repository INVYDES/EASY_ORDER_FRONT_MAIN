<template>
  <div id="app">
    <!-- Barra de progreso mientras carga la siguiente ruta -->
    <RouteProgress />

    <!--
      Transición suave entre páginas.
      Las rutas públicas perezosas (planes, contacto, legales, gracias, 404)
      muestran un esqueleto mientras llega el chunk: percibe carga instantánea
      en vez de pantalla en blanco.
    -->
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="resolverComponente(Component, route)" :key="route.path" />
      </Transition>
    </RouterView>

    <!-- Botón flotante para volver arriba -->
    <BackToTop />

    <!-- Aviso de cookies (solo aparece si no hay decisión guardada) -->
    <CookieBanner />

    <!-- Chatbot Global -->
    <ChatBotWidget />
    <NotificationComponent />
  </div>
</template>

<script setup>
import { defineAsyncComponent, h, markRaw } from 'vue'
import { useRoute } from 'vue-router'
import ChatBotWidget from './components/chat/ChatBotWidget.vue'
import NotificationComponent from './components/Notification.vue'
import CookieBanner from './components/CookieBanner.vue'
import BackToTop from './components/BackToTop.vue'
import RouteProgress from './components/RouteProgress.vue'
import EoSkeleton from './components/EoSkeleton.vue'

/**
 * Envuelve el componente de la ruta con un esqueleto mientras carga.
 * Solo aplica a las rutas públicas cargadas con import() perezoso; las
 * rutas importadas estáticamente (landing, panel) nunca "cargan" aquí.
 */
function resolverComponente(Component, route) {
  const varianteSkeleton = VARIANTE_POR_RUTA[route.path]
  if (!varianteSkeleton) return Component

  return markRaw(
    defineAsyncComponent({
      loader: async () => {
        // Pequeño respiro para que el skeleton parpadee lo mínimo necesario
        const [modulo] = await Promise.all([
          Component(),
          new Promise((res) => setTimeout(res, 120)),
        ])
        return modulo
      },
      loadingComponent: () => h(EoSkeleton, { variante: varianteSkeleton }),
      delay: 0,
    }),
  )
}

/** Qué esqueleto mostrar según la ruta pública perezosa. */
const VARIANTE_POR_RUTA = {
  '/planes': 'pagina',
  '/contactanos': 'pagina',
  '/terminos-y-condiciones': 'pagina',
  '/politica-de-seguridad': 'pagina',
  '/gracias': 'pagina',
}
</script>

<style>
/* Transición entre rutas: corta y sutil para no sentirse lenta */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
}
</style>
