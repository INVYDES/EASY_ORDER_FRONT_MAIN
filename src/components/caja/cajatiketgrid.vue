<template>
  <div>
    <!-- ══ MODAL: COBRAR ORDEN ══ -->
    <div v-if="ordenCobrar" class="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" @click.self="ordenCobrar = null">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="font-black text-slate-800 text-lg">Cobrar orden</h3>
            <p class="text-xs text-slate-400 font-bold">{{ ordenCobrar.folio }} · Mesa {{ ordenCobrar.mesa || '—' }}</p>
          </div>
          <button @click="ordenCobrar = null" class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200">✕</button>
        </div>

        <!-- Detalles de la orden -->
        <div class="px-6 py-4 max-h-52 overflow-y-auto space-y-2">
          <div v-for="d in ordenCobrar.detalles" :key="d.id" class="flex justify-between text-sm font-bold text-slate-700">
            <span>{{ d.cantidad }}× {{ d.producto_nombre || d.producto?.nombre }}</span>
            <span>${{ Number(d.subtotal || 0).toFixed(2) }}</span>
          </div>
        </div>

        <!-- Propina -->
        <div class="px-6 py-3 bg-slate-50 border-y border-slate-100">
          <div class="flex items-center justify-between gap-4">
            <label class="text-xs font-black text-slate-500 uppercase tracking-widest">Propina</label>
            <div class="flex items-center gap-2">
              <button v-for="pct in [0, 10, 15, 20]" :key="pct"
                @click="propinaPct = pct; propinaManual = ''"
                :class="['px-3 py-1.5 rounded-xl text-xs font-black transition',
                  propinaPct === pct && !propinaManual ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 border border-slate-200']">
                {{ pct === 0 ? 'Sin propina' : pct + '%' }}
              </button>
              <div class="relative">
                <span class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                <input v-model="propinaManual" @focus="propinaPct = null" type="number" min="0" placeholder="0"
                  class="w-20 pl-5 pr-2 py-1.5 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
          </div>
          <div class="flex justify-between text-xs font-black text-slate-500 mt-3">
            <span>Subtotal</span><span>${{ Number(ordenCobrar.total || 0).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-base font-black text-slate-800 mt-1">
            <span>Total con propina</span>
            <span class="text-indigo-600">${{ totalConPropina.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Método de pago -->
        <div class="px-6 py-4">
          <p class="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Método de pago</p>
          <div class="grid grid-cols-3 gap-2 mb-5">
            <button v-for="m in metodos" :key="m.key"
              @click="metodoPago = m.key"
              :class="['flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 font-black text-xs transition',
                metodoPago === m.key ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300']">
              <span class="text-xl">{{ m.icon }}</span>{{ m.label }}
            </button>
          </div>

          <!-- Botones de acción -->
          <div class="flex gap-3">
            <button @click="abrirDividirCuenta"
              class="flex-1 py-3 text-xs font-black text-slate-600 bg-slate-100 rounded-2xl hover:bg-slate-200 transition flex items-center justify-center gap-2">
              ✂️ Dividir cuenta
            </button>
            <button @click="cobrarOrden" :disabled="cobrando"
              class="flex-1 py-3 text-xs font-black text-white bg-emerald-600 rounded-2xl hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
              <div v-if="cobrando" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              {{ cobrando ? 'Procesando...' : '💳 Cobrar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ MODAL: DIVIDIR CUENTA ══ -->
    <div v-if="modalDividir" class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" @click.self="modalDividir = false">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 class="font-black text-slate-800 text-lg">✂️ Dividir cuenta</h3>
            <p class="text-xs text-slate-400 font-bold">{{ ordenCobrar?.folio }}</p>
          </div>
          <button @click="modalDividir = false" class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">✕</button>
        </div>

        <!-- Selector de modo -->
        <div class="px-6 pt-4 shrink-0">
          <div class="flex bg-slate-100 p-1 rounded-2xl">
            <button @click="modoDividir = 'equitativo'"
              :class="['flex-1 py-2 text-xs font-black rounded-xl transition',
                modoDividir === 'equitativo' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400']">
              ⚖️ Partes iguales
            </button>
            <button @click="modoDividir = 'manual'"
              :class="['flex-1 py-2 text-xs font-black rounded-xl transition',
                modoDividir === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400']">
              🍽️ Por platillo
            </button>
          </div>
        </div>

        <!-- Modo equitativo -->
        <div v-if="modoDividir === 'equitativo'" class="px-6 py-4 flex-1 overflow-y-auto">
          <div class="flex items-center gap-4 mb-6">
            <label class="text-sm font-black text-slate-600">Número de comensales</label>
            <div class="flex items-center gap-3 bg-slate-100 rounded-2xl p-1">
              <button @click="numComensales = Math.max(2, numComensales - 1)"
                class="w-8 h-8 bg-white rounded-xl font-black text-slate-600 hover:bg-slate-50 shadow-sm">−</button>
              <span class="w-8 text-center font-black text-slate-800">{{ numComensales }}</span>
              <button @click="numComensales = Math.min(20, numComensales + 1)"
                class="w-8 h-8 bg-white rounded-xl font-black text-slate-600 hover:bg-slate-50 shadow-sm">+</button>
            </div>
          </div>

          <!-- Vista previa de división equitativa -->
          <div class="space-y-2">
            <div v-for="n in numComensales" :key="n"
              class="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600">{{ n }}</div>
                <span class="text-sm font-bold text-slate-700">Comensal {{ n }}</span>
              </div>
              <span class="font-black text-indigo-700">
                ${{ montoPorComensal(n).toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- Método de pago por comensal -->
          <div class="mt-4 pt-4 border-t border-slate-100">
            <p class="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Método de pago (aplica a todos)</p>
            <div class="flex gap-2">
              <button v-for="m in metodos" :key="m.key"
                @click="metodoPagoDividir = m.key"
                :class="['flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 font-black text-xs transition',
                  metodoPagoDividir === m.key ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-400']">
                <span>{{ m.icon }}</span>{{ m.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Modo manual: arrastrar platillos a comensales -->
        <div v-else class="px-6 py-4 flex-1 overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Comensales</p>
            <div class="flex items-center gap-2">
              <button @click="quitarComensal" class="px-3 py-1 rounded-xl bg-slate-100 text-slate-500 text-xs font-black hover:bg-slate-200">−</button>
              <span class="text-sm font-black text-slate-700">{{ comensalesManual.length }}</span>
              <button @click="agregarComensal" class="px-3 py-1 rounded-xl bg-indigo-100 text-indigo-600 text-xs font-black hover:bg-indigo-200">+</button>
            </div>
          </div>

          <!-- Platillos sin asignar -->
          <div class="mb-4">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Arrastra a un comensal</p>
            <div class="flex flex-wrap gap-2 min-h-12 p-3 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <button v-for="d in detallesSinAsignar" :key="d.id"
                @click="seleccionarDetalle(d)"
                :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border-2',
                  detalleSeleccionado?.id === d.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300']">
                {{ d.cantidad }}× {{ (d.producto_nombre || d.producto?.nombre || '').substring(0, 18) }}
                <span class="text-[10px] opacity-70">${{ Number(d.subtotal || 0).toFixed(0) }}</span>
              </button>
              <p v-if="detallesSinAsignar.length === 0" class="text-xs text-slate-300 italic font-bold">Todos asignados ✓</p>
            </div>
          </div>

          <!-- Comensales -->
          <div class="space-y-3">
            <div v-for="(com, idx) in comensalesManual" :key="com.id"
              @click="detalleSeleccionado && asignarAManual(idx)"
              :class="['rounded-2xl border-2 p-4 transition cursor-pointer',
                detalleSeleccionado ? 'border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50' : 'border-slate-100 bg-white']">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600">{{ idx + 1 }}</div>
                  <span class="text-sm font-black text-slate-700">Comensal {{ idx + 1 }}</span>
                  <span v-if="detalleSeleccionado" class="text-[9px] font-black text-indigo-500 uppercase">(toca para asignar)</span>
                </div>
                <span class="font-black text-indigo-700 text-sm">${{ subtotalComensal(idx).toFixed(2) }}</span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="d in com.detalles" :key="d.id"
                  @click.stop="devolverDetalle(d, idx)"
                  class="flex items-center gap-1 px-2 py-1 bg-white rounded-xl text-[10px] font-bold text-slate-600 border border-slate-200 cursor-pointer hover:border-red-300 hover:text-red-500 transition">
                  {{ d.cantidad }}× {{ (d.producto_nombre || d.producto?.nombre || '').substring(0, 14) }}
                  <span class="text-slate-300">✕</span>
                </span>
                <span v-if="com.detalles.length === 0" class="text-[10px] text-slate-300 italic">Sin productos</span>
              </div>
            </div>
          </div>

          <!-- Método de pago manual -->
          <div class="mt-4 pt-4 border-t border-slate-100">
            <p class="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Método de pago</p>
            <div class="flex gap-2">
              <button v-for="m in metodos" :key="m.key"
                @click="metodoPagoDividir = m.key"
                :class="['flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 font-black text-xs transition',
                  metodoPagoDividir === m.key ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-400']">
                <span>{{ m.icon }}</span>{{ m.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Footer del modal dividir -->
        <div class="px-6 py-4 border-t border-slate-100 shrink-0">
          <div class="flex items-center justify-between mb-3 text-sm font-black text-slate-800">
            <span>Total a cobrar</span>
            <span class="text-indigo-700 text-base">${{ Number(ordenCobrar?.total || 0).toFixed(2) }}</span>
          </div>
          <div v-if="errorDividir" class="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700">
            {{ errorDividir }}
          </div>
          <button @click="cobrarDividido" :disabled="cobrando"
            class="w-full py-3.5 text-sm font-black text-white bg-emerald-600 rounded-2xl hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
            <div v-if="cobrando" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            {{ cobrando ? 'Procesando...' : `💳 Cobrar (${modoDividir === 'equitativo' ? numComensales + ' partes' : comensalesManual.length + ' comensales'})` }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══ GRID DE TICKETS ══ -->
    <div v-if="orders.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
      <span class="text-5xl mb-4 opacity-20">{{ type === 'open' ? '🎫' : '🗂️' }}</span>
      <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">
        {{ type === 'open' ? 'Sin órdenes por cobrar' : 'Sin órdenes cerradas' }}
      </p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="order in orders" :key="order.id"
        class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">

        <!-- Header ticket -->
        <div class="px-5 py-4 flex items-center justify-between"
          :class="type === 'open' ? 'bg-emerald-50' : 'bg-slate-50'">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-sm"
              :class="type === 'open' ? 'bg-emerald-100' : 'bg-slate-100'">
              {{ type === 'open' ? '💳' : '✓' }}
            </div>
            <div>
              <p class="text-xs font-black text-slate-400 uppercase tracking-tighter">{{ type === 'open' ? 'Por cobrar' : 'Cerrada' }}</p>
              <p class="text-base font-black text-slate-800 leading-none">{{ order.folio || '#' + order.id }}</p>
            </div>
          </div>
          <div v-if="order.mesa" class="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black">
            MESA {{ order.mesa }}
          </div>
        </div>

        <!-- Detalles -->
        <div class="px-5 py-4 space-y-3">
          <div class="space-y-1 bg-slate-50 rounded-2xl p-3">
            <div v-for="d in (order.detalles || []).slice(0, 4)" :key="d.id"
              class="flex justify-between text-xs font-bold text-slate-600">
              <span class="truncate flex-1">{{ d.cantidad }}× {{ d.producto_nombre || d.producto?.nombre }}</span>
              <span class="text-slate-400 ml-2">${{ Number(d.subtotal || 0).toFixed(2) }}</span>
            </div>
            <p v-if="(order.detalles || []).length > 4" class="text-[10px] text-slate-400 font-black pt-1">
              +{{ order.detalles.length - 4 }} producto(s) más
            </p>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400 font-bold">
              {{ order.created_at_formateado || (order.created_at ? new Date(order.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '—') }}
            </span>
            <div class="flex items-center gap-1">
              <span v-if="order.propina && Number(order.propina) > 0" class="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                +${{ Number(order.propina).toFixed(2) }} propina
              </span>
              <span v-if="order.metodo_pago" class="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg uppercase">
                {{ order.metodo_pago }}
              </span>
            </div>
          </div>
        </div>

        <!-- Footer ticket -->
        <div class="px-5 pb-5">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs text-slate-500 font-black">Total</span>
            <span class="text-xl font-black text-slate-800">${{ Number(order.total || 0).toFixed(2) }}</span>
          </div>
          <button v-if="type === 'open'"
            @click="abrirCobrar(order)"
            class="w-full py-3 text-xs font-black text-white bg-emerald-600 rounded-2xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 active:scale-95">
            💳 Cobrar orden
          </button>
          <div v-else class="w-full py-2.5 text-center text-[10px] font-black text-slate-400 bg-slate-50 rounded-2xl uppercase tracking-widest">
            ✓ Pagada · {{ order.metodo_pago || 'efectivo' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { API_URL } from '@/config/api'

const props = defineProps({
  orders: { type: Array, default: () => [] },
  type:   { type: String, default: 'open' }, // 'open' | 'closed'
})
const emit = defineEmits(['order-paid', 'refresh'])

// ── Estado Cobrar ──────────────────────────────────────────────────────────
const ordenCobrar    = ref(null)
const metodoPago     = ref('efectivo')
const propinaPct     = ref(0)
const propinaManual  = ref('')
const cobrando       = ref(false)

const metodos = [
  { key: 'efectivo',      label: 'Efectivo',      icon: '💵' },
  { key: 'tarjeta',       label: 'Tarjeta',        icon: '💳' },
  { key: 'transferencia', label: 'Transferencia',  icon: '📲' },
]

const propinaCalculada = computed(() => {
  if (propinaManual.value) return Number(propinaManual.value) || 0
  if (!propinaPct.value)   return 0
  return (Number(ordenCobrar.value?.total || 0) * propinaPct.value) / 100
})

const totalConPropina = computed(() =>
  Number(ordenCobrar.value?.total || 0) + propinaCalculada.value
)

const abrirCobrar = (order) => {
  ordenCobrar.value = order
  metodoPago.value  = 'efectivo'
  propinaPct.value  = 0
  propinaManual.value = ''
  modalDividir.value  = false
}

const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: token ? `Bearer ${token}` : '' }
}

const cobrarOrden = async () => {
  if (!ordenCobrar.value) return
  cobrando.value = true
  try {
    // 1. Cerrar la orden con método de pago y propina
    const resCerrar = await fetch(`${API_URL}/ordenes/${ordenCobrar.value.id}/cerrar`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        metodo_pago: metodoPago.value,
        propina:     propinaCalculada.value,
      }),
    })
    const dataCerrar = await resCerrar.json()
    if (!resCerrar.ok || !dataCerrar.success) {
      // Intentar con PUT si cerrar no existe como ruta independiente
      const resUpdate = await fetch(`${API_URL}/ordenes/${ordenCobrar.value.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          estado:      'CERRADA',
          metodo_pago: metodoPago.value,
          propina:     propinaCalculada.value,
        }),
      })
      if (!resUpdate.ok) throw new Error('Error al cerrar orden')
    }

    emit('order-paid', {
      id:          ordenCobrar.value.id,
      folio:       ordenCobrar.value.folio,
      total:       totalConPropina.value,
      metodo_pago: metodoPago.value,
      propina:     propinaCalculada.value,
    })
    ordenCobrar.value = null
  } catch (e) {
    console.error('Error al cobrar:', e)
    alert('Error al cobrar la orden. Intenta de nuevo.')
  } finally {
    cobrando.value = false
  }
}

// ── Estado Dividir ─────────────────────────────────────────────────────────
const modalDividir      = ref(false)
const modoDividir       = ref('equitativo')  // 'equitativo' | 'manual'
const numComensales     = ref(2)
const metodoPagoDividir = ref('efectivo')
const errorDividir      = ref('')

// Modo manual
const comensalesManual    = ref([])
const detalleSeleccionado = ref(null)

const detallesSinAsignar = computed(() => {
  if (!ordenCobrar.value?.detalles) return []
  const asignados = comensalesManual.value.flatMap(c => c.detalles.map(d => d.id))
  return ordenCobrar.value.detalles.filter(d => !asignados.includes(d.id))
})

const subtotalComensal = (idx) => {
  return comensalesManual.value[idx]?.detalles.reduce((s, d) => s + Number(d.subtotal || 0), 0) || 0
}

const montoPorComensal = (n) => {
  const total = Number(ordenCobrar.value?.total || 0)
  const monto = total / numComensales.value
  // Último comensal absorbe los centavos residuales
  if (n === numComensales.value) return total - monto * (numComensales.value - 1)
  return monto
}

const abrirDividirCuenta = () => {
  modoDividir.value       = 'equitativo'
  numComensales.value     = 2
  metodoPagoDividir.value = 'efectivo'
  errorDividir.value      = ''
  detalleSeleccionado.value = null
  // Inicializar comensales manuales con 2
  comensalesManual.value = [
    { id: 1, detalles: [] },
    { id: 2, detalles: [] },
  ]
  modalDividir.value = true
}

const agregarComensal = () => {
  const id = (comensalesManual.value[comensalesManual.value.length - 1]?.id || 0) + 1
  comensalesManual.value.push({ id, detalles: [] })
}

const quitarComensal = () => {
  if (comensalesManual.value.length <= 2) return
  // Devolver detalles del último comensal al pool sin asignar
  const ultimo = comensalesManual.value.pop()
  // Los detalles vuelven a estar disponibles automáticamente por computed
}

const seleccionarDetalle = (d) => {
  detalleSeleccionado.value = detalleSeleccionado.value?.id === d.id ? null : d
}

const asignarAManual = (idxComensal) => {
  if (!detalleSeleccionado.value) return
  comensalesManual.value[idxComensal].detalles.push(detalleSeleccionado.value)
  detalleSeleccionado.value = null
}

const devolverDetalle = (d, idxComensal) => {
  comensalesManual.value[idxComensal].detalles =
    comensalesManual.value[idxComensal].detalles.filter(x => x.id !== d.id)
}

const cobrarDividido = async () => {
  if (!ordenCobrar.value) return
  errorDividir.value = ''

  // Validar modo manual: todos los detalles deben estar asignados
  if (modoDividir.value === 'manual') {
    if (detallesSinAsignar.value.length > 0) {
      errorDividir.value = `Faltan ${detallesSinAsignar.value.length} producto(s) por asignar a un comensal.`
      return
    }
    const vacios = comensalesManual.value.filter(c => c.detalles.length === 0)
    if (vacios.length > 0) {
      errorDividir.value = `El comensal ${vacios[0].id} no tiene productos asignados.`
      return
    }
  }

  cobrando.value = true
  try {
    // Llamar al endpoint dividirCuenta del backend
    const payload = modoDividir.value === 'equitativo'
      ? { metodo: 'equitativo', comensales: numComensales.value }
      : {
          metodo: 'manual',
          divisiones: comensalesManual.value.map((c, i) => ({
            comensal: i + 1,
            detalles: c.detalles.map(d => d.id),
          })),
        }

    const resDividir = await fetch(`${API_URL}/ordenes/${ordenCobrar.value.id}/dividir-cuenta`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    })
    const dataDividir = await resDividir.json()
    if (!resDividir.ok || !dataDividir.success) {
      errorDividir.value = dataDividir.message || 'Error al dividir cuenta'
      return
    }

    // Cerrar la orden después de dividir
    await fetch(`${API_URL}/ordenes/${ordenCobrar.value.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ estado: 'CERRADA', metodo_pago: metodoPagoDividir.value }),
    })

    emit('order-paid', {
      id:          ordenCobrar.value.id,
      folio:       ordenCobrar.value.folio,
      total:       ordenCobrar.value.total,
      metodo_pago: metodoPagoDividir.value,
      propina:     0,
      cuentas:     dataDividir.cuentas,
    })
    modalDividir.value = false
    ordenCobrar.value  = null
  } catch (e) {
    errorDividir.value = 'Error de conexión al dividir cuenta'
  } finally {
    cobrando.value = false
  }
}
</script>

<style scoped>
.animate-spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.animate-slide-up { animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>