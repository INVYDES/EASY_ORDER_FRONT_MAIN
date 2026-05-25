<template>
  <div
    class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
  >
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">

      <!-- Encabezado -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-lg font-bold text-gray-800">Detalle de Caja</h3>
          <p class="text-xs text-gray-400 mt-0.5">{{ data?.caja?.fecha_apertura?.split(' ')[0] }}</p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl leading-none transition">✕</button>
      </div>

      <!-- Cargando -->
      <div v-if="loading" class="text-center py-10 text-gray-400 text-sm">
        <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
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
            <p class="text-sm font-bold text-gray-800">{{ data.caja.fecha_apertura?.split(' ')[0] }} {{ toLocalTime(data.caja.fecha_apertura) }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ data.caja.abierto_por }}</p>
          </div>
          <div class="bg-red-50 rounded-xl p-4">
            <p class="text-xs text-red-500 font-semibold uppercase tracking-wide mb-1">Cierre</p>
            <p class="text-sm font-bold text-gray-800">{{ data.caja.fecha_cierre ? data.caja.fecha_cierre.split(' ')[0] : '' }} {{ toLocalTime(data.caja.fecha_cierre) }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ data.caja.cerrado_por || '—' }}</p>
          </div>
        </div>

        <!-- Montos -->
        <div class="bg-gray-50 rounded-xl p-4 mb-4">
          <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Montos</p>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Fondo de apertura</span>
              <span class="font-semibold">${{ formatMoney(data.montos.monto_inicial) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Efectivo final contado</span>
              <span class="font-semibold">${{ formatMoney(data.montos.monto_final) }}</span>
            </div>
            <div class="flex justify-between border-t border-gray-200 pt-2">
              <span class="font-semibold text-gray-700">Diferencia</span>
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
        <div class="bg-gray-50 rounded-xl p-4 mb-4">
          <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Ventas</p>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">💵 Efectivo</span>
              <span class="font-semibold">${{ formatMoney(data.ventas.efectivo) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">💳 Tarjeta</span>
              <span class="font-semibold">${{ formatMoney(data.ventas.tarjeta) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">📲 Transferencia</span>
              <span class="font-semibold">${{ formatMoney(data.ventas.transferencia) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">🧾 Órdenes</span>
              <span class="font-semibold">{{ data.ventas.total_ordenes }}</span>
            </div>
          </div>
          <div class="flex justify-between border-t border-gray-200 pt-2 mt-2 text-sm">
            <span class="font-bold text-gray-700">Total ventas</span>
            <span class="font-bold text-gray-900">
              ${{ formatMoney(data.ventas.total) }}
            </span>
          </div>
        </div>

        <!-- Propinas -->
        <div v-if="data.propinas" class="bg-gray-50 rounded-xl p-4 mb-4">
          <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Propinas</p>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">💵 Efectivo</span>
              <span class="font-semibold text-gray-800">${{ formatMoney(data.propinas.efectivo) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">💳 Tarjeta</span>
              <span class="font-semibold text-gray-800">${{ formatMoney(data.propinas.tarjeta) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">📲 Transferencia</span>
              <span class="font-semibold text-gray-800">${{ formatMoney(data.propinas.transferencia) }}</span>
            </div>
          </div>
          <div class="flex justify-between border-t border-gray-200 pt-2 mt-2 text-sm">
            <span class="font-bold text-gray-700">Total propinas</span>
            <span class="font-bold text-gray-900">
              ${{ formatMoney(data.propinas.total) }}
            </span>
          </div>
        </div>

        <!-- Movimientos -->
        <div class="bg-gray-50 rounded-xl p-4 mb-4">
          <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Movimientos de efectivo</p>
          <div class="space-y-2 text-sm mb-4">
            <div class="flex justify-between">
              <span class="text-gray-600">↑ Ingresos manuales</span>
              <span class="font-semibold text-emerald-600">${{ formatMoney(data.movimientos.ingresos) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">↓ Egresos manuales</span>
              <span class="font-semibold text-red-500">${{ formatMoney(data.movimientos.egresos) }}</span>
            </div>
          </div>

          <!-- Listado Detallado de Movimientos -->
          <div v-if="data.movimientos.lista?.length > 0" class="border-t border-gray-200 pt-3">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Registro de Actividad</p>
            <div class="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scroll">
              <div v-for="m in data.movimientos.lista" :key="m.id" 
                class="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100 shadow-sm"
                :class="{ 'border-sky-200 bg-sky-50/30': m.descripcion === 'CORTE X' }"
              >
                <div class="flex items-center gap-2">
                  <span class="text-xs">{{ (m.tipo === 'ingreso' || m.descripcion === 'Apertura de caja') ? '🟢' : '🔴' }}</span>
                  <div>
                    <p class="text-[11px] font-bold text-gray-700" :class="{ 'text-sky-700': m.descripcion === 'CORTE X' }">
                      {{ m.descripcion }}
                    </p>
                    <p class="text-[9px] text-gray-400">{{ toLocalTime(m.created_at || m.fecha) }}</p>
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

        <!-- Botón imprimir -->
        <button
          @click="imprimir"
          class="w-full py-2.5 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition"
        >
          🖨️ Imprimir corte
        </button>

      </template>

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

const getHeaders = () => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

const formatMoney = (v) => v === undefined || v === null ? '0.00' : Number(v).toFixed(2)

// Helper robusto para convertir fecha del servidor (DD/MM/YYYY HH:mm) a hora local
const toLocalTime = (dateStr) => {
  if (!dateStr) return '—';
  try {
    let d;
    // Si ya es un ISO string completo (trae T o Z)
    if (dateStr.includes('T') || dateStr.endsWith('Z')) {
      // Si el string termina en Z pero queremos que sea local, se la quitamos
      d = new Date(dateStr.replace(/Z$/, ''));
    } 
    // Si el formato es DD/MM/YYYY HH:mm:ss
    else if (dateStr.includes('/')) {
      const [fecha, hora] = dateStr.split(' ');
      const [dia, mes, anio] = fecha.split('/');
      d = new Date(`${anio}-${mes}-${dia}T${hora || '00:00:00'}`);
    } 
    // Otros formatos (YYYY-MM-DD HH:mm:ss)
    else {
      d = new Date(dateStr.replace(' ', 'T'));
    }

    if (isNaN(d.getTime())) return dateStr;
    
    // Devolver hora local en formato 24h
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

onMounted(loadDetalle)
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>