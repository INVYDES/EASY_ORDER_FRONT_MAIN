<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
    @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">

      <!-- Encabezado -->
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Cobrar Ticket</h2>
        <button @click="$emit('close')" class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 text-xl leading-none">✕</button>
      </div>

      <!-- Resumen del ticket -->
      <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 mb-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Mesa</p>
            <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ ticket.mesa || 'N/A' }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Subtotal</p>
            <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">${{ formatMoney(total) }}</p>
          </div>
        </div>
        <!-- Desglose si hay propina -->
        <div v-if="propina > 0" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1 text-sm">
          <div class="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Subtotal</span>
            <span>${{ formatMoney(total) }}</span>
          </div>
          <div class="flex justify-between text-amber-600">
            <span>Propina</span>
            <span>+${{ formatMoney(propina) }}</span>
          </div>
          <div class="flex justify-between font-bold text-gray-800 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700 pt-1">
            <span>Total a cobrar</span>
            <span>${{ formatMoney(totalConPropina) }}</span>
          </div>
        </div>
      </div>

      <div class="space-y-4">

        <!-- Método de pago -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Método de pago</label>
          <div class="grid grid-cols-3 gap-2">
            <button v-for="m in metodos" :key="m.value"
              @click="paymentMethod = m.value; amountReceived = 0"
              :class="['py-2.5 rounded-xl text-sm font-semibold border-2 transition flex flex-col items-center gap-1',
                paymentMethod === m.value
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600']">
              <span class="text-base">{{ m.icon }}</span>
              {{ m.label }}
            </button>
          </div>
        </div>

        <!-- Monto recibido (solo efectivo) -->
        <div v-if="paymentMethod === 'efectivo'">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto recibido</label>
          <div class="relative">
            <span class="absolute left-3 top-3 text-gray-400 dark:text-gray-500 text-sm font-medium">$</span>
            <input v-model.number="amountReceived" type="number" step="0.01"
              :min="totalConPropina" placeholder="0.00"
              class="w-full pl-7 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-900 dark:text-gray-200"
              :class="amountReceived > 0 && amountReceived < totalConPropina ? 'border-red-400' : ''" />
          </div>
          <p v-if="amountReceived > 0 && amountReceived < totalConPropina" class="text-xs text-red-500 mt-1">
            El monto es menor al total{{ propina > 0 ? ' (incluye propina)' : '' }}
          </p>
        </div>

        <!-- Folio/referencia (solo tarjeta y transferencia) -->
        <div v-if="paymentMethod !== 'efectivo'">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ paymentMethod === 'tarjeta' ? 'Referencia del Voucher' : 'Referencia / Folio' }}
            <span class="text-red-500">*</span>
            <span class="text-gray-400 dark:text-gray-500 font-normal text-xs ml-1">(obligatorio)</span>
          </label>
          <input v-model="folio" type="text"
            :placeholder="paymentMethod === 'tarjeta' ? 'Número de voucher o referencia' : 'Ej. REF123456'"
            :class="['w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-900 dark:text-gray-200',
              fieldError && paymentMethod === 'tarjeta' ? 'border-red-400' : 'border-gray-200 dark:border-gray-700']"
          />
          <p v-if="fieldError && paymentMethod === 'tarjeta'" class="text-xs text-red-500 mt-1">
            {{ fieldError }}
          </p>
          <p v-else-if="paymentMethod === 'tarjeta'" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Ingresa el número de referencia del voucher de la terminal bancaria
          </p>
        </div>

        <!-- Comisión por tarjeta -->
        <div v-if="paymentMethod === 'tarjeta'">
          <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium text-amber-800 dark:text-amber-300">Comisión por tarjeta</label>
              <div class="flex items-center gap-2">
                <input v-model.number="comisionTarjeta" type="number" step="0.1" min="0" max="100"
                  class="w-20 px-2 py-1 text-sm text-center border border-amber-200 dark:border-amber-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none" />
                <span class="text-sm font-bold text-amber-700 dark:text-amber-400">%</span>
              </div>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-amber-700 dark:text-amber-300">Comisión calculada</span>
              <span class="font-bold text-amber-800 dark:text-amber-200">-${{ formatMoney(comisionCalculada) }}</span>
            </div>
            <div class="flex justify-between text-sm font-bold border-t border-amber-200 dark:border-amber-700 pt-2">
              <span class="text-amber-800 dark:text-amber-200">Neto a depositar</span>
              <span class="text-emerald-700 dark:text-emerald-400">${{ formatMoney(netoDepositar) }}</span>
            </div>
          </div>
        </div>

        <!-- Propina -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Propina <span class="text-gray-400 dark:text-gray-500 font-normal">(opcional)</span>
          </label>
          <div class="relative">
            <span class="absolute left-3 top-3 text-gray-400 dark:text-gray-500 text-sm font-medium">$</span>
            <input v-model.number="propina" type="number" step="0.01" min="0" placeholder="0.00"
              class="w-full pl-7 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-900 dark:text-gray-200" />
          </div>
          <!-- Atajos rápidos de propina -->
          <div class="flex gap-2 mt-2">
            <button v-for="pct in [10, 15, 20]" :key="pct"
              @click="propina = Math.round(total * pct / 100 * 100) / 100"
              class="flex-1 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition">
              {{ pct }}%
            </button>
            <button @click="propina = 0" class="flex-1 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition">
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
      <div v-if="errorMsg" class="mt-4 p-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
        {{ errorMsg }}
      </div>

      <!-- Botones -->
      <div class="flex gap-3 mt-6">
        <button @click="$emit('close')"
          class="flex-1 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition">
          Cancelar
        </button>
        <button @click="processPayment" :disabled="!canPay || processing"
          class="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600">
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { API_URL } from '@/config/api'
import { apiClient } from '@/utils/apiClient'

const props = defineProps({
  ticket: { type: Object, required: true },
})
const emit = defineEmits(['close', 'payment-processed'])

const paymentMethod  = ref('efectivo')
const amountReceived = ref(0)
const propina        = ref(0)
const folio          = ref('')
const comisionTarjeta = ref(3.5)
const errorMsg       = ref('')
const fieldError     = ref('')
const processing     = ref(false)
const nombreSucursal = ref('RESTAURANTE E-ORDER')
const detectedRestId = ref(null)
const datosSucursal  = ref({ direccion: '', telefono: '', propietario_id: '' })

// --- Datos del Usuario ---
const userRaw = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}'
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
]

const total           = computed(() => Number(props.ticket.total || 0))
const totalConPropina = computed(() => total.value + Number(propina.value || 0))
const comisionCalculada = computed(() => (totalConPropina.value * comisionTarjeta.value) / 100)
const netoDepositar     = computed(() => totalConPropina.value - comisionCalculada.value)

const normalizedItems = computed(() => {
  const items = props.ticket.detalles || props.ticket.items || []
  return items.map(item => {
    const cantidad = item.cantidad ?? item.quantity ?? 0
    const precio = item.precio ?? item.precio_unitario ?? item.price ?? 0
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
    comision_pct: paymentMethod.value === 'tarjeta' ? comisionTarjeta.value : 0,
    comision_monto: paymentMethod.value === 'tarjeta' ? comisionCalculada.value : 0,
    neto_depositar: paymentMethod.value === 'tarjeta' ? netoDepositar.value : totalConPropina.value,
  })
  
  processing.value = false
}

onMounted(() => {
  syncIdentity()
})
</script>