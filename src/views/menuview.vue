<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">

    <!-- Header Menú Kiosko -->
    <div class="bg-gradient-to-br from-indigo-600 to-purple-700 shadow-md">
      <div class="px-5 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Logo del Restaurante -->
          <div v-if="restauranteSeleccionado?.imagen_url" class="w-12 h-12 rounded-2xl overflow-hidden bg-white shadow-sm border border-white/20 shrink-0">
            <img :src="getImageUrl(restauranteSeleccionado.imagen_url)" class="w-full h-full object-cover" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-white leading-tight">
              {{ restauranteSeleccionado?.nombre || 'Kiosko de Menú' }}
            </h2>
            <p class="text-indigo-100 text-xs mt-0.5 font-medium">
              {{ restauranteSeleccionado?.ciudad ? '📍 ' + restauranteSeleccionado.ciudad : 'Sincronizando menú...' }}
            </p>
          </div>
        </div>
        <button @click="cerrarSesion" class="bg-white/20 hover:bg-white/30 text-white text-[10px] font-black px-4 py-2 rounded-xl transition uppercase tracking-widest">
          Salir
        </button>
      </div>
      
      <!-- ══ OFERTAS DESTACADAS (Banner Superior) ══ -->
      <div v-if="ofertasProductos.length > 0" class="bg-amber-400/10 border-t border-white/5 backdrop-blur-sm">
        <div class="px-5 py-3">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-white text-[10px] font-black uppercase tracking-widest opacity-80">🔥 Ofertas del día</span>
          </div>
          
          <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              v-for="oferta in ofertasProductos" 
              :key="oferta.id"
              @click="agregarOfertaAlPedido(oferta)"
              class="bg-white rounded-2xl shadow-md border border-amber-200 overflow-hidden flex-shrink-0 w-64 hover:shadow-xl transition-all group text-left"
            >
              <div class="relative h-24 bg-amber-50">
                <img 
                  v-if="oferta.imagen_url" 
                  :src="getImageUrl(oferta.imagen_url)" 
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div class="absolute top-2 left-2">
                  <span class="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg">
                    -{{ oferta.descuento_porcentaje }}%
                  </span>
                </div>
              </div>
              <div class="p-3">
                <h4 class="text-slate-800 font-black text-xs truncate uppercase tracking-tighter">{{ oferta.nombre }}</h4>
                <div class="flex items-center justify-between mt-2">
                  <div class="flex items-baseline gap-2">
                    <span class="text-slate-400 text-[10px] line-through">${{ oferta.precio_original.toFixed(2) }}</span>
                    <span class="text-amber-600 font-black text-base">${{ oferta.precio_oferta.toFixed(2) }}</span>
                  </div>
                  <div class="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                    <span class="text-sm font-bold">+</span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      <!-- ══ MARQUESINA ══ -->
      <MarquesitaWidget 
        :api-url="API_URL" 
        :get-headers="getHeaders" 
        tipo="interno"
        variant="amber" 
        :restaurante-id="restauranteSeleccionado?.id"
        class="border-y border-white/5"
      />

      <!-- Filtros de categoría (Sub-Tabs) -->
      <div class="flex gap-2 px-5 py-4 overflow-x-auto scrollbar-hide bg-white shadow-sm border-b border-gray-100 items-center">
        <button @click="categoriaActiva = null"
          :class="['px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition shrink-0',
            categoriaActiva === null ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100']">
          Todos
        </button>
        
        <!-- Pestaña especial para Paquetes -->
        <button v-if="paquetes.length > 0" @click="categoriaActiva = 'paquetes'"
          :class="['px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition shrink-0 border-2',
            categoriaActiva === 'paquetes' ? 'bg-indigo-50 border-indigo-600 text-indigo-600 shadow-md' : 'bg-white border-transparent text-slate-400 hover:text-slate-600']">
          🎁 Paquetes
        </button>

        <div class="h-6 w-px bg-slate-200 mx-1 shrink-0"></div>

        <button v-for="cat in categorias" :key="cat.id" @click="categoriaActiva = cat.id"
          :class="['px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition shrink-0 border-2',
            categoriaActiva === cat.id ? 'text-white shadow-lg' : 'bg-white border-transparent text-slate-400']"
          :style="categoriaActiva === cat.id ? { backgroundColor: cat.color || '#6366f1', borderColor: cat.color || '#6366f1' } : {}">
          {{ cat.icono ? cat.icono + ' ' : '' }}{{ cat.nombre }}
        </button>
      </div>
    </div>

    <!-- Layout Principal -->
    <div class="flex flex-1 overflow-hidden h-full">

      <!-- Contenedor de Scroll de Productos -->
      <div class="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
        
        <div v-if="loading.productos" class="flex flex-col items-center justify-center py-20 gap-3">
          <div class="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">Cargando catálogo...</p>
        </div>

        <template v-else>
          <!-- ══ SECCIÓN DE PAQUETES (Si está en 'Todos' o 'Paquetes') ══ -->
          <div v-if="(categoriaActiva === null || categoriaActiva === 'paquetes') && paquetes.length > 0" class="animate-fade-in">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl shadow-sm border border-indigo-100">🎁</div>
              <h3 class="font-black text-slate-800 text-xl tracking-tight uppercase">Combos y Paquetes</h3>
              <div class="flex-1 h-px bg-slate-100"></div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <button 
                v-for="pkg in paquetes" 
                :key="pkg.id"
                @click="agregarPaqueteAlPedido(pkg)"
                class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col text-left hover:shadow-xl hover:-translate-y-1 transition-all group p-1"
              >
                <div class="relative h-40 rounded-[1.8rem] overflow-hidden bg-indigo-50">
                  <img 
                    v-if="pkg.imagen_url" 
                    :src="getImageUrl(pkg.imagen_url)" 
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-5xl text-indigo-100">🎁</div>
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                  <div class="absolute top-3 right-3">
                    <span class="bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-tighter">Promoción</span>
                  </div>
                </div>
                
                <div class="p-4 flex-1 flex flex-col">
                  <h4 class="text-slate-800 font-black text-base leading-tight uppercase mb-2">{{ pkg.nombre }}</h4>
                  <div class="flex flex-wrap gap-1.5 mb-4">
                    <span v-for="p in pkg.productos" :key="p.id" class="text-[9px] bg-slate-50 text-slate-500 px-2 py-1 rounded-lg font-black border border-slate-100">
                      {{ p.pivot.cantidad }}× {{ p.nombre.toUpperCase() }}
                    </span>
                  </div>
                  <div class="mt-auto flex items-center justify-between pt-3 border-t border-slate-50">
                    <span class="text-indigo-600 font-black text-xl">${{ Number(pkg.precio).toFixed(2) }}</span>
                    <div class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:rotate-12 transition-transform">
                      <span class="text-xl font-bold">+</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- ══ SECCIONES DE PRODUCTOS ══ -->
          <div v-if="categoriaActiva !== 'paquetes'" v-for="cat in categoriasFiltradas" :key="cat.id" class="animate-fade-in">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-sm border"
                :style="{ backgroundColor: (cat.color||'#6366f1')+'11', borderColor:cat.color||'#6366f1' }">
                {{ cat.icono || '🍽️' }}
              </div>
              <h3 class="font-black text-slate-800 text-xl tracking-tight uppercase">{{ cat.nombre }}</h3>
              <div class="flex-1 h-px bg-slate-100"></div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <button v-for="p in cat.productos" :key="p.id"
                @click="agregarAlPedido(p)"
                :disabled="p.agotado"
                class="bg-white rounded-3xl border border-slate-50 shadow-sm overflow-hidden flex flex-col text-left hover:shadow-xl transition-all group disabled:opacity-50 relative p-1">
                <div class="w-full h-28 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center relative">
                  <img v-if="p.imagen_url" :src="getImageUrl(p.imagen_url)" :alt="p.nombre"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <span v-else class="text-3xl">🍽️</span>
                  <div v-if="p.agotado" class="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center text-red-500 font-black text-xs uppercase tracking-widest">Agotado</div>
                </div>
                <div class="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <p class="font-black text-slate-800 text-xs leading-tight uppercase tracking-tighter line-clamp-2">{{ p.nombre }}</p>
                    <p v-if="p.bajo_stock && !p.agotado" class="text-[8px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mt-1.5 inline-block uppercase">Últimas {{ p.stock }}</p>
                  </div>
                  <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                    <span class="font-black text-slate-900 text-sm">${{ Number(p.precio||0).toFixed(2) }}</span>
                    <div class="w-7 h-7 rounded-xl flex items-center justify-center text-base font-bold transition-all shadow-sm"
                      :class="!p.agotado ? 'bg-slate-900 text-white group-hover:scale-110' : 'bg-slate-100 text-slate-300'">
                      {{ !p.agotado ? '+' : '✕' }}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- Carrito lateral (Escritorio) -->
      <div class="w-96 shrink-0 bg-white border-l border-slate-100 flex flex-col shadow-2xl z-10 hidden sm:flex">
        <div class="px-6 py-6 border-b border-slate-50 bg-slate-50/50">
          <div class="flex justify-between items-center mb-1">
            <h3 class="font-black text-slate-900 text-xl tracking-tight">Tu Pedido</h3>
            <span class="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{{ totalItems }} items</span>
          </div>
          <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">Restaurant Kiosk System</p>
        </div>
        
        <div class="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-white custom-scrollbar">
          <div v-if="pedido.length === 0" class="flex flex-col items-center justify-center h-full text-center opacity-20 py-20">
            <span class="text-7xl mb-6">🍽️</span>
            <p class="text-slate-900 font-black text-xl uppercase tracking-widest">Orden Vacía</p>
            <p class="text-sm text-slate-500 mt-2 font-medium">Toca los platos para agregarlos</p>
          </div>
          
          <div v-else v-for="item in pedido" :key="item.id"
            class="flex items-center gap-4 p-4 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] transition-all hover:border-indigo-100 hover:bg-indigo-50/10">
            <div class="w-14 h-14 rounded-2xl overflow-hidden bg-white shrink-0 flex items-center justify-center shadow-sm border border-slate-100">
              <img v-if="item.imagen" :src="item.imagen" class="w-full h-full object-cover" />
              <span v-else class="text-2xl">{{ item.es_paquete ? '🎁' : '🍽️' }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-black text-slate-800 uppercase tracking-tighter truncate leading-none mb-2">{{ item.nombre }}</p>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 bg-white rounded-xl p-1 border border-slate-100 shadow-sm">
                  <button @click="decrementar(item.id)" class="w-7 h-7 rounded-lg bg-slate-50 text-slate-400 text-xs font-black flex items-center justify-center hover:text-red-500 transition-colors">−</button>
                  <span class="text-xs font-black w-5 text-center text-slate-700">{{ item.cantidad }}</span>
                  <button @click="incrementar(item.id)" class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-black flex items-center justify-center hover:bg-indigo-100 transition-colors">+</button>
                </div>
                <p class="text-sm font-black text-slate-900">${{ (item.precio * item.cantidad).toFixed(2) }}</p>
              </div>
            </div>
            <button @click="eliminarDelPedido(item.id)" class="text-slate-300 hover:text-red-500 transition-all p-1">✕</button>
          </div>
        </div>

        <div class="p-6 border-t border-slate-100 bg-slate-50/30 space-y-4">
          <div v-if="pedido.length > 0" class="space-y-2">
            <div class="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
              <span>Subtotal</span>
              <span>${{ totalPedido.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-end py-2">
              <span class="text-sm font-black text-slate-900 uppercase tracking-widest">Total</span>
              <span class="text-3xl font-black text-indigo-600 leading-none">${{ totalPedido.toFixed(2) }}</span>
            </div>
          </div>
          
          <button @click="showCheckout = true" :disabled="pedido.length === 0"
            class="w-full py-5 bg-indigo-600 text-white text-xs font-black rounded-2xl hover:bg-indigo-700 hover:shadow-xl active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
            Confirmar Orden ✨
          </button>
          
          <div v-if="ordenConfirmada" class="p-3 bg-emerald-500 text-white text-[10px] font-black rounded-xl text-center uppercase tracking-widest animate-bounce">
            ¡Enviada correctamente!
          </div>
          <div v-if="errorOrden" class="p-3 bg-red-50 text-red-500 text-[10px] font-black rounded-xl text-center uppercase tracking-widest">
            {{ errorOrden }}
          </div>
          
          <button v-if="pedido.length > 0" @click="vaciarPedido" class="w-full py-2 text-[10px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest">
            Limpiar Carrito
          </button>
        </div>
      </div>
    </div>

    <!-- Botón flotante móvil -->
    <div v-if="pedido.length > 0" class="sm:hidden fixed bottom-6 left-6 right-6 z-20">
      <button @click="showCarritoMobile = true"
        class="w-full py-5 bg-slate-900 text-white rounded-3xl shadow-2xl flex items-center justify-between px-6 font-black animate-slide-up border border-slate-800">
        <span class="bg-indigo-500 text-white text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">{{ totalItems }} Items</span>
        <span class="uppercase tracking-widest text-xs">Ver Pedido</span>
        <span class="text-sm">${{ totalPedido.toFixed(2) }}</span>
      </button>
    </div>

    <!-- Modal Checkout -->
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

// --- Estado ---
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

const userRaw    = localStorage.getItem('user') ?? sessionStorage.getItem('user') ?? '{}'
const userActual = (() => { try { return JSON.parse(userRaw) } catch { return {} } })()
const empleadoId = userActual?.id ?? null

// --- Helpers ---
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
  localStorage.removeItem('token'); localStorage.removeItem('user')
  sessionStorage.removeItem('token'); sessionStorage.removeItem('user')
  router.push('/')
}

// --- Computed ---
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

const categoriasFiltradas = computed(() => {
  if (categoriaActiva.value === 'paquetes') return []
  return categoriaActiva.value === null ? categorias.value : categorias.value.filter(c => c.id === categoriaActiva.value)
})

const totalPedido = computed(() => pedido.value.reduce((s,i) => s + i.precio * i.cantidad, 0))
const totalItems  = computed(() => pedido.value.reduce((s,i) => s + i.cantidad, 0))

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

// --- API ---
const cargarRestauranteActivo = async () => {
  try {
    const res = await fetch(`${API_URL}/me`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) {
      const user = data.data || data
      const ra = user?.restaurante_activo
      if (ra && typeof ra === 'object') { restauranteSeleccionado.value = ra; return ra.id }
    }
    return null
  } catch { return null }
}

const cargarProductos = async (restauranteId) => {
  loading.value.productos = true
  try {
    const resDisp = await fetch(`${API_URL}/productos/disponibles?restaurante_id=${restauranteId}`, { headers: getHeaders() })
    const dispData = await resDisp.json()
    if (dispData.success && Array.isArray(dispData.data) && dispData.data.length > 0) {
      productos.value = dispData.data.map(normalizar); return
    }
    const resTodos = await fetch(`${API_URL}/productos?restaurante_id=${restauranteId}&per_page=100`, { headers: getHeaders() })
    const todosData = await resTodos.json()
    if (todosData.success) {
      let lista = todosData.data; if (!Array.isArray(lista)) lista = lista?.data ?? []
      productos.value = lista.map(normalizar)
    }
  } finally { loading.value.productos = false }
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
          imagen_url: oferta.producto?.imagen_url || null,
          precio_original: parseFloat(oferta.producto?.precio || 0),
          precio_oferta: parseFloat(oferta.precio_oferta || 0),
          descuento_porcentaje: oferta.descuento_porcentaje || 0,
          agotado: oferta.stock_limitado && oferta.stock_actual <= 0
        })).filter(o => !o.agotado)
    }
  } catch {}
}

const cargarPaquetes = async (restauranteId) => {
  try {
    const res = await fetch(`${API_URL}/paquetes?restaurante_id=${restauranteId}`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) { paquetes.value = (data.data || []).filter(p => p.activo) }
  } catch {}
}

// --- Carrito ---
const agregarAlPedido = (p) => {
  if (p.agotado) { mostrarError(`"${p.nombre}" agotado`); return }
  const existe = pedido.value.find(i => i.id === p.id)
  if (existe) { existe.cantidad++ } 
  else { pedido.value.push({ id:p.id, nombre:p.nombre, precio:parseFloat(p.precio), imagen:p.imagen_url?getImageUrl(p.imagen_url):null, cantidad:1, stock_maximo:p.stock }) }
}

const agregarOfertaAlPedido = (oferta) => {
  const existe = pedido.value.find(i => i.id === oferta.producto_id)
  if (existe) { existe.cantidad++; existe.precio = oferta.precio_oferta } 
  else {
    pedido.value.push({
      id: oferta.producto_id, nombre: oferta.nombre, precio: oferta.precio_oferta,
      imagen: oferta.imagen_url ? getImageUrl(oferta.imagen_url) : null,
      cantidad: 1, es_oferta: true, oferta_id: oferta.id
    })
  }
}

const agregarPaqueteAlPedido = (pkg) => {
  const existe = pedido.value.find(i => i.paquete_id === pkg.id)
  if (existe) { existe.cantidad++ } 
  else {
    pedido.value.push({
      id: `pkg_${pkg.id}`, paquete_id: pkg.id, nombre: pkg.nombre,
      precio: parseFloat(pkg.precio), imagen: pkg.imagen_url ? getImageUrl(pkg.imagen_url) : null,
      cantidad: 1, es_paquete: true
    })
  }
}

const incrementar = (id) => { const item = pedido.value.find(i => i.id === id); if (item) item.cantidad++ }
const decrementar = (id) => {
  const idx = pedido.value.findIndex(i => i.id === id)
  if (idx !== -1) { pedido.value[idx].cantidad > 1 ? pedido.value[idx].cantidad-- : pedido.value.splice(idx, 1) }
}
const eliminarDelPedido = (id) => { pedido.value = pedido.value.filter(i => i.id !== id) }
const vaciarPedido = () => { if (confirm('¿Vaciar todo el pedido?')) pedido.value = [] }

const handleCheckout = async (checkoutData) => {
  try {
    const body = {
      restaurante_id: restauranteSeleccionado.value.id,
      productos: pedido.value.map(i => ({ 
        producto_id: i.es_paquete ? null : (i.es_oferta ? i.id : i.id), 
        paquete_id: i.es_paquete ? i.paquete_id : null,
        cantidad: i.cantidad 
      })),
      metodo_pago: 'efectivo', tipo_entrega: 'comer_aqui',
      notas: checkoutData.notas || `Mesa ${checkoutData.numero_mesa}`,
      estado: 'ABIERTA', mesa: checkoutData.numero_mesa, usuario_id: empleadoId,
    }
    const res = await fetch(`${API_URL}/ordenes`, { method:'POST', headers:getHeaders(), body:JSON.stringify(body) })
    const data = await res.json()
    if (res.ok && data.success) { showCheckout.value = false; pedido.value = []; mostrarExito() } 
    else { checkoutRef.value?.setError(data.message || 'Error al enviar') }
  } catch { checkoutRef.value?.setError('Error de conexión') }
}

onMounted(async () => {
  const restId = await cargarRestauranteActivo()
  if (restId) { await Promise.all([cargarProductos(restId), cargarOfertas(restId), cargarPaquetes(restId)]) }
})
</script>

<style scoped>
.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-slide-up { animation: slideUp 0.3s ease-out; }
@keyframes slideUp { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>