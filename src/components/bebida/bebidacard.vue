<template>
  <div class="border rounded-lg p-3 bg-gray-50">

    <!-- Header -->
    <div class="flex justify-between mb-2">
      <span class="text-sm font-semibold">
        Mesa {{ order.table }}
      </span>
      <span class="text-xs text-gray-400">
        {{ formatTime(order.timestamp) }}
      </span>
    </div>

    <!-- Items (🔥 SOLO BEBIDAS) -->
    <div class="space-y-1 mb-3">
      <div
        v-for="item in drinkItems"
        :key="item.id"
        class="text-sm"
      >
        {{ item.quantity }} × {{ item.name }}

        <span v-if="item.note"
              class="text-xs text-gray-500 block">
          {{ item.note }}
        </span>
      </div>

      <p v-if="drinkItems.length === 0"
         class="text-xs text-gray-400">
        Sin productos de barra
      </p>
    </div>

    <!-- Botones -->
    <div class="flex gap-2">
      <button
        v-if="order.estado === 'ABIERTA' && drinkItems.length"
        @click="$emit('update-status', { orderId: order.id, newStatus: 'EN_PREPARACION' })"
        class="flex-1 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Preparar
      </button>

      <button
        v-if="order.estado === 'EN_PREPARACION' && drinkItems.length"
        @click="$emit('update-status', { orderId: order.id, newStatus: 'LISTA' })"
        class="flex-1 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
      >
        Lista
      </button>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  order: Object
})

defineEmits(['update-status'])

// 🔥 FILTRO CORRECTO: solo bebidas (categoría 'bebida')
const drinkItems = computed(() =>
  props.order.items.filter((item) => item.category === 'bebida')
)

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>