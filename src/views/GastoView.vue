<template>
  <div class="space-y-6">

    <!-- TOASTS -->
    <div class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <div v-for="toast in toasts" :key="toast.id"
        :class="['px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-72 pointer-events-auto animate-slide-in',
          toast.type === 'success' ? 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800'
                                   : 'bg-red-50 border-l-4 border-red-500 text-red-800']">
        <span>{{ toast.type === 'success' ? '✅' : '❌' }}</span>
        <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
      </div>
    </div>

    <!-- Encabezado -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">💰 Gestión de Gastos</h2>
        <p class="text-sm text-gray-500 mt-1">Controla y analiza todos los gastos del restaurante</p>
      </div>
      <button @click="abrirModalCrear"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition shadow-sm">
        <span class="text-base leading-none">＋</span> Nuevo Gasto
      </button>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-2xl shrink-0">🧾</div>
        <div>
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Gastos</p>
          <p class="text-xl font-bold text-red-600 mt-0.5">${{ formatMoney(totalGastos) }}</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl shrink-0">💵</div>
        <div>
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Ventas del Período</p>
          <p class="text-xl font-bold text-emerald-600 mt-0.5">${{ formatMoney(resumenData.ventas) }}</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          :class="resumenData.utilidad_bruta >= 0 ? 'bg-blue-100' : 'bg-red-100'">
          {{ resumenData.utilidad_bruta >= 0 ? '📈' : '📉' }}
        </div>
        <div>
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Utilidad Bruta</p>
          <p class="text-xl font-bold mt-0.5" :class="resumenData.utilidad_bruta >= 0 ? 'text-blue-600' : 'text-red-600'">
            ${{ formatMoney(resumenData.utilidad_bruta) }}
          </p>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl shrink-0">🎯</div>
        <div>
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">ROI Operativo</p>
          <p class="text-xl font-bold text-amber-600 mt-0.5">{{ roiPorcentaje }}</p>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Filtros</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Desde</label>
          <input type="date" v-model="filtros.fecha_desde" @change="cargarGastos"
            class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
          <input type="date" v-model="filtros.fecha_hasta" @change="cargarGastos"
            class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
          <select v-model="filtros.categoria" @change="cargarGastos"
            class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
            <option value="">Todas</option>
            <option v-for="(label, value) in categorias" :key="value" :value="value">{{ label }}</option>
          </select>
        </div>
        <div class="flex items-end gap-2">
          <button @click="limpiarFiltros"
            class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition">
            Limpiar
          </button>
          <button @click="abrirResumenCompleto"
            class="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition">
            Ver ROI
          </button>
        </div>
      </div>
    </div>

    <!-- Distribución por categoría -->
    <div v-if="Object.keys(totalesPorCategoria).length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div v-for="(monto, categoria) in totalesPorCategoria" :key="categoria"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
        <span class="text-2xl block mb-1">{{ getCategoriaEmoji(categoria) }}</span>
        <p class="text-xs text-gray-500 mb-1">{{ categorias[categoria] }}</p>
        <p class="text-sm font-bold text-gray-900">${{ formatMoney(monto) }}</p>
        <div class="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div class="h-full rounded-full transition-all duration-500"
            :class="getCategoriaBarColor(categoria)"
            :style="{ width: `${Math.min((monto / totalGastos) * 100, 100)}%` }"></div>
        </div>
        <p class="text-[10px] text-gray-400 mt-1">{{ totalGastos > 0 ? ((monto / totalGastos) * 100).toFixed(0) : 0 }}%</p>
      </div>
    </div>

    <!-- Tabla de gastos -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="loading.gastos" class="flex items-center justify-center gap-3 py-16 text-gray-400">
        <div class="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        Cargando gastos...
      </div>
      <div v-else-if="gastos.length === 0" class="text-center py-16">
        <span class="text-5xl block mb-3">🧾</span>
        <p class="text-gray-500 text-sm">Sin gastos registrados en este período</p>
        <button @click="abrirModalCrear"
          class="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition">
          Registrar el primero
        </button>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-100">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Concepto</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoría</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
              <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Monto</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Notas</th>
              <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="gasto in gastos" :key="gasto.id" class="hover:bg-gray-50 transition">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                    :class="getCategoriaFondoSuave(gasto.categoria)">
                    {{ getCategoriaEmoji(gasto.categoria) }}
                  </div>
                  <p class="text-sm font-medium text-gray-900">{{ gasto.concepto }}</p>
                </div>
              </td>
              <td class="px-5 py-4">
                <span class="px-2.5 py-1 text-xs font-semibold rounded-full capitalize"
                  :class="getCategoriaColor(gasto.categoria)">
                  {{ categorias[gasto.categoria] || gasto.categoria }}
                </span>
              </td>
              <td class="px-5 py-4 text-sm text-gray-500">{{ formatFecha(gasto.fecha) }}</td>
              <td class="px-5 py-4 text-right">
                <span class="text-sm font-bold text-red-600">${{ formatMoney(gasto.monto) }}</span>
              </td>
              <td class="px-5 py-4 text-sm text-gray-400 max-w-xs truncate">{{ gasto.notas || '—' }}</td>
              <td class="px-5 py-4 text-right">
                <div class="flex justify-end gap-1">
                  <button @click="abrirModalEditar(gasto)"
                    class="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition font-medium">✏️</button>
                  <button @click="eliminarGasto(gasto)"
                    class="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition font-medium">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-gray-50 border-t-2 border-gray-200">
            <tr>
              <td colspan="3" class="px-5 py-3 text-sm font-bold text-gray-700">Total del período</td>
              <td class="px-5 py-3 text-right text-sm font-black text-red-600">${{ formatMoney(totalGastos) }}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- ══ MODAL CREAR / EDITAR ══ -->
    <div v-if="modalVisible" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
      @click.self="cerrarModal">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-semibold text-gray-800">{{ modoEdicion ? 'Editar gasto' : 'Registrar gasto' }}</h3>
          <button @click="cerrarModal" class="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div v-if="formError" class="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">{{ formError }}</div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Concepto *</label>
            <input v-model="form.concepto" type="text" placeholder="Ej. Pago de renta" maxlength="200"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select v-model="form.categoria"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                <option value="">Seleccionar</option>
                <option v-for="(label, value) in categorias" :key="value" :value="value">{{ label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
                <input v-model="form.monto" type="number" min="0.01" step="0.01"
                  class="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
            <input v-model="form.fecha" type="date"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notas <span class="text-gray-400 font-normal">(opcional)</span></label>
            <textarea v-model="form.notas" rows="2" placeholder="Detalles adicionales" maxlength="500"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"></textarea>
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="cerrarModal"
            class="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">Cancelar</button>
          <button @click="guardarGasto" :disabled="guardando"
            class="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
            {{ guardando ? 'Guardando...' : (modoEdicion ? 'Guardar cambios' : 'Registrar gasto') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══ MODAL ROI / RESUMEN ══ -->
    <div v-if="modalResumenVisible" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="modalResumenVisible = false">
      <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div class="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-800">📊 Análisis Financiero</h3>
          <button @click="modalResumenVisible = false" class="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div class="p-5 space-y-6">
          <div class="flex items-center justify-between flex-wrap gap-3 bg-gray-50 rounded-xl p-4">
            <div>
              <p class="text-xs text-gray-500">Período analizado</p>
              <p class="font-semibold text-gray-900 text-sm">
                {{ formatFecha(resumenData.periodo?.inicio) }} — {{ formatFecha(resumenData.periodo?.fin) }}
              </p>
            </div>
            <div class="flex gap-2">
              <button @click="cargarResumenPeriodo('month')"
                class="px-3 py-1.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition">Este Mes</button>
              <button @click="cargarResumenPeriodo('last-month')"
                class="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Mes Anterior</button>
              <button @click="cargarResumenPeriodo('year')"
                class="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Este Año</button>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
              <p class="text-xs opacity-80 uppercase tracking-wide font-medium">Ventas Totales</p>
              <p class="text-2xl font-bold mt-2">${{ formatMoney(resumenData.ventas) }}</p>
            </div>
            <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white">
              <p class="text-xs opacity-80 uppercase tracking-wide font-medium">Total Gastos</p>
              <p class="text-2xl font-bold mt-2">${{ formatMoney(resumenData.total_gastos) }}</p>
            </div>
            <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
              <p class="text-xs opacity-80 uppercase tracking-wide font-medium">Utilidad Bruta</p>
              <p class="text-2xl font-bold mt-2">${{ formatMoney(resumenData.utilidad_bruta) }}</p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Retorno sobre Inversión</p>
              <p class="text-5xl font-black mt-3"
                :class="(resumenData.roi_pct || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'">
                {{ resumenData.roi_pct !== null ? ((resumenData.roi_pct >= 0 ? '+' : '') + resumenData.roi_pct + '%') : '—' }}
              </p>
              <p class="text-xs text-gray-400 mt-2">
                {{ (resumenData.roi_pct || 0) >= 0 ? 'Operación rentable ✅' : 'Operación con pérdida ⚠️' }}
              </p>
            </div>
            <div class="bg-white border border-gray-200 rounded-2xl p-5">
              <p class="text-xs text-gray-500 uppercase tracking-wide font-medium mb-3">Distribución de Gastos</p>
              <div class="space-y-3 max-h-52 overflow-y-auto pr-1">
                <div v-for="(monto, categoria) in resumenData.por_categoria" :key="categoria" class="flex items-center gap-3">
                  <span class="text-base shrink-0">{{ getCategoriaEmoji(categoria) }}</span>
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between text-xs mb-1">
                      <span class="text-gray-600 truncate">{{ categorias[categoria] || categoria }}</span>
                      <span class="font-semibold text-gray-900 ml-2 shrink-0">${{ formatMoney(monto) }}</span>
                    </div>
                    <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-500"
                        :class="getCategoriaBarColor(categoria)"
                        :style="{ width: `${resumenData.total_gastos ? (monto / resumenData.total_gastos) * 100 : 0}%` }"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { API_URL } from '@/config/api'

// ── ESTADO ─────────────────────────────────────────────────
const gastos              = ref([])
const loading             = ref({ gastos: false })
const guardando           = ref(false)
const modalVisible        = ref(false)
const modalResumenVisible = ref(false)
const modoEdicion         = ref(false)
const gastoSeleccionado   = ref(null)
const formError           = ref('')
const toasts              = ref([])

const resumenData = ref({
  ventas: 0, total_gastos: 0, utilidad_bruta: 0,
  roi_pct: null, por_categoria: {},
  periodo: { inicio: '', fin: '' },
})

const filtros = reactive({
  fecha_desde: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  fecha_hasta: new Date().toISOString().split('T')[0],
  categoria:   '',
})

const form = ref({
  concepto: '', categoria: '', monto: '',
  fecha: new Date().toISOString().split('T')[0], notas: '',
})

// ── CATÁLOGOS ──────────────────────────────────────────────
const categorias = {
  renta:         '🏢 Renta',
  nomina:        '👥 Nómina',
  servicios:     '💡 Servicios',
  insumos:       '🥩 Insumos',
  marketing:     '📢 Marketing',
  mantenimiento: '🔧 Mantenimiento',
  general:       '📦 General',
}

const getCategoriaEmoji = (cat) => ({ renta:'🏢', nomina:'👥', servicios:'💡', insumos:'🥩', marketing:'📢', mantenimiento:'🔧', general:'📦' }[cat] || '📦')
const getCategoriaColor = (cat) => ({ renta:'bg-purple-100 text-purple-700', nomina:'bg-blue-100 text-blue-700', servicios:'bg-cyan-100 text-cyan-700', insumos:'bg-orange-100 text-orange-700', marketing:'bg-pink-100 text-pink-700', mantenimiento:'bg-yellow-100 text-yellow-700', general:'bg-gray-100 text-gray-600' }[cat] || 'bg-gray-100 text-gray-600')
const getCategoriaFondoSuave = (cat) => ({ renta:'bg-purple-50', nomina:'bg-blue-50', servicios:'bg-cyan-50', insumos:'bg-orange-50', marketing:'bg-pink-50', mantenimiento:'bg-yellow-50', general:'bg-gray-100' }[cat] || 'bg-gray-100')
const getCategoriaBarColor = (cat) => ({ renta:'bg-purple-500', nomina:'bg-blue-500', servicios:'bg-cyan-500', insumos:'bg-orange-500', marketing:'bg-pink-500', mantenimiento:'bg-yellow-500', general:'bg-gray-400' }[cat] || 'bg-gray-400')

// ── HELPERS ────────────────────────────────────────────────
const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return { 'Content-Type':'application/json', Accept:'application/json', Authorization: token ? `Bearer ${token}` : '' }
}

const formatMoney = (value) => {
  if (!value && value !== 0) return '0.00'
  return Number(value).toLocaleString('es-MX', { minimumFractionDigits:2, maximumFractionDigits:2 })
}

const formatFecha = (fecha) => { if (!fecha) return ''; return new Date(fecha).toLocaleDateString('es-MX') }

const showToast = (message, type = 'success') => {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => removeToast(id), 4000)
}
const removeToast = (id) => { toasts.value = toasts.value.filter(t => t.id !== id) }

// ── COMPUTED ───────────────────────────────────────────────
const totalGastos = computed(() =>
  // ✅ Guard: asegurar que gastos.value es array antes de reduce
  Array.isArray(gastos.value)
    ? gastos.value.reduce((sum, g) => sum + parseFloat(g.monto || 0), 0)
    : 0
)

const totalesPorCategoria = computed(() => {
  if (!Array.isArray(gastos.value)) return {}
  const totales = {}
  gastos.value.forEach(g => {
    totales[g.categoria] = (totales[g.categoria] || 0) + parseFloat(g.monto || 0)
  })
  return totales
})

const roiPorcentaje = computed(() => {
  if (resumenData.value.roi_pct === null || resumenData.value.roi_pct === undefined) return '—'
  const roi = resumenData.value.roi_pct
  return roi >= 0 ? `+${roi}%` : `${roi}%`
})

// ── API ────────────────────────────────────────────────────
const cargarGastos = async () => {
  loading.value.gastos = true
  try {
    const params = new URLSearchParams()
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde)
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta)
    if (filtros.categoria)   params.append('categoria',   filtros.categoria)

    const [gRes, rRes] = await Promise.all([
      fetch(`${API_URL}/gastos?${params}`, { headers: getHeaders() }),
      fetch(`${API_URL}/gastos/resumen?fecha_inicio=${filtros.fecha_desde}&fecha_fin=${filtros.fecha_hasta}`, { headers: getHeaders() }),
    ])

    const gData = await gRes.json()
    const rData = await rRes.json()

    // ✅ FIX: el backend devuelve { success, data: [...], totales: {...} }
    // No asignar gData completo — solo gData.data
    gastos.value = gData.success && Array.isArray(gData.data) ? gData.data : []

    if (rData.success) resumenData.value = rData.data

  } catch (e) {
    console.error('Error en cargarGastos:', e)
    gastos.value = []  // ✅ siempre array para evitar .reduce falle
    showToast('Error al cargar datos', 'error')
  } finally {
    loading.value.gastos = false
  }
}

const cargarResumenPeriodo = async (periodo) => {
  try {
    const hoy = new Date()
    let params = {}
    if (periodo === 'month') {
      params.fecha_inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
      params.fecha_fin    = hoy.toISOString().split('T')[0]
    } else if (periodo === 'last-month') {
      params.fecha_inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1).toISOString().split('T')[0]
      params.fecha_fin    = new Date(hoy.getFullYear(), hoy.getMonth(), 0).toISOString().split('T')[0]
    } else if (periodo === 'year') {
      params.fecha_inicio = new Date(hoy.getFullYear(), 0, 1).toISOString().split('T')[0]
      params.fecha_fin    = hoy.toISOString().split('T')[0]
    }
    const res  = await fetch(`${API_URL}/gastos/resumen?${new URLSearchParams(params)}`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) { resumenData.value = data.data; modalResumenVisible.value = true }
  } catch { showToast('Error al cargar resumen', 'error') }
}

const guardarGasto = async () => {
  formError.value = ''
  if (!form.value.concepto || !form.value.monto || !form.value.fecha || !form.value.categoria) {
    formError.value = 'Concepto, categoría, monto y fecha son obligatorios'; return
  }
  guardando.value = true
  try {
    const url    = modoEdicion.value ? `${API_URL}/gastos/${gastoSeleccionado.value.id}` : `${API_URL}/gastos`
    const method = modoEdicion.value ? 'PUT' : 'POST'
    const res    = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(form.value) })
    const data   = await res.json()
    if (res.ok && data.success) {
      showToast(modoEdicion.value ? 'Gasto actualizado' : 'Gasto registrado')
      cerrarModal(); await cargarGastos()
    } else { formError.value = data.message || 'Error al guardar' }
  } catch { formError.value = 'Error de conexión' }
  finally { guardando.value = false }
}

const eliminarGasto = async (gasto) => {
  if (!confirm(`¿Eliminar "${gasto.concepto}"?`)) return
  try {
    const res  = await fetch(`${API_URL}/gastos/${gasto.id}`, { method:'DELETE', headers: getHeaders() })
    const data = await res.json()
    if (data.success) { showToast('Gasto eliminado'); await cargarGastos() }
    else showToast(data.message || 'Error al eliminar', 'error')
  } catch { showToast('Error de conexión', 'error') }
}

const abrirModalCrear = () => {
  modoEdicion.value = false; gastoSeleccionado.value = null
  form.value = { concepto:'', categoria:'', monto:'', fecha: new Date().toISOString().split('T')[0], notas:'' }
  formError.value = ''; modalVisible.value = true
}
const abrirModalEditar = (gasto) => {
  modoEdicion.value = true; gastoSeleccionado.value = gasto
  form.value = { concepto:gasto.concepto, categoria:gasto.categoria, monto:gasto.monto, fecha:gasto.fecha, notas:gasto.notas||'' }
  formError.value = ''; modalVisible.value = true
}
const cerrarModal = () => { modalVisible.value = false; gastoSeleccionado.value = null; formError.value = '' }
const abrirResumenCompleto = () => cargarResumenPeriodo('month')
const limpiarFiltros = () => { filtros.fecha_desde = ''; filtros.fecha_hasta = ''; filtros.categoria = ''; cargarGastos() }

onMounted(cargarGastos)
</script>

<style scoped>
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
.animate-slide-in { animation: slideIn 0.3s ease-out; }
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>