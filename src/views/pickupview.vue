<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-800/50 flex flex-col" :style="{ zoom }">

    <!-- MARQUESITA -->
    <MarquesitaWidget
      :api-url="API_URL"
      :get-headers="getHeaders"
      tipo="cliente"
      :variant="marquesinaVariant"
      :restaurante-id="restauranteSeleccionado?.id || null"
    />

    <!-- HEADER -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-20">
      <div class="w-full h-28 bg-gradient-to-br from-amber-500 to-orange-600 relative flex items-end px-5 pb-4">
        <div class="flex items-center gap-3">
          <div v-if="restauranteSeleccionado?.imagen" class="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg shrink-0">
            <img v-if="restauranteSeleccionado?.imagen" :src="getImageUrl(restauranteSeleccionado.imagen)" class="w-full h-full object-cover" @error="onImageError" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-white leading-tight">{{ restauranteSeleccionado?.nombre || 'Pedido para llevar' }}</h1>
            <p class="text-white/70 text-xs mt-0.5">📍 Recoge en local</p>
          </div>
        </div>
      </div>

      <!-- CATEGORY FILTERS -->
      <div class="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide bg-gray-50 dark:bg-gray-800/50">
        <button @click="categoriaActiva = null"
          :class="['px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition shrink-0',
            categoriaActiva === null ? 'bg-amber-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600']">
          Todos
        </button>
        <button v-for="cat in categorias" :key="cat.id" @click="categoriaActiva = cat.id"
          :class="['px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition shrink-0 border',
            categoriaActiva === cat.id ? 'text-white border-transparent' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700']"
          :style="categoriaActiva === cat.id ? { backgroundColor: cat.color || '#d97706' } : {}">
          {{ cat.icono ? cat.icono + ' ' : '' }}{{ cat.nombre }}
        </button>
      </div>
    </div>

    <!-- PRODUCTS + CART LAYOUT -->
    <div class="flex flex-1 overflow-hidden">
      <!-- PRODUCT LIST -->
      <div class="flex-1 overflow-y-auto p-4 space-y-6">
        <LoadingSpinner v-if="loading.productos" text="Cargando menú..." />
        <div v-else-if="categoriasFiltradas.length === 0" class="text-center py-20">
          <span class="text-5xl block mb-3">😔</span>
          <p class="text-gray-500 font-medium">Sin productos disponibles</p>
        </div>
        <div v-else v-for="cat in categoriasFiltradas" :key="cat.id">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
              :style="{ backgroundColor: (cat.color||'#d97706')+'22', border:`2px solid ${cat.color||'#d97706'}` }">
              {{ cat.icono || '📦' }}
            </div>
            <h3 class="font-bold text-gray-800 dark:text-gray-200">{{ cat.nombre }}</h3>
            <div class="flex-1 h-px bg-gray-100 dark:bg-gray-700"></div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button v-for="p in cat.productos" :key="p.id"
              @click="agregarAlPedido(p)"
              :disabled="p.agotado"
              class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex gap-3 p-3 text-left hover:shadow-md transition-all group disabled:opacity-50 disabled:cursor-not-allowed">
              <div class="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 flex items-center justify-center">
                <img v-if="p.imagen_url" :src="getImageUrl(p.imagen_url)" :alt="p.nombre"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  @error="onImageError" />
                <span v-else class="text-3xl">🍽️</span>
              </div>
              <div class="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <p class="font-semibold text-gray-800 dark:text-gray-200 text-sm leading-tight">{{ p.nombre }}</p>
                  <p class="text-xs text-gray-400 mt-0.5 line-clamp-2">{{ p.descripcion || 'Sin descripción' }}</p>
                  <p v-if="p.bajo_stock && !p.agotado" class="text-[10px] text-amber-500 mt-1">⚠️ Últimas unidades</p>
                </div>
                <div class="flex items-center justify-between mt-2">
                  <span class="font-bold text-amber-600">${{ Number(p.precio||0).toFixed(2) }}</span>
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition"
                    :class="!p.agotado ? 'bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'">
                    {{ !p.agotado ? '+' : '✕' }}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- DESKTOP CART SIDEBAR -->
      <div class="hidden lg:flex w-96 shrink-0 bg-white dark:bg-gray-800 border-l border-gray-100 dark:border-gray-700 flex-col shadow-sm">
        <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 class="font-bold text-gray-800 dark:text-gray-200">Tu pedido</h3>
          <p class="text-xs text-gray-400 mt-0.5">{{ restauranteSeleccionado?.nombre }}</p>
        </div>
        <div class="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          <div v-if="pedido.length === 0" class="flex flex-col items-center justify-center h-full py-10 text-center">
            <span class="text-4xl mb-3">🛒</span>
            <p class="text-gray-400 text-sm">Agrega productos<br>para comenzar</p>
          </div>
          <div v-else v-for="item in pedido" :key="item.id"
            class="flex items-center gap-2.5 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 flex items-center justify-center">
              <img v-if="item.imagen" :src="item.imagen" :alt="item.nombre" class="w-full h-full object-cover" @error="onImageError" />
              <span v-else class="text-lg">🍽️</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{{ item.nombre }}</p>
              <div class="flex items-center gap-1.5 mt-1.5">
                <button @click="decrementar(item.id)"
                  class="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs hover:bg-gray-300 transition flex items-center justify-center font-bold">−</button>
                <span class="text-xs font-bold w-4 text-center">{{ item.cantidad }}</span>
                <button @click="incrementar(item.id)"
                  class="w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-xs hover:bg-amber-200 transition flex items-center justify-center font-bold">+</button>
              </div>
            </div>
            <div class="text-right shrink-0">
              <p class="text-xs font-bold text-gray-800 dark:text-gray-200">${{ (item.precio * item.cantidad).toFixed(2) }}</p>
              <button @click="eliminarDelPedido(item.id)" class="text-gray-300 hover:text-red-400 transition text-xs mt-0.5 block ml-auto">✕</button>
            </div>
          </div>
        </div>
        <div class="px-4 py-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
          <template v-if="pedido.length > 0">
            <div class="flex justify-between font-bold text-base">
              <span>Total</span>
              <span class="text-amber-600">${{ totalPedido.toFixed(2) }}</span>
            </div>
            <textarea v-model="notaGeneral" rows="2" placeholder="📝 Nota general del pedido..."
              class="w-full text-xs px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-amber-400 focus:outline-none resize-none"></textarea>
          </template>
          <button @click="showCheckout = true" :disabled="pedido.length === 0"
            class="w-full py-3 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 transition disabled:opacity-40 disabled:cursor-not-allowed">
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

    <!-- MOBILE FLOATING CART BUTTON -->
    <div v-if="pedido.length > 0" class="lg:hidden fixed bottom-5 left-4 right-4 z-20">
      <button @click="showCarritoMobile = true"
        class="w-full py-4 bg-amber-600 text-white rounded-2xl shadow-xl flex items-center justify-between px-5 font-semibold animate-slide-up">
        <span class="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{{ totalItems }}</span>
        <span>Ver pedido</span>
        <span class="font-bold">${{ totalPedido.toFixed(2) }}</span>
      </button>
    </div>

    <!-- MOBILE CART MODAL -->
    <div v-if="showCarritoMobile" class="lg:hidden fixed inset-0 bg-black/50 z-30 flex items-end animate-fade-in"
      @click.self="showCarritoMobile = false">
      <div class="bg-white dark:bg-gray-800 w-full rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto animate-slide-up">
        <div class="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-gray-800 pb-2">
          <h3 class="font-bold text-gray-800 dark:text-gray-200">Tu pedido</h3>
          <button @click="showCarritoMobile = false" class="text-gray-400 text-xl hover:text-gray-600">✕</button>
        </div>
        <div class="space-y-2 mb-4 max-h-[45vh] overflow-y-auto">
          <div v-for="item in pedido" :key="item.id" class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div class="flex-1">
              <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ item.nombre }}</p>
              <p class="text-xs text-gray-400">${{ item.precio.toFixed(2) }} c/u</p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="decrementar(item.id)" class="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 text-sm flex items-center justify-center font-bold">−</button>
              <span class="text-sm font-bold w-5 text-center">{{ item.cantidad }}</span>
              <button @click="incrementar(item.id)" class="w-6 h-6 rounded-full bg-amber-100 text-amber-600 text-sm flex items-center justify-center font-bold">+</button>
            </div>
            <span class="text-sm font-bold text-gray-800 dark:text-gray-200 w-16 text-right">${{ (item.precio * item.cantidad).toFixed(2) }}</span>
          </div>
        </div>
        <div class="flex justify-between font-bold text-lg mb-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span>Total</span>
          <span class="text-amber-600">${{ totalPedido.toFixed(2) }}</span>
        </div>
        <textarea v-model="notaGeneral" rows="2" placeholder="📝 Nota general del pedido..."
          class="w-full text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-amber-400 focus:outline-none resize-none mb-3"></textarea>
        <button @click="showCheckout = true; showCarritoMobile = false"
          class="w-full py-3.5 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-700 transition">
          Ir a pagar 💳
        </button>
        <div v-if="ordenConfirmada" class="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium rounded-xl text-center">
          ✅ ¡Pedido enviado correctamente!
        </div>
        <div v-if="errorOrden" class="mt-3 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-xl text-center">
          ❌ {{ errorOrden }}
        </div>
      </div>
    </div>

    <!-- CHECKOUT MODAL -->
    <PickupCheckoutModal
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MarquesitaWidget    from '../components/MarquesitaWidget.vue'
import PickupCheckoutModal from '../components/pickup/PickupCheckoutModal.vue'
import LoadingSpinner      from '../components/ui/LoadingSpinner.vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
import { STORAGE_URL } from '@/config/api'
import { apiClient } from '@/utils/apiClient'
import { getHeaders } from '@/config/api'
import { useDeviceZoom } from '@/composables/useDeviceZoom'

const { zoom } = useDeviceZoom()

const restauranteSeleccionado = ref(null)
const productos               = ref([])
const pedido                  = ref([])
const categoriaActiva         = ref(null)
const showCarritoMobile       = ref(false)
const ordenConfirmada         = ref(false)
const errorOrden              = ref('')
const notaGeneral             = ref('')
const loading                 = ref({ productos: true })
const showCheckout            = ref(false)
const checkoutRef             = ref(null)
const marquesinaVariant       = ref(localStorage.getItem('marquesina_variant') || 'dark')
let pollTimer = null
const POLL_INTERVAL = 5000

const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${STORAGE_URL}${path.replace(/^\/?storage\//, '')}`
}
const onImageError = (e) => { e.target.style.display = 'none' }
const mostrarError = (msg, dur = 4000) => { errorOrden.value = msg; setTimeout(() => { if(errorOrden.value===msg) errorOrden.value='' }, dur) }
const mostrarExito = () => { ordenConfirmada.value = true; setTimeout(() => { ordenConfirmada.value = false }, 3000) }

const categorias = computed(() => {
  const mapa = new Map()
  productos.value.forEach(p => {
    if (!p.categoria) return
    const id = p.categoria.id
    if (!mapa.has(id)) mapa.set(id, { id, nombre:p.categoria.nombre, color:p.categoria.color||'#d97706', icono:p.categoria.icono||'📦', orden:p.categoria.orden??99, productos:[] })
    mapa.get(id).productos.push(p)
  })
  return [...mapa.values()].sort((a,b) => a.orden - b.orden)
})

const categoriasFiltradas = computed(() =>
  categoriaActiva.value === null ? categorias.value : categorias.value.filter(c => c.id === categoriaActiva.value)
)

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
    color:  p.categoria.color  || '#d97706',
    icono:  p.categoria.icono  || '📦',
    orden:  p.categoria.orden  ?? 99,
  } : null,
})

const cargarRestauranteActivo = async () => {
  try {
    const data = await apiClient.get('/me')
    if (data?.success) {
      const userData = data.data || data
      if (userData.restaurante) {
        restauranteSeleccionado.value = userData.restaurante
        return userData.restaurante.id
      }
      const ra = userData.restaurante_activo
      if (ra) {
        const id = typeof ra === 'object' ? ra.id : ra
        restauranteSeleccionado.value = typeof ra === 'object' ? ra : { id, nombre: 'Restaurante' }
        return id
      }
      const listaRest = userData.restaurantes
      if (Array.isArray(listaRest) && listaRest.length > 0) {
        restauranteSeleccionado.value = listaRest[0]
        return listaRest[0].id
      }
    }
    const savedId = localStorage.getItem('restaurante_id_activo') || localStorage.getItem('restaurante_id')
    if (savedId) return savedId
    return null
  } catch {
    mostrarError('Error al cargar el restaurante')
    return null
  }
}

const cargarProductos = async (restauranteId, silent = true) => {
  if (!silent) { loading.value.productos = true; productos.value = [] }
  try {
    const dispData = await apiClient.get(`/productos/disponibles?restaurante_id=${restauranteId}`)
    if (dispData?.success && Array.isArray(dispData.data) && dispData.data.length > 0) {
      productos.value = dispData.data.map(normalizar)
      return
    }
    const todosData = await apiClient.get(`/productos?restaurante_id=${restauranteId}&per_page=100`)
    if (todosData?.success) {
      let lista = todosData.data
      if (!Array.isArray(lista)) lista = lista?.data ?? []
      productos.value = lista.map(normalizar)
    }
  } catch (e) {
    mostrarError('Error al cargar el menú')
  } finally {
    if (!silent) loading.value.productos = false
  }
}

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
    checkoutRef.value?.setError('No hay restaurante seleccionado')
    return
  }
  try {
    const body = {
      restaurante_id: restauranteSeleccionado.value.id,
      productos:      pedido.value.map(i => ({ producto_id: i.id, cantidad: i.cantidad, notas: null })),
      metodo_pago:    checkoutData.metodo_pago,
      tipo_orden:     'pickup',
      notas:          checkoutData.notas || null,
      programado_para: checkoutData.programado_para || null,
    }

    // Crear la orden
    const orden = await apiClient.post('/ordenes', body)

    if (!orden?.success) {
      const msg = orden.errors
        ? Object.values(orden.errors).flat().join('. ')
        : orden.message || 'Error al procesar el pedido'
      checkoutRef.value?.setError(msg)
      return
    }

    // Si es pago online, procesar pasarela
    if (checkoutData.online) {
      const ordenId = orden.data?.id || orden.orden?.id
      if (!ordenId) {
        checkoutRef.value?.setError('Error al obtener la orden')
        return
      }

      const items = pedido.value.map(i => ({
        name: i.nombre,
        quantity: i.cantidad,
        unit_amount: i.precio,
      }))

      let gatewayResponse

      if (checkoutData.metodo_pago === 'paypal') {
        gatewayResponse = await apiClient.post(`/ordenes/${ordenId}/pagar`, {
          pasarela: 'paypal',
          total: totalPedido.value,
          items,
        })
      } else {
        gatewayResponse = await apiClient.post(`/ordenes/${ordenId}/pagar`, {
          pasarela: 'mercadopago',
          total: totalPedido.value,
          items,
        })
      }

      if (gatewayResponse?.success && gatewayResponse.redirect_url) {
        window.location.href = gatewayResponse.redirect_url
      } else {
        checkoutRef.value?.setError(gatewayResponse?.message || 'Error al iniciar el pago')
      }
      return
    }

    // Pago offline: mostrar éxito
    showCheckout.value = false
    pedido.value = []
    notaGeneral.value = ''
    mostrarExito()
    if (restauranteSeleccionado.value?.id) {
      cargarProductos(restauranteSeleccionado.value.id, true)
    }
  } catch (e) {
    checkoutRef.value?.setError('Error de conexión')
  }
}

onMounted(async () => {
  const restId = await cargarRestauranteActivo()
  if (restId) {
    await cargarProductos(restId, false)
  }

  const poll = async () => {
    marquesinaVariant.value = localStorage.getItem('marquesina_variant') || 'dark'
    if (restauranteSeleccionado.value?.id) {
      await cargarProductos(restauranteSeleccionado.value.id, true)
    }
    pollTimer = setTimeout(poll, POLL_INTERVAL)
  }
  pollTimer = setTimeout(poll, POLL_INTERVAL)

  const handleStorageEvent = (e) => {
    if (e.key === 'marquesina_variant') {
      marquesinaVariant.value = e.newValue || 'dark'
    }
  }
  window.addEventListener('storage', handleStorageEvent)
  onMounted._handleStorage = handleStorageEvent
})

onUnmounted(() => {
  if (pollTimer) clearTimeout(pollTimer)
  if (onMounted._handleStorage) {
    window.removeEventListener('storage', onMounted._handleStorage)
  }
})
</script>

<style scoped>
@keyframes fade-in  { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
@keyframes slide-up { from { opacity:0; transform:translateY(100%); } to { opacity:1; transform:translateY(0); } }
.animate-fade-in   { animation: fade-in  0.3s ease-out; }
.animate-slide-up  { animation: slide-up 0.3s ease-out; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
</style>
