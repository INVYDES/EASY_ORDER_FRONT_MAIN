<template>
  <div class="max-w-2xl mx-auto space-y-6">

    <!-- TOASTS -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div
        v-for="(toast, index) in toasts"
        :key="toast.id"
        :class="[
          'px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in',
          toast.type === 'success' ? 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800' : '',
          toast.type === 'error'   ? 'bg-red-50 border-l-4 border-red-500 text-red-800'             : '',
          toast.type === 'info'    ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-800'           : '',
          toast.type === 'warning' ? 'bg-amber-50 border-l-4 border-amber-500 text-amber-800'        : '',
        ]"
      >
        <span class="text-lg">
          {{ toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : 'ℹ️' }}
        </span>
        <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
      </div>
    </div>

    <!-- Encabezado -->
    <div>
      <h2 class="text-2xl font-bold text-gray-900">Mi Perfil</h2>
      <p class="text-gray-500 text-sm mt-1">Consulta y actualiza tu información personal</p>
    </div>

    <!-- Tarjeta de perfil -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="h-24 bg-gradient-to-r from-[#1e1b6e] to-[#2d2a9e]"></div>
      <div class="px-6 pb-6">
        <div class="-mt-8 mb-4 flex items-end justify-between">
          <div class="w-16 h-16 rounded-2xl bg-blue-500 ring-4 ring-white flex items-center justify-center text-xl font-bold text-white shadow-lg">
            {{ userInitials }}
          </div>
          <span class="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full" :class="roleBadgeClass">
            {{ userRoleLabel }}
          </span>
        </div>
        <h3 class="text-xl font-bold text-gray-900">{{ user?.name || '—' }}</h3>
        <p class="text-gray-500 text-sm">{{ user?.email || '—' }}</p>
      </div>
    </div>

    <!-- TARJETA DE LICENCIA (solo PROPIETARIO / ADMIN) -->
    <div v-if="['PROPIETARIO', 'ADMIN'].includes(user?.roles?.[0]?.nombre)" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold text-gray-800 flex items-center gap-2">
            <span class="text-xl">📋</span> Licencia actual
          </h3>
          <span
            class="text-xs font-bold px-3 py-1 rounded-full"
            :class="licenciaActiva ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
          >
            {{ licenciaActiva ? 'Activa' : 'Sin licencia' }}
          </span>
        </div>

        <!-- Cargando -->
        <div v-if="loading.licencia" class="text-center py-4 text-gray-400 text-sm">
          Cargando información de licencia...
        </div>

        <!-- Con licencia -->
        <div v-else-if="licenciaActiva" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-gray-50 rounded-xl p-4">
              <p class="text-xs text-gray-500 font-medium">Tipo</p>
              <p class="text-base font-bold text-gray-900 mt-1">{{ licenciaActiva.tipo }}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-4">
              <p class="text-xs text-gray-500 font-medium">Plan</p>
              <p class="text-base font-bold text-gray-900 mt-1">{{ licenciaActiva.nombre }}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-4">
              <p class="text-xs text-gray-500 font-medium">Restaurantes</p>
              <p class="text-base font-bold text-gray-900 mt-1">{{ licenciaActiva.max_restaurantes }}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-4">
              <p class="text-xs text-gray-500 font-medium">Usuarios</p>
              <p class="text-base font-bold text-gray-900 mt-1">{{ licenciaActiva.max_usuarios }}</p>
            </div>
          </div>

          <!-- Barra días restantes -->
          <div class="bg-amber-50 rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <p class="text-sm font-medium text-amber-800">Días restantes</p>
              <span class="text-xs font-semibold bg-white px-2 py-1 rounded-full text-amber-700">
                {{ licenciaActiva.dias_restantes }} días
              </span>
            </div>
            <div class="w-full bg-amber-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :class="licenciaActiva.dias_restantes > 10 ? 'bg-amber-500' : 'bg-red-500'"
                :style="{ width: porcentajeLicencia + '%' }"
              ></div>
            </div>
            <p class="text-xs text-amber-600 mt-2">Expira el {{ formatDate(licenciaActiva.fecha_expiracion) }}</p>
          </div>

          <!-- Botón gestionar -->
          <button
            @click="router.push('/panel/licencias')"
            class="w-full py-2.5 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition"
          >
            Gestionar licencia →
          </button>
        </div>

        <!-- Sin licencia -->
        <div v-else class="text-center py-8">
          <span class="text-4xl mb-3 block">📭</span>
          <p class="text-gray-500 text-sm">No tienes una licencia activa</p>
          <button
            @click="router.push('/panel/licencias')"
            class="mt-3 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition"
          >
            Ver planes disponibles
          </button>
        </div>
      </div>
    </div>

    <!-- Formulario de edición -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h4 class="text-base font-semibold text-gray-800 mb-5">Información personal</h4>

      <form @submit.prevent="handleGuardar" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
          <input v-model="form.name" type="text" required
            class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <input v-model="form.email" type="email" required
            class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
          <input v-model="form.username" type="text"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" />
        </div>
        <div class="pt-2">
          <button type="submit" :disabled="loading.guardar"
            class="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
            {{ loading.guardar ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Cambiar contraseña -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h4 class="text-base font-semibold text-gray-800 mb-1">Cambiar contraseña</h4>
      <p class="text-gray-500 text-sm mb-5">Usa una contraseña segura de al menos 8 caracteres</p>

      <form @submit.prevent="handleCambiarPassword" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
          <div class="relative">
            <input v-model="passForm.current" :type="showPass.current ? 'text' : 'password'" required
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm pr-20" />
            <button type="button" @click="showPass.current = !showPass.current"
              class="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600">
              {{ showPass.current ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
          <div class="relative">
            <input v-model="passForm.new" :type="showPass.new ? 'text' : 'password'" required minlength="8"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm pr-20" />
            <button type="button" @click="showPass.new = !showPass.new"
              class="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600">
              {{ showPass.new ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
          <input v-model="passForm.confirm" type="password" required
            class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" />
        </div>
        <div class="pt-2">
          <button type="submit" :disabled="loading.password"
            class="px-6 py-2.5 bg-gray-800 text-white text-sm font-medium rounded-xl hover:bg-gray-900 transition disabled:opacity-50">
            {{ loading.password ? 'Actualizando...' : 'Cambiar contraseña' }}
          </button>
        </div>
      </form>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_URL } from '@/config/api'
const router  = useRouter()

// ── Estado ────────────────────────────────────────────────────────────────────
const user           = ref(null)
const licenciaActiva = ref(null)
const toasts         = ref([])

const loading = reactive({ guardar: false, password: false, licencia: false, perfil: false })
const form     = reactive({ name: '', email: '', username: '' })
const passForm = reactive({ current: '', new: '', confirm: '' })
const showPass = reactive({ current: false, new: false })

// ── Computed ──────────────────────────────────────────────────────────────────
const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  return user.value.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
})

const userRoleLabel = computed(() => {
  const map = {
    PROPIETARIO: 'Propietario', ADMIN: 'Administrador',
    MESERO: 'Mesero',           COCINA: 'Cocina',
    CAJA: 'Caja',               BARRA: 'Barra',
    CLIENTE: 'Cliente',
  }
  return map[user.value?.roles?.[0]?.nombre] || 'Usuario'
})

const roleBadgeClass = computed(() => {
  const map = {
    PROPIETARIO: 'bg-indigo-100 text-indigo-700', ADMIN: 'bg-blue-100 text-blue-700',
    MESERO: 'bg-amber-100 text-amber-700',        COCINA: 'bg-orange-100 text-orange-700',
    CAJA: 'bg-green-100 text-green-700',          BARRA: 'bg-pink-100 text-pink-700',
    CLIENTE: 'bg-teal-100 text-teal-700',
  }
  return map[user.value?.roles?.[0]?.nombre] || 'bg-gray-100 text-gray-600'
})

const porcentajeLicencia = computed(() => {
  if (!licenciaActiva.value?.dias_restantes) return 0
  const total = licenciaActiva.value.tipo === 'ANUAL' ? 365 : 30
  return Math.min(100, Math.max(0, Math.round((licenciaActiva.value.dias_restantes / total) * 100)))
})

// ── Toasts ────────────────────────────────────────────────────────────────────
const showToast = (message, type = 'info', duration = 5000) => {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  if (duration > 0) setTimeout(() => removeToast(id), duration)
}

const removeToast = (id) => {
  const i = toasts.value.findIndex(t => t.id === id)
  if (i !== -1) toasts.value.splice(i, 1)
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: token ? `Bearer ${token}` : '' }
}

const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ── API ───────────────────────────────────────────────────────────────────────
const loadUser = async () => {
  loading.perfil = true
  try {
    const res  = await fetch(`${API_URL}/me`, { headers: getHeaders() })
    if (res.status === 401) {
      showToast('Sesión expirada', 'error')
      localStorage.removeItem('token'); sessionStorage.removeItem('token')
      router.push('/')
      return
    }
    const data = await res.json()
    if (data.success) {
      user.value     = data.data || data
      form.name      = user.value.name     || ''
      form.email     = user.value.email    || ''
      form.username  = user.value.username || ''
    }
  } catch (e) {
    showToast('Error al cargar el perfil', 'error')
  } finally {
    loading.perfil = false
  }
}

const loadLicencia = async () => {
  // Solo propietarios tienen licencia
  const rol = user.value?.roles?.[0]?.nombre
  if (!user.value?.propietario_id && rol !== 'PROPIETARIO') {
    licenciaActiva.value = null
    return
  }

  loading.licencia = true
  try {
    const propietarioId = user.value.propietario_id || user.value.id
    const res  = await fetch(`${API_URL}/propietarios/${propietarioId}/licencias-activas`, { headers: getHeaders() })
    const data = await res.json()

    if (data.success && data.data?.length > 0) {
      const lic = data.data[0]
      licenciaActiva.value = {
        id:               lic.id,
        nombre:           lic.licencia?.nombre   || lic.nombre,
        tipo:             lic.licencia?.tipo      || lic.tipo,
        max_restaurantes: lic.licencia?.max_restaurantes ?? lic.max_restaurantes,
        max_usuarios:     lic.licencia?.max_usuarios     ?? lic.max_usuarios,
        fecha_inicio:     lic.fecha_inicio,
        fecha_expiracion: lic.fecha_expiracion,
        dias_restantes:   Math.max(0, Math.floor(
          (new Date(lic.fecha_expiracion) - new Date()) / (1000 * 60 * 60 * 24)
        )),
      }
    } else {
      licenciaActiva.value = null
    }
  } catch (e) {
    console.error('Error licencia:', e)
    licenciaActiva.value = null
  } finally {
    loading.licencia = false
  }
}

const handleGuardar = async () => {
  loading.guardar = true
  try {
    const res  = await fetch(`${API_URL}/user/profile`, {
      method: 'PUT', headers: getHeaders(),
      body: JSON.stringify({ name: form.name, email: form.email, username: form.username }),
    })
    const data = await res.json()

    if (res.ok && data.success) {
      showToast('Perfil actualizado correctamente', 'success')
      user.value = { ...user.value, ...form }
      // Actualizar storage
      const key     = localStorage.getItem('user') ? 'localStorage' : 'sessionStorage'
      const stored  = JSON.parse((key === 'localStorage' ? localStorage : sessionStorage).getItem('user') || '{}')
      const updated = { ...stored, name: form.name, email: form.email, username: form.username }
      ;(key === 'localStorage' ? localStorage : sessionStorage).setItem('user', JSON.stringify(updated))
    } else {
      const msg = data.errors
        ? Object.values(data.errors).flat().join(' · ')
        : (data.message || 'Error al actualizar perfil')
      showToast(msg, 'error')
    }
  } catch (e) {
    showToast('Error de conexión', 'error')
  } finally {
    loading.guardar = false
  }
}

const handleCambiarPassword = async () => {
  if (passForm.new !== passForm.confirm) { showToast('Las contraseñas no coinciden', 'error'); return }
  if (passForm.new.length < 8)           { showToast('Mínimo 8 caracteres', 'error'); return }

  loading.password = true
  try {
    const res  = await fetch(`${API_URL}/user/password`, {
      method: 'PUT', headers: getHeaders(),
      body: JSON.stringify({
        current_password:      passForm.current,
        password:              passForm.new,
        password_confirmation: passForm.confirm,
      }),
    })
    const data = await res.json()

    if (res.ok && data.success) {
      showToast('Contraseña actualizada correctamente', 'success')
      passForm.current = ''; passForm.new = ''; passForm.confirm = ''
    } else {
      showToast(data.message || 'Error al cambiar contraseña', 'error')
    }
  } catch (e) {
    showToast('Error de conexión', 'error')
  } finally {
    loading.password = false
  }
}

onMounted(async () => {
  await loadUser()
  await loadLicencia()
})
</script>

<style scoped>
.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
</style>