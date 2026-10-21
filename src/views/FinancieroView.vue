<template>
  <div class="space-y-6">

    <!-- TOASTS -->
    <div class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <div v-for="toast in toasts" :key="toast.id"
        :class="['px-4 py-3 rounded-lg shadow-md flex items-center gap-3 min-w-72 pointer-events-auto border animate-slide-in',
          toast.type === 'success' ? 'bg-[#E8F1ED] border-[#26734D]/30 text-[#202723]'
                                   : 'bg-[#FEF2F2] border-[#B93838]/30 text-[#202723]']">
        <i :class="toast.type === 'success' ? 'fa-solid fa-circle-check text-[#26734D]' : 'fa-solid fa-circle-xmark text-[#B93838]'"></i>
        <span class="text-xs font-medium flex-1">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="text-[#68736C] hover:text-[#202723]">
          <i class="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>
    </div>

    <!-- Encabezado (Sticky frosted header) -->
    <div class="sticky -top-4 lg:-top-8 z-20 bg-gray-50/95 backdrop-blur-xs -mx-4 lg:-mx-8 px-4 lg:px-8 pt-4 lg:pt-8 pb-3 border-b border-[#DDE3DE] shadow-xs flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-xl md:text-2xl font-bold tracking-tight text-[#202723]">Configuración Financiera</h2>
        <p class="text-xs md:text-sm text-[#68736C] mt-1">Define los datos base para el cálculo de métricas financieras</p>
      </div>
      <button @click="guardar"
        :disabled="cargando"
        class="inline-flex items-center gap-2 px-4 py-2 bg-[#245C4F] text-white text-xs font-semibold rounded-lg hover:bg-[#19483D] transition shadow-xs disabled:opacity-50 cursor-pointer">
        <i class="fa-solid fa-floppy-disk text-xs"></i> {{ cargando ? 'Guardando...' : 'Guardar Configuración' }}
      </button>
    </div>

    <!-- Formulario -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

      <!-- Columnas del formulario -->
      <div class="xl:col-span-2 space-y-6">

        <!-- Configuración Inicial -->
        <div class="bg-white rounded-xl shadow-xs border border-[#DDE3DE] p-6">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-lg bg-[#E8F1ED] text-[#245C4F] flex items-center justify-center text-base">
              <i class="fa-solid fa-building-columns"></i>
            </div>
            <div>
              <h3 class="text-base font-semibold text-[#202723]">Configuración Inicial</h3>
              <p class="text-xs text-[#68736C]">Datos de inversión y metas del negocio</p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-semibold text-[#202723] mb-1.5">Inversión Inicial</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#68736C] font-semibold text-xs">$</span>
                <input v-model.number="form.inversion_inicial" type="number" min="0" step="0.01"
                  class="w-full pl-7 pr-3.5 py-2 border border-[#DDE3DE] rounded-lg text-xs text-[#202723] bg-white focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none transition"
                  placeholder="0.00" />
              </div>
              <p class="text-[11px] text-[#68736C] mt-1">Monto total invertido para abrir el restaurante</p>
            </div>
            <div>
              <label class="block text-xs font-semibold text-[#202723] mb-1.5">Utilidad Objetivo (Mensual)</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#68736C] font-semibold text-xs">$</span>
                <input v-model.number="form.utilidad_objetivo" type="number" min="0" step="0.01"
                  class="w-full pl-7 pr-3.5 py-2 border border-[#DDE3DE] rounded-lg text-xs text-[#202723] bg-white focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none transition"
                  placeholder="0.00" />
              </div>
              <p class="text-[11px] text-[#68736C] mt-1">Ganancia neta que esperas obtener cada mes</p>
            </div>
          </div>
        </div>

        <!-- Gastos Fijos Mensuales -->
        <div class="bg-white rounded-xl shadow-xs border border-[#DDE3DE] p-6">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-lg bg-[#FEF7EC] text-[#A96517] flex items-center justify-center text-base">
              <i class="fa-solid fa-file-invoice-dollar"></i>
            </div>
            <div>
              <h3 class="text-base font-semibold text-[#202723]">Gastos Fijos Mensuales</h3>
              <p class="text-xs text-[#68736C]">Costos recurrentes para operar el negocio</p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-semibold text-[#202723] mb-1.5">Renta</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#68736C] font-semibold text-xs">$</span>
                <input v-model.number="form.gasto_renta" type="number" min="0" step="0.01"
                  class="w-full pl-7 pr-3.5 py-2 border border-[#DDE3DE] rounded-lg text-xs text-[#202723] bg-white focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none transition"
                  placeholder="0.00" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-[#202723] mb-1.5">Servicios (agua, luz, internet)</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#68736C] font-semibold text-xs">$</span>
                <input v-model.number="form.gasto_servicios" type="number" min="0" step="0.01"
                  class="w-full pl-7 pr-3.5 py-2 border border-[#DDE3DE] rounded-lg text-xs text-[#202723] bg-white focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none transition"
                  placeholder="0.00" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-[#202723] mb-1.5">Software / Apps</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#68736C] font-semibold text-xs">$</span>
                <input v-model.number="form.gasto_software" type="number" min="0" step="0.01"
                  class="w-full pl-7 pr-3.5 py-2 border border-[#DDE3DE] rounded-lg text-xs text-[#202723] bg-white focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none transition"
                  placeholder="0.00" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-[#202723] mb-1.5">Marketing / Publicidad</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[#68736C] font-semibold text-xs">$</span>
                <input v-model.number="form.gasto_marketing" type="number" min="0" step="0.01"
                  class="w-full pl-7 pr-3.5 py-2 border border-[#DDE3DE] rounded-lg text-xs text-[#202723] bg-white focus:ring-1 focus:ring-[#245C4F] focus:border-[#245C4F] focus:outline-none transition"
                  placeholder="0.00" />
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Vista previa de métricas -->
      <div class="xl:col-span-1">
        <div class="bg-[#F6F7F5] rounded-xl border border-[#DDE3DE] shadow-xs p-5 sticky top-6">
          <div class="flex items-center gap-2 mb-2">
            <i class="fa-solid fa-chart-line text-[#245C4F] text-sm"></i>
            <h4 class="text-xs font-bold text-[#202723] uppercase tracking-wider">Vista Previa</h4>
          </div>
          <p class="text-xs text-[#68736C] mb-4">Así se reflejarán estos datos en Análisis Financiero</p>

          <div class="space-y-3">
            <div class="bg-white rounded-lg p-3.5 border border-[#DDE3DE] shadow-xs">
              <p class="text-[10px] text-[#68736C] uppercase tracking-wider font-semibold">Inversión Inicial</p>
              <p class="text-lg font-bold text-[#202723] mt-0.5">${{ fm(form.inversion_inicial) }}</p>
            </div>
            <div class="bg-white rounded-lg p-3.5 border border-[#DDE3DE] shadow-xs">
              <p class="text-[10px] text-[#68736C] uppercase tracking-wider font-semibold">Costo Operativo Mensual</p>
              <p class="text-lg font-bold text-[#B93838] mt-0.5">${{ fm(totalGastosMensuales) }}</p>
              <p class="text-[10px] text-[#68736C] mt-0.5">Variables + Operativos</p>
            </div>
            <div class="bg-white rounded-lg p-3.5 border border-[#DDE3DE] shadow-xs">
              <p class="text-[10px] text-[#68736C] uppercase tracking-wider font-semibold">Utilidad Objetivo</p>
              <p class="text-lg font-bold text-[#26734D] mt-0.5">${{ fm(form.utilidad_objetivo) }}</p>
            </div>
            <div class="bg-white rounded-lg p-3.5 border border-[#DDE3DE] shadow-xs">
              <p class="text-[10px] text-[#68736C] uppercase tracking-wider font-semibold">Punto de Equilibrio</p>
              <p class="text-lg font-bold text-[#245C4F] mt-0.5">${{ fm(puntoEquilibrio) }}</p>
              <p class="text-[10px] text-[#68736C] mt-0.5">Ventas necesarias para cubrir gastos</p>
            </div>
          </div>

          <div class="mt-4 pt-3.5 border-t border-[#DDE3DE]">
            <p class="text-[11px] text-[#68736C] leading-relaxed flex items-start gap-1.5">
              <i class="fa-solid fa-circle-info text-[#245C4F] mt-0.5 shrink-0"></i>
              <span>Los campos de Ventas, ROI y % Utilidad se calculan automáticamente según las ventas reales del periodo.</span>
            </p>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { apiClient } from '@/utils/apiClient'

const cargando = ref(false)
const toasts = ref([])

const form = reactive({
  inversion_inicial: 0,
  utilidad_objetivo: 0,
  gasto_renta: 0,
  gasto_servicios: 0,
  gasto_software: 0,
  gasto_marketing: 0,
})

const totalGastosMensuales = computed(() =>
  (form.gasto_renta || 0) + (form.gasto_servicios || 0) + (form.gasto_software || 0) + (form.gasto_marketing || 0)
)

const puntoEquilibrio = computed(() => {
  const g = totalGastosMensuales.value
  return g || 0
})

const fm = (v) => Number(v || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const showToast = (message, type = 'info') => {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => removeToast(id), 4000)
}
const removeToast = (id) => {
  const i = toasts.value.findIndex(t => t.id === id)
  if (i !== -1) toasts.value.splice(i, 1)
}

const cargarConfig = async () => {
  try {
    const r = await apiClient.get('/reportes/roi')
    if (r.success && r.data) {
      const cfg = r.data.config || {}
      form.inversion_inicial = cfg.inversion_inicial || 0
      form.utilidad_objetivo = cfg.utilidad_objetivo || 0
      form.gasto_renta       = cfg.gasto_renta || 0
      form.gasto_servicios   = cfg.gasto_servicios || 0
      form.gasto_software    = cfg.gasto_software || 0
      form.gasto_marketing   = cfg.gasto_marketing || 0
    }
  } catch (e) {
    console.error('Error cargando configuración financiera:', e)
  }
}

const guardar = async () => {
  cargando.value = true
  try {
    const payload = {
      inversion_inicial: form.inversion_inicial || 0,
      utilidad_objetivo: form.utilidad_objetivo || 0,
      gasto_renta:       form.gasto_renta || 0,
      gasto_servicios:   form.gasto_servicios || 0,
      gasto_software:    form.gasto_software || 0,
      gasto_marketing:   form.gasto_marketing || 0,
    }
    const r = await apiClient.put('/reportes/roi/config', payload)
    if (r.success) {
      showToast('Configuración financiera guardada exitosamente', 'success')
    } else {
      showToast(r.message || 'Error al guardar', 'error')
    }
  } catch (e) {
    showToast('Error de conexión con el servidor', 'error')
    console.error('Error guardando configuración financiera:', e)
  } finally {
    cargando.value = false
  }
}

onMounted(cargarConfig)
</script>

<style scoped>
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
.animate-slide-in { animation: slideIn 0.3s ease-out; }
</style>
