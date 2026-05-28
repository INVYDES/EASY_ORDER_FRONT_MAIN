<template>
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 flex flex-col gap-3">
      <h3 class="font-semibold text-gray-800 dark:text-gray-200">Acciones</h3>

    <button :disabled="esAdminOPropietario" @click="$emit('movimiento')"
      :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition',
                esAdminOPropietario ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60' : 'bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700']">
      <span class="text-lg">💵</span> Movimiento de efectivo
    </button>
    <button :disabled="esAdminOPropietario" @click="$emit('corte-x')"
      :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition',
               esAdminOPropietario ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60' : 'bg-sky-50 hover:bg-sky-100 text-sky-700']">
      <span class="text-lg">✂️</span> Corte X
    </button>
    <button @click="$emit('exportar')"
      class="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-sm transition">
      <span class="text-lg">🖨️</span> Exportar corte
    </button>
    <button :disabled="esAdminOPropietario" @click="$emit('cerrar')"
      :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition',
               esAdminOPropietario ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60' : 'bg-red-50 hover:bg-red-100 text-red-600']">
      <span class="text-lg">🔒</span> Cerrar caja
    </button>

      <div class="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2 text-sm">
        <div class="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Por cobrar (listas)</span>
          <span class="font-semibold" :class="ordenesListas > 0 ? 'text-emerald-600' : 'text-gray-400 dark:text-gray-500'">{{ ordenesListas }}</span>
        </div>
        <div class="flex justify-between text-gray-600 dark:text-gray-400">
          <span>En proceso</span>
          <span class="font-semibold text-amber-600">{{ ordenesEnProceso }}</span>
        </div>
        <div class="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Cerradas hoy</span>
          <span class="font-semibold text-gray-600 dark:text-gray-400">{{ closedOrdersCount }}</span>
        </div>
        <div class="flex justify-between text-gray-700 dark:text-gray-300 font-semibold border-t border-gray-100 dark:border-gray-700 pt-2">
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
  esAdminOPropietario: { type: Boolean, default: false }
})
defineEmits(['movimiento', 'exportar', 'cerrar', 'corte-x'])
</script>