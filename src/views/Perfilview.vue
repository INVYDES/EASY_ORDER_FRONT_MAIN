<template>
  <div class="max-w-2xl mx-auto space-y-6">

    <!-- TOASTS -->
    <div class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in pointer-events-auto border',
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : '',
          toast.type === 'error'   ? 'bg-red-50 border-red-500 text-red-800'             : '',
          toast.type === 'info'    ? 'bg-blue-50 border-blue-500 text-blue-800'           : '',
          toast.type === 'warning' ? 'bg-amber-50 border-amber-500 text-amber-800'        : '',
        ]"
      >
        <i :class="[
          'text-lg shrink-0',
          toast.type === 'success' ? 'fa-solid fa-circle-check text-emerald-600' :
          toast.type === 'error'   ? 'fa-solid fa-circle-xmark text-red-600' :
          toast.type === 'warning' ? 'fa-solid fa-triangle-exclamation text-amber-600' :
          'fa-solid fa-circle-info text-blue-600'
        ]"></i>
        <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
      </div>
    </div>

    <!-- Encabezado -->
    <div>
      <h2 class="text-2xl font-bold text-[#202723] tracking-tight">Mi Perfil</h2>
      <p class="text-[#68736C] text-sm mt-1">Consulta y actualiza tu información personal</p>
    </div>

    <!-- Tarjeta de perfil -->
    <div class="bg-white rounded-2xl shadow-xs border border-[#DDE3DE] overflow-hidden">
      <div class="h-24 bg-gradient-to-r from-[#245C4F] to-[#1D4A3F]"></div>
      <div class="px-6 pb-6">
        <div class="-mt-8 mb-4 flex items-end justify-between">
          <div class="w-16 h-16 rounded-2xl bg-[#245C4F] ring-4 ring-white flex items-center justify-center text-xl font-bold text-white shadow-md">
            {{ userInitials }}
          </div>
          <span class="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full" :class="roleBadgeClass">
            {{ userRoleLabel }}
          </span>
        </div>
        <h3 class="text-xl font-bold text-[#202723]">{{ user?.name || '—' }}</h3>
        <p class="text-[#68736C] text-sm">{{ user?.email || '—' }}</p>
      </div>
    </div>

    <!-- TARJETA DE LICENCIA (solo PROPIETARIO / ADMIN) -->
    <div v-if="['PROPIETARIO', 'ADMIN'].includes(typeof user?.roles?.[0] === 'string' ? user.roles[0] : user?.roles?.[0]?.nombre)" class="bg-white rounded-2xl shadow-xs border border-[#DDE3DE] overflow-hidden">
      <div class="px-6 py-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-[#202723] flex items-center gap-2">
            <i class="fa-solid fa-id-card text-[#245C4F]"></i> Licencia actual
          </h3>
          <span
            class="text-xs font-bold px-3 py-1 rounded-full"
            :class="licenciaActiva ? 'bg-[#E8F1ED] text-[#245C4F]' : 'bg-amber-100 text-amber-700'"
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
            <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p class="text-xs text-gray-500 font-medium">Tipo</p>
              <p class="text-base font-bold text-gray-900 mt-1">{{ licenciaActiva.tipo }}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p class="text-xs text-gray-500 font-medium">Plan</p>
              <p class="text-base font-bold text-gray-900 mt-1">{{ licenciaActiva.nombre }}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p class="text-xs text-gray-500 font-medium">Restaurantes</p>
              <p class="text-base font-bold text-gray-900 mt-1">{{ licenciaActiva.max_restaurantes }}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p class="text-xs text-gray-500 font-medium">Usuarios</p>
              <p class="text-base font-bold text-gray-900 mt-1">{{ licenciaActiva.max_usuarios }}</p>
            </div>
          </div>

          <!-- Barra días restantes -->
          <div class="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <div class="flex items-center justify-between mb-2">
              <p class="text-sm font-medium text-amber-800">Días restantes</p>
              <span class="text-xs font-semibold bg-white px-2 py-1 rounded-full text-amber-700">
                {{ licenciaActiva.dias_restantes }} días
              </span>
            </div>
            <div class="w-full bg-amber-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :class="licenciaActiva.dias_restantes > 10 ? 'bg-[#245C4F]' : 'bg-red-500'"
                :style="{ width: porcentajeLicencia + '%' }"
              ></div>
            </div>
            <p class="text-xs text-amber-700 mt-2">Expira el {{ formatDate(licenciaActiva.fecha_expiracion) }}</p>
          </div>

          <!-- Botón gestionar -->
          <button
            @click="router.push('/panel/licencias')"
            class="w-full py-2.5 text-sm font-semibold text-[#245C4F] border border-[#245C4F]/30 rounded-xl hover:bg-[#E8F1ED] transition flex items-center justify-center gap-2"
          >
            Gestionar licencia <i class="fa-solid fa-arrow-right text-xs"></i>
          </button>
        </div>

        <!-- Sin licencia -->
        <div v-else class="text-center py-8">
          <i class="fa-solid fa-box-open text-4xl mb-3 block text-gray-300"></i>
          <p class="text-gray-500 text-sm">No tienes una licencia activa</p>
          <button
            @click="router.push('/panel/licencias')"
            class="mt-3 px-5 py-2.5 bg-[#245C4F] text-white text-sm font-semibold rounded-xl hover:bg-[#1D4A3F] transition shadow-xs"
          >
            Ver planes disponibles
          </button>
        </div>
      </div>
    </div>

    <!-- Formulario de edición -->
    <div class="bg-white rounded-2xl shadow-xs border border-[#DDE3DE] p-6">
      <h4 class="text-base font-bold text-[#202723] mb-5">Información personal</h4>

      <form @submit.prevent="handleGuardar" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
          <input v-model="form.name" type="text" required
            class="w-full px-4 py-2.5 bg-white border border-[#DDE3DE] rounded-xl focus:ring-2 focus:ring-[#245C4F] focus:outline-none text-sm text-[#202723]" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <input v-model="form.email" type="email" required
            class="w-full px-4 py-2.5 bg-white border border-[#DDE3DE] rounded-xl focus:ring-2 focus:ring-[#245C4F] focus:outline-none text-sm text-[#202723]" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
          <input v-model="form.username" type="text"
            class="w-full px-4 py-2.5 bg-white border border-[#DDE3DE] rounded-xl focus:ring-2 focus:ring-[#245C4F] focus:outline-none text-sm text-[#202723]" />
        </div>
        <div class="pt-2">
          <button type="submit" :disabled="loading.guardar"
            class="px-6 py-2.5 bg-[#245C4F] text-white text-sm font-semibold rounded-xl hover:bg-[#1D4A3F] transition shadow-xs disabled:opacity-50">
            {{ loading.guardar ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Cambiar contraseña -->
    <div class="bg-white rounded-2xl shadow-xs border border-[#DDE3DE] p-6">
      <h4 class="text-base font-bold text-[#202723] mb-1">Cambiar contraseña</h4>
      <p class="text-[#68736C] text-sm mb-5">Usa una contraseña segura de al menos 8 caracteres</p>

      <form @submit.prevent="handleCambiarPassword" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
          <div class="relative">
            <input v-model="passForm.current" :type="showPass.current ? 'text' : 'password'" required
              class="w-full px-4 py-2.5 bg-white border border-[#DDE3DE] rounded-xl focus:ring-2 focus:ring-[#245C4F] focus:outline-none text-sm pr-20 text-[#202723]" />
            <button type="button" @click="showPass.current = !showPass.current"
              class="absolute right-3 top-2.5 text-xs text-[#68736C] hover:text-[#202723] font-semibold">
              {{ showPass.current ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
          <div class="relative">
            <input v-model="passForm.new" :type="showPass.new ? 'text' : 'password'" required minlength="8"
              class="w-full px-4 py-2.5 bg-white border border-[#DDE3DE] rounded-xl focus:ring-2 focus:ring-[#245C4F] focus:outline-none text-sm pr-20 text-[#202723]" />
            <button type="button" @click="showPass.new = !showPass.new"
              class="absolute right-3 top-2.5 text-xs text-[#68736C] hover:text-[#202723] font-semibold">
              {{ showPass.new ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
          <input v-model="passForm.confirm" type="password" required
            class="w-full px-4 py-2.5 bg-white border border-[#DDE3DE] rounded-xl focus:ring-2 focus:ring-[#245C4F] focus:outline-none text-sm text-[#202723]" />
        </div>
        <div class="pt-2">
          <button type="submit" :disabled="loading.password"
            class="px-6 py-2.5 bg-[#202723] text-white text-sm font-semibold rounded-xl hover:bg-black transition shadow-xs disabled:opacity-50">
            {{ loading.password ? 'Actualizando...' : 'Cambiar contraseña' }}
          </button>
        </div>
      </form>
    </div>

  </div>
</template>

<script setup>
import { sessionGet, sessionSet, sessionRemove } from '@/utils/session'
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiClient } from '@/utils/apiClient'
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
  const roleRaw = user.value?.roles?.[0]
  const role = typeof roleRaw === 'string' ? roleRaw : roleRaw?.nombre
  return map[role?.toUpperCase()] || role || 'Usuario'
})

const roleBadgeClass = computed(() => {
  const map = {
    PROPIETARIO: 'bg-[#E8F1ED] text-[#245C4F]',   ADMIN: 'bg-blue-100 text-blue-700',
    MESERO: 'bg-amber-100 text-amber-700',        COCINA: 'bg-orange-100 text-orange-700',
    CAJA: 'bg-emerald-100 text-emerald-700',      BARRA: 'bg-pink-100 text-pink-700',
    CLIENTE: 'bg-teal-100 text-teal-700',
  }
  const roleRaw = user.value?.roles?.[0]
  const role = typeof roleRaw === 'string' ? roleRaw : roleRaw?.nombre
  return map[role?.toUpperCase()] || 'bg-gray-100 text-gray-600'
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
  const token = sessionGet('token')
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
    const data = await apiClient.get('/me')
    if (data?.success) {
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
  const roleRaw = user.value?.roles?.[0]
  const rol = typeof roleRaw === 'string' ? roleRaw : roleRaw?.nombre
  if (!user.value?.propietario_id && rol !== 'PROPIETARIO') {
    licenciaActiva.value = null
    return
  }

  loading.licencia = true
  try {
    const propietarioId = user.value.propietario_id || user.value.id
    const data = await apiClient.get(`/propietarios/${propietarioId}/licencias-activas`)

    if (data?.success && data.data?.length > 0) {
      const lic = data.data[0]
      licenciaActiva.value = {
        id:               lic.id,
        nombre:           lic.licencia?.nombre   || lic.nombre,
        tipo:             lic.licencia?.tipo      || lic.tipo,
        max_restaurantes: lic.licencia?.max_restaurantes ?? lic.max_restaurantes,
        max_usuarios:     lic.licencia?.max_usuarios     ?? lic.max_usuarios,
        fecha_inicio:     lic.fecha_inicio,
        fecha_expiracion: lic.fecha_expiracion,
        dias_restantes:   lic.dias_restantes,
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
    const data = await apiClient.put('/user/profile', { name: form.name, email: form.email, username: form.username })

    if (data?.success) {
      showToast('Perfil actualizado correctamente', 'success')
      user.value = { ...user.value, ...form }
      // Actualizar storage
      const stored  = JSON.parse(sessionGet('user') || '{}')
      const updated = { ...stored, name: form.name, email: form.email, username: form.username }
      sessionSet('user', JSON.stringify(updated))
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
    const data = await apiClient.put('/user/password', {
      current_password:      passForm.current,
      password:              passForm.new,
      password_confirmation: passForm.confirm,
    })

    if (data?.success) {
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