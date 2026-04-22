<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const router = useRouter()
const route = useRoute()

const user = ref(null)
const userRestaurantes = ref([])
const restauranteActivo = ref(null)
const sidebarOpen = ref(false)
const showUserMenu = ref(false)
const showRestauranteMenu = ref(false)

const rolePermissions = {
  mesero:    ['PROPIETARIO', 'ADMIN', 'MESERO'],
  cliente:      ['CLIENTE'],                          // ← solo rol CLIENTE ve el menú
  admin:     ['PROPIETARIO', 'ADMIN'],
  caja:      ['PROPIETARIO', 'ADMIN', 'CAJA'],
  cocina:    ['PROPIETARIO', 'ADMIN', 'COCINA'],
  productos: ['PROPIETARIO', 'ADMIN', 'CAJA', 'MESERO'],
  barra:        ['PROPIETARIO', 'ADMIN', 'BARRA'],
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

const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  return user.value.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
})

const userRoleLabel = computed(() => {
  const map = {
    PROPIETARIO: 'Propietario', ADMIN: 'Administrador',
    MESERO: 'Mesero', COCINA: 'Cocina', CAJA: 'Caja', BARRA: 'Barra',
    CLIENTE: 'Cliente',
  }
  return map[user.value?.roles?.[0]?.nombre] || 'Usuario'
})

const navItems = computed(() => [
  { key: 'mesero',    to: '/panel/mesero',    label: 'Mesero',         icon: 'fa-utensils' },
  { key: 'cliente',   to: '/panel/cliente',   label: 'Menú',           icon: 'fa-utensils' },
  { key: 'admin',     to: '/panel/admin',     label: 'Administración', icon: 'fa-gear' },
  { key: 'caja',      to: '/panel/caja',      label: 'Caja',           icon: 'fa-cash-register' },
  { key: 'cocina',    to: '/panel/cocina',    label: 'Cocina',         icon: 'fa-fire-burner' },
  { key: 'productos', to: '/panel/productos', label: 'Productos',      icon: 'fa-box' },
  { key: 'barra',        to: '/panel/barra',        label: 'Barra',          icon: 'fa-martini-glass' },

].filter(item => canView(item.key)))

const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

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
    const res = await fetch(`${API_URL}/restaurantes`, { headers: getHeaders() })
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
    const res = await fetch(`${API_URL}/cambiar-restaurante`, {
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

const logout = async () => {
  try { await fetch(`${API_URL}/logout`, { method: 'POST', headers: getHeaders() }) } catch {}
  finally {
    ['token','user','restaurante_activo','user_restaurantes'].forEach(k => {
      localStorage.removeItem(k); sessionStorage.removeItem(k)
    })
    router.push('/')
  }
}

const restauranteActivoNombre = computed(() => {
  const r = userRestaurantes.value.find(r => r.id === restauranteActivo.value)
  return r?.nombre || userRestaurantes.value[0]?.nombre || 'Sin restaurante'
})

const seleccionarRestaurante = async (id) => {
  showRestauranteMenu.value = false
  if (id === restauranteActivo.value) return
  restauranteActivo.value = id
  await cambiarRestaurante()
}

const navigate = (to) => {
  sidebarOpen.value = false
  showUserMenu.value = false
  router.push(to)
}

const toggleUserMenu = () => { showUserMenu.value = !showUserMenu.value }

onMounted(() => {
  loadUserData()
  // Cerrar menú usuario al hacer click fuera
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#user-menu-area')) showUserMenu.value = false
    if (!e.target.closest('#restaurante-menu-area')) showRestauranteMenu.value = false
  })
})
</script>

<template>
  <!-- FontAwesome -->
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
        'fixed top-0 left-0 h-screen w-72 flex flex-col z-30 transition-transform duration-300 shadow-2xl',
        'bg-gradient-to-b from-[#1e1b6e] via-[#2d2a9e] to-[#1e1b6e]',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ''
      ]"
    >

      <!-- LOGO -->
      <div class="px-6 pt-6 pb-5 border-b border-white/10">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <i class="fa-solid fa-bowl-food text-white text-sm"></i>
          </div>
          <div>
            <h1 class="text-base font-bold text-white leading-tight">Easy Order</h1>
            <p class="text-blue-300 text-[11px]">Sistema de restaurantes</p>
          </div>
        </div>
      </div>

      <!-- PERFIL DE USUARIO -->
      <div class="px-4 py-4 border-b border-white/10" id="user-menu-area">

        <!-- Tarjeta de usuario -->
        <button
          @click="toggleUserMenu"
          class="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 transition-all group"
        >
          <div class="w-11 h-11 rounded-full bg-blue-500 ring-2 ring-blue-300/40 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-lg">
            {{ userInitials }}
          </div>
          <div class="min-w-0 flex-1 text-left">
            <p class="text-sm font-semibold text-white truncate">{{ user?.name || 'Usuario' }}</p>
            <p class="text-xs text-blue-300">{{ userRoleLabel }}</p>
          </div>
          <i
            class="fa-solid fa-chevron-down text-blue-300 text-xs transition-transform duration-200"
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
          <div v-if="showUserMenu" class="mt-1 mx-1 rounded-xl bg-white/10 overflow-hidden">
            <button
              @click="navigate('/panel/perfil')"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-blue-100 hover:bg-white/10 transition text-left"
            >
              <i class="fa-solid fa-user w-4 text-center text-blue-300"></i>
              Mi Perfil
            </button>
            <button
              @click="navigate('/panel/cambiar-password')"
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-blue-100 hover:bg-white/10 transition text-left"
            >
              <i class="fa-solid fa-key w-4 text-center text-blue-300"></i>
              Cambiar Contraseña
            </button>
          </div>
        </transition>

      </div>

      <!-- SELECTOR DE RESTAURANTE -->
      <div class="px-4 py-3.5 border-b border-white/10" id="restaurante-menu-area">
        <p class="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">
          <i class="fa-solid fa-store mr-1"></i> Restaurante
        </p>

        <!-- Sin restaurante -->
        <p v-if="userRestaurantes.length === 0" class="text-blue-400 text-sm italic px-1">
          Sin restaurante asignado
        </p>

        <!-- Con restaurantes — siempre clickeable -->
        <div v-else class="relative">
          <button
            @click="showRestauranteMenu = !showRestauranteMenu"
            class="w-full flex items-center gap-2.5 px-3 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl transition-all"
          >
            <i class="fa-solid fa-circle-check text-green-400 text-xs shrink-0"></i>
            <p class="text-white text-sm font-medium truncate flex-1 text-left">
              {{ restauranteActivoNombre }}
            </p>
            <i
              class="fa-solid fa-chevron-down text-blue-300 text-xs transition-transform duration-200 shrink-0"
              :class="showRestauranteMenu ? 'rotate-180' : ''"
            ></i>
          </button>

          <!-- Dropdown de restaurantes -->
          <transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="showRestauranteMenu" class="mt-1 rounded-xl bg-white/10 overflow-hidden">
              <button
                v-for="rest in userRestaurantes"
                :key="rest.id"
                @click="seleccionarRestaurante(rest.id)"
                class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition text-left hover:bg-white/10"
                :class="rest.id === restauranteActivo ? 'text-white font-semibold' : 'text-blue-200'"
              >
                <i
                  class="fa-solid text-xs w-3"
                  :class="rest.id === restauranteActivo ? 'fa-circle-check text-green-400' : 'fa-circle text-blue-400/50'"
                ></i>
                <span class="truncate">{{ rest.nombre }}</span>
              </button>
            </div>
          </transition>
        </div>
      </div>

      <!-- NAVEGACIÓN -->
      <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p class="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-3 mb-3">
          Navegación
        </p>

        <template v-for="item in navItems" :key="item.key">
          <!-- Separador de grupo -->
          <div v-if="item.separator" class="pt-3 pb-1 px-3">
            <div class="border-t border-white/10"></div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-blue-400 mt-3">Gestión</p>
          </div>
          <button
            @click="navigate(item.to)"
            :class="[
              'w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left',
              route.path === item.to
                ? 'bg-white text-[#1e1b6e] shadow-lg shadow-black/20'
                : 'text-blue-100 hover:bg-white/10 hover:text-white'
            ]"
          >
            <i
              :class="[
                'fa-solid', item.icon, 'w-4 text-center text-sm shrink-0',
                route.path === item.to ? 'text-[#2d2a9e]' : 'text-blue-300'
              ]"
            ></i>
            <span class="flex-1">{{ item.label }}</span>
            <span
              v-if="route.path === item.to"
              class="w-2 h-2 rounded-full bg-[#2d2a9e] shrink-0"
            />
          </button>
        </template>
      </nav>

      <!-- CERRAR SESIÓN -->
      <div class="px-4 pb-5 pt-2 border-t border-white/10">
        <button
          @click="logout"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all"
        >
          <i class="fa-solid fa-right-from-bracket w-4 text-center"></i>
          Cerrar sesión
        </button>
      </div>

    </aside>

    <!-- ══════════════════════════════
         CONTENIDO PRINCIPAL
    ══════════════════════════════ -->
    <div class="flex-1 flex flex-col min-w-0 lg:ml-72">

      <!-- Topbar móvil -->
      <header class="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button
          @click="sidebarOpen = true"
          class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
        >
          <i class="fa-solid fa-bars"></i>
        </button>
        <span class="font-bold text-gray-800 text-sm">Easy Order</span>
        <div class="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
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