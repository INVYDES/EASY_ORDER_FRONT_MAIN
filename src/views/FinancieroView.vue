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
        <h2 class="text-2xl font-bold text-gray-900">💰 Configuración Financiera</h2>
        <p class="text-sm text-gray-500 mt-1">Define los datos base para el cálculo de métricas financieras</p>
      </div>
      <button @click="guardar"
        :disabled="cargando"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-50">
        <i class="fa-solid fa-floppy-disk"></i> {{ cargando ? 'Guardando...' : 'Guardar Configuración' }}
      </button>
    </div>

    <!-- Formulario -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

      <!-- Columnas del formulario -->
      <div class="xl:col-span-2 space-y-6">

        <!-- Configuración Inicial -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-lg">🏗️</div>
            <div>
              <h3 class="text-lg font-bold text-gray-800">Configuración Inicial</h3>
              <p class="text-xs text-gray-400">Datos de inversión y metas del negocio</p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Inversión Inicial</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                <input v-model.number="form.inversion_inicial" type="number" min="0" step="0.01"
                  class="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="0.00" />
              </div>
              <p class="text-[10px] text-gray-400 mt-1">Monto total invertido para abrir el restaurante</p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Utilidad Objetivo (Mensual)</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                <input v-model.number="form.utilidad_objetivo" type="number" min="0" step="0.01"
                  class="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="0.00" />
              </div>
              <p class="text-[10px] text-gray-400 mt-1">Ganancia neta que esperas obtener cada mes</p>
            </div>
          </div>
        </div>

        <!-- Gastos Fijos Mensuales -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-lg">📉</div>
            <div>
              <h3 class="text-lg font-bold text-gray-800">Gastos Fijos Mensuales</h3>
              <p class="text-xs text-gray-400">Costos recurrentes para operar el negocio</p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Renta</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                <input v-model.number="form.gasto_renta" type="number" min="0" step="0.01"
                  class="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="0.00" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Servicios (agua, luz, internet)</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                <input v-model.number="form.gasto_servicios" type="number" min="0" step="0.01"
                  class="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="0.00" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Software / Apps</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                <input v-model.number="form.gasto_software" type="number" min="0" step="0.01"
                  class="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="0.00" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Marketing / Publicidad</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                <input v-model.number="form.gasto_marketing" type="number" min="0" step="0.01"
                  class="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="0.00" />
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Vista previa de métricas -->
      <div class="xl:col-span-1">
        <div class="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 shadow-sm p-5 sticky top-6">
          <div class="flex items-center gap-2 mb-4">
            <i class="fa-solid fa-chart-line text-indigo-600"></i>
            <h4 class="text-sm font-bold text-indigo-800 uppercase tracking-wider">Vista Previa</h4>
          </div>
          <p class="text-[10px] text-indigo-400 mb-4">Así se reflejarán estos datos en Análisis Financiero</p>

          <div class="space-y-3">
            <div class="bg-white rounded-xl p-3 border border-indigo-50">
              <p class="text-[10px] text-gray-400 uppercase tracking-wider">Inversión Inicial</p>
              <p class="text-lg font-bold text-gray-800">${{ fm(form.inversion_inicial) }}</p>
            </div>
            <div class="bg-white rounded-xl p-3 border border-indigo-50">
              <p class="text-[10px] text-gray-400 uppercase tracking-wider">Costo Operativo Mensual</p>
              <p class="text-lg font-bold text-red-600">${{ fm(totalGastosMensuales) }}</p>
              <p class="text-[9px] text-gray-400 mt-0.5">Variables + Operativos</p>
            </div>
            <div class="bg-white rounded-xl p-3 border border-indigo-50">
              <p class="text-[10px] text-gray-400 uppercase tracking-wider">Utilidad Objetivo</p>
              <p class="text-lg font-bold text-emerald-600">${{ fm(form.utilidad_objetivo) }}</p>
            </div>
            <div class="bg-white rounded-xl p-3 border border-indigo-50">
              <p class="text-[10px] text-gray-400 uppercase tracking-wider">Punto de Equilibrio</p>
              <p class="text-lg font-bold text-indigo-600">${{ fm(puntoEquilibrio) }}</p>
              <p class="text-[9px] text-gray-400 mt-0.5">Ventas necesarias para cubrir gastos</p>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-indigo-100">
            <p class="text-[9px] text-indigo-400 leading-relaxed">
              <i class="fa-solid fa-info-circle mr-1"></i>
              Los campos de Ventas, ROI y % Utilidad se calculan automáticamente según las ventas reales del periodo.
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
