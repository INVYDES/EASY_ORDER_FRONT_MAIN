<template>
  <div class="metrics-root">

    <!-- ── HEADER + FILTROS ─────────────────────────────────────────────── -->
    <div class="panel filters-panel">
      <div class="filters-panel__top">
        <div class="filters-panel__copy">
          <p class="page-header__eyebrow">Análisis de Personal</p>
          <h3 class="filters-panel__title">Panel de Rendimiento</h3>
          <p class="filters-panel__sub">Filtra por fechas o selecciona un empleado específico para ver sus métricas.</p>
        </div>
        <div class="filters-panel__controls">
          <div class="field">
            <label class="field__label">Inicio</label>
            <input v-model="filtros.fecha_desde" type="date" class="field__input" />
          </div>
          <div class="field">
            <label class="field__label">Fin</label>
            <input v-model="filtros.fecha_hasta" type="date" class="field__input" />
          </div>
          <div class="field">
            <label class="field__label">Empleado</label>
            <select v-model="filtros.mesero_id" class="field__input field__input--select">
              <option value="">Todos los empleados</option>
              <option v-for="emp in empleadosReales" :key="emp.id" :value="emp.id">
                {{ emp.nombre || emp.name || emp.username }}
              </option>
            </select>
          </div>
          <button @click="cargar" :disabled="loading" class="btn btn--primary filters-panel__cta">
            <i class="fa-solid fa-arrows-rotate" :class="loading && 'spinning'"></i>
            {{ loading ? 'Actualizando…' : 'Actualizar' }}
          </button>
        </div>
      </div>
      <div class="filters-tip">
        <i class="fa-solid fa-circle-question filters-tip__icon"></i>
        <p>Selecciona las fechas y el empleado que deseas consultar, luego haz clic en "Actualizar".</p>
      </div>
    </div>

    <!-- ── TOOLTIP: cómo se calcula cada métrica ─────────────────────────── -->
    <div v-if="infoVisible" class="calc-tooltip" :style="{ left: infoX + 'px', top: infoY + 'px' }">
      <div class="calc-tooltip__head">🧮 ¿Cómo se calcula?</div>
      <p class="calc-tooltip__text">{{ infoTexto }}</p>
    </div>

    <!-- ── LOADING ──────────────────────────────────────────────────────── -->
    <div v-if="loading" class="loading-state">
      <div class="spinner spinner--lg"></div>
      <span class="loading-state__text">Cargando métricas…</span>
    </div>

    <template v-else>

      <!-- ══════════════════════════════════════════════════════════════════
           DETALLE DE UN SOLO MESERO
      ══════════════════════════════════════════════════════════════════ -->
      <template v-if="filtros.mesero_id && metricasMeseros.length === 1">

        <!-- KPIs individuales -->
        <div class="kpi-strip" @mouseleave="ocultarInfo">
          <div class="kpi-tile kpi-tile--amber" @mouseenter="mostrarInfo($event, KPIS.meseroDinero)">
            <span class="kpi-tile__icon">💵</span>
            <div class="kpi-tile__body">
              <span class="kpi-tile__label">Dinero Vendido</span>
              <span class="kpi-tile__value">{{ formatMoney(metricasMeseros[0].total_ventas) }}</span>
              <span class="kpi-tile__desc">Total cobrado en el periodo</span>
            </div>
            <span class="kpi-tile__info">ℹ️</span>
          </div>
          <div class="kpi-tile kpi-tile--blue" @mouseenter="mostrarInfo($event, KPIS.meseroTicket)">
            <span class="kpi-tile__icon">🛍️</span>
            <div class="kpi-tile__body">
              <span class="kpi-tile__label">Ticket Promedio</span>
              <span class="kpi-tile__value">{{ formatMoney(metricasMeseros[0].ticket_promedio) }}</span>
              <span class="kpi-tile__desc">Gasto promedio por cliente</span>
            </div>
            <span class="kpi-tile__info">ℹ️</span>
          </div>
          <div class="kpi-tile kpi-tile--purple" @mouseenter="mostrarInfo($event, KPIS.meseroCuentas)">
            <span class="kpi-tile__icon">🍽️</span>
            <div class="kpi-tile__body">
              <span class="kpi-tile__label">Cuentas / Mesas</span>
              <span class="kpi-tile__value">{{ metricasMeseros[0].total_ordenes }} <small>/ {{ metricasMeseros[0].mesas_atendidas }}</small></span>
              <span class="kpi-tile__desc">Órdenes · Mesas atendidas</span>
            </div>
            <span class="kpi-tile__info">ℹ️</span>
          </div>
          <div class="kpi-tile kpi-tile--green" @mouseenter="mostrarInfo($event, KPIS.meseroPropinas)">
            <span class="kpi-tile__icon">💰</span>
            <div class="kpi-tile__body">
              <span class="kpi-tile__label">Propinas Est. 10%</span>
              <span class="kpi-tile__value">{{ formatMoney((metricasMeseros[0].total_ventas || 0) * 0.10) }}</span>
              <span class="kpi-tile__desc">Estimado de propinas</span>
            </div>
            <span class="kpi-tile__info">ℹ️</span>
          </div>
        </div>

        <!-- Gráfica: Aporte al negocio — radialBar -->
        <div class="chart-panel">
          <div class="chart-panel__header">
            <div>
              <h4 class="chart-panel__title">🎯 Aporte al Negocio</h4>
              <p class="chart-panel__sub">De cada $100 que vende el local, {{ metricasMeseros[0].mesero_nombre?.split(' ')[0] }} aportó ${{ metricasMeseros[0].participacion_ventas || 0 }}</p>
            </div>
            <span class="chart-panel__badge chart-panel__badge--amber">{{ metricasMeseros[0].participacion_ventas || 0 }}% del total</span>
          </div>
          <apexchart
            v-if="chartAporteListo"
            type="radialBar"
            height="280"
            :options="chartAporteOpts"
            :series="chartAporteSeries"
          />
        </div>

      </template>

      <!-- ══════════════════════════════════════════════════════════════════
           VISTA GENERAL — TODOS LOS MESEROS
      ══════════════════════════════════════════════════════════════════ -->
      <template v-else>

        <!-- KPI strip general -->
        <div class="kpi-strip" @mouseleave="ocultarInfo">
          <div class="kpi-tile kpi-tile--amber" @mouseenter="mostrarInfo($event, KPIS.generalVentas)">
            <span class="kpi-tile__icon">💵</span>
            <div class="kpi-tile__body">
              <span class="kpi-tile__label">Ventas Totales</span>
              <span class="kpi-tile__value">{{ formatMoney(resumenGeneral.total_ventas) }}</span>
              <span class="kpi-tile__desc">Suma de todos los meseros</span>
            </div>
            <span class="kpi-tile__info">ℹ️</span>
          </div>
          <div class="kpi-tile kpi-tile--blue" @mouseenter="mostrarInfo($event, KPIS.generalTicket)">
            <span class="kpi-tile__icon">🧾</span>
            <div class="kpi-tile__body">
              <span class="kpi-tile__label">Ticket Promedio</span>
              <span class="kpi-tile__value">{{ formatMoney(resumenGeneral.ticket_promedio_general) }}</span>
              <span class="kpi-tile__desc">Por orden en el periodo</span>
            </div>
            <span class="kpi-tile__info">ℹ️</span>
          </div>
          <div class="kpi-tile kpi-tile--purple" @mouseenter="mostrarInfo($event, KPIS.generalOrdenes)">
            <span class="kpi-tile__icon">📋</span>
            <div class="kpi-tile__body">
              <span class="kpi-tile__label">Total Órdenes</span>
              <span class="kpi-tile__value">{{ resumenGeneral.total_ordenes }}</span>
              <span class="kpi-tile__desc">Órdenes completadas</span>
            </div>
            <span class="kpi-tile__info">ℹ️</span>
          </div>
          <div class="kpi-tile kpi-tile--green" @mouseenter="mostrarInfo($event, KPIS.generalMeseros)">
            <span class="kpi-tile__icon">🤵</span>
            <div class="kpi-tile__body">
              <span class="kpi-tile__label">Meseros Activos</span>
              <span class="kpi-tile__value">{{ resumenGeneral.total_meseros_activos }}</span>
              <span class="kpi-tile__desc">En el periodo seleccionado</span>
            </div>
            <span class="kpi-tile__info">ℹ️</span>
          </div>
        </div>

        <!-- ── SECCIÓN MESEROS ─────────────────────────────────────────── -->
        <div class="section-header">
          <span class="section-header__emoji">🤵</span>
          <h3 class="section-header__title">Meseros</h3>
          <span class="section-header__line"></span>
        </div>

        <div class="charts-row" v-if="metricasMeseros.length > 0">

          <!-- GRÁFICA 1: Ventas por mesero — barras horizontales -->
          <div class="chart-panel chart-panel--lg">
            <div class="chart-panel__header">
              <div>
                <h4 class="chart-panel__title">💵 Ventas por Mesero</h4>
                <p class="chart-panel__sub">Ranking de mayor a menor · periodo seleccionado</p>
              </div>
            </div>
            <apexchart
              v-if="chartVentasListo"
              type="bar"
              height="260"
              :options="chartVentasOpts"
              :series="chartVentasSeries"
            />
          </div>

          <!-- GRÁFICA 2: Participación — dona -->
          <div class="chart-panel chart-panel--md">
            <div class="chart-panel__header">
              <div>
                <h4 class="chart-panel__title">🍩 Participación</h4>
                <p class="chart-panel__sub">Distribución % de ventas</p>
              </div>
            </div>
            <apexchart
              v-if="chartParticipacionListo"
              type="donut"
              height="260"
              :options="chartParticipacionOpts"
              :series="chartParticipacionSeries"
            />
          </div>

        </div>

        <!-- ── SECCIÓN COCINA ──────────────────────────────────────────── -->
        <div class="section-header">
          <span class="section-header__emoji">👨‍🍳</span>
          <h3 class="section-header__title">Cocina</h3>
          <span class="section-header__line"></span>
        </div>

        <div class="charts-row">

          <!-- Producción: datos numéricos limpios -->
          <div class="chart-panel chart-panel--sm">
            <div class="chart-panel__header">
              <h4 class="chart-panel__title">⚙️ Producción</h4>
            </div>
            <div class="stat-list">
              <div class="stat-item">
                <div class="stat-item__left">
                  <span class="stat-item__icon">🍳</span>
                  <div>
                    <p class="stat-item__label">Tiempo en Cocinar</p>
                    <p class="stat-item__desc">Lo que tardan en sacar un plato</p>
                  </div>
                </div>
                <span class="stat-item__val">0.0 <small>min</small></span>
              </div>
              <div class="stat-item">
                <div class="stat-item__left">
                  <span class="stat-item__icon">🔥</span>
                  <div>
                    <p class="stat-item__label">Platos por Hora</p>
                    <p class="stat-item__desc">Ritmo de producción</p>
                  </div>
                </div>
                <span class="stat-item__val">0.0 <small>/hr</small></span>
              </div>
            </div>

            <!-- GRÁFICA 3: Pedidos atrasados — gauge radial -->
            <div class="gauge-block">
              <p class="gauge-block__label">⏰ Pedidos Atrasados</p>
              <apexchart
                type="radialBar"
                height="180"
                :options="chartPedidosAtrasadosOpts"
                :series="[0]"
              />
              <p class="gauge-block__desc">Platos que tardaron demasiado en salir</p>
            </div>
          </div>

          <!-- GRÁFICA 4: Calidad — gauges múltiples -->
          <div class="chart-panel chart-panel--lg">
            <div class="chart-panel__header">
              <h4 class="chart-panel__title">🔥 Calidad de Cocina</h4>
              <p class="chart-panel__sub">Métricas de error y desperdicio (% sobre total)</p>
            </div>
            <apexchart
              type="radialBar"
              height="300"
              :options="chartCalidadOpts"
              :series="[0, 0, 0, 0]"
            />
            <div class="chart-legend-row">
              <span class="legend-dot" style="background:#f87171"></span><span class="legend-label">Platos Devueltos</span>
              <span class="legend-dot" style="background:#fb923c"></span><span class="legend-label">Equivocaciones</span>
              <span class="legend-dot" style="background:#fbbf24"></span><span class="legend-label">Merma</span>
              <span class="legend-dot" style="background:#a78bfa"></span><span class="legend-label">Uso de Recetas</span>
            </div>
          </div>

        </div>

        <!-- ── SECCIÓN CAJA ────────────────────────────────────────────── -->
        <div class="section-header">
          <span class="section-header__emoji">📋</span>
          <h3 class="section-header__title">Caja</h3>
          <span class="section-header__line"></span>
        </div>

        <div class="charts-row">

          <!-- GRÁFICA 5: Distribución financiera — dona -->
          <div class="chart-panel chart-panel--md">
            <div class="chart-panel__header">
              <div>
                <h4 class="chart-panel__title">📊 Distribución de Ingresos</h4>
                <p class="chart-panel__sub">Cómo se distribuye cada peso que entra</p>
              </div>
            </div>
            <apexchart
              type="donut"
              height="260"
              :options="chartFinanzasOpts"
              :series="chartFinanzasSeries"
            />
          </div>

          <!-- Control: datos numéricos + alertas -->
          <div class="chart-panel chart-panel--sm">
            <div class="chart-panel__header">
              <h4 class="chart-panel__title">⚠️ Control de Caja</h4>
            </div>
            <div class="stat-list">
              <div class="stat-item stat-item--alert">
                <div class="stat-item__left">
                  <span class="stat-item__icon">⚖️</span>
                  <div>
                    <p class="stat-item__label">Faltantes o Sobrantes</p>
                    <p class="stat-item__desc">Diferencias de dinero en caja</p>
                  </div>
                </div>
                <span class="stat-item__val stat-item__val--alert">$0.00</span>
              </div>
              <div class="stat-item stat-item--alert">
                <div class="stat-item__left">
                  <span class="stat-item__icon">🚫</span>
                  <div>
                    <p class="stat-item__label">Pedidos Cancelados</p>
                    <p class="stat-item__desc">Ventas echadas para atrás</p>
                  </div>
                </div>
                <span class="stat-item__val stat-item__val--alert">0%</span>
              </div>
              <div class="stat-item stat-item--alert">
                <div class="stat-item__left">
                  <span class="stat-item__icon">🧾</span>
                  <div>
                    <p class="stat-item__label">Cuentas sin Ticket</p>
                    <p class="stat-item__desc">Cobros sin recibo oficial</p>
                  </div>
                </div>
                <span class="stat-item__val stat-item__val--alert">0 <small>ctas</small></span>
              </div>
            </div>

            <!-- Barra apilada de gastos -->
            <div class="stacked-bar-block">
              <p class="stacked-bar-block__label">Desglose de costos sobre ventas</p>
              <div class="stacked-bar">
                <div class="stacked-bar__seg stacked-bar__seg--red"   :style="{ width: '0%' }" title="Sueldos 0%"></div>
                <div class="stacked-bar__seg stacked-bar__seg--amber" :style="{ width: '0%' }" title="Ingredientes 0%"></div>
                <div class="stacked-bar__seg stacked-bar__seg--green" style="width: 100%"      title="Ganancia 100%"></div>
              </div>
              <div class="stacked-bar__legend">
                <span><i style="background:#f87171"></i> Sueldos (0%)</span>
                <span><i style="background:#fbbf24"></i> Ingredientes (0%)</span>
                <span><i style="background:#34d399"></i> Ganancia (100%)</span>
              </div>
            </div>
          </div>

        </div>

      </template>

      <!-- ── TABLA MESEROS ─────────────────────────────────────────────── -->
      <div v-if="metricasMeseros.length > 0" class="panel">
        <div class="panel__header">
          <div>
            <h4 class="panel__title">Detalle de Ventas por Mesero</h4>
            <p class="panel__subtitle">Periodo · {{ filtros.fecha_desde }} – {{ filtros.fecha_hasta }}</p>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mesero</th>
                <th class="text-right">Órdenes</th>
                <th class="text-right">Ventas</th>
                <th class="text-right">Ticket Prom.</th>
                <th class="text-right">Mesas</th>
                <th>Participación</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in metricasMeseros" :key="m.mesero_id">
                <td>
                  <div class="emp-cell">
                    <div class="emp-cell__avatar">{{ getInitials(m.mesero_nombre) }}</div>
                    <div>
                      <p class="cell-primary">{{ m.mesero_nombre }}</p>
                      <p class="cell-secondary">@{{ m.mesero_username }}</p>
                    </div>
                  </div>
                </td>
                <td class="text-right"><p class="cell-num">{{ m.total_ordenes }}</p></td>
                <td class="text-right"><p class="cell-num cell-num--strong">{{ formatMoney(m.total_ventas) }}</p></td>
                <td class="text-right"><p class="cell-num cell-num--green">{{ formatMoney(m.ticket_promedio) }}</p></td>
                <td class="text-right"><p class="cell-num">{{ m.mesas_atendidas }}</p></td>
                <td>
                  <div class="progress-cell">
                    <div class="progress-track">
                      <div class="progress-fill" :style="{ width: (m.participacion_ventas || 0) + '%' }"></div>
                    </div>
                    <span class="progress-label">{{ m.participacion_ventas || 0 }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── EMPTY STATE ───────────────────────────────────────────────── -->
      <div v-else-if="!filtros.mesero_id || metricasMeseros.length === 0" class="empty-state">
        <span class="empty-state__icon">📊</span>
        <p class="empty-state__msg">Sin datos para el periodo seleccionado.</p>
        <p class="empty-state__hint">Ajusta los filtros y haz clic en "Actualizar".</p>
      </div>

    </template>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

const props = defineProps({
  apiUrl:     { type: String,   required: true },
  getHeaders: { type: Function, required: true },
  empleados:  { type: Array,    default: () => [] },
  refreshKey: { type: Number,   default: 0 },
  serverDate: { type: String,   default: '' },
})

// ── Paleta compartida ─────────────────────────────────────────────────────
const PALETTE = ['#d97706','#818cf8','#34d399','#f87171','#38bdf8','#fb923c','#a78bfa','#4ade80']

// ── Empleados filtrados ───────────────────────────────────────────────────
const empleadosReales = computed(() =>
  props.empleados.filter(emp => {
    const nombre = (emp.nombre || emp.name || emp.username || '').toLowerCase()
    if (['restaurante','sucursal','tienda'].some(k => nombre.includes(k))) return false
    return !(emp.roles || []).some(r => r.nombre?.toLowerCase() === 'propietario')
  })
)

// ── Estado ────────────────────────────────────────────────────────────────
const loading         = ref(false)
const metricasMeseros = ref([])
const infoVisible   = ref(false)
const infoX         = ref(0)
const infoY         = ref(0)
const infoTexto     = ref('')

// ── Fórmulas mostradas al pasar el mouse ──────────────────────────────────
const KPIS = {
  meseroDinero:  'Suma de las ventas de todas las órdenes que cerró el mesero en el periodo: Ʃ total de cada orden.',
  meseroTicket:  'Ventas del mesero ÷ número de órdenes: Total Vendido / Total Órdenes.',
  meseroCuentas: 'Total de órdenes cerradas y mesas distintas atendidas en el periodo.',
  meseroPropinas: 'Estimado simple = 10% de sus ventas: Total Vendido × 0.10.',
  generalVentas: 'Suma de las ventas de todos los meseros en el periodo: Ʃ (Ventas por mesero).',
  generalTicket: 'Ventas totales ÷ total de órdenes: Ventas Totales / Total Órdenes.',
  generalOrdenes: 'Conteo de órdenes completadas dentro del rango de fechas seleccionado.',
  generalMeseros: 'Meseros con al menos una orden registrada en el periodo.',
}

const mostrarInfo = (e, texto) => {
  infoTexto.value = texto
  infoX.value = e.clientX + 14
  infoY.value = e.clientY + 16
  infoVisible.value = true
}

const ocultarInfo = () => {
  infoVisible.value = false
}

const getServerToday = () => props.serverDate || new Date().toLocaleDateString('en-CA')
const hoy    = getServerToday()
const filtros = reactive({ fecha_desde: hoy, fecha_hasta: hoy, mesero_id: '' })

const resumenGeneral = reactive({
  total_ordenes: 0, total_ventas: 0,
  ticket_promedio_general: 0, total_meseros_activos: 0,
})

// ── Helpers ───────────────────────────────────────────────────────────────
const formatMoney = v =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(v || 0)

const getInitials = n =>
  !n ? 'U' : n.split(' ').map(x => x[0]).join('').toUpperCase().substring(0, 2)

// ── Opciones base de ApexCharts (tema oscuro) ─────────────────────────────
const baseChart = {
  chart:    { background: 'transparent', toolbar: { show: false }, animations: { enabled: true, speed: 600 } },
  theme:    { mode: 'dark' },
  tooltip:  { theme: 'dark' },
  grid:     { borderColor: '#334155' },
}

// ── GRÁFICA 1: Ventas por mesero — barras horizontales ───────────────────
const chartVentasListo = computed(() => metricasMeseros.value.length > 0)

const chartVentasSeries = computed(() => [{
  name: 'Ventas',
  data: [...metricasMeseros.value]
    .sort((a, b) => b.total_ventas - a.total_ventas)
    .map(m => Math.round(m.total_ventas || 0)),
}])

const chartVentasOpts = computed(() => ({
  ...baseChart,
  chart: { ...baseChart.chart, type: 'bar' },
  plotOptions: {
    bar: {
      horizontal: true, borderRadius: 6, barHeight: '60%',
      distributed: true,
      dataLabels: { position: 'bottom' },
    },
  },
  colors: PALETTE,
  dataLabels: {
    enabled: true,
    formatter: v => formatMoney(v),
    style: { fontSize: '11px', fontWeight: 700, colors: ['#0f172a'] },
  },
  xaxis: {
    categories: [...metricasMeseros.value]
      .sort((a, b) => b.total_ventas - a.total_ventas)
      .map(m => m.mesero_nombre),
    labels: {
      formatter: v => formatMoney(v),
      style: { colors: '#94a3b8', fontSize: '11px' },
    },
  },
  yaxis: { labels: { style: { colors: '#e2e8f0', fontSize: '12px', fontWeight: 600 } } },
  legend: { show: false },
  tooltip: { theme: 'dark', y: { formatter: v => formatMoney(v) } },
}))

// ── GRÁFICA 2: Participación — dona ──────────────────────────────────────
const chartParticipacionListo = computed(() => metricasMeseros.value.length > 1)

const chartParticipacionSeries = computed(() =>
  metricasMeseros.value.map(m => parseFloat(m.participacion_ventas || 0))
)

const chartParticipacionOpts = computed(() => ({
  ...baseChart,
  chart: { ...baseChart.chart, type: 'donut' },
  labels: metricasMeseros.value.map(m => m.mesero_nombre),
  colors: PALETTE,
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          total: {
            show: true, label: 'Total',
            formatter: () => '100%',
            style: { fontSize: '16px', fontWeight: 800, color: '#f8fafc' },
          },
        },
      },
    },
  },
  dataLabels: { enabled: true, formatter: v => v.toFixed(1) + '%' },
  legend: {
    position: 'bottom',
    labels: { colors: '#cbd5e1' },
    fontSize: '12px',
  },
  tooltip: { theme: 'dark', y: { formatter: v => v + '%' } },
}))

// ── GRÁFICA 3: Pedidos atrasados — radialBar gauge ────────────────────────
const chartPedidosAtrasadosOpts = {
  ...baseChart,
  chart: { ...baseChart.chart, type: 'radialBar' },
  plotOptions: {
    radialBar: {
      startAngle: -135, endAngle: 135,
      hollow: { size: '60%' },
      track: { background: '#1e293b', strokeWidth: '100%' },
      dataLabels: {
        name:  { show: false },
        value: {
          fontSize: '22px', fontWeight: 800, color: '#f87171',
          formatter: v => v + '%',
          offsetY: 8,
        },
      },
    },
  },
  fill: {
    type: 'gradient',
    gradient: { shade: 'dark', type: 'horizontal', gradientToColors: ['#fbbf24'], stops: [0, 100] },
  },
  stroke: { lineCap: 'round' },
  colors: ['#f87171'],
}

// ── GRÁFICA 4: Calidad cocina — radialBar múltiple ────────────────────────
const chartCalidadOpts = {
  ...baseChart,
  chart: { ...baseChart.chart, type: 'radialBar' },
  plotOptions: {
    radialBar: {
      hollow: { size: '20%' },
      track: { background: '#1e293b' },
      dataLabels: {
        name:  { fontSize: '11px', color: '#94a3b8' },
        value: { fontSize: '13px', fontWeight: 800, color: '#f8fafc', formatter: v => v + '%' },
        total: {
          show: true, label: 'Errores',
          formatter: () => '0%',
          color: '#f87171', fontSize: '14px', fontWeight: 800,
        },
      },
    },
  },
  labels: ['Devueltos', 'Equivocaciones', 'Merma', 'Recetas'],
  colors: ['#f87171', '#fb923c', '#fbbf24', '#a78bfa'],
}

// ── GRÁFICA 5: Distribución financiera — dona ─────────────────────────────
const chartFinanzasSeries = computed(() => {
  const ventas = resumenGeneral.total_ventas || 1
  // Placeholders — cuando el backend envíe datos reales, reemplazar con las variables reactivas
  const sueldos     = 0
  const ingredientes = 0
  const ganancia    = Math.max(0, ventas - sueldos - ingredientes)
  return [
    parseFloat(((sueldos      / ventas) * 100).toFixed(1)),
    parseFloat(((ingredientes / ventas) * 100).toFixed(1)),
    parseFloat(((ganancia     / ventas) * 100).toFixed(1)),
  ]
})

const chartFinanzasOpts = {
  ...baseChart,
  chart: { ...baseChart.chart, type: 'donut' },
  labels: ['💸 Sueldos', '🥑 Ingredientes', '📈 Ganancia'],
  colors: ['#f87171', '#fbbf24', '#34d399'],
  plotOptions: {
    pie: {
      donut: {
        size: '68%',
        labels: {
          show: true,
          total: {
            show: true, label: 'Ganancia',
            formatter: w => {
              const s = w.globals.seriesTotals
              return (s[2] || 0).toFixed(1) + '%'
            },
            style: { fontSize: '18px', fontWeight: 800, color: '#34d399' },
          },
        },
      },
    },
  },
  dataLabels: { enabled: true, formatter: v => v.toFixed(1) + '%' },
  legend: { position: 'bottom', labels: { colors: '#cbd5e1' }, fontSize: '12px' },
  tooltip: { theme: 'dark', y: { formatter: v => v + '%' } },
}

// ── GRÁFICA 6: RadialBar aporte mesero individual ─────────────────────────
const chartAporteListo   = computed(() =>
  filtros.mesero_id && metricasMeseros.value.length === 1
)
const chartAporteSeries  = computed(() => [metricasMeseros.value[0]?.participacion_ventas || 0])
const chartAporteOpts    = computed(() => ({
  ...baseChart,
  chart: { ...baseChart.chart, type: 'radialBar' },
  plotOptions: {
    radialBar: {
      startAngle: -135, endAngle: 135,
      hollow: { size: '55%' },
      track: { background: '#1e293b', strokeWidth: '100%' },
      dataLabels: {
        name: {
          show: true, offsetY: -10,
          color: '#94a3b8', fontSize: '12px',
          formatter: () => metricasMeseros.value[0]?.mesero_nombre || '',
        },
        value: {
          fontSize: '32px', fontWeight: 900,
          color: '#d97706',
          formatter: v => v + '%',
          offsetY: 10,
        },
      },
    },
  },
  fill: {
    type: 'gradient',
    gradient: { shade: 'dark', type: 'horizontal', gradientToColors: ['#fbbf24'], stops: [0, 100] },
  },
  stroke: { lineCap: 'round' },
  colors: ['#d97706'],
}))

// ── Fetch ─────────────────────────────────────────────────────────────────
const cargar = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde)
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta)
    if (filtros.mesero_id)   params.append('user_id', filtros.mesero_id)

    const res  = await fetch(`${props.apiUrl}/meseros/metricas-ventas?${params}`, { headers: props.getHeaders() })
    const data = await res.json()

    if (data.success) {
      metricasMeseros.value = data.data.metricas_por_mesero || data.data.meseros || []
      const r = data.data.resumen_general || {}
      resumenGeneral.total_ordenes           = r.total_ordenes || 0
      resumenGeneral.total_ventas            = r.total_ventas  || 0
      resumenGeneral.total_meseros_activos   = r.total_meseros_activos || metricasMeseros.value.length
      resumenGeneral.ticket_promedio_general = r.ticket_promedio_general ||
        (resumenGeneral.total_ordenes > 0 ? resumenGeneral.total_ventas / resumenGeneral.total_ordenes : 0)
    }
  } catch (e) {
    console.error('Error MetricasMeseros:', e)
  } finally {
    loading.value = false
  }
}

watch(() => props.refreshKey, () => { if (props.refreshKey) cargar() })
onMounted(cargar)
</script>

<style scoped>
/* ─── Tokens ──────────────────────────────────────────────────────────────
   Mismos tokens que NominaView                                           */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.metrics-root {
  --c-bg:        #f8fafc;
  --c-surface:   #ffffff;
  --c-border:    #e9edf2;
  --c-text:      #0f172a;
  --c-text-2:    #475569;
  --c-text-3:    #94a3b8;
  --c-indigo:    #4f46e5;
  --c-indigo-lt: #eef2ff;
  --c-green:     #059669;
  --c-green-lt:  #d1fae5;
  --c-amber:     #d97706;
  --c-amber-lt:  #fef3c7;
  --c-red:       #dc2626;
  --c-red-lt:    #fee2e2;
  --c-dark:      #0f172a;
  --c-dark-2:    #1e293b;
  --c-dark-3:    #334155;
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   18px;
  --shadow-sm:   0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
  --shadow-md:   0 4px 16px rgba(0,0,0,.08);
  font-family: 'Inter', system-ui, sans-serif;
  background: var(--c-bg);
  color: var(--c-text);
  display: flex; flex-direction: column; gap: 1.5rem;
}

/* ─── Eyebrow ────────────────────────────────────────────────────────────── */
.page-header__eyebrow {
  font-size: .6875rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .1em;
  color: var(--c-indigo); margin-bottom: .375rem;
}

/* ─── Panel base ─────────────────────────────────────────────────────────── */
.panel {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.panel__header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--c-border);
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: .75rem;
}
.panel__title    { font-size: 1rem; font-weight: 800; }
.panel__subtitle { font-size: .75rem; color: var(--c-text-3); margin-top: .2rem; }

/* ─── Filters panel ──────────────────────────────────────────────────────── */
.filters-panel__top {
  padding: 1.5rem;
  display: flex; align-items: flex-start; justify-content: space-between;
  flex-wrap: wrap; gap: 1.25rem;
}
.filters-panel__copy  { flex: 1; min-width: 220px; }
.filters-panel__title { font-size: 1.25rem; font-weight: 900; letter-spacing: -.03em; margin-bottom: .375rem; }
.filters-panel__sub   { font-size: .8125rem; color: var(--c-text-2); line-height: 1.6; }
.filters-panel__controls {
  display: flex; align-items: flex-end; flex-wrap: wrap; gap: .875rem;
}
.filters-panel__cta { align-self: flex-end; }
.filters-tip {
  display: flex; align-items: center; gap: .625rem;
  margin: 0 1.5rem 1.25rem;
  padding: .75rem 1rem;
  background: var(--c-indigo-lt);
  border: 1px solid #c7d2fe;
  border-radius: var(--radius-md);
  font-size: .75rem; color: #3730a3; font-weight: 500; line-height: 1.5;
}
.filters-tip__icon { color: var(--c-indigo); flex-shrink: 0; }

/* ─── Tooltip (cómo se calcula) ─────────────────────────────────────────── */
.calc-tooltip {
  position: fixed; z-index: 9999; max-width: 280px;
  background: #0f172a; color: #e2e8f0;
  border: 1px solid #334155; border-radius: 12px;
  padding: .75rem 1rem; box-shadow: 0 8px 24px rgba(0,0,0,.35);
  pointer-events: none; font-size: .72rem; line-height: 1.55;
  opacity: 0; animation: tooltipFade .15s ease-out forwards;
}
.calc-tooltip__head {
  font-size: .68rem; font-weight: 800; color: #a5b4fc;
  text-transform: uppercase; letter-spacing: .08em; margin-bottom: .3rem;
}
.calc-tooltip__text { color: #cbd5e1; }
@keyframes tooltipFade { to { opacity: 1; } }

/* ─── Fields ─────────────────────────────────────────────────────────────── */
.field        { display: flex; flex-direction: column; gap: .375rem; }
.field__label { font-size: .6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--c-text-3); }
.field__input {
  padding: .5rem .875rem;
  background: var(--c-bg); border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  font-size: .875rem; color: var(--c-text);
  transition: all .15s; width: 100%; outline: none;
}
.field__input:focus { border-color: var(--c-indigo); background: #fff; box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
.field__input--select {
  appearance: none; cursor: pointer; min-width: 168px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right .75rem center; padding-right: 2.25rem;
}

/* ─── Button ─────────────────────────────────────────────────────────────── */
.btn {
  display: inline-flex; align-items: center; gap: .5rem;
  padding: .5625rem 1.25rem; border: none;
  border-radius: var(--radius-md);
  font-size: .8125rem; font-weight: 700; cursor: pointer;
  transition: all .15s; white-space: nowrap;
}
.btn--primary { background: var(--c-indigo); color: #fff; box-shadow: 0 2px 8px rgba(79,70,229,.25); }
.btn--primary:hover:not(:disabled) { background: #4338ca; }
.btn:disabled { opacity: .5; cursor: not-allowed; }

/* ─── KPI Strip ──────────────────────────────────────────────────────────── */
.kpi-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
.kpi-tile {
  background: var(--c-dark);
  border-radius: var(--radius-lg);
  border: 1px solid var(--c-dark-3);
  padding: 1.25rem 1.5rem;
  display: flex; align-items: flex-start; gap: 1rem;
  box-shadow: var(--shadow-md);
  transition: transform .2s;
}
.kpi-tile:hover { transform: translateY(-2px); }
.kpi-tile__icon { font-size: 1.75rem; line-height: 1; margin-top: .1rem; }
.kpi-tile__body { display: flex; flex-direction: column; gap: .2rem; flex: 1; }
.kpi-tile__info {
  font-size: .8rem; flex-shrink: 0; align-self: flex-start;
  opacity: .5; transition: opacity .15s, transform .15s;
}
.kpi-tile:hover .kpi-tile__info { opacity: 1; transform: scale(1.1); }
.kpi-tile__label { font-size: .6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #64748b; }
.kpi-tile__value { font-size: 1.35rem; font-weight: 900; color: #f8fafc; font-variant-numeric: tabular-nums; line-height: 1.1; }
.kpi-tile__value small { font-size: .8rem; font-weight: 600; color: #94a3b8; }
.kpi-tile__desc  { font-size: .6875rem; color: #475569; }
.kpi-tile--amber { border-left: 3px solid var(--c-amber); }
.kpi-tile--amber .kpi-tile__value { color: var(--c-amber); }
.kpi-tile--blue  { border-left: 3px solid #38bdf8; }
.kpi-tile--blue  .kpi-tile__value { color: #38bdf8; }
.kpi-tile--purple{ border-left: 3px solid #818cf8; }
.kpi-tile--purple .kpi-tile__value { color: #818cf8; }
.kpi-tile--green { border-left: 3px solid #34d399; }
.kpi-tile--green .kpi-tile__value { color: #34d399; }

/* ─── Section header ─────────────────────────────────────────────────────── */
.section-header {
  display: flex; align-items: center; gap: .75rem;
  padding: .25rem 0;
}
.section-header__emoji { font-size: 1.25rem; }
.section-header__title {
  font-size: .8125rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: .1em;
  color: var(--c-text-2); white-space: nowrap;
}
.section-header__line {
  flex: 1; height: 1px; background: var(--c-border);
}

/* ─── Chart Panel ────────────────────────────────────────────────────────── */
.chart-panel {
  background: var(--c-dark);
  border: 1px solid var(--c-dark-3);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  display: flex; flex-direction: column; gap: 1rem;
}
.chart-panel__header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 1rem; flex-wrap: wrap;
}
.chart-panel__title {
  font-size: .9rem; font-weight: 800; color: #f1f5f9;
  letter-spacing: -.01em;
}
.chart-panel__sub {
  font-size: .7rem; color: #64748b; margin-top: .2rem;
}
.chart-panel__badge {
  font-size: .7rem; font-weight: 700; padding: .25rem .625rem;
  border-radius: 99px; white-space: nowrap;
  background: #1e293b; color: #94a3b8; border: 1px solid #334155;
}
.chart-panel__badge--amber { background: #451a03; color: var(--c-amber); border-color: #92400e; }

/* ─── Charts row layout ──────────────────────────────────────────────────── */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.chart-panel--lg { grid-column: span 1; }
.chart-panel--md { grid-column: span 1; }
.chart-panel--sm { grid-column: span 1; }
@media (max-width: 768px) {
  .charts-row { grid-template-columns: 1fr; }
}

/* ─── Stat list (datos numéricos) ────────────────────────────────────────── */
.stat-list { display: flex; flex-direction: column; gap: .75rem; }
.stat-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: .875rem 1rem;
  background: var(--c-dark-2);
  border: 1px solid var(--c-dark-3);
  border-radius: var(--radius-md);
  gap: .75rem;
}
.stat-item--alert { border-left: 3px solid #f87171; }
.stat-item__left  { display: flex; align-items: center; gap: .75rem; flex: 1; min-width: 0; }
.stat-item__icon  { font-size: 1.25rem; flex-shrink: 0; }
.stat-item__label { font-size: .8rem; font-weight: 700; color: #e2e8f0; }
.stat-item__desc  { font-size: .65rem; color: #64748b; margin-top: .1rem; }
.stat-item__val   {
  font-size: 1.1rem; font-weight: 900; color: #f8fafc;
  font-variant-numeric: tabular-nums; white-space: nowrap;
  font-family: 'SF Mono', 'Fira Code', monospace;
}
.stat-item__val small { font-size: .65rem; color: #64748b; font-weight: 500; }
.stat-item__val--alert { color: #f87171; }

/* ─── Gauge block (wrap para el radialBar pequeño) ───────────────────────── */
.gauge-block {
  background: var(--c-dark-2);
  border: 1px solid var(--c-dark-3);
  border-radius: var(--radius-md);
  padding: 1rem;
  text-align: center;
}
.gauge-block__label {
  font-size: .75rem; font-weight: 700;
  color: #e2e8f0; text-transform: uppercase; letter-spacing: .06em;
  margin-bottom: -.5rem;
}
.gauge-block__desc { font-size: .65rem; color: #64748b; margin-top: -.25rem; }

/* ─── Chart legend row ───────────────────────────────────────────────────── */
.chart-legend-row {
  display: flex; flex-wrap: wrap; gap: .5rem 1.25rem;
  align-items: center; padding-top: .25rem;
}
.legend-dot {
  display: inline-block; width: 9px; height: 9px;
  border-radius: 50%; flex-shrink: 0;
}
.legend-label { font-size: .7rem; color: #94a3b8; font-weight: 500; }

/* ─── Stacked bar ────────────────────────────────────────────────────────── */
.stacked-bar-block {
  background: var(--c-dark-2);
  border: 1px solid var(--c-dark-3);
  border-radius: var(--radius-md);
  padding: 1rem;
}
.stacked-bar-block__label {
  font-size: .7rem; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .06em;
  margin-bottom: .625rem;
}
.stacked-bar {
  display: flex; height: 20px; border-radius: 6px; overflow: hidden;
  background: #0f172a;
}
.stacked-bar__seg { height: 100%; transition: width .5s ease; }
.stacked-bar__seg--red   { background: #f87171; }
.stacked-bar__seg--amber { background: #fbbf24; }
.stacked-bar__seg--green { background: #34d399; }
.stacked-bar__legend {
  display: flex; flex-wrap: wrap; gap: .375rem 1rem;
  margin-top: .625rem;
}
.stacked-bar__legend span {
  display: flex; align-items: center; gap: .35rem;
  font-size: .65rem; color: #94a3b8;
}
.stacked-bar__legend i {
  display: inline-block; width: 8px; height: 8px;
  border-radius: 2px; flex-shrink: 0;
}

/* ─── Table ──────────────────────────────────────────────────────────────── */
.table-wrap { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: .8125rem; }
.data-table thead tr { background: #f8fafc; }
.data-table th {
  padding: .875rem 1.25rem; text-align: left;
  font-size: .6875rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: .08em; color: var(--c-text-3);
  border-bottom: 1px solid var(--c-border); white-space: nowrap;
}
.data-table tbody tr { border-bottom: 1px solid var(--c-bg); transition: background .1s; }
.data-table tbody tr:last-child { border-bottom: none; }
.data-table tbody tr:hover { background: #f8fafc; }
.data-table td { padding: 1rem 1.25rem; vertical-align: middle; }
.text-right { text-align: right !important; }

.cell-primary   { font-weight: 700; }
.cell-secondary { font-size: .6875rem; color: var(--c-text-3); margin-top: .2rem; }
.cell-num       { font-weight: 600; color: var(--c-text-2); font-variant-numeric: tabular-nums; }
.cell-num--strong { font-weight: 900; color: var(--c-text); }
.cell-num--green  { font-weight: 700; color: var(--c-green); }

.emp-cell { display: flex; align-items: center; gap: .75rem; }
.emp-cell__avatar {
  width: 2.25rem; height: 2.25rem; border-radius: 50%;
  background: var(--c-indigo-lt); color: var(--c-indigo);
  display: flex; align-items: center; justify-content: center;
  font-size: .75rem; font-weight: 800; flex-shrink: 0;
}
.progress-cell  { display: flex; align-items: center; gap: .625rem; }
.progress-track { flex: 1; max-width: 100px; height: 5px; background: #e2e8f0; border-radius: 99px; overflow: hidden; }
.progress-fill  { height: 100%; background: var(--c-indigo); border-radius: 99px; transition: width .3s ease; }
.progress-label { font-size: .6875rem; font-weight: 700; color: var(--c-text-3); white-space: nowrap; }

/* ─── Loading & empty ────────────────────────────────────────────────────── */
.loading-state {
  display: flex; align-items: center; justify-content: center;
  gap: .875rem; padding: 4rem 0;
}
.loading-state__text { font-size: .875rem; color: var(--c-text-3); }
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 4rem 0; gap: .625rem;
}
.empty-state__icon { font-size: 2.5rem; opacity: .4; }
.empty-state__msg  { font-size: .9375rem; font-weight: 700; color: var(--c-text-2); }
.empty-state__hint { font-size: .8125rem; color: var(--c-text-3); }

/* ─── Spinner ────────────────────────────────────────────────────────────── */
.spinner { border-radius: 50%; animation: spin .7s linear infinite; flex-shrink: 0; }
.spinner--lg { width: 1.75rem; height: 1.75rem; border: 3px solid #e0e7ff; border-top-color: var(--c-indigo); }
@keyframes spin { to { transform: rotate(360deg); } }
.spinning { animation: spin .8s linear infinite; }
</style>