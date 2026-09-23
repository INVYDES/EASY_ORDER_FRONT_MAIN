<template>
  <div class="pref" :class="{ 'pref-oscuro': oscuro }" role="group" :aria-label="t('pref.idioma')">
    <button
      v-for="opcion in idiomas"
      :key="opcion.id"
      type="button"
      class="pref-btn pref-lang"
      :class="{ on: idioma === opcion.id }"
      :lang="opcion.id"
      :aria-pressed="idioma === opcion.id"
      :title="opcion.label"
      @click="setIdioma(opcion.id)"
    >
      {{ opcion.etiqueta }}
    </button>

    <button
      type="button"
      class="pref-btn pref-tema"
      :aria-pressed="oscuro"
      :aria-label="oscuro ? t('pref.modoClaro') : t('pref.modoOscuro')"
      :title="oscuro ? t('pref.modoClaro') : t('pref.modoOscuro')"
      @click="alternarTema"
    >
      <span aria-hidden="true">{{ oscuro ? '☀️' : '🌙' }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { usePreferencias } from '@/stores/preferencias'

const { idioma, oscuro, idiomas, t, setIdioma, alternarTema } = usePreferencias()
</script>

<style scoped>
.pref {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 3px;
}

.pref-btn {
  display: inline-grid;
  place-items: center;
  min-width: 34px;
  min-height: 30px;
  padding: 0 9px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #475569;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .03em;
  cursor: pointer;
  transition: background .18s ease, color .18s ease, box-shadow .18s ease, transform .18s ease;
}

.pref-btn:hover { background: #e2e8f0; color: #4f46e5; }
.pref-btn:active { transform: scale(.94); }
.pref-btn:focus-visible { outline: 2px solid #4f46e5; outline-offset: 2px; }

.pref-lang.on {
  background: #4f46e5;
  color: #fff;
  box-shadow: 0 4px 12px rgba(79, 70, 229, .3);
}

.pref-tema { font-size: 14px; padding: 0 7px; }

/* Modo oscuro: el propio componente conoce el tema, así que no depende de la landing. */
.pref-oscuro {
  background: rgba(255, 255, 255, .07);
  border-color: rgba(255, 255, 255, .14);
}
.pref-oscuro .pref-btn { color: #cbd5e1; }
.pref-oscuro .pref-btn:hover { background: rgba(255, 255, 255, .12); color: #fff; }
.pref-oscuro .pref-lang.on { background: #6366f1; color: #fff; }

@media (prefers-reduced-motion: reduce) {
  .pref-btn { transition: none; }
}
</style>
