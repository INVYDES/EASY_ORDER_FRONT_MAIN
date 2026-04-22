<template>
  <div
    class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
    @click.self="$emit('close')"
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
            <p class="text-sm font-bold text-gray-800">{{ data.caja.fecha_apertura }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ data.caja.abierto_por }}</p>
          </div>
          <div class="bg-red-50 rounded-xl p-4">
            <p class="text-xs text-red-500 font-semibold uppercase tracking-wide mb-1">Cierre</p>
            <p class="text-sm font-bold text-gray-800">{{ data.caja.fecha_cierre || '—' }}</p>
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
            <span class="font-bold text-indigo-600">
              ${{ formatMoney(data.ventas.efectivo + data.ventas.tarjeta + data.ventas.transferencia) }}
            </span>
          </div>
        </div>

        <!-- Movimientos -->
        <div class="bg-gray-50 rounded-xl p-4 mb-4">
          <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Movimientos de efectivo</p>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">↑ Ingresos manuales</span>
              <span class="font-semibold text-emerald-600">${{ formatMoney(data.movimientos.ingresos) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">↓ Egresos manuales</span>
              <span class="font-semibold text-red-500">${{ formatMoney(data.movimientos.egresos) }}</span>
            </div>
            <div class="flex justify-between border-t border-gray-200 pt-2">
              <span class="text-gray-500">Total movimientos</span>
              <span class="font-semibold">{{ data.movimientos.total_movimientos }}</span>
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

const loadDetalle = async () => {
  loading.value = true
  error.value   = ''
  try {
    // Si tiene cajaId específico usar historial, si no el corte del día
    const url = props.cajaId
      ? `${API_URL}/caja/historial/${props.cajaId}`
      : `${API_URL}/caja/corte`

    const res  = await fetch(url, { headers: getHeaders() })
    const resp = await res.json()

    if (res.ok && resp.success) {
      data.value = resp.data
    } else {
      error.value = resp.message || 'No se pudo cargar el detalle'
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
  const total = (d.ventas.efectivo + d.ventas.tarjeta + d.ventas.transferencia)
  const win = window.open('', '_blank', 'width=400,height=700')
  win.document.write(`
    <html><head><title>Corte de Caja</title>
    <style>body{font-family:monospace;font-size:12px;padding:16px;max-width:300px;margin:0 auto;}
    table{width:100%;border-collapse:collapse;}td{padding:2px 0;}
    .right{text-align:right;}.border{border-top:1px dashed #000;padding-top:6px;margin-top:6px;}
    h2,p{text-align:center;margin:4px 0;}
    </style></head><body>
    <h2>EASY ORDER</h2><p>CORTE DE CAJA</p>
    <p style="font-size:10px;">${d.caja.fecha_apertura?.split(' ')[0]}</p>
    <div class="border"></div>
    <table>
      <tr><td>Apertura</td><td class="right">${d.caja.fecha_apertura}</td></tr>
      <tr><td>Cierre</td><td class="right">${d.caja.fecha_cierre || '—'}</td></tr>
      <tr><td>Abierto por</td><td class="right">${d.caja.abierto_por}</td></tr>
    </table>
    <div class="border"></div>
    <table>
      <tr><td>Fondo apertura</td><td class="right">$${formatMoney(d.montos.monto_inicial)}</td></tr>
      <tr><td>Efectivo final</td><td class="right">$${formatMoney(d.montos.monto_final)}</td></tr>
      <tr><td><b>Diferencia</b></td><td class="right"><b>$${formatMoney(d.montos.diferencia)}</b></td></tr>
    </table>
    <div class="border"></div>
    <table>
      <tr><td>Ventas efectivo</td><td class="right">$${formatMoney(d.ventas.efectivo)}</td></tr>
      <tr><td>Ventas tarjeta</td><td class="right">$${formatMoney(d.ventas.tarjeta)}</td></tr>
      <tr><td>Transferencias</td><td class="right">$${formatMoney(d.ventas.transferencia)}</td></tr>
      <tr><td><b>Total ventas</b></td><td class="right"><b>$${formatMoney(total)}</b></td></tr>
    </table>
    ${d.observaciones ? `<div class="border"></div><p style="text-align:left">Obs: ${d.observaciones}</p>` : ''}
    <div class="border"></div>
    <p style="font-size:10px;">Generado por Easy Order</p>
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