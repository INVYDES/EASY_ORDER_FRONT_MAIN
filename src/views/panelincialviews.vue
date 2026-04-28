<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppSidebar from '../components/layout/AppSidebar.vue'
import { API_URL } from '@/config/api'

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

// ── Permisos por rol (lógica original) ───────
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
    if (data.success) { 
      user.value = data.data || data
      await loadRestaurantes() 
    }
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
      method: 'POST', 
      headers: getHeaders(),
      body: JSON.stringify({ restaurante_id: restauranteActivo.value }),
    })
    const data = await res.json()
    if (res.ok && data.success) {
      localStorage.setItem('restaurante_activo', restauranteActivo.value)
      window.location.reload()
    }
  } catch (e) { console.error('Error al cambiar restaurante:', e) }
}

const seleccionarRestaurante = async (id) => {
  if (id === restauranteActivo.value) return
  restauranteActivo.value = id
  await cambiarRestaurante()
}

// ── Navegación & UI ──────────────────────────────────────
const handleSidebarClose = () => {
  sidebarOpen.value = false
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleResize = () => {
  isMobile.value = window.innerWidth < 1024
  if (!isMobile.value) sidebarOpen.value = false
}

onMounted(() => {
  loadUserData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

  <div class="min-h-screen bg-gray-50 flex">

    <!-- SIDEBAR NUEVO (Con datos conectados) -->
    <AppSidebar 
      :is-open="sidebarOpen" 
      :user="user"
      :restaurantes="userRestaurantes"
      :restaurante-activo="restauranteActivo"
      @close="handleSidebarClose" 
      @seleccionar-restaurante="seleccionarRestaurante"
    />

    <!-- CONTENIDO PRINCIPAL -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      
      <!-- Navbar superior móvil -->
      <header class="lg:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 shrink-0 z-20">
        <div class="flex items-center gap-3">
          <button @click="toggleSidebar" class="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <i class="fa-solid fa-bars-staggered"></i>
          </button>
          <span class="font-bold text-blue-700">Easy Order</span>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8">
        <router-view v-slot="{ Component }">
          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

    </div>
  </div>
</template>