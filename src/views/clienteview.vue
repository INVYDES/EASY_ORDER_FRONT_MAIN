<template>
  <div class="min-h-screen bg-gray-50">

    <!-- ══ MARQUESITA ══ -->
    <MarquesitaWidget
      :api-url="API_URL"
      :get-headers="getHeaders"
      tipo="cliente"
      :variant="vista === 'menu' ? 'color' : 'light'"
    />

    <!-- ══ VISTA: LISTA DE RESTAURANTES ══ -->
    <div v-if="vista === 'restaurantes'">

      <!-- Header -->
      <div class="bg-white border-b border-gray-100 px-5 py-4 sticky top-0 z-20">
        <h1 class="text-xl font-bold text-gray-900">¿Dónde quieres comer?</h1>
        <p class="text-gray-400 text-sm mt-0.5">Selecciona un restaurante para ver su menú</p>
        <div class="relative mt-3">
          <svg class="absolute left-3.5 top-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="busquedaRestaurante" type="text" placeholder="Buscar restaurante..."
            class="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 border-0" />
        </div>
      </div>

      <div v-if="loading.restaurantes" class="flex flex-col items-center justify-center py-20 gap-3">
        <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p class="text-gray-400 text-sm">Cargando restaurantes...</p>
      </div>
      <div v-else-if="restaurantesFiltrados.length === 0" class="text-center py-20">
        <span class="text-5xl block mb-3">🍽️</span>
        <p class="text-gray-500 font-medium">No encontramos restaurantes</p>
      </div>
      <div v-else class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button v-for="rest in restaurantesFiltrados" :key="rest.id"
          @click="seleccionarRestaurante(rest)"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-left hover:shadow-md hover:-translate-y-0.5 transition-all group">
          <div class="w-full h-36 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden flex items-center justify-center">
            <img v-if="rest.imagen" :src="getImageUrl(rest.imagen)" class="w-full h-full object-cover" @error="onImageError" />
            <span v-else class="text-6xl opacity-30">🍽️</span>
            <div class="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all"></div>
            <div class="absolute top-3 right-3">
              <span class="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Abierto</span>
            </div>
          </div>
          <div class="p-4">
            <h3 class="font-bold text-gray-900 text-base">{{ rest.nombre }}</h3>
            <p v-if="rest.calle || rest.ciudad" class="text-xs text-gray-400 mt-1">
              📍 {{ [rest.calle, rest.ciudad, rest.estado].filter(Boolean).join(', ') }}
            </p>
            <p v-if="rest.telefono" class="text-xs text-gray-400 mt-0.5">📞 {{ rest.telefono }}</p>
            <div class="flex items-center justify-between mt-3">
              <span class="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full">Ver menú →</span>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- ══ VISTA: MENÚ DEL RESTAURANTE ══ -->
    <div v-else-if="vista === 'menu'" class="flex flex-col h-screen">

      <!-- Header menú -->
      <div class="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div class="w-full h-28 bg-gradient-to-br from-indigo-500 to-purple-600 relative flex items-end px-5 pb-4">
          <button @click="volverARestaurantes"
            class="absolute top-4 left-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition text-white font-bold">
            ←
          </button>
          <div>
            <h2 class="text-xl font-bold text-white leading-tight">{{ restauranteSeleccionado?.nombre }}</h2>
            <p v-if="restauranteSeleccionado?.ciudad" class="text-white/70 text-xs mt-0.5">
              📍 {{ restauranteSeleccionado.ciudad }}
            </p>
          </div>
        </div>

        <!-- ══ OFERTAS DESTACADAS ══ -->
        <div v-if="ofertasProductos.length > 0" class="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border-b border-amber-200">
          <div class="px-4 py-3">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center animate-pulse">
                <span class="text-white text-lg">🔥</span>
              </div>
              <div>
                <h3 class="font-bold text-gray-800">Ofertas Especiales</h3>
                <p class="text-xs text-gray-500">¡Precios exclusivos por tiempo limitado!</p>
              </div>
              <span class="ml-auto bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                {{ ofertasProductos.length }} disponibles
              </span>
            </div>
            
            <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                v-for="oferta in ofertasProductos" 
                :key="oferta.id"
                @click="agregarOfertaAlPedido(oferta)"
                class="bg-white rounded-xl shadow-md border border-amber-200 overflow-hidden flex-shrink-0 w-64 hover:shadow-lg transition-all group"
              >
                <div class="relative h-28 bg-gradient-to-br from-amber-400 to-orange-500">
                  <img 
                    v-if="oferta.imagen_url" 
                    :src="getImageUrl(oferta.imagen_url)" 
                    class="w-full h-full object-cover"
                    @error="onImageError"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  <div class="absolute top-2 left-2">
                    <span class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                      -{{ oferta.descuento_porcentaje }}%
                    </span>
                  </div>
                  <div class="absolute bottom-2 left-2 right-2">
                    <h4 class="text-white font-bold text-sm drop-shadow">{{ oferta.nombre }}</h4>
                  </div>
                </div>
                
                <div class="p-3">
                  <div class="flex items-center justify-between mb-2">
                    <div>
                      <span class="text-gray-400 text-xs line-through">${{ oferta.precio_original.toFixed(2) }}</span>
                      <span class="text-amber-600 font-bold text-lg ml-2">${{ oferta.precio_oferta.toFixed(2) }}</span>
                    </div>
                    <div class="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
                      <span class="text-lg font-bold">+</span>
                    </div>
                  </div>
                  <p class="text-xs text-gray-500 line-clamp-2">{{ oferta.descripcion }}</p>
                  <div v-if="oferta.stock_limitado" class="mt-2">
                    <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div class="h-full bg-amber-500 rounded-full" :style="{ width: `${(oferta.stock_actual / oferta.stock_total) * 100}%` }"></div>
                    </div>
                    <p class="text-[10px] text-gray-500 mt-1">Quedan {{ oferta.stock_actual }} unidades</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Filtros de categoría -->
        <div class="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide bg-white">
          <button @click="categoriaActiva = null"
            :class="['px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition shrink-0',
              categoriaActiva === null ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">
            Todos
          </button>
          <button v-for="cat in categorias" :key="cat.id" @click="categoriaActiva = cat.id"
            :class="['px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition shrink-0 border',
              categoriaActiva === cat.id ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200']"
            :style="categoriaActiva === cat.id ? { backgroundColor: cat.color || '#6366f1' } : {}">
            {{ cat.icono ? cat.icono + ' ' : '' }}{{ cat.nombre }}
          </button>
        </div>
      </div>

      <!-- Layout: Productos + Carrito desktop -->
      <div class="flex flex-1 overflow-hidden">

        <!-- Lista de productos -->
        <div class="flex-1 overflow-y-auto p-4 space-y-6">
          <div v-if="loading.productos" class="flex flex-col items-center justify-center py-20 gap-3">
            <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p class="text-gray-400 text-sm">Cargando menú...</p>
          </div>
          <div v-else-if="categoriasFiltradas.length === 0" class="text-center py-20">
            <span class="text-5xl block mb-3">😔</span>
            <p class="text-gray-500">Sin productos disponibles</p>
            <p class="text-xs text-gray-400 mt-2">{{ debugMsg }}</p>
          </div>
          <div v-else v-for="cat in categoriasFiltradas" :key="cat.id">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                :style="{ backgroundColor: (cat.color||'#6366f1')+'22', border:`2px solid ${cat.color||'#6366f1'}` }">
                {{ cat.icono || '📦' }}
              </div>
              <h3 class="font-bold text-gray-800">{{ cat.nombre }}</h3>
              <div class="flex-1 h-px bg-gray-100"></div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button v-for="p in cat.productos" :key="p.id"
                @click="agregarAlPedido(p)"
                :disabled="p.agotado"
                class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex gap-3 p-3 text-left hover:shadow-md transition-all group disabled:opacity-50 disabled:cursor-not-allowed">
                <div class="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                  <img v-if="p.imagen_url" :src="getImageUrl(p.imagen_url)" :alt="p.nombre"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    @error="onImageError" />
                  <span v-else class="text-3xl">🍽️</span>
                </div>
                <div class="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <p class="font-semibold text-gray-800 text-sm leading-tight">{{ p.nombre }}</p>
                    <p class="text-xs text-gray-400 mt-0.5 line-clamp-2">{{ p.descripcion || 'Sin descripción' }}</p>
                    <p v-if="p.bajo_stock && !p.agotado" class="text-[10px] text-amber-500 mt-1">
                      ⚠️ Últimas unidades
                    </p>
                    <span v-if="tieneAnuncio(p.id)"
                      class="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                      🔥 Promo
                    </span>
                  </div>
                  <div class="flex items-center justify-between mt-2">
                    <span class="font-bold text-indigo-600">${{ Number(p.precio||0).toFixed(2) }}</span>
                    <div class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition"
                      :class="!p.agotado ? 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-gray-100 text-gray-400'">
                      {{ !p.agotado ? '+' : '✕' }}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Carrito lateral (desktop) -->
        <div class="hidden lg:flex w-96 shrink-0 bg-white border-l border-gray-100 flex-col shadow-sm">
          <div class="px-5 py-4 border-b border-gray-100">
            <h3 class="font-bold text-gray-800">Tu pedido</h3>
            <p class="text-xs text-gray-400 mt-0.5">{{ restauranteSeleccionado?.nombre }}</p>
          </div>
          <div class="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            <div v-if="pedido.length === 0" class="flex flex-col items-center justify-center h-full py-10 text-center">
              <span class="text-4xl mb-3">🛒</span>
              <p class="text-gray-400 text-sm">Agrega productos<br>para comenzar</p>
            </div>
            <div v-else v-for="item in pedido" :key="item.id"
              class="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl">
              <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                <img v-if="item.imagen" :src="item.imagen" :alt="item.nombre" class="w-full h-full object-cover" @error="onImageError" />
                <span v-else class="text-lg">🍽️</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-gray-800 truncate">{{ item.nombre }}</p>
                <div class="flex items-center gap-1.5 mt-1.5">
                  <button @click="decrementar(item.id)"
                    class="w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-xs hover:bg-gray-300 transition flex items-center justify-center font-bold">−</button>
                  <span class="text-xs font-bold w-4 text-center">{{ item.cantidad }}</span>
                  <button @click="incrementar(item.id)"
                    class="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs hover:bg-indigo-200 transition flex items-center justify-center font-bold">+</button>
                </div>
              </div>
              <div class="text-right shrink-0">
                <p class="text-xs font-bold text-gray-800">${{ (item.precio * item.cantidad).toFixed(2) }}</p>
                <button @click="eliminarDelPedido(item.id)" class="text-gray-300 hover:text-red-400 transition text-xs mt-0.5 block ml-auto">✕</button>
              </div>
            </div>
          </div>
          <div class="px-4 py-4 border-t border-gray-100 space-y-3">
            <template v-if="pedido.length > 0">
              <div class="flex justify-between font-bold text-base">
                <span>Total</span>
                <span class="text-indigo-600">${{ totalPedido.toFixed(2) }}</span>
              </div>
              <textarea v-model="notaGeneral" rows="2" placeholder="📝 Nota general del pedido..."
                class="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none"></textarea>
            </template>
            <button @click="showCheckout = true" :disabled="pedido.length === 0"
              class="w-full py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed">
              Ir a pagar 💳
            </button>
            <div v-if="ordenConfirmada" class="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-xl text-center animate-fade-in">
              ✅ ¡Pedido enviado correctamente!
            </div>
            <div v-if="errorOrden" class="p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-xl text-center animate-fade-in">
              ❌ {{ errorOrden }}
            </div>
            <button v-if="pedido.length > 0" @click="vaciarPedido" class="w-full py-1.5 text-xs text-gray-400 hover:text-red-400 transition">
              Vaciar pedido
            </button>
          </div>
        </div>

      </div>

      <!-- Botón flotante carrito (móvil) -->
      <div v-if="pedido.length > 0" class="lg:hidden fixed bottom-5 left-4 right-4 z-20">
        <button @click="showCarritoMobile = true"
          class="w-full py-4 bg-indigo-600 text-white rounded-2xl shadow-xl flex items-center justify-between px-5 font-semibold animate-slide-up">
          <span class="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{{ totalItems }}</span>
          <span>Ver pedido</span>
          <span class="font-bold">${{ totalPedido.toFixed(2) }}</span>
        </button>
      </div>

      <!-- Modal carrito móvil -->
      <div v-if="showCarritoMobile" class="lg:hidden fixed inset-0 bg-black/50 z-30 flex items-end animate-fade-in"
        @click.self="showCarritoMobile = false">
        <div class="bg-white w-full rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto animate-slide-up">
          <div class="flex items-center justify-between mb-4 sticky top-0 bg-white pb-2">
            <h3 class="font-bold text-gray-800">Tu pedido</h3>
            <button @click="showCarritoMobile = false" class="text-gray-400 text-xl hover:text-gray-600">✕</button>
          </div>
          <div class="space-y-2 mb-4 max-h-[45vh] overflow-y-auto">
            <div v-for="item in pedido" :key="item.id" class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div class="flex-1">
                <p class="text-sm font-semibold text-gray-800">{{ item.nombre }}</p>
                <p class="text-xs text-gray-400">${{ item.precio.toFixed(2) }} c/u</p>
              </div>
              <div class="flex items-center gap-2">
                <button @click="decrementar(item.id)" class="w-6 h-6 rounded-full bg-gray-200 text-sm flex items-center justify-center font-bold">−</button>
                <span class="text-sm font-bold w-5 text-center">{{ item.cantidad }}</span>
                <button @click="incrementar(item.id)" class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-sm flex items-center justify-center font-bold">+</button>
              </div>
              <span class="text-sm font-bold text-gray-800 w-16 text-right">${{ (item.precio * item.cantidad).toFixed(2) }}</span>
            </div>
          </div>
          <div class="flex justify-between font-bold text-lg mb-4 pt-3 border-t border-gray-100">
            <span>Total</span>
            <span class="text-indigo-600">${{ totalPedido.toFixed(2) }}</span>
          </div>
          <textarea v-model="notaGeneral" rows="2" placeholder="📝 Nota general del pedido..."
            class="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none mb-3"></textarea>
          <button @click="showCheckout = true; showCarritoMobile = false"
            class="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition">
            Ir a pagar 💳
          </button>
          <div v-if="ordenConfirmada" class="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium rounded-xl text-center animate-fade-in">
            ✅ ¡Pedido enviado correctamente!
          </div>
          <div v-if="errorOrden" class="mt-3 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-xl text-center animate-fade-in">
            ❌ {{ errorOrden }}
          </div>
        </div>
      </div>

    </div>

    <!-- ══ MODAL CHECKOUT ══ -->
    <ClienteCheckoutModal
      v-if="showCheckout"
      :pedido="pedido"
      :restaurante-nombre="restauranteSeleccionado?.nombre || ''"
      :nota-inicial="notaGeneral"
      ref="checkoutRef"
      @close="showCheckout = false"
      @confirmar="handleCheckout"
    />

  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import MarquesitaWidget       from '../components/MarquesitaWidget.vue'
import ClienteCheckoutModal from '../components/cliente/Clientecheckoutmodal.vue'

const API_URL     = 'http://localhost:8000/api'
const STORAGE_URL = 'http://localhost:8000/storage/'

// ── ESTADO ─────────────────────────────────────────────────
const vista                   = ref('restaurantes')
const restaurantes            = ref([])
const restauranteSeleccionado = ref(null)
const productos               = ref([])
const pedido                  = ref([])
const categoriaActiva         = ref(null)
const busquedaRestaurante     = ref('')
const confirmando             = ref(false)
const showCarritoMobile       = ref(false)
const ordenConfirmada         = ref(false)
const errorOrden              = ref('')
const notaGeneral             = ref('')
const loading                 = ref({ restaurantes: true, productos: false })
const anuncios                = ref([])
const debugMsg                = ref('')
const showCheckout            = ref(false)
const checkoutRef             = ref(null)
const ofertasProductos        = ref([])
const loadingOfertas          = ref(false)

// Datos del usuario
const userRaw    = localStorage.getItem('user') ?? sessionStorage.getItem('user') ?? '{}'
const userActual = (() => { try { return JSON.parse(userRaw) } catch { return {} } })()
const rolActual  = userActual?.roles?.[0]?.nombre ?? ''
const esCliente  = rolActual === 'CLIENTE'
const clienteId  = esCliente ? (userActual?.cliente_id ?? null) : null

// ── HELPERS ────────────────────────────────────────────────
const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return { 'Content-Type':'application/json', Accept:'application/json', Authorization: token ? `Bearer ${token}` : '' }
}
const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${STORAGE_URL}${path.replace(/^\/?storage\//, '')}`
}
const onImageError = (e) => { e.target.style.display = 'none' }
const mostrarError = (msg, dur = 4000) => { errorOrden.value = msg; setTimeout(() => { if(errorOrden.value===msg) errorOrden.value='' }, dur) }
const mostrarExito = () => { ordenConfirmada.value = true; setTimeout(() => { ordenConfirmada.value = false }, 3000) }

// ── COMPUTED ───────────────────────────────────────────────
const restaurantesFiltrados = computed(() => {
  if (!busquedaRestaurante.value) return restaurantes.value
  const t = busquedaRestaurante.value.toLowerCase()
  return restaurantes.value.filter(r =>
    r.nombre?.toLowerCase().includes(t) || r.ciudad?.toLowerCase().includes(t)
  )
})

const categorias = computed(() => {
  const mapa = new Map()
  productos.value.forEach(p => {
    if (!p.categoria) return
    const id = p.categoria.id
    if (!mapa.has(id)) mapa.set(id, { id, nombre:p.categoria.nombre, color:p.categoria.color||'#6366f1', icono:p.categoria.icono||'📦', orden:p.categoria.orden??99, productos:[] })
    mapa.get(id).productos.push(p)
  })
  return [...mapa.values()].sort((a,b) => a.orden - b.orden)
})

const categoriasFiltradas = computed(() =>
  categoriaActiva.value === null ? categorias.value : categorias.value.filter(c => c.id === categoriaActiva.value)
)

const totalPedido = computed(() => pedido.value.reduce((s,i) => s + i.precio * i.cantidad, 0))
const totalItems  = computed(() => pedido.value.reduce((s,i) => s + i.cantidad, 0))

const idsConAnuncio = computed(() => new Set(
  anuncios.value.filter(a => a.tipo==='producto' && a.producto?.id).map(a => a.producto.id)
))
const tieneAnuncio = (id) => idsConAnuncio.value.has(id)

// ── NORMALIZAR producto desde cualquier endpoint ───────────
const normalizar = (p) => ({
  id:          p.id,
  nombre:      p.nombre,
  descripcion: p.descripcion || '',
  precio:      parseFloat(p.precio || 0),
  imagen_url:  p.imagen_url  || p.imagen || null,
  stock:       p.stock_restante ?? p.stock_disponible ?? p.stock ?? 0,
  agotado:     (p.stock_restante ?? p.stock_disponible ?? p.stock ?? 0) <= 0,
  bajo_stock:  p.bajo_stock ?? false,
  categoria:   p.categoria ? {
    id:     p.categoria.id,
    nombre: p.categoria.nombre,
    color:  p.categoria.color  || '#6366f1',
    icono:  p.categoria.icono  || '📦',
    orden:  p.categoria.orden  ?? 99,
  } : null,
})

// ── API ────────────────────────────────────────────────────
const cargarRestaurantes = async () => {
  loading.value.restaurantes = true
  try {
    const res  = await fetch(`${API_URL}/restaurantes`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) restaurantes.value = data.data?.restaurantes || data.data || []
  } catch { mostrarError('No se pudieron cargar los restaurantes') }
  finally { loading.value.restaurantes = false }
}

const cargarProductos = async (restauranteId) => {
  loading.value.productos = true
  productos.value = []
  debugMsg.value  = ''
  try {
    const resDisp = await fetch(
      `${API_URL}/productos/disponibles?restaurante_id=${restauranteId}`,
      { headers: getHeaders() }
    )
    const dispData = await resDisp.json()

    if (dispData.success && Array.isArray(dispData.data) && dispData.data.length > 0) {
      productos.value = dispData.data.map(normalizar)
      return
    }

    debugMsg.value = 'Cargando menú completo...'
    // ✅ Ruta pública indexPublic — acepta restaurante_id sin tenant
    const resTodos = await fetch(
      `${API_URL}/productos?restaurante_id=${restauranteId}&per_page=100`,
      { headers: getHeaders() }
    )
    const todosData = await resTodos.json()

    if (todosData.success) {
      let lista = todosData.data
      if (!Array.isArray(lista)) lista = lista?.data ?? []
      productos.value = lista.map(normalizar)
      debugMsg.value = productos.value.length === 0
        ? 'El restaurante no tiene productos activos aún'
        : ''
    } else {
      debugMsg.value = todosData.message || 'Error al cargar el menú'
    }
  } catch (e) {
    console.error('Error cargarProductos:', e)
    mostrarError('Error de conexión al cargar el menú')
  } finally {
    loading.value.productos = false
  }
}

const cargarAnuncios = async (restauranteId = null) => {
  try {
    const params = restauranteId
      ? `?tipo=cliente&restaurante_id=${restauranteId}`
      : '?tipo=cliente'
    const res  = await fetch(`${API_URL}/anuncios/vigentes${params}`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) anuncios.value = data.data || []
  } catch { anuncios.value = [] }
}

// ── PERSISTENCIA ───────────────────────────────────────────
const cargarRestauranteDesdeLocalStorage = async () => {
  const id = localStorage.getItem('cliente_restaurante_id')
  if (!id) return null

  const rest = restaurantes.value.find(r => r.id.toString() === id)
  if (rest) {
    restauranteSeleccionado.value = rest
    vista.value = 'menu'
    await Promise.all([
      cargarProductos(rest.id),
      cargarOfertas(rest.id),
      cargarAnuncios(rest.id)
    ])
    return rest
  }
  localStorage.removeItem('cliente_restaurante_id')
  return null
}

const cargarOfertas = async (restauranteId) => {
  loadingOfertas.value = true
  try {
    const res = await fetch(
      `${API_URL}/ofertas/activas?restaurante_id=${restauranteId}`,
      { headers: getHeaders() }
    )
    const data = await res.json()

    if (data.success) {
      ofertasProductos.value = data.data
        .filter(oferta => oferta.producto?.restaurante_id === restauranteId)
        .map(oferta => ({
          id: oferta.id,
          producto_id: oferta.producto_id,
          nombre: oferta.producto?.nombre || 'Oferta',
          descripcion: oferta.producto?.descripcion || '',
          imagen_url: oferta.producto?.imagen_url || null,
          precio_original: parseFloat(oferta.producto?.precio || 0),
          precio_oferta: parseFloat(oferta.precio_oferta || 0),
          descuento_porcentaje: oferta.descuento_porcentaje || Math.round(
            ((parseFloat(oferta.producto?.precio || 0) - parseFloat(oferta.precio_oferta || 0))
            / parseFloat(oferta.producto?.precio || 1)) * 100
          ),
          fecha_inicio: oferta.fecha_inicio,
          fecha_fin: oferta.fecha_fin,
          stock_limitado: oferta.stock_limitado || false,
          stock_total: oferta.stock_total || 0,
          stock_actual: oferta.stock_actual || 0,
          agotado: oferta.stock_limitado && oferta.stock_actual <= 0
        }))
        .filter(o => !o.agotado)
    }
  } catch (error) {
    console.error('Error cargando ofertas:', error)
  } finally {
    loadingOfertas.value = false
  }
}

// ── NAVEGACIÓN ─────────────────────────────────────────────
const seleccionarRestaurante = async (rest) => {
  if (!rest?.id) {
    mostrarError('Restaurante no válido')
    return
  }
  restauranteSeleccionado.value = rest
  // Guardar en localStorage para persistir entre recargas
  localStorage.setItem('cliente_restaurante_id', rest.id.toString())
  categoriaActiva.value = null
  pedido.value = []
  notaGeneral.value = ''
  errorOrden.value = ''
  vista.value = 'menu'
  await Promise.all([
    cargarProductos(rest.id),
    cargarOfertas(rest.id),
    cargarAnuncios(rest.id)
  ])
}

const volverARestaurantes = () => {
  vista.value                   = 'restaurantes'
  restauranteSeleccionado.value = null
  localStorage.removeItem('cliente_restaurante_id')
  productos.value               = []
  pedido.value                  = []
  notaGeneral.value             = ''
  showCarritoMobile.value       = false
  errorOrden.value              = ''
  anuncios.value                = []
  ofertasProductos.value        = []
}

// ── CARRITO ────────────────────────────────────────────────
const agregarAlPedido = (p) => {
  if (p.agotado) { mostrarError(`"${p.nombre}" no está disponible`); return }
  const existe = pedido.value.find(i => i.id === p.id)
  if (existe) {
    if (existe.cantidad + 1 > p.stock && p.stock > 0) { mostrarError(`Solo hay ${p.stock} unidades de "${p.nombre}"`); return }
    existe.cantidad++
  } else {
    pedido.value.push({ id:p.id, nombre:p.nombre, precio:parseFloat(p.precio), imagen:p.imagen_url?getImageUrl(p.imagen_url):null, cantidad:1, stock_maximo:p.stock })
  }
}

const agregarOfertaAlPedido = (oferta) => {
  if (oferta.agotado) { mostrarError('Esta oferta ya no está disponible'); return }
  const existe = pedido.value.find(i => i.id === oferta.producto_id)
  if (existe) {
    if (oferta.stock_limitado && existe.cantidad + 1 > oferta.stock_actual) {
      mostrarError(`Solo hay ${oferta.stock_actual} unidades disponibles`)
      return
    }
    existe.cantidad++
    existe.precio = oferta.precio_oferta
  } else {
    pedido.value.push({
      id:          oferta.producto_id,
      nombre:      oferta.nombre,
      precio:      oferta.precio_oferta,
      imagen:      oferta.imagen_url ? getImageUrl(oferta.imagen_url) : null,
      cantidad:    1,
      stock_maximo: oferta.stock_limitado ? oferta.stock_actual : 999,
      es_oferta:   true,
      oferta_id:   oferta.id
    })
  }
}

const incrementar = (id) => {
  const item = pedido.value.find(i => i.id === id)
  if (!item) return
  if (item.stock_maximo > 0 && item.cantidad + 1 > item.stock_maximo) { mostrarError(`Límite de stock para "${item.nombre}"`); return }
  item.cantidad++
}

const decrementar = (id) => {
  const idx = pedido.value.findIndex(i => i.id === id)
  if (idx === -1) return
  pedido.value[idx].cantidad > 1 ? pedido.value[idx].cantidad-- : pedido.value.splice(idx, 1)
}

const eliminarDelPedido = (id) => { pedido.value = pedido.value.filter(i => i.id !== id) }

const vaciarPedido = () => { if (confirm('¿Vaciar todo el pedido?')) { pedido.value = []; notaGeneral.value = '' } }

const handleCheckout = async (checkoutData) => {
  if (!restauranteSeleccionado.value?.id) {
    mostrarError('No hay restaurante seleccionado. Por favor vuelve a seleccionarlo.')
    volverARestaurantes()
    return
  }
  try {
    const body = {
      restaurante_id: restauranteSeleccionado.value.id,
      productos:      pedido.value.map(i => ({ producto_id: i.id, cantidad: i.cantidad })),
      metodo_pago:    checkoutData.metodo_pago,
      tipo_entrega:   checkoutData.tipo_entrega,
      notas:          checkoutData.notas || null,
    }
    if (clienteId) body.cliente_id = clienteId

    const res  = await fetch(`${API_URL}/ordenes`, { method:'POST', headers:getHeaders(), body:JSON.stringify(body) })
    const data = await res.json()

    if (res.ok && data.success) {
      showCheckout.value      = false
      pedido.value            = []
      notaGeneral.value       = ''
      showCarritoMobile.value = false
      mostrarExito()
    } else {
      const msg = data.errors
        ? Object.values(data.errors).flat().join('. ')
        : data.message || 'Error al procesar el pedido'
      checkoutRef.value?.setError(msg)
    }
  } catch {
    checkoutRef.value?.setError('Error de conexión')
  }
}

onMounted(async () => {
  await cargarRestaurantes()
  // Intentar restaurar restaurante seleccionado si el usuario recargó la página
  if (restaurantes.value.length > 0) {
    await cargarRestauranteDesdeLocalStorage()
  }
})
</script>

<style scoped>
@keyframes spin     { to { transform: rotate(360deg); } }
@keyframes fade-in  { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
@keyframes slide-up { from { opacity:0; transform:translateY(100%); } to { opacity:1; transform:translateY(0); } }
.animate-spin     { animation: spin     1s linear   infinite; }
.animate-fade-in  { animation: fade-in  0.3s ease-out; }
.animate-slide-up { animation: slide-up 0.3s ease-out; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
</style>