<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

      <!-- Encabezado -->
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-semibold text-gray-800">Cierre de Caja</h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 text-xl leading-none transition"
        >✕</button>
      </div>

      <!-- Resumen -->
      <div class="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Fondo de apertura</span>
          <span class="font-medium text-gray-800">${{ formatMoney(opening) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Ventas del día</span>
          <span class="font-medium text-gray-800">${{ formatMoney(sales) }}</span>
        </div>
        <div class="flex justify-between text-sm border-t border-gray-200 pt-2 mt-1">
          <span class="font-medium text-gray-700">Efectivo esperado</span>
          <span class="font-bold text-emerald-600">${{ formatMoney(expectedCash) }}</span>
        </div>
      </div>

      <!-- Efectivo real -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Efectivo real en caja
        </label>
        <div class="relative">
          <span class="absolute left-3 top-3 text-gray-400 text-sm font-medium">$</span>
          <input
            v-model.number="realCash"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            autofocus
            class="w-full pl-7 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
            :class="fieldError ? 'border-red-400' : 'border-gray-200'"
          />
        </div>
        <p v-if="fieldError" class="text-xs text-red-500 mt-1">{{ fieldError }}</p>
      </div>

      <!-- Diferencia en tiempo real -->
      <div
        v-if="realCash !== null && realCash !== ''"
        class="flex items-center justify-between px-4 py-2.5 rounded-xl mb-4 text-sm font-medium"
        :class="difference === 0
          ? 'bg-gray-100 text-gray-600'
          : difference > 0
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-red-50 text-red-600'"
      >
        <span>Diferencia</span>
        <span class="font-bold">
          {{ difference > 0 ? '+' : '' }}${{ formatMoney(difference) }}
          <span class="font-normal text-xs ml-1">
            {{ difference > 0 ? '(sobrante)' : difference < 0 ? '(faltante)' : '(exacto ✓)' }}
          </span>
        </span>
      </div>

      <!-- Observaciones -->
      <div class="mb-5">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Observaciones <span class="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          v-model="observations"
          placeholder="Notas del turno, incidencias..."
          rows="2"
          class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
        ></textarea>
      </div>

      <!-- Error general -->
      <div v-if="errorMessage" class="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
        {{ errorMessage }}
      </div>

      <!-- Botones -->
      <div class="flex gap-3">
        <button
          @click="$emit('close')"
          :disabled="loading"
          class="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          @click="closeCaja"
          :disabled="!isValid || loading"
          class="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition disabled:opacity-50"
        >
          {{ loading ? 'Cerrando...' : 'Confirmar cierre' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { API_URL } from '@/config/api'

const props = defineProps({
  opening: { type: Number, required: true },
  cash:    { type: Number, required: true },
  sales:   { type: Number, required: true },
})

const emit = defineEmits(['close', 'confirm'])

const realCash     = ref(null)
const observations = ref('')
const errorMessage = ref('')
const fieldError   = ref('')
const loading      = ref(false)

const expectedCash = computed(() => props.cash)

const difference = computed(() => {
  if (realCash.value === null || realCash.value === '') return 0
  return Number(realCash.value) - expectedCash.value
})

const isValid = computed(() =>
  realCash.value !== null &&
  realCash.value !== '' &&
  Number(realCash.value) >= 0
)

const formatMoney = (v) =>
  v === undefined || v === null ? '0.00' : Number(v).toFixed(2)

const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

const closeCaja = async () => {
  fieldError.value   = ''
  errorMessage.value = ''

  if (!isValid.value) {
    fieldError.value = 'Ingresa el efectivo real en caja'
    return
  }

  loading.value = true
  try {
    const res  = await fetch(`${API_URL}/caja/cerrar`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        efectivo_final: Number(realCash.value),
        observaciones:  observations.value,
      }),
    })
    const data = await res.json()

    if (res.ok && data.success) {
      emit('confirm', {
        expected:   expectedCash.value,
        real:       Number(realCash.value),
        difference: difference.value,
        opening:    props.opening,
        sales:      props.sales,
        timestamp:  new Date().toISOString(),
      })
      emit('close')
    } else {
      errorMessage.value = data.message || 'Error al cerrar caja'
    }
  } catch (e) {
    console.error('Error CloseCaja:', e)
    errorMessage.value = 'Error al conectar con el servidor'
  } finally {
    loading.value = false
  }
}
</script>