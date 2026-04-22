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
        <button @click="processPayment" :disabled="!canPay"
          class="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
          Confirmar pago{{ propina > 0 ? ` ($${formatMoney(totalConPropina)})` : '' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

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

const metodos = [
  { value: 'efectivo',      label: 'Efectivo',      icon: '💵' },
  { value: 'tarjeta',       label: 'Tarjeta',       icon: '💳' },
  { value: 'transferencia', label: 'Transferencia', icon: '📲' },
]

const total           = computed(() => Number(props.ticket.total || 0))
const totalConPropina = computed(() => total.value + Number(propina.value || 0))

// ✅ Cambio se calcula sobre totalConPropina, no sobre total
const cambio = computed(() => {
  if (paymentMethod.value !== 'efectivo') return 0
  return Math.max(0, amountReceived.value - totalConPropina.value)
})

// ✅ canPay también valida contra totalConPropina y requiere folio para tarjeta/transferencia
const canPay = computed(() => {
  // Validar monto recibido para efectivo
  if (paymentMethod.value === 'efectivo') {
    if (amountReceived.value < totalConPropina.value) return false
  }
  // Validar folio/referencia obligatorio para tarjeta y transferencia
  if (['tarjeta', 'transferencia'].includes(paymentMethod.value)) {
    if (!folio.value || folio.value.trim() === '') return false
  }
  return true
})

const formatMoney = (v) => v === undefined || v === null ? '0.00' : Number(v).toFixed(2)

const processPayment = () => {
  errorMsg.value = ''
  fieldError.value = ''

  // Validar monto para efectivo
  if (paymentMethod.value === 'efectivo' && amountReceived.value < totalConPropina.value) {
    errorMsg.value = `El monto recibido ($${formatMoney(amountReceived.value)}) es menor al total con propina ($${formatMoney(totalConPropina.value)})`
    return
  }

  // Validar folio/referencia obligatorio para tarjeta y transferencia
  if (['tarjeta', 'transferencia'].includes(paymentMethod.value)) {
    if (!folio.value || folio.value.trim() === '') {
      fieldError.value = paymentMethod.value === 'tarjeta'
        ? 'El número de referencia del voucher es obligatorio'
        : 'La referencia de la transferencia es obligatoria'
      return
    }
  }

  emit('payment-processed', {
    metodo_pago:  paymentMethod.value,
    total:        total.value,
    propina:      Number(propina.value || 0),
    monto_pagado: paymentMethod.value === 'efectivo' ? amountReceived.value : totalConPropina.value,
    cambio:       cambio.value,
    folio:        folio.value.trim() || null,
  })
}
</script>