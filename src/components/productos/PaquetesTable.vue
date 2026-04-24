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
  </div>
</template>

<script setup>
defineProps({
  paquetes: { type: Array, required: true },
  loading: { type: Boolean, default: false }
})

defineEmits(['edit', 'delete', 'toggle-active'])
</script>
