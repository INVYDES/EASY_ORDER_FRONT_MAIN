<template>
  <div class="overflow-x-auto">

    <div v-if="loading" class="text-center py-10 text-gray-400 text-sm">
      Cargando movimientos...
    </div>

    <div v-else-if="movements.length === 0" class="text-center py-10 text-gray-400 italic text-sm">
      No hay movimientos registrados
    </div>

    <table v-else class="w-full text-sm">
      <thead>
        <tr class="text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
          <th class="text-left py-3 px-3">Tipo</th>
          <th class="text-left px-3">Monto</th>
          <th class="text-left px-3">Descripción</th>
          <th class="text-left px-3">Referencia</th>
          <th class="text-left px-3">Usuario</th>
          <th class="text-left px-3">Hora</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        <tr
          v-for="m in movements"
          :key="m.id"
          class="hover:bg-gray-50 transition"
        >
          <!-- Tipo -->
          <td class="py-3 px-3">
            <span
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
              :class="isIngreso(m.tipo)
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-600'"
            >
              {{ tipoLabel(m.tipo) }}
            </span>
          </td>

          <!-- Monto -->
          <td class="px-3 font-bold"
            :class="isIngreso(m.tipo) ? 'text-emerald-600' : 'text-red-500'"
          >
            {{ isIngreso(m.tipo) ? '+' : '-' }}${{ formatMoney(m.monto) }}
          </td>

          <!-- Descripción -->
          <td class="px-3 text-gray-700">{{ m.descripcion || m.concepto || '—' }}</td>

          <!-- Referencia / Folio del Voucher -->
          <td class="px-3">
            <span v-if="m.folio || m.referencia"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
            >
              {{ m.folio || m.referencia }}
            </span>
            <span v-else-if="m.metodo_pago && m.metodo_pago !== 'efectivo'"
              class="text-amber-600 text-xs"
            >
              Sin referencia
            </span>
            <span v-else class="text-gray-400 text-xs">—</span>
          </td>

          <!-- Usuario -->
          <td class="px-3 text-gray-500 text-xs">{{ m.usuario || '—' }}</td>

          <!-- Hora -->
          <td class="px-3 text-gray-400 text-xs">
            {{ formatTime(m.created_at || m.created_at_formateado) }}
          </td>
        </tr>
      </tbody>
    </table>

  </div>
</template>

<script setup>
defineProps({
  movements: { type: Array,   default: () => [] },
  loading:   { type: Boolean, default: false    },
})

// Backend devuelve: 'ingreso', 'egreso', 'apertura'
const isIngreso = (tipo) =>
  tipo === 'ingreso' || tipo === 'INGRESO' || tipo === 'ENTRADA' || tipo === 'apertura'

const tipoLabel = (tipo) => {
  const map = {
    ingreso:   '↑ Ingreso',
    egreso:    '↓ Egreso',
    apertura:  '🔓 Apertura',
    INGRESO:   '↑ Ingreso',
    EGRESO:    '↓ Egreso',
    ENTRADA:   '↑ Ingreso',
    SALIDA:    '↓ Egreso',
  }
  return map[tipo] || tipo
}

const formatMoney = (v) =>
  v === undefined || v === null ? '0.00' : Number(v).toFixed(2)

const formatTime = (ts) => {
  if (!ts) return '—'
  // Si ya viene formateado del backend (dd/mm/yyyy HH:mm), mostrarlo directo
  if (typeof ts === 'string' && ts.includes('/')) return ts
  return new Date(ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}
</script>