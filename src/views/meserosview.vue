<template>
  <div class="p-4 sm:p-6 space-y-5">

    <!-- ══ TOASTS ══ -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div v-for="toast in toasts" :key="toast.id"
        :class="['px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[280px] max-w-sm animate-slide-in',
          toast.type==='success' ? 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800' :
          toast.type==='error'   ? 'bg-red-50 border-l-4 border-red-500 text-red-800'             :
          'bg-blue-50 border-l-4 border-blue-500 text-blue-800']">
        <span>{{ toast.type==='success' ? '✅' : toast.type==='error' ? '❌' : 'ℹ️' }}</span>
        <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="text-gray-400 hover:text-gray-600">×</button>
      </div>
    </div>

    <!-- ══ CAJA CERRADA — BLOQUEO ══ -->
    <div v-if="!loadingCaja && !cajaAbierta"
      class="flex flex-col items-center justify-center min-h-[70vh] text-center gap-5">
      <div class="w-24 h-24 rounded-3xl bg-red-50 flex items-center justify-center text-5xl shadow-sm">
        🔒
      </div>
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Caja cerrada</h2>
        <p class="text-gray-400 text-sm mt-2 max-w-xs">
          No se pueden registrar órdenes mientras la caja esté cerrada.
          Pide al cajero que abra la caja para comenzar.
        </p>
      </div>
      <button @click="verificarCaja"
        class="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition">
        🔄 Verificar estado
      </button>
    </div>

    <!-- ══ CARGANDO CAJA ══ -->
    <div v-else-if="loadingCaja" class="flex items-center justify-center min-h-[70vh] gap-3">
      <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p class="text-gray-400 text-sm">Verificando caja...</p>
    </div>

    <!-- ══ CONTENIDO NORMAL (caja abierta) ══ -->
    <template v-else>

      <!-- Encabezado -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Órdenes del día</h1>
          <p class="text-gray-400 text-sm mt-0.5">{{ fechaHoy }}</p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Badge caja abierta -->
          <span class="px-3 py-1.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700">
            🟢 Caja abierta
          </span>
          <button
            @click="vistaActual = 'nueva'"
            class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition shadow-sm"
          >
            <span class="text-base leading-none">＋</span>
            Nueva Orden
          </button>
        </div>
      </div>

      <!-- ══ VISTA ÓRDENES ══ -->
      <div v-if="vistaActual === 'ordenes'">

        <!-- Pills de estado -->
        <div class="flex gap-2 flex-wrap">
          <button v-for="tab in tabs" :key="tab.key" @click="tabActivo = tab.key"
            :class="['flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition border',
              tabActivo === tab.key
                ? 'text-white border-transparent shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300']"
            :style="tabActivo === tab.key ? { backgroundColor: tab.color } : {}">
            <span>{{ tab.icon }}</span>
            {{ tab.label }}
            <span class="text-xs font-bold px-1.5 py-0.5 rounded-full"
              :class="tabActivo === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'">
              {{ contarOrdenes(tab.key) }}
            </span>
          </button>
        </div>

        <!-- Cargando órdenes -->
        <div v-if="loading" class="flex items-center justify-center py-16 gap-3">
          <div class="w-7 h-7 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p class="text-gray-400 text-sm">Cargando órdenes...</p>
        </div>

        <!-- Sin órdenes -->
        <div v-else-if="ordenesFiltradas.length === 0"
          class="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <span class="text-5xl block mb-3">{{ tabActual?.icon }}</span>
          <p class="text-gray-500 font-medium">Sin órdenes {{ tabActual?.label?.toLowerCase() }}</p>
          <p class="text-gray-400 text-sm mt-1">Las órdenes aparecerán aquí cuando cambien de estado</p>
        </div>

        <!-- Grid de órdenes -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <div v-for="orden in ordenesFiltradas" :key="orden.id"
            class="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col"
            :class="borderColor(orden.estado)">

            <!-- Header tarjeta -->
            <div class="px-4 py-3 flex items-center justify-between" :class="bgEstado(orden.estado)">
              <div class="flex items-center gap-2">
                <span class="text-lg">{{ iconEstado(orden.estado) }}</span>
                <div>
                  <p class="text-xs font-bold text-gray-600">{{ orden.folio || 'Orden #'+orden.id }}</p>
                  <p class="text-[10px] text-gray-400">{{ formatHora(orden.created_at) }}</p>
                </div>
              </div>
              <span class="text-[10px] font-bold px-2.5 py-1 rounded-full" :class="badgeEstado(orden.estado)">
                {{ labelEstado(orden.estado) }}
              </span>
            </div>

            <!-- Contenido -->
            <div class="px-4 py-3 flex-1 space-y-2">
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <span class="text-base">👤</span>
                <span class="font-medium">{{ nombreOrden(orden) }}</span>
              </div>
              <div v-if="orden.mesa" class="flex items-center gap-2 text-sm text-gray-500">
                <span class="text-base">🪑</span>
                <span>Mesa {{ orden.mesa }}</span>
              </div>
              <div class="space-y-1 mt-2">
                <div v-for="detalle in (orden.detalles || []).slice(0, 3)" :key="detalle.id"
                  class="flex items-center justify-between text-xs text-gray-600">
                  <span class="truncate flex-1">{{ detalle.cantidad }}× {{ detalle.producto_nombre || detalle.producto?.nombre }}</span>
                  <span class="font-semibold ml-2 shrink-0">{{ detalle.subtotal_formateado }}</span>
                </div>
                <p v-if="(orden.detalles || []).length > 3" class="text-[10px] text-gray-400 italic">
                  +{{ (orden.detalles || []).length - 3 }} más...
                </p>
              </div>
              <div class="flex justify-between items-center pt-2 border-t border-gray-50">
                <span class="text-xs text-gray-500">Total</span>
                <span class="font-bold text-indigo-600">
                  {{ orden.total_formateado || '$'+Number(orden.total||0).toFixed(2) }}
                </span>
              </div>
            </div>

            <!-- Acciones -->
            <div class="px-4 pb-4">
              <button v-if="siguienteEstado(orden.estado)"
                @click="cambiarEstado(orden.id, siguienteEstado(orden.estado))"
                :disabled="cambiando === orden.id"
                class="w-full py-2.5 text-sm font-semibold rounded-xl transition disabled:opacity-50"
                :class="btnEstado(orden.estado)">
                {{ cambiando === orden.id ? 'Actualizando...' : accionEstado(orden.estado) }}
              </button>
              <div v-else class="w-full py-2.5 text-sm font-medium text-center rounded-xl bg-gray-50 text-gray-400">
                {{ ['POR_PREPARAR', 'EN_PREPARACION'].includes(orden.estado) ? 'En manos de estación' : orden.estado === 'ENTREGADA' ? 'Esperando cobro' : orden.estado === 'CERRADA' ? '✅ Orden cerrada' : '—' }}
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- ══ NUEVA ORDEN ══ -->
      <div v-else-if="vistaActual === 'nueva'">

        <div class="flex items-center gap-3 mb-5">
          <button @click="vistaActual = 'ordenes'"
            class="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition text-gray-600">
            ←
          </button>
          <h2 class="text-lg font-bold text-gray-800">Nueva Orden</h2>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

          <!-- Productos -->
          <div class="lg:col-span-2 space-y-4">

            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Cliente <span class="text-gray-400 font-normal text-xs">(opcional)</span>
              </label>
              <select v-model="nuevaOrden.clienteId"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                <option :value="null">— Sin cliente —</option>
                <option v-for="c in clientes" :key="c.value" :value="c.value">{{ c.label }}</option>
              </select>
              <label class="block text-sm font-semibold text-gray-700 mt-3 mb-2">Mesa</label>
              <input v-model="nuevaOrden.mesa" type="number" min="1" placeholder="Número de mesa (opcional)"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>

            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-800">Productos</h3>
                <input v-model="busqueda" type="text" placeholder="Buscar..."
                  class="pl-3 pr-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none w-36" />
              </div>
              <div v-if="loadingProductos" class="text-center py-8 text-gray-400 text-sm">Cargando...</div>
              <div v-else class="space-y-1">
                <button v-for="p in productosFiltrados" :key="p.id"
                  @click="agregarAlCarrito(p)"
                  class="w-full flex items-center gap-3 p-3 rounded-xl transition text-left group hover:bg-indigo-50">
                  <div class="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                    <img v-if="p.imagen_url" :src="resolveImageUrl(p.imagen_url)" :alt="p.nombre" class="w-full h-full object-cover" />
                    <span v-else class="text-xl">🍽️</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-800 text-sm">{{ p.nombre }}</p>
                    <p class="text-xs text-gray-400">{{ p.categoria?.nombre || 'Sin categoría' }}</p>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <span class="font-semibold text-sm">${{ Number(p.precio).toFixed(2) }}</span>
                    <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold group-hover:bg-indigo-600 group-hover:text-white transition">+</div>
                  </div>
                </button>
              </div>
            </div>

          </div>

          <!-- Carrito -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-4 h-fit">
            <h3 class="font-semibold text-gray-800 mb-4">Resumen</h3>

            <div v-if="carrito.length === 0" class="text-center py-10 text-gray-400 text-sm italic">
              <span class="text-3xl block mb-2">🛒</span>
              Agrega productos
            </div>

            <div v-else class="space-y-2 mb-4 max-h-72 overflow-y-auto">
              <div v-for="item in carrito" :key="item.id"
                class="p-2.5 bg-gray-50 rounded-xl space-y-1.5">
              <div class="flex items-center gap-2.5">
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-gray-800 truncate">{{ item.nombre }}</p>
                  <div class="flex items-center gap-1.5 mt-1">
                    <button @click="decrementar(item.id)"
                      class="w-5 h-5 rounded-full bg-gray-200 text-xs flex items-center justify-center font-bold hover:bg-gray-300">−</button>
                    <span class="text-xs font-bold w-4 text-center">{{ item.cantidad }}</span>
                    <button @click="incrementar(item.id)"
                      class="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-bold hover:bg-indigo-200">+</button>
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-xs font-bold">${{ Number(item.precio * item.cantidad).toFixed(2) }}</p>
                  <button @click="eliminarDelCarrito(item.id)" class="text-gray-300 hover:text-red-400 text-xs">✕</button>
                </div>
              </div>
              <!-- Nota por producto -->
              <input v-model="item.nota" type="text" placeholder="📝 Nota (sin cebolla, extra salsa...)"
                class="w-full text-[11px] px-2 py-1 border border-gray-200 rounded-lg bg-white focus:ring-1 focus:ring-indigo-400 focus:outline-none text-gray-600 placeholder-gray-400" />
            </div>
            </div>

            <div v-if="carrito.length > 0" class="border-t border-gray-100 pt-3 mb-4">
              <div class="flex justify-between font-bold">
                <span>Total</span>
                <span class="text-indigo-600">${{ Number(totalCarrito).toFixed(2) }}</span>
              </div>
            </div>

            <!-- Nota general de la orden -->
            <div v-if="carrito.length > 0" class="mb-3">
              <textarea v-model="notaGeneral" rows="2"
                placeholder="📝 Nota general del pedido (alergias, preferencias...)"
                class="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-600 placeholder-gray-400 resize-none"></textarea>
            </div>

            <div v-if="errorNuevaOrden" class="mb-3 p-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
              {{ errorNuevaOrden }}
            </div>

            <button @click="crearOrden" :disabled="carrito.length === 0 || creando"
              class="w-full py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-40">
              {{ creando ? 'Creando...' : 'Confirmar Orden' }}
            </button>

            <button v-if="carrito.length > 0" @click="carrito = []"
              class="w-full mt-2 py-1.5 text-xs text-gray-400 hover:text-red-400 transition">
              Vaciar
            </button>
          </div>

        </div>

      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { API_URL, STORAGE_URL } from '@/config/api'

// ── Estado ────────────────────────────────────────────────────────────────────
const vistaActual      = ref('ordenes')
const tabActivo        = ref('todas')
const ordenes          = ref([])
const productos        = ref([])
const clientes         = ref([])
const carrito          = ref([])
const busqueda         = ref('')
const loading          = ref(true)
const loadingCaja      = ref(true)   // ← nuevo: estado de caja
const loadingProductos = ref(true)
const creando          = ref(false)
const cambiando        = ref(null)
const toasts           = ref([])
const currentUser      = ref(null)
const cajaAbierta      = ref(false)  // ← nuevo: bloqueo

const nuevaOrden      = ref({ clienteId: null, mesa: null })
const errorNuevaOrden = ref('')
const notaGeneral     = ref('')

// ── Toasts ────────────────────────────────────────────────────────────────────
const showToast = (message, type = 'info', duration = 3500) => {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  if (duration > 0) setTimeout(() => removeToast(id), duration)
}
const removeToast = (id) => { toasts.value = toasts.value.filter(t => t.id !== id) }

// ── Helpers ───────────────────────────────────────────────────────────────────
const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  const restId = localStorage.getItem('restaurante_id_activo')
  return { 
    'Content-Type': 'application/json', 
    'Accept': 'application/json', 
    'Authorization': token ? `Bearer ${token}` : '',
    'X-Restaurante-Id': restId || ''
  }
}
const fechaHoy = computed(() =>
  new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

// Nombre: user.name > cliente.nombre > 'Sin asignar'
const nombreOrden = (orden) => {
  if (orden.user?.name)      return orden.user.name
  if (orden.user?.nombre)    return orden.user.nombre
  if (orden.usuario?.name)   return orden.usuario.name
  if (orden.cliente?.nombre) return orden.cliente.nombre
  if (orden.cliente?.name)   return orden.cliente.name
  if (orden.user_id && currentUser.value?.id === orden.user_id) return currentUser.value.name
  return 'Sin asignar'
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
const tabs = [
  { key: 'todas',          label: 'Todas',           icon: '📋', color: '#6366f1' },
  { key: 'ABIERTA',        label: 'Nuevas',          icon: '📝', color: '#fcd34d' },
  { key: 'POR_PREPARAR',   label: 'Por preparar',    icon: '🟡', color: '#f59e0b' },
  { key: 'EN_PREPARACION', label: 'En preparación',  icon: '🔥', color: '#f97316' },
  { key: 'LISTA',          label: 'Listas',          icon: '✅', color: '#10b981' },
  { key: 'ENTREGADA',      label: 'Entregadas',      icon: '🏁', color: '#8b5cf6' },
]
const tabActual        = computed(() => tabs.find(t => t.key === tabActivo.value))
const contarOrdenes    = (key) => key === 'todas' ? ordenes.value.length : ordenes.value.filter(o => o.estado === key).length
const ordenesFiltradas = computed(() =>
  tabActivo.value === 'todas' ? ordenes.value : ordenes.value.filter(o => o.estado === tabActivo.value)
)

// ── Estilos ───────────────────────────────────────────────────────────────────
const bgEstado    = (e) => ({ ABIERTA:'bg-yellow-50', POR_PREPARAR:'bg-amber-50', EN_PREPARACION:'bg-orange-50', LISTA:'bg-emerald-50', ENTREGADA:'bg-purple-50', CERRADA:'bg-gray-50' }[e] || 'bg-gray-50')
const borderColor = (e) => ({ ABIERTA:'border-yellow-200', POR_PREPARAR:'border-amber-200', EN_PREPARACION:'border-orange-300', LISTA:'border-emerald-300', ENTREGADA:'border-purple-300', CERRADA:'border-gray-200' }[e] || 'border-gray-200')
const badgeEstado = (e) => ({ ABIERTA:'bg-yellow-100 text-yellow-700', POR_PREPARAR:'bg-amber-100 text-amber-700', EN_PREPARACION:'bg-orange-100 text-orange-700', LISTA:'bg-emerald-100 text-emerald-700', ENTREGADA:'bg-purple-100 text-purple-700', CERRADA:'bg-gray-100 text-gray-500' }[e] || 'bg-gray-100 text-gray-500')
const iconEstado  = (e) => ({ ABIERTA:'📝', POR_PREPARAR:'🟡', EN_PREPARACION:'🔥', LISTA:'✅', ENTREGADA:'🏁', CERRADA:'🔒' }[e] || '📋')
const labelEstado = (e) => ({ ABIERTA:'Abierta', POR_PREPARAR:'Por preparar', EN_PREPARACION:'En preparación', LISTA:'Lista', ENTREGADA:'Entregada', CERRADA:'Cerrada' }[e] || e)
const siguienteEstado = (e) => ({ ABIERTA:'POR_PREPARAR', LISTA:'ENTREGADA' }[e] || null)
const accionEstado    = (e) => ({ ABIERTA:'▶️ Mandar a estación', LISTA:'🤝 Entregar a cliente' }[e] || '')
const btnEstado       = (e) => ({ ABIERTA:'bg-amber-500 hover:bg-amber-600 text-white', LISTA:'bg-emerald-500 hover:bg-emerald-600 text-white' }[e] || 'bg-gray-100 text-gray-400')
const formatHora      = (f) => !f ? '' : new Date(f).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

// ── Imágenes ──────────────────────────────────────────────────────────────────
const resolveImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http') || path.startsWith('data:')) return path
  if (path.startsWith('/storage/')) return `${STORAGE_URL}${path.replace(/^\/?storage\//, '')}`
  return `${STORAGE_URL}${path}`
}

// ── Carrito ───────────────────────────────────────────────────────────────────
const productosFiltrados = computed(() => {
  if (!busqueda.value) return productos.value
  const t = busqueda.value.toLowerCase()
  return productos.value.filter(p =>
    p.nombre?.toLowerCase().includes(t) || p.categoria?.nombre?.toLowerCase().includes(t)
  )
})
const totalCarrito = computed(() => carrito.value.reduce((s, i) => s + i.precio * i.cantidad, 0))

const agregarAlCarrito   = (p) => { const e = carrito.value.find(i => i.id === p.id); if (e) e.cantidad++; else carrito.value.push({ id: p.id, nombre: p.nombre, precio: Number(p.precio), cantidad: 1, nota: '' }) }
const incrementar        = (id) => { const i = carrito.value.find(i => i.id === id); if (i) i.cantidad++ }
const decrementar        = (id) => { const i = carrito.value.findIndex(x => x.id === id); if (i === -1) return; carrito.value[i].cantidad > 1 ? carrito.value[i].cantidad-- : carrito.value.splice(i, 1) }
const eliminarDelCarrito = (id) => { carrito.value = carrito.value.filter(i => i.id !== id) }

// ── API ───────────────────────────────────────────────────────────────────────
const verificarCaja = async () => {
  loadingCaja.value = true
  try {
    const res  = await fetch(`${API_URL}/caja/estado`, { headers: getHeaders() })
    const data = await res.json()
    cajaAbierta.value = !!(data.success && data.data?.is_open)
  } catch { cajaAbierta.value = false }
  finally { loadingCaja.value = false }
}

const cargarUser = async () => {
  try {
    const res  = await fetch(`${API_URL}/me`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) currentUser.value = data.data || data
  } catch {}
}

const cargarOrdenes = async () => {
  loading.value = true
  try {
    const today = new Date().toISOString().split('T')[0]
    const [aD, ppD, pD, lD, eD, cD] = await Promise.all([
      fetch(`${API_URL}/meseros/mis-ordenes?estado=ABIERTA&per_page=100`,        { headers: getHeaders() }).then(r=>r.json()),
      fetch(`${API_URL}/meseros/mis-ordenes?estado=POR_PREPARAR&per_page=100`,   { headers: getHeaders() }).then(r=>r.json()),
      fetch(`${API_URL}/meseros/mis-ordenes?estado=EN_PREPARACION&per_page=100`, { headers: getHeaders() }).then(r=>r.json()),
      fetch(`${API_URL}/meseros/mis-ordenes?estado=LISTA&per_page=100`,          { headers: getHeaders() }).then(r=>r.json()),
      fetch(`${API_URL}/meseros/mis-ordenes?estado=ENTREGADA&per_page=100`,      { headers: getHeaders() }).then(r=>r.json()),
      fetch(`${API_URL}/meseros/mis-ordenes?estado=CERRADA&fecha_desde=${today}&fecha_hasta=${today}&per_page=100`, { headers: getHeaders() }).then(r=>r.json()),
    ])
    const map = new Map()
    for (const res of [aD, ppD, pD, lD, eD, cD]) {
      if (res.success) {
        const lista = Array.isArray(res.data) ? res.data : []
        lista.forEach(o => map.set(o.id, o))
      }
    }
    ordenes.value = [...map.values()].sort((a, b) => b.id - a.id)
  } catch (e) { console.error('Error órdenes:', e) }
  finally { loading.value = false }
}

const cargarProductos = async () => {
  loadingProductos.value = true
  try {
    const res  = await fetch(`${API_URL}/productos`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) productos.value = data.data || []
  } catch {}
  finally { loadingProductos.value = false }
}

const cargarClientes = async () => {
  try {
    const res  = await fetch(`${API_URL}/clientes/select-list`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) clientes.value = data.data || []
  } catch {}
}

// ── Cambiar estado ────────────────────────────────────────────────────────────
const cambiarEstado = async (id, nuevoEstado) => {
  cambiando.value = id
  try {
    const res  = await fetch(`${API_URL}/ordenes/${id}`, {
      method: 'PUT', headers: getHeaders(),
      body: JSON.stringify({ estado: nuevoEstado }),
    })
    const data = await res.json()
    if (res.ok && data.success) {
      const orden = ordenes.value.find(o => o.id === id)
      if (orden) orden.estado = nuevoEstado
      showToast(`Orden #${id} → ${labelEstado(nuevoEstado)}`, 'success')
    } else {
      showToast(data.message || 'Error al cambiar estado', 'error')
    }
  } catch { showToast('Error de conexión', 'error') }
  finally { cambiando.value = null }
}

// ── Crear orden ───────────────────────────────────────────────────────────────
const crearOrden = async () => {
  if (carrito.value.length === 0) return

  // Doble verificación antes de crear
  if (!cajaAbierta.value) {
    showToast('La caja está cerrada. No se pueden crear órdenes.', 'error')
    return
  }

  errorNuevaOrden.value = ''
  creando.value = true
  try {
    const res  = await fetch(`${API_URL}/ordenes`, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({
        cliente_id:  nuevaOrden.value.clienteId || null,
        mesa:        nuevaOrden.value.mesa       || null,
        metodo_pago: null,
        propina:     0,
        productos:   carrito.value.map(i => ({ producto_id: i.id, cantidad: i.cantidad })),
      }),
    })
    const data = await res.json()
    if (res.ok && data.success) {
      carrito.value     = []
      nuevaOrden.value  = { clienteId: null, mesa: null }
      notaGeneral.value = ''
      showToast('¡Orden creada correctamente!', 'success')
      vistaActual.value = 'ordenes'
      await cargarOrdenes()
    } else {
      // Si el backend dice que la caja está cerrada, actualizar estado
      if (data.message?.toLowerCase().includes('caja')) {
        cajaAbierta.value = false
      }
      errorNuevaOrden.value = data.message || 'Error al crear la orden'
    }
  } catch { errorNuevaOrden.value = 'Error de conexión' }
  finally { creando.value = false }
}

// ── Ciclo de vida ─────────────────────────────────────────────────────────────
let interval = null
onMounted(async () => {
  await Promise.all([cargarUser(), verificarCaja()])
  if (cajaAbierta.value) {
    await Promise.all([cargarOrdenes(), cargarProductos(), cargarClientes()])
  }
  // Refrescar estado de caja cada 60 seg y órdenes cada 30 seg
  interval = setInterval(async () => {
    await verificarCaja()
    if (cajaAbierta.value) cargarOrdenes()
  }, 30000)
})
onUnmounted(() => { if (interval) clearInterval(interval) })
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
.animate-slide-in { animation: slideIn 0.3s ease-out; }
</style>