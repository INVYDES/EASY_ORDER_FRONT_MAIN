<template>
  <div v-if="anuncios.length > 0" class="w-full overflow-hidden" :class="wrapClass">

    <!-- Banda superior decorativa -->
    <div class="h-1 w-full" :class="accentClass"></div>

    <div class="flex items-stretch">

      <!-- Track deslizante (Ocupa todo el ancho) -->
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
            <!-- IMAGEN DEL PRODUCTO / COMBO O EMOJI -->
            <div v-if="(a.producto || a.paquete)?.imagen" class="w-14 h-14 ml-6 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg flex-shrink-0 bg-white dark:bg-gray-800/10 backdrop-blur-sm">
              <img :src="resolveImageUrl((a.producto || a.paquete).imagen)" class="w-full h-full object-cover" @error="onImageError" />
            </div>
            <span v-else class="text-4xl ml-6 drop-shadow-md">{{ a.emoji || '📢' }}</span>

            <div class="flex flex-col justify-center ml-4">
              <div class="flex items-center gap-2">
                <span class="font-black text-xl tracking-tight uppercase">{{ a.titulo }}</span>
                <span v-if="a.tipo === 'promo' && a.precio_promo" class="bg-white dark:bg-gray-800 text-black px-2 py-0.5 rounded-lg text-xs font-black shadow-sm border border-black/5">
                  ${{ Number(a.precio_promo).toFixed(2) }}
                </span>
                <!-- BADGE DYNAMIC COLOR FOR TYPE -->
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shadow-sm animate-pulse"
                  :class="getAnuncioColorClass(a.color)"
                >
                  {{ a.tipo === 'producto' ? 'PLATO' : a.tipo }}
                </span>
              </div>
              <p v-if="a.contenido" class="text-sm opacity-90 font-bold leading-none mt-1 max-w-[350px] truncate">{{ a.contenido }}</p>
            </div>

            <!-- SEPARADOR -->
            <div class="mx-6 text-white/30 text-xs">✦</div>
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
import { apiClient } from '@/utils/apiClient'

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

const badgePrecioClass = computed(() => ({
  dark:  'bg-yellow-400 text-black border-yellow-300',
  light: 'bg-indigo-600 text-white border-indigo-500',
  color: 'bg-white text-purple-700 border-white/50',
  amber: 'bg-white text-orange-700 border-white/50',
}[props.variant] || 'bg-yellow-400 text-black border-yellow-300'))

// Mapeo del color del badge de cada anuncio individual según lo seleccionado en el formulario
const getAnuncioColorClass = (color) => {
  const map = {
    indigo:  'bg-indigo-500 text-white shadow-sm border border-indigo-400',
    emerald: 'bg-emerald-500 text-white shadow-sm border border-emerald-400',
    amber:   'bg-amber-500 text-white shadow-sm border border-amber-400',
    rose:    'bg-rose-500 text-white shadow-sm border border-rose-400',
    blue:    'bg-blue-500 text-white shadow-sm border border-blue-400',
    purple:  'bg-purple-500 text-white shadow-sm border border-purple-400',
  }
  return map[color] || 'bg-indigo-500 text-white shadow-sm border border-indigo-400'
}

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
const resolveImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  
  // Quitamos "storage/" del inicio si el backend ya lo incluyó
  const cleanPath = path.replace(/^\/?storage\//, '')
  
  // Limpiamos la URL base de forma agresiva
  let base = (props.apiUrl || '')
    .split('/api')[0]
    .split('/index.php')[0]
  
  // Nos aseguramos de que no termine en / para controlarlo nosotros
  if (base.endsWith('/')) base = base.slice(0, -1)
  
  // La ruta final debe ser: su-dominio.com/cws/eorder/backend/public/storage/ruta-imagen.webp
  return `${base}/storage/${cleanPath}`
}

const onImageError = (e) => {
  e.target.style.display = 'none'
  // Si falla la imagen, podríamos mostrar un emoji de respaldo aquí si quisiéramos
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
    const params = {}
    if (props.tipo === 'cliente') {
      params.mostrar_cliente = 1
    } else {
      params.mostrar_interno = 1
    }

    if (props.restauranteId) {
      params.restaurante_id = props.restauranteId
    }

    const response = await apiClient.get('/anuncios', { params })
    
    let lista = []
    if (response) {
      if (Array.isArray(response)) {
        lista = response
      } else if (Array.isArray(response.data)) {
        lista = response.data
      }
    }

    if (Array.isArray(lista)) {
      anuncios.value = lista.filter(a => {
        const esVigente = a.activo && (a.vigente !== false && a.es_vigente !== false);
        if (props.tipo === 'cliente') {
          return esVigente && a.mostrar_cliente;
        } else {
          return esVigente && a.mostrar_interno;
        }
      })
      await nextTick()
      setTimeout(() => { calculateWidth(); offsetPx.value = 0; startAnimation() }, 60)
    }
  } catch (err) {
    console.error('Error al cargar la marquesina:', err)
  }
}

// ── RESIZE ─────────────────────────────────────────────────
const handleResize = () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => { calculateWidth() }, 150)
}

watch(() => props.restauranteId, () => {
  fetchAnuncios()
})

watch(() => props.tipo, () => {
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