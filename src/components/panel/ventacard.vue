<template>
  <div class="border rounded-lg p-3 bg-gray-50 hover:shadow-sm transition">
    <div class="flex justify-between items-start mb-2">
      <div>
        <h3 class="font-medium text-gray-800">{{ order.producto || order.nombre }}</h3>
        <p class="text-xs text-gray-500">{{ order.fecha || order.created_at }}</p>
      </div>
      <span class="text-sm font-semibold text-green-600">
        ${{ formatMoney(order.total || order.precio) }}
      </span>
    </div>
    <p class="text-xs text-gray-600">Cantidad: {{ order.cantidad || 1 }}</p>
  </div>
</template>

<script setup lang="ts">
// Definir el MISMO tipo
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
  order: Order  // ✅ Tipado correcto
}>()

const formatMoney = (value: number | undefined) => {
  return Number(value || 0).toFixed(2)
}
</script>