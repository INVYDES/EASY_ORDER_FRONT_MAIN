<template>
  <div class="min-h-screen flex">
    
    <div class="flex items-center justify-center w-full lg:w-1/2 bg-gray-50 px-6 py-12">
      <div class="w-full max-w-md">

        <div class="flex mb-8 bg-gray-200 p-1 rounded-xl">
          <button 
            @click="activeTab = 'admin'"
            :class="[activeTab === 'admin' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700']"
            class="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
          >
            Administración
          </button>
          <button 
            @click="activeTab = 'client'"
            :class="[activeTab === 'client' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700']"
            class="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
          >
            Cliente
          </button>
        </div>

        <h1 class="text-3xl font-semibold text-gray-800 mb-2">
          {{ activeTab === 'admin' ? 'Iniciar sesión' : 'Acceso Clientes' }}
        </h1>

        <p class="text-gray-500 mb-6">
          {{ activeTab === 'admin' ? 'Accede a tu panel de administración' : 'Pide comida de tus lugares favoritos' }}
        </p>

        <div
          v-if="errorMessage"
          class="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg"
        >
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              v-model="email"
              type="email"
              required
              autocomplete="username"
              placeholder="info@gmail.com"
              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <div class="flex justify-between mb-1">
              <label class="text-sm font-medium text-gray-700">Contraseña</label>
              <router-link to="/recuperar-contrasena" class="text-sm text-indigo-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </router-link>
            </div>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="Introduce tu contraseña"
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

          <div class="flex items-center text-sm">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" v-model="keepLoggedIn" class="accent-indigo-600" />
              Mantenme conectado
            </label>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 font-medium"
          >
            {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-gray-500">
          ¿No tienes cuenta?
          <router-link
            :to="activeTab === 'admin' ? '/registro/dueno' : '/registro/cliente'"
            class="text-indigo-600 font-medium hover:underline"
          >
            Crear cuenta
          </router-link>
        </p>

      </div>
    </div>

    <div class="hidden lg:flex w-1/2 bg-indigo-900 relative items-center justify-center">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:40px_40px]"></div>
      <div class="relative z-10 text-center text-white px-10">
        <h2 class="text-4xl font-bold mb-4">Easy Order</h2>
        <p class="text-indigo-200">
          {{ activeTab === 'admin' ? 'Sistema de gestión para restaurantes' : 'La mejor comida a un click de distancia' }}
        </p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { API_URL } from '../../config/api'

const router = useRouter()

const activeTab = ref<'admin' | 'client'>('admin')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const keepLoggedIn = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const redirectByRole = (rol: string) => {
  const routes: Record<string, string> = {
    ADMIN:       '/panel/Gestion',
    PROPIETARIO: '/panel/Gestion',
    MESERO:      '/panel/mesero',
    COCINA:      '/panel/cocina',
    CAJA:        '/panel/caja',
    BARRA:       '/panel/barra',
    CLIENTE:     '/panel/cliente',
    MENU:        '/menu',
  }
  router.replace(routes[rol] ?? '/panel/Gestion')
}

const handleSubmit = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        login: email.value,
        password: password.value,
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Credenciales incorrectas')

    const { token, user } = data

    // Verificar que los roles llegaron
    if (!user?.roles?.length) {
      throw new Error('No se pudo obtener el rol del usuario')
    }

    // Guardar sesión
    const storage = keepLoggedIn.value ? localStorage : sessionStorage
    storage.setItem('token', token)
    storage.setItem('user', JSON.stringify({
      id:    user.id,
      name:  user.name,
      email: user.email,
      roles: user.roles,  // ✅ roles completos del backend
    }))

    if (user.restaurante_activo) {
      storage.setItem('restaurante_activo', JSON.stringify(user.restaurante_activo))
    }

    await nextTick()
    const rol = user.roles[0]?.nombre
    redirectByRole(rol)

  } catch (error: any) {
    errorMessage.value = error.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>