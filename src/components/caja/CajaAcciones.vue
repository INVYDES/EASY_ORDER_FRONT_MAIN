<template>
  <div class="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3">
    <h3 class="font-semibold text-gray-800">Acciones</h3>

    <button @click="$emit('movimiento')"
      class="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-sm transition">
      <span class="text-lg">💵</span> Movimiento de efectivo
    </button>
    <button @click="$emit('exportar')"
      class="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-sm transition">
      <span class="text-lg">🖨️</span> Exportar corte
    </button>
    <button @click="$emit('cerrar')"
      class="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm transition">
      <span class="text-lg">🔒</span> Cerrar caja
    </button>

    <div class="mt-auto pt-4 border-t border-gray-100 space-y-2 text-sm">
      <div class="flex justify-between text-gray-600">
        <span>Por cobrar (listas)</span>
        <span class="font-semibold" :class="ordenesListas > 0 ? 'text-emerald-600' : 'text-gray-400'">{{ ordenesListas }}</span>
      </div>
      <div class="flex justify-between text-gray-600">
        <span>En proceso</span>
        <span class="font-semibold text-amber-600">{{ ordenesEnProceso }}</span>
      </div>
      <div class="flex justify-between text-gray-600">
        <span>Cerradas hoy</span>
        <span class="font-semibold text-gray-600">{{ closedOrdersCount }}</span>
      </div>
      <div class="flex justify-between text-gray-700 font-semibold border-t border-gray-100 pt-2">
        <span>Total órdenes</span>
        <span>{{ totalOrdenes }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  ordenesListas:    { type: Number, default: 0 },
  ordenesEnProceso: { type: Number, default: 0 },
  closedOrdersCount:{ type: Number, default: 0 },
  totalOrdenes:     { type: Number, default: 0 },
})
defineEmits(['movimiento', 'exportar', 'cerrar'])
</script>