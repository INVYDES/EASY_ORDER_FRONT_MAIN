<template>
  <div class="min-h-screen bg-gray-950 p-4 sm:p-6">

    <SucursalBadge />

    <!-- ══ HEADER ══ -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight">🍹 Barra</h1>
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
      <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 text-center">
        <p class="text-3xl font-black text-yellow-400 leading-none">{{ pendingOrders.length }}</p>
        <p class="text-xs text-yellow-400/60 mt-1.5 font-medium uppercase tracking-wider">Pendientes</p>
      </div>
      <div class="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-center">
        <p class="text-3xl font-black text-blue-400 leading-none">{{ preparingOrders.length }}</p>
        <p class="text-xs text-blue-400/60 mt-1.5 font-medium uppercase tracking-wider">Preparando</p>
      </div>
      <div class="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 text-center">
        <p class="text-3xl font-black text-purple-400 leading-none">{{ totalBebidas }}</p>
        <p class="text-xs text-purple-400/60 mt-1.5 font-medium uppercase tracking-wider">Bebidas totales</p>
      </div>
    </div>

    <!-- ══ TOASTS ══ -->
    <div class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <div v-for="toast in toasts" :key="toast.id"
        :class="['px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 min-w-64 pointer-events-auto animate-slide-in',
          toast.type==='success' ? 'bg-emerald-900 border border-emerald-700 text-emerald-200' :
          toast.type==='error'   ? 'bg-red-900 border border-red-700 text-red-200' :
          'bg-gray-900 border border-gray-700 text-gray-200']">
        <span class="text-lg shrink-0">{{ toast.type==='success'?'✅':toast.type==='error'?'❌':'🔔' }}</span>
        <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="text-gray-500 hover:text-gray-300">×</button>
      </div>
    </div>

    <!-- ══ KANBAN ══ -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

      <!-- Pendientes -->
      <div class="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800/80">
        <div class="px-4 py-3 bg-yellow-500/10 border-b border-yellow-500/20 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span>🟡</span>
            <h2 class="font-bold text-yellow-300 text-sm">Bebidas pendientes</h2>
          </div>
          <span class="text-xs font-bold bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">
            {{ pendingOrders.length }}
          </span>
        </div>
        <div class="p-3 space-y-3 min-h-72 max-h-[calc(100vh-340px)] overflow-y-auto">
          <p v-if="pendingOrders.length === 0 && !loading"
            class="text-center py-12 text-gray-700 text-sm italic">
            Sin bebidas pendientes 🎉
          </p>
          <OrdenCardBebida
            v-for="order in pendingOrders" :key="order.id"
            :order="order"
            accion-label="🍹 Comenzar a preparar"
            accion-class="bg-blue-600 hover:bg-blue-500 text-white"
            :procesando="procesando === order.id"
            @accion="abrirModalIngredientes(order, 'EN_PREPARACION')"
          />
        </div>
      </div>

      <!-- Preparando -->
      <div class="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800/80">
        <div class="px-4 py-3 bg-blue-500/10 border-b border-blue-500/20 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span>🔵</span>
            <h2 class="font-bold text-blue-300 text-sm">Preparando</h2>
          </div>
          <span class="text-xs font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
            {{ preparingOrders.length }}
          </span>
        </div>
        <div class="p-3 space-y-3 min-h-72 max-h-[calc(100vh-340px)] overflow-y-auto">
          <p v-if="preparingOrders.length === 0 && !loading"
            class="text-center py-12 text-gray-700 text-sm italic">
            Sin bebidas preparándose
          </p>
          <OrdenCardBebida
            v-for="order in preparingOrders" :key="order.id"
            :order="order"
            accion-label="✅ Lista para entregar"
            accion-class="bg-emerald-600 hover:bg-emerald-500 text-white"
            :procesando="procesando === order.id"
            @accion="cambiarEstado(order.id, 'LISTO')"
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
            <h3 class="text-white font-bold text-base">🍹 Confirmar ingredientes</h3>
            <p class="text-gray-400 text-xs mt-0.5">
              Orden #{{ modalIngredientes.orden?.id }} ·
              {{ modalIngredientes.productosTotal }} bebida{{ modalIngredientes.productosTotal !== 1 ? 's' : '' }}
            </p>
          </div>
          <button @click="cerrarModal" class="text-gray-500 hover:text-white text-xl leading-none">✕</button>
        </div>

        <!-- Cuerpo -->
        <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div v-if="modalIngredientes.loading" class="flex items-center justify-center py-10 gap-2 text-gray-500">
            <div class="w-5 h-5 border-2 border-gray-600 border-t-blue-400 rounded-full animate-spin"></div>
            <span class="text-sm">Cargando ingredientes...</span>
          </div>

          <div v-else-if="!modalIngredientes.items.length" class="text-center py-10 text-gray-600 text-sm">
            Las bebidas de esta orden no tienen ingredientes asignados.
            <p class="mt-2 text-xs">Puedes continuar igualmente.</p>
          </div>

          <div v-else v-for="item in modalIngredientes.items" :key="item.producto_id"
            class="bg-gray-800/60 rounded-xl overflow-hidden border border-gray-700/50">

            <div class="flex items-center gap-3 px-4 py-3 bg-gray-800 border-b border-gray-700/50">
              <span class="text-base">🍹</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-white truncate">{{ item.producto_nombre }}</p>
                <p class="text-xs text-gray-400">× {{ item.cantidad }} unidad{{ item.cantidad !== 1 ? 'es' : '' }}</p>
              </div>
              <span v-if="item.ingredientes.some(i => i.sin_stock || i.insuficiente)"
                class="text-xs font-bold px-2 py-0.5 rounded-full"
                :class="item.ingredientes.some(i => i.sin_stock) ? 'bg-red-900 text-red-300' : 'bg-amber-900 text-amber-300'">
                {{ item.ingredientes.some(i => i.sin_stock) ? '🚨 Sin stock' : '⚠️ Stock bajo' }}
              </span>
            </div>

            <div class="divide-y divide-gray-700/30">
              <div v-for="ing in item.ingredientes" :key="ing.id"
                class="flex items-center gap-3 px-4 py-2.5">
                <button @click="ing.incluir = !ing.incluir"
                  :class="['w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition',
                    ing.incluir ? 'bg-blue-500 border-blue-500' : 'border-gray-600 bg-transparent']">
                  <span v-if="ing.incluir" class="text-white text-xs font-black">✓</span>
                </button>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-200" :class="!ing.incluir ? 'line-through opacity-40' : ''">
                    {{ ing.nombre }}
                  </p>
                  <p class="text-xs text-gray-500">
                    necesario: {{ ing.cantidad_receta_total }} {{ ing.unidad }}
                  </p>
                </div>
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
            class="flex-1 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition disabled:opacity-50">
            {{ modalIngredientes.guardando ? 'Iniciando...' : '🍹 Iniciar preparación' }}
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
import OrdenCardBebida from '../components/bebida/OrdenCardBebida.vue'
import { API_URL, STORAGE_URL } from '@/config/api'
const POLL_INTERVAL = 15000
const router        = useRouter()

const BEBIDA_CATEGORIA_IDS = [7]

// ── Estado ─────────────────────────────────────────────────────────────────────
const orders     = ref([])
const loading    = ref(false)
const procesando = ref(null)
const toasts     = ref([])
let   pollTimer  = null

// ── Modal ingredientes ─────────────────────────────────────────────────────────
const modalIngredientes = ref({
  visible:        false,
  loading:        false,
  guardando:      false,
  orden:          null,
  nuevoEstado:    null,
  items:          [],
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

const esBarra = (detalle) => {
  return (detalle.categoria || '').toLowerCase() === 'barra'
}
const tieneBarra = (orden) => (orden.detalles || []).some(esBarra)

const isBarraOrder = (o) => ['POR_PREPARAR', 'EN_PREPARACION', 'LISTA'].includes(o.estado)
const getDetallesBarra = (o) => (o.detalles || []).filter(esBarra)

const pendingOrders = computed(() => {
  return orders.value.filter(o => {
    if (!isBarraOrder(o)) return false
    const detalles = getDetallesBarra(o)
    return detalles.length > 0 && detalles.some(d => d.estado_preparacion === 'PENDIENTE')
  })
})

const preparingOrders = computed(() => {
  return orders.value.filter(o => {
    if (!isBarraOrder(o)) return false
    const detalles = getDetallesBarra(o)
    return detalles.length > 0 && detalles.some(d => d.estado_preparacion === 'EN_PREPARACION') && !detalles.some(d => d.estado_preparacion === 'PENDIENTE')
  })
})

const hiddenOrders = ref([])

const readyOrders = computed(() => {
  return orders.value.filter(o => {
    if (!isBarraOrder(o)) return false
    if (hiddenOrders.value.includes(o.id)) return false
    const detalles = getDetallesBarra(o)
    return detalles.length > 0 && detalles.every(d => d.estado_preparacion === 'LISTO')
  })
})

const totalBarra    = computed(() =>
  [...pendingOrders.value, ...preparingOrders.value]
    .flatMap(o => (o.detalles || []).filter(esBarra))
    .reduce((s, d) => s + Number(d.cantidad || 1), 0)
)

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
      fetch(`${API_URL}/ordenes?estado=POR_PREPARAR&per_page=100`,   { headers: getHeaders() }).then(r=>r.json()),
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
    orders.value = [...map.values()]
      .filter(tieneBebidas)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  } catch (e) { console.error('Error barra:', e) }
  finally { loading.value = false }
}

// ── Modal ingredientes ─────────────────────────────────────────────────────────
const abrirModalIngredientes = async (orden, nuevoEstado) => {
  // Solo los detalles que son bebidas
  const detallesBebida = (orden.detalles ?? []).filter(esBebida)

  modalIngredientes.value = {
    visible:        true,
    loading:        true,
    guardando:      false,
    orden,
    nuevoEstado,
    items:          [],
    productosTotal: detallesBebida.length,
  }

  try {
    const resultados = await Promise.all(
      detallesBebida.map(d =>
        fetch(`${API_URL}/ingredientes/producto/${d.producto_id}`, { headers: getHeaders() })
          .then(r => r.json())
          .then(data => ({ detalle: d, ingredientes: data.success ? data.data : [] }))
          .catch(() => ({ detalle: d, ingredientes: [] }))
      )
    )

    modalIngredientes.value.items = resultados
      .filter(r => r.ingredientes.length > 0)
      .map(({ detalle, ingredientes }) => ({
        producto_id:     detalle.producto_id,
        producto_nombre: detalle.producto_nombre ?? `Bebida #${detalle.producto_id}`,
        cantidad:        detalle.cantidad,
        ingredientes:    ingredientes.map(ing => {
          const cantidadTotal = ing.cantidad_receta * detalle.cantidad
          return {
            ...ing,
            cantidad_receta_total: Number(cantidadTotal.toFixed(3)),
            sin_stock:    ing.stock_actual <= 0,
            insuficiente: ing.stock_actual < cantidadTotal && ing.stock_actual > 0,
            incluir:      true,
          }
        }),
      }))
  } catch (e) {
    console.error('Error cargando ingredientes barra:', e)
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
const cambiarEstado = async (id, nuevoEstadoDetalle) => {
  procesando.value = id
  try {
    const orden = orders.value.find(o => o.id === id)
    if (!orden) return

    const detallesBarra = getDetallesBarra(orden).map(d => d.id)

    const res  = await fetch(`${API_URL}/ordenes/${id}/station-status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ detalles: detallesBarra, estado_preparacion: nuevoEstadoDetalle }),
    })
    const data = await res.json()
    if (res.ok && data.success) {
      orden.detalles.forEach(d => {
        if (detallesBarra.includes(d.id)) {
          d.estado_preparacion = nuevoEstadoDetalle
        }
      })
      orden.estado = data.data.nuevo_estado_orden
      
      const labels = { EN_PREPARACION:'Preparando 🍹', LISTO:'Listas ✅' }
      showToast(`Bebidas de Orden #${id} → ${labels[nuevoEstadoDetalle] || nuevoEstadoDetalle}`, 'success')
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
  if (!hiddenOrders.value.includes(id)) {
    hiddenOrders.value.push(id)
  }
  showToast(`Orden #${id} entregada al mesero 🫡`, 'success')
  procesando.value = null
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