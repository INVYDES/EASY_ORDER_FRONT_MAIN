<template>
  <div class="min-h-screen bg-gray-950 p-4 sm:p-6" :style="{ zoom }">

    <SucursalBadge />

    <!-- ══ HEADER ══ -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight">🍳 Cocina</h1>
        <p class="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{{ fechaHoy }}</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-950 border border-gray-800 dark:border-gray-700 rounded-xl">
          <div :class="['w-2 h-2 rounded-full', wsConectado ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : (loading ? 'bg-amber-400 animate-pulse' : 'bg-red-400')]"></div>
          <span class="text-xs font-medium text-gray-300 dark:text-gray-200">
            {{ wsConectado ? 'En vivo' : (loading ? 'Conectando...' : 'Polling') }}
          </span>
          <span v-if="ultimaActualizacion" class="text-[10px] text-gray-600 dark:text-gray-500 border-l border-gray-800 dark:border-gray-700 pl-2 ml-1">
            {{ ultimaActualizacion }}
          </span>
        </div>
        <button @click="loadOrders" :disabled="loading"
          class="px-3 py-1.5 bg-gray-900 dark:bg-gray-950 hover:bg-gray-800 dark:hover:bg-gray-900 border border-gray-800 dark:border-gray-700 text-gray-400 dark:text-gray-300 text-xs rounded-xl transition disabled:opacity-50">
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

    <ToastContainer :toasts="toasts" @remove="removeToast" />

    <!-- ══ KANBAN ══ -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

      <!-- Pendientes -->
      <div class="bg-gray-900 dark:bg-gray-950 rounded-2xl overflow-hidden border border-gray-800/80 dark:border-gray-700/80">
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
            class="text-center py-12 text-gray-700 dark:text-gray-500 text-sm italic">
            Sin órdenes pendientes 🎉
          </p>
          <OrdenCardCocina
            v-for="order in pendingOrders" :key="order.id"
            :order="order"
            accion-label="🔥 Iniciar preparación"
            accion-class="bg-orange-500 hover:bg-orange-400 text-white"
            :procesando="procesando === order.id"
            :es-admin-o-propietario="esAdminOPropietario"
            estado-filtro="PENDIENTE"
            @accion="abrirModalIngredientes(order, 'EN_PREPARACION', 'PENDIENTE')"
            @secondary-action="abrirModalIngredientes(order, null, 'PENDIENTE')"
          />
        </div>
      </div>

      <!-- En preparación -->
      <div class="bg-gray-900 dark:bg-gray-950 rounded-2xl overflow-hidden border border-gray-800/80 dark:border-gray-700/80">
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
            class="text-center py-12 text-gray-700 dark:text-gray-500 text-sm italic">
            Sin órdenes en preparación
          </p>
          <OrdenCardCocina
            v-for="order in preparingOrders" :key="order.id"
            :order="order"
            accion-label="✅ Marcar como lista"
            accion-class="bg-emerald-500 hover:bg-emerald-400 text-white"
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
      class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
      @click.self="cerrarModal">
      <div class="bg-gray-900 dark:bg-gray-950 border border-gray-700 dark:border-gray-600 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-800 dark:border-gray-700">
          <div>
            <h3 class="text-white font-bold text-base">🧑‍🍳 Confirmar ingredientes</h3>
            <p class="text-gray-400 dark:text-gray-300 text-xs mt-0.5">
              Orden #{{ modalIngredientes.orden?.id }} ·
              {{ modalIngredientes.productosTotal }} producto{{ modalIngredientes.productosTotal !== 1 ? 's' : '' }}
            </p>
          </div>
          <button @click="cerrarModal" class="text-gray-500 dark:text-gray-400 hover:text-white text-xl leading-none">✕</button>
        </div>

        <!-- Cuerpo: lista de productos con sus ingredientes -->
        <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          <!-- Loading ingredientes -->
          <div v-if="modalIngredientes.loading" class="flex items-center justify-center py-10 gap-2 text-gray-500 dark:text-gray-400">
            <LoadingSpinner />
            <span class="text-sm">Cargando ingredientes...</span>
          </div>

          <!-- Sin datos aún -->
          <div v-else-if="!modalIngredientes.items.length" class="text-center py-10 text-gray-600 dark:text-gray-500 text-sm">
            Los productos de esta orden no tienen ingredientes asignados.
            <p class="mt-2 text-xs">Puedes continuar igualmente.</p>
          </div>

          <!-- Productos con ingredientes -->
          <div v-else v-for="item in modalIngredientes.items" :key="item.producto_id"
            class="bg-gray-800/60 dark:bg-gray-900/60 rounded-xl overflow-hidden border border-gray-700/50 dark:border-gray-600/50">

            <!-- Producto header -->
            <div class="flex items-center gap-3 px-4 py-3 bg-gray-800 dark:bg-gray-900 border-b border-gray-700/50 dark:border-gray-600/50">
              <span class="text-base">🍽️</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-white truncate">{{ item.producto_nombre }}</p>
                <p class="text-xs text-gray-400 dark:text-gray-300">× {{ item.cantidad }} unidad{{ item.cantidad !== 1 ? 'es' : '' }}</p>
              </div>
              <!-- Badge si algún ingrediente tiene problema -->
              <span v-if="item.ingredientes.some(i => i.sin_stock || i.insuficiente)"
                class="text-xs font-bold px-2 py-0.5 rounded-full"
                :class="item.ingredientes.some(i => i.sin_stock) ? 'bg-red-900 text-red-300' : 'bg-amber-900 text-amber-300'">
                {{ item.ingredientes.some(i => i.sin_stock) ? '🚨 Sin stock' : '⚠️ Stock bajo' }}
              </span>
            </div>

            <!-- Lista de ingredientes -->
            <div class="divide-y divide-gray-700/30 dark:divide-gray-600/30">
              <div v-for="ing in item.ingredientes" :key="ing.id"
                class="flex items-center gap-3 px-4 py-2.5">

                <!-- Toggle checkbox -->
                <button 
                  @click="modalIngredientes.nuevoEstado ? (ing.incluir = !ing.incluir) : null"
                  :class="['w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition',
                    ing.incluir ? 'bg-orange-500 border-orange-500' : 'border-gray-600 dark:border-gray-500 bg-transparent',
                    !modalIngredientes.nuevoEstado ? 'cursor-default' : '']">
                  <span v-if="ing.incluir" class="text-white text-xs font-black">✓</span>
                </button>

                <!-- Nombre + cantidad receta -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-200 dark:text-gray-100" :class="!ing.incluir ? 'line-through opacity-40' : ''">
                    {{ ing.nombre }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    necesario: {{ ing.cantidad_receta_total }} {{ ing.unidad }}
                  </p>
                </div>

                <!-- Stock disponible -->
                <div class="text-right shrink-0">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
                    :class="ing.sin_stock    ? 'bg-red-900/60 text-red-400' :
                            ing.insuficiente ? 'bg-amber-900/60 text-amber-400' :
                                               'bg-gray-700 dark:bg-gray-800 text-gray-400 dark:text-gray-300'">
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
            class="flex-1 py-2.5 text-sm text-gray-400 dark:text-gray-300 bg-gray-800 dark:bg-gray-900 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-800 transition">
            {{ modalIngredientes.nuevoEstado ? 'Cancelar' : 'Cerrar' }}
          </button>
          <button v-if="modalIngredientes.nuevoEstado" 
            @click="confirmarYCambiarEstado"
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import SucursalBadge from '../components/SucursalBadge.vue'
import OrdenCardCocina from '../components/cocina/OrdenCardCocina.vue'
import { apiClient } from '@/utils/apiClient'
import { useRestauranteChannel } from '../composables/useRestauranteChannel'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { useToast } from '@/composables/useToast'
import { getHeaders } from '@/config/api'
import { useDeviceZoom } from '@/composables/useDeviceZoom'

const { zoom } = useDeviceZoom()
const POLL_INTERVAL = 15000 // Aumentamos intervalo ya que tenemos WS
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
  visible:       false,
  loading:       false,
  guardando:     false,
  orden:         null,
  nuevoEstado:   null,
  items:         [],       // [{ producto_id, producto_nombre, cantidad, ingredientes: [] }]
  productosTotal: 0,
})

// ── Helpers ────────────────────────────────────────────────────────────────────


const fechaHoy = computed(() =>
  new Date().toLocaleDateString('es-MX', { weekday:'long', day:'numeric', month:'long' })
)

const esBebida = (detalle) => {
  const cat = (detalle.producto?.categoria?.nombre || detalle.categoria || '').trim().toLowerCase()
  if (cat) return cat.includes('barra') || cat.includes('bebida') || cat.includes('refresco') || cat.includes('fria')
  const nombre = (detalle.producto_nombre || detalle.producto?.nombre || '').toLowerCase()
  return ['coca', 'pepsi', 'fanta', 'sprite', 'jugo', 'refresco', 'cerveza', 'agua'].some(k => nombre.includes(k))
}

const esPostre = (detalle) => {
  const cat = (detalle.producto?.categoria?.nombre || detalle.categoria || '').trim().toLowerCase()
  if (cat) return cat.includes('postre') || cat.includes('reposteria') || cat.includes('pastel')
  return false
}

const esCocina = (detalle) => {
  return !esBebida(detalle) && !esPostre(detalle)
}

const isCocinaOrder = (o) => ['POR_PREPARAR', 'EN_PREPARACION', 'LISTA'].includes(o.estado)
const getDetallesCocina = (o) => (o.detalles || []).filter(esCocina)

const pendingOrders = computed(() => {
  return orders.value.filter(o => {
    if (!isCocinaOrder(o)) return false
    const detalles = getDetallesCocina(o)
    return detalles.length > 0 && detalles.some(d => ['PENDIENTE', 'ABIERTA'].includes(d.estado_preparacion || d.estado))
  })
})

const preparingOrders = computed(() => {
  return orders.value.filter(o => {
    if (!isCocinaOrder(o)) return false
    const detalles = getDetallesCocina(o)
    return detalles.length > 0 && detalles.some(d => (d.estado_preparacion || d.estado) === 'EN_PREPARACION')
  })
})

const hiddenOrders = ref([])

const readyOrders = computed(() => {
  return orders.value.filter(o => {
    if (!isCocinaOrder(o)) return false
    if (hiddenOrders.value.includes(o.id)) return false
    const detalles = getDetallesCocina(o)
    return detalles.length > 0 && detalles.every(d => (d.estado_preparacion || d.estado) === 'LISTO')
  })
})



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
        .filter(o => isCocinaOrder(o))
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    } else {
      console.warn('🍳 Cocina: respuesta sin datos', data)
    }
  } catch (e) { console.error('Error cocina:', e) }
  finally { 
    if (!silent) loading.value = false
    ultimaActualizacion.value = new Date().toLocaleTimeString()
  }
}

const getToken = () => localStorage.getItem('token') ?? sessionStorage.getItem('token')

// ── WebSockets ────────────────────────────────────────────────────────────────
const onOrdenWS = async (evento) => {
  const { accion, orden } = evento
  console.log('📡 WS Kitchen:', accion, orden.id)
  
  if (['creada', 'actualizada', 'estado_cambiado', 'productos_agregados', 'productos_agregados_a_estacion'].includes(accion)) {
    if (accion === 'creada') showToast(`Nueva orden #${orden.id} recibida`, 'info')
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
  // Filtrar para que el modal de COCINA solo muestre comida (Categoría Cocina) y coincida con el filtro
  let detallesCocina = (orden.detalles ?? []).filter(esCocina)
  if (estadoFiltro) {
    const estadosValidos = estadoFiltro === 'PENDIENTE' ? ['PENDIENTE', 'ABIERTA'] : [estadoFiltro]
    detallesCocina = detallesCocina.filter(d => estadosValidos.includes(d.estado_preparacion || d.estado))
  }

  modalIngredientes.value = {
    visible:        true,
    loading:        true,
    guardando:      false,
    orden,
    nuevoEstado,
    items:          [],
    productosTotal: detallesCocina.length,
  }

  try {
    const resultados = await Promise.all(
      detallesCocina.map(d =>
        apiClient.get(`/ingredientes/producto/${d.producto_id}${d.tamano ? `?tamano=${d.tamano}` : ''}`)
          .then(data => ({ detalle: d, ingredientes: (data.success || data.data) ? (data.data || data) : [] }))
          .catch(() => ({ detalle: d, ingredientes: [] }))
      )
    )

    modalIngredientes.value.items = resultados
      .filter(r => r.ingredientes.length > 0)
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
    const excluidos = []
    modalIngredientes.value.items.forEach(item => {
      item.ingredientes.forEach(ing => {
        if (!ing.incluir) {
          excluidos.push({
            producto_id: item.producto_id,
            ingrediente_id: ing.id
          })
        }
      })
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
      estacion: 'cocina',
      estado: nuevoEstadoDetalle,
      ingredientes_excluidos: ingredientesExcluidos
    })
    
    if (data.success || data.data) {
      await loadOrders()
      const labels = { EN_PREPARACION:'En preparación 🔥', LISTO:'Listos ✅' }
      showToast(`Platillos de Orden #${id} → ${labels[nuevoEstadoDetalle] || nuevoEstadoDetalle}`, 'success')
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

