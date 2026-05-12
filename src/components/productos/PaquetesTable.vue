<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div v-if="loading" class="text-center py-16 text-gray-400">
      <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
      Cargando paquetes...
    </div>

    <div v-else-if="paquetes.length === 0" class="text-center py-20">
      <span class="text-5xl block mb-4">🎁</span>
      <p class="text-gray-500 font-medium">No hay paquetes creados aún</p>
      <p class="text-sm text-gray-400 mt-1">Crea combinaciones de productos para tus clientes</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-100">
        <thead class="bg-gray-50/50">
          <tr>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Paquete</th>
            <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contenido</th>
            <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Precio</th>
            <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="pkg in paquetes" :key="pkg.id" class="hover:bg-gray-50/80 transition-colors group">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center overflow-hidden border border-indigo-100 shrink-0">
                  <img v-if="pkg.imagen_url" :src="pkg.imagen_url" class="w-full h-full object-cover" />
                  <span v-else class="text-xl">🎁</span>
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-900">{{ pkg.nombre }}</p>
                  <p class="text-xs text-gray-400 truncate max-w-[200px]">{{ pkg.descripcion || 'Sin descripción' }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="prod in pkg.productos" 
                  :key="prod.id"
                  class="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-medium"
                >
                  {{ prod.pivot.cantidad }}x {{ prod.nombre }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4 text-right">
              <span class="text-sm font-black text-indigo-600">${{ Number(pkg.precio).toFixed(2) }}</span>
            </td>
            <td class="px-6 py-4 text-center">
              <button 
                @click="$emit('toggle-active', pkg.id)"
                :class="[
                  'px-3 py-1 rounded-full text-[10px] font-bold transition-all',
                  pkg.activo ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                ]"
              >
                {{ pkg.activo ? 'ACTIVO' : 'INACTIVO' }}
              </button>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex justify-end gap-2">
                <button 
                  @click="$emit('edit', pkg)"
                  class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                >
                  <span class="text-lg">✏️</span>
                </button>
                <button 
                  @click="$emit('delete', pkg.id)"
                  class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <span class="text-lg">🗑️</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pagination && pagination.total > 0" class="px-5 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
      <p class="text-xs text-gray-500">
        Mostrando <span class="font-medium text-gray-700">{{ pagination.from || ((pagination.current_page - 1) * pagination.per_page + 1) }}</span> a 
        <span class="font-medium text-gray-700">{{ pagination.to || Math.min(pagination.current_page * pagination.per_page, pagination.total) }}</span> de 
        <span class="font-medium text-gray-700">{{ pagination.total }}</span> resultados
      </p>
      
      <div class="flex items-center gap-2">
        <button 
          @click="$emit('change-page', pagination.current_page - 1)"
          :disabled="pagination.current_page === 1"
          class="p-2 border rounded-xl bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span class="text-xs font-semibold px-3 py-1 bg-white border rounded-lg shadow-sm">
          Pág. {{ pagination.current_page }} / {{ pagination.last_page }}
        </span>

        <button 
          @click="$emit('change-page', pagination.current_page + 1)"
          :disabled="pagination.current_page >= pagination.last_page"
          class="p-2 border rounded-xl bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  paquetes: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  pagination: { type: Object, default: () => ({ current_page: 1, last_page: 1, total: 0, per_page: 10 }) }
})

defineEmits(['edit', 'delete', 'toggle-active', 'change-page'])
</script>
