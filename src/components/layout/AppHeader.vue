<template>
  <header class="h-16 bg-white shadow-sm flex items-center justify-between px-4 lg:px-6">
    
    <div class="flex items-center gap-4">
      <button
        @click="emit('toggle')"
        class="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
      >
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div class="hidden md:block">
        <h2 class="text-lg font-semibold text-gray-800 leading-tight">
          Bienvenido{{ userName ? ', ' + userName : '' }}
        </h2>
        <p class="text-xs text-gray-500">Panel de Administración</p>
      </div>
    </div>

    <div class="flex items-center gap-3 md:gap-6">
      
      <div class="relative" v-if="restaurantes.length > 0">
        <button
          @click="showRestMenu = !showRestMenu; showUserMenu = false"
          class="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition group"
        >
          <div class="p-1.5 bg-indigo-100 rounded text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div class="text-left hidden sm:block">
            <p class="text-[10px] uppercase font-bold text-gray-400 leading-none">Sucursal</p>
            <p class="text-sm font-medium text-gray-700">{{ restauranteActivo?.nombre || 'Seleccionar...' }}</p>
          </div>
          <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div v-if="showRestMenu" class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
          <div class="px-4 py-2 border-b border-gray-50 mb-1">
            <span class="text-xs font-semibold text-gray-400 uppercase">Mis Restaurantes</span>
          </div>
          <button
            v-for="rest in restaurantes"
            :key="rest.id"
            @click="cambiarRestaurante(rest)"
            class="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors"
            :class="restauranteActivo?.id === rest.id ? 'text-indigo-600 font-semibold bg-indigo-50/50' : 'text-gray-600'"
          >
            <div class="flex flex-col items-start">
               <span>{{ rest.nombre }}</span>
               <span class="text-[10px] text-gray-400 font-normal">{{ rest.ciudad }}</span>
            </div>
            <svg v-if="restauranteActivo?.id === rest.id" class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div class="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>

      <div class="relative">
        <button
          @click="showUserMenu = !showUserMenu; showRestMenu = false"
          class="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition"
        >
          <div class="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
            {{ userInitials }}
          </div>
          <svg class="h-4 w-4 text-gray-400 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div v-if="showUserMenu" class="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
          <div class="px-4 py-3 border-b border-gray-50 mb-2">
            <p class="text-sm font-bold text-gray-800 truncate">{{ userName }}</p>
            <p class="text-xs text-gray-500 truncate">{{ user?.email || 'Admin' }}</p>
          </div>
          <button @click="verPerfil" class="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            <span>👤</span> Mi Perfil
          </button>
          <button @click="cambiarPassword" class="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            <span>🔑</span> Seguridad
          </button>
          <hr class="my-2 border-gray-50">
          <button @click="logout" class="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium">
            <span>🚪</span> Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_URL } from '@/config/api'
const router = useRouter()

const emit = defineEmits(['toggle', 'cambioRestaurante'])

// Estado
const user = ref(null)
const restaurantes = ref([])
const restauranteActivo = ref(null)
const showUserMenu = ref(false)
const showRestMenu = ref(false)

// Computed
const userName = computed(() => user.value?.name || user.value?.usuario || 'Usuario')
const userInitials = computed(() => {
  if (!userName.value) return 'U'
  return userName.value.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
})

const getHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token') ?? sessionStorage.getItem('token')}`,
  'Content-Type': 'application/json'
})

// Cargar Datos Iniciales (Usuario + Restaurantes)
const loadData = async () => {
  try {
    // 1. Cargar Usuario
    const userRes = await fetch(`${API_URL}/me`, { headers: getHeaders() })
    if (userRes.status === 401) return logout()
    const userData = await userRes.json()
    user.value = userData.data || userData

    // 2. Cargar Restaurantes (Usando tu estructura de API)
    const restRes = await fetch(`${API_URL}/restaurantes`, { headers: getHeaders() })
    const restData = await restRes.json()
    
    if (restData.success) {
      restaurantes.value = restData.data.restaurantes
      // Asignar el activo que viene de la API
      restauranteActivo.value = restData.data.restaurante_activo
    }
  } catch (error) {
    console.error('Error cargando datos:', error)
  }
}

const cambiarRestaurante = async (restaurante) => {
  // Aquí podrías hacer una petición al backend para actualizar el restaurante activo en la sesión
  restauranteActivo.value = restaurante
  showRestMenu.value = false
  
  // Guardamos en localStorage para persistencia rápida
  localStorage.setItem('restaurante_id_activo', restaurante.id)
  
  // Emitir evento por si el componente padre (Dashboard) necesita refrescar estadísticas
  emit('cambioRestaurante', restaurante.id)
  
  // Opcional: Recargar la página o navegar al home del panel
  // window.location.reload() 
}

// Navegación
const verPerfil = () => { showUserMenu.value = false; router.push('/panel/perfil') }
const cambiarPassword = () => { showUserMenu.value = false; router.push('/panel/cambiar-password') }

const logout = async () => {
  try {
    await fetch(`${API_URL}/logout`, { method: 'POST', headers: getHeaders() })
  } finally {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    localStorage.removeItem('restaurante_id_activo')
    router.push('/')
  }
}

onMounted(loadData)
</script>