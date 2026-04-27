<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const router = useRouter()
const route = useRoute()

// ── Estado ──────────────────────────────────────────────
const user               = ref(null)
const userRestaurantes   = ref([])
const restauranteActivo  = ref(null)
const sidebarOpen        = ref(false)
const showUserMenu       = ref(false)
const showRestauranteMenu = ref(false)
const isCollapsed        = ref(false)
const isMobile           = ref(window.innerWidth < 1024)

// ── Permisos por rol (lógica original del View 1) ───────
const rolePermissions = {
  mesero:       ['PROPIETARIO', 'ADMIN', 'MESERO'],
  cliente:      ['CLIENTE'],
  admin:        ['PROPIETARIO', 'ADMIN'],
  caja:         ['PROPIETARIO', 'ADMIN', 'CAJA'],
  cocina:       ['PROPIETARIO', 'ADMIN', 'COCINA'],
  productos:    ['PROPIETARIO', 'ADMIN', 'CAJA', 'MESERO'],
  barra:        ['PROPIETARIO', 'ADMIN', 'BARRA'],
  postres:      ['PROPIETARIO', 'ADMIN', 'COCINA'],
  ingredientes: ['PROPIETARIO', 'ADMIN'],
  anuncios:     ['PROPIETARIO', 'ADMIN'],
  gastos:       ['PROPIETARIO', 'ADMIN'],
  roi:          ['PROPIETARIO', 'ADMIN'],
}

const canView = (modulo) => {
  if (!user.value?.roles) return false
  const userRole = user.value.roles[0]?.nombre || ''
  return rolePermissions[modulo]?.includes(userRole) || false
}

// ── Computed de usuario ──────────────────────────────────
const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  return user.value.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
})

const userRoleLabel = computed(() => {
  const map = {
    PROPIETARIO: '👑 Propietario',
    ADMIN:       '⚙️ Administrador',
    MESERO:      '🍽️ Mesero',
    COCINA:      '👨‍🍳 Cocina',
    CAJA:        '💰 Caja',
    BARRA:       '🍸 Barra',
    CLIENTE:     '👤 Cliente',
  }
  return map[user.value?.roles?.[0]?.nombre] || 'Usuario'
})

const isAdminOrOwner = computed(() =>
  user.value?.roles?.some(r =>
    ['PROPIETARIO', 'ADMIN'].includes((r.nombre || '').toUpperCase())
  ) || false
)

// ── Items de navegación agrupados ───────────────────────
const navSections = computed(() => [
  {
    label: 'Operaciones',
    items: [
      { key: 'cliente',   to: '/panel/cliente',   label: 'Menú Cliente',   icon: 'fa-utensils' },
      { key: 'mesero',    to: '/panel/mesero',    label: 'Mesero',         icon: 'fa-users' },
      { key: 'caja',      to: '/panel/caja',      label: 'Caja',           icon: 'fa-cash-register' },
    ].filter(i => canView(i.key)),
  },
  {
    label: 'Estaciones',
    items: [
      { key: 'cocina',  to: '/panel/cocina',  label: 'Cocina',  icon: 'fa-fire-burner' },
      { key: 'barra',   to: '/panel/barra',   label: 'Barra',   icon: 'fa-martini-glass' },
      { key: 'postres', to: '/panel/postres', label: 'Postres', icon: 'fa-cake-candles' },
    ].filter(i => canView(i.key)),
  },
  {
    label: 'Administración',
    adminOnly: true,
    items: [
      { key: 'admin',     to: '/panel/admin',     label: 'Gestión',    icon: 'fa-gear' },
      { key: 'productos', to: '/panel/productos', label: 'Productos',  icon: 'fa-box' },
    ].filter(i => canView(i.key)),
  },
].filter(s => (!s.adminOnly || isAdminOrOwner.value) && s.items.length > 0))

// ── Headers ──────────────────────────────────────────────
const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

// ── Cargar datos ─────────────────────────────────────────
const loadUserData = async () => {
  try {
    const res = await fetch(`${API_URL}/me`, { headers: getHeaders() })
    if (res.status === 401) { localStorage.removeItem('token'); router.push('/'); return }
    const data = await res.json()
    if (data.success) { user.value = data.data || data; await loadRestaurantes() }
  } catch (e) { console.error('Error al cargar usuario:', e) }
}

const loadRestaurantes = async () => {
  try {
    const res  = await fetch(`${API_URL}/restaurantes`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) {
      userRestaurantes.value = data.data?.restaurantes || []
      const stored = localStorage.getItem('restaurante_activo')
      if (stored && userRestaurantes.value.some(r => r.id === parseInt(stored))) {
        restauranteActivo.value = parseInt(stored)
      } else if (userRestaurantes.value.length > 0) {
        restauranteActivo.value = userRestaurantes.value[0].id
        localStorage.setItem('restaurante_activo', restauranteActivo.value)
      }
    }
  } catch (e) { console.error('Error al cargar restaurantes:', e) }
}

const cambiarRestaurante = async () => {
  if (!restauranteActivo.value) return
  try {
    const res  = await fetch(`${API_URL}/cambiar-restaurante`, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ restaurante_id: restauranteActivo.value }),
    })
    const data = await res.json()
    if (res.ok && data.success) {
      localStorage.setItem('restaurante_activo', restauranteActivo.value)
      window.location.reload()
    }
  } catch (e) { console.error('Error al cambiar restaurante:', e) }
}

const restauranteActivoNombre = computed(() =>
  userRestaurantes.value.find(r => r.id === restauranteActivo.value)?.nombre
  || userRestaurantes.value[0]?.nombre
  || 'Sin restaurante'
)

const seleccionarRestaurante = async (id) => {
  showRestauranteMenu.value = false
  if (id === restauranteActivo.value) return
  restauranteActivo.value = id
  await cambiarRestaurante()
}

// ── Navegación & UI ──────────────────────────────────────
const navigate = (to) => {
  sidebarOpen.value  = false
  showUserMenu.value = false
  if (isMobile.value) sidebarOpen.value = false
  router.push(to)
}

const toggleUserMenu = () => { showUserMenu.value = !showUserMenu.value }

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebar_collapsed', isCollapsed.value)
}

const logout = async () => {
  try { await fetch(`${API_URL}/logout`, { method: 'POST', headers: getHeaders() }) } catch {}
  finally {
    ['token','user','restaurante_activo','user_restaurantes'].forEach(k => {
      localStorage.removeItem(k); sessionStorage.removeItem(k)
    })
    router.push('/')
  }
}

// ── Responsive ───────────────────────────────────────────
const handleResize = () => {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth < 1024
  if (!isMobile.value) {
    const saved = localStorage.getItem('sidebar_collapsed')
    if (saved !== null) isCollapsed.value = saved === 'true'
  } else {
    isCollapsed.value = false
  }
  if (wasMobile && !isMobile.value && sidebarOpen.value) sidebarOpen.value = false
}

onMounted(() => {
  loadUserData()
  window.addEventListener('resize', handleResize)
  const saved = localStorage.getItem('sidebar_collapsed')
  if (saved !== null && !isMobile.value) isCollapsed.value = saved === 'true'
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#user-menu-area'))        showUserMenu.value = false
    if (!e.target.closest('#restaurante-menu-area')) showRestauranteMenu.value = false
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

  <div class="min-h-screen bg-gray-50 flex">

    <!-- OVERLAY MÓVIL -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/50 z-20 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- ══════════════════════════════
         SIDEBAR
    ══════════════════════════════ -->
    <aside
      :class="[
        'fixed top-0 left-0 h-screen flex flex-col z-30 bg-white shadow-xl transition-all duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
      :style="{ width: isCollapsed && !isMobile ? '80px' : '280px' }"
    >

      <!-- ── HEADER / LOGO ── -->
      <div class="h-16 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
        <div class="flex items-center gap-2.5 overflow-hidden">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md shrink-0">
            <i class="fa-solid fa-bowl-food text-white text-sm"></i>
          </div>
          <div v-show="!isCollapsed || isMobile">
            <h1 class="text-sm font-bold text-blue-700 leading-tight whitespace-nowrap">Easy Order</h1>
            <p class="text-[10px] text-gray-400">Sistema de restaurantes</p>
          </div>
        </div>
        <!-- Toggle colapsar (solo desktop) -->
        <button
          v-if="!isMobile"
          @click="toggleCollapse"
          class="hidden lg:flex text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100"
        >
          <i :class="isCollapsed ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-left'" class="text-xs"></i>
        </button>
        <!-- Cerrar (solo móvil) -->
        <button
          v-if="isMobile && sidebarOpen"
          @click="sidebarOpen = false"
          class="lg:hidden text-gray-400 hover:text-gray-600 p-1"
        >
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <!-- ── PERFIL DE USUARIO ── -->
      <div class="p-4 border-b border-gray-100 shrink-0" id="user-menu-area">
        <button
          @click="toggleUserMenu"
          class="w-full flex items-center gap-3 rounded-xl hover:bg-gray-50 transition-all p-1 group"
          :class="{ 'justify-center': isCollapsed && !isMobile }"
        >
          <div class="relative shrink-0">
            <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
              {{ userInitials }}
            </div>
            <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <div v-show="!isCollapsed || isMobile" class="flex-1 min-w-0 text-left">
            <p class="text-sm font-semibold text-gray-800 truncate">{{ user?.name || 'Usuario' }}</p>
            <p class="text-xs text-gray-500">{{ userRoleLabel }}</p>
          </div>
          <i
            v-show="!isCollapsed || isMobile"
            class="fa-solid fa-chevron-down text-gray-400 text-xs transition-transform duration-200"
            :class="showUserMenu ? 'rotate-180' : ''"
          ></i>
        </button>

        <!-- Menú desplegable del usuario -->
        <transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-1"
        >
          <div v-if="showUserMenu && (!isCollapsed || isMobile)" class="mt-1 mx-1 rounded-xl bg-gray-50 overflow-hidden border border-gray-100">
            <button
              @click="navigate('/panel/perfil')"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition text-left"
            >
              <i class="fa-solid fa-user w-4 text-center text-gray-400"></i>
              Mi Perfil
            </button>
            <button
              @click="navigate('/panel/cambiar-password')"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition text-left"
            >
              <i class="fa-solid fa-key w-4 text-center text-gray-400"></i>
              Cambiar Contraseña
            </button>
          </div>
        </transition>
      </div>

      <!-- ── SELECTOR DE RESTAURANTE ── -->
      <div class="px-4 py-3 border-b border-gray-100 shrink-0" id="restaurante-menu-area">
        <p v-show="!isCollapsed || isMobile" class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
          <i class="fa-solid fa-store mr-1"></i> Restaurante
        </p>

        <p v-if="userRestaurantes.length === 0 && (!isCollapsed || isMobile)" class="text-gray-400 text-sm italic px-1">
          Sin restaurante asignado
        </p>

        <div v-else class="relative">
          <button
            @click="showRestauranteMenu = !showRestauranteMenu"
            class="w-full flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 hover:bg-indigo-50 rounded-xl transition-all border border-gray-100"
            :class="{ 'justify-center': isCollapsed && !isMobile }"
          >
            <i class="fa-solid fa-circle-check text-emerald-500 text-xs shrink-0"></i>
            <p v-show="!isCollapsed || isMobile" class="text-gray-700 text-sm font-medium truncate flex-1 text-left">
              {{ restauranteActivoNombre }}
            </p>
            <i
              v-show="!isCollapsed || isMobile"
              class="fa-solid fa-chevron-down text-gray-400 text-xs transition-transform duration-200 shrink-0"
              :class="showRestauranteMenu ? 'rotate-180' : ''"
            ></i>
          </button>

          <transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="showRestauranteMenu && (!isCollapsed || isMobile)" class="mt-1 rounded-xl bg-gray-50 overflow-hidden border border-gray-100">
              <button
                v-for="rest in userRestaurantes"
                :key="rest.id"
                @click="seleccionarRestaurante(rest.id)"
                class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition text-left hover:bg-indigo-50"
                :class="rest.id === restauranteActivo ? 'text-indigo-600 font-semibold' : 'text-gray-600'"
              >
                <i
                  class="fa-solid text-xs w-3"
                  :class="rest.id === restauranteActivo ? 'fa-circle-check text-emerald-500' : 'fa-circle text-gray-300'"
                ></i>
                <span class="truncate">{{ rest.nombre }}</span>
              </button>
            </div>
          </transition>
        </div>
      </div>

      <!-- ── NAVEGACIÓN ── -->
      <nav class="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">

        <template v-for="section in navSections" :key="section.label">

          <!-- Separador / etiqueta de sección -->
          <div v-show="!isCollapsed || isMobile" class="pt-3 pb-1 px-2">
            <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400">{{ section.label }}</p>
          </div>
          <div v-if="isCollapsed && !isMobile" class="border-t border-gray-100 my-2"></div>

          <!-- Items de cada sección -->
          <button
            v-for="item in section.items"
            :key="item.key"
            @click="navigate(item.to)"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left group relative',
              route.path === item.to
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600',
              isCollapsed && !isMobile ? 'justify-center' : ''
            ]"
          >
            <i
              :class="[
                'fa-solid', item.icon, 'text-lg w-5 shrink-0',
                route.path === item.to ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500'
              ]"
            ></i>
            <span v-show="!isCollapsed || isMobile" class="flex-1">{{ item.label }}</span>

            <!-- Tooltip cuando está colapsado -->
            <div
              v-if="isCollapsed && !isMobile"
              class="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50"
            >
              {{ item.label }}
            </div>
          </button>

        </template>
      </nav>

      <!-- ── CERRAR SESIÓN ── -->
      <div class="p-4 border-t border-gray-100 shrink-0">
        <button
          @click="logout"
          :class="[
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 group',
            isCollapsed && !isMobile ? 'justify-center' : ''
          ]"
        >
          <i class="fa-solid fa-right-from-bracket text-lg w-5 shrink-0"></i>
          <span v-show="!isCollapsed || isMobile" class="text-sm font-medium">Cerrar Sesión</span>
          <div
            v-if="isCollapsed && !isMobile"
            class="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50"
          >
            Cerrar Sesión
          </div>
        </button>
      </div>

    </aside>

    <!-- ══════════════════════════════
         CONTENIDO PRINCIPAL
    ══════════════════════════════ -->
    <div
      class="flex-1 flex flex-col min-w-0 transition-all duration-300"
      :style="{ marginLeft: isMobile ? '0' : (isCollapsed ? '80px' : '280px') }"
    >

      <!-- Topbar móvil -->
      <header class="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <button
          @click="sidebarOpen = true"
          class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
        >
          <i class="fa-solid fa-bars"></i>
        </button>
        <span class="font-bold text-gray-800 text-sm">Easy Order</span>
        <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow">
          {{ userInitials }}
        </div>
      </header>

      <!-- Vista hija -->
      <main class="flex-1 p-4 sm:p-6 overflow-auto">
        <router-view />
      </main>

    </div>

  </div>
</template>

<style scoped>
nav::-webkit-scrollbar       { width: 4px; }
nav::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
nav::-webkit-scrollbar-thumb { background: #c7d2fe; border-radius: 10px; }
nav::-webkit-scrollbar-thumb:hover { background: #818cf8; }

.router-link-active,
.router-link-exact-active {
  background-color: rgb(238, 242, 255);
  color: rgb(79, 70, 229);
}

.group { position: relative; }

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>