<template>
  <div>
    <!-- Título de sección para Abiertos -->
    <div v-if="type === 'open'" class="mb-6">
      <div class="flex items-center gap-3">
        <span class="p-2 bg-purple-100 text-purple-600 rounded-xl text-xl">🏁</span>
        <div>
          <h3 class="text-lg font-bold text-gray-800 leading-tight">Órdenes para cobrar</h3>
          <p class="text-xs text-gray-400">Tickets de mesas que ya han sido servidas</p>
        </div>
        <span class="ml-auto px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-black shadow-sm">
          {{ ordenesMostradas.length }} pendientes
        </span>
      </div>
    </div>

    <!-- Grid de tickets -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <CajaTicketCard
        v-for="ticket in ordenesMostradas"
        :key="ticket.id"
        :ticket="ticket"
        @updated="handleUpdated"
      />

      <!-- Empty state -->
      <div v-if="ordenesMostradas.length === 0" class="col-span-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <span class="text-5xl block mb-4">
          {{ type === 'open' ? '✨' : '📋' }}
        </span>
        <p class="text-gray-500 font-medium italic">
          {{ type === 'open' ? '¡Excelente! No hay cuentas pendientes por cobrar' : 'No hay tickets cerrados hoy' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CajaTicketCard from './cajatiketcard.vue'

const props = defineProps({
  type: { 
    type: String, 
    required: true, 
    validator: (v) => ['open', 'closed'].includes(v) 
  },
  orders: { type: Array, default: () => [] },
})

const emit = defineEmits(['refresh', 'order-paid'])

// Órdenes a mostrar según tipo
const ordenesMostradas = computed(() => {
  if (props.type === 'closed') {
    // Para cerradas: mostrar todas ordenadas por más reciente
    return [...props.orders].sort((a, b) => b.id - a.id)
  }
  
  // Para abiertas: SOLO las que están en estado ENTREGADA (listas para cobrar)
  return props.orders
    .filter(o => o.estado === 'ENTREGADA')
    .sort((a, b) => b.id - a.id)
})

// Manejar actualización de pago
const handleUpdated = (paymentData) => {
  emit('order-paid', paymentData)
  emit('refresh')
}
</script>

<style scoped>
/* Estilos opcionales */
</style>