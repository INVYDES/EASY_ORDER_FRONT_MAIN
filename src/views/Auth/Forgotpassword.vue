<template>
  <div class="min-h-screen flex">

    <!-- IZQUIERDA -->
    <div class="flex items-center justify-center w-full lg:w-1/2 bg-gray-50 px-6">
      <div class="w-full max-w-md">

        <!-- Volver -->
        <router-link
          to="/"
          class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition mb-8"
        >
          ← Volver al inicio de sesión
        </router-link>

        <h1 class="text-3xl font-semibold text-gray-800 mb-2">
          Recuperar contraseña
        </h1>
        <p class="text-gray-500 mb-8 text-sm">
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <!-- ÉXITO -->
        <div v-if="successMessage" class="mb-6 p-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl">
          <p class="font-semibold mb-1">✅ Correo enviado</p>
          <p>{{ successMessage }}</p>
        </div>

        <!-- ERROR -->
        <div v-if="errorMessage" class="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
          {{ errorMessage }}
        </div>

        <form v-if="!successMessage" @submit.prevent="handleSubmit" class="space-y-5">

          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="info@gmail.com"
              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 font-medium"
          >
            {{ loading ? 'Enviando...' : 'Enviar enlace de recuperación' }}
          </button>

        </form>

        <!-- Si ya se envió, mostrar botón para reenviar -->
        <div v-if="successMessage" class="mt-4">
          <button
            @click="reenviar"
            :disabled="loading || reenviarCooldown > 0"
            class="w-full py-3 text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition disabled:opacity-50 font-medium text-sm"
          >
            {{ reenviarCooldown > 0 ? `Reenviar en ${reenviarCooldown}s` : 'Reenviar correo' }}
          </button>
        </div>

      </div>
    </div>

    <!-- DERECHA -->
    <div class="hidden lg:flex w-1/2 bg-indigo-900 relative items-center justify-center">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:40px_40px]"></div>
      <div class="relative z-10 text-center text-white px-10">
        <h2 class="text-4xl font-bold mb-4">Easy Order</h2>
        <p class="text-indigo-200">Sistema de gestión para restaurantes</p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { API_URL } from '@/config/api'

const email          = ref('')
const loading        = ref(false)
const successMessage = ref('')
const errorMessage   = ref('')
const reenviarCooldown = ref(0)

let cooldownInterval: ReturnType<typeof setInterval> | null = null

const startCooldown = () => {
  reenviarCooldown.value = 60
  cooldownInterval = setInterval(() => {
    reenviarCooldown.value--
    if (reenviarCooldown.value <= 0) {
      clearInterval(cooldownInterval!)
    }
  }, 1000)
}

const sendRequest = async () => {
  loading.value      = true
  errorMessage.value = ''
  try {
    const res  = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: email.value }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al enviar el correo')
    successMessage.value = data.message || `Hemos enviado un enlace a ${email.value}. Revisa tu bandeja de entrada.`
    startCooldown()
  } catch (error: any) {
    errorMessage.value = error.message || 'No pudimos enviar el correo. Inténtalo de nuevo.'
  } finally {
    loading.value = false
  }
}

const handleSubmit = sendRequest

const reenviar = () => {
  successMessage.value = ''
  sendRequest()
}

onUnmounted(() => {
  if (cooldownInterval) clearInterval(cooldownInterval)
})
</script>