<template>
  <div class="p-4 sm:p-6">

    <!-- Encabezado -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Nuevo Pedido</h1>
      <p class="text-gray-400 text-sm mt-0.5">Selecciona un cliente y agrega productos</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- ══ COLUMNA IZQUIERDA: Cliente + Productos ══ -->
      <div class="lg:col-span-2 space-y-5">

        <!-- Selector de cliente -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Cliente <span class="text-red-400">*</span>
          </label>

          <div class="flex gap-2">
            <select
              v-model="clienteId"
              class="flex-1 px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-white"
              :class="errorCliente ? 'border-red-400' : 'border-gray-200'"
            >
              <option :value="null">— Selecciona un cliente —</option>
              <option
                v-for="cliente in clientes"
                :key="cliente.value"
                :value="cliente.value"
              >
                {{ cliente.label }}
              </option>
            </select>

            <button
              @click="showClienteModal = true"
              class="px-4 py-2.5 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-xl hover:bg-indigo-100 transition whitespace-nowrap"
            >
              + Nuevo
            </button>
          </div>

          <p v-if="errorCliente" class="text-xs text-red-500 mt-1.5">
            Debes seleccionar un cliente
          </p>
        </div>

        <!-- Lista de productos -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-gray-800">Productos</h2>
            <!-- Buscador -->
            <div class="relative">
              <input
                v-model="busqueda"
                type="text"
                placeholder="Buscar..."
                class="pl-8 pr-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none w-44"
              />
              <svg class="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>

          <!-- Cargando -->
          <div v-if="loading" class="text-center py-10 text-gray-400 text-sm">
            Cargando productos...
          </div>

          <!-- Vacío -->
          <div v-else-if="productosFiltrados.length === 0" class="text-center py-10 text-gray-400 italic text-sm">
            No hay productos disponibles
          </div>

          <!-- Grid de productos -->
          <div v-else class="space-y-1">
            <button
              v-for="producto in productosFiltrados"
              :key="producto.id"
              @click="agregarAlCarrito(producto)"
              :disabled="!producto.stock || producto.stock <= 0"
              class="w-full flex items-center gap-3 p-3 rounded-xl transition text-left group"
              :class="(!producto.stock || producto.stock <= 0)
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-indigo-50 cursor-pointer'"
            >
              <!-- Imagen -->
              <div class="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                <img
                  v-if="resolveImageUrl(producto.imagen_url)"
                  :src="resolveImageUrl(producto.imagen_url)"
                  :alt="producto.nombre"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-2xl">🍽️</span>
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-800 text-sm">{{ producto.nombre }}</p>
                <p class="text-xs text-gray-400 truncate">
                  {{ producto.categoria?.nombre || 'Sin categoría' }}
                  <span v-if="producto.bajo_stock" class="text-amber-500 ml-1">⚠️ Bajo stock</span>
                </p>
              </div>

              <!-- Precio + acción -->
              <div class="flex items-center gap-3 shrink-0">
                <span class="font-semibold text-sm text-gray-800">
                  ${{ formatPrice(producto.precio) }}
                </span>
                <div
                  class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-bold group-hover:bg-indigo-600 group-hover:text-white transition"
                >
                  +
                </div>
              </div>
            </button>
          </div>

        </div>

      </div>

      <!-- ══ COLUMNA DERECHA: Carrito ══ -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-4">

          <h2 class="text-base font-semibold text-gray-800 mb-4">Pedido</h2>

          <!-- Vacío -->
          <div v-if="carrito.length === 0" class="text-center py-10">
            <span class="text-4xl block mb-2">🛒</span>
            <p class="text-gray-400 text-sm italic">Agrega productos</p>
          </div>

          <!-- Items -->
          <div v-else class="space-y-2 mb-4 max-h-80 overflow-y-auto pr-0.5">
            <div
              v-for="item in carrito"
              :key="item.id"
              class="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl"
            >
              <!-- Imagen miniatura -->
              <div class="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                <img v-if="item.imagen" :src="item.imagen" :alt="item.nombre" class="w-full h-full object-cover" />
                <span v-else class="text-sm">🍽️</span>
              </div>

              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-gray-800 truncate">{{ item.nombre }}</p>
                <!-- Controles cantidad -->
                <div class="flex items-center gap-1.5 mt-1">
                  <button
                    @click="decrementar(item.id)"
                    class="w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-xs hover:bg-gray-300 transition flex items-center justify-center"
                  >−</button>
                  <span class="text-xs font-semibold w-4 text-center">{{ item.cantidad }}</span>
                  <button
                    @click="incrementar(item.id)"
                    class="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs hover:bg-indigo-200 transition flex items-center justify-center"
                  >+</button>
                </div>
              </div>

              <div class="text-right shrink-0">
                <p class="text-xs font-bold text-gray-800">${{ formatPrice(item.precio * item.cantidad) }}</p>
                <button
                  @click="eliminarDelCarrito(item.id)"
                  class="text-gray-300 hover:text-red-400 text-xs transition mt-0.5"
                >✕</button>
              </div>
            </div>
          </div>

          <!-- Total -->
          <div v-if="carrito.length > 0" class="border-t border-gray-100 pt-4 mb-4">
            <div class="flex justify-between text-xs text-gray-400 mb-1">
              <span>{{ totalItems }} productos</span>
              <span>{{ carrito.length }} artículos</span>
            </div>
            <div class="flex justify-between font-bold text-base">
              <span>Total</span>
              <span class="text-indigo-600">${{ formatPrice(total) }}</span>
            </div>
          </div>

          <!-- Error API -->
          <div v-if="errorOrden" class="mb-3 p-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
            {{ errorOrden }}
          </div>

          <!-- Botón confirmar -->
          <button
            @click="crearOrden"
            :disabled="carrito.length === 0 || creando"
            class="w-full py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {{ creando ? 'Creando pedido...' : 'Confirmar Pedido' }}
          </button>

          <!-- Limpiar -->
          <button
            v-if="carrito.length > 0"
            @click="carrito = []"
            class="w-full mt-2 py-2 text-xs text-gray-400 hover:text-red-400 transition"
          >
            Vaciar carrito
          </button>

        </div>
      </div>

    </div>

    <!-- Modal cliente -->
    <ClienteModal
      v-if="showClienteModal"
      @close="showClienteModal = false"
      @saved="onClienteCreado"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { API_URL, STORAGE_URL } from '@/config/api'

// ── Helper: Resolver URLs de imágenes ───────────────────────────────────────────
const resolveImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http') || path.startsWith('data:')) return path
  if (path.startsWith('/storage/')) return `${STORAGE_URL}${path.replace(/^\/?storage\//, '')}`
  return `${STORAGE_URL}${path}`
}

// ── Estado ────────────────────────────────────────────────────────────────────
const productos        = ref([])
const clientes         = ref([])
const carrito          = ref([])
const clienteId        = ref(null)
const busqueda         = ref('')
const errorCliente     = ref(false)
const errorOrden       = ref('')
const showClienteModal = ref(false)
const loading          = ref(true)
const creando          = ref(false)

// ── Helpers ───────────────────────────────────────────────────────────────────
const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

const formatPrice = (v) => Number(v || 0).toFixed(2)

// ── Computed ──────────────────────────────────────────────────────────────────
const productosFiltrados = computed(() => {
  if (!busqueda.value) return productos.value
  const t = busqueda.value.toLowerCase()
  return productos.value.filter(p =>
    p.nombre?.toLowerCase().includes(t) ||
    p.categoria?.nombre?.toLowerCase().includes(t)
  )
})

const total = computed(() =>
  carrito.value.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
)

const totalItems = computed(() =>
  carrito.value.reduce((sum, i) => sum + i.cantidad, 0)
)

// ── API ───────────────────────────────────────────────────────────────────────
const cargarProductos = async () => {
  loading.value = true
  try {
    const res  = await fetch(`${API_URL}/productos`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) productos.value = data.data || []
  } catch (e) { console.error('Error productos:', e) }
  finally { loading.value = false }
}

const cargarClientes = async () => {
  try {
    const res  = await fetch(`${API_URL}/clientes/select-list`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) clientes.value = data.data || []
  } catch (e) { console.error('Error clientes:', e) }
}

// ── Carrito ───────────────────────────────────────────────────────────────────
const agregarAlCarrito = (producto) => {
  if (!producto.stock || producto.stock <= 0) return
  const existente = carrito.value.find(i => i.id === producto.id)
  if (existente) {
    existente.cantidad++
  } else {
    carrito.value.push({
      id:       producto.id,
      nombre:   producto.nombre,
      precio:   Number(producto.precio),
      imagen:   resolveImageUrl(producto.imagen_url) || null,
      cantidad: 1,
    })
  }
}

const incrementar = (id) => {
  const item = carrito.value.find(i => i.id === id)
  if (item) item.cantidad++
}

const decrementar = (id) => {
  const i = carrito.value.findIndex(item => item.id === id)
  if (i === -1) return
  if (carrito.value[i].cantidad > 1) carrito.value[i].cantidad--
  else carrito.value.splice(i, 1)
}

const eliminarDelCarrito = (id) => {
  carrito.value = carrito.value.filter(i => i.id !== id)
}

// ── Crear orden ───────────────────────────────────────────────────────────────
const crearOrden = async () => {
  errorOrden.value = ''
  if (!clienteId.value) { errorCliente.value = true; return }
  errorCliente.value = false
  creando.value = true

  try {
    const res  = await fetch(`${API_URL}/ordenes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        cliente_id:  clienteId.value,
        productos:   carrito.value.map(item => ({ producto_id: item.id, cantidad: item.cantidad })),
        mesa:        null,
        metodo_pago: null,
        propina:     0,
      }),
    })
    const data = await res.json()
    if (res.ok && data.success) {
      carrito.value  = []
      clienteId.value = null
    } else {
      errorOrden.value = data.message || 'Error al crear el pedido'
    }
  } catch (e) {
    errorOrden.value = 'Error de conexión'
  } finally {
    creando.value = false
  }
}

// ── Modal cliente ─────────────────────────────────────────────────────────────
const onClienteCreado = (nuevoCliente) => {
  showClienteModal.value = false
  cargarClientes()
  clienteId.value = nuevoCliente.id
}

onMounted(() => {
  cargarProductos()
  cargarClientes()
})
</script>