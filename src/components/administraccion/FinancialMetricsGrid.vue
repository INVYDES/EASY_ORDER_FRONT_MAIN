<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

    <!-- 1. Utilidad Objetivo / Real -->
    <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Utilidad Objetivo / Real</p>
      <div class="grid grid-cols-2 gap-2">
        <div class="bg-gray-50 p-2 rounded-lg border border-gray-100">
          <span class="block text-[10px] text-gray-400 uppercase">Objetivo</span>
          <span class="text-lg font-bold text-gray-800">${{ metrics.utilidadObjetivo || 0 }}</span>
        </div>
        <div class="bg-indigo-50 p-2 rounded-lg border border-indigo-100">
          <span class="block text-[10px] text-indigo-400 uppercase">Real</span>
          <span class="text-lg font-bold text-indigo-700">${{ metrics.utilidadReal || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- 2. Inversión Inicial -->
    <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Inversión Inicial</p>
      <span class="text-2xl font-bold text-gray-800">${{ metrics.inversionInicial || 0 }}</span>
    </div>

    <!-- 3. Ventas Mensuales -->
    <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ventas Mensuales</p>
      <span class="text-2xl font-bold text-emerald-600">${{ metrics.ventasMensuales || 0 }}</span>
      <p class="text-[10px] text-gray-400 mt-1">Acumulado del mes</p>
    </div>

    <!-- 4. Gastos Variables -->
    <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Gastos Variables</p>
      <span class="text-2xl font-bold text-red-500">${{ metrics.gastosVariables || 0 }}</span>
      <p class="text-[10px] text-gray-400 mt-1">Insumos, empaque, comisiones</p>
    </div>

    <!-- 5. Gastos Operativos -->
    <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Gastos Operativos</p>
      <span class="text-2xl font-bold text-red-500">${{ metrics.gastosOperativos || 0 }}</span>
      <p class="text-[10px] text-gray-400 mt-1">Renta, nómina, servicios, soft, mkt</p>
    </div>

    <!-- 6. ⭐ Ganancia Neta Mensual — destacada -->
    <div class="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-2xl border-2 border-indigo-400 shadow-lg shadow-indigo-100 relative overflow-hidden">
      <span class="absolute top-2 right-2 text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full">⭐ Métrica Clave</span>
      <p class="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">Ganancia Neta Mensual</p>
      <span class="text-2xl font-bold text-indigo-700">${{ metrics.gananciaNeta || 0 }}</span>
    </div>

    <!-- 7. Punto de Equilibrio + Barra de Cumplimiento -->
    <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm col-span-1 sm:col-span-2">
      <div class="flex items-center justify-between mb-2">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ventas vs. Punto de Equilibrio</p>
        <span class="text-xs font-bold px-2 py-0.5 rounded-full"
          :class="cumplimientoPE >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
          {{ cumplimientoPE >= 100 ? '✅ Superado' : '⚠ Pendiente' }}
        </span>
      </div>
      <div class="flex items-end gap-4 mb-3">
        <div>
          <span class="text-[10px] text-gray-400 uppercase block">P. Equilibrio</span>
          <span class="text-lg font-bold text-gray-700">${{ metrics.puntoEquilibrio || 0 }}</span>
        </div>
        <div>
          <span class="text-[10px] text-gray-400 uppercase block">Ventas</span>
          <span class="text-lg font-bold text-emerald-600">${{ metrics.ventasMensuales || 0 }}</span>
        </div>
        <div class="ml-auto">
          <span class="text-2xl font-black" :class="cumplimientoPE >= 100 ? 'text-emerald-600' : 'text-amber-500'">
            {{ cumplimientoPE }}%
          </span>
        </div>
      </div>
      <!-- Barra de progreso -->
      <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div class="h-full rounded-full transition-all duration-1000"
          :class="cumplimientoPE >= 100 ? 'bg-emerald-500' : cumplimientoPE >= 75 ? 'bg-amber-400' : 'bg-red-400'"
          :style="{ width: Math.min(cumplimientoPE, 100) + '%' }">
        </div>
      </div>
      <p class="text-[10px] text-gray-400 mt-1">Fórmula: Ventas / Punto de Equilibrio × 100</p>
    </div>

    <!-- 8. ROI con Semáforo -->
    <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">ROI</p>
      <div class="flex items-center gap-3 mb-3">
        <!-- Semáforo -->
        <div class="flex flex-col gap-1.5">
          <div class="w-4 h-4 rounded-full transition-all"
            :class="roiStatus === 'verde' ? 'bg-emerald-500 shadow-md shadow-emerald-300' : 'bg-emerald-200'"></div>
          <div class="w-4 h-4 rounded-full transition-all"
            :class="roiStatus === 'amarillo' ? 'bg-amber-400 shadow-md shadow-amber-300' : 'bg-amber-100'"></div>
          <div class="w-4 h-4 rounded-full transition-all"
            :class="roiStatus === 'rojo' ? 'bg-red-500 shadow-md shadow-red-300' : 'bg-red-100'"></div>
        </div>
        <div>
          <span class="text-2xl font-bold" :class="roiColorClass">{{ metrics.roiGeneral || 0 }}%</span>
          <p class="text-[10px] text-gray-400">General</p>
        </div>
        <div class="ml-auto text-right">
          <span class="text-lg font-bold text-gray-600">{{ metrics.roiProducto || 0 }}%</span>
          <p class="text-[10px] text-gray-400">Producto</p>
        </div>
      </div>
      <!-- Leyenda semáforo -->
      <div class="flex flex-col gap-0.5 text-[10px] text-gray-400">
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-400 inline-block"></span>&lt;5% Crítico</span>
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>5–15% Regular</span>
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>&gt;15% Óptimo</span>
      </div>
    </div>

    <!-- 9. Margen de Contribución -->
    <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Margen Contribución</p>
      <span class="text-2xl font-bold text-gray-800">${{ metrics.margenContribucion || 0 }}</span>
    </div>

    <!-- 10. % Utilidad -->
    <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">% Utilidad</p>
      <span class="text-2xl font-bold text-indigo-600">{{ metrics.porcentajeUtilidad || 0 }}%</span>
    </div>

    <!-- 11. KPI Empleados -->
    <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">KPI Empleados</p>
      <span class="text-2xl font-bold text-gray-800">{{ metrics.kpiEmpleados || 0 }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  metrics: { type: Object, required: true, default: () => ({}) }
})

// Semáforo ROI
const roiStatus = computed(() => {
  const roi = Number(props.metrics.roiGeneral || 0)
  if (roi > 15) return 'verde'
  if (roi >= 5) return 'amarillo'
  return 'rojo'
})

const roiColorClass = computed(() => ({
  verde: 'text-emerald-600',
  amarillo: 'text-amber-500',
  rojo: 'text-red-600'
}[roiStatus.value]))

// % Cumplimiento Punto de Equilibrio
const cumplimientoPE = computed(() => {
  const pe = Number(props.metrics.puntoEquilibrio || 0)
  const v  = Number(props.metrics.ventasMensuales || 0)
  if (pe === 0) return 0
  return Math.round((v / pe) * 100)
})
</script>
