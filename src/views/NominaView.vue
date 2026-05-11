<template>
  <div class="min-h-screen bg-gray-50/50 p-4 lg:p-8">
    <!-- TOASTS -->
    <div class="fixed top-4 right-4 z-[200] space-y-2 pointer-events-none">
      <div v-for="toast in toasts" :key="toast.id"
        :class="['px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-72 pointer-events-auto animate-slide-in',
          toast.type === 'success' ? 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800'
                                   : 'bg-red-50 border-l-4 border-red-500 text-red-800']">
        <span>{{ toast.type === 'success' ? '✅' : '❌' }}</span>
        <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
      </div>
    </div>
    <!-- Overlay de Autenticación -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="!isAuthenticated" class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm px-4">
        <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
              🔐
            </div>
            <h2 class="text-2xl font-bold text-gray-900">Acceso Restringido</h2>
            <p class="text-gray-500 text-sm mt-2">Por seguridad, ingresa tu contraseña para ver la información de nómina.</p>
          </div>

          <form @submit.prevent="verifyPassword" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Contraseña de Administrador</label>
              <input 
                v-model="password" 
                type="password" 
                placeholder="••••••••" 
                required
                class="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-lg"
                :disabled="verifying"
              />
            </div>

            <p v-if="authError" class="text-sm text-red-500 text-center font-medium">{{ authError }}</p>

            <button 
              type="submit" 
              :disabled="verifying"
              class="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span v-if="verifying" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ verifying ? 'Verificando...' : 'Desbloquear Nómina' }}
            </button>
          </form>
        </div>
      </div>
    </transition>

    <div v-if="isAuthenticated" class="max-w-7xl mx-auto space-y-8">
      <!-- Encabezado -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight">Gestión de Nóminas</h1>
          <p class="text-gray-500 mt-1">Control de pagos, periodos y compensaciones para el personal.</p>
        </div>
        <button 
          @click="showGenerateModal = true"
          class="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition flex items-center gap-2 w-fit"
        >
          <span>➕</span> Generar Nómina
        </button>
      </div>

      <!-- Resumen de KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Pendiente (Mes)</p>
          <p class="text-3xl font-black text-gray-900">${{ stats.total_mes.toLocaleString() }}</p>
          <div class="mt-2 flex items-center gap-1 text-xs text-amber-600 font-bold">
             <span>⏳</span> {{ stats.pendientes }} pagos pendientes
          </div>
        </div>
        <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Última Nómina Pagada</p>
          <p class="text-3xl font-black text-gray-900">${{ stats.ultima_nomina.toLocaleString() }}</p>
          <div class="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-bold">
             <span>✅</span> Completada el {{ stats.ultima_fecha }}
          </div>
        </div>
        <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Personal Activo</p>
          <p class="text-3xl font-black text-gray-900">{{ stats.empleados_activos }}</p>
          <div class="mt-2 flex items-center gap-1 text-xs text-indigo-600 font-bold">
             <span>👥</span> Listos para el próximo periodo
          </div>
        </div>
      </div>

      <!-- Tabla de Nóminas -->
      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 class="font-bold text-gray-800">Historial de Pagos</h3>
          <div class="flex items-center gap-2">
            <select v-model="filterYear" class="bg-gray-50 border-none rounded-xl text-xs font-bold px-4 py-2 focus:ring-2 focus:ring-indigo-500">
              <option :value="2024">2024</option>
              <option :value="2025">2025</option>
              <option :value="2026">2026</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th class="px-6 py-4">Periodo</th>
                <th class="px-6 py-4">Personal</th>
                <th class="px-6 py-4">Total</th>
                <th class="px-6 py-4">Estado</th>
                <th class="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 text-sm">
              <tr v-if="loading" class="animate-pulse">
                <td colspan="5" class="px-6 py-8 text-center text-gray-400 italic">Cargando registros...</td>
              </tr>
              <tr v-else-if="nominas.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-400 italic">No se han generado nóminas para este año.</td>
              </tr>
              <tr v-for="n in nominas" :key="n.id" class="hover:bg-gray-50/50 transition">
                <td class="px-6 py-4">
                  <p class="font-bold text-gray-800">{{ formatDateRange(n.periodo_inicio, n.periodo_fin) }}</p>
                  <p class="text-[10px] text-gray-400 font-medium">ID: #{{ n.id }}</p>
                </td>
                <td class="px-6 py-4 text-gray-600">
                  <span class="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-xs">
                    {{ n.detalles_count || 0 }} empleados
                  </span>
                </td>
                <td class="px-6 py-4 font-black text-gray-900">
                  ${{ Number(n.monto_total || 0).toLocaleString() }}
                </td>
                <td class="px-6 py-4">
                  <span :class="statusClass(n.estado)" class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {{ n.estado }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button @click="verDetalle(n)" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition" title="Ver Detalle">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button v-if="n.estado === 'PENDIENTE'" @click="pagarNomina(n)" class="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition" title="Marcar como Pagada">
                      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Generar Nómina -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="showGenerateModal" class="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
        <div class="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 overflow-hidden relative">
          <div class="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
          
          <h3 class="text-xl font-bold text-gray-900 mb-2">Generar Nuevo Periodo</h3>
          <p class="text-sm text-gray-500 mb-6">El sistema calculará automáticamente los sueldos base y comisiones para el rango seleccionado.</p>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Desde</label>
              <input v-model="newNomina.inicio" type="date" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Hasta</label>
              <input v-model="newNomina.fin" type="date" class="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm" />
            </div>
          </div>

          <div class="bg-indigo-50 rounded-2xl p-4 mb-8">
            <p class="text-xs text-indigo-700 leading-relaxed font-medium">
              <span class="mr-2">💡</span> Se incluirán todos los empleados activos con contrato vigente. Las comisiones por ventas (si aplican) se calculan al finalizar el proceso.
            </p>
          </div>

          <div class="flex gap-4">
            <button @click="showGenerateModal = false" class="flex-1 py-4 text-sm font-bold text-gray-500 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
              Cancelar
            </button>
            <button 
              @click="procesarGeneracion" 
              :disabled="loading"
              class="flex-[2] py-4 text-sm font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition flex items-center justify-center gap-2"
            >
              <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ loading ? 'Procesando...' : 'Confirmar y Generar' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { apiClient } from '@/utils/apiClient'

// --- Toasts Locales ---
const toasts = ref([])
const showToast = (message, type = 'success') => {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 4000)
}

// --- Autenticación ---
const isAuthenticated = ref(false)
const verifying = ref(false)
const password = ref('')
const authError = ref('')

const verifyPassword = async () => {
  if (!password.value) return
  verifying.value = true
  authError.value = ''
  
  try {
    // Obtenemos el usuario actual para usar su login (email o username)
    const userRaw = localStorage.getItem('user') || sessionStorage.getItem('user')
    const user = JSON.parse(userRaw)
    
    // Intentamos loguear de nuevo con la contraseña ingresada para validar
    const resp = await apiClient.post('/login', {
      login: user.email || user.username || user.usuario,
      password: password.value
    })

    if (resp.success || resp.data?.token || resp.token) {
      const newToken = resp.data?.token || resp.token
      const storage = localStorage.getItem('token') ? localStorage : sessionStorage
      storage.setItem('token', newToken)
      
      // ✅ Guardar estado de desbloqueo en la sesión
      sessionStorage.setItem('nomina_unlocked', 'true')
      
      isAuthenticated.value = true
      loadNominas()
    } else {
      authError.value = 'Contraseña incorrecta. Inténtalo de nuevo.'
    }
  } catch (err) {
    authError.value = 'Error al verificar. Revisa tu conexión.'
  } finally {
    verifying.value = false
    password.value = ''
  }
}

// --- Gestión de Nóminas ---
const nominas = ref([])
const loading = ref(false)
const filterYear = ref(2025)
const showGenerateModal = ref(false)

const getTenantHeader = () => {
  const restId = localStorage.getItem('restaurante_id_activo')
  return restId ? { 'X-Restaurante-Id': restId } : {}
}

const stats = reactive({
  total_mes: 0,
  pendientes: 0,
  ultima_nomina: 0,
  ultima_fecha: 'N/A',
  empleados_activos: 0
})

const newNomina = reactive({
  inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  fin: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
})

const loadNominas = async () => {
  loading.value = true
  try {
    const resp = await apiClient.get('/nominas', {
      headers: getTenantHeader()
    })
    if (resp.success || Array.isArray(resp.data) || Array.isArray(resp)) {
      nominas.value = resp.data || resp || []
      calcularStats()
    }
  } catch (err) {
    console.error('Error al cargar nóminas:', err)
    if (err.response?.status === 401) {
      isAuthenticated.value = false
      sessionStorage.removeItem('nomina_unlocked') // Limpiar si falla el auth
      authError.value = 'Sesión expirada. Por favor, re-ingresa tu contraseña.'
    }
  } finally {
    loading.value = false
  }
}

const calcularStats = () => {
  if (!nominas.value || !Array.isArray(nominas.value)) return
  
  stats.total_mes = nominas.value
    .filter(n => n.estado === 'PENDIENTE')
    .reduce((s, n) => s + Number(n.monto_total || 0), 0)
    
  stats.pendientes = nominas.value.filter(n => n.estado === 'PENDIENTE').length
  
  const pagadas = nominas.value.filter(n => n.estado === 'PAGADA')
  if (pagadas.length) {
    const ultima = pagadas[0]
    stats.ultima_nomina = Number(ultima.monto_total || 0)
    stats.ultima_fecha  = new Date(ultima.updated_at || ultima.created_at).toLocaleDateString()
  }

  // Obtenemos conteo de empleados (podríamos usar el endpoint de usuarios si fuera necesario)
  stats.empleados_activos = nominas.value.length > 0 ? (nominas.value[0].detalles_count || 0) : 0
}

const procesarGeneracion = async () => {
  if (!newNomina.inicio || !newNomina.fin) return
  loading.value = true
  
  try {
    const resp = await apiClient.post('/nominas/generar', {
      periodo_inicio: newNomina.inicio,
      periodo_fin:    newNomina.fin
    }, {
      headers: getTenantHeader()
    })
    
    if (resp.success) {
      showToast('La nómina se ha generado correctamente.')
      showGenerateModal.value = false
      loadNominas()
    } else {
      showToast(resp.message || 'No se pudo generar la nómina.', 'error')
    }
  } catch (err) {
    showToast('Error de conexión con el servidor.', 'error')
  } finally {
    loading.value = false
  }
}

const pagarNomina = async (n) => {
  const confirmado = confirm(`¿Confirmar Pago?\nSe marcará la nómina del periodo ${formatDateRange(n.periodo_inicio, n.periodo_fin)} como pagada.`)

  if (confirmado) {
    try {
      const resp = await apiClient.patch(`/nominas/${n.id}/estado`, { 
        estado: 'PAGADA' 
      }, {
        headers: getTenantHeader()
      })
      if (resp.success) {
        showToast('Nómina marcada como pagada')
        loadNominas()
      }
    } catch (err) {
      showToast('No se pudo actualizar el estado.', 'error')
    }
  }
}

const verDetalle = (n) => {
  // Aquí se navegaría a una vista de detalle o se abriría un modal
  console.log('Ver detalle de nómina:', n.id)
  alert(`Módulo de detalles para la nómina #${n.id} en construcción.`)
}

// --- Utils ---
const formatDateRange = (start, end) => {
  if (!start || !end) return 'Periodo N/A'
  const options = { day: 'numeric', month: 'short' }
  const s = new Date(start).toLocaleDateString('es-ES', options)
  const e = new Date(end).toLocaleDateString('es-ES', options)
  const year = new Date(start).getFullYear()
  return `${s} - ${e}, ${year}`
}

const statusClass = (status) => {
  switch (status) {
    case 'PAGADA':    return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
    case 'PENDIENTE': return 'bg-amber-100 text-amber-700 border border-amber-200'
    case 'CANCELADA': return 'bg-red-100 text-red-700 border border-red-200'
    default:         return 'bg-gray-100 text-gray-700 border border-gray-200'
  }
}

onMounted(() => {
  // ✅ Verificar si ya se desbloqueó en esta sesión
  if (sessionStorage.getItem('nomina_unlocked') === 'true') {
    isAuthenticated.value = true
    loadNominas()
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>
