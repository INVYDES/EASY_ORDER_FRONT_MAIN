<template>
  <div v-if="productos.length === 0" class="text-center py-6">
    <p class="text-gray-400 italic text-sm">No hay productos en esta categoría</p>
  </div>

  <div
    v-else
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
  >
    <productocard
      v-for="product in productos"
      :key="product.id"
      :product="product"
      @agregar="$emit('agregar', $event)"
    />
  </div>
</template>

<script setup>
import productocard from './productocard.vue'

defineProps({
  productos: { type: Array, default: () => [] },
})

defineEmits(['agregar'])
</script>