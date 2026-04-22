<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

// Layout
import SucursalBadge from '../components/SucursalBadge.vue'

// Caja componentes
import CajaHeader from '../components/caja/CajaHeader.vue'
import CajaKpis from '../components/caja/Cajakpis.vue'
import CajaAcciones from '../components/caja/CajaAcciones.vue'
import CajaPropinas from '../components/caja/CajaPropinas.vue'
import CajaHistorial from '../components/caja/CajaHistorial.vue'
import CajaCorteImprimible from '../components/caja/CajaCorteImprimible.vue'
import CajaMovimientoModal from '../components/caja/CajaMovimientoModal.vue'
import CajaTicketGrid from '../components/caja/cajatiketgrid.vue'
import CajaFlowTable from '../components/caja/CajaFlowTable.vue'
import CloseCajaModal from '../components/caja/CloseCajaModal.vue'
import OpenCajaModal from '../components/caja/OpenCajaModal.vue'
import CajaDetalleModal from '../components/caja/CajaDetalleModal.vue'

import { useRestauranteChannel } from '../composables/useRestauranteChannel'
import { API_URL } from '@/config/api'

const router = useRouter()

// ── UI ────────────────────────────────────────────────────────────────────────
const selectedTab = ref('open')
const showCloseModal = ref(false)
const showOpenModal = ref(false)
const showMovimientoModal = ref(false)
const showDetalleModal = ref(false)
const cajaDetalleId = ref(null)
const audioNuevaOrden = ref(null)
const chartVentas = ref(null)
let chartInstance = null

// ── Caja ──────────────────────────────────────────────────────────────────────
const cajaAbierta = ref(false)
const openingAmount = ref(0)
const cashInRegister = ref(0)
const efectivoSales = ref(0)
const cardSales = ref(0)
const transferSales = ref(0)
const restauranteActivo = ref(null)
const ultimaActualizacion = ref(null)

// ── Datos ─────────────────────────────────────────────────────────────────────
const orders = ref([])
const movements = ref([])
const historial = ref([])
const toasts = ref([])

const loading = reactive({
  general: true,
  caja: false,
  orders: false,
  movements: false,
  historial: false,
})

// ── Computed ──────────────────────────────────────────────────────────────────
const openOrders = computed(() => orders.value.filter(o => o.estado !== 'CERRADA'))
const closedOrders = computed(() => orders.value.filter(o => o.estado === 'CERRADA'))
const ordenesListas = computed(() => orders.value.filter(o => o.estado === 'LISTA').length)
const ordenesEnProceso = computed(() => orders.value.filter(o => ['ABIERTA', 'EN_PREPARACION'].includes(o.estado)).length)
const totalVentasDia = computed(() => efectivoSales.value + cardSales.value + transferSales.value)
const totalTips = computed(() => closedOrders.value.reduce((s, o) => s + Number(o.propina || 0), 0))

const tipsBreakdown = computed(() => {
  const metodos = [
    { metodo: 'Efectivo', keys: ['efectivo', 'EFECTIVO', null, undefined, ''], icon: '💵', total: 0 },
    { metodo: 'Tarjeta', keys: ['tarjeta', 'TARJETA'], icon: '💳', total: 0 },
    { metodo: 'Transferencia', keys: ['transferencia', 'TRANSFERENCIA'], icon: '📲', total: 0 },
  ]

  metodos.forEach(m => {
    m.total = closedOrders.value
      .filter(o => m.keys.includes(o.metodo_pago))
      .reduce((s, o) => s + Number(o.propina || 0), 0)
  })

  return metodos.filter(i => i.total > 0)
})

const corteFecha = computed(() => new Date().toLocaleString('es-MX', { dateStyle: 'full', timeStyle: 'short' }))
const fechaHoy = computed(() => new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))

const tabs = computed(() => [
  { key: 'open', label: 'Abiertos', count: openOrders.value.length },
  { key: 'closed', label: 'Cerrados', count: closedOrders.value.length },
  { key: 'flow', label: 'Flujo Caja', count: movements.value.length },
])

// ── Toasts ────────────────────────────────────────────────────────────────────
const showToast = (message, type = 'info', duration = 4000) => {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  if (duration > 0) setTimeout(() => removeToast(id), duration)
}

const removeToast = (id) => {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatMoney = (v) => Number(v || 0).toFixed(2)

const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: token ? `Bearer ${token}` : ''
  }
}

const reproducirSonido = () => {
  try {
    audioNuevaOrden.value?.play()
  } catch { }
}

// ── Chart ─────────────────────────────────────────────────────────────────────
const loadChartJS = () => new Promise(resolve => {
  if (window.Chart) {
    resolve()
    return
  }
  const s = document.createElement('script')
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
  s.onload = resolve
  document.head.appendChild(s)
})

const initChart = async () => {
  await loadChartJS()
  if (!chartVentas.value) return
  if (chartInstance) chartInstance.destroy()
  
  const hours = Array.from({ length: 16 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`)
  const totals = Array(16).fill(0)
  
  closedOrders.value.forEach(o => {
    if (!o.created_at) return
    const h = new Date(o.created_at).getHours()
    if (h >= 8 && h <= 23) {
      totals[h - 8] += Number(o.total || 0)
    }
  })
  
  chartInstance = new window.Chart(chartVentas.value, {
    type: 'bar',
    data: {
      labels: hours,
      datasets: [{
        data: totals,
        backgroundColor: totals.map(v => v > 0 ? 'rgba(99,102,241,0.85)' : 'rgba(229,231,235,0.5)'),
        borderRadius: 5,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { callback: v => '$' + v } },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } }
      }
    }
  })
}

// ── Exportar ──────────────────────────────────────────────────────────────────
const exportarCorte = () => {
  const el = document.getElementById('corte-imprimible')
  if (!el) return
  const win = window.open('', '_blank', 'width=400,height=600')
  win.document.write(`<html><head><title>Corte</title><style>body{margin:0;font-family:monospace;}</style></head><body>${el.innerHTML}</body></html>`)
  win.document.close()
  win.focus()
  setTimeout(() => {
    win.print()
    win.close()
  }, 300)
}

// ── API ───────────────────────────────────────────────────────────────────────
const loadCajaEstado = async () => {
  try {
    const res = await fetch(`${API_URL}/caja/estado`, { headers: getHeaders() })
    if (res.status === 401) {
      localStorage.removeItem('token')
      router.push('/')
      return
    }
    const data = await res.json()
    if (data.success) {
      const d = data.data
      cajaAbierta.value = d.is_open
      openingAmount.value = d.opening_amount || 0
      cashInRegister.value = d.cash_in_register || 0
      efectivoSales.value = d.daily_sales || d.ventas_efectivo || 0
      cardSales.value = d.card_sales || d.ventas_tarjeta || 0
      transferSales.value = d.transfer_sales || d.ventas_transferencia || 0
      if (cajaAbierta.value) showOpenModal.value = false
    }
  } catch (e) {
    console.error('Error caja:', e)
  }
}

const actualizarTotalesCaja = async () => {
  try {
    const res = await fetch(`${API_URL}/caja/estado`, { headers: getHeaders() })
    const data = await res.json()
    if (!data.success) return
    const d = data.data
    cashInRegister.value = d.cash_in_register || 0
    efectivoSales.value = d.daily_sales || d.ventas_efectivo || 0
    cardSales.value = d.card_sales || d.ventas_tarjeta || 0
    transferSales.value = d.transfer_sales || d.ventas_transferencia || 0
  } catch { }
}

const loadOrders = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const [aR, pR, lR, cR] = await Promise.all([
      fetch(`${API_URL}/ordenes?estado=ABIERTA&per_page=100`, { headers: getHeaders() }),
      fetch(`${API_URL}/ordenes?estado=EN_PREPARACION&per_page=100`, { headers: getHeaders() }),
      fetch(`${API_URL}/ordenes?estado=LISTA&per_page=100`, { headers: getHeaders() }),
      fetch(`${API_URL}/ordenes?estado=CERRADA&fecha_desde=${today}&fecha_hasta=${today}&per_page=100`, { headers: getHeaders() }),
    ])
    const results = await Promise.all([aR.json(), pR.json(), lR.json(), cR.json()])
    const map = new Map()
    results.forEach(r => {
      if (r.success) {
        const items = Array.isArray(r.data) ? r.data : (r.data?.data || [])
        items.forEach(o => map.set(o.id, o))
      }
    })
    orders.value = [...map.values()].sort((a, b) => b.id - a.id)
  } catch (e) {
    console.error('Error órdenes:', e)
  }
}

const loadMovements = async () => {
  try {
    const res = await fetch(`${API_URL}/caja/movimientos`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) movements.value = data.data || []
  } catch { }
}

const loadHistorial = async () => {
  loading.historial = true
  try {
    const res = await fetch(`${API_URL}/caja/historial?per_page=20`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) historial.value = data.data || []
  } catch { }
  finally {
    loading.historial = false
  }
}

const loadAllData = async () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  if (!token) {
    router.push('/')
    return
  }
  loading.general = true
  await loadCajaEstado()
  await Promise.all([
    loadOrders(),
    loadMovements(),
    !cajaAbierta.value ? loadHistorial() : Promise.resolve(),
  ])
  loading.general = false
  await nextTick()
  if (cajaAbierta.value) initChart()
}

// ── FIX PRINCIPAL: actualizar orden localmente al cobrar ───────────────────
const handleOrderPaid = async (paymentData) => {
  const idx = orders.value.findIndex(o => o.id === paymentData.id)
  if (idx !== -1) {
    orders.value[idx] = {
      ...orders.value[idx],
      estado: 'CERRADA',
      metodo_pago: paymentData.metodo_pago,
      propina: paymentData.propina || 0,
    }
  }
  selectedTab.value = 'closed'
  await actualizarTotalesCaja()
  await nextTick()
  initChart()
  showToast(`Orden cobrada · ${paymentData.metodo_pago || 'efectivo'} · $${formatMoney(paymentData.total || 0)}`, 'success')
}

// ── WebSockets ────────────────────────────────────────────────────────────────
const onOrdenWS = async (evento) => {
  const { accion, orden } = evento
  ultimaActualizacion.value = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  if (accion === 'creada') {
    if (!orders.value.find(o => o.id === orden.id)) {
      orders.value.unshift(orden)
      reproducirSonido()
      showToast(`Nueva orden ${orden.folio} recibida`, 'info')
    }
  } else if (['estado_cambiado', 'cerrada'].includes(accion)) {
    const idx = orders.value.findIndex(o => o.id === orden.id)
    if (idx !== -1) orders.value[idx] = { ...orders.value[idx], ...orden }
    else orders.value.unshift(orden)
    
    if (orden.estado === 'LISTA') {
      reproducirSonido()
      showToast(`${orden.folio} lista para cobrar ✅`, 'success')
      selectedTab.value = 'open'
    }
    if (accion === 'cerrada') await actualizarTotalesCaja()
  }
  await nextTick()
  initChart()
}

const onCajaWS = async (evento) => {
  ultimaActualizacion.value = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  if (['venta', 'movimiento'].includes(evento.accion)) {
    await actualizarTotalesCaja()
    if (evento.accion === 'movimiento') await loadMovements()
  }
  if (evento.accion === 'cerrada') {
    cajaAbierta.value = false
    if (chartInstance) chartInstance.destroy()
    await loadHistorial()
    showToast('La caja fue cerrada', 'warning')
  }
}

const { conectado: wsConectado } = useRestauranteChannel(restauranteActivo, {
  onOrden: onOrdenWS,
  onCaja: onCajaWS,
})

// ── Handlers ──────────────────────────────────────────────────────────────────
const abrirDetalle = (id) => {
  cajaDetalleId.value = id
  showDetalleModal.value = true
}

const handleAlreadyOpen = async () => {
  cajaAbierta.value = true
  showOpenModal.value = false
  await loadAllData()
}

const handleOpenCaja = async (amount) => {
  openingAmount.value = amount
  cashInRegister.value = amount
  cajaAbierta.value = true
  showOpenModal.value = false
  await loadAllData()
  showToast('Caja abierta correctamente', 'success')
}

const handleCloseCaja = async () => {
  cajaAbierta.value = false
  showCloseModal.value = false
  if (chartInstance) chartInstance.destroy()
  await loadAllData()
  await loadHistorial()
  showToast('Caja cerrada. Historial actualizado.', 'success')
}

const handleMovimientoSaved = async ({ monto, tipo }) => {
  showMovimientoModal.value = false
  await Promise.all([loadMovements(), actualizarTotalesCaja()])
  showToast(`${tipo === 'ingreso' ? '↑ Entrada' : '↓ Salida'} de $${formatMoney(monto)} registrada`,
    tipo === 'ingreso' ? 'success' : 'warning')
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  await loadAllData()
  try {
    const res = await fetch(`${API_URL}/me`, { headers: getHeaders() })
    const data = await res.json()
    if (data.success) {
      const user = data.data || data
      const ra = user?.restaurante_activo
      restauranteActivo.value = typeof ra === 'object' && ra !== null ? ra.id : (ra ?? null)
    }
  } catch { }
})
</script>
<template>
  <div class="caja-layout">
    <SucursalBadge />

    <audio ref="audioNuevaOrden" preload="auto">
      <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbwZlgMC9bkMjUxJZkODuDuuLZu4pYNj2Ow+nfv4dRMC+AqNzZso5mUEBHlMzWyqeEaV5bi9Hc0bGUeGteaZHO3tW5lHhsaZPP4dvDo4JwbmuY1OTWv6GHdnBtnNfm3sKliH11cqHa6uTKq4t9eHem3e3ozK+Pf3l4rOP07tOykIF8e7Hm8fLYtoZ+fH+57vf23LiHgH2Fvu/68OC9i4J/i8Lw+vTjwI6Fg5LH8fz258OPh4eZy/L89+nFkImKn9D0/vrs" />
    </audio>

    <OpenCajaModal v-if="showOpenModal" @close="showOpenModal=false" @open="handleOpenCaja" @already-open="handleAlreadyOpen" />
    <CajaDetalleModal v-if="showDetalleModal" :caja-id="cajaDetalleId" @close="showDetalleModal=false; cajaDetalleId=null" />
    <CloseCajaModal v-if="showCloseModal" :opening="openingAmount" :cash="cashInRegister" :sales="efectivoSales" @close="showCloseModal=false" @confirm="handleCloseCaja" />
    <CajaMovimientoModal v-if="showMovimientoModal" @close="showMovimientoModal = false" @saved="handleMovimientoSaved" />

    <div class="toast-container">
      <div v-for="toast in toasts" :key="toast.id" :class="['toast-card', toast.type]">
        <div class="toast-icon-circle">{{ {'success':'✓','error':'✕','warning':'!','info':'i'}[toast.type] || '•' }}</div>
        <div class="toast-content">
          <p class="toast-message">{{ toast.message }}</p>
        </div>
        <button @click="removeToast(toast.id)" class="toast-close-btn">×</button>
      </div>
    </div>

    <CajaCorteImprimible :id="'corte-imprimible'" class="is-hidden"
      :opening-amount="openingAmount" :efectivo-sales="efectivoSales"
      :card-sales="cardSales" :transfer-sales="transferSales"
      :total-tips="totalTips" :total-ventas="totalVentasDia"
      :cash-in-register="cashInRegister" :corte-fecha="corteFecha" />

    <div class="main-content">
      
      <CajaHeader
        :caja-abierta="cajaAbierta"
        :ws-conectado="wsConectado"
        :ultima-actualizacion="ultimaActualizacion"
        :ordenes-listas="ordenesListas"
        :fecha-hoy="fechaHoy"
      />

      <div v-if="loading.general" class="loading-wrapper">
        <div class="custom-spinner"></div>
        <p>Actualizando registros...</p>
      </div>

      <template v-else>
        <template v-if="!cajaAbierta">
          <div class="empty-state-card">
            <div class="empty-state-icon">🔒</div>
            <div class="empty-state-text">
              <h2>Caja cerrada</h2>
              <p>Inicia una nueva jornada para registrar ventas y movimientos.</p>
            </div>
            <button @click="showOpenModal = true" class="btn-primary-action">
              🔓 Abrir Caja Ahora
            </button>
          </div>

          <CajaHistorial
            :historial="historial"
            :loading="loading.historial"
            @ver-detalle="abrirDetalle"
          />
        </template>

        <template v-else>
          <CajaKpis
            :opening-amount="openingAmount"
            :cash-in-register="cashInRegister"
            :efectivo-sales="efectivoSales"
            :card-sales="cardSales"
            :transfer-sales="transferSales"
            :total-tips="totalTips"
          />

          <div class="dashboard-grid">
            <div class="chart-container-card">
              <div class="chart-header">
                <div class="chart-info">
                  <h3>Ventas del día por hora</h3>
                  <p>Monitoreo en tiempo real</p>
                </div>
                <div class="chart-total-badge">
                  Total: ${{ formatMoney(totalVentasDia) }}
                </div>
              </div>
              <div class="canvas-wrapper">
                <canvas ref="chartVentas"></canvas>
              </div>
            </div>

            <CajaAcciones
              :ordenes-listas="ordenesListas"
              :ordenes-en-proceso="ordenesEnProceso"
              :closed-orders-count="closedOrders.length"
              :total-ordenes="orders.length"
              @movimiento="showMovimientoModal = true"
              @exportar="exportarCorte"
              @cerrar="showCloseModal = true"
            />
          </div>

          <CajaPropinas v-if="tipsBreakdown.length > 0" :tips="tipsBreakdown" :total="totalTips" />

          <div class="tabs-navigation">
            <button v-for="tab in tabs" :key="tab.key" 
              @click="selectedTab = tab.key"
              :class="['tab-link', { 'active': selectedTab === tab.key }]">
              {{ tab.label }}
              <span :class="['tab-counter-pill', { 'has-alerts': tab.key === 'open' && ordenesListas > 0 }]">
                {{ tab.count }}
              </span>
            </button>
          </div>

          <div class="data-table-container">
            <CajaTicketGrid 
              v-if="selectedTab === 'open'" 
              type="open" 
              :orders="openOrders" 
              @order-paid="handleOrderPaid" 
              @refresh="loadAllData" 
            />
            <CajaTicketGrid 
              v-else-if="selectedTab === 'closed'" 
              type="closed" 
              :orders="closedOrders" 
              @order-paid="handleOrderPaid" 
              @refresh="loadAllData" 
            />
            <CajaFlowTable 
              v-else-if="selectedTab === 'flow'" 
              :movements="movements" 
              :loading="loading.movements" 
            />
          </div>
        </template>
      </template>
    </div>
  </div>
</template>
<style scoped>
/* Contenedor Principal */
.caja-layout {
  min-height: 100vh;
  background-color: #f6f8fa;
  font-family: 'Inter', -apple-system, sans-serif;
}

.main-content {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Sistema de Toasts (Estilo App) */
.toast-container {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
}

.toast-card {
  pointer-events: auto;
  background: white;
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 300px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  border: 1px solid #f0f0f0;
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-icon-circle {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  background: #6366f1;
  color: white;
}

.toast-card.success .toast-icon-circle { background: #10b981; }
.toast-card.warning .toast-icon-circle { background: #f59e0b; }
.toast-card.error .toast-icon-circle { background: #ef4444; }

.toast-message {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

.toast-close-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.25rem;
  cursor: pointer;
}

/* Vista Caja Cerrada */
.empty-state-card {
  background: white;
  border-radius: 2rem;
  padding: 4rem 2rem;
  text-align: center;
  border: 2px dashed #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.empty-state-icon {
  font-size: 4rem;
  background: #f8fafc;
  width: 6rem;
  height: 6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1.5rem;
}

.empty-state-text h2 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.empty-state-text p {
  color: #64748b;
  margin-top: 0.5rem;
}

.btn-primary-action {
  background: #6366f1;
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 1rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-primary-action:hover {
  transform: translateY(-2px);
  background: #4f46e5;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

@media (min-width: 1280px) {
  .dashboard-grid {
    grid-template-columns: 2fr 1fr;
  }
}

.chart-container-card {
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-info h3 { font-size: 1.125rem; font-weight: 700; margin: 0; }
.chart-info p { font-size: 0.875rem; color: #94a3b8; margin: 0; }

.chart-total-badge {
  background: #f0fdf4;
  color: #166534;
  padding: 0.5rem 1rem;
  border-radius: 99px;
  font-weight: 700;
  font-size: 0.875rem;
}

.canvas-wrapper {
  height: 250px;
  position: relative;
}

/* Tabs Estilo Mercado Pago */
.tabs-navigation {
  display: flex;
  gap: 0.5rem;
  background: #e2e8f0;
  padding: 0.3rem;
  border-radius: 1rem;
  width: fit-content;
  margin: 2rem 0 1rem 0;
}

.tab-link {
  border: none;
  background: transparent;
  padding: 0.6rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 0.875rem;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  transition: all 0.2s;
}

.tab-link.active {
  background: white;
  color: #0f172a;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.tab-counter-pill {
  background: #cbd5e1;
  color: #475569;
  font-size: 0.75rem;
  padding: 0.1rem 0.5rem;
  border-radius: 99px;
}

.has-alerts {
  background: #10b981;
  color: white;
}

/* Data Table Container */
.data-table-container {
  background: white;
  border-radius: 1.5rem;
  border: 1px solid #f1f5f9;
  padding: 1.25rem;
  min-height: 400px;
}

/* Utils */
.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8rem 0;
  color: #94a3b8;
}

.custom-spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #f1f5f9;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spinner-rotate 0.8s linear infinite;
  margin-bottom: 1rem;
}

.is-hidden { display: none; }

@keyframes spinner-rotate { to { transform: rotate(360deg); } }
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>