<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">

    <!-- Header Menú Kiosko -->
    <div class="bg-gradient-to-br from-indigo-600 to-purple-700 shadow-md">
      <div class="px-5 py-4 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-white leading-tight">
            {{ restauranteSeleccionado?.nombre || 'Kiosko de Menú' }}
          </h2>
          <p class="text-indigo-100 text-xs mt-0.5">
            {{ restauranteSeleccionado?.ciudad ? '📍 ' + restauranteSeleccionado.ciudad : 'Cargando menú...' }}
          </p>
        </div>
        <button @click="cerrarSesion" class="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-2 rounded-xl transition">
          Salir del Kiosko
        </button>
      </div>
      
      <!-- ══ OFERTAS DESTACADAS ══ -->
      <div v-if="ofertasProductos.length > 0" class="bg-amber-50/10 border-t border-white/10 backdrop-blur-sm">
        <div class="px-5 py-3">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-white text-sm">🔥 Ofertas Especiales</span>
          </div>
          
          <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              v-for="oferta in ofertasProductos" 
              :key="oferta.id"
              @click="agregarOfertaAlPedido(oferta)"
              class="bg-white rounded-xl shadow-md border border-amber-200 overflow-hidden flex-shrink-0 w-64 hover:shadow-lg transition-all group text-left"
            >
              <div class="relative h-24 bg-gradient-to-br from-amber-400 to-orange-500">
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
              
              <div class="p-2">
                <div class="flex items-center justify-between mb-1">
                  <div>
                    <span class="text-gray-400 text-xs line-through">${{ oferta.precio_original.toFixed(2) }}</span>
                    <span class="text-amber-600 font-bold text-base ml-2">${{ oferta.precio_oferta.toFixed(2) }}</span>
                  </div>
                  <div class="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
                    <span class="text-sm font-bold">+</span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      <!-- ══ MARQUESINA DE ANUNCIOS ══ -->
      <MarquesitaWidget 
        :api-url="API_URL" 
        :get-headers="getHeaders" 
        tipo="interno"
        variant="amber" 
        :restaurante-id="restauranteSeleccionado?.id"
        class="border-y border-white/5"
      />

      <!-- ══ PAQUETES / COMBOS ══ -->
      <div v-if="paquetes.length > 0" class="bg-indigo-900/20 border-b border-white/10 backdrop-blur-sm">
        <div class="px-5 py-3">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-white text-sm font-bold">🎁 Combos Especiales</span>
          </div>
          
          <div class="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              v-for="pkg in paquetes" 
              :key="pkg.id"
              @click="agregarPaqueteAlPedido(pkg)"
              class="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden flex-shrink-0 w-72 hover:shadow-xl transition-all group text-left flex flex-col"
            >
              <div class="relative h-32 bg-indigo-50">
                <img 
                  v-if="pkg.imagen_url" 
                  :src="getImageUrl(pkg.imagen_url)" 
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  @error="onImageError"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-4xl bg-indigo-50 text-indigo-200">🎁</div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div class="absolute bottom-3 left-3 right-3">
                  <h4 class="text-white font-black text-lg drop-shadow-md leading-tight">{{ pkg.nombre }}</h4>
                </div>
              </div>
              
              <div class="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <div class="flex flex-wrap gap-1 mb-2">
                    <span v-for="p in pkg.productos" :key="p.id" class="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold">
                      {{ p.pivot.cantidad }}x {{ p.nombre }}
                    </span>
                  </div>
                  <p class="text-[10px] text-gray-400 line-clamp-1 mb-3">{{ pkg.descripcion }}</p>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-indigo-600 font-black text-xl">${{ Number(pkg.precio).toFixed(2) }}</span>
                  <div class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                    <span class="text-xl font-bold">+</span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Filtros de categoría -->
      <div class="flex gap-2 px-5 py-3 overflow-x-auto scrollbar-hide bg-white shadow-sm border-b border-gray-100">
        <button @click="categoriaActiva = null"
          :class="['px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition shrink-0',
            categoriaActiva === null ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">
          Todos
        </button>
        <button v-for="cat in categorias" :key="cat.id" @click="categoriaActiva = cat.id"
          :class="['px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition shrink-0 border',
            categoriaActiva === cat.id ? 'text-white border-transparent shadow-md' : 'bg-white text-gray-600 border-gray-200']"
          :style="categoriaActiva === cat.id ? { backgroundColor: cat.color || '#6366f1', boxShadow: `0 4px 6px -1px ${(cat.color||'#6366f1')}40` } : {}">
          {{ cat.icono ? cat.icono + ' ' : '' }}{{ cat.nombre }}
        </button>
      </div>
    </div>

    <!-- Layout: Productos + Carrito -->
    <div class="flex flex-1 overflow-hidden h-full">

      <!-- Lista de productos -->
      <div class="flex-1 overflow-y-auto p-5 space-y-6">
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
            <h3 class="font-bold text-gray-800 text-lg">{{ cat.nombre }}</h3>
            <div class="flex-1 h-px bg-gray-200"></div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <button v-for="p in cat.productos" :key="p.id"
              @click="agregarAlPedido(p)"
              :disabled="p.agotado"
              class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col text-left hover:shadow-lg transition-all group disabled:opacity-50 disabled:cursor-not-allowed">
              <div class="w-full h-24 overflow-hidden bg-gray-100 flex items-center justify-center relative">
                <img v-if="p.imagen_url" :src="getImageUrl(p.imagen_url)" :alt="p.nombre"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  @error="onImageError" />
                <span v-else class="text-3xl">🍽️</span>
                <span v-if="p.agotado" class="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center text-red-600 font-black text-sm">AGOTADO</span>
              </div>
              <div class="p-2.5 flex-1 flex flex-col justify-between bg-white">
                <div>
                  <p class="font-bold text-gray-800 text-[13px] leading-tight">{{ p.nombre }}</p>
                  <p class="text-[10px] text-gray-500 mt-1 line-clamp-2">{{ p.descripcion || 'Sin descripción' }}</p>
                  <p v-if="p.bajo_stock && !p.agotado" class="text-[9px] font-bold text-amber-500 mt-1">
                    ⚠️ Últimas {{ p.stock }}
                  </p>
                </div>
                <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                  <span class="font-black text-indigo-600 text-sm">${{ Number(p.precio||0).toFixed(2) }}</span>
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-base font-bold transition"
                    :class="!p.agotado ? 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : 'bg-gray-100 text-gray-400'">
                    {{ !p.agotado ? '+' : '✕' }}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Carrito lateral -->
      <div class="w-96 shrink-0 bg-white border-l border-gray-200 flex flex-col shadow-xl z-10 hidden sm:flex">
        <div class="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 class="font-black text-gray-900 text-lg">Tu Pedido</h3>
            <p class="text-xs text-gray-400 font-medium">Revisa tu selección</p>
          </div>
          <span class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">{{ totalItems }} items</span>
        </div>
        <div class="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/50">
          <div v-if="pedido.length === 0" class="flex flex-col items-center justify-center h-full py-10 text-center opacity-60">
            <span class="text-5xl mb-4 grayscale">🍽️</span>
            <p class="text-gray-500 font-semibold text-lg">Tu orden está vacía</p>
            <p class="text-sm text-gray-400">Toca los productos para agregarlos</p>
          </div>
          <div v-else v-for="item in pedido" :key="item.id"
            class="flex items-center gap-3 p-3 bg-white border border-gray-100 shadow-sm rounded-xl transition-all hover:shadow-md">
            <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
              <img v-if="item.imagen" :src="item.imagen" :alt="item.nombre" class="w-full h-full object-cover" @error="onImageError" />
              <span v-else class="text-xl">🍽️</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-gray-800 truncate">{{ item.nombre }}</p>
              <div class="flex items-center justify-between mt-1.5">
                <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                  <button @click="decrementar(item.id)" class="w-7 h-7 rounded-md bg-white shadow-sm text-gray-600 text-sm hover:text-indigo-600 transition flex items-center justify-center font-bold">−</button>
                  <span class="text-sm font-bold w-6 text-center text-gray-700">{{ item.cantidad }}</span>
                  <button @click="incrementar(item.id)" class="w-7 h-7 rounded-md bg-white shadow-sm text-indigo-600 text-sm hover:bg-indigo-50 transition flex items-center justify-center font-bold">+</button>
                </div>
                <p class="text-sm font-black text-gray-900">${{ (item.precio * item.cantidad).toFixed(2) }}</p>
              </div>
            </div>
            <button @click="eliminarDelPedido(item.id)" class="text-gray-300 hover:text-red-500 transition text-lg p-1">✕</button>
          </div>
        </div>
        <div class="p-5 border-t border-gray-200 bg-white space-y-4">
          <div v-if="pedido.length > 0" class="flex justify-between font-black text-xl">
            <span class="text-gray-800">Total a pagar:</span>
            <span class="text-indigo-600">${{ totalPedido.toFixed(2) }}</span>
          </div>
          <button @click="showCheckout = true" :disabled="pedido.length === 0"
            class="w-full py-4 bg-indigo-600 text-white text-base font-bold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none shadow-md shadow-indigo-200">
            Confirmar y Enviar Pedido
          </button>
          <div v-if="ordenConfirmada" class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold rounded-xl text-center">
            ✅ ¡Orden enviada correctamente!
          </div>
          <div v-if="errorOrden" class="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl text-center">
            ❌ {{ errorOrden }}
          </div>
          <button v-if="pedido.length > 0" @click="vaciarPedido" class="w-full py-2 text-xs font-semibold text-gray-400 hover:text-red-500 transition">
            Vaciar todo el pedido
          </button>
        </div>
      </div>

    </div>

    <!-- Botón flotante carrito (móvil) -->
    <div v-if="pedido.length > 0" class="sm:hidden fixed bottom-5 left-4 right-4 z-20">
      <button @click="showCarritoMobile = true"
        class="w-full py-4 bg-indigo-600 text-white rounded-2xl shadow-xl flex items-center justify-between px-5 font-bold animate-slide-up border border-indigo-500">
        <span class="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full">{{ totalItems }} items</span>
        <span>Ver Pedido</span>
        <span class="text-lg">${{ totalPedido.toFixed(2) }}</span>
      </button>
    </div>

    <!-- Modal carrito móvil -->
    <div v-if="showCarritoMobile" class="sm:hidden fixed inset-0 bg-black/60 z-30 flex items-end animate-fade-in"
      @click.self="showCarritoMobile = false">
      <div class="bg-white w-full rounded-t-3xl p-5 max-h-[85vh] flex flex-col animate-slide-up shadow-2xl">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <h3 class="font-black text-gray-900 text-xl">Tu Pedido</h3>
          <button @click="showCarritoMobile = false" class="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center text-gray-500 font-bold hover:bg-gray-200 transition">✕</button>
        </div>
        <div class="space-y-3 mb-4 overflow-y-auto flex-1 pb-2">
          <div v-for="item in pedido" :key="item.id" class="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-gray-900 truncate">{{ item.nombre }}</p>
              <p class="text-xs text-gray-500 mt-0.5">${{ item.precio.toFixed(2) }} c/u</p>
            </div>
            <div class="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-gray-200">
              <button @click="decrementar(item.id)" class="w-7 h-7 rounded-md bg-gray-100 text-gray-700 text-sm font-bold flex items-center justify-center">−</button>
              <span class="text-sm font-bold w-5 text-center">{{ item.cantidad }}</span>
              <button @click="incrementar(item.id)" class="w-7 h-7 rounded-md bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center">+</button>
            </div>
            <span class="text-base font-black text-indigo-600 w-16 text-right">${{ (item.precio * item.cantidad).toFixed(2) }}</span>
          </div>
        </div>
        <div class="pt-4 border-t border-gray-200 space-y-4">
          <div class="flex justify-between font-black text-xl">
            <span class="text-gray-800">Total</span>
            <span class="text-indigo-600">${{ totalPedido.toFixed(2) }}</span>
          </div>
          <button @click="showCheckout = true; showCarritoMobile = false"
            class="w-full py-4 bg-indigo-600 text-white font-bold text-lg rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
            Confirmar y Enviar
          </button>
        </div>
      </div>
    </div>

    <!-- ══ MODAL CHECKOUT PARA EL KIOSKO ══ -->
    <MenuCheckoutModal
      v-if="showCheckout"
      :pedido="pedido"
      :restaurante-nombre="restauranteSeleccionado?.nombre || ''"
      ref="checkoutRef"
      @close="showCheckout = false"
      @confirmar="handleCheckout"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MarquesitaWidget from '../components/Marquesitawidget.vue'
import MenuCheckoutModal from '../components/menu/MenuCheckoutModal.vue'

const router = useRouter()
const API_URL     = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const STORAGE_URL = (import.meta.env.VITE_API_URL || '').replace('/api', '/storage/') || 'http://localhost:8000/storage/'

// ── ESTADO ─────────────────────────────────────────────────
const restauranteSeleccionado = ref(null)
const productos               = ref([])
const pedido                  = ref([])
const categoriaActiva         = ref(null)
const showCarritoMobile       = ref(false)
const ordenConfirmada         = ref(false)
const errorOrden              = ref('')
const loading                 = ref({ productos: true })
const debugMsg                = ref('')
const showCheckout            = ref(false)
const checkoutRef             = ref(null)
const ofertasProductos        = ref([])
const paquetes                = ref([])

// Datos del usuario logueado (Empleado con rol MENU)
const userRaw    = localStorage.getItem('user') ?? sessionStorage.getItem('user') ?? '{}'
const userActual = (() => { try { return JSON.parse(userRaw) } catch { return {} } })()
const empleadoId = userActual?.id ?? null

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

const cerrarSesion = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('user')
  router.push('/')
}

// ── COMPUTED ───────────────────────────────────────────────
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
const cargarRestauranteActivo = async () => {
  try {
    const res = await fetch(`${API_URL}/me`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) {
      const user = data.data || data
      const ra = user?.restaurante_activo
      if (ra && typeof ra === 'object') {
        restauranteSeleccionado.value = ra
        return ra.id
      }
    }
    return null
  } catch {
    mostrarError('No se pudo obtener el restaurante asignado')
    return null
  }
}

const cargarProductos = async (restauranteId) => {
  loading.value.productos = true
  productos.value = []
  debugMsg.value  = ''
  try {
    const resDisp = await fetch(`${API_URL}/productos/disponibles?restaurante_id=${restauranteId}`, { headers: getHeaders() })
    const dispData = await resDisp.json()

    if (dispData.success && Array.isArray(dispData.data) && dispData.data.length > 0) {
      productos.value = dispData.data.map(normalizar)
      return
    }

    debugMsg.value = 'Cargando menú completo...'
    const resTodos = await fetch(`${API_URL}/productos?restaurante_id=${restauranteId}&per_page=100`, { headers: getHeaders() })
    const todosData = await resTodos.json()

    if (todosData.success) {
      let lista = todosData.data
      if (!Array.isArray(lista)) lista = lista?.data ?? []
      productos.value = lista.map(normalizar)
      debugMsg.value = productos.value.length === 0 ? 'El restaurante no tiene productos activos aún' : ''
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

const cargarOfertas = async (restauranteId) => {
  try {
    const res = await fetch(`${API_URL}/ofertas/activas?restaurante_id=${restauranteId}`, { headers: getHeaders() })
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
            ((parseFloat(oferta.producto?.precio || 0) - parseFloat(oferta.precio_oferta || 0)) / parseFloat(oferta.producto?.precio || 1)) * 100
          ),
          stock_limitado: oferta.stock_limitado || false,
          stock_actual: oferta.stock_actual || 0,
          agotado: oferta.stock_limitado && oferta.stock_actual <= 0
        }))
        .filter(o => !o.agotado)
    }
  } catch (error) {
    console.error('Error cargando ofertas:', error)
  }
}

const cargarPaquetes = async (restauranteId) => {
  try {
    const res = await fetch(`${API_URL}/paquetes?restaurante_id=${restauranteId}`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) {
      paquetes.value = (data.data || []).filter(p => p.activo)
    }
  } catch (error) {
    console.error('Error cargando paquetes:', error)
  }
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

const agregarPaqueteAlPedido = (pkg) => {
  const existe = pedido.value.find(i => i.paquete_id === pkg.id)
  if (existe) {
    existe.cantidad++
  } else {
    pedido.value.push({
      id:          `pkg_${pkg.id}`, // ID temporal para el carrito
      paquete_id:  pkg.id,
      nombre:      pkg.nombre,
      precio:      parseFloat(pkg.precio),
      imagen:      pkg.imagen_url ? getImageUrl(pkg.imagen_url) : null,
      cantidad:    1,
      es_paquete:  true
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

const vaciarPedido = () => { if (confirm('¿Vaciar todo el pedido?')) { pedido.value = []; } }

const handleCheckout = async (checkoutData) => {
  if (!restauranteSeleccionado.value?.id) {
    mostrarError('No hay restaurante seleccionado.')
    return
  }
  
  // El kiosko genera órdenes que van directo a mesero como "ABIERTA" para ser procesadas/revisadas
  try {
    const body = {
      restaurante_id: restauranteSeleccionado.value.id,
      productos:      pedido.value.map(i => ({ 
        producto_id: i.es_paquete ? null : i.id, 
        paquete_id:  i.es_paquete ? i.paquete_id : null,
        cantidad:    i.cantidad 
      })),
      metodo_pago:    'efectivo',     // Default, el mesero lo puede cobrar
      tipo_entrega:   'comer_aqui',   // Default en restaurante
      notas:          checkoutData.notas || `Mesa ${checkoutData.numero_mesa}`,
      estado:         'ABIERTA',      // IMPORTANTE: Para que lo vea el mesero
      mesa:           checkoutData.numero_mesa,
      usuario_id:     empleadoId,     // Enviado por este empleado kiosko
    }

    const res  = await fetch(`${API_URL}/ordenes`, { method:'POST', headers:getHeaders(), body:JSON.stringify(body) })
    const data = await res.json()

    if (res.ok && data.success) {
      showCheckout.value      = false
      pedido.value            = []
      showCarritoMobile.value = false
      mostrarExito()
    } else {
      const msg = data.errors ? Object.values(data.errors).flat().join('. ') : data.message || 'Error al enviar el pedido'
      checkoutRef.value?.setError(msg)
    }
  } catch {
    checkoutRef.value?.setError('Error de conexión')
  }
}

onMounted(async () => {
  const restId = await cargarRestauranteActivo()
  if (restId) {
    await Promise.all([
      cargarProductos(restId),
      cargarOfertas(restId),
      cargarPaquetes(restId)
    ])
  } else {
    mostrarError("Tu usuario no tiene un restaurante asignado.")
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