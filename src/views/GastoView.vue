<template>
  <div class="space-y-6">

    <!-- TOASTS -->
    <div class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <div v-for="toast in toasts" :key="toast.id"
        :class="['px-4 py-3 rounded-lg shadow-md flex items-center gap-3 min-w-72 pointer-events-auto animate-slide-in border',
          toast.type === 'success' ? 'bg-[#E8F1ED] border-[#26734D]/30 text-[#202723]'
                                   : 'bg-[#FEF2F2] border-[#B93838]/30 text-[#202723]']">
        <i :class="toast.type === 'success' ? 'fa-solid fa-circle-check text-[#26734D]' : 'fa-solid fa-circle-xmark text-[#B93838]'"></i>
        <span class="text-xs font-medium flex-1">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="text-[#68736C] hover:text-[#202723] cursor-pointer">
          <i class="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>
    </div>

    <!-- Encabezado Sticky -->
    <div class="sticky -top-4 lg:-top-8 z-20 bg-gray-50/95 backdrop-blur-xs -mx-4 lg:-mx-8 px-4 lg:px-8 pt-4 lg:pt-8 pb-3 border-b border-[#DDE3DE] shadow-xs flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-semibold text-[#202723]">Gestión de Gastos</h2>
        <p class="text-xs text-[#68736C] mt-0.5">Control y análisis de gastos operativos del restaurante</p>
      </div>
      <div class="flex gap-2">
        <button @click="abrirResumenCompleto"
          class="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#DDE3DE] text-[#202723] hover:bg-[#F6F7F5] text-xs font-semibold rounded-lg transition shadow-xs cursor-pointer">
          <i class="fa-solid fa-chart-pie text-xs text-[#245C4F]"></i> Análisis de Gastos
        </button>
        <button @click="abrirModalCrear"
          class="inline-flex items-center gap-2 px-3.5 py-2 bg-[#245C4F] text-white text-xs font-semibold rounded-lg hover:bg-[#19483D] transition shadow-xs cursor-pointer">
          <i class="fa-solid fa-plus text-xs"></i> Nuevo Gasto
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-xl shadow-xs border border-[#DDE3DE] p-4">
      <p class="text-[11px] font-semibold text-[#68736C] uppercase tracking-wider mb-2.5">Filtros</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label class="block text-xs font-semibold text-[#202723] mb-1">Desde</label>
          <input type="date" v-model="filtros.fecha_desde" @change="cargarGastos"
            class="w-full px-3 py-1.5 border border-[#DDE3DE] rounded-lg text-xs focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-[#202723] mb-1">Hasta</label>
          <input type="date" v-model="filtros.fecha_hasta" @change="cargarGastos"
            class="w-full px-3 py-1.5 border border-[#DDE3DE] rounded-lg text-xs focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-[#202723] mb-1">Categoría</label>
          <select v-model="filtros.categoria" @change="cargarGastos"
            class="w-full px-3 py-1.5 border border-[#DDE3DE] rounded-lg text-xs focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none bg-white">
            <option value="">Todas</option>
            <option v-for="(label, value) in categorias" :key="value" :value="value">{{ label }}</option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="limpiarFiltros"
            class="w-full px-3 py-1.5 bg-[#F0F2EF] text-[#202723] text-xs font-semibold rounded-lg hover:bg-[#DDE3DE] transition cursor-pointer">
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Distribución por categoría -->
    <div v-if="Object.keys(totalesPorCategoria).length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div v-for="(monto, categoria) in totalesPorCategoria" :key="categoria"
        class="bg-white rounded-xl border border-[#DDE3DE] shadow-xs p-3 text-center">
        <div class="w-8 h-8 rounded-lg bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-xs mx-auto mb-1.5">
          <i :class="getCategoriaIcon(categoria)"></i>
        </div>
        <p class="text-[11px] text-[#68736C] mb-0.5 truncate">{{ categorias[categoria] || categoria }}</p>
        <p class="text-xs font-bold text-[#202723]">${{ formatMoney(monto) }}</p>
        <div class="mt-2 h-1.5 rounded-full bg-[#E8F1ED] overflow-hidden">
          <div class="h-full rounded-full bg-[#245C4F] transition-all duration-500"
            :style="{ width: `${Math.min((monto / totalGastos) * 100, 100)}%` }"></div>
        </div>
        <p class="text-[10px] text-[#68736C] mt-1">{{ totalGastos > 0 ? ((monto / totalGastos) * 100).toFixed(0) : 0 }}%</p>
      </div>
    </div>

    <!-- Tabla de gastos -->
    <div class="bg-white rounded-xl shadow-xs border border-[#DDE3DE] overflow-hidden">
      <div v-if="loading.gastos" class="flex items-center justify-center gap-3 py-16 text-[#68736C] text-xs">
        <div class="w-8 h-8 border-4 border-[#E8F1ED] border-t-[#245C4F] rounded-full animate-spin"></div>
        Cargando gastos...
      </div>
      <div v-else-if="gastos.length === 0" class="text-center py-16">
        <div class="w-12 h-12 bg-[#F0F2EF] text-[#68736C] rounded-full flex items-center justify-center mx-auto mb-2 text-lg">
          <i class="fa-solid fa-receipt"></i>
        </div>
        <p class="text-[#68736C] text-xs">Sin gastos registrados en este período</p>
        <button @click="abrirModalCrear"
          class="mt-3 px-3.5 py-1.5 bg-[#245C4F] text-white text-xs font-semibold rounded-lg hover:bg-[#19483D] transition cursor-pointer shadow-xs">
          Registrar el primero
        </button>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-[#DDE3DE]">
          <thead class="bg-[#F0F2EF]">
            <tr>
              <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Concepto</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Categoría</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Fecha</th>
              <th class="px-5 py-3 text-right text-xs font-semibold text-[#68736C] uppercase tracking-wider">Monto</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-[#68736C] uppercase tracking-wider">Notas</th>
              <th class="px-5 py-3 text-right text-xs font-semibold text-[#68736C] uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#DDE3DE]">
            <tr v-for="gasto in gastos" :key="gasto.id" class="hover:bg-[#F6F7F5] transition-colors">
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-7 h-7 rounded-md bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-xs shrink-0">
                    <i :class="getCategoriaIcon(gasto.categoria)"></i>
                  </div>
                  <p class="text-xs font-medium text-[#202723]">{{ gasto.concepto }}</p>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-[#F0F2EF] text-[#68736C] border border-[#DDE3DE] capitalize">
                  {{ gasto.categoria_formateada || categorias[gasto.categoria] || gasto.categoria }}
                </span>
              </td>
              <td class="px-5 py-3.5 text-xs text-[#68736C]">{{ formatFecha(gasto.fecha) }}</td>
              <td class="px-5 py-3.5 text-right">
                <span class="text-xs font-bold text-[#B93838]">{{ gasto.monto_formateado || ('$' + formatMoney(gasto.monto)) }}</span>
              </td>
              <td class="px-5 py-3.5 text-xs text-[#68736C] max-w-xs truncate">{{ gasto.notas || '—' }}</td>
              <td class="px-5 py-3.5 text-right">
                <div class="flex justify-end gap-1.5">
                  <button @click="abrirModalEditar(gasto)"
                    class="text-xs px-2.5 py-1 rounded-md bg-[#E8F1ED] text-[#245C4F] hover:bg-[#245C4F] hover:text-white transition-colors font-semibold cursor-pointer flex items-center gap-1">
                    <i class="fa-solid fa-pen-to-square text-[11px]"></i> Editar
                  </button>
                  <button @click="eliminarGasto(gasto)"
                    class="text-xs px-2.5 py-1 rounded-md bg-[#B93838]/10 text-[#B93838] hover:bg-[#B93838] hover:text-white transition-colors font-semibold cursor-pointer flex items-center gap-1">
                    <i class="fa-solid fa-trash-can text-[11px]"></i> Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-[#F0F2EF] border-t border-[#DDE3DE]">
            <tr>
              <td colspan="3" class="px-5 py-3 text-xs font-semibold text-[#202723]">Total del período</td>
              <td class="px-5 py-3 text-right text-xs font-bold text-[#B93838]">${{ formatMoney(totalGastos) }}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- ══ MODAL CREAR / EDITAR ══ -->
    <div v-if="modalVisible" class="fixed inset-0 bg-[#202723]/50 z-50 flex items-center justify-center px-4"
      @click.self="cerrarModal">
      <div class="bg-white rounded-xl shadow-xl border border-[#DDE3DE] w-full max-w-md p-6">
        <div class="flex items-center justify-between mb-4 border-b border-[#DDE3DE] pb-3">
          <h3 class="text-base font-semibold text-[#202723]">{{ modoEdicion ? 'Editar gasto' : 'Registrar gasto' }}</h3>
          <button @click="cerrarModal" class="text-[#68736C] hover:text-[#202723] w-7 h-7 rounded-lg hover:bg-[#F0F2EF] flex items-center justify-center text-sm transition cursor-pointer">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div v-if="formError" class="mb-4 p-3 text-xs text-[#B93838] bg-[#FEF2F2] border border-[#B93838]/20 rounded-lg">{{ formError }}</div>
        <div class="space-y-3.5">
          <div>
            <label class="block text-xs font-semibold text-[#202723] mb-1">Concepto *</label>
            <input v-model="form.concepto" type="text" placeholder="Ej. Pago de renta" maxlength="200"
              class="w-full px-3 py-2 border border-[#DDE3DE] rounded-lg text-xs focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-[#202723] mb-1">Categoría *</label>
              <select v-model="form.categoria"
                class="w-full px-3 py-2 border border-[#DDE3DE] rounded-lg text-xs focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none bg-white">
                <option value="">Seleccionar</option>
                <option v-for="(label, value) in categorias" :key="value" :value="value">{{ label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-[#202723] mb-1">Monto *</label>
              <div class="relative">
                <span class="absolute left-3 top-2 text-[#68736C] text-xs font-semibold">$</span>
                <input v-model="form.monto" type="number" min="0.01" step="0.01"
                  class="w-full pl-6 pr-3 py-2 border border-[#DDE3DE] rounded-lg text-xs focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none" />
              </div>
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-[#202723] mb-1">Fecha *</label>
            <input v-model="form.fecha" type="date"
              class="w-full px-3 py-2 border border-[#DDE3DE] rounded-lg text-xs focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-[#202723] mb-1">Notas <span class="text-[#68736C] font-normal">(opcional)</span></label>
            <textarea v-model="form.notas" rows="2" placeholder="Detalles adicionales" maxlength="500"
              class="w-full px-3 py-2 border border-[#DDE3DE] rounded-lg text-xs focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none resize-none"></textarea>
          </div>
        </div>
        <div class="flex gap-2.5 mt-5">
          <button @click="cerrarModal"
            class="flex-1 py-2 text-xs font-semibold text-[#202723] bg-[#F0F2EF] hover:bg-[#DDE3DE] rounded-lg transition cursor-pointer">Cancelar</button>
          <button @click="guardarGasto" :disabled="guardando"
            class="flex-1 py-2 text-xs font-semibold text-white bg-[#245C4F] hover:bg-[#19483D] rounded-lg transition disabled:opacity-50 cursor-pointer shadow-xs">
            {{ guardando ? 'Guardando...' : (modoEdicion ? 'Guardar cambios' : 'Registrar gasto') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══ MODAL ROI / RESUMEN ══ -->
    <div v-if="modalResumenVisible" class="fixed inset-0 bg-[#202723]/50 z-50 flex items-center justify-center p-4"
      @click.self="modalResumenVisible = false">
      <div class="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-[#DDE3DE]">
        <div class="sticky top-0 bg-white z-10 flex items-center justify-between p-5 border-b border-[#DDE3DE]">
          <h3 class="text-base font-semibold text-[#202723] flex items-center gap-2">
            <i class="fa-solid fa-chart-pie text-[#245C4F]"></i> Análisis de Gastos y Rentabilidad
          </h3>
          <button @click="modalResumenVisible = false" class="text-[#68736C] hover:text-[#202723] w-7 h-7 rounded-lg hover:bg-[#F0F2EF] flex items-center justify-center text-sm transition cursor-pointer">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="p-6 space-y-5">
          <div class="flex items-center justify-between flex-wrap gap-3 bg-[#F6F7F5] border border-[#DDE3DE] rounded-lg p-3.5">
            <div>
              <p class="text-[11px] text-[#68736C]">Período analizado</p>
              <p class="font-semibold text-[#202723] text-xs mt-0.5">
                {{ formatFecha(resumenData.periodo?.inicio) }} — {{ formatFecha(resumenData.periodo?.fin) }}
              </p>
            </div>
            <div class="flex gap-1.5">
              <button @click="cargarResumenPeriodo('month')"
                class="px-3 py-1 text-xs font-semibold bg-[#E8F1ED] text-[#245C4F] rounded-md hover:bg-[#245C4F] hover:text-white transition cursor-pointer">Este Mes</button>
              <button @click="cargarResumenPeriodo('last-month')"
                class="px-3 py-1 text-xs font-semibold bg-[#F0F2EF] text-[#202723] rounded-md hover:bg-[#DDE3DE] transition cursor-pointer">Mes Anterior</button>
              <button @click="cargarResumenPeriodo('year')"
                class="px-3 py-1 text-xs font-semibold bg-[#F0F2EF] text-[#202723] rounded-md hover:bg-[#DDE3DE] transition cursor-pointer">Este Año</button>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="bg-white border border-[#DDE3DE] rounded-xl p-4 shadow-xs">
              <p class="text-xs text-[#68736C] uppercase font-semibold">Ventas Totales</p>
              <p class="text-xl font-bold text-[#202723] mt-1">${{ formatMoney(resumenData.ventas) }}</p>
            </div>
            <div class="bg-white border border-[#DDE3DE] rounded-xl p-4 shadow-xs">
              <p class="text-xs text-[#68736C] uppercase font-semibold">Total Gastos</p>
              <p class="text-xl font-bold text-[#B93838] mt-1">${{ formatMoney(resumenData.total_gastos) }}</p>
            </div>
            <div class="bg-white border border-[#DDE3DE] rounded-xl p-4 shadow-xs">
              <p class="text-xs text-[#68736C] uppercase font-semibold">Utilidad Bruta</p>
              <p class="text-xl font-bold text-[#26734D] mt-1">${{ formatMoney(resumenData.utilidad_bruta) }}</p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white border border-[#DDE3DE] rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-xs">
              <p class="text-xs text-[#68736C] uppercase font-semibold">Retorno sobre Inversión (ROI)</p>
              <p class="text-4xl font-bold mt-2"
                :class="(resumenData.roi_pct || 0) >= 0 ? 'text-[#26734D]' : 'text-[#B93838]'">
                {{ resumenData.roi_pct !== null ? ((resumenData.roi_pct >= 0 ? '+' : '') + resumenData.roi_pct + '%') : '—' }}
              </p>
              <p class="text-xs text-[#68736C] mt-2 flex items-center gap-1.5">
                <i :class="(resumenData.roi_pct || 0) >= 0 ? 'fa-solid fa-circle-check text-[#26734D]' : 'fa-solid fa-circle-exclamation text-[#B93838]'"></i>
                {{ (resumenData.roi_pct || 0) >= 0 ? 'Operación rentable' : 'Operación con pérdida' }}
              </p>
            </div>
            <div class="bg-white border border-[#DDE3DE] rounded-xl p-5 shadow-xs">
              <p class="text-xs text-[#68736C] uppercase font-semibold mb-3">Distribución de Gastos</p>
              <div class="space-y-3 max-h-48 overflow-y-auto pr-1">
                <div v-for="(monto, categoria) in resumenData.por_categoria" :key="categoria" class="flex items-center gap-2.5">
                  <div class="w-6 h-6 rounded bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-xs shrink-0">
                    <i :class="getCategoriaIcon(categoria)"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between text-xs mb-1">
                      <span class="text-[#202723] truncate">{{ categorias[categoria] || categoria }}</span>
                      <span class="font-semibold text-[#202723] ml-2 shrink-0">${{ formatMoney(monto) }}</span>
                    </div>
                    <div class="h-1.5 bg-[#E8F1ED] rounded-full overflow-hidden">
                      <div class="h-full rounded-full bg-[#245C4F] transition-all duration-500"
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
import { apiClient } from '@/utils/apiClient'

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

// El backend (/gastos/resumen) devuelve ventas_periodo / utilidad_real / roi_periodo_pct.
// Se normalizan aquí para que la tarjeta de ROI nunca muestre "NaN%".
const normalizarResumen = (raw) => ({
  ...raw,
  ventas:          Number(raw?.ventas_periodo ?? raw?.ventas ?? 0),
  total_gastos:    Number(raw?.total_gastos ?? 0),
  utilidad_bruta:  Number(raw?.utilidad_real ?? raw?.utilidad_bruta ?? 0),
  roi_pct:         raw?.roi_periodo_pct !== null && raw?.roi_periodo_pct !== undefined
                     ? Number(raw.roi_periodo_pct)
                     : (raw?.roi_pct !== null && raw?.roi_pct !== undefined ? Number(raw.roi_pct) : null),
})

const filtros = reactive({
  fecha_desde: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-CA'),
  fecha_hasta: new Date().toLocaleDateString('en-CA'),
  categoria:   '',
})

const form = ref({
  concepto: '', categoria: '', monto: '',
  fecha: new Date().toLocaleDateString('en-CA'), notas: '',
})

// ── CATÁLOGOS ──────────────────────────────────────────────
const categorias = {
  renta:         'Renta',
  nomina:        'Nómina',
  servicios:     'Servicios',
  insumos:       'Insumos',
  marketing:     'Marketing',
  mantenimiento: 'Mantenimiento',
  general:       'General',
}

const getCategoriaIcon = (cat) => ({
  renta:         'fa-solid fa-building',
  nomina:        'fa-solid fa-users',
  servicios:     'fa-solid fa-bolt',
  insumos:       'fa-solid fa-boxes-stacked',
  marketing:     'fa-solid fa-bullhorn',
  mantenimiento: 'fa-solid fa-wrench',
  general:       'fa-solid fa-box',
}[cat] || 'fa-solid fa-box')

// ── HELPERS ────────────────────────────────────────────────
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
  if (!filtros.fecha_desde || !filtros.fecha_hasta) {
    gastos.value = []
    showToast('Falta seleccionar fechas', 'error')
    return
  }
  loading.value.gastos = true
  try {
    const params = new URLSearchParams()
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde)
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta)
    if (filtros.categoria)   params.append('categoria',   filtros.categoria)

    const [gData, rData] = await Promise.all([
      apiClient.get(`/gastos?${params}`),
      apiClient.get(`/gastos/resumen?fecha_inicio=${filtros.fecha_desde}&fecha_fin=${filtros.fecha_hasta}`),
    ])

    // FIX: el backend devuelve { data: [...] }
    gastos.value = Array.isArray(gData.data) ? gData.data : []

    if (rData.data) resumenData.value = normalizarResumen(rData.data)

  } catch (e) {
    console.error('Error en cargarGastos:', e)
    gastos.value = []
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
      params.fecha_inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toLocaleDateString('en-CA')
      params.fecha_fin    = hoy.toLocaleDateString('en-CA')
    } else if (periodo === 'last-month') {
      params.fecha_inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1).toLocaleDateString('en-CA')
      params.fecha_fin    = new Date(hoy.getFullYear(), hoy.getMonth(), 0).toLocaleDateString('en-CA')
    } else if (periodo === 'year') {
      params.fecha_inicio = new Date(hoy.getFullYear(), 0, 1).toLocaleDateString('en-CA')
      params.fecha_fin    = hoy.toLocaleDateString('en-CA')
    }
    const data = await apiClient.get(`/gastos/resumen?${new URLSearchParams(params)}`)
    if (data.data) { resumenData.value = normalizarResumen(data.data); modalResumenVisible.value = true }
  } catch { showToast('Error al cargar resumen', 'error') }
}

const guardarGasto = async () => {
  formError.value = ''
  if (!form.value.concepto || !form.value.monto || !form.value.fecha || !form.value.categoria) {
    formError.value = 'Concepto, categoría, monto y fecha son obligatorios'; return
  }
  guardando.value = true
  try {
    const isEdit = !!modoEdicion.value
    const url    = isEdit ? `/gastos/${gastoSeleccionado.value.id}` : `/gastos`
    const method = isEdit ? 'put' : 'post'
    const data   = await apiClient[method](url, form.value)
    
    if (data.data || data.success) {
      showToast(isEdit ? 'Gasto actualizado' : 'Gasto registrado')
      cerrarModal(); await cargarGastos()
    } else { formError.value = data.message || 'Error al guardar' }
  } catch { formError.value = 'Error de conexión' }
  finally { guardando.value = false }
}

const eliminarGasto = async (gasto) => {
  if (!confirm(`¿Eliminar "${gasto.concepto}"?`)) return
  try {
    const data = await apiClient.delete(`/gastos/${gasto.id}`)
    if (data.success || data.data) { showToast('Gasto eliminado'); await cargarGastos() }
    else showToast(data.message || 'Error al eliminar', 'error')
  } catch { showToast('Error de conexión', 'error') }
}

const abrirModalCrear = () => {
  modoEdicion.value = false; gastoSeleccionado.value = null
  form.value = { concepto:'', categoria:'', monto:'', fecha: new Date().toLocaleDateString('en-CA'), notas:'' }
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