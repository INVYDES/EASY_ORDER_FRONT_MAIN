<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
    @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

      <!-- Encabezado -->
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-semibold text-gray-800">Cobrar Ticket</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
      </div>

      <!-- Resumen del ticket -->
      <div class="bg-gray-50 rounded-xl px-4 py-3 mb-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-500 font-medium">Mesa</p>
            <p class="text-sm font-semibold text-gray-800">{{ ticket.mesa || 'N/A' }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-gray-500 font-medium">Subtotal</p>
            <p class="text-2xl font-bold text-indigo-600">${{ formatMoney(total) }}</p>
          </div>
        </div>
        <!-- Desglose si hay propina -->
        <div v-if="propina > 0" class="mt-3 pt-3 border-t border-gray-200 space-y-1 text-sm">
          <div class="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>${{ formatMoney(total) }}</span>
          </div>
          <div class="flex justify-between text-amber-600">
            <span>Propina</span>
            <span>+${{ formatMoney(propina) }}</span>
          </div>
          <div class="flex justify-between font-bold text-gray-800 border-t border-gray-200 pt-1">
            <span>Total a cobrar</span>
            <span>${{ formatMoney(totalConPropina) }}</span>
          </div>
        </div>
      </div>

      <div class="space-y-4">

        <!-- Método de pago -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Método de pago</label>
          <div class="grid grid-cols-3 gap-2">
            <button v-for="m in metodos" :key="m.value"
              @click="paymentMethod = m.value; amountReceived = 0"
              :class="['py-2.5 rounded-xl text-sm font-semibold border-2 transition flex flex-col items-center gap-1',
                paymentMethod === m.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300']">
              <span class="text-base">{{ m.icon }}</span>
              {{ m.label }}
            </button>
          </div>
        </div>

        <!-- Monto recibido (solo efectivo) -->
        <div v-if="paymentMethod === 'efectivo'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Monto recibido</label>
          <div class="relative">
            <span class="absolute left-3 top-3 text-gray-400 text-sm font-medium">$</span>
            <input v-model.number="amountReceived" type="number" step="0.01"
              :min="totalConPropina" placeholder="0.00"
              class="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              :class="amountReceived > 0 && amountReceived < totalConPropina ? 'border-red-400' : ''" />
          </div>
          <p v-if="amountReceived > 0 && amountReceived < totalConPropina" class="text-xs text-red-500 mt-1">
            El monto es menor al total{{ propina > 0 ? ' (incluye propina)' : '' }}
          </p>
        </div>

        <!-- Folio/referencia (solo tarjeta y transferencia) -->
        <div v-if="paymentMethod !== 'efectivo'">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ paymentMethod === 'tarjeta' ? 'Referencia del Voucher' : 'Referencia / Folio' }}
            <span class="text-red-500">*</span>
            <span class="text-gray-400 font-normal text-xs ml-1">(obligatorio)</span>
          </label>
          <input v-model="folio" type="text"
            :placeholder="paymentMethod === 'tarjeta' ? 'Número de voucher o referencia' : 'Ej. REF123456'"
            :class="['w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none',
              fieldError && paymentMethod === 'tarjeta' ? 'border-red-400' : 'border-gray-200']"
          />
          <p v-if="fieldError && paymentMethod === 'tarjeta'" class="text-xs text-red-500 mt-1">
            {{ fieldError }}
          </p>
          <p v-else-if="paymentMethod === 'tarjeta'" class="text-xs text-gray-500 mt-1">
            Ingresa el número de referencia del voucher de la terminal bancaria
          </p>
        </div>

        <!-- Propina -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Propina <span class="text-gray-400 font-normal">(opcional)</span>
          </label>
          <div class="relative">
            <span class="absolute left-3 top-3 text-gray-400 text-sm font-medium">$</span>
            <input v-model.number="propina" type="number" step="0.01" min="0" placeholder="0.00"
              class="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <!-- Atajos rápidos de propina -->
          <div class="flex gap-2 mt-2">
            <button v-for="pct in [10, 15, 20]" :key="pct"
              @click="propina = Math.round(total * pct / 100 * 100) / 100"
              class="flex-1 py-1 text-xs font-medium bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition">
              {{ pct }}%
            </button>
            <button @click="propina = 0" class="flex-1 py-1 text-xs font-medium bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-lg transition">
              Sin propina
            </button>
          </div>
        </div>

        <!-- Cambio (efectivo) — calcula sobre totalConPropina -->
        <div v-if="paymentMethod === 'efectivo' && cambio > 0"
          class="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <span class="text-sm font-medium text-amber-700">Cambio a entregar</span>
          <span class="text-lg font-bold text-amber-700">${{ formatMoney(cambio) }}</span>
        </div>

      </div>

      <!-- Error -->
      <div v-if="errorMsg" class="mt-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
        {{ errorMsg }}
      </div>

      <!-- Botones -->
      <div class="flex gap-3 mt-6">
        <button @click="$emit('close')"
          class="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
          Cancelar
        </button>
        <button @click="processPayment" :disabled="!canPay || processing"
          class="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
          <span v-if="processing">Procesando...</span>
          <span v-else>Confirmar pago{{ propina > 0 ? ` ($${formatMoney(totalConPropina)})` : '' }}</span>
        </button>
      </div>

    </div>

    <!-- ══ TICKET PARA PDF / IMPRESIÓN (OCULTO) ══ -->
    <div id="ticket-printable" class="hidden">
      <div style="width: 80mm; padding: 5mm; font-family: 'Courier New', Courier, monospace; color: #000; background: #fff;">
        <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 5mm; margin-bottom: 5mm;">
          <h2 style="margin: 0; font-size: 18px; text-transform: uppercase;">{{ nombreSucursal }}</h2>
          <p style="margin: 5px 0; font-size: 12px;">Comprobante de Pago</p>
          <p style="margin: 0; font-size: 11px;">{{ new Date().toLocaleString('es-MX') }}</p>
        </div>

        <div style="font-size: 12px; margin-bottom: 5mm;">
          <p style="margin: 2px 0;"><strong>Mesa:</strong> {{ ticket.mesa || 'N/A' }}</p>
          <p style="margin: 2px 0;"><strong>Atendió:</strong> {{ userName }}</p>
        </div>

        <table style="width: 100%; font-size: 11px; border-collapse: collapse; margin-bottom: 5mm;">
          <thead>
            <tr style="border-bottom: 1px dashed #000;">
              <th style="text-align: left; padding: 2mm 0;">CANT</th>
              <th style="text-align: left; padding: 2mm 0;">PRODUCTO</th>
              <th style="text-align: right; padding: 2mm 0;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in normalizedItems" :key="item.id">
              <td style="padding: 1mm 0;">{{ item.cantidad }}</td>
              <td style="padding: 1mm 0;">{{ item.nombre }}</td>
              <td style="text-align: right; padding: 1mm 0;">${{ formatMoney(item.subtotal) }}</td>
            </tr>
          </tbody>
        </table>

        <div style="border-top: 1px dashed #000; padding-top: 3mm; font-size: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 1mm;">
            <span>Consumo Real:</span>
            <span>${{ formatMoney(total) }}</span>
          </div>
          <div v-if="propina > 0" style="display: flex; justify-content: space-between; margin-bottom: 1mm;">
            <span>Propina:</span>
            <span>${{ formatMoney(propina) }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-top: 2mm; border-top: 1px solid #000; padding-top: 2mm;">
            <span>TOTAL:</span>
            <span>${{ formatMoney(totalConPropina) }}</span>
          </div>
        </div>

        <div style="margin-top: 8mm; text-align: center; border-top: 1px dashed #000; padding-top: 5mm;">
          <p style="margin: 0; font-size: 10px; color: #444;">Folio:</p>
          <p style="margin: 2px 0; font-size: 12px; font-weight: bold; letter-spacing: 1px;">{{ uniqueIdentifier }}</p>
          <p style="margin-top: 5mm; font-size: 11px; font-style: italic;">¡Gracias por su visita!</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { API_URL } from '@/config/api'

const props = defineProps({
  ticket: { type: Object, required: true },
})
const emit = defineEmits(['close', 'payment-processed'])

const paymentMethod  = ref('efectivo')
const amountReceived = ref(0)
const propina        = ref(0)
const folio          = ref('')
const errorMsg       = ref('')
const fieldError     = ref('')
const processing     = ref(false)
const nombreSucursal = ref('RESTAURANTE E-ORDER')
const detectedRestId = ref(null)

// --- Datos del Usuario ---
const userRaw = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}'
const user = JSON.parse(userRaw)
const userName = computed(() => user.name || 'Personal')

// BUSCADOR DE ID INFALIBLE
const restauranteId = computed(() => {
  // 1. Prioridad: Lo que detectamos por API o por productos
  if (detectedRestId.value) return detectedRestId.value
  
  // 2. Revisar si algún producto trae el restaurante_id (Muy común)
  const items = props.ticket.detalles || props.ticket.items || []
  const itemWithId = items.find(i => i.restaurante_id || (i.producto && i.producto.restaurante_id))
  if (itemWithId) {
    const id = itemWithId.restaurante_id || itemWithId.producto.restaurante_id
    if (id) return id
  }

  // 3. Revisar en la orden directamente
  const rid = props.ticket.restaurante_id || props.ticket.id_restaurante
  if (rid && rid !== 'undefined' && rid !== 'null') return rid

  return ''
})

// Identificador Único: restaurante_id + orden_id
const uniqueIdentifier = computed(() => `${restauranteId.value}${props.ticket.id}`)

// --- SINCRONIZACIÓN PROFUNDA ---
const syncIdentity = async () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }

  try {
    // A) Preguntar a la API por la orden completa (Para asegurar el ID)
    const resO = await fetch(`${API_URL}/ordenes/${props.ticket.id}`, { headers })
    if (resO.ok) {
      const dataO = await resO.json()
      const realOrder = dataO.data || dataO
      if (realOrder.restaurante_id) {
        detectedRestId.value = realOrder.restaurante_id
      }
    }

    await nextTick()

    // B) Con el ID, pedir el nombre
    const rid = restauranteId.value
    if (rid) {
      const resR = await fetch(`${API_URL}/restaurantes/${rid}`, { headers })
      if (resR.ok) {
        const dataR = await resR.json()
        const nombre = dataR.data?.nombre || dataR.nombre
        if (nombre) {
          nombreSucursal.value = nombre.toUpperCase()
        }
      }
    }
  } catch (err) {
    console.error('Error en syncIdentity:', err)
  }
}

const metodos = [
  { value: 'efectivo',      label: 'Efectivo',      icon: '💵' },
  { value: 'tarjeta',       label: 'Tarjeta',       icon: '💳' },
  { value: 'transferencia', label: 'Transferencia', icon: '📲' },
]

const total           = computed(() => Number(props.ticket.total || 0))
const totalConPropina = computed(() => total.value + Number(propina.value || 0))

const normalizedItems = computed(() => {
  const items = props.ticket.detalles || props.ticket.items || []
  return items.map(item => {
    const cantidad = item.cantidad ?? item.quantity ?? 0
    const precio = item.precio_unitario ?? item.price ?? 0
    return {
      id: item.id,
      cantidad,
      nombre: item.producto?.nombre ?? item.producto_nombre ?? item.name ?? item.nombre ?? 'Producto',
      subtotal: item.subtotal ?? (cantidad * precio)
    }
  })
})

const cambio = computed(() => {
  if (paymentMethod.value !== 'efectivo') return 0
  return Math.max(0, amountReceived.value - totalConPropina.value)
})

const canPay = computed(() => {
  if (paymentMethod.value === 'efectivo') {
    if (amountReceived.value < totalConPropina.value) return false
  }
  if (['tarjeta', 'transferencia'].includes(paymentMethod.value)) {
    if (!folio.value || folio.value.trim() === '') return false
  }
  return true
})

const formatMoney = (v) => v === undefined || v === null ? '0.00' : Number(v).toFixed(2)

const imprimirTicket = () => {
  const el = document.getElementById('ticket-printable')
  if (!el) return
  
  const win = window.open('', '_blank', 'width=400,height=600')
  win.document.write(`
    <html>
      <head>
        <title>Ticket_${uniqueIdentifier.value}</title>
        <style>
          @page { margin: 0; }
          body { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        ${el.innerHTML}
      </body>
    </html>
  `)
  win.document.close()
  win.focus()
  setTimeout(() => {
    win.print()
    win.close()
  }, 500)
}

const processPayment = async () => {
  if (processing.value) return
  errorMsg.value = ''
  
  if (paymentMethod.value === 'efectivo' && amountReceived.value < totalConPropina.value) {
    errorMsg.value = `Monto insuficiente`
    return
  }

  processing.value = true
  
  // ASEGURAR IDENTIDAD JUSTO ANTES DE IMPRIMIR
  await syncIdentity()
  await nextTick()

  imprimirTicket()

  emit('payment-processed', {
    metodo_pago:  paymentMethod.value,
    total:        total.value,
    propina:      Number(propina.value || 0),
    monto_pagado: paymentMethod.value === 'efectivo' ? amountReceived.value : totalConPropina.value,
    cambio:       cambio.value,
    folio:        folio.value.trim() || null,
  })
  
  processing.value = false
}

onMounted(() => {
  syncIdentity()
})
</script>