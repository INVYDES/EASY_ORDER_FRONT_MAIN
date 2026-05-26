<template>
  <div class="min-h-screen flex">
    
    <div class="flex items-center justify-center w-full lg:w-1/2 bg-gray-50 px-6 py-12">
      <div class="w-full max-w-md">

        <h1 class="text-3xl font-bold text-gray-900 mb-2 text-center">
          Easy Order
        </h1>
        <p class="text-gray-500 mb-8 text-center text-sm">
          Ingresa tus credenciales para acceder al sistema
        </p>

        <!-- Error -->
        <div v-if="errorMessage" class="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-shake">
          <span class="font-medium">{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">

          <!-- Identificador Único -->
          <div>
            <label class="block mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">Usuario, Correo o Código</label>
            <div class="relative">
              <input
                v-model="loginIdentifier"
                type="text"
                required
                placeholder="ej: nombre@mail.com o 3-1-2"
                class="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-all placeholder-gray-300 shadow-sm text-sm"
              />
            </div>
            <p class="text-[10px] text-gray-400 mt-2 px-1">
              Empleados: usen el código proporcionado por su sucursal.
            </p>
          </div>

          <!-- Contraseña -->
          <div>
            <div class="flex justify-between mb-2">
              <label class="text-sm font-semibold text-gray-700 uppercase tracking-wider">Contraseña</label>
              <router-link
                to="/recuperar-contrasena"
                class="text-xs text-indigo-600 font-bold hover:text-indigo-800 transition"
              >
                ¿Olvidaste tu contraseña?
              </router-link>
            </div>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="••••••••"
                class="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-all shadow-sm text-sm"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-3 px-2 py-1 text-[10px] font-bold text-gray-400 hover:text-indigo-600 transition uppercase tracking-widest"
              >
                {{ showPassword ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
          </div>

          <!-- Mantener sesión -->
          <div class="flex items-center justify-between py-1">
            <label class="flex items-center gap-2 cursor-pointer select-none group">
              <input type="checkbox" v-model="keepLoggedIn" class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shadow-sm" />
              <span class="text-xs text-gray-500 group-hover:text-gray-700 transition">Recordarme en este equipo</span>
            </label>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-4 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 font-bold shadow-md flex items-center justify-center gap-2"
          >
            <span v-if="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ loading ? 'VERIFICANDO...' : 'ENTRAR AL SISTEMA' }}
          </button>
        </form>

        <div class="mt-12 pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
          <p class="text-sm text-gray-500">
            ¿Eres dueño y no tienes cuenta?
            <router-link to="/registro/dueno" class="text-indigo-600 font-bold hover:underline ml-1">Regístrate aquí</router-link>
          </p>
          <div class="flex gap-4">
            <router-link to="/registro/cliente" class="text-xs text-gray-400 hover:text-indigo-600 transition font-medium italic">Acceso Clientes</router-link>
          </div>
        </div>

      </div>
    </div>

    <!-- Panel derecho -->
    <div class="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden">
      <img 
        src="@/assets/imaguenes/fondo_login.jpg" 
        class="absolute inset-0 w-full h-full object-cover" 
        alt="Login Background"
      />
    </div>

  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiClient } from '@/utils/apiClient'

const router = useRouter()

const loginIdentifier = ref('')
const password        = ref('')
const showPassword    = ref(false)
const keepLoggedIn    = ref(false)
const loading         = ref(false)
const errorMessage    = ref('')

const handleSubmit = async () => {
  if (loading.value) return
  loading.value      = true
  errorMessage.value = ''

  try {
    const isEmployeeLogin = /^\d+-\d+-\d+$/.test(loginIdentifier.value.trim())
    const endpoint = isEmployeeLogin ? '/empleado/login' : '/login'

    const data = await apiClient.post(endpoint, {
      login:    loginIdentifier.value.trim(),
      password: password.value
    })

    console.log('✅ data completa:', JSON.stringify(data))
    console.log('✅ data.data:', data?.data)
    console.log('✅ token:', data?.data?.token)
    console.log('✅ user:', data?.data?.user)
    console.log('✅ Condición if:', !!(data?.data && data?.data?.token && data?.data?.user))

    if (data?.data && data?.data?.token && data?.data?.user) {
      const storage = keepLoggedIn.value ? localStorage : sessionStorage

      storage.setItem('token', data.data.token)
      storage.setItem('user',  JSON.stringify(data.data.user))
      storage.setItem('restaurante_activo', String(data.data.user.restaurante_activo ?? ''))
      storage.setItem('restaurante_id',     String(data.data.user.restaurante_activo ?? ''))

      console.log('✅ Storage guardado:', {
        token: data.data.token,
        user:  data.data.user,
        restaurante_activo: data.data.user.restaurante_activo
      })

      const user = data.data.user

      const rol: string = (Array.isArray(user.roles)
        ? (typeof user.roles[0] === 'string' ? user.roles[0] : user.roles[0]?.nombre)
        : user.rol) || ''

      console.log('✅ rol detectado:', rol)

      const routesMap: Record<string, string> = {
        PROPIETARIO: '/panel/Gestion',
        ADMIN:       '/panel/Gestion',
        MESERO:      '/panel/mesero',
        COCINA:      '/panel/cocina',
        CAJA:        '/panel/caja',
        BARRA:       '/panel/barra',
        CLIENTE:     '/panel/cliente',
        MENU:        '/menu',
      }

      const destination = routesMap[rol.toUpperCase()] ?? '/panel/Gestion'
      console.log('✅ Redirigiendo a:', destination)

      await router.push(destination)

    } else {
      console.warn('⚠️ Condición if falló:', data)
      errorMessage.value = data?.message || 'Error al iniciar sesión'
    }

  } catch (err: any) {
    console.error('❌ Error tipo:', err.constructor?.name)
    console.error('❌ Error mensaje:', err.message)
    console.error('❌ Error stack:', err.stack)
    
    if (err.message === 'Too Many Requests') {
      errorMessage.value = 'Demasiados intentos. Por favor espera.'
    } else if (err.response?.data?.errors) {
      errorMessage.value = Object.values(err.response.data.errors).flat().join(', ')
    } else {
      errorMessage.value = err.response?.data?.message || err.message || 'Error al iniciar sesión'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');

.font-outfit { font-family: 'Outfit', sans-serif; }

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
.animate-shake { animation: shake 0.3s ease-in-out; }
</style>