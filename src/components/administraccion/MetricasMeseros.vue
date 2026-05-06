<template>
  <div class="space-y-6">

    <!-- Encabezado + Filtros -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div class="flex flex-col lg:flex-row lg:items-end gap-4">
        <div class="flex-1">
          <h3 class="text-base font-semibold text-gray-800">Métricas de Rendimiento</h3>
          <p class="text-xs text-gray-400 mt-0.5">Análisis operativo por departamentos</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs text-gray-500 font-medium">Desde</label>
            <input v-model="filtros.fecha_desde" type="date"
              class="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-gray-500 font-medium">Hasta</label>
            <input v-model="filtros.fecha_hasta" type="date"
              class="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div class="flex flex-col justify-end">
            <button @click="cargar"
              class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition flex items-center gap-2">
              <i class="fa-solid fa-rotate-right text-xs"></i> Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ PANELES DE KPIs (Estilo solicitado) ══ -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <!-- KPI PARA MESEROS -->
      <div class="bg-zinc-900 rounded-2xl p-6 shadow-xl border border-zinc-800">
        <div class="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
          <span class="text-2xl">🤵</span>
          <h3 class="text-white font-bold uppercase tracking-wider text-sm">KPI PARA MESEROS</h3>
        </div>
        
        <div class="space-y-6">
          <section>
            <h4 class="text-amber-500 font-bold text-xs uppercase mb-3 flex items-center gap-2">
              <span>💰</span> Ventas y productividad
            </h4>
            <ul class="space-y-4">
              <li v-for="kpi in kpisMeseros" :key="kpi.label" class="group">
                <div class="flex flex-col">
                  <span class="text-zinc-100 text-sm font-semibold group-hover:text-amber-400 transition-colors">{{ kpi.label }}</span>
                  <span class="text-zinc-500 text-[10px] leading-relaxed">{{ kpi.desc }}</span>
                  <div class="mt-1 text-amber-500 font-mono text-xs">{{ kpi.value || '—' }}</div>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>

      <!-- KPI PARA COCINA -->
      <div class="bg-zinc-900 rounded-2xl p-6 shadow-xl border border-zinc-800">
        <div class="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
          <span class="text-2xl">👨‍🍳</span>
          <h3 class="text-white font-bold uppercase tracking-wider text-sm">KPI PARA COCINA</h3>
        </div>
        
        <div class="space-y-6">
          <section>
            <h4 class="text-indigo-400 font-bold text-xs uppercase mb-3 flex items-center gap-2">
              <span>⚙️</span> Producción
            </h4>
            <ul class="space-y-4">
              <li v-for="kpi in kpisCocinaProd" :key="kpi.label" class="group">
                <div class="flex flex-col">
                  <span class="text-zinc-100 text-sm font-semibold group-hover:text-indigo-400 transition-colors">{{ kpi.label }}</span>
                  <span class="text-zinc-500 text-[10px] leading-relaxed">{{ kpi.desc }}</span>
                  <div class="mt-1 text-indigo-400 font-mono text-xs">{{ kpi.value || '—' }}</div>
                </div>
              </li>
            </ul>
          </section>
          
          <section>
            <h4 class="text-rose-500 font-bold text-xs uppercase mb-3 flex items-center gap-2">
              <span>🔥</span> Calidad
            </h4>
            <ul class="space-y-4">
              <li v-for="kpi in kpisCocinaCal" :key="kpi.label" class="group">
                <div class="flex flex-col">
                  <span class="text-zinc-100 text-sm font-semibold group-hover:text-rose-500 transition-colors">{{ kpi.label }}</span>
                  <span class="text-zinc-500 text-[10px] leading-relaxed">{{ kpi.desc }}</span>
                  <div class="mt-1 text-rose-500 font-mono text-xs">{{ kpi.value || '—' }}</div>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>

      <!-- KPI PARA CAJA / ADMIN -->
      <div class="bg-zinc-900 rounded-2xl p-6 shadow-xl border border-zinc-800">
        <div class="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
          <span class="text-2xl">📋</span>
          <h3 class="text-white font-bold uppercase tracking-wider text-sm">KPI PARA CAJA / ADMIN</h3>
        </div>
        
        <div class="space-y-6">
          <section>
            <h4 class="text-emerald-500 font-bold text-xs uppercase mb-3 flex items-center gap-2">
              <span>💵</span> Finanzas
            </h4>
            <ul class="space-y-4">
              <li v-for="kpi in kpisAdminFin" :key="kpi.label" class="group">
                <div class="flex flex-col">
                  <span class="text-zinc-100 text-sm font-semibold group-hover:text-emerald-500 transition-colors">{{ kpi.label }}</span>
                  <span class="text-zinc-500 text-[10px] leading-relaxed">{{ kpi.desc }}</span>
                  <div class="mt-1 text-emerald-500 font-mono text-xs">{{ kpi.value || '—' }}</div>
                </div>
              </li>
            </ul>
          </section>
          
          <section>
            <h4 class="text-amber-400 font-bold text-xs uppercase mb-3 flex items-center gap-2">
              <span>⚠️</span> Control
            </h4>
            <ul class="space-y-4">
              <li v-for="kpi in kpisAdminCon" :key="kpi.label" class="group">
                <div class="flex flex-col">
                  <span class="text-zinc-100 text-sm font-semibold group-hover:text-amber-400 transition-colors">{{ kpi.label }}</span>
                  <span class="text-zinc-500 text-[10px] leading-relaxed">{{ kpi.desc }}</span>
                  <div class="mt-1 text-amber-400 font-mono text-xs">{{ kpi.value || '—' }}</div>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>

    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20 gap-3">
      <div class="w-7 h-7 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <span class="text-gray-400 text-sm">Cargando métricas...</span>
    </div>

    <!-- Tabla Detalle Meseros (Original mantenida abajo) -->
    <template v-else-if="metricasMeseros.length > 0">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-8">
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-zinc-50">
          <h4 class="text-sm font-bold text-zinc-800 uppercase tracking-wider">Detalle de Ventas por Mesero</h4>
          <span class="text-[10px] text-zinc-400 uppercase font-black">Período Seleccionado</span>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-zinc-100">
              <tr>
                <th class="px-5 py-3 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Mesero</th>
                <th class="px-5 py-3 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Órdenes</th>
                <th class="px-5 py-3 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ventas</th>
                <th class="px-5 py-3 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ticket Prom.</th>
                <th class="px-5 py-3 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Mesas</th>
                <th class="px-5 py-3 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Participación</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100">
              <tr v-for="(m, i) in metricasMeseros" :key="m.mesero_id" class="hover:bg-zinc-50 transition-colors">
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                      {{ getInitials(m.mesero_nombre) }}
                    </div>
                    <div>
                      <p class="text-sm font-bold text-zinc-800">{{ m.mesero_nombre }}</p>
                      <p class="text-[10px] text-zinc-400">@{{ m.mesero_username }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4 text-right text-sm font-medium text-zinc-600">{{ m.total_ordenes }}</td>
                <td class="px-5 py-4 text-right text-sm font-black text-zinc-800">{{ formatMoney(m.total_ventas) }}</td>
                <td class="px-5 py-4 text-right text-sm font-bold text-emerald-600">{{ formatMoney(m.ticket_promedio) }}</td>
                <td class="px-5 py-4 text-right text-sm font-medium text-zinc-500">{{ m.mesas_atendidas }}</td>
                <td class="px-5 py-4">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 bg-zinc-100 rounded-full h-1.5 max-w-[100px]">
                      <div class="h-1.5 rounded-full bg-indigo-500" :style="{ width: (m.participacion_ventas || 0) + '%' }"></div>
                    </div>
                    <span class="text-[10px] font-black text-zinc-400">{{ m.participacion_ventas || 0 }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

const props = defineProps({
  apiUrl: { type: String, required: true },
  getHeaders: { type: Function, required: true }
})

// ── Estado ────────────────────────────────────────────────────────────────
const loading = ref(false)
const metricasMeseros = ref([])
const listaMeseros = ref([])
const resumenGeneral = reactive({
  total_ordenes: 0,
  total_ventas: 0,
  ticket_promedio_general: 0,
})

const hoy = new Date().toISOString().split('T')[0]
const filtros = reactive({
  fecha_desde: hoy,
  fecha_hasta: hoy,
})

// ── KPI Lists (UI) ────────────────────────────────────────────────────────
const kpisMeseros = computed(() => [
  { label: 'Ventas por mesero ($/turno)', desc: 'mide quién realmente genera dinero', value: formatMoney(resumenGeneral.total_ventas / (resumenGeneral.total_meseros_activos || 1)) },
  { label: 'Ticket promedio por mesero', desc: 'clave para detectar upselling', value: formatMoney(resumenGeneral.ticket_promedio_general) },
  { label: 'Ítems por ticket', desc: 'si es bajo, no están sugiriendo nada', value: '0.0 uds' },
  { label: 'Ventas por hora trabajada', desc: 'productividad real (no solo volumen)', value: formatMoney(0) },
  { label: 'Tiempo de servicio total', desc: 'mesa ocupada vs cuenta cerrada', value: '00:00 min' },
  { label: 'Rotación de mesas', desc: 'mesas atendidas por turno', value: '0.0x' },
])

const kpisCocinaProd = computed(() => [
  { label: 'Tiempo de preparación por platillo', desc: 'velocidad de respuesta', value: '0.0 min' },
  { label: 'Órdenes completadas / hora', desc: 'capacidad instalada', value: '0.0/hr' },
  { label: 'Órdenes retrasadas (%)', desc: 'impacto en experiencia del cliente', value: '0.0%' },
])

const kpisCocinaCal = computed(() => [
  { label: 'Reprocesos (%) (platillos devueltos)', desc: 'calidad de la ejecución', value: '0.0%' },
  { label: 'Errores de cocina (%)', desc: 'pedidos mal preparados', value: '0.0%' },
  { label: 'Desperdicio de insumos (%)', desc: 'control de mermas', value: '0.0%' },
  { label: 'Consumo vs estándar (receta)', desc: 'cumplimiento de porcionado', value: '0.0%' },
])

const kpisAdminFin = computed(() => [
  { label: 'Ingresos diarios / semanales', desc: 'flujo de caja', value: formatMoney(resumenGeneral.total_ventas) },
  { label: 'Margen bruto (%)', desc: 'rentabilidad antes de gastos fijos', value: '0.0%' },
  { label: 'Costo de nómina (%) sobre ventas', desc: 'eficiencia del personal', value: '0.0%' },
  { label: 'Costo de insumos (%)', desc: 'costo de venta (Food Cost)', value: '0.0%' },
])

const kpisAdminCon = computed(() => [
  { label: 'Diferencias de caja', desc: 'sobrantes o faltantes', value: '$0.00' },
  { label: 'Cancelaciones / devoluciones (%)', desc: 'pérdidas operativas', value: '0.0%' },
  { label: 'Tickets sin facturar', desc: 'control fiscal', value: '0' },
])

// ── Helpers ───────────────────────────────────────────────────────────────
const formatMoney = (val) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(val || 0)

const getInitials = (name) =>
  !name ? 'U' : name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)

// ── Acciones ──────────────────────────────────────────────────────────────
const cargar = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde)
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta)

    const res = await fetch(`${props.apiUrl}/meseros/metricas-ventas?${params}`, {
      headers: props.getHeaders()
    })
    const data = await res.json()

    if (data.success) {
      metricasMeseros.value = data.data.metricas_por_mesero || data.data.meseros || []
      resumenGeneral.total_ordenes = data.data.resumen_general?.total_ordenes || 0
      resumenGeneral.total_ventas = data.data.resumen_general?.total_ventas || 0
      resumenGeneral.ticket_promedio_general = data.data.resumen_general?.ticket_promedio_general || 
        (resumenGeneral.total_ordenes > 0 ? resumenGeneral.total_ventas / resumenGeneral.total_ordenes : 0)
      resumenGeneral.total_meseros_activos = data.data.resumen_general?.total_meseros_activos || metricasMeseros.value.length
    }
  } catch (e) {
    console.error('Error MetricasMeseros:', e)
  } finally {
    loading.value = false
  }
}

onMounted(cargar)
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>