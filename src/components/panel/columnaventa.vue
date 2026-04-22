<template>
  <div class="bg-white rounded-xl shadow-sm border p-4 flex flex-col h-full">

    <!-- Header fijo con contador -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold" :class="headerColor">
        {{ title }}
      </h2>
      <span class="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
        {{ orders.length }}
      </span>
    </div>

    <!-- Lista de tarjetas -->
    <div class="space-y-3 overflow-y-auto pr-2 flex-1">

      <Ventacard
        v-for="order in orders"
        :key="order.id"
        :order="order"
      />

      <p v-if="orders.length === 0" class="text-sm text-gray-400 text-center py-4">
        Sin {{ title.toLowerCase() }}
      </p>

    </div>

  </div>
</template>

<script setup lang="ts">
import Ventacard from './ventacard.vue'

// Definir el tipo de Order
interface Order {
  id: number
  nombre?: string
  producto?: string
  total?: number
  precio?: number
  fecha?: string
  created_at?: string
  cantidad?: number
}

const props = defineProps<{
  title: string
  color: string
  orders: Order[]  // ✅ Tipado correcto
}>()

const headerColor = 
  props.color === 'yellow' ? 'text-yellow-600'
  : props.color === 'blue' ? 'text-blue-600'
  : 'text-green-600'
</script>