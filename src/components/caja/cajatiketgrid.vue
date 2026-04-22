<template>
  <div>
    <!-- Sub-tabs para órdenes abiertas -->
    <div v-if="type === 'open'" class="flex gap-2 mb-4 flex-wrap">
      <button 
        v-for="sub in subTabs" 
        :key="sub.key"
        @click="subTab = sub.key"
        :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border',
          subTab === sub.key
            ? 'text-white border-transparent'
            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300']"
        :style="subTab === sub.key ? { backgroundColor: sub.color } : {}"
      >
        {{ sub.icon }} {{ sub.label }}
        <span 
          class="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
          :class="subTab === sub.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'"
        >
          {{ contarPorEstado(sub.key) }}
        </span>
      </button>
    </div>

    <!-- Grid de tickets -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <CajaTicketCard
        v-for="ticket in ordenesMostradas"
        :key="ticket.id"
        :ticket="ticket"
        @updated="handleUpdated"
      />

      <div v-if="ordenesMostradas.length === 0" class="col-span-full text-center py-12">
        <span class="text-4xl block mb-3">
          {{ type === 'open' ? '🎉' : '📋' }}
        </span>
        <p class="text-sm text-gray-400 italic">
          {{ type === 'open' ? 'No hay órdenes pendientes de cobro' : 'No hay tickets cerrados hoy' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
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

// Estado
const subTab = ref('LISTA')

// Configuración de sub-tabs
const subTabs = [
  { key: 'LISTA',          label: 'Listas p/ cobrar', icon: '✅', color: '#10b981' },
  { key: 'EN_PREPARACION', label: 'En cocina',         icon: '🔥', color: '#f97316' },
  { key: 'ABIERTA',        label: 'Abiertas',          icon: '🟡', color: '#f59e0b' },
]

// Contar órdenes por estado
const contarPorEstado = (estado) => {
  return props.orders.filter(o => o.estado === estado).length
}

// Órdenes a mostrar según tipo y filtro
const ordenesMostradas = computed(() => {
  if (props.type === 'closed') {
    // Para cerradas: mostrar todas ordenadas por más reciente
    return [...props.orders].sort((a, b) => b.id - a.id)
  }
  
  // Para abiertas: solo las del sub-tab activo
  return props.orders
    .filter(o => o.estado === subTab.value)
    .sort((a, b) => b.id - a.id)
})

// Manejar actualización de pago
const handleUpdated = (paymentData) => {
  // Emitir evento con los datos del pago
  emit('order-paid', paymentData)
  // Emitir refresh para recargar la lista
  emit('refresh')
}
</script>

<style scoped>
/* Transiciones suaves */
button {
  transition: all 0.2s ease;
}
</style>