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
          <div class="grid grid-cols-2 gap-2">
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
        <div v-if="paymentMethod === 'tarjeta' || paymentMethod === 'transferencia'">
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

        <!-- Terminal Point (Mercado Pago) -->
        <div v-if="paymentMethod === 'terminal'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Terminal Point</label>
          <div v-if="cargandoTerminales" class="text-xs text-gray-400 py-2">Cargando terminales…</div>
          <template v-else-if="terminales.length">
            <select v-model="terminalId"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
              <option v-for="t in terminales" :key="t.id" :value="t.terminal_id">
                {{ t.alias || t.terminal_id }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">El total se enviará a este terminal y la venta se cerrará sola al confirmarse el pago.</p>
          </template>
          <div v-else class="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            No hay terminales configuradas. Conéctalas en "📟 Terminal Point" (arriba).
          </div>
          <p v-if="terminalError" class="text-xs text-red-500 mt-1">{{ terminalError }}</p>
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

      <!-- Espera de cobro en terminal Point -->
      <div v-if="waitingTerminal" class="mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-200">
        <div class="flex items-center gap-3">
          <span class="inline-block w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
          <p class="text-sm font-medium text-indigo-700">{{ terminalMsg }}</p>
        </div>
        <p class="text-xs text-indigo-500 mt-2">Pide al cliente que pague en el terminal. La venta se cerrará sola al confirmarse.</p>
        <button @click="cancelarTerminal" class="mt-3 text-xs font-semibold text-red-600 hover:text-red-700">Cancelar cobro</button>
      </div>

      <!-- Botones -->
      <div class="flex gap-3 mt-6">
        <button @click="$emit('close')"
          class="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
          Cancelar
        </button>
        <button @click="processPayment" :disabled="!canPay || processing || waitingTerminal"
          class="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
          <span v-if="processing">Procesando...</span>
          <span v-else>Confirmar pago{{ propina > 0 ? ` ($${formatMoney(totalConPropina)})` : '' }}</span>
        </button>
      </div>

    </div>

    <!-- ══ TICKET PARA PDF / IMPRESIÓN (OCULTO) ══ -->
    <div id="ticket-printable" class="hidden">
      <div style="width: 80mm; padding: 2mm; font-family: 'Courier New', Courier, monospace; color: #000; background: #fff;">
        
        <!-- ENCABEZADO -->
        <div style="text-align: center; margin-bottom: 4mm;">
          <h2 style="margin: 0; font-size: 16px; font-weight: bold; text-transform: uppercase;">{{ nombreSucursal }}</h2>
          <p v-if="datosSucursal.direccion && datosSucursal.direccion.trim().length > 2" style="margin: 2px 0; font-size: 10px; line-height: 1.2;">{{ datosSucursal.direccion }}</p>
          <p v-if="datosSucursal.telefono" style="margin: 2px 0; font-size: 10px;">TEL: {{ datosSucursal.telefono }}</p>
          <div style="border-bottom: 1px dashed #000; margin-top: 3mm; margin-bottom: 3mm;"></div>
          <p style="margin: 0; font-size: 12px; font-weight: bold;">Comprobante de Pago</p>
          <p style="margin: 2px 0; font-size: 10px;">{{ new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'medium' }) }}</p>
        </div>

        <!-- INFO ORDEN -->
        <div style="font-size: 11px; margin-bottom: 3mm;">
          <div style="display: flex; justify-content: space-between;">
            <span><strong>Mesa:</strong> {{ ticket.mesa || 'N/A' }}</span>
            <span><strong>Folio:</strong> {{ uniqueIdentifier }}</span>
          </div>
          <p style="margin: 2px 0;"><strong>Atendió:</strong> {{ userName }}</p>
          <p style="margin: 2px 0;"><strong>Pago:</strong> {{ paymentMethod.toUpperCase() }}</p>
        </div>

        <!-- TABLA DE PRODUCTOS -->
        <table style="width: 100%; font-size: 11px; border-collapse: collapse; margin-bottom: 4mm;">
          <thead>
            <tr style="border-top: 1px dashed #000; border-bottom: 1px dashed #000;">
              <th style="text-align: left; padding: 1.5mm 0; width: 10%;">CANT</th>
              <th style="text-align: left; padding: 1.5mm 0; width: 60%;">DESCRIPCION</th>
              <th style="text-align: right; padding: 1.5mm 0; width: 30%;">IMPORTE</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in normalizedItems" :key="item.id">
              <td style="padding: 1mm 0; vertical-align: top;">{{ item.cantidad }}</td>
              <td style="padding: 1mm 0; text-transform: uppercase;">{{ item.nombre }}</td>
              <td style="text-align: right; padding: 1mm 0; vertical-align: top;">${{ formatMoney(item.subtotal) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- TOTALES -->
        <div style="font-size: 11px; text-align: right;">
          <div style="display: flex; justify-content: flex-end; margin-bottom: 1mm;">
            <span style="width: 30%;">SUBTOTAL:</span>
            <span style="width: 30%; font-weight: bold;">${{ formatMoney(total) }}</span>
          </div>
          
          <div style="display: flex; justify-content: flex-end; font-size: 14px; margin-top: 2mm; border-top: 1.5px solid #000; padding-top: 2mm;">
            <span style="width: 30%; font-weight: bold;">TOTAL:</span>
            <span style="width: 30%; font-weight: bold;">${{ formatMoney(total) }}</span>
          </div>

          <div v-if="propina > 0" style="display: flex; justify-content: flex-end; margin-top: 2mm; color: #444;">
            <span style="width: 30%;">PROPINA:</span>
            <span style="width: 30%;">${{ formatMoney(propina) }}</span>
          </div>
        </div>

        <!-- PIE DE PAGINA -->
        <div style="margin-top: 8mm; text-align: center; border-top: 1px dashed #000; padding-top: 4mm;">
          <p style="margin: 4px 0; font-size: 9px; font-weight: bold;">ESTE NO ES UN COMPROBANTE FISCAL</p>
          <p style="margin: 2px 0; font-size: 9px; font-weight: bold;">PROPINA NO INCLUIDA EN EL TOTAL</p>
          
          <div style="margin-top: 5mm;">
            <p style="margin: 0; font-size: 9px; color: #444;">Código de Rastreo:</p>
            <p style="margin: 2px 0; font-size: 11px; font-weight: bold; letter-spacing: 1px;">* {{ uniqueIdentifier }} *</p>
          </div>
          
          <p style="margin-top: 5mm; font-size: 11px; font-style: italic;">¡Gracias por su visita!</p>
          <p style="margin-top: 2mm; font-size: 8px; color: #666;">*** EASY ORDER SYSTEM ***</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { sessionGet, sessionSet, sessionRemove } from '@/utils/session'
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { API_URL } from '@/config/api'
import { apiClient } from '@/utils/apiClient'

const props = defineProps({
  ticket: { type: Object, required: true },
})
const emit = defineEmits(['close', 'payment-processed', 'terminal-confirmed'])

const paymentMethod  = ref('efectivo')
const amountReceived = ref(0)
const propina        = ref(0)
const folio          = ref('')
const errorMsg       = ref('')
const fieldError     = ref('')
const processing     = ref(false)
const waitingTerminal = ref(false)
const terminalMsg    = ref('')
const terminalOrderId = ref(null)
let pollTimer = null
const terminales          = ref([])
const terminalId          = ref(null)
const cargandoTerminales  = ref(false)
const terminalError       = ref('')
const nombreSucursal = ref('RESTAURANTE E-ORDER')
const detectedRestId = ref(null)
const datosSucursal  = ref({ direccion: '', telefono: '', propietario_id: '' })

// --- Datos del Usuario ---
const userRaw = sessionGet('user') ?? '{}'
const user = JSON.parse(userRaw)
const userName = computed(() => user.name || 'Personal')

const esMesero = computed(() => {
  const roles = user.roles || []
  return roles.some(r => {
    if (typeof r === 'string') return r.toUpperCase() === 'MESERO'
    return r.id === 3 || r.id === '3' || r.nombre?.toUpperCase() === 'MESERO'
  })
})

// BUSCADOR DE ID INFALIBLE
const restauranteId = computed(() => {
  // 1. Prioridad: Lo que detectamos por API o por productos
  if (detectedRestId.value) return detectedRestId.value
  
  // 2. Revisar en la orden directamente
  const rid = props.ticket.restaurante_id || props.ticket.id_restaurante
  if (rid && rid !== 'undefined' && rid !== 'null') return rid

  // 3. Revisar si algún producto trae el restaurante_id
  const items = props.ticket.detalles || props.ticket.items || []
  const itemWithId = items.find(i => i.restaurante_id || (i.producto && i.producto.restaurante_id))
  if (itemWithId) {
    const id = itemWithId.restaurante_id || itemWithId.producto.restaurante_id
    if (id) return id
  }

  // 4. ÚLTIMO RECURSO: Usar el restaurante_activo del usuario logueado
  if (user.restaurante_activo) return user.restaurante_activo

  return ''
})

// Identificador Único: propietario_id + restaurante_id + orden_id (como pidió el usuario)
const uniqueIdentifier = computed(() => {
  const pId = datosSucursal.value.propietario_id || user.propietario_id || ''
  const rId = restauranteId.value || ''
  return `${pId}${rId}${props.ticket.id}`
})

// --- SINCRONIZACIÓN PROFUNDA ---
const syncIdentity = async () => {
  try {
    // Intentar obtener la orden completa para asegurar el restaurante_id
    const dataO = await apiClient.get(`/ordenes/${props.ticket.id}`)
    
    if (dataO.success || dataO.data) {
      const realOrder = dataO.data || dataO
      if (realOrder.restaurante_id) detectedRestId.value = realOrder.restaurante_id
    }

    await nextTick()

    const rid = restauranteId.value
    if (rid) {
      const dataR = await apiClient.get(`/restaurantes/${rid}`)
      if (dataR.success || dataR.data) {
        const r = dataR.data || dataR
        nombreSucursal.value = (r.nombre || 'RESTAURANTE').toUpperCase()
        
        // Formatear dirección sin comas sueltas
        const d = r.direccion || {}
        const partes = [d.calle, d.ciudad, d.estado].filter(p => p && p.trim().length > 0)
        
        datosSucursal.value = {
          direccion: partes.join(', '),
          telefono: r.telefono || '',
          propietario_id: r.propietario_id || ''
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
  { value: 'terminal',      label: 'Terminal',      icon: '📟' },
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
  if (paymentMethod.value === 'terminal') {
    if (!cargandoTerminales.value && terminales.value.length === 0) return false
    if (terminales.value.length > 0 && !terminalId.value) return false
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

  // Cobro con terminal Mercado Pago Point: lo confirma el webhook del backend.
  if (paymentMethod.value === 'terminal') {
    cobrarConTerminal()
    return
  }

  errorMsg.value = ''
  
  if (paymentMethod.value === 'efectivo' && amountReceived.value < totalConPropina.value) {
    errorMsg.value = `Monto insuficiente`
    return
  }

  processing.value = true
  
  // ASEGURAR IDENTIDAD JUSTO ANTES DE IMPRIMIR
  await syncIdentity()
  await nextTick()

  if (!esMesero.value) {
    imprimirTicket()
  }

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

const stopPolling = () => {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
}

const cobrarConTerminal = async () => {
  errorMsg.value = ''

  if (terminales.value.length > 0 && !terminalId.value) {
    errorMsg.value = 'Selecciona una terminal.'
    return
  }

  waitingTerminal.value = true
  terminalMsg.value = 'Enviando cobro al terminal…'
  terminalOrderId.value = null

  try {
    const res = await apiClient.post('/caja/mercadopago/point/crear', {
      orden_id: props.ticket.id,
      propina: Number(propina.value || 0),
      terminal_id: terminalId.value || undefined,
    })

    if (!res?.success || !res?.data?.order_id) {
      waitingTerminal.value = false
      errorMsg.value = res?.message || 'No se pudo enviar el cobro al terminal.'
      return
    }

    terminalOrderId.value = res.data.order_id
    terminalMsg.value = `Esperando pago en el terminal por $${formatMoney(res.data.amount)}…`
    startPolling()
  } catch (e) {
    waitingTerminal.value = false
    errorMsg.value = e?.message || 'Error al conectar con el terminal.'
  }
}

const startPolling = () => {
  stopPolling()
  let intentos = 0
  const maxIntentos = 120 // ~5 min a 2.5s

  pollTimer = setInterval(async () => {
    intentos++
    if (intentos > maxIntentos) {
      stopPolling()
      waitingTerminal.value = false
      errorMsg.value = 'El cobro expiró sin confirmarse. Intenta de nuevo.'
      return
    }

    try {
      const res = await apiClient.get(`/caja/mercadopago/point/orden/${terminalOrderId.value}`)
      const d = res?.data
      if (!d) return

      if (d.cerrada || d.orden_estado === 'CERRADA') {
        stopPolling()
        waitingTerminal.value = false
        emit('terminal-confirmed', {
          id: props.ticket.id,
          metodo_pago: 'mercadopago',
          propina: Number(propina.value || 0),
          total: totalConPropina.value,
          payment_id: d.payment_id || null,
          folio: d.payment_id || null,
        })
        return
      }

      if (['canceled', 'expired', 'failed'].includes(d.status)) {
        stopPolling()
        waitingTerminal.value = false
        errorMsg.value = 'El cobro no se completó (cancelado o expirado).'
      }
    } catch (e) {
      // fallo de red transitorio: seguimos intentando
    }
  }, 2500)
}

const cancelarTerminal = async () => {
  stopPolling()
  try {
    if (terminalOrderId.value) {
      await apiClient.post(`/caja/mercadopago/point/orden/${terminalOrderId.value}/cancelar`, {})
    }
  } catch (e) { /* ignorar */ }
  waitingTerminal.value = false
  terminalOrderId.value = null
  terminalMsg.value = ''
}

const cargarTerminales = async () => {
  if (terminales.value.length) return
  cargandoTerminales.value = true
  terminalError.value = ''
  try {
    const res = await apiClient.get('/caja/mercadopago/oauth/estado')
    const lista = res?.data?.terminales || []
    terminales.value = lista.filter(t => t.is_active !== false)
    if (terminales.value.length && !terminalId.value) {
      terminalId.value = terminales.value[0].terminal_id
    }
  } catch (e) {
    terminalError.value = 'No se pudieron cargar las terminales.'
  } finally {
    cargandoTerminales.value = false
  }
}

watch(paymentMethod, (m) => {
  if (m === 'terminal') cargarTerminales()
})

onUnmounted(stopPolling)

onMounted(() => {
  syncIdentity()
})
</script>