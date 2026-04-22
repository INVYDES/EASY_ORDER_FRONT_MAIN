<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl p-6 w-96 shadow-xl">

      <h2 class="text-lg font-semibold mb-1 text-center">Abrir Caja</h2>
      <p class="text-sm text-gray-500 mb-5 text-center">
        Ingresa el monto inicial para comenzar el turno
      </p>

      <!-- Error general -->
      <div v-if="errorMessage" class="mb-4 p-3 text-sm rounded-lg"
        :class="cajaYaAbierta ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-red-50 border border-red-200 text-red-700'"
      >
        <p class="font-semibold mb-0.5">
          {{ cajaYaAbierta ? '⚠️ Caja ya abierta' : '❌ Error' }}
        </p>
        <p>{{ errorMessage }}</p>
      </div>

      <!-- Si la caja ya está abierta, mostrar botón para continuar -->
      <template v-if="cajaYaAbierta">
        <button
          @click="$emit('already-open')"
          class="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          Continuar con la caja actual
        </button>
      </template>

      <!-- Formulario normal -->
      <template v-else>
        <input
          v-model.number="initialAmount"
          type="number"
          step="0.01"
          min="0"
          placeholder="Monto inicial"
          class="w-full px-3 py-2.5 border rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          :class="{ 'border-red-400': fieldError }"
          autofocus
        />
        <p v-if="fieldError" class="text-xs text-red-500 mb-3">{{ fieldError }}</p>

        <textarea
          v-model="observations"
          placeholder="Observaciones (opcional)"
          rows="2"
          class="w-full px-3 py-2 border rounded-lg mb-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        ></textarea>

        <div class="flex gap-2">
          <button
            @click="$emit('close')"
            class="flex-1 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm font-medium text-gray-700"
          >
            Cancelar
          </button>
          <button
            @click="openCaja"
            :disabled="!isValid || loading"
            class="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm font-medium"
          >
            {{ loading ? 'Abriendo...' : 'Abrir Caja' }}
          </button>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { API_URL } from '@/config/api'

const emit = defineEmits(['close', 'open', 'already-open'])

const initialAmount = ref(null)
const observations  = ref('')
const errorMessage  = ref('')
const fieldError    = ref('')
const loading       = ref(false)
const cajaYaAbierta = ref(false)

const isValid = computed(() =>
  initialAmount.value !== null &&
  initialAmount.value !== '' &&
  Number(initialAmount.value) >= 0
)

const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

const openCaja = async () => {
  fieldError.value    = ''
  errorMessage.value  = ''
  cajaYaAbierta.value = false

  if (!isValid.value) {
    fieldError.value = 'Ingresa un monto inicial válido'
    return
  }

  loading.value = true
  try {
    const res  = await fetch(`${API_URL}/caja/abrir`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        monto_inicial: Number(initialAmount.value),
        observaciones: observations.value,
      }),
    })
    const data = await res.json()

    if (res.ok && data.success) {
      // Éxito: notificar al padre con el monto
      emit('open', Number(initialAmount.value))
      emit('close')
    } else {
      // Detectar si ya hay una caja abierta (el backend manda este mensaje)
      const msg = data.message || ''
      const yaAbierta = msg.toLowerCase().includes('ya hay') ||
                        msg.toLowerCase().includes('ya existe') ||
                        msg.toLowerCase().includes('already') ||
                        res.status === 409

      if (yaAbierta) {
        cajaYaAbierta.value = true
        errorMessage.value  = msg || 'Ya hay una caja abierta para hoy.'
      } else {
        errorMessage.value = msg || 'Error al abrir caja'
      }
    }
  } catch (e) {
    console.error('Error OpenCaja:', e)
    errorMessage.value = 'Error al conectar con el servidor'
  } finally {
    loading.value = false
  }
}
</script>