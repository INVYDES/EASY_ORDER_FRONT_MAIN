<template>
  <div class="min-h-screen flex">
    
    <div class="flex items-center justify-center w-full lg:w-1/2 bg-gray-50 px-6 py-12">
      <div class="w-full max-w-md">

        <!-- Tabs -->
        <div class="flex mb-8 bg-gray-200 p-1 rounded-xl">
          <button 
            @click="activeTab = 'admin'"
            :class="[activeTab === 'admin' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700']"
            class="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
          >
            Administración
          </button>
          <button 
            @click="activeTab = 'empleado'"
            :class="[activeTab === 'empleado' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700']"
            class="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
          >
            Empleado
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
          {{ titles[activeTab] }}
        </h1>
        <p class="text-gray-500 mb-6">
          {{ subtitles[activeTab] }}
        </p>

        <!-- Error -->
        <div v-if="errorMessage" class="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">

          <!-- ADMIN / CLIENTE: email -->
          <template v-if="activeTab !== 'empleado'">
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700">Correo electrónico</label>
              <input
                v-model="email"
                type="email"
                required
                autocomplete="username"
                placeholder="info@gmail.com"
                class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </template>

          <!-- EMPLEADO: cadena -->
          <template v-else>
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700">Código de acceso</label>
              <input
                v-model="cadenaEmpleado"
                type="text"
                required
                placeholder="ej. 3-1-2"
                pattern="^\d+-\d+-\d+$"
                autocomplete="off"
                class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono tracking-widest text-center text-lg"
              />
              <p class="text-xs text-gray-400 mt-1">Tu jefe te proporcionó este código al registrarte</p>
            </div>
          </template>

          <!-- Contraseña (todos) -->
          <div>
            <div class="flex justify-between mb-1">
              <label class="text-sm font-medium text-gray-700">Contraseña</label>
              <router-link
                v-if="activeTab !== 'empleado'"
                to="/recuperar-contrasena"
                class="text-sm text-indigo-600 hover:underline"
              >
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

          <!-- Mantener sesión -->
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

    <!-- Panel derecho -->
    <div class="hidden lg:flex w-1/2 bg-indigo-900 relative items-center justify-center">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:40px_40px]"></div>
      <div class="relative z-10 text-center text-white px-10">
        <h2 class="text-4xl font-bold mb-4">Easy Order</h2>
        <p class="text-indigo-200">{{ panelText[activeTab] }}</p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { API_URL } from '../../config/api'

const router = useRouter()

const activeTab      = ref<'admin' | 'empleado' | 'client'>('admin')
const email          = ref('')
const cadenaEmpleado = ref('')
const password       = ref('')
const showPassword   = ref(false)
const keepLoggedIn   = ref(false)
const loading        = ref(false)
const errorMessage   = ref('')

// Limpiar campos al cambiar de tab
watch(activeTab, () => {
  email.value          = ''
  cadenaEmpleado.value = ''
  password.value       = ''
  errorMessage.value   = ''
})

const titles = {
  admin:    'Iniciar sesión',
  empleado: 'Acceso Empleados',
  client:   'Acceso Clientes',
}

const subtitles = {
  admin:    'Accede a tu panel de administración',
  empleado: 'Ingresa tu código y contraseña',
  client:   'Pide comida de tus lugares favoritos',
}

const panelText = {
  admin:    'Sistema de gestión para restaurantes',
  empleado: 'Bienvenido al equipo',
  client:   'La mejor comida a un click de distancia',
}

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
  loading.value      = true
  errorMessage.value = ''

  try {
    // Endpoint y body según el tab activo
    const isEmpleado = activeTab.value === 'empleado'

    const endpoint = isEmpleado
      ? `${API_URL}/empleado/login`
      : `${API_URL}/login`

    const body = isEmpleado
      ? { login: cadenaEmpleado.value, password: password.value }
      : { login: email.value,          password: password.value }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept':       'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Credenciales incorrectas')

    const { token, user } = data

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
      roles: user.roles,
    }))

    if (user.restaurante_activo) {
      storage.setItem('restaurante_activo', JSON.stringify(user.restaurante_activo))
    }

    await nextTick()
    redirectByRole(user.roles[0]?.nombre)

  } catch (error: any) {
    errorMessage.value = error.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>