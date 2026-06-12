<template>
  <div
    class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
  >
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto mx-4">

      <!-- Encabezado -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">Detalle de Caja</h3>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ data?.caja?.fecha_apertura?.split(' ')[0] }}</p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 text-xl leading-none transition">✕</button>
      </div>

      <!-- Cargando -->
      <div v-if="loading" class="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">
        <div class="w-8 h-8 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mx-auto mb-3"></div>
        Cargando detalle...
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-10 text-red-500 text-sm">
        {{ error }}
      </div>

      <template v-else-if="data">

        <!-- Apertura / Cierre -->
        <div class="grid grid-cols-2 gap-3 mb-5">
          <div class="bg-emerald-50 rounded-xl p-4">
            <p class="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-1">Apertura</p>
            <p class="text-sm font-bold text-gray-800 dark:text-gray-200">{{ data.caja.fecha_apertura?.split(' ')[0] }} {{ toLocalTime(data.caja.fecha_apertura) }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ data.caja.abierto_por }}</p>
          </div>
          <div class="bg-red-50 rounded-xl p-4">
            <p class="text-xs text-red-500 font-semibold uppercase tracking-wide mb-1">Cierre</p>
            <p class="text-sm font-bold text-gray-800 dark:text-gray-200">{{ data.caja.fecha_cierre ? data.caja.fecha_cierre.split(' ')[0] : '' }} {{ toLocalTime(data.caja.fecha_cierre) }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ data.caja.cerrado_por || '—' }}</p>
          </div>
        </div>

        <!-- Montos -->
        <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-4">
          <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Montos</p>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Fondo de apertura</span>
              <span class="font-semibold">${{ formatMoney(data.montos.monto_inicial) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Efectivo final contado</span>
              <span class="font-semibold">${{ formatMoney(data.montos.monto_final) }}</span>
            </div>
            <div class="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
              <span class="font-semibold text-gray-700 dark:text-gray-300">Diferencia</span>
              <span class="font-bold" :class="data.montos.diferencia >= 0 ? 'text-emerald-600' : 'text-red-500'">
                {{ data.montos.diferencia >= 0 ? '+' : '' }}${{ formatMoney(data.montos.diferencia) }}
                <span class="text-xs font-normal ml-1">
                  {{ data.montos.diferencia > 0 ? '(sobrante)' : data.montos.diferencia < 0 ? '(faltante)' : '(exacto)' }}
                </span>
              </span>
            </div>
          </div>
        </div>

        <!-- Ventas -->
        <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-4">
          <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Ventas</p>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">💵 Efectivo</span>
              <span class="font-semibold">${{ formatMoney(data.ventas.efectivo) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">💳 Tarjeta</span>
              <span class="font-semibold">${{ formatMoney(data.ventas.tarjeta) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">📲 Transferencia</span>
              <span class="font-semibold">${{ formatMoney(data.ventas.transferencia) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">🧾 Órdenes</span>
              <span class="font-semibold">{{ data.ventas.total_ordenes }}</span>
            </div>
          </div>
            <div class="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 text-sm">
            <span class="font-bold text-gray-700 dark:text-gray-300">Total ventas</span>
            <span class="font-bold text-gray-900 dark:text-gray-100">
              ${{ formatMoney(data.ventas.total) }}
            </span>
          </div>
        </div>

        <!-- Propinas -->
        <div v-if="data.propinas" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-4">
          <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Propinas</p>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">💵 Efectivo</span>
              <span class="font-semibold text-gray-800 dark:text-gray-200">${{ formatMoney(data.propinas.efectivo) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">💳 Tarjeta</span>
              <span class="font-semibold text-gray-800 dark:text-gray-200">${{ formatMoney(data.propinas.tarjeta) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">📲 Transferencia</span>
              <span class="font-semibold text-gray-800 dark:text-gray-200">${{ formatMoney(data.propinas.transferencia) }}</span>
            </div>
          </div>
          <div class="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 text-sm">
            <span class="font-bold text-gray-700 dark:text-gray-300">Total propinas</span>
            <span class="font-bold text-gray-900 dark:text-gray-100">
              ${{ formatMoney(data.propinas.total) }}
            </span>
          </div>
        </div>

        <!-- Movimientos -->
        <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-4">
          <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Movimientos de efectivo</p>
          <div class="space-y-2 text-sm mb-4">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">↑ Ingresos manuales</span>
              <span class="font-semibold text-emerald-600">${{ formatMoney(data.movimientos.ingresos) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">↓ Egresos manuales</span>
              <span class="font-semibold text-red-500">${{ formatMoney(data.movimientos.egresos) }}</span>
            </div>
          </div>

          <!-- Listado Detallado de Movimientos -->
          <div v-if="data.movimientos.lista?.length > 0" class="border-t border-gray-200 dark:border-gray-700 pt-3">
            <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Registro de Actividad</p>
            <div class="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scroll">
              <div v-for="m in data.movimientos.lista" :key="m.id" 
                class="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm"
                :class="{ 'border-sky-200 bg-sky-50/30': m.descripcion === 'CORTE X' }"
              >
                <div class="flex items-center gap-2">
                  <span class="text-xs">{{ (m.tipo === 'ingreso' || m.descripcion === 'Apertura de caja') ? '🟢' : '🔴' }}</span>
                  <div>
                    <p class="text-[11px] font-bold text-gray-700 dark:text-gray-300" :class="{ 'text-sky-700': m.descripcion === 'CORTE X' }">
                      {{ m.descripcion }}
                    </p>
                    <p class="text-[9px] text-gray-400 dark:text-gray-500">{{ toLocalTime(m.created_at || m.fecha) }}</p>
                  </div>
                </div>
                <span class="text-xs font-black" :class="(m.tipo === 'ingreso' || m.descripcion === 'Apertura de caja') ? 'text-emerald-600' : 'text-red-500'">
                  {{ (m.tipo === 'ingreso' || m.descripcion === 'Apertura de caja') ? '+' : '-' }}${{ formatMoney(m.monto) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Observaciones -->
        <div v-if="data.observaciones" class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
          <p class="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">Observaciones</p>
          <p class="text-sm text-amber-800">{{ data.observaciones }}</p>
        </div>

        <!-- Botones de acción -->
        <div class="grid grid-cols-2 gap-3 mt-4">
          <button
            @click="imprimir"
            class="py-2.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition flex items-center justify-center gap-2"
          >
            🖨️ Imprimir corte
          </button>
          <button
            @click="abrirTickets"
            class="py-2.5 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 rounded-xl transition flex items-center justify-center gap-2"
          >
            🎟️ Ver tickets
          </button>
        </div>

      </template>

    </div>

    <!-- ══ SUBMODAL: TICKETS CERRADOS ══ -->
    <div
      v-if="mostrarTicketsCerrados"
      class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center px-4"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[85vh] flex flex-col">
        <!-- Encabezado -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">Tickets de Caja</h3>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Órdenes cerradas en este corte</p>
          </div>
          <button @click="mostrarTicketsCerrados = false" class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 text-xl transition">✕</button>
        </div>

        <!-- Cargando -->
        <div v-if="loadingTickets" class="text-center py-20 text-gray-400 dark:text-gray-500 flex-1 flex flex-col items-center justify-center">
          <div class="w-8 h-8 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mb-3"></div>
          Cargando tickets...
        </div>

        <!-- Sin Tickets -->
        <div v-else-if="ticketsCerrados.length === 0" class="text-center py-20 text-gray-400 dark:text-gray-500 italic flex-1 flex flex-col items-center justify-center">
          <span class="text-4xl mb-2">🎟️</span>
          No hay órdenes cerradas registradas en esta caja
        </div>

        <!-- Listado de Tickets -->
        <div v-else class="flex-1 overflow-y-auto py-4 space-y-4 pr-1 custom-scroll">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              v-for="order in ticketsCerrados" 
              :key="order.id"
              class="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-600 transition group"
            >
              <div>
                <!-- Ticket Header -->
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-lg uppercase">
                        {{ order.metodo_pago || 'Efectivo' }}
                      </span>
                      <span class="text-[10px] text-gray-400 dark:text-gray-500 font-bold">
                        {{ toLocalDateTime(order.updated_at || order.created_at) }}
                      </span>
                    </div>
                    <h4 class="text-sm font-black text-gray-800 dark:text-gray-200 mt-1.5">{{ order.folio || '#' + order.id }}</h4>
                  </div>
                  <span v-if="order.mesa" class="px-2 py-0.5 bg-slate-900 text-white rounded text-[9px] font-black uppercase">
                    MESA {{ order.mesa }}
                  </span>
                </div>

                <!-- Products breakdown -->
                <div class="space-y-1.5 border-t border-gray-100 dark:border-gray-700 pt-2 mb-3">
                  <div 
                    v-for="d in order.detalles" 
                    :key="d.id"
                    class="flex justify-between text-xs"
                    :class="d.cancelado ? 'text-red-400 line-through' : 'text-gray-600 dark:text-gray-400 font-medium'"
                  >
                    <span class="truncate flex-1">
                      {{ d.cantidad }}× {{ d.producto_nombre }}
                    </span>
                    <span class="text-gray-400 dark:text-gray-500 ml-2">${{ Number(d.subtotal).toFixed(2) }}</span>
                  </div>
                </div>
              </div>

              <!-- Ticket Footer -->
              <div class="border-t border-gray-100 dark:border-gray-700 pt-2 flex items-center justify-between">
                <div class="text-left">
                  <p class="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider leading-none">Total</p>
                  <span class="text-base font-black text-gray-900 dark:text-gray-100">${{ Number(order.total).toFixed(2) }}</span>
                  <span v-if="order.propina > 0" class="text-[8px] block text-emerald-600 font-bold">
                    +${{ Number(order.propina).toFixed(2) }} propina
                  </span>
                </div>
                <button 
                  @click="reimprimirTicket(order)"
                  class="px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition flex items-center gap-1 shrink-0"
                >
                  🖨️ Reimprimir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { API_URL } from '@/config/api'
import { apiClient } from '@/utils/apiClient'

const props = defineProps({
  cajaId: { type: Number, default: null }, // null = corte del día actual
})

const emit = defineEmits(['close'])

const data    = ref(null)
const loading = ref(true)
const error   = ref('')

const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

const parseUTCDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  try {
    let d;
    if (typeof dateStr === 'string') {
      if (dateStr.includes('T')) {
        if (dateStr.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(dateStr)) {
          d = new Date(dateStr);
        } else {
          d = new Date(dateStr + 'Z');
        }
      } else if (dateStr.includes('/')) {
        const parts = dateStr.trim().split(' ');
        const fecha = parts[0];
        const hora = parts[1] || '00:00:00';
        const [dia, mes, anio] = fecha.split('/');
        d = new Date(`${anio}-${mes}-${dia}T${hora}`);
      } else {
        const cleanStr = dateStr.replace(' ', 'T');
        d = new Date(cleanStr);
      }
    } else {
      d = new Date(dateStr);
    }
    if (isNaN(d.getTime())) return null;
    return d;
  } catch (e) {
    return null;
  }
};

const formatMoney = (v) => v === undefined || v === null ? '0.00' : Number(v).toFixed(2)

// Helper robusto para convertir fecha del servidor (DD/MM/YYYY HH:mm) a hora local
const toLocalTime = (dateStr) => {
  if (!dateStr) return '—';
  const d = parseUTCDate(dateStr);
  if (!d) return dateStr;
  try {
    return d.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  } catch (e) {
    return dateStr;
  }
};

const toLocalDateTime = (dateStr) => {
  if (!dateStr) return '—'
  const d = parseUTCDate(dateStr)
  if (!d) return dateStr
  try {
    return d.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } catch (e) {
    return dateStr
  }
}

const loadDetalle = async () => {
  loading.value = true
  error.value   = ''
  try {
    // Si tiene cajaId específico usar historial, si no el corte del día
    const endpoint = props.cajaId
      ? `/caja/historial/${props.cajaId}`
      : '/caja/corte'

    const resp = await apiClient.get(endpoint)

    if (resp?.success) {
      data.value = resp.data
    } else {
      error.value = resp?.message || 'No se pudo cargar el detalle'
    }
  } catch (e) {
    error.value = 'Error de conexión'
  } finally {
    loading.value = false
  }
}

const imprimir = () => {
  if (!data.value) return
  const d = data.value
  const win = window.open('', '_blank', 'width=400,height=700')
  
  // Construir filas de movimientos detallados
  let movimientosHTML = '';
  if (d.movimientos.lista && d.movimientos.lista.length > 0) {
    movimientosHTML = d.movimientos.lista.map(m => `
      <tr>
        <td style="font-size:10px;">${toLocalTime(m.created_at || m.fecha)} ${m.descripcion}</td>
        <td class="right" style="font-size:10px;">${(m.tipo === 'ingreso' || m.descripcion === 'Apertura de caja') ? '+' : '-'}$${Number(m.monto).toFixed(2)}</td>
      </tr>
    `).join('');
  }

  win.document.write(`
    <html><head><title>Corte de Caja Detallado</title>
    <style>
      body{font-family:monospace;font-size:12px;padding:10px;max-width:280px;margin:0 auto;color:#000;}
      table{width:100%;border-collapse:collapse;margin:5px 0;}
      td{padding:2px 0;vertical-align:top;}
      .right{text-align:right;}
      .border-top{border-top:1px dashed #000;margin-top:8px;padding-top:8px;}
      .border-bottom{border-bottom:1px dashed #000;margin-bottom:8px;padding-bottom:8px;}
      .header{text-align:center;}
      .section-title{font-weight:bold;text-transform:uppercase;font-size:10px;margin-top:10px;display:block;}
      .bold{font-weight:bold;}
    </style></head><body>
      <div class="header border-bottom">
        <h2 style="margin:0;font-size:16px;">EASY ORDER</h2>
        <p style="margin:2px 0;">DETALLE DE CAJA</p>
        <p style="margin:2px 0;font-size:10px;">FECHA: ${d.caja.fecha_apertura?.split(' ')[0]}</p>
      </div>

      <table>
        <tr><td>APERTURA</td><td class="right">${toLocalTime(d.caja.fecha_apertura)}</td></tr>
        <tr><td>CIERRE</td><td class="right">${toLocalTime(d.caja.fecha_cierre)}</td></tr>
        <tr><td>USUARIO</td><td class="right">${d.caja.abierto_por}</td></tr>
      </table>

      <div class="border-top">
        <span class="section-title">MONTOS DE CONTROL</span>
        <table>
          <tr><td>Fondo apertura</td><td class="right">$${formatMoney(d.montos.monto_inicial)}</td></tr>
          <tr><td>Efectivo final</td><td class="right">$${formatMoney(d.montos.monto_final)}</td></tr>
          <tr class="bold"><td>Diferencia</td><td class="right">$${formatMoney(d.montos.diferencia)}</td></tr>
        </table>
      </div>

      <div class="border-top">
        <span class="section-title">DESGLOSE VENTAS</span>
        <table>
          <tr><td>Efectivo</td><td class="right">$${formatMoney(d.ventas.efectivo)}</td></tr>
          <tr><td>Tarjeta</td><td class="right">$${formatMoney(d.ventas.tarjeta)}</td></tr>
          <tr><td>Transferencia</td><td class="right">$${formatMoney(d.ventas.transferencia)}</td></tr>
          <tr><td>Total Ordenes</td><td class="right">${d.ventas.total_ordenes}</td></tr>
          <tr class="bold"><td>TOTAL VENTAS</td><td class="right">$${formatMoney(d.ventas.total)}</td></tr>
        </table>
      </div>

      <div class="border-top">
        <span class="section-title">PROPINAS</span>
        <table>
          <tr><td>Efectivo</td><td class="right">$${formatMoney(d.propinas?.efectivo)}</td></tr>
          <tr><td>Tarjeta</td><td class="right">$${formatMoney(d.propinas?.tarjeta)}</td></tr>
          <tr><td>Transferencia</td><td class="right">$${formatMoney(d.propinas?.transferencia)}</td></tr>
          <tr class="bold"><td>TOTAL PROPINAS</td><td class="right">$${formatMoney(d.propinas?.total)}</td></tr>
        </table>
      </div>

      <div class="border-top">
        <span class="section-title">FLUJO DE CAJA (Manual)</span>
        <table>
          <tr><td>(+) Ingresos</td><td class="right">$${formatMoney(d.movimientos.ingresos)}</td></tr>
          <tr><td>(-) Egresos</td><td class="right">$${formatMoney(d.movimientos.egresos)}</td></tr>
        </table>
      </div>

      <div class="border-top">
        <span class="section-title">REGISTRO DE ACTIVIDAD</span>
        <table>
          ${movimientosHTML || '<tr><td colspan="2">Sin movimientos</td></tr>'}
        </table>
      </div>

      ${d.observaciones ? `
      <div class="border-top">
        <span class="section-title">OBSERVACIONES</span>
        <p style="font-size:10px;margin:2px 0;">${d.observaciones}</p>
      </div>` : ''}

      <div class="header border-top" style="margin-top:20px;">
        <p style="font-size:9px;">Generado por Easy Order</p>
        <p style="font-size:9px;">${new Date().toLocaleString('es-MX')}</p>
      </div>
    </body></html>
  `)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 300)
}

// ── Datos del Usuario e Identidad de Sucursal ────────────────────────────
const userRaw = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}'
const user = JSON.parse(userRaw)
const userName = computed(() => user.name || 'Personal')

const esMesero = computed(() => {
  const roles = user.roles || []
  return roles.some(r => {
    if (typeof r === 'string') return r.toUpperCase() === 'MESERO'
    return r.id === 3 || r.id === '3' || r.nombre?.toUpperCase() === 'MESERO'
  })
})

const nombreSucursal = ref('RESTAURANTE E-ORDER')
const datosSucursal  = ref({ direccion: '', telefono: '', propietario_id: '' })
const detectedRestId = ref(null)

const restauranteId = computed(() => {
  if (detectedRestId.value) return detectedRestId.value
  if (data.value?.caja?.restaurante_id && data.value.caja.restaurante_id !== 'undefined' && data.value.caja.restaurante_id !== 'null')
    return data.value.caja.restaurante_id
  return ''
})

const selectedOrder = ref(null)

const uniqueIdentifier = computed(() => {
  if (!selectedOrder.value) return ''
  const pId = datosSucursal.value.propietario_id || user.propietario_id || ''
  const rId = restauranteId.value || ''
  return `${pId}${rId}${selectedOrder.value.id}`
})

const detallesSinAsignar = computed(() => {
  if (!selectedOrder.value?.detalles) return []
  return selectedOrder.value.detalles.filter(d => !d.cancelado)
})

// ── Estado Tickets Cerrados ───────────────────────────────────────────────
const mostrarTicketsCerrados = ref(false)
const ticketsCerrados = ref([])
const loadingTickets = ref(false)

const cargarTicketsCerrados = async () => {
  if (!data.value?.caja?.id) return
  loadingTickets.value = true
  try {
    const endpoint = `/caja/historial/${data.value.caja.id}/ordenes`
    const resp = await apiClient.get(endpoint)
    if (resp?.success) {
      ticketsCerrados.value = resp.data || []
    }
  } catch (err) {
    console.error('Error cargando tickets de caja:', err)
  } finally {
    loadingTickets.value = false
  }
}

const abrirTickets = async () => {
  mostrarTicketsCerrados.value = true
  await cargarTicketsCerrados()
}

// ── Sincronización de Identidad ───────────────────────────────────────────
const syncIdentity = async (order) => {
  if (!order) return
  try {
    const rid = order.restaurante_id || order.id_restaurante || restauranteId.value
    if (rid && (!datosSucursal.value.propietario_id || detectedRestId.value !== rid)) {
      const dataR = await apiClient.get(`/restaurantes/${rid}`)
      const r = dataR.data || dataR
      if (r) {
        nombreSucursal.value = (r.nombre || 'RESTAURANTE').toUpperCase()
        const d = r.direccion || {}
        const partes = [d.calle, d.ciudad, d.estado].filter(p => p && p.trim().length > 0)
        datosSucursal.value = {
          direccion: partes.join(', '),
          telefono: r.telefono || '',
          propietario_id: r.propietario_id || ''
        }
        detectedRestId.value = rid
      }
    }
  } catch (err) {
    console.error('Error en syncIdentity:', err)
  }
}

// ── Generar HTML de Ticket (80mm térmico) ────────────────────────────────
const generarTicketHTML = (order) => {
  const rid = order.restaurante_id || order.id_restaurante || restauranteId.value || ''
  const pId = datosSucursal.value.propietario_id || user.propietario_id || ''
  const uIdent = `${pId}${rid}${order.id}`

  const items = order.detalles || []
  const grouped = {}
  items.forEach(item => {
    const comensal = item.nom_comensal || item.comensal || item.nombre_comensal || 'Compartido'
    if (!grouped[comensal]) grouped[comensal] = []
    grouped[comensal].push({
      cantidad: item.cantidad || 0,
      nombre: item.producto_nombre || item.nombre || (typeof item.producto === 'string' ? item.producto : item.producto?.nombre) || 'Producto',
      subtotal: item.subtotal || 0,
      notas: item.notas || '',
      cancelado: !!item.cancelado,
      motivo_cancelacion: item.motivo_cancelacion || ''
    })
  })

  const fechaText = toLocalDateTime(order.updated_at || order.created_at || new Date())

  let itemsHtml = ''
  for (const [comensal, comensalItems] of Object.entries(grouped)) {
    itemsHtml += `
      <tr>
        <td colspan="3" style="padding: 2mm 0 1mm 0; font-weight: bold; font-size: 11px; text-transform: uppercase; border-bottom: 1px dotted #ccc;">
          ${comensal === 'Compartido' ? '--- General ---' : `--- Comensal: ${comensal} ---`}
        </td>
      </tr>
    `
    comensalItems.forEach(item => {
      itemsHtml += `
        <tr style="${item.cancelado ? 'color: #999; text-decoration: line-through;' : ''}">
          <td style="padding: 1mm 0; vertical-align: top;">${item.cantidad}</td>
          <td style="padding: 1mm 0; text-transform: uppercase;">
            ${item.nombre}
            ${item.cancelado ? `<span style="font-size: 8px; text-decoration: none !important; display: inline-block; background: #eee; padding: 0 1mm;">[CANCELADO]</span>` : ''}
            ${item.notas && !item.cancelado ? `<div style="font-size: 9px; font-style: italic; color: #555;">* ${item.notas}</div>` : ''}
            ${item.cancelado && item.motivo_cancelacion ? `<div style="font-size: 8px; font-style: italic; text-decoration: none !important;">Motivo: ${item.motivo_cancelacion}</div>` : ''}
          </td>
          <td style="text-align: right; padding: 1mm 0; vertical-align: top;">$${Number(item.subtotal).toFixed(2)}</td>
        </tr>
      `
    })
  }

  const subtotal = Number(order.total || 0)
  const propina = Number(order.propina || 0)

  const refHtml = (order.referencia && order.referencia.trim())
    ? `<p style="margin: 2px 0;"><strong>Referencia:</strong> ${order.referencia.toUpperCase()}</p>`
    : ''

  const atendio = order.mesero && order.mesero !== 'N/A' ? order.mesero : (order.user?.name || order.usuario?.name || userName.value)

  return `
    <div style="width: 80mm; padding: 2mm; font-family: 'Courier New', Courier, monospace; color: #000; background: #fff;">
      <div style="text-align: center; margin-bottom: 4mm;">
        <h2 style="margin: 0; font-size: 16px; font-weight: bold; text-transform: uppercase;">${nombreSucursal.value}</h2>
        ${datosSucursal.value.direccion && datosSucursal.value.direccion.trim().length > 2 ? `<p style="margin: 2px 0; font-size: 10px; line-height: 1.2;">${datosSucursal.value.direccion}</p>` : ''}
        ${datosSucursal.value.telefono ? `<p style="margin: 2px 0; font-size: 10px;">TEL: ${datosSucursal.value.telefono}</p>` : ''}
        <div style="border-bottom: 1px dashed #000; margin-top: 3mm; margin-bottom: 3mm;"></div>
        <p style="margin: 0; font-size: 12px; font-weight: bold;">Comprobante de Pago</p>
        <p style="margin: 2px 0; font-size: 10px;">${fechaText}</p>
      </div>
      <div style="font-size: 11px; margin-bottom: 3mm;">
        <div style="display: flex; justify-content: space-between;">
          <span><strong>Mesa:</strong> ${order.mesa || 'N/A'}</span>
          <span><strong>Folio:</strong> ${uIdent}</span>
        </div>
        <p style="margin: 2px 0;"><strong>Atendió:</strong> ${atendio}</p>
        <p style="margin: 2px 0;"><strong>Pago:</strong> ${(order.metodo_pago || 'EFECTIVO').toUpperCase()}</p>
        ${refHtml}
      </div>
      <table style="width: 100%; font-size: 11px; border-collapse: collapse; margin-bottom: 4mm;">
        <thead>
          <tr style="border-top: 1px dashed #000; border-bottom: 1px dashed #000;">
            <th style="text-align: left; padding: 1.5mm 0; width: 10%;">CANT</th>
            <th style="text-align: left; padding: 1.5mm 0; width: 60%;">DESCRIPCION</th>
            <th style="text-align: right; padding: 1.5mm 0; width: 30%;">IMPORTE</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <div style="font-size: 11px; text-align: right;">
        <div style="display: flex; justify-content: flex-end; margin-bottom: 1mm;">
          <span style="width: 30%;">SUBTOTAL:</span>
          <span style="width: 30%; font-weight: bold;">$${subtotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: flex-end; font-size: 14px; margin-top: 2mm; border-top: 1.5px solid #000; padding-top: 2mm;">
          <span style="width: 30%; font-weight: bold;">TOTAL:</span>
          <span style="width: 30%; font-weight: bold;">$${subtotal.toFixed(2)}</span>
        </div>
        ${propina > 0 ? `
        <div style="display: flex; justify-content: flex-end; margin-top: 2mm; color: #444;">
          <span style="width: 30%;">PROPINA:</span>
          <span style="width: 30%;">$${propina.toFixed(2)}</span>
        </div>` : ''}
      </div>
      <div style="margin-top: 8mm; text-align: center; border-top: 1px dashed #000; padding-top: 4mm;">
        <p style="margin: 4px 0; font-size: 9px; font-weight: bold;">ESTE NO ES UN COMPROBANTE FISCAL</p>
        <p style="margin: 2px 0; font-size: 9px; font-weight: bold;">PROPINA NO INCLUIDA EN EL TOTAL</p>
        <div style="margin-top: 5mm;">
          <p style="margin: 0; font-size: 9px; color: #444;">Código de Rastreo:</p>
          <p style="margin: 2px 0; font-size: 11px; font-weight: bold; letter-spacing: 1px;">* ${uIdent} *</p>
        </div>
        <p style="margin-top: 5mm; font-size: 11px; font-style: italic;">¡Gracias por su visita!</p>
        <p style="margin-top: 2mm; font-size: 8px; color: #666;">*** EASY ORDER SYSTEM ***</p>
      </div>
    </div>
  `
}

// ── Reimprimir Ticket ─────────────────────────────────────────────────────
const reimprimirTicket = async (order) => {
  selectedOrder.value = order
  await syncIdentity(order)

  const ticketHtml = generarTicketHTML(order)
  const rid = order.restaurante_id || order.id_restaurante || restauranteId.value || ''
  const pId = datosSucursal.value.propietario_id || user.propietario_id || ''
  const uIdent = `${pId}${rid}${order.id}`
  const win = window.open('', '_blank', 'width=400,height=600')
  win.document.write(`
    <html>
      <head>
        <title>Ticket_${uIdent}</title>
        <style>
          @page { margin: 0; }
          body { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        ${ticketHtml}
      </body>
    </html>
  `)
  win.document.close()
  win.focus()
  setTimeout(() => {
    win.print()
    win.close()
  }, 500)
}

// ── Imprimir Ticket (con guardia de mesero) ───────────────────────────────
const imprimirTicket = (order) => {
  if (!esMesero.value) {
    selectedOrder.value = order
    reimprimirTicket(order)
  }
}

onMounted(loadDetalle)
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>