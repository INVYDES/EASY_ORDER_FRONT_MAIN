<template>
  <div class="bg-white rounded-xl shadow-sm border p-4 flex flex-col h-full">

    <!-- Header fijo -->
    <h2 class="text-lg font-semibold mb-4" :class="headerColor">
      {{ title }} ({{ orders.length }})
    </h2>

    <!-- Lista de tarjetas -->
    <div class="space-y-3 overflow-y-auto pr-2 flex-1">
      <barraCard
        v-for="order in orders"
        :key="order.id"
        :order="order"
        @update-status="$emit('update-status', $event)"
      />

      <p v-if="orders.length === 0" class="text-sm text-gray-400 text-center py-4">
        Sin órdenes {{ title.toLowerCase() }}
      </p>
    </div>

  </div>
</template>

<script setup>
import barraCard from './bebidacard.vue'

const props = defineProps({
  title: String,
  color: String,
  orders: Array
})

defineEmits(['update-status'])

const headerColor = 
  props.color === 'yellow' ? 'text-yellow-600'
  : props.color === 'blue' ? 'text-blue-600'
  : 'text-green-600'
</script>