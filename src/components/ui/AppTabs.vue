<template>
  <div class="flex flex-wrap items-center gap-2 bg-gray-100 rounded-2xl p-1.5 w-fit">
    <button
      v-for="t in tabs" :key="t.key"
      @click="$emit('update:active', t.key)"
      :class="[
        'px-6 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2',
        active === t.key
          ? 'bg-white shadow-md text-indigo-600 scale-105'
          : 'text-gray-500 hover:bg-gray-200'
      ]"
    >
      <i v-if="t.icon" :class="t.icon"></i>
      {{ t.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tabs: { key: string; label: string; icon?: string }[]
  active: string
}>()

defineEmits<{
  'update:active': [key: string]
}>()
</script>
