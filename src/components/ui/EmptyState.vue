<template>
  <div class="flex flex-col items-center justify-center py-16 text-gray-400">
    <span class="text-5xl mb-4">{{ icon }}</span>
    <p class="text-lg font-semibold text-gray-500">{{ title }}</p>
    <p v-if="description" class="text-sm mt-1">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string
  title: string
  description?: string
}>()
</script>
