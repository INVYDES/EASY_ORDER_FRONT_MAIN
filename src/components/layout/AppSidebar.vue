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
        <img 
          src="@/assets/imaguenes/Logo.jpg" 
          class="w-10 h-10 object-contain rounded-lg" 
          alt="Logo"
        />
        <h1 
          v-show="!isCollapsed || isMobile" 
          class="text-xl font-extrabold text-[#0056b3] italic tracking-tight whitespace-nowrap"
          style="font-family: 'Inter', sans-serif;"
        >
          Easy Order
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
          <div 
            class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden border-2 border-gray-100 shadow-sm"
            :class="!activeRestImage ? 'bg-[#7c3aed]' : 'bg-white'"
          >
            <img v-if="activeRestImage" :src="activeRestImage" class="w-full h-full object-cover" />
            <span v-else>{{ userInitials }}</span>
          </div>
          <div class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#10b981] border-2 border-white rounded-full"></div>
        </div>
        <div v-show="!isCollapsed || isMobile" class="flex-1 min-w-0">
          <p class="text-sm font-bold text-gray-700 truncate">{{ userName }}</p>
          <p class="text-xs text-gray-500 truncate flex items-center gap-1">
            <span class="text-amber-500">👑</span> {{ userRoleLabel }}
          </p>
        </div>
        <i v-show="!isCollapsed || isMobile" class="fa-solid fa-chevron-down text-gray-400 text-[10px]" :class="{'rotate-180': showUserMenu}"></i>
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

      <!-- SELECTOR DE SUCURSAL -->
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
          <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">OPERACIONES PRUEBA</p>
        </div>
        <div class="space-y-1">
          <RouterLink v-if="hasPermission('VER_MESERO')" to="/panel/mesero" class="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition" :class="{ 'bg-gray-100 text-gray-900 font-medium': $route.path === '/panel/mesero', 'justify-center': isCollapsed && !isMobile }" @click="handleMobileClose">
            <i class="fa-solid fa-users text-lg w-6 text-center"></i>
            <span v-show="!isCollapsed || isMobile" class="text-sm">Mesero</span>
          </RouterLink>
          <RouterLink v-if="hasPermission('VER_CAJA')" to="/panel/caja" class="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition" :class="{ 'bg-gray-100 text-gray-900 font-medium': $route.path === '/panel/caja', 'justify-center': isCollapsed && !isMobile }" @click="handleMobileClose">
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
          <RouterLink v-if="hasPermission('VER_COCINA')" to="/panel/cocina" class="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition relative" :class="{ 'bg-gray-100 text-gray-900 font-medium': $route.path === '/panel/cocina', 'justify-center': isCollapsed && !isMobile }" @click="handleMobileClose">
            <i class="fa-solid fa-utensils text-lg w-6 text-center"></i>
            <span v-show="!isCollapsed || isMobile" class="text-sm">Cocina</span>
            <span v-if="pendingCounts.cocina > 0" class="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm ml-auto">{{ pendingCounts.cocina }}</span>
          </RouterLink>
          
          <RouterLink v-if="hasPermission('VER_BARRA')" to="/panel/barra" class="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition relative" :class="{ 'bg-gray-100 text-gray-900 font-medium': $route.path === '/panel/barra', 'justify-center': isCollapsed && !isMobile }" @click="handleMobileClose">
            <i class="fa-solid fa-martini-glass text-lg w-6 text-center"></i>
            <span v-show="!isCollapsed || isMobile" class="text-sm">Barra</span>
            <span v-if="pendingCounts.barra > 0" class="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm ml-auto">{{ pendingCounts.barra }}</span>
          </RouterLink>
          
          <RouterLink v-if="hasPermission('VER_POSTRES')" to="/panel/postres" class="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition relative" :class="{ 'bg-gray-100 text-gray-900 font-medium': $route.path === '/panel/postres', 'justify-center': isCollapsed && !isMobile }" @click="handleMobileClose">
            <i class="fa-solid fa-cake-candles text-lg w-6 text-center"></i>
            <span v-show="!isCollapsed || isMobile" class="text-sm">Postres</span>
            <span v-if="pendingCounts.postres > 0" class="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm ml-auto">{{ pendingCounts.postres }}</span>
          </RouterLink>
        </div>
      </div>

      <!-- SECCIÓN: ADMINISTRACIÓN -->
      <div v-if="isAdminOrOwner">
        <div v-show="!isCollapsed || isMobile" class="px-3 pb-2">
          <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Administración</p>
        </div>
        <div class="space-y-1">
          <RouterLink to="/panel/Gestion" class="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition" :class="{ 'bg-[#eef2ff] text-indigo-600 font-bold shadow-sm': $route.path === '/panel/Gestion', 'justify-center': isCollapsed && !isMobile }" @click="handleMobileClose">
            <i class="fa-solid fa-gear text-lg w-6 text-center"></i>
            <span v-show="!isCollapsed || isMobile" class="text-sm">Gestión</span>
          </RouterLink>
          <RouterLink to="/panel/analisis" class="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition" :class="{ 'bg-[#eef2ff] text-indigo-600 font-bold shadow-sm': $route.path === '/panel/analisis', 'justify-center': isCollapsed && !isMobile }" @click="handleMobileClose">
            <i class="fa-solid fa-magnifying-glass-chart text-lg w-6 text-center"></i>
            <span v-show="!isCollapsed || isMobile" class="text-sm">Métricas</span>
          </RouterLink>
          <RouterLink to="/panel/productos" class="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition" :class="{ 'bg-[#eef2ff] text-indigo-600 font-bold shadow-sm': $route.path === '/panel/productos', 'justify-center': isCollapsed && !isMobile }" @click="handleMobileClose">
            <i class="fa-solid fa-box text-lg w-6 text-center"></i>
            <span v-show="!isCollapsed || isMobile" class="text-sm">Productos</span>
          </RouterLink>
          <RouterLink to="/panel/nomina" class="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition" :class="{ 'bg-[#eef2ff] text-indigo-600 font-bold shadow-sm': $route.path === '/panel/nomina', 'justify-center': isCollapsed && !isMobile }" @click="handleMobileClose">
            <i class="fa-solid fa-file-invoice-dollar text-lg w-6 text-center"></i>
            <span v-show="!isCollapsed || isMobile" class="text-sm">Nóminas</span>
          </RouterLink>
        </div>
      </div>

    </nav>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { API_URL, STORAGE_URL } from '@/config/api'
import { apiClient } from '@/utils/apiClient'
import { useRestauranteChannel } from '@/composables/useRestauranteChannel'

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

const pendingCounts = ref({
  cocina: 0,
  barra: 0,
  postres: 0
})

// Computed
const userName = computed(() => props.user?.name || 'Usuario')
const userInitials = computed(() => {
  if (!userName.value) return 'U'
  return userName.value.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
})

const userRoleLabel = computed(() => {
  const roleRaw = props.user?.roles?.[0]
  const role = typeof roleRaw === 'string' ? roleRaw : (roleRaw?.nombre || roleRaw?.name)
  const map = { 'PROPIETARIO': 'Propietario', 'ADMIN': 'Admin', 'MESERO': 'Mesero', 'COCINA': 'Cocina', 'CAJA': 'Caja' }
  return map[role?.toUpperCase()] || role || 'Usuario'
})

const activeRestImage = computed(() => {
  const rest = props.restaurantes.find(r => r && r.id === props.restauranteActivo)
  if (!rest || !rest.imagen) return null
  
  if (rest.imagen.startsWith('http')) return rest.imagen
  
  return `${STORAGE_URL}${rest.imagen}`
})

const activeRestName = computed(() => {
  return props.restaurantes.find(r => r && r.id === props.restauranteActivo)?.nombre || 'Seleccionar...'
})

// Verificar si es administrador o propietario
const isAdminOrOwner = computed(() => {
  if (!props.user?.roles) return false
  return props.user.roles.some(r => {
    const name = (typeof r === 'string' ? r : (r.nombre || r.name || '')).toUpperCase()
    return name.includes('PROPIETARIO') || 
           name.includes('ADMIN') || 
           name.includes('ADMINISTRADOR') ||
           name.includes('DUEÑO')
  })
})

// Métodos
const hasPermission = (permission) => {
  // 1. Si es admin o propietario, tiene acceso total
  if (isAdminOrOwner.value) return true
  
  // 2. Verificar en la lista de permisos del usuario
  if (props.user?.permissions) {
    const tienePermiso = props.user.permissions.some(p => 
      (p.nombre === permission) || (p.slug === permission)
    )
    if (tienePermiso) return true
  }
  
  // 3. Respaldo por nombre de rol
  const roles = props.user?.roles?.map((r) => typeof r === 'string' ? r.toUpperCase() : r.nombre?.toUpperCase()) || []
  
  switch (permission) {
    case 'VER_PANEL':   return true
    case 'VER_MESERO':  return roles.includes('MESERO')
    case 'VER_COCINA':  return roles.includes('COCINA')
    case 'VER_BARRA':   return roles.includes('BARRA')
    case 'VER_POSTRES': return roles.includes('POSTRES')
    case 'VER_CAJA':    return roles.includes('CAJA')
    default: return false
  }
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
    await apiClient.post('/logout')
  } catch {}
  finally {
    localStorage.clear(); sessionStorage.clear()
    router.push('/')
  }
}

const fetchPendingCounts = async () => {
  if (!props.restauranteActivo) return
  try {
    const { data } = await apiClient.get('/ordenes/pendientes/conteo')
    console.log('📊 Sidebar Counts:', data.data)
    if (data.success) {
      pendingCounts.value = data.data
    }
  } catch (error) {
    console.error('❌ Error fetching sidebar counts:', error)
  }
}

// Configurar WebSockets para actualizaciones en tiempo real
useRestauranteChannel(computed(() => props.restauranteActivo), {
  onOrden: () => {
    // Cuando hay cualquier cambio en órdenes, refrescamos los conteos
    fetchPendingCounts()
  }
})

// Vigilar cuando cambia el restaurante para recargar conteos
watch(() => props.restauranteActivo, (newVal) => {
  if (newVal) fetchPendingCounts()
}, { immediate: true })

onMounted(() => {
  window.addEventListener('resize', handleResize)
  const saved = localStorage.getItem('sidebar_collapsed')
  if (saved !== null && !isMobile.value) isCollapsed.value = saved === 'true'
  
  fetchPendingCounts()

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
.router-link-active { background-color: #eef2ff; color: #4f46e5; font-weight: 600; }
</style>