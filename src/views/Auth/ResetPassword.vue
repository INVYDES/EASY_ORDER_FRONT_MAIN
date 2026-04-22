<template>
  <div class="min-h-screen flex">

    <!-- IZQUIERDA -->
    <div class="flex items-center justify-center w-full lg:w-1/2 bg-gray-50 px-6">
      <div class="w-full max-w-md">

        <h1 class="text-3xl font-semibold text-gray-800 mb-2">
          Nueva contraseña
        </h1>
        <p class="text-gray-500 mb-8 text-sm">
          Ingresa y confirma tu nueva contraseña.
        </p>

        <!-- Token inválido / faltante -->
        <div v-if="!token" class="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl mb-6">
          <p class="font-semibold">Enlace inválido o expirado</p>
          <p class="mt-1">Solicita un nuevo enlace desde la pantalla de inicio de sesión.</p>
          <router-link to="/" class="inline-block mt-3 text-indigo-600 font-medium hover:underline">
            Volver al inicio
          </router-link>
        </div>

        <!-- ÉXITO -->
        <div v-else-if="successMessage" class="p-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl mb-6">
          <p class="font-semibold mb-1">✅ Contraseña restablecida</p>
          <p>{{ successMessage }}</p>
          <router-link to="/" class="inline-block mt-3 text-indigo-600 font-medium hover:underline">
            Iniciar sesión
          </router-link>
        </div>

        <!-- ERROR -->
        <div v-if="errorMessage" class="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
          {{ errorMessage }}
        </div>

        <!-- FORMULARIO -->
        <form
          v-if="token && !successMessage"
          @submit.prevent="handleSubmit"
          class="space-y-5"
        >

          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="El correo de tu cuenta"
              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">
              Nueva contraseña
            </label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="8"
                placeholder="Mínimo 8 caracteres"
                autocomplete="new-password"
                class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none pr-20"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-3 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                {{ showPassword ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
          </div>

          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">
              Confirmar contraseña
            </label>
            <input
              v-model="passwordConfirm"
              type="password"
              required
              placeholder="Repite la nueva contraseña"
              autocomplete="new-password"
              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              :class="passwordMismatch ? 'border-red-400 focus:ring-red-400' : ''"
            />
            <p v-if="passwordMismatch" class="mt-1 text-xs text-red-500">
              Las contraseñas no coinciden
            </p>
          </div>

          <button
            type="submit"
            :disabled="loading || passwordMismatch"
            class="w-full py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 font-medium"
          >
            {{ loading ? 'Restableciendo...' : 'Restablecer contraseña' }}
          </button>

        </form>

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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_URL } from '@/config/api'

const route  = useRoute()
const router = useRouter()

const token           = ref('')
const email           = ref('')
const password        = ref('')
const passwordConfirm = ref('')
const showPassword    = ref(false)
const loading         = ref(false)
const successMessage  = ref('')
const errorMessage    = ref('')

const passwordMismatch = computed(() =>
  passwordConfirm.value.length > 0 && password.value !== passwordConfirm.value
)

onMounted(() => {
  // El token y email vienen como query params del enlace del correo
  // Ej: /reset-password?token=abc123&email=user@mail.com
  token.value = (route.query.token as string) || ''
  email.value = (route.query.email as string) || ''
})

const handleSubmit = async () => {
  if (passwordMismatch.value) return

  loading.value      = true
  errorMessage.value = ''

  try {
    const res  = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        token:                 token.value,
        email:                 email.value,
        password:              password.value,
        password_confirmation: passwordConfirm.value,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al restablecer la contraseña')
    successMessage.value = data.message || 'Tu contraseña fue restablecida. Ya puedes iniciar sesión.'
    setTimeout(() => router.push('/'), 3000)
  } catch (error: any) {
    errorMessage.value = error.message || 'No pudimos restablecer tu contraseña. El enlace puede haber expirado.'
  } finally {
    loading.value = false
  }
}
</script>