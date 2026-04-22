<template>
  <div class="bg-white rounded-2xl shadow-sm p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-gray-800">Propinas del día</h3>
      <span class="text-xs bg-amber-100 text-amber-700 font-semibold px-2.5 py-1 rounded-full">
        ${{ Number(total || 0).toFixed(2) }}
      </span>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div v-for="item in tips" :key="item.metodo"
        class="flex items-center justify-between bg-amber-50 rounded-xl px-4 py-3">
        <div>
          <p class="text-xs text-amber-600 font-semibold uppercase tracking-wide">{{ item.metodo }}</p>
          <p class="text-lg font-bold text-amber-700">${{ Number(item.total).toFixed(2) }}</p>
        </div>
        <span class="text-2xl">{{ item.icon }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tips:  { type: Array,  default: () => [] },
  total: { type: Number, default: 0 },
})
</script>