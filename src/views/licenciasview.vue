<template>
  <div class="max-w-5xl mx-auto space-y-8 p-4 sm:p-6">

    <!-- TOASTS -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div
        v-for="toast in toasts"
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
      <h2 class="text-2xl font-bold text-gray-900">Licencias</h2>
      <p class="text-gray-500 text-sm mt-1">Administra tu suscripción y accede a todos los planes disponibles</p>
    </div>

    <!-- ── LICENCIA ACTIVA ── -->
    <div v-if="loading.activa" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center text-gray-400 text-sm">
      Cargando licencia activa...
    </div>

    <div v-else-if="licenciaActiva" class="bg-gradient-to-r from-[#1e1b6e] to-[#2d2a9e] rounded-2xl p-6 text-white shadow-lg">
      <div class="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p class="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1">Licencia activa</p>
          <h3 class="text-2xl font-bold">{{ licenciaActiva.licencia?.nombre || licenciaActiva.nombre }}</h3>
          <p class="text-indigo-200 text-sm mt-1">{{ licenciaActiva.licencia?.tipo || licenciaActiva.tipo }}</p>
        </div>
        <span class="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
          {{ licenciaActiva.dias_restantes }} días restantes
        </span>
      </div>

      <div class="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-white/10 rounded-xl p-3">
          <p class="text-indigo-200 text-xs">Restaurantes</p>
          <p class="text-xl font-bold mt-0.5">{{ licenciaActiva.licencia?.max_restaurantes ?? (licenciaActiva.licencia?.tipo === 'EMPRESA' ? 'Ilimitados' : '—') }}</p>
        </div>
        <div class="bg-white/10 rounded-xl p-3">
          <p class="text-indigo-200 text-xs">Usuarios</p>
          <p class="text-xl font-bold mt-0.5">{{ licenciaActiva.licencia?.max_usuarios ?? (licenciaActiva.licencia?.tipo === 'EMPRESA' ? 'Ilimitados' : '—') }}</p>
        </div>
        <div class="bg-white/10 rounded-xl p-3">
          <p class="text-indigo-200 text-xs">Inicio</p>
          <p class="text-sm font-semibold mt-0.5">{{ formatDate(licenciaActiva.fecha_inicio) }}</p>
        </div>
        <div class="bg-white/10 rounded-xl p-3">
          <p class="text-indigo-200 text-xs">Vence</p>
          <p class="text-sm font-semibold mt-0.5">{{ formatDate(licenciaActiva.fecha_expiracion) }}</p>
        </div>
      </div>

      <!-- Barra de progreso -->
      <div class="mt-4">
        <div class="flex justify-between text-xs text-indigo-200 mb-1">
          <span>Tiempo restante</span>
          <span>{{ porcentajeRestante }}%</span>
        </div>
        <div class="w-full bg-white/20 rounded-full h-2">
          <div
            class="h-2 rounded-full transition-all duration-500"
            :class="porcentajeRestante > 30 ? 'bg-emerald-400' : 'bg-amber-400'"
            :style="{ width: porcentajeRestante + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <div v-else class="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
      <span class="text-3xl">⚠️</span>
      <div>
        <p class="font-semibold text-amber-800">Sin licencia activa</p>
        <p class="text-amber-600 text-sm mt-0.5">Selecciona un plan para comenzar a usar Easy Order</p>
      </div>
    </div>

    <div class="space-y-6">
  <div class="flex items-center justify-between">
    <h3 class="text-xl font-bold text-gray-900 tracking-tight">Escoge el plan ideal para tu negocio</h3>
    <div class="hidden sm:flex items-center gap-2 text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
      <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
      Precios actualizados
    </div>
  </div>

  <div v-if="loading.planes" class="grid grid-cols-1 sm:grid-cols-3 gap-6">
    <div v-for="i in 3" :key="i" class="h-80 bg-gray-100 animate-pulse rounded-3xl"></div>
  </div>

  <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    <div
      v-for="plan in planesFiltrados"
      :key="plan.id"
      @click="seleccionarPlan(plan)"
      :class="[
        'relative group overflow-hidden rounded-[2rem] border transition-all duration-500 cursor-pointer p-8',
        planSeleccionado?.id === plan.id
          ? 'border-indigo-600 bg-white shadow-[0_20px_50px_rgba(79,70,229,0.15)] scale-[1.02] ring-1 ring-indigo-600'
          : 'border-gray-200 bg-white/50 hover:bg-white hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1'
      ]"
    >
      <div v-if="planSeleccionado?.id === plan.id" class="absolute -right-8 -top-8 w-24 h-24 bg-indigo-600/5 rounded-full blur-2xl"></div>

      <div class="mb-6">
        <span
          :class="[
            'px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] shadow-sm',
            plan.tipo === 'PRUEBA' ? 'bg-emerald-500 text-white' : 
            plan.tipo === 'EMPRESA' ? 'bg-purple-600 text-white' : 'bg-gray-900 text-white'
          ]"
        >
          {{ plan.tipo === 'PRUEBA' ? 'Free Trial' : plan.tipo }}
        </span>
      </div>

      <h4 class="text-2xl font-extrabold text-gray-900 mb-2">{{ plan.nombre }}</h4>
      <p class="text-gray-500 text-sm leading-relaxed mb-6">{{ plan.descripcion || obtenerDescripcionPlan(plan) }}</p>

      <div class="flex items-baseline gap-1 mb-8">
        <template v-if="plan.tipo === 'PRUEBA'">
          <span class="text-4xl font-black text-emerald-600">Gratis</span>
        </template>
        <template v-else-if="plan.tipo === 'EMPRESA'">
          <span class="text-3xl font-black text-purple-600 italic">Custom</span>
        </template>
        <template v-else>
          <span class="text-4xl font-black text-gray-900">${{ formatMoney(plan.precio) }}</span>
          <span class="text-gray-400 font-medium text-sm">/mes</span>
        </template>
      </div>

      <ul class="space-y-4 mb-8">
        <li class="flex items-center gap-3 text-sm font-medium text-gray-700">
          <div class="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <span v-if="plan.tipo === 'EMPRESA'">Sucursales ilimitadas</span>
          <span v-else>{{ plan.max_restaurantes }} {{ plan.max_restaurantes > 1 ? 'Sucursales' : 'Sucursal' }}</span>
        </li>
        <li class="flex items-center gap-3 text-sm font-medium text-gray-700">
          <div class="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <span v-if="plan.tipo === 'EMPRESA'">Usuarios ilimitados</span>
          <span v-else>{{ plan.max_usuarios }} Usuarios</span>
        </li>
      </ul>

      <button
        :class="[
          'w-full py-4 rounded-2xl font-bold text-sm transition-all duration-300',
          planSeleccionado?.id === plan.id
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
            : 'bg-gray-50 text-gray-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'
        ]"
      >
        {{ plan.tipo === 'EMPRESA' ? 'Hablar con Ventas' : (planSeleccionado?.id === plan.id ? 'Seleccionado' : 'Elegir Plan') }}
      </button>
    </div>
  </div>
</div>

    <!-- ── COMPARATIVA DE PLANES ── -->
    <div v-if="planesFiltrados.length > 0 && !loading.planes">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Comparativa de planes</h3>
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100">
                <th class="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide w-48">
                  Característica
                </th>
                <th
                  v-for="plan in planesFiltrados"
                  :key="plan.id"
                  class="px-5 py-4 text-center"
                  :class="planSeleccionado?.id === plan.id ? 'bg-indigo-50' : ''"
                >
                  <div class="text-xs font-bold uppercase tracking-wider text-gray-500">{{ plan.tipo }}</div>
                  <div class="text-base font-bold text-gray-900 mt-0.5">{{ plan.nombre }}</div>
                  <div class="text-indigo-600 font-bold">
                    <template v-if="plan.tipo === 'PRUEBA'">Gratis</template>
                    <template v-else-if="plan.tipo === 'EMPRESA'">Cotizar</template>
                    <template v-else>${{ formatMoney(plan.precio) }}/mes</template>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr class="hover:bg-gray-50 transition">
                <td class="px-5 py-3 text-gray-600 font-medium">Restaurantes</td>
                <td v-for="plan in planesFiltrados" :key="plan.id" class="px-5 py-3 text-center font-semibold text-gray-800"
                  :class="planSeleccionado?.id === plan.id ? 'bg-indigo-50' : ''">
                  <span v-if="plan.tipo === 'EMPRESA'">Ilimitados</span>
                  <span v-else>{{ plan.max_restaurantes ?? '—' }}</span>
                </td>
              </tr>
              <tr class="hover:bg-gray-50 transition">
                <td class="px-5 py-3 text-gray-600 font-medium">Usuarios</td>
                <td v-for="plan in planesFiltrados" :key="plan.id" class="px-5 py-3 text-center font-semibold text-gray-800"
                  :class="planSeleccionado?.id === plan.id ? 'bg-indigo-50' : ''">
                  <span v-if="plan.tipo === 'EMPRESA'">Ilimitados</span>
                  <span v-else>{{ plan.max_usuarios ?? '—' }}</span>
                </td>
              </tr>
              <tr class="hover:bg-gray-50 transition">
                <td class="px-5 py-3 text-gray-600 font-medium">Precio Anual</td>
                <td v-for="plan in planesFiltrados" :key="plan.id" class="px-5 py-3 text-center"
                  :class="planSeleccionado?.id === plan.id ? 'bg-indigo-50' : ''">
                  <span v-if="plan.precio_anual" class="font-semibold text-indigo-600">${{ formatMoney(plan.precio_anual) }}</span>
                  <span v-else class="text-gray-400">—</span>
                </td>
              </tr>
              <tr class="hover:bg-gray-50 transition">
                <td class="px-5 py-3 text-gray-600 font-medium">Días de prueba</td>
                <td v-for="plan in planesFiltrados" :key="plan.id" class="px-5 py-3 text-center"
                  :class="planSeleccionado?.id === plan.id ? 'bg-indigo-50' : ''">
                  <span v-if="plan.dias_prueba > 0" class="text-emerald-600 font-semibold">{{ plan.dias_prueba }} días</span>
                  <span v-else class="text-gray-400">—</span>
                </td>
              </tr>
              <tr class="hover:bg-gray-50 transition">
                <td class="px-5 py-3 text-gray-600 font-medium">Soporte</td>
                <td v-for="plan in planesFiltrados" :key="plan.id" class="px-5 py-3 text-center"
                  :class="planSeleccionado?.id === plan.id ? 'bg-indigo-50' : ''">
                  <span class="text-emerald-500">✓</span>
                </td>
              </tr>
              <tr>
                <td class="px-5 py-4"></td>
                <td v-for="plan in planesFiltrados" :key="plan.id" class="px-5 py-4 text-center"
                  :class="planSeleccionado?.id === plan.id ? 'bg-indigo-50' : ''">
                  <button
                    @click="seleccionarPlan(plan)"
                    :disabled="plan.tipo === 'EMPRESA'"
                    :class="[
                      'w-full py-2 rounded-xl text-sm font-semibold transition',
                      planSeleccionado?.id === plan.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700',
                      plan.tipo === 'EMPRESA' ? 'opacity-50 cursor-not-allowed' : ''
                    ]"
                  >
                    {{ plan.tipo === 'EMPRESA' ? 'Contactar' : (planSeleccionado?.id === plan.id ? '✓ Seleccionado' : 'Seleccionar') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── FORMULARIO DE ADQUISICIÓN ── -->
    <div v-if="planSeleccionado && planSeleccionado.tipo !== 'EMPRESA'" class="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6" data-form-licencia>
      <h3 class="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
        <span class="text-xl">📋</span> Confirmar adquisición
      </h3>

      <!-- Resumen del plan -->
      <div class="bg-indigo-50 rounded-xl p-4 mb-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-semibold text-indigo-900">{{ planSeleccionado.nombre }}</p>
            <p class="text-indigo-600 text-sm">{{ planSeleccionado.tipo }} · {{ planSeleccionado.max_restaurantes }} restaurante(s)</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-indigo-700">${{ formatMoney(planSeleccionado.precio) }}</p>
            <p v-if="planSeleccionado.precio_anual" class="text-xs text-gray-500">o ${{ formatMoney(planSeleccionado.precio_anual) }}/año</p>
          </div>
        </div>
        <div v-if="planSeleccionado.dias_prueba > 0" class="mt-3 text-sm text-emerald-600 bg-emerald-50 rounded-lg p-2 text-center">
          🎁 {{ planSeleccionado.dias_prueba }} días de prueba gratis incluidos
        </div>
      </div>

      <!-- Opciones de pago -->
      <div class="space-y-4">
        <div class="bg-amber-50 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-semibold text-amber-800">💰 Pago con PayPal</p>
              <p class="text-amber-600 text-sm">Serás redirigido a PayPal para completar el pago seguro</p>
            </div>
            <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" class="h-8">
          </div>
        </div>

        <div class="bg-blue-50 rounded-xl p-4 cursor-pointer hover:bg-blue-100 transition" @click="comprarConMercadoPago">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-semibold text-blue-800">💳 Pago con Tarjeta</p>
              <p class="text-blue-600 text-sm">Visa, Mastercard, American Express</p>
            </div>
            <div class="flex gap-1">
              <span class="text-2xl">💳</span>
              <span class="text-2xl">💙</span>
              <span class="text-2xl">💚</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-3 pt-5">
        <button
          @click="cancelarSeleccion"
          class="flex-1 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
        >
          Cancelar
        </button>
        <button
          @click="comprarConPayPal"
          :disabled="loading.adquirir"
          class="flex-1 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span v-if="loading.adquirir" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ loading.adquirir ? 'Procesando...' : 'Pagar con PayPal' }}
        </button>
      </div>
    </div>

    <!-- Mensaje para Enterprise -->
    <div v-if="planSeleccionado && planSeleccionado.tipo === 'EMPRESA'" class="bg-white rounded-2xl shadow-sm border border-purple-100 p-6">
      <div class="text-center">
        <span class="text-5xl block mb-4">🏢</span>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Plan Enterprise</h3>
        <p class="text-gray-600 mb-4">Contáctanos para obtener una cotización personalizada según tus necesidades.</p>
        <button class="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition">
          📧 Contactar a ventas
        </button>
      </div>
    </div>

    <!-- ── HISTORIAL ── -->
    <div>
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Historial de licencias</h3>

      <div v-if="loading.historial" class="text-center py-8 text-gray-400 text-sm">
        Cargando historial...
      </div>

      <div v-else-if="historial.length === 0" class="text-center py-10 text-gray-400 italic text-sm bg-white rounded-2xl border border-gray-100">
        No hay licencias anteriores
      </div>

      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 bg-gray-50">
                <th class="text-left px-5 py-3">Plan</th>
                <th class="text-left px-5 py-3">Tipo</th>
                <th class="text-left px-5 py-3">Inicio</th>
                <th class="text-left px-5 py-3">Vencimiento</th>
                <th class="text-left px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                v-for="lic in historial"
                :key="lic.id"
                class="hover:bg-gray-50 transition"
              >
                <td class="px-5 py-3 font-medium text-gray-800">
                  {{ lic.licencia?.nombre || lic.nombre || '—' }}
                </td>
                <td class="px-5 py-3 text-gray-500">
                  {{ lic.licencia?.tipo || lic.tipo || '—' }}
                </td>
                <td class="px-5 py-3 text-gray-500">{{ formatDate(lic.fecha_inicio) }}</td>
                <td class="px-5 py-3 text-gray-500">{{ formatDate(lic.fecha_expiracion) }}</td>
                <td class="px-5 py-3">
                  <span
                    class="px-2.5 py-1 text-xs font-semibold rounded-full"
                    :class="getEstadoClass(lic)"
                  >
                    {{ getEstadoLabel(lic) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { API_URL } from '@/config/api'

const router = useRouter()

// ── Estado ────────────────────────────────────────────────────────────────────
const planes         = ref([])
const historial      = ref([])
const licenciaActiva = ref(null)
const planSeleccionado = ref(null)
const currentUser    = ref(null)
const toasts = ref([])

const showToast = (message, type = 'info', duration = 5000) => {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  if (duration > 0) setTimeout(() => removeToast(id), duration)
}

const removeToast = (id) => {
  const i = toasts.value.findIndex(t => t.id === id)
  if (i !== -1) toasts.value.splice(i, 1)
}

const loading = reactive({
  planes: false, 
  historial: false, 
  activa: false, 
  adquirir: false,
})

// ── Computed ──────────────────────────────────────────────────────────────────
const porcentajeRestante = computed(() => {
  if (!licenciaActiva.value?.dias_restantes) return 0
  const total = licenciaActiva.value.licencia?.tipo === 'ANUAL' ? 365 : 
                licenciaActiva.value.licencia?.tipo === 'PRUEBA' ? 30 : 30
  return Math.min(100, Math.max(0, Math.round((licenciaActiva.value.dias_restantes / total) * 100)))
})

const planesFiltrados = computed(() => {
  // Filtrar duplicados y ordenar
  const seen = new Set()
  return planes.value.filter(plan => {
    if (seen.has(plan.nombre)) return false
    seen.add(plan.nombre)
    return true
  }).sort((a, b) => {
    // Orden: Prueba, Básico, Premium, Crecimiento, Pro, Enterprise
    const order = { 'PRUEBA': 0, 'MENSUAL': 1, 'ANUAL': 2, 'EMPRESA': 3 }
    return (order[a.tipo] || 99) - (order[b.tipo] || 99)
  })
})

// ── Helpers ───────────────────────────────────────────────────────────────────
const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

const formatMoney = (v) =>
  v === undefined || v === null ? '0.00' : Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2 })

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
}

const getEstadoLabel = (lic) => {
  if (lic.estado?.toLowerCase() === 'cancelada') return 'Cancelada'
  const hoyDate = new Date()
  const exp = new Date(lic.fecha_expiracion)
  if (exp < hoyDate) return 'Vencida'
  return 'Activa'
}

const getEstadoClass = (lic) => {
  const label = getEstadoLabel(lic)
  return {
    'Activa':    'bg-emerald-100 text-emerald-700',
    'Vencida':   'bg-gray-100 text-gray-500',
    'Cancelada': 'bg-red-100 text-red-500',
  }[label] || 'bg-gray-100 text-gray-500'
}

const obtenerDescripcionPlan = (plan) => {
  if (plan.tipo === 'PRUEBA') return 'Prueba gratuita por 30 días'
  if (plan.tipo === 'EMPRESA') return 'Solución personalizada para tu negocio'
  if (plan.tipo === 'ANUAL') return 'Ahorra 2 meses con pago anual'
  return 'Plan mensual sin compromiso'
}

const ahorroPorcentaje = (plan) => {
  if (!plan.precio_anual || !plan.precio) return 0
  const anualNormal = plan.precio * 12
  return Math.round(((anualNormal - plan.precio_anual) / anualNormal) * 100)
}

// ── API ───────────────────────────────────────────────────────────────────────
const loadCurrentUser = async () => {
  try {
    const res = await fetch(`${API_URL}/me`, { headers: getHeaders() })
    if (res.status === 401) { 
      router.push('/') 
      return 
    }
    const data = await res.json()
    if (data.success) currentUser.value = data.data || data
  } catch (e) { 
    console.error(e) 
  }
}

const loadPlanes = async () => {
  loading.planes = true
  try {
    const res = await fetch(`${API_URL}/licencias/disponibles`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) planes.value = data.data || []
  } catch (e) { 
    console.error('Error planes:', e) 
  } finally { 
    loading.planes = false 
  }
}

const loadLicenciaActiva = async () => {
  try {
    const res = await fetch(`${API_URL}/mi-licencia`, { headers: getHeaders() })
    const data = await res.json()
    
    if (data.success && data.data) {
      licenciaActiva.value = data.data
    } else {
      licenciaActiva.value = null
    }
  } catch (e) { 
    console.error('Error licencia activa:', e) 
    licenciaActiva.value = null
  }
}

const loadHistorial = async () => {
  loading.historial = true
  try {
    const propId = currentUser.value?.propietario_id || currentUser.value?.id
    if (!propId) return
    
    const res = await fetch(`${API_URL}/propietarios/${propId}/licencias-activas`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) historial.value = data.data || []
  } catch (e) { 
    console.error('Error historial:', e) 
  } finally { 
    loading.historial = false 
  }
}

const seleccionarPlan = (plan) => {
  planSeleccionado.value = plan
  setTimeout(() => {
    document.querySelector('[data-form-licencia]')?.scrollIntoView({ behavior: 'smooth' })
  }, 100)
}

const cancelarSeleccion = () => {
  planSeleccionado.value = null
}

// Comprar con PayPal
const comprarConPayPal = async () => {
  if (!planSeleccionado.value) return
  if (!currentUser.value?.propietario_id) {
    showToast('No se encontró el propietario', 'error')
    return
  }

  loading.adquirir = true
  try {
    const res = await fetch(`${API_URL}/licencias/${planSeleccionado.value.id}/comprar-paypal`, {
      method: 'POST',
      headers: getHeaders(),
    })
    const data = await res.json()

    if (data.success && data.approval_url) {
      window.location.href = data.approval_url
    } else {
      showToast(data.message || 'Error al iniciar el pago', 'error')
    }
  } catch (e) {
    console.error('Error comprar con PayPal:', e)
    showToast('Error de conexión con el servidor', 'error')
  } finally {
    loading.adquirir = false
  }
}

// Comprar con Mercado Pago
const comprarConMercadoPago = async () => {
  if (!planSeleccionado.value) return
  if (!currentUser.value?.propietario_id) {
    showToast('No se encontró el propietario', 'error')
    return
  }

  loading.adquirir = true
  try {
    const res = await fetch(`${API_URL}/licencias/${planSeleccionado.value.id}/comprar-mercadopago`, {
      method: 'POST',
      headers: getHeaders(),
    })
    const data = await res.json()

    if (data.success && data.init_point) {
      window.location.href = data.init_point
    } else {
      showToast(data.message || 'Error al iniciar el pago', 'error')
    }
  } catch (e) {
    console.error('Error comprar con Mercado Pago:', e)
    showToast('Error de conexión con el servidor', 'error')
  } finally {
    loading.adquirir = false
  }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  await loadCurrentUser()
  await Promise.all([loadPlanes(), loadLicenciaActiva(), loadHistorial()])
})
</script>

<style scoped>
/* Toasts con entrada elástica (más moderno) */
.animate-slide-in {
  animation: slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes slideIn {
  from { 
    transform: translateX(20px); 
    opacity: 0; 
  }
  to { 
    transform: translateX(0); 
    opacity: 1; 
  }
}

/* Spinner más suave para procesos de pago */
.animate-spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Efecto de pulso sutil para el indicador de "Licencia Activa" */
.pulse-subtle {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

/* Sombra personalizada para el plan seleccionado */
.shadow-premium {
  box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.1), 0 10px 10px -5px rgba(79, 70, 229, 0.04);
}
</style>