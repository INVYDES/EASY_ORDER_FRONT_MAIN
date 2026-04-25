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

    <!-- Logo / Título con toggle -->
    <div class="h-16 flex items-center justify-between px-4 border-b border-gray-100">
      <div class="flex items-center gap-2 overflow-hidden">
        <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
          <span class="text-white text-lg font-bold">E</span>
        </div>
        <h1 
          v-show="!isCollapsed || isMobile" 
          class="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap"
        >
          Easy Order
        </h1>
      </div>
      
      <div class="flex items-center gap-1">
        <!-- Botón colapsar (solo desktop) -->
        <button 
          v-if="!isMobile"
          class="hidden lg:flex text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100"
          @click="toggleCollapse"
        >
          <i :class="isCollapsed ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-left'" class="text-sm"></i>
        </button>
        
        <!-- Botón cerrar móvil -->
        <button 
          v-if="isMobile && isOpen"
          class="lg:hidden text-gray-400 hover:text-gray-600 transition p-1"
          @click="emit('close')"
        >
          <i class="fa-solid fa-times text-lg"></i>
        </button>
      </div>
    </div>

    <!-- Perfil de usuario -->
    <div class="p-4 border-b border-gray-100">
      <div class="flex items-center gap-3" :class="{ 'justify-center': isCollapsed && !isMobile }">
        <div class="relative">
          <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
            {{ userInitials }}
          </div>
          <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
        </div>
        
        <div v-show="!isCollapsed || isMobile" class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-800 truncate">{{ userName }}</p>
          <p class="text-xs text-gray-500 truncate">{{ userRole }}</p>
        </div>
      </div>
    </div>

    <!-- Navegación principal -->
    <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      <!-- Panel Inicial -->
      <RouterLink
        v-if="hasPermission('VER_PANEL')"
        to="/panel/panelinicial"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group"
        :class="{ 
          'bg-indigo-50 text-indigo-600 font-medium': $route.path === '/panel/panelinicial',
          'justify-center': isCollapsed && !isMobile
        }"
        @click="handleMobileClose"
      >
        <i class="fa-solid fa-chart-line text-lg w-5"></i>
        <span v-show="!isCollapsed || isMobile" class="text-sm">Dashboard</span>
        <div v-if="isCollapsed && !isMobile" class="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
          Dashboard
        </div>
      </RouterLink>

      <!-- Cliente -->
      <RouterLink
        v-if="hasPermission('VER_CLIENTE')"
        to="/panel/cliente"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group"
        :class="{ 
          'bg-indigo-50 text-indigo-600 font-medium': $route.path === '/panel/cliente',
          'justify-center': isCollapsed && !isMobile
        }"
        @click="handleMobileClose"
      >
        <i class="fa-solid fa-user text-lg w-5"></i>
        <span v-show="!isCollapsed || isMobile" class="text-sm">Cliente</span>
        <div v-if="isCollapsed && !isMobile" class="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
          Cliente
        </div>
      </RouterLink>

      <!-- Mesero -->
      <RouterLink
        v-if="hasPermission('VER_MESERO')"
        to="/panel/mesero"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group"
        :class="{ 
          'bg-indigo-50 text-indigo-600 font-medium': $route.path === '/panel/mesero',
          'justify-center': isCollapsed && !isMobile
        }"
        @click="handleMobileClose"
      >
        <i class="fa-solid fa-users text-lg w-5"></i>
        <span v-show="!isCollapsed || isMobile" class="text-sm">Mesero</span>
        <div v-if="isCollapsed && !isMobile" class="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
          Mesero
        </div>
      </RouterLink>

      <!-- Cocina -->
      <RouterLink
        v-if="hasPermission('VER_COCINA')"
        to="/panel/cocina"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group"
        :class="{ 
          'bg-indigo-50 text-indigo-600 font-medium': $route.path === '/panel/cocina',
          'justify-center': isCollapsed && !isMobile
        }"
        @click="handleMobileClose"
      >
        <i class="fa-solid fa-utensils text-lg w-5"></i>
        <span v-show="!isCollapsed || isMobile" class="text-sm">Cocina</span>
        <div v-if="isCollapsed && !isMobile" class="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
          Cocina
        </div>
      </RouterLink>

      <!-- Barra -->
      <RouterLink
        v-if="hasPermission('VER_BARRA')"
        to="/panel/barra"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group"
        :class="{ 
          'bg-indigo-50 text-indigo-600 font-medium': $route.path === '/panel/barra',
          'justify-center': isCollapsed && !isMobile
        }"
        @click="handleMobileClose"
      >
        <i class="fa-solid fa-martini-glass text-lg w-5"></i>
        <span v-show="!isCollapsed || isMobile" class="text-sm">Barra_T</span>
        <div v-if="isCollapsed && !isMobile" class="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
          Barra_T
        </div>
      </RouterLink>

      <!-- Postres (PRUEBA) -->
      <RouterLink
        v-if="true"
        to="/panel/postres"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group"
        :class="{ 
          'bg-indigo-50 text-indigo-600 font-medium': $route.path === '/panel/postres',
          'justify-center': isCollapsed && !isMobile
        }"
        @click="handleMobileClose"
      >
        <i class="fa-solid fa-cake-candles text-lg w-5"></i>
        <span v-show="!isCollapsed || isMobile" class="text-sm font-bold">Postres</span>
        <div v-if="isCollapsed && !isMobile" class="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
          Postres
        </div>
      </RouterLink>


      <!-- Caja -->
      <RouterLink
        v-if="hasPermission('VER_CAJA')"
        to="/panel/caja"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group"
        :class="{ 
          'bg-indigo-50 text-indigo-600 font-medium': $route.path === '/panel/caja',
          'justify-center': isCollapsed && !isMobile
        }"
        @click="handleMobileClose"
      >
        <i class="fa-solid fa-cash-register text-lg w-5"></i>
        <span v-show="!isCollapsed || isMobile" class="text-sm">Caja</span>
        <div v-if="isCollapsed && !isMobile" class="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
          Caja
        </div>
      </RouterLink>

      <div class="border-t border-gray-100 my-3"></div>

      <!-- Módulos de Administración (solo admin/propietario) -->
      <template v-if="isAdminOrOwner">
        
        <!-- Administración -->
        <RouterLink
          to="/panel/admin"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group"
          :class="{ 
            'bg-indigo-50 text-indigo-600 font-medium': $route.path === '/panel/admin',
            'justify-center': isCollapsed && !isMobile
          }"
          @click="handleMobileClose"
        >
          <i class="fa-solid fa-gear text-lg w-5"></i>
          <span v-show="!isCollapsed || isMobile" class="text-sm">Administración</span>
          <div v-if="isCollapsed && !isMobile" class="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
            Administración
          </div>
        </RouterLink>

        <!-- Productos -->
        <RouterLink
          to="/panel/productos"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group"
          :class="{ 
            'bg-indigo-50 text-indigo-600 font-medium': $route.path === '/panel/productos',
            'justify-center': isCollapsed && !isMobile
          }"
          @click="handleMobileClose"
        >
          <i class="fa-solid fa-box text-lg w-5"></i>
          <span v-show="!isCollapsed || isMobile" class="text-sm">Productos</span>
          <div v-if="isCollapsed && !isMobile" class="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
            Productos
          </div>
        </RouterLink>

        <!-- Ingredientes -->
        <RouterLink
          to="/panel/ingredientes"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group"
          :class="{ 
            'bg-indigo-50 text-indigo-600 font-medium': $route.path === '/panel/ingredientes',
            'justify-center': isCollapsed && !isMobile
          }"
          @click="handleMobileClose"
        >
          <i class="fa-solid fa-carrot text-lg w-5"></i>
          <span v-show="!isCollapsed || isMobile" class="text-sm">Ingredientes</span>
          <div v-if="isCollapsed && !isMobile" class="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
            Ingredientes
          </div>
        </RouterLink>

        <!-- Gastos -->
        <RouterLink
          to="/panel/gastos"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group"
          :class="{ 
            'bg-indigo-50 text-indigo-600 font-medium': $route.path === '/panel/gastos',
            'justify-center': isCollapsed && !isMobile
          }"
          @click="handleMobileClose"
        >
          <i class="fa-solid fa-receipt text-lg w-5"></i>
          <span v-show="!isCollapsed || isMobile" class="text-sm">Gastos</span>
          <div v-if="isCollapsed && !isMobile" class="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
            Gastos
          </div>
        </RouterLink>

        <!-- Reportes / ROI -->
        <RouterLink
          to="/panel/roi"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group"
          :class="{ 
            'bg-indigo-50 text-indigo-600 font-medium': $route.path === '/panel/roi',
            'justify-center': isCollapsed && !isMobile
          }"
          @click="handleMobileClose"
        >
          <i class="fa-solid fa-chart-simple text-lg w-5"></i>
          <span v-show="!isCollapsed || isMobile" class="text-sm">ROI / Reportes</span>
          <div v-if="isCollapsed && !isMobile" class="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
            ROI / Reportes
          </div>
        </RouterLink>

      </template>

    </nav>

    <!-- Botón Logout -->
    <div class="p-4 border-t border-gray-100 mt-auto">
      <button
        @click="logout"
        class="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 group"
        :class="{ 'justify-center': isCollapsed && !isMobile }"
      >
        <i class="fa-solid fa-sign-out-alt text-lg w-5"></i>
        <span v-show="!isCollapsed || isMobile" class="text-sm font-medium">Cerrar Sesión</span>
        <div v-if="isCollapsed && !isMobile" class="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
          Cerrar Sesión
        </div>
      </button>
    </div>

  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { API_URL } from '@/config/api'
const router = useRouter()
const route = useRoute()

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close'])

// Estado
const user = ref(null)
const loading = ref(true)
const isCollapsed = ref(false)
const isMobile = ref(window.innerWidth < 1024)

// Computed
const userName = computed(() => user.value?.name || user.value?.username || 'Usuario')
const userInitials = computed(() => {
  if (!userName.value) return 'U'
  return userName.value
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
})

// Verificar si es administrador o propietario
const isAdminOrOwner = computed(() => {
  if (!user.value?.roles) return false
  return user.value.roles.some(r => {
    const name = (r.nombre || '').toUpperCase()
    return name.includes('PROPIETARIO') || 
           name.includes('ADMIN') || 
           name.includes('ADMINISTRADOR') ||
           name.includes('ADMINISTRACION') ||
           name.includes('DUEÑO')
  })
})

const userRole = computed(() => {
  if (user.value?.roles?.length) {
    const role = user.value.roles[0].nombre
    const roleLabels = {
      'PROPIETARIO': '👑 Propietario',
      'ADMIN': '⚙️ Administrador',
      'MESERO': '🍽️ Mesero',
      'COCINA': '👨‍🍳 Cocina',
      'BARRA': '🍸 Barra',
      'POSTRES': '🍰 Postres',
      'CLIENTE': '👤 Cliente'
    }
    return roleLabels[role] || role
  }
  return 'Empleado'
})

// Headers con token
const getHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
}

// Verificar permisos (mejorado para leer de la base de datos)
const hasPermission = (permission) => {
  // 1. Si es admin o propietario, tiene acceso total
  if (isAdminOrOwner.value) return true
  
  // 2. Verificar en la lista de permisos del usuario (si viene del Backend)
  if (user.value?.permissions) {
    const tienePermiso = user.value.permissions.some(p => 
      (p.nombre === permission) || (p.slug === permission)
    )
    if (tienePermiso) return true
  }
  
  // 3. Respaldo por nombre de rol (para estaciones fijas)
  if (!user.value?.roles?.length) return false
  const role = user.value.roles[0].nombre.toUpperCase()
  
  switch (permission) {
    case 'VER_PANEL':   return true
    case 'VER_MESERO':  return role === 'MESERO'
    case 'VER_COCINA':  return role === 'COCINA'
    case 'VER_BARRA':   return role === 'BARRA'
    case 'VER_POSTRES': return role === 'POSTRES'
    case 'VER_CAJA':    return role === 'ADMIN' || role === 'PROPIETARIO'
    default: return false
  }
}

// Cargar usuario
const loadUser = async () => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    const response = await fetch(`${API_URL}/me`, {
      headers: getHeaders()
    })

    if (response.status === 401) {
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
      router.push('/')
      return
    }

    const data = await response.json()
    if (data.success) {
      user.value = data.data || data
    } else {
      throw new Error(data.message || 'Error al cargar usuario')
    }
  } catch (error) {
    console.error('Error al cargar usuario:', error)
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    router.push('/')
  } finally {
    loading.value = false
  }
}

// Logout
const logout = async () => {
  try {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: getHeaders()
    })
    
    if (!response.ok) {
      console.warn('Error en logout:', response.status)
    }
  } catch (error) {
    console.error('Error en logout:', error)
  } finally {
    // Limpiar todos los datos de sesión
    localStorage.clear()
    sessionStorage.clear()
    
    // Redirigir al login
    router.push('/')
  }
}

// Manejar cierre en móvil
const handleMobileClose = () => {
  if (isMobile.value) {
    emit('close')
  }
}

// Toggle colapsar sidebar
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebar_collapsed', isCollapsed.value)
}

// Manejar cambio de tamaño de ventana
const handleResize = () => {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth < 1024
  
  // Si cambia de móvil a desktop y el sidebar estaba abierto, lo dejamos abierto
  if (wasMobile && !isMobile.value && props.isOpen) {
    emit('close')
  }
  
  // Si es desktop, restaurar estado colapsado guardado
  if (!isMobile.value) {
    const saved = localStorage.getItem('sidebar_collapsed')
    if (saved !== null) {
      isCollapsed.value = saved === 'true'
    }
  } else {
    // En móvil, siempre expandido cuando está abierto
    isCollapsed.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadUser()
  window.addEventListener('resize', handleResize)
  
  // Cargar estado colapsado guardado
  const saved = localStorage.getItem('sidebar_collapsed')
  if (saved !== null && !isMobile.value) {
    isCollapsed.value = saved === 'true'
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* Scrollbar personalizado */
nav::-webkit-scrollbar {
  width: 4px;
}

nav::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

nav::-webkit-scrollbar-thumb {
  background: #c7d2fe;
  border-radius: 10px;
}

nav::-webkit-scrollbar-thumb:hover {
  background: #818cf8;
}

/* Transiciones suaves */
.router-link-active,
.router-link-exact-active {
  background-color: rgb(238, 242, 255);
  color: rgb(79, 70, 229);
}

/* Tooltip para items colapsados */
.group {
  position: relative;
}

/* Mejora de hover */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>