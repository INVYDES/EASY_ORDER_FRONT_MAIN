<template>
  <!--
    Esqueletos de carga para las páginas públicas (landing, planes, contacto).
    Se muestran mientras el chunk de la ruta llega por red (ver App.vue con
    defineAsyncComponent). Reflejan la estructura aproximada de cada página
    para que la transición al contenido real sea imperceptible.

    Tamaños pensados para desktop y móvil: los anchos son fluidos y la
    altura de cada bloque se ajusta con utilidades responsive.
  -->
  <div v-if="variante === 'landing'" class="sk-page" aria-hidden="true">
    <div class="sk-bar"></div>
    <div class="sk-wrap">
      <div class="sk-hero">
        <div class="sk-block" style="width: 180px; height: 26px"></div>
        <div class="sk-block" style="width: 78%; height: 44px"></div>
        <div class="sk-block" style="width: 90%; height: 16px"></div>
        <div class="sk-block" style="width: 62%; height: 16px"></div>
        <div class="sk-row">
          <div class="sk-block" style="width: 220px; height: 48px; border-radius: 12px"></div>
          <div class="sk-block" style="width: 160px; height: 48px; border-radius: 12px"></div>
        </div>
      </div>
      <div class="sk-grid">
        <div v-for="i in 6" :key="i" class="sk-card"></div>
      </div>
      <div class="sk-table"></div>
    </div>
  </div>

  <div v-else class="sk-page" aria-hidden="true">
    <div class="sk-bar"></div>
    <div class="sk-wrap">
      <div class="sk-hero sk-hero--center">
        <div class="sk-block" style="width: 220px; height: 24px"></div>
        <div class="sk-block" style="width: 65%; height: 40px"></div>
        <div class="sk-block" style="width: 80%; height: 14px"></div>
      </div>
      <div class="sk-grid sk-grid--wide">
        <div v-for="i in 6" :key="i" class="sk-card sk-card--tall"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** 'landing' replica la landing; 'pagina' replica planes/contacto. */
  variante?: 'landing' | 'pagina'
}>()
</script>

<style scoped>
.sk-page {
  min-height: 100vh;
  background: #fff;
  overflow: hidden;
}
.sk-bar {
  height: 64px;
  border-bottom: 1px solid #eef2f7;
  background:
    linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%);
  background-size: 400% 100%;
  animation: sk-shimmer 1.3s ease-in-out infinite;
}
.sk-wrap {
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px 20px;
}
.sk-hero {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
}
.sk-hero--center {
  align-items: center;
  text-align: center;
}
.sk-row {
  display: flex;
  gap: 12px;
}
.sk-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}
.sk-grid--wide {
  grid-template-columns: repeat(3, 1fr);
}
.sk-card {
  height: 140px;
  border-radius: 16px;
  background:
    linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%);
  background-size: 400% 100%;
  animation: sk-shimmer 1.3s ease-in-out infinite;
}
.sk-card--tall {
  height: 300px;
}
.sk-card:nth-child(2), .sk-table { animation-delay: .12s; }
.sk-card:nth-child(3) { animation-delay: .24s; }
.sk-card:nth-child(4) { animation-delay: .06s; }
.sk-card:nth-child(5) { animation-delay: .18s; }
.sk-card:nth-child(6) { animation-delay: .3s; }
.sk-table {
  height: 220px;
  border-radius: 14px;
  background:
    linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%);
  background-size: 400% 100%;
  animation: sk-shimmer 1.3s ease-in-out infinite;
}

/* Bloques con el mismo shimmer, ancho/altura por estilo inline */
.sk-block {
  border-radius: 10px;
  background:
    linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%);
  background-size: 400% 100%;
  animation: sk-shimmer 1.3s ease-in-out infinite;
}

@keyframes sk-shimmer {
  0%   { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

/* Modo oscuro: la clase .tema-oscuro vive en <html> (src/utils/tema.ts) */
html.tema-oscuro .sk-page { background: #0b1220; }
html.tema-oscuro .sk-bar,
html.tema-oscuro .sk-card,
html.tema-oscuro .sk-table,
html.tema-oscuro .sk-block {
  background:
    linear-gradient(90deg, #16233c 25%, #1e2c47 37%, #16233c 63%);
  background-size: 400% 100%;
}
html.tema-oscuro .sk-bar { border-bottom-color: rgba(255, 255, 255, .08); }

@media (max-width: 900px) {
  .sk-grid, .sk-grid--wide { grid-template-columns: repeat(2, 1fr); }
  .sk-card--tall { height: 220px; }
}
@media (max-width: 650px) {
  .sk-grid, .sk-grid--wide { grid-template-columns: 1fr; }
  .sk-card--tall { height: 170px; }
}

@media (prefers-reduced-motion: reduce) {
  .sk-bar, .sk-card, .sk-table, .sk-block { animation: none; }
}
</style>
