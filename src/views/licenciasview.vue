<template>
  <div class="max-w-5xl mx-auto space-y-8 p-4 sm:p-6">

    <ToastContainer :toasts="toasts" @remove="removeToast" />

    <!-- Encabezado -->
    <div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Licencias</h2>
      <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Administra tu suscripción y accede a todos los planes disponibles</p>
    </div>

    <!-- ── LICENCIA ACTIVA ── -->
    <div v-if="loading.activa" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 text-center text-gray-400 dark:text-gray-500 text-sm">
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
          {{ Math.round(licenciaActiva.dias_restantes) }} días restantes
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

    <div v-else class="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-2xl p-5 flex items-center gap-4">
      <span class="text-3xl">⚠️</span>
      <div>
        <p class="font-semibold text-amber-800 dark:text-amber-200">Sin licencia activa</p>
        <p class="text-amber-600 dark:text-amber-400 text-sm mt-0.5">Selecciona un plan para comenzar a usar Easy Order</p>
      </div>
    </div>

    <div class="space-y-6">
  <div class="flex items-center justify-between">
    <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Escoge el plan ideal para tu negocio</h3>
    <div class="hidden sm:flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
      <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
      Precios actualizados
    </div>
  </div>

    <div v-if="loading.planes" class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="h-80 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-3xl"></div>
  </div>

  <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    <div
      v-for="plan in planesFiltrados"
      :key="plan.id"
      @click="seleccionarPlan(plan)"
      :class="[
        'relative group overflow-hidden rounded-[2rem] border transition-all duration-500 cursor-pointer p-8',
        planSeleccionado?.id === plan.id
          ? 'border-indigo-600 bg-white dark:bg-gray-800 shadow-[0_20px_50px_rgba(79,70,229,0.15)] scale-[1.02] ring-1 ring-indigo-600'
          : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xl hover:-translate-y-1'
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

      <h4 class="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">{{ plan.nombre }}</h4>
      <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">{{ plan.descripcion || obtenerDescripcionPlan(plan) }}</p>

      <div class="flex items-baseline gap-1 mb-8">
        <template v-if="plan.tipo === 'PRUEBA'">
          <span class="text-4xl font-black text-emerald-600">Gratis</span>
        </template>
        <template v-else-if="plan.tipo === 'EMPRESA'">
          <span class="text-3xl font-black text-purple-600 italic">Custom</span>
        </template>
        <template v-else>
          <span class="text-4xl font-black text-gray-900 dark:text-gray-100">${{ formatMoney(plan.precio) }}</span>
          <span class="text-gray-400 dark:text-gray-500 font-medium text-sm">/mes</span>
        </template>
      </div>

      <ul class="space-y-4 mb-8">
        <li class="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          <div class="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <svg class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <span v-if="plan.tipo === 'EMPRESA'">Sucursales ilimitadas</span>
          <span v-else>{{ plan.max_restaurantes }} {{ plan.max_restaurantes > 1 ? 'Sucursales' : 'Sucursal' }}</span>
        </li>
        <li class="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          <div class="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <svg class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
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
            : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
        ]"
      >
        {{ plan.tipo === 'EMPRESA' ? 'Hablar con Ventas' : (planSeleccionado?.id === plan.id ? 'Seleccionado' : 'Elegir Plan') }}
      </button>
    </div>
  </div>
</div>

    <!-- ── COMPARATIVA DE PLANES ── -->
    <div v-if="planesFiltrados.length > 0 && !loading.planes">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Comparativa de planes</h3>
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                <th class="text-left px-5 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-48">
                  Característica
                </th>
                <th
                  v-for="plan in planesFiltrados"
                  :key="plan.id"
                  class="px-5 py-4 text-center"
                  :class="planSeleccionado?.id === plan.id ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''"
                >
              <div class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{{ plan.tipo }}</div>
              <div class="text-base font-bold text-gray-900 dark:text-gray-100 mt-0.5">{{ plan.nombre }}</div>
                  <div class="text-indigo-600 dark:text-indigo-400 font-bold">
                    <template v-if="plan.tipo === 'PRUEBA'">Gratis</template>
                    <template v-else-if="plan.tipo === 'EMPRESA'">Cotizar</template>
                    <template v-else>${{ formatMoney(plan.precio) }}/mes</template>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-gray-700/50">
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <td class="px-5 py-3 text-gray-600 dark:text-gray-400 font-medium">Restaurantes</td>
                <td v-for="plan in planesFiltrados" :key="plan.id" class="px-5 py-3 text-center font-semibold text-gray-800 dark:text-gray-200"
                  :class="planSeleccionado?.id === plan.id ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''">
                  <span v-if="plan.tipo === 'EMPRESA'">Ilimitados</span>
                  <span v-else>{{ plan.max_restaurantes ?? '—' }}</span>
                </td>
              </tr>
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <td class="px-5 py-3 text-gray-600 dark:text-gray-400 font-medium">Usuarios</td>
              <td v-for="plan in planesFiltrados" :key="plan.id" class="px-5 py-3 text-center font-semibold text-gray-800 dark:text-gray-200"
                  :class="planSeleccionado?.id === plan.id ? 'bg-indigo-50' : ''">
                  <span v-if="plan.tipo === 'EMPRESA'">Ilimitados</span>
                  <span v-else>{{ plan.max_usuarios ?? '—' }}</span>
                </td>
              </tr>
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <td class="px-5 py-3 text-gray-600 dark:text-gray-400 font-medium">Precio Anual</td>
                  <td v-for="plan in planesFiltrados" :key="plan.id" class="px-5 py-3 text-center"
                    :class="planSeleccionado?.id === plan.id ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''">
                    <span v-if="plan.precio_anual" class="font-semibold text-indigo-600 dark:text-indigo-400">${{ formatMoney(plan.precio_anual) }}</span>
                    <span v-else class="text-gray-400 dark:text-gray-500">—</span>
                </td>
              </tr>
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <td class="px-5 py-3 text-gray-600 dark:text-gray-400 font-medium">Días de prueba</td>
                  <td v-for="plan in planesFiltrados" :key="plan.id" class="px-5 py-3 text-center"
                    :class="planSeleccionado?.id === plan.id ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''">
                    <span v-if="plan.dias_prueba > 0" class="text-emerald-600 dark:text-emerald-400 font-semibold">{{ plan.dias_prueba }} días</span>
                    <span v-else class="text-gray-400 dark:text-gray-500">—</span>
                </td>
              </tr>
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <td class="px-5 py-3 text-gray-600 dark:text-gray-400 font-medium">Soporte</td>
                <td v-for="plan in planesFiltrados" :key="plan.id" class="px-5 py-3 text-center"
                  :class="planSeleccionado?.id === plan.id ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''">
                  <span v-if="plan.tipo === 'EMPRESA'">Ilimitados</span>
                  <span v-else>{{ plan.max_restaurantes ?? '—' }}</span>
                </td>
              </tr>
              <tr>
                <td class="px-5 py-4"></td>
                <td v-for="plan in planesFiltrados" :key="plan.id" class="px-5 py-4 text-center"
                  :class="planSeleccionado?.id === plan.id ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''">
                  <button
                    @click="seleccionarPlan(plan)"
                    :disabled="plan.tipo === 'EMPRESA'"
                    :class="[
                      'w-full py-2 rounded-xl text-sm font-semibold transition',
                      planSeleccionado?.id === plan.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-400',
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
    <div v-if="planSeleccionado && planSeleccionado.tipo !== 'EMPRESA'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-800 p-6" data-form-licencia>
      <h3 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-5 flex items-center gap-2">
        <span class="text-xl">📋</span> Confirmar adquisición
      </h3>

      <!-- Resumen del plan -->
      <div class="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 mb-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-semibold text-indigo-900 dark:text-indigo-200">{{ planSeleccionado.nombre }}</p>
            <p class="text-indigo-600 dark:text-indigo-400 text-sm">{{ planSeleccionado.tipo }} · {{ planSeleccionado.max_restaurantes }} restaurante(s)</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-indigo-700 dark:text-indigo-400">${{ formatMoney(planSeleccionado.precio) }}</p>
            <p v-if="planSeleccionado.precio_anual" class="text-xs text-gray-500 dark:text-gray-400">o ${{ formatMoney(planSeleccionado.precio_anual) }}/año</p>
          </div>
        </div>
        <div v-if="planSeleccionado.dias_prueba > 0" class="mt-3 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-2 text-center">
          🎁 {{ planSeleccionado.dias_prueba }} días de prueba gratis incluidos
        </div>
      </div>

      <!-- Opciones de pago -->
      <div class="space-y-4">
        <div class="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-semibold text-amber-800 dark:text-amber-200">💰 Pago con PayPal</p>
              <p class="text-amber-600 dark:text-amber-400 text-sm">Serás redirigido a PayPal para completar el pago seguro</p>
            </div>
            <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" class="h-8">
          </div>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition" @click="comprarConMercadoPago">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-semibold text-blue-800 dark:text-blue-200">💳 Pago con Tarjeta</p>
              <p class="text-blue-600 dark:text-blue-400 text-sm">Visa, Mastercard, American Express</p>
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
          class="flex-1 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        >
          Cancelar
        </button>
        <button
          @click="comprarConPayPal"
          :disabled="loading.adquirir"
          class="flex-1 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <LoadingSpinner v-if="loading.adquirir" text="Procesando..." />
          {{ loading.adquirir ? 'Procesando...' : 'Pagar con PayPal' }}
        </button>
      </div>
    </div>

    <!-- Mensaje para Enterprise -->
    <div v-if="planSeleccionado && planSeleccionado.tipo === 'EMPRESA'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-purple-100 dark:border-purple-800 p-6">
      <div class="text-center">
        <span class="text-5xl block mb-4">🏢</span>
        <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Plan Enterprise</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">Contáctanos para obtener una cotización personalizada según tus necesidades.</p>
        <button class="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition">
          📧 Contactar a ventas
        </button>
      </div>
    </div>

    <!-- ── HISTORIAL ── -->
    <div>
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Historial de licencias</h3>

      <div v-if="loading.historial" class="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
        Cargando historial...
      </div>

      <div v-else-if="historial.length === 0" class="text-center py-10 text-gray-400 dark:text-gray-500 italic text-sm bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
        No hay licencias anteriores
      </div>

      <div v-else class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th class="text-left px-5 py-3">Plan</th>
                <th class="text-left px-5 py-3">Tipo</th>
                <th class="text-left px-5 py-3">Inicio</th>
                <th class="text-left px-5 py-3">Vencimiento</th>
                <th class="text-left px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-gray-700/50">
              <tr
                v-for="lic in historial"
                :key="lic.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
              >
                <td class="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">
                  {{ lic.licencia?.nombre || lic.nombre || '—' }}
                </td>
                <td class="px-5 py-3 text-gray-500 dark:text-gray-400">
                  {{ lic.licencia?.tipo || lic.tipo || '—' }}
                </td>
                <td class="px-5 py-3 text-gray-500 dark:text-gray-400">{{ formatDate(lic.fecha_inicio) }}</td>
                <td class="px-5 py-3 text-gray-500 dark:text-gray-400">{{ formatDate(lic.fecha_expiracion) }}</td>
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
import { apiClient } from '@/utils/apiClient'
import { useToast } from '@/composables/useToast'
import { getHeaders } from '@/config/api'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const router = useRouter()

// ── Estado ────────────────────────────────────────────────────────────────────
const planes         = ref([])
const historial      = ref([])
const licenciaActiva = ref(null)
const planSeleccionado = ref(null)
const currentUser    = ref(null)
const { toasts, showToast, removeToast } = useToast()

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
    const data = await apiClient.get('/me')
    if (data?.success) currentUser.value = data.data || data
  } catch (e) { 
    console.error(e) 
  }
}

const loadPlanes = async () => {
  loading.planes = true
  try {
    const data = await apiClient.get('/licencias/disponibles')
    if (data.success) planes.value = data.data || []
  } catch (e) { 
    console.error('Error planes:', e) 
  } finally { 
    loading.planes = false 
  }
}

const loadLicenciaActiva = async () => {
  try {
    const data = await apiClient.get('/mi-licencia')
    
    if (data?.success && data.data) {
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
    
    const data = await apiClient.get(`/propietarios/${propId}/licencias-activas`)
    if (data?.success) historial.value = data.data || []
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
    const data = await apiClient.post(`/licencias/${planSeleccionado.value.id}/comprar-paypal`)

    if (data?.success && data.approval_url) {
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
    const data = await apiClient.post(`/licencias/${planSeleccionado.value.id}/comprar-mercadopago`)

    if (data?.success && data.init_point) {
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
</style>