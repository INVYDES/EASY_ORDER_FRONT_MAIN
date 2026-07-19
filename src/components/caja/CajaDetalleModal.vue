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
            class="py-2.5 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-800 rounded-xl transition flex items-center justify-center gap-2"
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
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[85vh] flex flex-col">
        <!-- Encabezado -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 class="text-lg font-bold text-gray-800">Tickets de Caja</h3>
            <p class="text-xs text-gray-400 mt-0.5">Órdenes cerradas en este corte</p>
          </div>
          <button @click="mostrarTicketsCerrados = false" class="text-gray-400 hover:text-gray-600 text-xl transition">✕</button>
        </div>

        <!-- Cargando -->
        <div v-if="loadingTickets" class="text-center py-20 text-gray-400 flex-1 flex flex-col items-center justify-center">
          <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
          Cargando tickets...
        </div>

        <!-- Sin Tickets -->
        <div v-else-if="ticketsCerrados.length === 0" class="text-center py-20 text-gray-400 italic flex-1 flex flex-col items-center justify-center">
          <span class="text-4xl mb-2">🎟️</span>
          No hay órdenes cerradas registradas en esta caja
        </div>

        <!-- Listado de Tickets -->
        <div v-else class="flex-1 overflow-y-auto py-4 space-y-4 pr-1 custom-scroll">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              v-for="order in ticketsCerrados" 
              :key="order.id"
              class="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-300 transition group"
            >
              <div>
                <!-- Ticket Header -->
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg uppercase">
                        {{ order.metodo_pago || 'Efectivo' }}
                      </span>
                      <span class="text-[10px] text-gray-400 font-bold">
                        {{ formatFechaHora(order.updated_at || order.created_at) }}
                      </span>
                    </div>
                    <h4 class="text-sm font-black text-gray-800 mt-1.5">{{ order.folio || '#' + order.id }}</h4>
                  </div>
                  <span v-if="order.mesa" class="px-2 py-0.5 bg-slate-900 text-white rounded text-[9px] font-black uppercase">
                    MESA {{ order.mesa }}
                  </span>
                </div>

                <!-- Products breakdown -->
                <div class="space-y-1.5 border-t border-gray-100 pt-2 mb-3">
                  <div 
                    v-for="d in order.detalles" 
                    :key="d.id"
                    class="flex justify-between text-xs"
                    :class="d.cancelado ? 'text-red-400 line-through' : 'text-gray-600 font-medium'"
                  >
                    <span class="truncate flex-1">
                      {{ d.cantidad }}× {{ d.producto_nombre }}
                    </span>
                    <span class="text-gray-400 ml-2">${{ Number(d.subtotal).toFixed(2) }}</span>
                  </div>
                </div>
              </div>

              <!-- Ticket Footer -->
              <div class="border-t border-gray-100 pt-2 flex items-center justify-between">
                <div class="text-left">
                  <p class="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-none">Total</p>
                  <span class="text-base font-black text-gray-900">${{ Number(order.total).toFixed(2) }}</span>
                  <span v-if="order.propina > 0" class="text-[8px] block text-emerald-600 font-bold">
                    +${{ Number(order.propina).toFixed(2) }} propina
                  </span>
                </div>
                <button 
                  @click="imprimirTicket(order)"
                  class="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition flex items-center gap-1 shrink-0"
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
import { ref, onMounted } from 'vue'
import { API_URL } from '@/config/api'
import { apiClient } from '@/utils/apiClient'

const props = defineProps({
  cajaId: { type: Number, default: null }, // null = corte del día actual
})

const emit = defineEmits(['close'])

const data    = ref(null)
const loading = ref(true)
const error   = ref('')

const mostrarTicketsCerrados = ref(false)
const ticketsCerrados = ref([])
const loadingTickets = ref(false)

const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

const formatMoney = (v) => v === undefined || v === null ? '0.00' : Number(v).toFixed(2)

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

const formatFechaHora = (dateStr) => {
  if (!dateStr) return '—'
  const d = parseUTCDate(dateStr);
  if (!d) return dateStr;
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

const imprimirTicket = (order) => {
  const win = window.open('', '_blank', 'width=400,height=700')
  
  // Agrupar detalles por comensal
  const grouped = {}
  order.detalles.forEach(d => {
    const nom = d.nom_comensal || d.comensal || 'General'
    if (!grouped[nom]) grouped[nom] = []
    grouped[nom].push(d)
  })

  let itemsHtml = ''
  for (const [comensal, items] of Object.entries(grouped)) {
    itemsHtml += `
      <tr>
        <td colspan="3" style="padding: 2mm 0 1mm 0; font-weight: bold; font-size: 11px; text-transform: uppercase; border-bottom: 1px dotted #ccc;">
          ${comensal === 'Compartido' || comensal === 'General' ? '--- General ---' : `--- Comensal: ${comensal} ---`}
        </td>
      </tr>
    `
    items.forEach(item => {
      itemsHtml += `
        <tr style="${item.cancelado ? 'color: #999; text-decoration: line-through;' : ''}">
          <td style="padding: 1mm 0; vertical-align: top;">${item.cantidad}</td>
          <td style="padding: 1mm 0; text-transform: uppercase;">
            ${item.producto_nombre || 'Producto'}
            ${item.cancelado ? `<span style="font-size: 8px; text-decoration: none !important; display: inline-block; background: #eee; padding: 0 1mm;">[CANCELADO]</span>` : ''}
            ${item.notas && !item.cancelado ? `<div style="font-size: 9px; font-style: italic; color: #555;">* ${item.notas}</div>` : ''}
          </td>
          <td style="text-align: right; padding: 1mm 0; vertical-align: top;">$${Number(item.subtotal).toFixed(2)}</td>
        </tr>
      `
    })
  }

  const pId = data.value?.caja?.propietario_id || ''
  const rId = data.value?.caja?.restaurante_id || ''
  const uniqueIdentifier = `${pId}${rId}${order.id}`

  win.document.write(`
    <html><head><title>Ticket_${uniqueIdentifier}</title>
    <style>
      body{font-family:monospace;font-size:12px;padding:10px;max-width:280px;margin:0 auto;color:#000;}
      table{width:100%;border-collapse:collapse;margin:5px 0;}
      td{padding:2px 0;vertical-align:top;}
      .right{text-align:right;}
      .border-top{border-top:1px dashed #000;margin-top:8px;padding-top:8px;}
      .border-bottom{border-bottom:1px dashed #000;margin-bottom:8px;padding-bottom:8px;}
      .header{text-align:center;}
      .bold{font-weight:bold;}
    </style></head><body>
      <div class="header border-bottom">
        <h2 style="margin:0;font-size:16px;">EASY ORDER</h2>
        <p style="margin:2px 0;">COMPROBANTE DE PAGO</p>
        <p style="margin:2px 0;font-size:10px;">FECHA: ${formatFechaHora(order.updated_at || order.created_at)}</p>
      </div>

      <table>
        <tr><td>MESA</td><td class="right">${order.mesa || 'N/A'}</td></tr>
        <tr><td>FOLIO</td><td class="right">${order.folio || '#' + order.id}</td></tr>
        <tr><td>ATENDIO</td><td class="right">${order.usuario?.name || 'Personal'}</td></tr>
        <tr><td>METODO PAGO</td><td class="right">${(order.metodo_pago || 'efectivo').toUpperCase()}</td></tr>
        ${order.referencia ? `<tr><td>REFERENCIA</td><td class="right">${order.referencia}</td></tr>` : ''}
      </table>

      <div class="border-top">
        <table style="width:100%;">
          <thead>
            <tr style="border-bottom: 1px dashed #000;">
              <th style="text-align: left;">CANT</th>
              <th style="text-align: left;">DESCRIPCION</th>
              <th style="text-align: right;">IMPORTE</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <div class="border-top" style="text-align: right;">
        <p style="margin:2px 0;">SUBTOTAL: <span class="bold">$${Number(order.total - (order.propina || 0)).toFixed(2)}</span></p>
        <p style="margin:2px 0;">PROPINA: <span class="bold">$${Number(order.propina || 0).toFixed(2)}</span></p>
        <h3 style="margin:4px 0;font-size:14px;">TOTAL: $${Number(order.total).toFixed(2)}</h3>
      </div>

      <div class="header border-top" style="margin-top:20px;">
        <p style="font-size:9px;font-weight:bold;">ESTE NO ES UN COMPROBANTE FISCAL</p>
        <p style="font-size:9px;">¡Gracias por su visita!</p>
        <p style="font-size:8px;color:#666;">*** EASY ORDER SYSTEM ***</p>
      </div>
    </body></html>
  `)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 500)
}

onMounted(loadDetalle)
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>