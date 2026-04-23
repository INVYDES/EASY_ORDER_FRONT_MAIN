<template>
  <div v-if="anuncios.length > 0" class="w-full overflow-hidden" :class="wrapClass">

    <!-- Banda superior decorativa -->
    <div class="h-1 w-full" :class="accentClass"></div>

    <div class="flex items-stretch">

      <!-- Label lateral fijo -->
      <div
        class="shrink-0 flex flex-col items-center justify-center px-4 py-2 gap-1 border-r"
        :class="labelClass"
      >
        <span class="text-2xl leading-none animate-bounce-slow">{{ labelEmoji }}</span>
        <span class="text-[10px] font-black uppercase tracking-widest leading-none">{{ labelTexto }}</span>
      </div>

      <!-- Track deslizante -->
      <div class="flex-1 overflow-hidden relative flex items-center py-2.5">
        <div
          ref="track"
          class="flex items-center gap-0 whitespace-nowrap"
          style="will-change: transform; backface-visibility: hidden;"
          :style="{ transform: `translateX(${offsetPx}px)` }"
        >
          <span
            v-for="(a, i) in loopedAnuncios"
            :key="i"
            class="inline-flex items-center shrink-0"
          >
            <!-- Separador entre anuncios -->
            <span class="mx-5 text-lg opacity-30">✦</span>

            <!-- Emoji grande -->
            <span class="text-2xl mr-2 leading-none">{{ a.emoji || '📢' }}</span>

            <!-- Contenido -->
            <span class="inline-flex flex-col leading-tight">
              <span class="text-base font-black tracking-wide">{{ a.titulo }}</span>
              <span v-if="a.contenido" class="text-xs font-medium opacity-75 leading-tight">{{ a.contenido }}</span>
            </span>

            <!-- Badge precio promo -->
            <span
              v-if="a.precio_promo"
              class="ml-3 px-2.5 py-1 rounded-full text-sm font-black border-2"
              :class="badgePrecioClass"
            >
              ${{ Number(a.precio_promo).toFixed(2) }}
            </span>

            <!-- Badge tipo -->
            <span
              class="ml-3 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
              :class="badgeTipoClass(a.tipo)"
            >
              {{ tipoLabel(a.tipo) }}
            </span>
          </span>
        </div>
      </div>

    </div>

    <!-- Banda inferior decorativa -->
    <div class="h-0.5 w-full opacity-30" :class="accentClass"></div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  apiUrl:        { type: String,   required: true },
  getHeaders:    { type: Function, required: true },
  tipo:          { type: String,   default: 'cliente' },
  variant:       { type: String,   default: 'dark' },  // dark | light | color | amber
  restauranteId: { type: [Number, String], default: null },
})

const anuncios = ref([])
const track    = ref(null)
const offsetPx = ref(0)

let animFrame       = null
let refreshInterval = null
let resizeObserver  = null
let resizeTimeout   = null

const SPEED = 0.9   // px por frame ~60fps
let originalWidth = 0

// ── LOOP ───────────────────────────────────────────────────
const loopedAnuncios = computed(() => {
  if (!anuncios.value.length) return []
  return [...anuncios.value, ...anuncios.value, ...anuncios.value]
})

// ── CLASES SEGÚN VARIANTE ──────────────────────────────────
const wrapClass = computed(() => ({
  dark:  'bg-gray-950 text-white shadow-lg',
  light: 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-900 shadow-sm border-b border-indigo-100',
  color: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg',
  amber: 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-lg',
}[props.variant] || 'bg-gray-950 text-white shadow-lg'))

const accentClass = computed(() => ({
  dark:  'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
  light: 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400',
  color: 'bg-white/30',
  amber: 'bg-white/40',
}[props.variant] || 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'))

const labelClass = computed(() => ({
  dark:  'border-white/10 bg-white/5 text-white',
  light: 'border-indigo-200 bg-indigo-100/60 text-indigo-700',
  color: 'border-white/20 bg-white/10 text-white',
  amber: 'border-white/20 bg-white/10 text-white',
}[props.variant] || 'border-white/10 bg-white/5 text-white'))

const badgePrecioClass = computed(() => ({
  dark:  'bg-yellow-400 text-black border-yellow-300',
  light: 'bg-indigo-600 text-white border-indigo-500',
  color: 'bg-white text-purple-700 border-white/50',
  amber: 'bg-white text-orange-700 border-white/50',
}[props.variant] || 'bg-yellow-400 text-black border-yellow-300'))

const labelEmoji = computed(() => ({
  dark: '📢', light: '🎉', color: '✨', amber: '🔥',
}[props.variant] || '📢'))

const labelTexto = computed(() => ({
  dark: 'Avisos', light: 'Novedades', color: 'Promos', amber: 'Ofertas',
}[props.variant] || 'Avisos'))

const badgeTipoClass = (tipo) => {
  const base = {
    dark:  { promo: 'bg-pink-500/80 text-white',   producto: 'bg-indigo-500/80 text-white',  aviso: 'bg-gray-600 text-gray-200' },
    light: { promo: 'bg-pink-100 text-pink-700',   producto: 'bg-indigo-100 text-indigo-700', aviso: 'bg-gray-100 text-gray-600' },
    color: { promo: 'bg-white/20 text-white',       producto: 'bg-white/20 text-white',        aviso: 'bg-white/10 text-white/80' },
    amber: { promo: 'bg-white/20 text-white',       producto: 'bg-white/20 text-white',        aviso: 'bg-white/10 text-white/80' },
  }
  return (base[props.variant] || base.dark)[tipo] || (base[props.variant] || base.dark).aviso
}

const tipoLabel = (tipo) => ({ promo: '🏷 Promo', producto: '🍽 Nuevo', aviso: 'ℹ Aviso' }[tipo] || 'ℹ Aviso')

// ── HELPERS ────────────────────────────────────────────────
const safeGetHeaders = () => {
  try {
    if (typeof props.getHeaders === 'function') return props.getHeaders()
  } catch {}
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: token ? `Bearer ${token}` : '' }
}

// ── ANIMACIÓN ──────────────────────────────────────────────
const calculateWidth = () => {
  if (!track.value || !anuncios.value.length) return
  originalWidth = track.value.scrollWidth / 3
  if (Math.abs(offsetPx.value) >= originalWidth) offsetPx.value = 0
}

const animate = () => {
  offsetPx.value -= SPEED
  if (originalWidth > 0 && Math.abs(offsetPx.value) >= originalWidth) offsetPx.value = 0
  animFrame = requestAnimationFrame(animate)
}

const startAnimation = () => {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null }
  if (anuncios.value.length > 0) animFrame = requestAnimationFrame(animate)
}

// ── FETCH ──────────────────────────────────────────────────
const fetchAnuncios = async () => {
  try {
    const url = new URL(`${props.apiUrl}/anuncios`)
    
    // Si es tipo cliente, filtramos por mostrar_cliente, de lo contrario por mostrar_interno (Menú Digital)
    if (props.tipo === 'cliente') {
      url.searchParams.append('mostrar_cliente', '1')
    } else {
      url.searchParams.append('mostrar_interno', '1')
    }

    if (props.restauranteId) {
      url.searchParams.append('restaurante_id', props.restauranteId)
    }

    const res  = await fetch(url.toString(), { headers: safeGetHeaders() })
    if (!res.ok) return
    const data = await res.json()
    if (data.success && Array.isArray(data.data)) {
      anuncios.value = data.data.filter(a => a.activo && a.mostrar_cliente && a.vigente)
      await nextTick()
      setTimeout(() => { calculateWidth(); offsetPx.value = 0; startAnimation() }, 60)
    }
  } catch {}
}

// ── RESIZE ─────────────────────────────────────────────────
const handleResize = () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => { calculateWidth() }, 150)
}

watch(() => props.restauranteId, () => {
  fetchAnuncios()
})

watch(anuncios, (n, o) => {
  if (n.length !== o?.length) {
    nextTick(() => { calculateWidth(); offsetPx.value = 0; startAnimation() })
  }
})

onMounted(async () => {
  await fetchAnuncios()
  startAnimation()
  refreshInterval = setInterval(fetchAnuncios, 30 * 1000)
  window.addEventListener('resize', handleResize)
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => calculateWidth())
    const container = track.value?.parentElement?.parentElement
    if (container) resizeObserver.observe(container)
  }
})

onUnmounted(() => {
  if (animFrame)      cancelAnimationFrame(animFrame)
  if (refreshInterval) clearInterval(refreshInterval)
  if (resizeTimeout)  clearTimeout(resizeTimeout)
  window.removeEventListener('resize', handleResize)
  if (resizeObserver) resizeObserver.disconnect()
})
</script>

<style scoped>
/* Bounce suave para el ícono del label */
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0);    }
  50%       { transform: translateY(-4px); }
}
.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}
</style>