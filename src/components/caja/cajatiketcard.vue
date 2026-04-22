<template>
  <div
    class="bg-white rounded-xl shadow-sm border flex flex-col gap-3 hover:shadow-md transition-shadow overflow-hidden"
    :class="ticket.estado === 'CERRADA'
      ? 'border-gray-100 opacity-75'
      : estadoConfig.border"
  >
    <!-- HEADER -->
    <div class="px-4 pt-4 flex items-center justify-between">
      <div>
        <p class="font-semibold text-gray-800 text-sm">
          {{ ticket.folio || `Orden #${ticket.id}` }}
          <span
            v-if="ticket.mesa"
            class="text-gray-400 font-normal ml-1"
          >
            · Mesa {{ ticket.mesa }}
          </span>
        </p>
        <p class="text-xs text-gray-400 mt-0.5">
          {{ formatTime(ticket.created_at) }}
        </p>
      </div>

      <div class="text-right">
        <p class="font-bold text-gray-900 text-base">
          ${{ formatMoney(ticket.total) }}
        </p>
        <span
          class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          :class="estadoConfig.badge"
        >
          {{ estadoConfig.label }}
        </span>
      </div>
    </div>

    <!-- USUARIO -->
    <div
      v-if="ticket.user?.name"
      class="px-4 flex items-center gap-1.5 text-xs text-gray-500"
    >
      <span>👤</span>
      <span>{{ ticket.user.name }}</span>
    </div>

    <!-- ITEMS -->
    <div class="px-4 space-y-1 text-sm text-gray-600 border-t border-gray-50 pt-2">
      <div
        v-if="normalizedItems.length === 0"
        class="text-gray-400 italic text-xs"
      >
        Sin productos
      </div>

      <div
        v-for="item in normalizedItems"
        :key="item.id"
        class="flex justify-between"
      >
        <span class="truncate flex-1">
          {{ item.cantidad }} × {{ item.nombre }}
        </span>
        <span class="text-gray-500 shrink-0 ml-2">
          ${{ formatMoney(item.subtotal) }}
        </span>
      </div>
    </div>

    <!-- PROPINA -->
    <div
      v-if="Number(ticket.propina || ticket.tip) > 0"
      class="px-4 flex justify-between text-xs text-amber-600 font-medium"
    >
      <span>Propina</span>
      <span>${{ formatMoney(ticket.propina || ticket.tip) }}</span>
    </div>

    <!-- MÉTODO DE PAGO Y REFERENCIA -->
    <div
      v-if="ticket.estado === 'CERRADA' && ticket.metodo_pago"
      class="px-4 flex justify-between text-xs text-gray-400"
    >
      <span>Método</span>
      <span class="capitalize font-medium">
        {{ ticket.metodo_pago }}
      </span>
    </div>

    <!-- REFERENCIA DEL VOUCHER (tarjeta/transferencia) -->
    <div
      v-if="ticket.estado === 'CERRADA' && (ticket.folio || ticket.referencia) && ticket.metodo_pago !== 'efectivo'"
      class="px-4 flex justify-between text-xs"
    >
      <span class="text-gray-400">{{ ticket.metodo_pago === 'tarjeta' ? 'Voucher' : 'Referencia' }}</span>
      <span class="font-mono font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
        {{ ticket.folio || ticket.referencia }}
      </span>
    </div>

    <!-- ACCIONES -->
    <div class="px-4 pb-4">
      <button
        v-if="ticket.estado !== 'CERRADA'"
        @click="showModal = true"
        class="w-full py-2.5 text-sm font-semibold rounded-xl transition"
        :class="ticket.estado === 'LISTA'
          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
          : 'bg-amber-500 hover:bg-amber-600 text-white'"
      >
        {{ ticket.estado === 'LISTA'
          ? '💰 Cobrar'
          : '💰 Cobrar (pendiente)' }}
      </button>

      <div
        v-else
        class="w-full py-2 bg-emerald-50 text-emerald-600 rounded-xl text-center text-xs font-semibold"
      >
        ✓ Pagado
      </div>
    </div>
  </div>

  <!-- MODAL -->
  <PaymentModal
    v-if="showModal"
    :ticket="ticket"
    @close="showModal = false"
    @payment-processed="handlePaymentProcessed"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import PaymentModal from './paymentModal.vue'
import { API_URL } from '@/config/api'

const props = defineProps({
  ticket: { type: Object, required: true },
})

const emit = defineEmits(['updated'])

const showModal = ref(false)
const processing = ref(false)


// ─────────────────────────────────────────────
// CONFIGURACIÓN DE ESTADOS
// ─────────────────────────────────────────────

const ESTADOS = {
  ABIERTA: {
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    label: 'Por preparar',
  },
  EN_PREPARACION: {
    border: 'border-orange-300',
    badge: 'bg-orange-100 text-orange-700',
    label: 'En preparación',
  },
  LISTA: {
    border: 'border-emerald-400',
    badge: 'bg-emerald-100 text-emerald-700',
    label: 'Lista — cobrar',
  },
  CERRADA: {
    border: 'border-gray-100',
    badge: 'bg-gray-100 text-gray-500',
    label: 'Pagada',
  },
}

const estadoConfig = computed(() =>
  ESTADOS[props.ticket.estado] || ESTADOS.CERRADA
)


// ─────────────────────────────────────────────
// NORMALIZACIÓN DE ITEMS
// ─────────────────────────────────────────────

const rawItems = computed(() =>
  props.ticket.detalles || props.ticket.items || []
)

const normalizeItem = (item) => {
  const cantidad =
    item.cantidad ?? item.quantity ?? 0

  const precio =
    item.precio_unitario ?? item.price ?? 0

  return {
    id: item.id,
    cantidad,
    nombre:
      item.producto_nombre ??
      item.name ??
      item.nombre ??
      'Producto',
    subtotal:
      item.subtotal ??
      cantidad * precio,
  }
}

const normalizedItems = computed(() =>
  rawItems.value.map(normalizeItem)
)


// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const formatMoney = (v) =>
  v === undefined || v === null
    ? '0.00'
    : Number(v).toFixed(2)

const formatTime = (ts) =>
  !ts
    ? ''
    : new Date(ts).toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
      })

const getHeaders = () => {
  const token =
    localStorage.getItem('token') ??
    sessionStorage.getItem('token')

  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: token
      ? `Bearer ${token}`
      : '',
  }
}


// ─────────────────────────────────────────────
// PROCESAR PAGO
// ─────────────────────────────────────────────

const handlePaymentProcessed = async (paymentData) => {
  if (processing.value) return
  processing.value = true

  try {
    // Construir el payload con los datos de pago incluyendo folio/referencia
    const payload = {
      estado: 'CERRADA',
      metodo_pago: paymentData.metodo_pago,
      propina: paymentData.propina || 0,
      folio: paymentData.folio || null,
      referencia: paymentData.folio || null,
    }

    // Intentar actualizar orden directamente
    const updateRes = await fetch(
      `${API_URL}/ordenes/${props.ticket.id}`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }
    )

    const updateData = await updateRes.json()

    // Fallback si el endpoint PUT no acepta metodo_pago
    if (!updateRes.ok || !updateData.success) {
      const cerrarRes = await fetch(
        `${API_URL}/ordenes/${props.ticket.id}/cerrar`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload),
        }
      )

      const cerrarData = await cerrarRes.json()

      if (!cerrarRes.ok || !cerrarData.success) {
        throw new Error(
          cerrarData.message ||
          'Error al cerrar la orden'
        )
      }
    }

    showModal.value = false

    emit('updated', {
      id: props.ticket.id,
      metodo_pago: paymentData.metodo_pago,
      propina: paymentData.propina,
      cambio: paymentData.cambio,
      folio: paymentData.folio,
    })
  } catch (e) {
    alert(e.message || 'Error al procesar el pago')
  } finally {
    processing.value = false
  }
}
</script>