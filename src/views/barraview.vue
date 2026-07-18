<template>
  <div class="min-h-screen bg-gray-950 dark:bg-gray-950 p-4 sm:p-6" :style="{ zoom }">

    <SucursalBadge />

    <!-- ══ HEADER ══ -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white dark:text-white tracking-tight">🍹 Barra</h1>
        <p class="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{{ fechaHoy }}</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-800 border border-gray-800 dark:border-gray-700 rounded-xl">
          <div :class="['w-2 h-2 rounded-full', wsConectado ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : (loading ? 'bg-amber-400 animate-pulse' : 'bg-red-400')]"></div>
          <span class="text-xs font-medium text-gray-300 dark:text-gray-200">
            {{ wsConectado ? 'En vivo' : (loading ? 'Conectando...' : 'Polling') }}
          </span>
          <span v-if="ultimaActualizacion" class="text-[10px] text-gray-600 dark:text-gray-400 border-l border-gray-800 dark:border-gray-700 pl-2 ml-1">
            {{ ultimaActualizacion }}
          </span>
        </div>
        <button @click="loadOrders" :disabled="loading"
          class="px-3 py-1.5 bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 border border-gray-800 dark:border-gray-700 text-gray-400 dark:text-gray-300 text-xs rounded-xl transition disabled:opacity-50">
          🔄
        </button>
      </div>
    </div>

    <!-- ══ STATS ══ -->
    <div class="grid grid-cols-3 gap-3 mb-6">
      <div class="bg-yellow-500/10 dark:bg-yellow-500/10 border border-yellow-500/20 dark:border-yellow-500/20 rounded-2xl p-4 text-center">
        <p class="text-3xl font-black text-yellow-400 dark:text-yellow-400 leading-none">{{ pendingOrders.length }}</p>
        <p class="text-xs text-yellow-400/60 dark:text-yellow-400/60 mt-1.5 font-medium uppercase tracking-wider">Pendientes</p>
      </div>
      <div class="bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/20 dark:border-blue-500/20 rounded-2xl p-4 text-center">
        <p class="text-3xl font-black text-blue-400 dark:text-blue-400 leading-none">{{ preparingOrders.length }}</p>
        <p class="text-xs text-blue-400/60 dark:text-blue-400/60 mt-1.5 font-medium uppercase tracking-wider">Preparando</p>
      </div>
      <div class="bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/20 rounded-2xl p-4 text-center">
        <p class="text-3xl font-black text-emerald-400 dark:text-emerald-400 leading-none">{{ readyOrders.length }}</p>
        <p class="text-xs text-emerald-400/60 dark:text-emerald-400/60 mt-1.5 font-medium uppercase tracking-wider">Listas</p>
      </div>
    </div>

    <ToastContainer :toasts="toasts" @remove="removeToast" />

    <!-- ══ KANBAN ══ -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

      <!-- Pendientes -->
      <div class="bg-gray-900 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-800/80 dark:border-gray-700/80">
        <div class="px-4 py-3 bg-yellow-500/10 dark:bg-yellow-500/10 border-b border-yellow-500/20 dark:border-yellow-500/20 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span>🟡</span>
            <h2 class="font-bold text-yellow-300 dark:text-yellow-300 text-sm">Bebidas pendientes</h2>
          </div>
          <span class="text-xs font-bold bg-yellow-500/20 dark:bg-yellow-500/20 text-yellow-300 dark:text-yellow-300 px-2 py-0.5 rounded-full">
            {{ pendingOrders.length }}
          </span>
        </div>
        <div class="p-3 space-y-3 min-h-72 max-h-[calc(100vh-340px)] overflow-y-auto">
          <p v-if="pendingOrders.length === 0 && !loading"
            class="text-center py-12 text-gray-700 dark:text-gray-400 text-sm italic">
            Sin bebidas pendientes 🎉
          </p>
          <OrdenCardBebida
            v-for="order in pendingOrders" :key="order.id"
            :order="order"
            accion-label="🍹 Comenzar a preparar"
            accion-class="bg-blue-600 hover:bg-blue-500 text-white"
            :procesando="procesando === order.id"
            :es-admin-o-propietario="esAdminOPropietario"
            estado-filtro="PENDIENTE"
            @accion="abrirModalIngredientes(order, 'EN_PREPARACION', 'PENDIENTE')"
            @secondary-action="abrirModalIngredientes(order, null, 'PENDIENTE')"
          />
        </div>
      </div>

      <!-- Preparando -->
      <div class="bg-gray-900 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-800/80 dark:border-gray-700/80">
        <div class="px-4 py-3 bg-blue-500/10 dark:bg-blue-500/10 border-b border-blue-500/20 dark:border-blue-500/20 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span>🔵</span>
            <h2 class="font-bold text-blue-300 dark:text-blue-300 text-sm">Preparando</h2>
          </div>
          <span class="text-xs font-bold bg-blue-500/20 dark:bg-blue-500/20 text-blue-300 dark:text-blue-300 px-2 py-0.5 rounded-full">
            {{ preparingOrders.length }}
          </span>
        </div>
        <div class="p-3 space-y-3 min-h-72 max-h-[calc(100vh-340px)] overflow-y-auto">
          <p v-if="preparingOrders.length === 0 && !loading"
            class="text-center py-12 text-gray-700 dark:text-gray-400 text-sm italic">
            Sin bebidas preparándose
          </p>
          <OrdenCardBebida
            v-for="order in preparingOrders" :key="order.id"
            :order="order"
            accion-label="✅ Lista para entregar"
            accion-class="bg-emerald-600 hover:bg-emerald-500 text-white"
            secondary-action-label="Ver ingredientes"
            :procesando="procesando === order.id"
            :es-admin-o-propietario="esAdminOPropietario"
            estado-filtro="EN_PREPARACION"
            @accion="cambiarEstado(order.id, 'LISTO')"
            @secondary-action="abrirModalIngredientes(order, null, 'EN_PREPARACION')"
          />
        </div>
      </div>

    </div>

    <!-- ══ MODAL INGREDIENTES ══ -->
    <div v-if="modalIngredientes.visible"
      class="fixed inset-0 bg-black/70 dark:bg-black/70 z-50 flex items-center justify-center px-4"
      @click.self="cerrarModal">
      <div class="bg-gray-900 dark:bg-gray-800 border border-gray-700 dark:border-gray-600 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-800 dark:border-gray-700">
          <div>
            <h3 class="text-white dark:text-white font-bold text-base">🍹 Confirmar ingredientes</h3>
            <p class="text-gray-400 dark:text-gray-300 text-xs mt-0.5">
              Orden #{{ modalIngredientes.orden?.id }} ·
              {{ modalIngredientes.productosTotal }} ingrediente{{ modalIngredientes.productosTotal !== 1 ? 's' : '' }}
            </p>
          </div>
          <button @click="cerrarModal" class="text-gray-500 dark:text-gray-400 hover:text-white dark:hover:text-white text-xl leading-none">✕</button>
        </div>

        <!-- Cuerpo -->
        <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div v-if="modalIngredientes.loading" class="flex items-center justify-center py-10 gap-2 text-gray-500 dark:text-gray-400">
            <LoadingSpinner />
            <span class="text-sm">Cargando ingredientes...</span>
          </div>

          <!-- Sin datos aún (solo si no hay items ni productos sin receta) -->
          <div v-else-if="!modalIngredientes.items.length && !modalIngredientes.productosSinReceta?.length" class="text-center py-10 text-gray-600 dark:text-gray-400 text-sm">
            Las bebidas de esta orden no tienen ingredientes asignados.
            <p class="mt-2 text-xs">Puedes continuar igualmente.</p>
          </div>

          <!-- Aviso productos sin receta (se muestra además de los items) -->
          <div v-if="modalIngredientes.productosSinReceta?.length" class="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
            <span class="text-2xl block mb-2">⚠️</span>
            <p class="text-sm font-bold text-amber-300">{{ modalIngredientes.productosSinReceta.length }} bebida{{ modalIngredientes.productosSinReceta.length !== 1 ? 's' : '' }} sin receta</p>
            <p class="text-xs text-amber-400/70 mt-1">{{ modalIngredientes.productosSinReceta.join(', ') }}</p>
          </div>

          <!-- Ingredientes (fusionados, un solo listado plano) -->
          <div v-if="modalIngredientes.items.length" class="bg-gray-800/60 dark:bg-gray-700/60 rounded-xl overflow-hidden border border-gray-700/50 dark:border-gray-600/50">
            <div class="divide-y divide-gray-700/30 dark:divide-gray-700/30">
              <div v-for="ing in modalIngredientes.items" :key="ing.id"
                class="flex items-center gap-3 px-4 py-3">

                <!-- Toggle checkbox -->
                <button
                  @click="modalIngredientes.nuevoEstado ? (ing.incluir = !ing.incluir) : null"
                  :class="['w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition',
                    ing.incluir ? 'bg-blue-500 dark:bg-blue-500 border-blue-500 dark:border-blue-500' : 'border-gray-600 dark:border-gray-500 bg-transparent',
                    !modalIngredientes.nuevoEstado ? 'cursor-default' : '']">
                  <span v-if="ing.incluir" class="text-white dark:text-white text-xs font-black">✓</span>
                </button>

                <!-- Nombre -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-200 dark:text-gray-100" :class="!ing.incluir ? 'line-through opacity-40' : ''">
                    {{ ing.nombre }}
                  </p>
                </div>

                <!-- Cantidad necesaria (a la derecha) -->
                <div class="text-right shrink-0 min-w-[70px]">
                  <span class="text-sm font-bold text-white dark:text-white">{{ ing.cantidad_receta_total }} {{ ing.unidad }}</span>
                </div>

                <!-- Stock disponible -->
                <div class="text-right shrink-0 min-w-[90px]">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                    :class="ing.sin_stock    ? 'bg-red-900/60 dark:bg-red-900/60 text-red-400 dark:text-red-400' :
                            ing.insuficiente ? 'bg-amber-900/60 dark:bg-amber-900/60 text-amber-400 dark:text-amber-400' :
                                               'bg-gray-700 dark:bg-gray-600 text-gray-400 dark:text-gray-300'">
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
        <div class="px-5 py-4 border-t border-gray-800 dark:border-gray-700 flex items-center gap-3">
          <button @click="cerrarModal"
            class="flex-1 py-2.5 text-sm text-gray-400 dark:text-gray-300 bg-gray-800 dark:bg-gray-700 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition">
            {{ modalIngredientes.nuevoEstado ? 'Cancelar' : 'Cerrar' }}
          </button>
          <button v-if="modalIngredientes.nuevoEstado"
            @click="confirmarYCambiarEstado"
            :disabled="modalIngredientes.guardando"
            class="flex-1 py-2.5 text-sm font-bold text-white dark:text-white bg-blue-600 dark:bg-blue-600 hover:bg-blue-500 dark:hover:bg-blue-500 rounded-xl transition disabled:opacity-50">
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
import { apiClient } from '@/utils/apiClient'
import { useRestauranteChannel } from '../composables/useRestauranteChannel'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { useToast } from '@/composables/useToast'
import { getHeaders } from '@/config/api'
import { useDeviceZoom } from '@/composables/useDeviceZoom'

const { zoom } = useDeviceZoom()
const POLL_INTERVAL = 15000 // Aumentamos ya que hay WS
const router        = useRouter()

const userRaw = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}'
const user = JSON.parse(userRaw)
const esAdminOPropietario = computed(() => {
  const roles = user.roles || []
  return roles.some(r => {
    const name = (typeof r === 'string' ? r : (r.nombre || r.name || '')).toUpperCase()
    return name.includes('PROPIETARIO') || 
           name.includes('ADMIN') || 
           name.includes('ADMINISTRADOR') ||
           name.includes('DUEÑO')
  })
})

const BEBIDA_CATEGORIA_IDS = [7]

// ── Estado ─────────────────────────────────────────────────────────────────────
const orders     = ref([])
const loading    = ref(false)
const procesando = ref(null)
const { toasts, showToast, removeToast } = useToast()
const restauranteActivo = ref(null)
const ultimaActualizacion = ref(null)
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

const fechaHoy = computed(() =>
  new Date().toLocaleDateString('es-MX', { weekday:'long', day:'numeric', month:'long' })
)

const esBarra = (detalle) => {
  const prodRaw = detalle.producto
  const cat = (prodRaw?.categoria?.nombre || detalle.categoria || '').trim().toLowerCase()
  if (cat) return cat.includes('barra') || cat.includes('bebida') || cat.includes('refresco') || cat.includes('fria')
  const nombre = (detalle.producto_nombre || detalle.producto?.nombre || '').toLowerCase()
  return ['coca', 'pepsi', 'fanta', 'sprite', 'jugo', 'refresco', 'cerveza', 'agua'].some(k => nombre.includes(k))
}
const tieneBarra = (orden) => (orden.detalles || []).some(d => esBarra(d) && !d.cancelado)

const isBarraOrder = (o) => ['POR_PREPARAR', 'EN_PREPARACION', 'LISTA'].includes(o.estado)
const getDetallesBarra = (o) => (o.detalles || []).filter(d => esBarra(d) && !d.cancelado)

const pendingOrders = computed(() => {
  return orders.value.filter(o => {
    if (!isBarraOrder(o)) return false
    const detalles = getDetallesBarra(o)
    return detalles.length > 0 && detalles.some(d => ['PENDIENTE', 'ABIERTA'].includes(d.estado_preparacion || d.estado))
  })
})

const preparingOrders = computed(() => {
  return orders.value.filter(o => {
    if (!isBarraOrder(o)) return false
    const detalles = getDetallesBarra(o)
    return detalles.length > 0 && detalles.some(d => (d.estado_preparacion || d.estado) === 'EN_PREPARACION')
  })
})

const hiddenOrders = ref([])

const readyOrders = computed(() => {
  return orders.value.filter(o => {
    if (!isBarraOrder(o)) return false
    if (hiddenOrders.value.includes(o.id)) return false
    const detalles = getDetallesBarra(o)
    return detalles.length > 0 && detalles.every(d => (d.estado_preparacion || d.estado) === 'LISTO')
  })
})

const totalBarra    = computed(() =>
  [...pendingOrders.value, ...preparingOrders.value]
    .flatMap(o => (o.detalles || []).filter(d => esBarra(d) && !d.cancelado))
    .reduce((s, d) => s + Number(d.cantidad || 1), 0)
)



// ── Cargar órdenes (polling) ───────────────────────────────────────────────────
const loadOrders = async (silent = false) => {
  const token = getToken()
  if (!token) { router.push('/'); return }
  if (!silent) loading.value = true
  try {
    const data = await apiClient.get('/ordenes?estado=POR_PREPARAR,EN_PREPARACION,LISTA&per_page=100')
    if (data.success || data.data) {
      const lista = Array.isArray(data.data) ? data.data : (data.data?.data || [])
      orders.value = lista
        .filter(tieneBarra)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    } else {
      console.warn('🍹 Barra: respuesta sin datos', data)
    }
  } catch (e) { console.error('Error barra:', e) }
  finally { 
    if (!silent) loading.value = false
    ultimaActualizacion.value = new Date().toLocaleTimeString()
  }
}

const getToken = () => localStorage.getItem('token') ?? sessionStorage.getItem('token')

// ── WebSockets ────────────────────────────────────────────────────────────────
const onOrdenWS = async (evento) => {
  const { accion, orden } = evento
  console.log('📡 WS Barra:', accion, orden.id)
  
  if (['creada', 'actualizada', 'estado_cambiado', 'productos_agregados', 'productos_agregados_a_estacion'].includes(accion)) {
    if (accion === 'creada') showToast(`Nueva orden #${orden.id} para barra`, 'info')
    await loadOrders(true)
  } else if (accion === 'cerrada' || accion === 'eliminada') {
    orders.value = orders.value.filter(o => o.id !== orden.id)
  }
}

const { conectado: wsConectado } = useRestauranteChannel(restauranteActivo, {
  onOrden: onOrdenWS
})

// ── Modal ingredientes ─────────────────────────────────────────────────────────
const abrirModalIngredientes = async (orden, nuevoEstado, estadoFiltro = '') => {
  let detallesBebida = (orden.detalles ?? []).filter(d => esBarra(d) && !d.cancelado)
  if (estadoFiltro) {
    const estadosValidos = estadoFiltro === 'PENDIENTE' ? ['PENDIENTE', 'ABIERTA'] : [estadoFiltro]
    detallesBebida = detallesBebida.filter(d => estadosValidos.includes(d.estado_preparacion || d.estado))
  }

  // Agrupar por producto_id + tamano (cada talle tiene su columna en la BD)
  const grupos = new Map()
  for (const d of detallesBebida) {
    const key   = `${d.producto_id}_${d.tamano || ''}`
    const q     = Number(d.cantidad)
    if (grupos.has(key)) {
      grupos.get(key).cantidad += q
    } else {
      grupos.set(key, {
        producto_id:     d.producto_id,
        producto_nombre: d.producto_nombre ?? d.producto?.nombre ?? `Bebida #${d.producto_id}`,
        tamano:          d.tamano || null,
        cantidad:        q,
      })
    }
  }
  const productosAgrupados = [...grupos.values()]

  modalIngredientes.value = {
    visible:        true,
    loading:        true,
    guardando:      false,
    orden,
    nuevoEstado,
    items:          [],
    productosTotal: 0,
    productosSinReceta: [],
  }

  try {
    const resultados = await Promise.all(
      productosAgrupados.map(p =>
        apiClient.get(`/ingredientes/producto/${p.producto_id}?tamano=${p.tamano || 'pequeno'}`)
          .then(data => ({ producto: p, ingredientes: (data.success || data.data) ? (data.data || data) : [] }))
          .catch(() => ({ producto: p, ingredientes: [] }))
      )
    )

    const sinReceta = resultados.filter(r => !r.ingredientes.length).map(r => r.producto.producto_nombre)
    modalIngredientes.value.productosSinReceta = sinReceta

    // Fusionar ingredientes por ID (unificar el mismo ingrediente de distintas bebidas)
  const mergeMap = new Map()
  for (const r of resultados) {
    const pCantidad = Number(r.producto.cantidad)
    for (const ing of r.ingredientes) {
      const cantidadParaEsteProducto = Number(ing.cantidad_receta) * pCantidad
        if (mergeMap.has(ing.id)) {
          const e = mergeMap.get(ing.id)
          e.cantidad_receta_total = Number((e.cantidad_receta_total + cantidadParaEsteProducto).toFixed(3))
          if (!e.producto_ids.includes(r.producto.producto_id)) {
            e.producto_ids.push(r.producto.producto_id)
          }
        } else {
          mergeMap.set(ing.id, {
            id: ing.id,
            nombre: ing.nombre,
            unidad: ing.unidad,
            stock_actual: ing.stock_actual,
            cantidad_receta_total: Number(cantidadParaEsteProducto.toFixed(3)),
            sin_stock: false,
            insuficiente: false,
            incluir: true,
            producto_ids: [r.producto.producto_id],
          })
        }
      }
    }

    const items = [...mergeMap.values()]
    for (const item of items) {
      item.sin_stock = item.stock_actual <= 0
      item.insuficiente = item.stock_actual < item.cantidad_receta_total && item.stock_actual > 0
    }

    modalIngredientes.value.items = items
    modalIngredientes.value.productosTotal = items.length
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
    const excluidos = []
    modalIngredientes.value.items.forEach(ing => {
      if (!ing.incluir) {
        for (const pid of ing.producto_ids) {
          excluidos.push({
            producto_id: pid,
            ingrediente_id: ing.id
          })
        }
      }
    })

    await cambiarEstado(modalIngredientes.value.orden.id, modalIngredientes.value.nuevoEstado, excluidos)
    modalIngredientes.value.visible = false
  } finally {
    modalIngredientes.value.guardando = false
  }
}

// ── Cambiar estado ─────────────────────────────────────────────────────────────
const cambiarEstado = async (id, nuevoEstadoDetalle, ingredientesExcluidos = []) => {
  procesando.value = id
  try {
    const data = await apiClient.post(`/ordenes/${id}/actualizar-estado-estacion`, {
      estacion: 'barra',
      estado: nuevoEstadoDetalle,
      ingredientes_excluidos: ingredientesExcluidos
    })
    
    if (data.success || data.data) {
      await loadOrders()
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
  pollTimer = setInterval(() => loadOrders(true), POLL_INTERVAL)

  // Cargar restaurante activo para WS
  try {
    const data = await apiClient.get('/me')
    if (data.success || data.data) {
      const user = data.data || data
      const ra = user?.restaurante_activo
      if (ra) {
        restauranteActivo.value = (typeof ra === 'object' && ra !== null) ? ra.id : ra
      }
    }
  } catch {}
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

