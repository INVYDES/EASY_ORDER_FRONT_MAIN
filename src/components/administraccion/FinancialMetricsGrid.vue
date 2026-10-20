<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

    <!-- 1. Utilidad Objetivo / Real -->
    <div class="bg-white p-5 rounded-xl border border-[#DDE3DE]">
      <div class="flex items-center gap-1.5 mb-3">
        <p class="text-xs font-semibold text-[#68736C] uppercase tracking-wider">Utilidad Objetivo / Real</p>
        <MetricInfoTip titulo="Utilidad Objetivo / Real"
          paraQue="Compara la meta de ganancia neta fijada para el mes contra lo que realmente llevas acumulado."
          comoSeMide="Objetivo: meta establecida en configuración. Real: Ventas del mes - Gastos variables - Gastos operativos." />
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div class="bg-[#F6F7F5] p-2.5 rounded-lg border border-[#DDE3DE]">
          <span class="block text-[11px] font-medium text-[#68736C] uppercase">Objetivo</span>
          <span class="text-base font-semibold text-[#202723] tabular-nums">{{ formatMoney(metrics.utilidadObjetivo) }}</span>
        </div>
        <div class="bg-[#F6F7F5] p-2.5 rounded-lg border border-[#DDE3DE]">
          <span class="block text-[11px] font-medium text-[#68736C] uppercase">Real</span>
          <span class="text-base font-semibold tabular-nums" :class="Number(metrics.utilidadReal || 0) < 0 ? 'text-[#B93838]' : 'text-[#26734D]'">
            {{ formatMoney(metrics.utilidadReal) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 2. Inversión Inicial -->
    <div class="bg-white p-5 rounded-xl border border-[#DDE3DE]">
      <div class="flex items-center gap-1.5 mb-3">
        <p class="text-xs font-semibold text-[#68736C] uppercase tracking-wider">Inversión Inicial</p>
        <MetricInfoTip titulo="Inversión Inicial"
          paraQue="Capital total aportado para abrir, remodelar y equipar el restaurante."
          comoSeMide="Monto registrado en la configuración del negocio. Es la base para calcular el Retorno de Inversión (ROI General)." />
      </div>
      <span class="text-2xl font-semibold tracking-tight text-[#202723] tabular-nums">{{ formatMoney(metrics.inversionInicial) }}</span>
      <p class="text-xs text-[#68736C] mt-1">Capital inicial registrado</p>
    </div>

    <!-- 3. Ventas Mensuales -->
    <div class="bg-white p-5 rounded-xl border border-[#DDE3DE]">
      <div class="flex items-center gap-1.5 mb-3">
        <p class="text-xs font-semibold text-[#68736C] uppercase tracking-wider">Ventas Mensuales</p>
        <MetricInfoTip titulo="Ventas Mensuales"
          paraQue="Ingresos totales brutos generados por pedidos cobrados en el mes actual."
          comoSeMide="Suma de todas las órdenes cerradas durante el mes en curso (no incluye propinas ni pedidos cancelados)." />
      </div>
      <span class="text-2xl font-semibold tracking-tight text-[#245C4F] tabular-nums">{{ formatMoney(metrics.ventasMensuales) }}</span>
      <p class="text-xs text-[#68736C] mt-1">Acumulado del mes en curso</p>
    </div>

    <!-- 4. Gastos Variables -->
    <div class="bg-white p-5 rounded-xl border border-[#DDE3DE]">
      <div class="flex items-center gap-1.5 mb-3">
        <p class="text-xs font-semibold text-[#68736C] uppercase tracking-wider">Gastos Variables</p>
        <MetricInfoTip titulo="Gastos Variables (Food Cost)"
          paraQue="Costo de los insumos y materias primas necesarios para preparar los platillos vendidos."
          comoSeMide="Suma del costo de receta e ingredientes de cada producto vendido. Si vendes más sube; si vendes menos baja." />
      </div>
      <span class="text-2xl font-semibold tracking-tight text-[#B93838] tabular-nums">{{ formatMoney(metrics.gastosVariables) }}</span>
      <p class="text-xs text-[#68736C] mt-1">Insumos y materia prima (Food Cost)</p>
    </div>

    <!-- 5. Gastos Operativos -->
    <div class="bg-white p-5 rounded-xl border border-[#DDE3DE]">
      <div class="flex items-center gap-1.5 mb-3">
        <p class="text-xs font-semibold text-[#68736C] uppercase tracking-wider">Gastos Operativos</p>
        <MetricInfoTip titulo="Gastos Operativos (Fijos)"
          paraQue="Costos fijos necesarios para mantener el negocio abierto, independientemente del volumen de ventas."
          comoSeMide="Renta + Servicios (luz, agua, gas) + Software + Marketing + Gastos registrados en el mes (y nómina pagada si se gestiona en el sistema)." />
      </div>
      <span class="text-2xl font-semibold tracking-tight text-[#B93838] tabular-nums">{{ formatMoney(metrics.gastosOperativos) }}</span>
      <p class="text-xs text-[#68736C] mt-1">Renta, servicios, soft, mkt y gastos</p>
    </div>

    <!-- 6. Ganancia Neta Mensual (Métrica Clave) -->
    <div class="bg-[#FAFBF9] p-5 rounded-xl border-2 border-[#245C4F]">
      <div class="flex items-center gap-1.5">
        <p class="text-xs font-semibold text-[#245C4F] uppercase tracking-wider">Ganancia Neta Mensual</p>
        <MetricInfoTip titulo="Ganancia Neta Mensual"
          paraQue="Dinero real que le queda al negocio tras cubrir ingredientes y todos los costos de operación."
          comoSeMide="Ventas Mensuales - Gastos Variables - Gastos Operativos. Si está en negativo, indica que aún falta venta para cubrir los costos del mes." />
      </div>
      <div class="mt-1 mb-2.5">
        <span class="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E8F1ED] text-[#245C4F]">
          Métrica Clave
        </span>
      </div>
      <span class="text-2xl font-bold tracking-tight tabular-nums block" :class="Number(metrics.gananciaNeta || 0) < 0 ? 'text-[#B93838]' : 'text-[#26734D]'">
        {{ formatMoney(metrics.gananciaNeta) }}
      </span>
      <p class="text-xs text-[#68736C] mt-1">Ventas menos costos totales del mes</p>
    </div>

    <!-- 7. Punto de Equilibrio + Barra de Cumplimiento -->
    <div class="bg-white p-5 rounded-xl border border-[#DDE3DE] col-span-1 sm:col-span-2">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-1.5">
          <p class="text-xs font-semibold text-[#68736C] uppercase tracking-wider">Ventas vs. Punto de Equilibrio</p>
          <MetricInfoTip titulo="Punto de Equilibrio"
            paraQue="Venta mínima que necesitas en el mes para cubrir exactamente todos los costos (utilidad = $0). A partir de aquí todo es ganancia."
            comoSeMide="Punto de Equilibrio = Gastos Operativos ÷ Margen de Contribución %. Cumplimiento % = (Ventas ÷ Punto de Equilibrio) × 100." />
        </div>
        <span class="text-xs font-semibold px-2.5 py-0.5 rounded"
          :class="cumplimientoPE >= 100 ? 'bg-[#E8F1ED] text-[#26734D]' : 'bg-[#FBF4EC] text-[#A96517]'">
          {{ cumplimientoPE >= 100 ? 'Superado' : 'En progreso' }}
        </span>
      </div>
      <div class="flex items-end gap-6 mb-3">
        <div>
          <span class="text-[11px] text-[#68736C] uppercase font-medium block">P. Equilibrio</span>
          <span class="text-lg font-semibold text-[#202723] tabular-nums">{{ formatMoney(metrics.puntoEquilibrio) }}</span>
        </div>
        <div>
          <span class="text-[11px] text-[#68736C] uppercase font-medium block">Ventas</span>
          <span class="text-lg font-semibold text-[#245C4F] tabular-nums">{{ formatMoney(metrics.ventasMensuales) }}</span>
        </div>
        <div class="ml-auto text-right">
          <span class="text-2xl font-bold tabular-nums block" :class="cumplimientoPE >= 100 ? 'text-[#26734D]' : 'text-[#A96517]'">
            {{ cumplimientoPE }}%
          </span>
          <span v-if="(metrics.puntoEquilibrio || 0) === 0" class="text-[10px] text-[#B93838] leading-tight block">No config. gastos operativos</span>
        </div>
      </div>
      <!-- Barra de progreso limpia sin sombras -->
      <div class="w-full bg-[#F0F2EF] rounded-full h-2 overflow-hidden">
        <div class="h-full rounded-full transition-all duration-700"
          :class="cumplimientoPE >= 100 ? 'bg-[#26734D]' : 'bg-[#A96517]'"
          :style="{ width: Math.min(cumplimientoPE, 100) + '%' }">
        </div>
      </div>
      <p class="text-[11px] text-[#68736C] mt-2">Fórmula: Ventas ÷ Punto de Equilibrio × 100</p>
    </div>

    <!-- 8. ROI con Semáforo -->
    <div class="bg-white p-5 rounded-xl border border-[#DDE3DE]">
      <div class="flex items-center gap-1.5 mb-3">
        <p class="text-xs font-semibold text-[#68736C] uppercase tracking-wider">ROI</p>
        <MetricInfoTip titulo="ROI (Retorno de Inversión)"
          paraQue="Mide la rentabilidad del negocio sobre el capital invertido y el rendimiento de tus platillos."
          comoSeMide="General: (Ganancia neta ÷ Inversión inicial) × 100. Semáforo: Verde >15%, Ámbar 5–15%, Rojo <5%. Producto: margen generado por el menú sobre su costo de insumos." />
      </div>
      <div class="flex items-center gap-3 mb-3">
        <!-- Semáforo limpio y plano -->
        <div class="flex flex-col gap-1.5 shrink-0">
          <div class="w-3.5 h-3.5 rounded-full transition-all"
            :class="roiStatus === 'verde' ? 'bg-[#26734D]' : 'bg-[#DDE3DE]'"></div>
          <div class="w-3.5 h-3.5 rounded-full transition-all"
            :class="roiStatus === 'amarillo' ? 'bg-[#A96517]' : 'bg-[#DDE3DE]'"></div>
          <div class="w-3.5 h-3.5 rounded-full transition-all"
            :class="roiStatus === 'rojo' ? 'bg-[#B93838]' : 'bg-[#DDE3DE]'"></div>
        </div>
        <div>
          <span class="text-2xl font-semibold tabular-nums" :class="roiColorClass">{{ roiText }}</span>
          <p class="text-[11px] text-[#68736C]">General</p>
        </div>
        <div class="ml-auto text-right">
          <span class="text-lg font-semibold text-[#202723] tabular-nums">{{ metrics.roiProducto || 0 }}%</span>
          <p class="text-[11px] text-[#68736C]">Producto</p>
        </div>
      </div>
      <!-- Leyenda semáforo -->
      <div class="flex flex-col gap-0.5 text-[11px] text-[#68736C] border-t border-[#F0F2EF] pt-2">
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#B93838]"></span>&lt;5% Crítico</span>
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#A96517]"></span>5–15% Regular</span>
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#26734D]"></span>&gt;15% Óptimo</span>
      </div>
    </div>

    <!-- 9. Margen de Contribución -->
    <div class="bg-white p-5 rounded-xl border border-[#DDE3DE]">
      <div class="flex items-center gap-1.5 mb-3">
        <p class="text-xs font-semibold text-[#68736C] uppercase tracking-wider">Margen Contribución</p>
        <MetricInfoTip titulo="Margen de Contribución"
          paraQue="Dinero y porcentaje de tus ventas que queda libre tras descontar los ingredientes, destinado a pagar renta, sueldos y generar utilidad."
          comoSeMide="% Margen = 1 - (Gastos variables ÷ Ventas). Monto en dinero = Ventas - Gastos variables. Un margen superior al 65% es excelente." />
      </div>
      <span class="text-2xl font-semibold tracking-tight text-[#245C4F] tabular-nums block">{{ margenContribucionPct }}</span>
      <p class="text-sm font-semibold text-[#202723] tabular-nums mt-0.5">{{ formatMoney(margenContribucionDinero) }}</p>
      <p class="text-xs text-[#68736C] mt-1">Dinero libre para cubrir costos fijos</p>
    </div>

    <!-- 10. % Utilidad -->
    <div class="bg-white p-5 rounded-xl border border-[#DDE3DE]">
      <div class="flex items-center gap-1.5 mb-3">
        <p class="text-xs font-semibold text-[#68736C] uppercase tracking-wider">% Utilidad</p>
        <MetricInfoTip titulo="% Utilidad"
          paraQue="Porcentaje de cada peso vendido que se convierte en ganancia neta final para el dueño."
          comoSeMide="(Ganancia neta ÷ Ventas) × 100. Si está en negativo, indica que los gastos fijos aún superan el volumen de venta acumulado." />
      </div>
      <span class="text-2xl font-semibold tracking-tight tabular-nums" :class="pctUtilidadClass">{{ pctUtilidadText }}</span>
      <p class="text-xs text-[#68736C] mt-1">Margen neto sobre ventas</p>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import MetricInfoTip from './MetricInfoTip.vue'

const props = defineProps({
  metrics: { type: Object, required: true, default: () => ({}) }
})

// Formateadores numéricos de precisión (estándar editorial SaaS)
const formatMoney = (val) => {
  if (val === null || val === undefined || val === '' || isNaN(val)) return '$0.00'
  const num = Number(val)
  const isNeg = num < 0
  const formatted = Math.abs(num).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return isNeg ? `-$${formatted}` : `$${formatted}`
}

// Margen de Contribución en Porcentaje (ej. 0.7443 -> 74.4%)
const margenContribucionPct = computed(() => {
  const raw = props.metrics.margenContribucion
  if (raw === null || raw === undefined || isNaN(raw)) return '0.0%'
  let num = Number(raw)
  if (Math.abs(num) <= 1 && num !== 0) {
    num = num * 100
  }
  return `${num.toFixed(1)}%`
})

// Margen de Contribución en Dinero (Ventas Mensuales - Gastos Variables)
const margenContribucionDinero = computed(() => {
  const v = Number(props.metrics.ventasMensuales || 0)
  const gv = Number(props.metrics.gastosVariables || 0)
  return Math.max(0, v - gv)
})

// Semáforo ROI
const sinDatosRoi = computed(() =>
  props.metrics.roiGeneral === null || props.metrics.roiGeneral === undefined ||
  props.metrics.roiSemaforo === 'sin_datos'
)

const roiStatus = computed(() => {
  if (sinDatosRoi.value) return null
  const roi = Number(props.metrics.roiGeneral || 0)
  if (roi > 15) return 'verde'
  if (roi >= 5) return 'amarillo'
  return 'rojo'
})

const roiText = computed(() =>
  sinDatosRoi.value ? '—' : `${Number(props.metrics.roiGeneral || 0).toFixed(1)}%`
)

const roiColorClass = computed(() => {
  if (sinDatosRoi.value) return 'text-[#68736C]'
  return {
    verde: 'text-[#26734D]',
    amarillo: 'text-[#A96517]',
    rojo: 'text-[#B93838]'
  }[roiStatus.value]
})

// % Utilidad
const pctUtilidad = computed(() => Number(props.metrics.porcentajeUtilidad ?? 0))
const pctUtilidadText = computed(() => `${pctUtilidad.value.toFixed(1)}%`)
const pctUtilidadClass = computed(() => {
  const v = pctUtilidad.value
  if (v < 0) return 'text-[#B93838]'
  if (v < 8) return 'text-[#A96517]'
  return 'text-[#26734D]'
})

// % Cumplimiento Punto de Equilibrio
const cumplimientoPE = computed(() => {
  const pe = Number(props.metrics.puntoEquilibrio || 0)
  const v  = Number(props.metrics.ventasMensuales || 0)
  if (pe === 0) return 0
  return Math.round((v / pe) * 100)
})
</script>
