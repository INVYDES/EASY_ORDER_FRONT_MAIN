<template>
  <div
    class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
    :class="!hasStock ? 'opacity-60' : ''"
  >

    <!-- Imagen -->
    <div class="w-full h-36 bg-gray-100 overflow-hidden shrink-0">
      <img
        v-if="imagenUrl"
        :src="imagenUrl"
        :alt="product.nombre"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-4xl">
        🍽️
      </div>
    </div>

    <!-- Contenido -->
    <div class="p-3 flex flex-col flex-1">

      <!-- Categoría badge -->
      <span
        v-if="product.categoria?.nombre"
        class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit mb-1"
        :style="{
          backgroundColor: (product.categoria?.color || '#6366f1') + '22',
          color: product.categoria?.color || '#6366f1'
        }"
      >
        {{ product.categoria.icono ? product.categoria.icono + ' ' : '' }}{{ product.categoria.nombre }}
      </span>

      <!-- Nombre -->
      <h3 class="font-semibold text-gray-800 text-sm leading-tight">{{ product.nombre }}</h3>

      <!-- Descripción -->
      <p class="text-xs text-gray-400 mt-0.5 line-clamp-2 flex-1">
        {{ product.descripcion || 'Sin descripción' }}
      </p>

      <!-- Precio + Botón -->
      <div class="flex items-center justify-between mt-3">
        <span class="font-bold text-indigo-600">
          {{ product.precio_formateado ?? '$' + Number(product.precio || 0).toFixed(2) }}
        </span>

        <button
          @click="agregar"
          :disabled="!hasStock"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition"
          :class="hasStock
            ? 'bg-indigo-600 hover:bg-indigo-700'
            : 'bg-gray-300 cursor-not-allowed'"
        >
          {{ hasStock ? '+ Agregar' : 'Sin stock' }}
        </button>
      </div>

      <!-- Estado stock bajo -->
      <p
        v-if="hasStock && product.bajo_stock"
        class="text-[10px] text-amber-500 mt-1"
      >
        ⚠️ Últimas {{ product.stock }} unidades
      </p>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'

const props = defineProps({
  product: { type: Object, required: true },
})

const emit = defineEmits(['agregar'])

const hasStock = computed(() => Number(props.product?.stock ?? 0) > 0)

// Resolver URL de imagen completa
const imagenUrl = computed(() => {
  const path = props.product.imagen_url || props.product.imagen
  if (!path) return null
  if (path.startsWith('http') || path.startsWith('data:')) return path
  if (path.startsWith('/storage/')) {
    return `${API_BASE}${path}`
  }
  return `${API_BASE}/storage/${path}`
})

const agregar = () => {
  if (!hasStock.value) return
  emit('agregar', {
    id:       props.product.id,
    nombre:   props.product.nombre,
    precio:   Number(props.product.precio),
    imagen:   imagenUrl.value,
    cantidad: 1,
  })
}
</script>