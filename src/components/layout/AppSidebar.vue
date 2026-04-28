<template>
  <!-- Overlay para móviles -->
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity duration-300"
    @click="emit('close')"
  ></div>

  <aside 
    :class="[
      'bg-white shadow-xl min-h-screen flex flex-col fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
      isOpen ? 'translate-x-0' : '-translate-x-full'
    ]"
    :style="{ width: isCollapsed && !isMobile ? '80px' : '280px' }"
  >

    <!-- Logo / Título -->
    <div class="h-16 flex items-center justify-between px-4 border-b border-gray-100">
      <div class="flex items-center gap-2 overflow-hidden cursor-pointer" @click="$router.push('/panel/panelinicial')">
        <div class="w-8 h-8 bg-[#0085d1] rounded-lg flex items-center justify-center shadow-sm">
          <i class="fa-solid fa-bowl-food text-white text-sm"></i>
        </div>
        <h1 v-show="!isCollapsed || isMobile" class="text-xl font-bold text-[#0085d1] whitespace-nowrap">
          E-ORDER 2026
        </h1>
      </div>
      <button v-if="!isMobile" class="hidden lg:flex text-gray-400 hover:text-gray-600 transition" @click="toggleCollapse">
        <i :class="isCollapsed ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-left'" class="text-sm"></i>
      </button>
    </div>

    <!-- Perfil de usuario (Habilitado para Config) -->
    <div class="p-4 border-b border-gray-50 relative">
      <div 
        @click="showUserMenu = !showUserMenu"
        class="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded-xl transition-all"
        :class="{ 'justify-center': isCollapsed && !isMobile }"
      >
        <div class="relative">
          <div class="w-12 h-12 bg-[#7c3aed] rounded-full flex items-center justify-center text-white font-bold text-lg">
            {{ userInitials }}
          </div>
          <div class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#10b981] border-2 border-white rounded-full"></div>
        </div>
        <div v-show="!isCollapsed || isMobile" class="flex-1 min-w-0">
          <p class="text-sm font-bold text-gray-700 truncate">{{ userName }}</p>
          <p class="text-xs text-gray-500 truncate flex items-center gap-1">
            <span class="text-amber-500">👑</span> {{ userRoleLabel }}
          </p>
        </div>
        <i v-show="!isCollapsed || isMobile" class="fa-solid fa-chevron-down text-gray-400 text-[10px]"></i>
      </div>

      <!-- Menú Flotante Perfil -->
      <transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100">
        <div v-if="showUserMenu" class="absolute left-4 right-4 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1">
          <button @click="navigate('/panel/perfil')" class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2">
            <i class="fa-solid fa-user-gear text-gray-400"></i> Mi Perfil / Config
          </button>
          <button @click="logout" class="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50">
            <i class="fa-solid fa-power-off text-red-400"></i> Cerrar Sesión
          </button>
        </div>
      </transition>
    </div>

    <!-- Navegación -->
    <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-4">

      <!-- Dashboard -->
      <div>
        <RouterLink to="/panel/panelinicial" class="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition" :class="{ 'bg-gray-100 text-gray-900 font-medium': $route.path === '/panel/panelinicial', 'justify-center': isCollapsed && !isMobile }">
          <i class="fa-solid fa-chart-line text-lg w-6"></i>
          <span v-show="!isCollapsed || isMobile" class="text-sm">Dashboard</span>
        </RouterLink>
      </div>

      <!-- SELECTOR DE SUCURSAL (Añadido sin romper distribución) -->
      <div v-if="restaurantes && restaurantes.length > 1">
        <div v-show="!isCollapsed || isMobile" class="px-3 pb-1">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sucursal</p>
        </div>
        <button @click="showRestMenu = !showRestMenu" class="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition" :class="{ 'justify-center': isCollapsed && !isMobile }">
          <i class="fa-solid fa-store text-emerald-500 text-sm w-6"></i>
          <span v-show="!isCollapsed || isMobile" class="text-sm font-medium text-gray-600 truncate flex-1 text-left">{{ activeRestName }}</span>
          <i v-show="!isCollapsed || isMobile" class="fa-solid fa-chevron-down text-gray-400 text-[10px]"></i>
        </button>
        <div v-if="showRestMenu && (!isCollapsed || isMobile)" class="mt-1 space-y-1 bg-gray-50 rounded-lg p-1">
          <button v-for="r in restaurantes" :key="r.id" @click="selectRest(r.id)" class="w-full text-left px-3 py-1.5 text-xs rounded transition" :class="r.id === restauranteActivo ? 'bg-white text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-200'">{{ r.nombre }}</button>
        </div>
      </div>

      <!-- SECCIÓN: OPERACIONES -->
      <div>
        <div v-show="!isCollapsed || isMobile" class="px-3 pb-2">
          <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Operaciones</p>
        </div>
        <div class="space-y-1">
          <RouterLink v-show="hasPermission('VER_CLIENTE')" to="/panel/cliente" class="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition" :class="{ 'bg-gray-100 text-gray-900 font-medium': $route.path === '/panel/cliente', 'justify-center': isCollapsed && !isMobile }">
            <i class="fa-solid fa-user text-lg w-6 text-center"></i>
            <span v-show="!isCollapsed || isMobile" class="text-sm">Cliente</span>
          </RouterLink>
          <RouterLink v-show="hasPermission('VER_MESERO')" to="/panel/mesero" class="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition" :class="{ 'bg-gray-100 text-gray-900 font-medium': $route.path === '/panel/mesero', 'justify-center': isCollapsed && !isMobile }">
            <i class="fa-solid fa-users text-lg w-6 text-center"></i>
            <span v-show="!isCollapsed || isMobile" class="text-sm">Mesero</span>
          </RouterLink>
          <RouterLink v-show="hasPermission('VER_CAJA')" to="/panel/caja" class="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition" :class="{ 'bg-gray-100 text-gray-900 font-medium': $route.path === '/panel/caja', 'justify-center': isCollapsed && !isMobile }">
            <i class="fa-solid fa-cash-register text-lg w-6 text-center"></i>
            <span v-show="!isCollapsed || isMobile" class="text-sm">Caja</span>
          </RouterLink>
        </div>
      </div>

      <!-- SECCIÓN: ESTACIONES -->
      <div>
        <div v-show="!isCollapsed || isMobile" class="px-3 pb-2">
          <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Estaciones</p>
        </div>
        <div class="space-y-1">
          <RouterLink v-show="hasPermission('VER_COCINA')" to="/panel/cocina" class="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition" :class="{ 'bg-gray-100 text-gray-900 font-medium': $route.path === '/panel/cocina', 'justify-center': isCollapsed && !isMobile }">
            <i class="fa-solid fa-utensils text-lg w-6 text-center"></i>
            <span v-show="!isCollapsed || isMobile" class="text-sm">Cocina</span>
          </RouterLink>
          <RouterLink v-show="hasPermission('VER_BARRA')" to="/panel/barra" class="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition" :class="{ 'bg-gray-100 text-gray-900 font-medium': $route.path === '/panel/barra', 'justify-center': isCollapsed && !isMobile }">
            <i class="fa-solid fa-martini-glass text-lg w-6 text-center"></i>
            <span v-show="!isCollapsed || isMobile" class="text-sm">Barra</span>
          </RouterLink>
          <RouterLink to="/panel/postres" class="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition" :class="{ 'bg-gray-100 text-gray-900 font-medium': $route.path === '/panel/postres', 'justify-center': isCollapsed && !isMobile }">
            <i class="fa-solid fa-cake-candles text-lg w-6 text-center"></i>
            <span v-show="!isCollapsed || isMobile" class="text-sm">Postres</span>
          </RouterLink>
        </div>
      </div>

      <!-- SECCIÓN: ADMINISTRACIÓN -->
      <div>
        <div v-show="!isCollapsed || isMobile" class="px-3 pb-2">
          <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Administración</p>
        </div>
        <div class="space-y-1">
          <RouterLink to="/panel/admin" class="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition" :class="{ 'bg-[#eef2ff] text-indigo-600 font-bold shadow-sm': $route.path === '/panel/admin', 'justify-center': isCollapsed && !isMobile }">
            <i class="fa-solid fa-gear text-lg w-6 text-center"></i>
            <span v-show="!isCollapsed || isMobile" class="text-sm">Gestión</span>
          </RouterLink>
          <RouterLink to="/panel/analisis" class="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition" :class="{ 'bg-[#eef2ff] text-indigo-600 font-bold shadow-sm': $route.path === '/panel/analisis', 'justify-center': isCollapsed && !isMobile }">
            <i class="fa-solid fa-magnifying-glass-chart text-lg w-6 text-center"></i>
            <span v-show="!isCollapsed || isMobile" class="text-sm">Métricas</span>
          </RouterLink>
          <RouterLink to="/panel/productos" class="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition" :class="{ 'bg-[#eef2ff] text-indigo-600 font-bold shadow-sm': $route.path === '/panel/productos', 'justify-center': isCollapsed && !isMobile }">
            <i class="fa-solid fa-box text-lg w-6 text-center"></i>
            <span v-show="!isCollapsed || isMobile" class="text-sm">Productos</span>
          </RouterLink>
        </div>
      </div>

    </nav>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { API_URL } from '@/config/api'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  user: { type: Object, default: () => ({}) },
  restaurantes: { type: Array, default: () => [] },
  restauranteActivo: { type: [Number, String], default: null }
})

const emit = defineEmits(['close', 'seleccionar-restaurante'])
const router = useRouter()
const route = useRoute()

const isCollapsed = ref(false)
const isMobile = ref(window.innerWidth < 1024)
const showUserMenu = ref(false)
const showRestMenu = ref(false)

// Computed
const userName = computed(() => props.user?.name || 'Usuario')
const userInitials = computed(() => {
  if (!userName.value) return 'U'
  return userName.value.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
})

const userRoleLabel = computed(() => {
  const role = props.user?.roles?.[0]?.nombre
  const map = { 'PROPIETARIO': 'Propietario', 'ADMIN': 'Admin', 'MESERO': 'Mesero', 'COCINA': 'Cocina', 'CAJA': 'Caja' }
  return map[role] || role || 'Usuario'
})

const activeRestName = computed(() => {
  return props.restaurantes.find(r => r.id === props.restauranteActivo)?.nombre || 'Seleccionar...'
})

// Métodos
const hasPermission = (permission) => {
  if (!props.user?.roles) return true
  const role = props.user.roles[0]?.nombre
  if (['PROPIETARIO', 'ADMIN'].includes(role)) return true
  if (permission === 'VER_MESERO') return role === 'MESERO'
  if (permission === 'VER_COCINA') return role === 'COCINA'
  if (permission === 'VER_CAJA')   return role === 'CAJA'
  if (permission === 'VER_BARRA')  return role === 'BARRA'
  return true
}

const navigate = (to) => {
  showUserMenu.value = false
  if (isMobile.value) emit('close')
  router.push(to)
}

const selectRest = (id) => {
  showRestMenu.value = false
  emit('seleccionar-restaurante', id)
}

const handleMobileClose = () => {
  if (isMobile.value) emit('close')
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebar_collapsed', isCollapsed.value)
}

const handleResize = () => {
  isMobile.value = window.innerWidth < 1024
  if (!isMobile.value) {
    const saved = localStorage.getItem('sidebar_collapsed')
    if (saved !== null) isCollapsed.value = saved === 'true'
  } else {
    isCollapsed.value = false
  }
}

const logout = async () => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    await fetch(`${API_URL}/logout`, { 
      method: 'POST', 
      headers: { 'Authorization': `Bearer ${token}` }
    })
  } catch {}
  finally {
    localStorage.clear(); sessionStorage.clear()
    router.push('/')
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  const saved = localStorage.getItem('sidebar_collapsed')
  if (saved !== null && !isMobile.value) isCollapsed.value = saved === 'true'
  
  document.addEventListener('click', (e) => {
    if (!e.target.closest('aside')) {
      showUserMenu.value = false
      showRestMenu.value = false
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
nav::-webkit-scrollbar { width: 4px; }
nav::-webkit-scrollbar-track { background: transparent; }
nav::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>