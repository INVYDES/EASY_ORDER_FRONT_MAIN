<template>
  <div class="min-h-screen bg-gray-950 p-4 sm:p-6">

    <SucursalBadge />

    <!-- ══ HEADER ══ -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight">🍳 Cocina</h1>
        <p class="text-gray-500 text-xs mt-0.5">{{ fechaHoy }}</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-xl">
          <div :class="['w-2 h-2 rounded-full', loading ? 'bg-amber-400 animate-pulse' : 'bg-blue-400']"></div>
          <span class="text-xs text-gray-400">
            {{ loading ? 'Actualizando...' : `Polling ${POLL_INTERVAL/1000}s` }}
          </span>
        </div>
        <button @click="loadOrders" :disabled="loading"
          class="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 text-xs rounded-xl transition disabled:opacity-50">
          🔄
        </button>
      </div>
    </div>

    <!-- ══ STATS ══ -->
    <div class="grid grid-cols-3 gap-3 mb-6">
      <div class="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center">
        <p class="text-3xl font-black text-amber-400 leading-none">{{ pendingOrders.length }}</p>
        <p class="text-xs text-amber-400/60 mt-1.5 font-medium uppercase tracking-wider">Pendientes</p>
      </div>
      <div class="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 text-center">
        <p class="text-3xl font-black text-orange-400 leading-none">{{ preparingOrders.length }}</p>
        <p class="text-xs text-orange-400/60 mt-1.5 font-medium uppercase tracking-wider">En preparación</p>
      </div>
      <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
        <p class="text-3xl font-black text-emerald-400 leading-none">{{ readyOrders.length }}</p>
        <p class="text-xs text-emerald-400/60 mt-1.5 font-medium uppercase tracking-wider">Listas</p>
      </div>
    </div>

    <!-- ══ TOAST ══ -->
    <div class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <div v-for="toast in toasts" :key="toast.id"
        :class="['px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 min-w-64 pointer-events-auto animate-slide-in',
          toast.type==='success' ? 'bg-emerald-900 border border-emerald-700 text-emerald-200' :
          toast.type==='error'   ? 'bg-red-900 border border-red-700 text-red-200' :
          'bg-gray-900 border border-gray-700 text-gray-200']">
        <span>{{ toast.type==='success'?'✅':toast.type==='error'?'❌':'ℹ️' }}</span>
        <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="opacity-50 hover:opacity-100">×</button>
      </div>
    </div>

    <!-- ══ KANBAN ══ -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

      <!-- Pendientes -->
      <div class="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800/80">
        <div class="px-4 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span>🟡</span>
            <h2 class="font-bold text-amber-300 text-sm">Por preparar</h2>
          </div>
          <span class="text-xs font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
            {{ pendingOrders.length }}
          </span>
        </div>
        <div class="p-3 space-y-3 min-h-72 max-h-[calc(100vh-320px)] overflow-y-auto">
          <p v-if="pendingOrders.length === 0 && !loading"
            class="text-center py-12 text-gray-700 text-sm italic">
            Sin órdenes pendientes 🎉
          </p>
          <OrdenCardCocina
            v-for="order in pendingOrders" :key="order.id"
            :order="order"
            accion-label="🔥 Iniciar preparación"
            accion-class="bg-orange-500 hover:bg-orange-400 text-white"
            :procesando="procesando === order.id"
            @accion="abrirModalIngredientes(order, 'EN_PREPARACION')"
          />
        </div>
      </div>

      <!-- En preparación -->
      <div class="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800/80">
        <div class="px-4 py-3 bg-orange-500/10 border-b border-orange-500/20 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span>🔥</span>
            <h2 class="font-bold text-orange-300 text-sm">En preparación</h2>
          </div>
          <span class="text-xs font-bold bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">
            {{ preparingOrders.length }}
          </span>
        </div>
        <div class="p-3 space-y-3 min-h-72 max-h-[calc(100vh-320px)] overflow-y-auto">
          <p v-if="preparingOrders.length === 0 && !loading"
            class="text-center py-12 text-gray-700 text-sm italic">
            Sin órdenes en preparación
          </p>
          <OrdenCardCocina
            v-for="order in preparingOrders" :key="order.id"
            :order="order"
            accion-label="✅ Marcar como lista"
            accion-class="bg-emerald-500 hover:bg-emerald-400 text-white"
            :procesando="procesando === order.id"
            @accion="cambiarEstado(order.id, 'LISTA')"
          />
        </div>
      </div>

      <!-- Listas -->
      <div class="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800/80">
        <div class="px-4 py-3 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span>✅</span>
            <h2 class="font-bold text-emerald-300 text-sm">Listas para entregar</h2>
          </div>
          <span class="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
            {{ readyOrders.length }}
          </span>
        </div>
        <div class="p-3 space-y-3 min-h-72 max-h-[calc(100vh-320px)] overflow-y-auto">
          <p v-if="readyOrders.length === 0 && !loading"
            class="text-center py-12 text-gray-700 text-sm italic">
            Sin órdenes listas
          </p>
          <OrdenCardCocina
            v-for="order in readyOrders" :key="order.id"
            :order="order"
            accion-label="🫡 Entregada a mesero"
            accion-class="bg-gray-700 hover:bg-gray-600 text-white"
            :procesando="procesando === order.id"
            @accion="marcarEntregada(order.id)"
          />
        </div>
      </div>
    </div>

    <!-- ══ MODAL INGREDIENTES ══ -->
    <div v-if="modalIngredientes.visible"
      class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
      @click.self="cerrarModal">
      <div class="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div>
            <h3 class="text-white font-bold text-base">🧑‍🍳 Confirmar ingredientes</h3>
            <p class="text-gray-400 text-xs mt-0.5">
              Orden #{{ modalIngredientes.orden?.id }} ·
              {{ modalIngredientes.productosTotal }} producto{{ modalIngredientes.productosTotal !== 1 ? 's' : '' }}
            </p>
          </div>
          <button @click="cerrarModal" class="text-gray-500 hover:text-white text-xl leading-none">✕</button>
        </div>

        <!-- Cuerpo: lista de productos con sus ingredientes -->
        <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          <!-- Loading ingredientes -->
          <div v-if="modalIngredientes.loading" class="flex items-center justify-center py-10 gap-2 text-gray-500">
            <div class="w-5 h-5 border-2 border-gray-600 border-t-orange-400 rounded-full animate-spin"></div>
            <span class="text-sm">Cargando ingredientes...</span>
          </div>

          <!-- Sin datos aún -->
          <div v-else-if="!modalIngredientes.items.length" class="text-center py-10 text-gray-600 text-sm">
            Los productos de esta orden no tienen ingredientes asignados.
            <p class="mt-2 text-xs">Puedes continuar igualmente.</p>
          </div>

          <!-- Productos con ingredientes -->
          <div v-else v-for="item in modalIngredientes.items" :key="item.producto_id"
            class="bg-gray-800/60 rounded-xl overflow-hidden border border-gray-700/50">

            <!-- Producto header -->
            <div class="flex items-center gap-3 px-4 py-3 bg-gray-800 border-b border-gray-700/50">
              <span class="text-base">🍽️</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-white truncate">{{ item.producto_nombre }}</p>
                <p class="text-xs text-gray-400">× {{ item.cantidad }} unidad{{ item.cantidad !== 1 ? 'es' : '' }}</p>
              </div>
              <!-- Badge si algún ingrediente tiene problema -->
              <span v-if="item.ingredientes.some(i => i.sin_stock || i.insuficiente)"
                class="text-xs font-bold px-2 py-0.5 rounded-full"
                :class="item.ingredientes.some(i => i.sin_stock) ? 'bg-red-900 text-red-300' : 'bg-amber-900 text-amber-300'">
                {{ item.ingredientes.some(i => i.sin_stock) ? '🚨 Sin stock' : '⚠️ Stock bajo' }}
              </span>
            </div>

            <!-- Lista de ingredientes -->
            <div class="divide-y divide-gray-700/30">
              <div v-for="ing in item.ingredientes" :key="ing.id"
                class="flex items-center gap-3 px-4 py-2.5">

                <!-- Toggle checkbox -->
                <button @click="ing.incluir = !ing.incluir"
                  :class="['w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition',
                    ing.incluir ? 'bg-orange-500 border-orange-500' : 'border-gray-600 bg-transparent']">
                  <span v-if="ing.incluir" class="text-white text-xs font-black">✓</span>
                </button>

                <!-- Nombre + cantidad receta -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-200" :class="!ing.incluir ? 'line-through opacity-40' : ''">
                    {{ ing.nombre }}
                  </p>
                  <p class="text-xs text-gray-500">
                    necesario: {{ ing.cantidad_receta_total }} {{ ing.unidad }}
                  </p>
                </div>

                <!-- Stock disponible -->
                <div class="text-right shrink-0">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
                    :class="ing.sin_stock    ? 'bg-red-900/60 text-red-400' :
                            ing.insuficiente ? 'bg-amber-900/60 text-amber-400' :
                                               'bg-gray-700 text-gray-400'">
                    {{ ing.sin_stock ? 'Sin stock' :
                       ing.insuficiente ? `Solo ${ing.stock_actual} ${ing.unidad}` :
                       `${ing.stock_actual} ${ing.unidad}` }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 py-4 border-t border-gray-800 flex items-center gap-3">
          <button @click="cerrarModal"
            class="flex-1 py-2.5 text-sm text-gray-400 bg-gray-800 rounded-xl hover:bg-gray-700 transition">
            Cancelar
          </button>
          <button @click="confirmarYCambiarEstado"
            :disabled="modalIngredientes.guardando"
            class="flex-1 py-2.5 text-sm font-bold text-white bg-orange-500 hover:bg-orange-400 rounded-xl transition disabled:opacity-50">
            {{ modalIngredientes.guardando ? 'Iniciando...' : '🔥 Iniciar preparación' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import SucursalBadge from '../components/SucursalBadge.vue'
import OrdenCardCocina from '../components/cocina/OrdenCardCocina.vue'
import { API_URL } from '@/config/api'
const POLL_INTERVAL = 15000
const router        = useRouter()

// ── Estado ─────────────────────────────────────────────────────────────────────
const orders     = ref([])
const loading    = ref(false)
const procesando = ref(null)
const toasts     = ref([])
let   pollTimer  = null

// ── Modal ingredientes ─────────────────────────────────────────────────────────
const modalIngredientes = ref({
  visible:       false,
  loading:       false,
  guardando:     false,
  orden:         null,
  nuevoEstado:   null,
  items:         [],       // [{ producto_id, producto_nombre, cantidad, ingredientes: [] }]
  productosTotal: 0,
})

// ── Helpers ────────────────────────────────────────────────────────────────────
const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return { 'Content-Type':'application/json', Accept:'application/json', Authorization: token ? `Bearer ${token}` : '' }
}

const fechaHoy = computed(() =>
  new Date().toLocaleDateString('es-MX', { weekday:'long', day:'numeric', month:'long' })
)

const pendingOrders   = computed(() => orders.value.filter(o => o.estado === 'ABIERTA'))
const preparingOrders = computed(() => orders.value.filter(o => o.estado === 'EN_PREPARACION'))
const readyOrders     = computed(() => orders.value.filter(o => o.estado === 'LISTA'))

const showToast = (message, type = 'info', duration = 3500) => {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  if (duration > 0) setTimeout(() => removeToast(id), duration)
}
const removeToast = (id) => { toasts.value = toasts.value.filter(t => t.id !== id) }

// ── Cargar órdenes (polling) ───────────────────────────────────────────────────
const loadOrders = async () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  if (!token) { router.push('/'); return }
  loading.value = true
  try {
    const [aD, pD, lD] = await Promise.all([
      fetch(`${API_URL}/ordenes?estado=ABIERTA&per_page=100`,        { headers: getHeaders() }).then(r=>r.json()),
      fetch(`${API_URL}/ordenes?estado=EN_PREPARACION&per_page=100`, { headers: getHeaders() }).then(r=>r.json()),
      fetch(`${API_URL}/ordenes?estado=LISTA&per_page=100`,          { headers: getHeaders() }).then(r=>r.json()),
    ])
    const map = new Map()
    for (const res of [aD, pD, lD]) {
      if (res.success) {
        const lista = Array.isArray(res.data) ? res.data : []
        lista.forEach(o => map.set(o.id, o))
      }
    }
    orders.value = [...map.values()].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  } catch (e) {
    console.error('Error cargando órdenes cocina:', e)
  } finally {
    loading.value = false
  }
}

// ── Modal ingredientes ─────────────────────────────────────────────────────────
const abrirModalIngredientes = async (orden, nuevoEstado) => {
  modalIngredientes.value = {
    visible:        true,
    loading:        true,
    guardando:      false,
    orden,
    nuevoEstado,
    items:          [],
    productosTotal: orden.detalles?.length ?? 0,
  }

  try {
    // Por cada producto de la orden, pedir sus ingredientes
    const detalles = orden.detalles ?? []
    const resultados = await Promise.all(
      detalles.map(d =>
        fetch(`${API_URL}/ingredientes/producto/${d.producto_id}`, { headers: getHeaders() })
          .then(r => r.json())
          .then(data => ({ detalle: d, ingredientes: data.success ? data.data : [] }))
          .catch(() => ({ detalle: d, ingredientes: [] }))
      )
    )

    modalIngredientes.value.items = resultados
      .filter(r => r.ingredientes.length > 0)  // solo productos con receta
      .map(({ detalle, ingredientes }) => ({
        producto_id:     detalle.producto_id,
        producto_nombre: detalle.producto_nombre ?? detalle.producto?.nombre ?? `Producto #${detalle.producto_id}`,
        cantidad:        detalle.cantidad,
        ingredientes:    ingredientes.map(ing => {
          const cantidadTotal = ing.cantidad_receta * detalle.cantidad
          return {
            ...ing,
            // Cuánto se necesita en total para esta cantidad de platos
            cantidad_receta_total: Number(cantidadTotal.toFixed(3)),
            // Flags de stock
            sin_stock:    ing.stock_actual <= 0,
            insuficiente: ing.stock_actual < cantidadTotal && ing.stock_actual > 0,
            incluir:      true,  // checkbox — por defecto todos seleccionados
          }
        }),
      }))

  } catch (e) {
    console.error('Error cargando ingredientes del modal:', e)
  } finally {
    modalIngredientes.value.loading = false
  }
}

const cerrarModal = () => {
  if (modalIngredientes.value.guardando) return
  modalIngredientes.value.visible = false
}

const confirmarYCambiarEstado = async () => {
  modalIngredientes.value.guardando = true
  try {
    await cambiarEstado(modalIngredientes.value.orden.id, modalIngredientes.value.nuevoEstado)
    modalIngredientes.value.visible = false
  } finally {
    modalIngredientes.value.guardando = false
  }
}

// ── Cambiar estado ─────────────────────────────────────────────────────────────
const cambiarEstado = async (id, nuevoEstado) => {
  procesando.value = id
  try {
    const res  = await fetch(`${API_URL}/ordenes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ estado: nuevoEstado }),
    })
    const data = await res.json()
    if (res.ok && data.success) {
      const o = orders.value.find(o => o.id === id)
      if (o) o.estado = nuevoEstado
      const labels = { EN_PREPARACION:'En preparación 🔥', LISTA:'Lista ✅' }
      showToast(`Orden #${id} → ${labels[nuevoEstado] || nuevoEstado}`, 'success')
    } else {
      showToast(data.message || 'Error al actualizar', 'error')
    }
  } catch {
    showToast('Error de conexión', 'error')
  } finally {
    procesando.value = null
  }
}

const marcarEntregada = async (id) => {
  procesando.value = id
  try {
    orders.value = orders.value.filter(o => o.id !== id)
    showToast(`Orden #${id} entregada al mesero 🫡`, 'success')
  } finally {
    procesando.value = null
  }
}

// ── Ciclo de vida ──────────────────────────────────────────────────────────────
onMounted(async () => {
  await loadOrders()
  pollTimer = setInterval(loadOrders, POLL_INTERVAL)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<style scoped>
@keyframes slideIn { from{transform:translateX(100%);opacity:0;} to{transform:translateX(0);opacity:1;} }
.animate-slide-in { animation: slideIn 0.25s ease-out; }
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
@keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:.4;} }
.animate-pulse { animation: pulse 2s ease-in-out infinite; }
</style>